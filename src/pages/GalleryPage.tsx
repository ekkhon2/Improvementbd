import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '@/src/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useDBCache } from '@/src/context/DBCacheContext';
import { ChevronLeft, Image as ImageIcon, PlayCircle } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { formatImageUrl } from '@/src/lib/utils';

interface GalleryPost {
  id: string;
  title: string;
  image?: string;
  images?: string[];
  platform: string;
  type: 'image' | 'video';
  videoUrl?: string;
  content?: string;
  description?: string;
}

export default function GalleryPage() {
  const { language, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const platformFilter = searchParams.get('platform');
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
      setLoading(true);
      try {
        let q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
        
        if (platformFilter) {
          q = query(
            collection(db, 'gallery'),
            where('platform', '==', platformFilter),
            orderBy('createdAt', 'desc')
          );
        }

        const data = await getCachedCollection<GalleryPost>('gallery', q, 10 * 60 * 1000);
        setPosts(data);
      } catch (error) {
        console.warn('Failed to load gallery cache:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, [platformFilter]);

  const getYoutubeEmbedUrl = (url?: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : '';
  };

  const platforms = [
    { id: 'foundation', name: 'Foundation' },
    { id: 'blood-bank', name: 'Blood Bank' },
    { id: 'food-bank', name: 'Food Bank' },
    { id: 'sporting-club', name: 'Sporting Club' },
    { id: 'it-education', name: 'IT Education' },
    { id: 'academic-care', name: 'Academic Care' },
    { id: 'library', name: 'Library' },
    { id: 'rehabilitation', name: 'Rehabilitation' },
    { id: 'kidscare', name: 'Kids Care' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Detail Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-0 border-none">
          {selectedPost && (
            <div className="flex flex-col">
              <div className="aspect-video w-full bg-slate-900 overflow-hidden">
                {selectedPost.type === 'video' ? (
                  <iframe
                    src={getYoutubeEmbedUrl(selectedPost.videoUrl)}
                    title={selectedPost.title}
                    className="w-full h-full"
                    allowFullScreen
                  />
                ) : (
                  <div className="grid grid-cols-2 h-full gap-1">
                    {getDialogImages(selectedPost).map((img, idx, arr) => (
                      <div key={idx} className={`${arr.length === 1 ? 'col-span-2' : ''} relative overflow-hidden`}>
                        <img 
                          src={img} 
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
                <h2 className="text-3xl font-black text-primary mb-6">{selectedPost.title}</h2>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line font-medium text-lg">
                    {selectedPost.content || selectedPost.description || 'No detailed content available.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Header */}
      <section className="bg-slate-900 text-white py-16 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <Link to="/" className="inline-flex items-center text-white/60 hover:text-white mb-6 transition-colors">
            <ChevronLeft className="h-5 w-5 mr-1" /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-6xl font-black mb-4">
            {platformFilter ? `${platforms.find(p => p.id === platformFilter)?.name} Gallery` : 'Our Gallery & Updates'}
          </h1>
          <p className="text-xl text-white/60 font-medium max-w-2xl">
            Explore our latest activities, events, and success stories across all our platforms.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            <Link to="/gallery">
              <Button 
                variant={!platformFilter ? "default" : "ghost"}
                className="rounded-full px-6 font-bold"
              >
                All
              </Button>
            </Link>
            {platforms.map(p => (
              <Link key={p.id} to={`/gallery?platform=${p.id}`}>
                <Button 
                  variant={platformFilter === p.id ? "default" : "ghost"}
                  className="rounded-full px-6 font-bold"
                >
                  {p.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden group border-none shadow-md hover:shadow-2xl transition-all rounded-[2rem] bg-white h-full flex flex-col">
                    <div className="aspect-[4/3] overflow-hidden relative cursor-pointer" onClick={() => setSelectedPost(post)}>
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
                          <PlayCircle className="h-16 w-16 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 text-primary border-none font-bold backdrop-blur-sm">
                          {post.type === 'video' ? 'Video' : 'Image'}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="p-6 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-secondary">
                          {post.platform}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl font-bold text-primary group-hover:text-accent transition-colors line-clamp-2">
                        {post.title}
                      </CardTitle>
                      {post.description && (
                        <p className="text-sm text-slate-500 mt-2 line-clamp-3 font-medium">
                          {post.description}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start p-0 h-auto font-bold text-accent hover:text-accent/80 hover:bg-transparent"
                        onClick={() => setSelectedPost(post)}
                      >
                        {post.type === 'video' ? 'Watch Video' : 'View Details'} →
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-40">
              <ImageIcon className="h-20 w-20 text-slate-200 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-primary">No items found</h3>
              <p className="text-slate-500 font-medium">We haven't uploaded any content for this category yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
