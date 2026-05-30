import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/src/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Library as LibraryIcon, Search, BookOpen, UserPlus, Clock, ArrowRight, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import MemberForm from '@/src/components/MemberForm';
import GallerySection from '@/src/components/GallerySection';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  image: string;
  code: string;
  status: 'available' | 'borrowed';
  dueDate?: string;
}

import { useSEO } from '@/src/hooks/useSEO';

export default function Library() {
  const { language, t } = useLanguage();
  useSEO({
    title: language === 'bn' ? 'লাইব্রেরি - ইমপ্রুভমেন্ট বিডি' : 'Library - Improvement BD',
    description: language === 'bn' 
      ? 'ইমপ্রুভমেন্ট লাইব্রেরি - আমাদের বিশাল বই ক্যাটালগ থেকে বই খুঁজুন এবং পছন্দমতো পড়ুন।' 
      : 'Improvement Library - Find books from our vast catalog and read as you like.'
  });
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'books'), orderBy('title'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Book[];
      setBooks(bookList);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'books');
    });
    return () => unsubscribe();
  }, []);

  const categories = Array.from(new Set(books.map(b => b.category))).filter(Boolean);
  const authors = Array.from(new Set(books.map(b => b.author))).filter(Boolean);

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(search.toLowerCase()) || 
                         book.author.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'all' || book.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-slate-900 text-white py-12 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex mb-6 md:mb-8">
            <img 
              src="https://i.ibb.co.com/v6jNcH6c/Improvement-Library.jpg" 
              alt="Improvement Library Logo" 
              className="h-16 w-16 md:h-24 md:w-24 rounded-2xl md:rounded-3xl object-cover border-2 border-accent/30 shadow-2xl shadow-accent/20"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-3xl md:text-6xl font-extrabold mb-4 md:mb-6 tracking-tight text-white">Improvement Library</h1>
          <p className="text-lg md:text-xl opacity-80 max-w-2xl mx-auto leading-relaxed px-4">
            {language === 'bn'
              ? 'জ্ঞানের আলো ছড়িয়ে দিতে আমাদের সংগ্রহে রয়েছে শত শত বই। আজই সদস্য হোন এবং আপনার প্রিয় বইটি সংগ্রহ করুন।'
              : 'Unlocking Knowledge, Inspiring Minds. Explore our vast collection and embark on a journey of discovery.'}
          </p>
          <div className="mt-8 md:mt-12 flex flex-wrap justify-center gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-8 h-12 md:h-14 shadow-lg shadow-accent/20 font-bold rounded-xl">
                  <UserPlus className="h-5 w-5 mr-2" /> {t('library.newMember')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-none bg-white rounded-3xl">
                <MemberForm platform="library" platformName="Improvement Library" />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile Filter Trigger */}
            <div className="lg:hidden sticky top-20 z-30 flex gap-2 mb-6 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search books..." 
                  className="pl-10 h-12 bg-slate-50 border-none rounded-xl"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="h-12 w-12 p-0 rounded-xl bg-slate-50 border-none">
                    <Filter className="h-5 w-5 text-primary" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px]">
                  <SheetHeader className="mb-6">
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-8">
                    <div>
                      <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" /> Categories
                      </h3>
                      <div className="space-y-1">
                        <button 
                          onClick={() => setFilterCategory('all')}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            filterCategory === 'all' ? "bg-accent text-white" : "text-slate-600 hover:bg-slate-50"
                          )}
                        >
                          All Categories
                        </button>
                        {categories.map(cat => (
                          <button 
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={cn(
                              "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                              filterCategory === cat ? "bg-accent text-white" : "text-slate-600 hover:bg-slate-50"
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-primary mb-4">Authors</h3>
                      <div className="flex flex-wrap gap-2">
                        {authors.slice(0, 15).map(author => (
                          <Badge 
                            key={author} 
                            variant="outline" 
                            className="cursor-pointer hover:bg-slate-50 border-slate-200 text-slate-600"
                            onClick={() => setSearch(author)}
                          >
                            {author}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0 space-y-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                  <Search className="h-4 w-4" /> Search
                </h3>
                <Input 
                  placeholder="Search books..." 
                  className="h-10 border-slate-200"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Categories
                </h3>
                <div className="space-y-1">
                  <button 
                    onClick={() => setFilterCategory('all')}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      filterCategory === 'all' ? "bg-accent text-white" : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    All Categories
                  </button>
                  {categories.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        filterCategory === cat ? "bg-accent text-white" : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hidden lg:block">
                <h3 className="font-bold text-primary mb-4">Authors</h3>
                <div className="flex flex-wrap gap-2">
                  {authors.slice(0, 10).map(author => (
                    <Badge 
                      key={author} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-slate-50 border-slate-200 text-slate-600"
                      onClick={() => setSearch(author)}
                    >
                      {author}
                    </Badge>
                  ))}
                </div>
              </div>
            </aside>

            {/* Book Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredBooks.map(book => (
                  <Card key={book.id} className="overflow-hidden flex flex-col border-none shadow-sm hover:shadow-xl transition-all group rounded-2xl">
                    <div className="aspect-[3/4] overflow-hidden bg-slate-100 relative">
                      <img 
                        src={book.image || 'https://picsum.photos/seed/book/400/600'} 
                        alt={book.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className={cn(
                          "font-bold border-none px-3 py-1",
                          book.status === 'available' ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                        )}>
                          {book.status === 'available' ? 'Available' : 'Borrowed'}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="p-6">
                      <CardTitle className="text-xl font-bold text-primary line-clamp-1 group-hover:text-accent transition-colors">{book.title}</CardTitle>
                      <p className="text-sm font-medium text-slate-500">{book.author}</p>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 mt-auto">
                      <Link to={`/book/${book.id}`}>
                        <Button className="w-full h-12 font-bold rounded-xl group/btn" variant="outline">
                          View Details <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
                {filteredBooks.length === 0 && (
                  <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <BookOpen className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-primary">No books found</h3>
                    <p className="text-slate-500">Try adjusting your search or filters.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <GallerySection platform="library" />
    </div>
  );
}
