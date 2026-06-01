import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/src/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';

import { Badge } from '@/components/ui/badge';

interface GalleryPost {
  id: string;
  title: string;
  image: string;
  platform: string;
  isFeatured: boolean;
}

export default function GallerySection({ platform }: { platform?: string }) {
  const { language, t } = useLanguage();
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let q = query(
      collection(db, 'gallery'),
      orderBy('createdAt', 'desc'),
      limit(6)
    );

    if (platform) {
      q = query(
        collection(db, 'gallery'),
        where('platform', '==', platform),
        orderBy('createdAt', 'desc'),
        limit(6)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GalleryPost[];
      setPosts(list);
      setLoading(false);
    }, (error) => {
      // In case orderby index is not set or other issues, try query without orderBy as safe fallback
      const fallbackQuery = platform ? query(collection(db, 'gallery'), where('platform', '==', platform), limit(6)) : query(collection(db, 'gallery'), limit(6));
      onSnapshot(fallbackQuery, (fallSnap) => {
        const fallbackList = fallSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as GalleryPost[];
        setPosts(fallbackList);
        setLoading(false);
      }, () => {
        setLoading(false);
      });
    });

    return () => unsubscribe();
  }, [platform]);

  if (loading) return null;

  const fallbackPosts: Record<string, GalleryPost[]> = {
    foundation: [
      {
        id: 'fb-1',
        title: language === 'bn' ? 'অসহায় ও সুবিধাবঞ্চিত মানুষের মাঝে শীতবস্ত্র ও কম্বল বিতরণ উৎসব ২০২৩' : 'Winter Blanket & Clothing Distribution Festival 2023',
        image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600',
        platform: 'foundation',
        isFeatured: true
      },
      {
        id: 'fb-2',
        title: language === 'bn' ? 'পথশিশু ও দুস্থদের মাঝে পুষ্টিকর খাবার এবং ইফতারি বক্স বিতরণ' : 'Iftar & Food Package Distribution Ceremony',
        image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=600',
        platform: 'foundation',
        isFeatured: true
      },
      {
        id: 'fb-3',
        title: language === 'bn' ? 'স্বাবলম্বীকরণ প্রজেক্ট: দরিদ্র পরিবারের মাঝে সেলাই মেশিন বিতরণ' : 'Sustainment Project: Sewing Machine Distribution for Poor Families',
        image: 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?q=80&w=600',
        platform: 'foundation',
        isFeatured: true
      }
    ],
    'sporting-club': [
      {
        id: 'fb-sport-1',
        title: language === 'bn' ? 'বার্ষিক টুর্নামেন্ট ও ফুটবল একাডেমি ট্রফি বিতরণী অনুষ্ঠান' : 'Annual Youth Tournament & Football Championship Trophy Distribution',
        image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600',
        platform: 'sporting-club',
        isFeatured: true
      },
      {
        id: 'fb-sport-2',
        title: language === 'bn' ? 'ক্রিকেট একাডেমি প্র্যাকটিস ক্যাম্প ও অফিসিয়াল জার্সি উন্মোচন' : 'Cricket Practice Camp and Official Jersey Unveiling',
        image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=600',
        platform: 'sporting-club',
        isFeatured: true
      }
    ]
  };

  const getDisplayPosts = (): GalleryPost[] => {
    if (posts && posts.length > 0) return posts;
    const platformKey = platform || 'general';
    return fallbackPosts[platformKey] || [
      {
        id: 'fb-gen-1',
        title: language === 'bn' ? 'মানবতার কল্যাণে ইমপ্রুভমেন্ট বিডি এর ব্যতিক্রমী উদ্যোগ' : 'Sustained Humanitarian Initiatives by Improvement BD',
        image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600',
        platform: platform || 'general',
        isFeatured: true
      },
      {
        id: 'fb-gen-2',
        title: language === 'bn' ? 'নলকূপ ও বিশুদ্ধ পানির ফিল্টার স্থাপন কার্যক্রম' : 'Installing Fresh Water Wells & Sanitation Filters in Remote Areas',
        image: 'https://images.unsplash.com/photo-1527853787696-f7be74f2e39a?q=80&w=600',
        platform: platform || 'general',
        isFeatured: true
      },
      {
        id: 'fb-gen-3',
        title: language === 'bn' ? 'বিনামূল্যে চিকিৎসা ক্যাম্প ও প্রয়োজনীয় মেডিসিন সাপোর্ট' : 'Free Health Diagnostics & Medical Care Support Camps',
        image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600',
        platform: platform || 'general',
        isFeatured: true
      }
    ];
  };

  const displayPosts = getDisplayPosts();

  return (
    <section className="py-20 bg-slate-50/50">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="overflow-hidden group cursor-pointer border-none shadow-md hover:shadow-2xl transition-all rounded-[2rem] bg-white">
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img 
                    src={post.image || (post as any).images?.[0]} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${post.id}/800/600`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <CardHeader className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-secondary">
                      {post.platform}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-primary group-hover:text-accent transition-colors line-clamp-1">
                    {post.title}
                  </CardTitle>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
