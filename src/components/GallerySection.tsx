import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/src/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { db } from '@/src/lib/firebase';
import { collection, query } from 'firebase/firestore';
import { useDBCache } from '@/src/context/DBCacheContext';
import { formatImageUrl } from '@/src/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PlayCircle } from 'lucide-react';

interface GalleryPost {
  id: string;
  title: string;
  image: string;
  images?: string[];
  platform: string;
  isFeatured: boolean;
  type?: 'image' | 'video';
  videoUrl?: string;
  content?: string;
  description?: string;
}

export default function GallerySection({ platform }: { platform?: string }) {
  const { language, t } = useLanguage();
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<GalleryPost | null>(null);

  const getPostImage = (post: GalleryPost) => {
    const foundImg = (post.images && post.images.length > 0) ? post.images.find(img => img && img.trim() !== '') : post.image;
    return formatImageUrl(foundImg) || `https://picsum.photos/seed/${post.id}/800/600`;
  };

  const getDialogImages = (post: GalleryPost) => {
    const list = post.images && post.images.length > 0 ? post.images : [post.image];
    const filtered = list.map(img => formatImageUrl(img)).filter(Boolean);
    return filtered.length > 0 ? filtered : [`https://picsum.photos/seed/${post.id}/800/600`];
  };

  const { getCachedCollection } = useDBCache();

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const q = query(collection(db, 'gallery'));
        const list = await getCachedCollection<any>('gallery', q, 10 * 60 * 1000);

        const parsed = list.map(item => ({
          id: item.id,
          title: item.title || '',
          image: item.image || '',
          images: item.images || [],
          platform: item.platform || 'general',
          isFeatured: item.isFeatured !== false, // default true
          type: item.type || 'image',
          videoUrl: item.videoUrl || '',
          content: item.content || item.description || '',
          description: item.description || '',
          createdAt: item.createdAt
        }));

        // Filter by platform on client side safely
        let filtered = parsed;
        if (platform) {
          filtered = parsed.filter(post => post.platform === platform);
        }

        // Sort by createdAt desc safely
        filtered.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });

        // Limit to top 6
        setPosts(filtered.slice(0, 6));
      } catch (error) {
        console.error("GallerySection Firestore query error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, [platform]);

  const getYoutubeEmbedUrl = (url?: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : '';
  };

  if (loading) return null;

  const displayPosts = posts;

  return (
    <section className="py-20 bg-slate-50/50">
      {/* Detail Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-0 border-none bg-white">
          {selectedPost && (
            <div className="flex flex-col">
              <div className="aspect-video w-full bg-slate-900 overflow-hidden relative">
                {selectedPost.type === 'video' ? (
                  <iframe
                    src={getYoutubeEmbedUrl(selectedPost.videoUrl)}
                    title={selectedPost.title}
                    className="w-full h-full border-none"
                    allowFullScreen
                  />
                ) : (
                  <div className="grid grid-cols-2 h-full gap-1 bg-slate-950">
                    {getDialogImages(selectedPost).map((img, idx, arr) => (
                      <div key={idx} className={`${arr.length === 1 ? 'col-span-2' : ''} relative overflow-hidden h-full flex items-center justify-center`}>
                        <img 
                          src={img} 
                          alt={selectedPost.title}
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${selectedPost.id}-${idx}/800/600`;
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary" className="bg-slate-100 text-secondary font-bold uppercase tracking-widest text-[10px]">
                    {selectedPost.platform}
                  </Badge>
                  <Badge className="bg-primary/10 text-primary border-none font-bold">
                    {selectedPost.type === 'video' ? 'Video' : 'Gallery'}
                  </Badge>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-primary mb-6">{selectedPost.title}</h2>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line font-medium text-base md:text-lg">
                    {selectedPost.content || selectedPost.description || (language === 'bn' ? 'কোনো বিস্তারিত বিবরণ নেই।' : 'No detailed content available.')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-primary mb-3">
              {language === 'bn' ? 'গ্যালারি ও ব্লগ' : 'Gallery & Blog'}
            </h2>
            <p className="text-secondary font-medium max-w-xl">
              {language === 'bn' ? 'আমাদের সাম্প্রতিক কার্যক্রমের কিছু মুহূর্ত' : 'Some moments of our recent activities and updates.'}
            </p>
          </div>
          <Link to={`/gallery${platform ? `?platform=${platform}` : ''}`}>
            <Button variant="outline" className="border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all rounded-xl h-12 px-6">
              {language === 'bn' ? 'সবগুলো দেখুন' : 'View All'}
            </Button>
          </Link>
        </div>

        {displayPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card 
                  className="overflow-hidden group cursor-pointer border-none shadow-md hover:shadow-2xl transition-all rounded-[2rem] bg-white h-full flex flex-col justify-between"
                  onClick={() => setSelectedPost(post)}
                >
                  <div>
                    <div className="aspect-[16/10] overflow-hidden relative">
                      <img 
                        src={getPostImage(post)} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${post.id}/800/600`;
                        }}
                      />
                      {post.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                          <PlayCircle className="h-12 w-12 text-white/90 drop-shadow-md" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    <CardHeader className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-secondary">
                          {post.platform}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl font-bold text-primary group-hover:text-accent transition-colors line-clamp-2">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                  </div>
                  <CardContent className="px-6 pb-6 pt-0">
                    <Button 
                      variant="outline" 
                      className="w-full justify-center p-3 h-10 border border-slate-200 hover:border-accent hover:bg-accent/5 font-bold text-accent rounded-xl text-xs transition-all tracking-wide"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPost(post);
                      }}
                    >
                      {language === 'bn' ? 'বিস্তারিত দেখুন' : 'View Details'} →
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8">
            <p className="text-base font-bold text-slate-400">
              {language === 'bn' ? 'কোনো গ্যালারি পোস্ট পাওয়া যায়নি।' : 'No gallery moments shared yet.'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
