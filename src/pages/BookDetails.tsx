import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/src/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, BookOpen, User, Hash, Bookmark, Share2, Info, MessageSquare, ArrowRight } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { motion } from 'motion/react';

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  code: string;
  image: string;
  status: 'available' | 'borrowed' | 'maintenance';
  description?: string;
}

export default function BookDetails() {
  const { id } = useParams();
  const { language } = useLanguage();
  const [book, setBook] = useState<Book | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchBook = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'books', id));
        if (docSnap.exists()) {
          const bookData = { id: docSnap.id, ...docSnap.data() } as Book;
          setBook(bookData);
          
          // Fetch related books
          const q = query(
            collection(db, 'books'), 
            where('category', '==', bookData.category),
            limit(5)
          );
          const relatedSnap = await getDocs(q);
          setRelatedBooks(relatedSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Book))
            .filter(b => b.id !== id)
          );
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `books/${id}`);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
          <p className="text-slate-400 font-bold animate-pulse">Opening Book...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
        <div className="text-center space-y-6">
          <div className="inline-flex p-6 bg-red-50 rounded-full">
            <Info className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-900">Book not found</h2>
          <Link to="/library">
            <Button className="bg-accent hover:bg-accent/90 rounded-xl h-12 px-8 font-bold">Back to Library</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleBorrowRequest = () => {
    const msg = encodeURIComponent(`Hello! I'd like to borrow the book "${book.title}" (Code: ${book.code}). Is it available?`);
    window.open(`https://wa.me/8801640679394?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <div className="border-b sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/library" className="flex items-center text-slate-500 hover:text-slate-900 font-bold transition-colors group">
            <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-slate-100 mr-2 transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </div>
            {language === 'bn' ? 'লাইব্রেরিতে ফিরুন' : 'Back to Library'}
          </Link>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Book Cover */}
          <div className="lg:col-span-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-32"
            >
              <div className="aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200 bg-white border-8 border-white">
                <img 
                  src={book.image || `https://picsum.photos/seed/${book.id}/600/800`} 
                  alt={book.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="mt-8 flex flex-col gap-4">
                <Button 
                  onClick={handleBorrowRequest}
                  disabled={book.status !== 'available'}
                  className={`w-full h-16 text-xl font-black rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 ${
                    book.status === 'available' 
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {book.status === 'available' ? 'Borrow This Book' : 'Currently Unavailable'}
                </Button>
                <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Library Contact: 01640679394
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right: Book Details */}
          <div className="lg:col-span-8 space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Badge className="bg-accent/10 text-accent border-none px-4 py-1 text-xs font-black uppercase tracking-widest rounded-full">
                  {book.category}
                </Badge>
                <Badge className={`${book.status === 'available' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'} border-none px-4 py-1 text-xs font-black uppercase tracking-widest rounded-full`}>
                  {book.status}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight">
                {book.title}
              </h1>
              <div className="flex flex-wrap gap-8 items-center pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                    <User className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Author</p>
                    <p className="font-bold text-slate-900">{book.author}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                    <Hash className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Book Code</p>
                    <p className="font-bold text-slate-900">{book.code}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-accent" />
                {language === 'bn' ? 'বইয়ের সংক্ষিপ্ত বর্ণনা' : 'Book Overview'}
              </h2>
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100">
                <p className="text-slate-600 text-lg leading-relaxed font-medium whitespace-pre-wrap">
                  {book.description || 'No description available for this book yet. Please contact the library for more information about the content and topics covered in this book.'}
                </p>
              </div>
            </div>

            {/* Related Books */}
            {relatedBooks.length > 0 && (
              <div className="space-y-8 pt-12">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-slate-900">
                    {language === 'bn' ? 'এই ক্যাটাগরির আরও বই' : 'People Also Like'}
                  </h2>
                  <Link to="/library" className="text-accent font-black text-sm flex items-center gap-1 hover:underline">
                    View All <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {relatedBooks.map((relBook) => (
                    <Link key={relBook.id} to={`/book/${relBook.id}`} className="group space-y-4">
                      <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-all">
                        <img 
                          src={relBook.image || `https://picsum.photos/seed/${relBook.id}/300/400`} 
                          alt="" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 line-clamp-1 group-hover:text-accent transition-colors">{relBook.title}</h4>
                        <p className="text-xs font-bold text-slate-400">{relBook.author}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
