import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/src/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Search, Filter, ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  stock: number;
}

export default function Shop() {
  const { language, t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(list);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'products');
    });
    return () => unsubscribe();
  }, []);

  const categories = ['all', 'books', 'stationery', 't-shirt', 'other'];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                         p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBuy = (product: Product) => {
    const message = encodeURIComponent(`Hello Improvement BD! I want to buy ${product.name} (Price: ৳${product.price}). Is it available?`);
    window.open(`https://wa.me/8801819417935?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-slate-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex p-4 rounded-3xl bg-accent/20 text-accent mb-6 border border-accent/30">
            <ShoppingBag className="h-12 w-12" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            Improvement Shop
          </h1>
          <p className="text-xl text-white/60 font-medium max-w-2xl mx-auto">
            {language === 'bn' 
              ? 'আমাদের অফিসিয়াল পণ্য এবং শিক্ষাসামগ্রী ক্রয়ের মাধ্যমে আমাদের লক্ষ্য পূরণে সহায়তা করুন।' 
              : 'Support our mission by purchasing our official merchandise and educational materials.'}
          </p>
        </div>
      </section>

      {/* Shop Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 shrink-0 space-y-8">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
              <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4" /> {language === 'bn' ? 'ক্যাটাগরি' : 'Categories'}
              </h3>
              <div className="space-y-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-all capitalize ${
                      filterCategory === cat 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {cat === 'all' ? (language === 'bn' ? 'সবগুলো' : 'All') : cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-accent/10 p-6 rounded-[2rem] border border-accent/20">
              <h4 className="font-bold text-accent mb-2">{language === 'bn' ? 'পাইকারি অর্ডার?' : 'Bulk Orders?'}</h4>
              <p className="text-xs text-slate-600 font-medium mb-4">
                {language === 'bn' 
                  ? 'পাইকারি ক্রয় বা প্রাতিষ্ঠানিক পার্টনারশিপের জন্য সরাসরি আমাদের সাথে যোগাযোগ করুন।' 
                  : 'For bulk purchases or organization partnerships, please contact us directly.'}
              </p>
              <Button size="sm" className="w-full bg-accent text-white font-bold rounded-xl">
                {language === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}
              </Button>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1 space-y-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                  placeholder={language === 'bn' ? 'পণ্য খুঁজুন...' : 'Search products...'} 
                  className="pl-12 h-14 rounded-2xl border-slate-200 focus:ring-accent"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden group border-none shadow-md hover:shadow-2xl transition-all rounded-[2.5rem] bg-white h-full flex flex-col">
                      <div className="aspect-square overflow-hidden relative p-4">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${product.id}/600/600`;
                          }}
                        />
                        <div className="absolute top-6 right-6">
                          <Badge className="bg-accent text-white border-none font-bold px-3 py-1">
                            ৳{product.price}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="p-8 pt-0 flex-1">
                        <Badge variant="secondary" className="mb-3 text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-secondary">
                          {product.category}
                        </Badge>
                        <CardTitle className="text-2xl font-bold text-primary mb-2 group-hover:text-accent transition-colors">
                          {product.name}
                        </CardTitle>
                        <p className="text-sm text-slate-500 font-medium line-clamp-2">
                          {product.description}
                        </p>
                      </CardHeader>
                      <CardContent className="p-8 pt-0">
                        <Button 
                          className="w-full h-14 font-bold rounded-xl gap-2 shadow-lg shadow-primary/10"
                          onClick={() => handleBuy(product)}
                        >
                          <ShoppingCart className="h-5 w-5" /> {language === 'bn' ? 'এখনই কিনুন' : 'Buy Now'}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-40 bg-white rounded-[3rem] border border-dashed border-slate-200">
                <ShoppingBag className="h-20 w-20 text-slate-200 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-primary">
                  {language === 'bn' ? 'কোন পণ্য পাওয়া যায়নি' : 'No products found'}
                </h3>
                <p className="text-slate-500 font-medium">
                  {language === 'bn' ? 'অনুগ্রহ করে অন্য কিছু সার্চ করুন।' : 'Try adjusting your search or filters.'}
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
