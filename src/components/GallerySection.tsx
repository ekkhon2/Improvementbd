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
  const [loading, setLoading] = useState(true);

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
      handleFirestoreError(error, OperationType.GET, 'gallery');
    });

    return () => unsubscribe();
  }, [platform]);

  if (loading) return null;
  if (posts.length === 0) return null;

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
          {posts.map((post, index) => (
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
                    src={post.image} 
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
