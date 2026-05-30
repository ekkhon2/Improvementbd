import React, { useState, useEffect } from 'react';
import { db } from '@/src/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, increment, where, limit, getDocs } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, BookOpen, Search, Filter, Hash, User, Bookmark, HandHelping, History, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { useNavigate } from 'react-router-dom';

const PREDEFINED_CATEGORIES = [
  'Islamic', 'History', 'Academic', 'Science', 'Fiction', 
  'Biography', 'Poetry', 'Literature', 'Philosophy', 'Religion', 
  'Children', 'Travel', 'Health', 'Technology', 'Business'
];

export default function LibraryAdmin() {
  const navigate = useNavigate();
  const [books, setBooks] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<any>(null);
  const [lendingBook, setLendingBook] = useState<any>(null);
  const [isLendDialogOpen, setIsLendDialogOpen] = useState(false);
  const [returningBook, setReturningBook] = useState<any>(null);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    code: '',
    image: '',
    status: 'available',
    description: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'books'), orderBy('title', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'members'), where('platform', 'array-contains', 'library'), where('status', '==', 'approved'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'members');
    });
    return () => unsubscribe();
  }, []);

  const [lendFormData, setLendFormData] = useState({
    memberId: '',
    memberName: '',
    returnDate: '',
  });

  const [returnFormData, setReturnFormData] = useState({
    receivedBy: '',
    location: '',
  });

  const handleLend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lendingBook || !lendFormData.memberId) return;

    try {
      const member = members.find(m => m.id === lendFormData.memberId);
      await addDoc(collection(db, 'lending'), {
        bookId: lendingBook.id,
        bookTitle: lendingBook.title,
        memberId: lendFormData.memberId,
        memberName: member?.fullName || 'Unknown',
        lendDate: serverTimestamp(),
        dueDate: lendFormData.returnDate,
        status: 'borrowed',
        createdAt: serverTimestamp()
      });

      // Clear previous return info when lending again
      await updateDoc(doc(db, 'books', lendingBook.id), {
        status: 'borrowed',
        receivedBy: '',
        currentLocation: ''
      });

      setIsLendDialogOpen(false);
      setLendingBook(null);
      setLendFormData({ memberId: '', memberName: '', returnDate: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'lending');
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returningBook) return;

    try {
      // Find the active lending record
      const q = query(
        collection(db, 'lending'), 
        where('bookId', '==', returningBook.id), 
        where('status', '==', 'borrowed'),
        limit(1)
      );
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        const lendDoc = snap.docs[0];
        await updateDoc(doc(db, 'lending', lendDoc.id), {
          status: 'returned',
          returnDate: serverTimestamp(),
          receivedBy: returnFormData.receivedBy,
          location: returnFormData.location
        });
      }

      await updateDoc(doc(db, 'books', returningBook.id), {
        status: 'available',
        receivedBy: returnFormData.receivedBy,
        currentLocation: returnFormData.location
      });

      setIsReturnDialogOpen(false);
      setReturningBook(null);
      setReturnFormData({ receivedBy: '', location: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'lending');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBook) {
        await updateDoc(doc(db, 'books', editingBook.id), formData);
      } else {
        await addDoc(collection(db, 'books'), {
          ...formData,
          createdAt: serverTimestamp()
        });
        await updateDoc(doc(db, 'stats', 'totals'), {
          books: increment(1)
        });
      }
      setIsDialogOpen(false);
      setEditingBook(null);
      setFormData({ title: '', author: '', category: '', code: '', image: '', status: 'available', description: '' });
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (book: any) => {
    setEditingBook(book);
    setFormData({
      title: book.title || '',
      author: book.author || '',
      category: book.category || '',
      code: book.code || '',
      image: book.image || '',
      status: book.status || 'available',
      description: book.description || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this book?')) {
      await deleteDoc(doc(db, 'books', id));
      await updateDoc(doc(db, 'stats', 'totals'), {
        books: increment(-1)
      });
    }
  };

  const categories = Array.from(new Set(books.map(b => b.category))).filter(Boolean);

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         b.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         b.code?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || b.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-primary">Library Inventory</h2>
          <p className="text-secondary font-medium">Manage book collections, track availability, and update catalog info.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            className="h-12 px-6 rounded-xl font-bold border-slate-200 hover:bg-slate-50"
            onClick={() => navigate('/admin/library/members')}
          >
            <Users className="mr-2 h-5 w-5" /> Manage Library Members
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-accent hover:bg-accent/90 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-accent/20"
                onClick={() => {
                  setEditingBook(null);
                  setFormData({ title: '', author: '', category: '', code: '', image: '', status: 'available', description: '' });
                }}
              >
                <Plus className="mr-2 h-5 w-5" /> Add New Book
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg dialog-solid">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-primary">
                  {editingBook ? 'Edit Book Details' : 'Add New Book to Catalog'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                <div className="space-y-2">
                  <Label className="font-bold text-primary">বইয়ের শিরোনাম (Book Title)</Label>
                  <Input 
                    required 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    placeholder="বইয়ের নাম লিখুন"
                    className="h-12 input-solid"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-primary">লেখক (Author)</Label>
                    <Input 
                      required 
                      value={formData.author} 
                      onChange={e => setFormData({...formData, author: e.target.value})} 
                      placeholder="লেখকের নাম"
                      className="h-12 input-solid"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-primary">ক্যাটাগরি (Category)</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={val => setFormData({...formData, category: val})}
                    >
                      <SelectTrigger className="h-12 input-solid">
                        <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {PREDEFINED_CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                        <SelectItem value="Other">অন্যান্য</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-primary">বইয়ের কোড / ISBN</Label>
                    <Input 
                      required 
                      value={formData.code} 
                      onChange={e => setFormData({...formData, code: e.target.value})} 
                      placeholder="ইউনিক কোড"
                      className="h-12 input-solid"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-primary">অবস্থা (Status)</Label>
                    <Select value={formData.status} onValueChange={val => setFormData({...formData, status: val})}>
                      <SelectTrigger className="h-12 input-solid">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="available">উপলব্ধ (Available)</SelectItem>
                        <SelectItem value="borrowed">ধারে দেওয়া (Borrowed)</SelectItem>
                        <SelectItem value="maintenance">মেরামত (Maintenance)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-primary">কভার ইমেজ ইউআরএল (Cover Image URL)</Label>
                  <Input 
                    value={formData.image} 
                    onChange={e => setFormData({...formData, image: e.target.value})} 
                    placeholder="https://example.com/cover.jpg"
                    className="h-12 input-solid"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-primary">বইয়ের সংক্ষিপ্ত বর্ণনা (Short Overview)</Label>
                  <textarea 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    placeholder="বইটি সম্পর্কে কিছু লিখুন..."
                    className="w-full min-h-[120px] p-4 rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-accent outline-none font-medium text-sm"
                  />
                </div>
                <Button type="submit" className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20">
                  {editingBook ? 'ক্যাটালগ আপডেট করুন' : 'ইনভেন্টরিতে যোগ করুন'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
          <Input 
            placeholder="Search by title, author, or code..." 
            className="pl-12 h-14 input-solid text-lg font-medium shadow-sm"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="pl-12 h-14 input-solid text-lg font-bold text-primary shadow-sm">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredBooks.map((book) => (
          <div key={book.id} className="group card-solid">
            <div className="p-0">
              <div className="aspect-[3/4] bg-slate-100 relative overflow-hidden">
                {book.image ? (
                  <img 
                    src={book.image} 
                    alt={book.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    referrerPolicy="no-referrer" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${book.id}/400/600`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <BookOpen className="h-20 w-20" />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <Badge className={`${book.status === 'available' ? 'bg-emerald-500' : 'bg-amber-500'} text-white font-bold border-none`}>
                    {book.status}
                  </Badge>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg text-primary mb-1 line-clamp-1">{book.title}</h3>
                <div className="flex items-center text-sm text-secondary font-medium mb-3">
                  <User className="h-3 w-3 mr-1" /> {book.author}
                </div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center text-xs font-bold text-secondary bg-slate-100 px-2 py-1 rounded-lg">
                    <Hash className="h-3 w-3 mr-0.5" /> {book.code}
                  </div>
                  <div className="flex items-center text-xs font-bold text-accent">
                    <Bookmark className="h-3 w-3 mr-1" /> {book.category}
                  </div>
                </div>
                <div className="flex gap-3 mb-3">
                  {book.status === 'available' ? (
                    <Button 
                      className="flex-1 h-10 font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white"
                      onClick={() => {
                        setLendingBook(book);
                        setIsLendDialogOpen(true);
                      }}
                    >
                      <HandHelping className="h-4 w-4 mr-2" /> Lend
                    </Button>
                  ) : (
                    <Button 
                      className="flex-1 h-10 font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white"
                      onClick={() => {
                        setReturningBook(book);
                        setIsReturnDialogOpen(true);
                      }}
                    >
                      <History className="h-4 w-4 mr-2" /> Return
                    </Button>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-10 font-bold rounded-xl border-slate-200 hover:bg-slate-50" 
                    onClick={() => handleEdit(book)}
                  >
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="h-10 w-10 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl" 
                    onClick={() => handleDelete(book.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredBooks.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="inline-flex p-6 rounded-full bg-slate-100 mb-4">
              <BookOpen className="h-12 w-12 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-primary">No books found</h3>
            <p className="text-secondary font-medium">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

      <Dialog open={isLendDialogOpen} onOpenChange={setIsLendDialogOpen}>
        <DialogContent className="max-w-md dialog-solid">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">Lend Book: {lendingBook?.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLend} className="space-y-6 pt-4">
            {lendingBook?.currentLocation && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-1">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">বইটি বর্তমানে এখানে রাখা আছে:</p>
                <p className="text-sm font-bold text-primary">{lendingBook.currentLocation}</p>
                {lendingBook.receivedBy && (
                  <p className="text-xs text-slate-500 italic mt-2">সংগ্রহ করেছেন: {lendingBook.receivedBy}</p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label className="font-bold text-primary">Select Member</Label>
              <Select 
                value={lendFormData.memberId} 
                onValueChange={val => setLendFormData({...lendFormData, memberId: val})}
              >
                <SelectTrigger className="h-12 input-solid">
                  <SelectValue placeholder="Choose a member" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {members.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.fullName} ({m.phonePrimary})</SelectItem>
                  ))}
                  {members.length === 0 && (
                    <div className="p-4 text-center text-sm text-slate-500 italic">No approved library members found.</div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-primary">Due Date</Label>
              <Input 
                type="date"
                required
                value={lendFormData.returnDate}
                onChange={e => setLendFormData({...lendFormData, returnDate: e.target.value})}
                className="h-12 input-solid"
              />
            </div>
            <Button type="submit" className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20" disabled={!lendFormData.memberId}>
              Confirm Lending
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <DialogContent className="max-w-md dialog-solid">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">Return Book: {returningBook?.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleReturnSubmit} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label className="font-bold text-primary">সংগ্রহকারী (Who received the book?)</Label>
              <Input 
                required
                value={returnFormData.receivedBy}
                onChange={e => setReturnFormData({...returnFormData, receivedBy: e.target.value})}
                placeholder="নাম লিখুন"
                className="h-12 input-solid"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-primary">বইটি বর্তমানে কোথায় রাখা হলো? (Where was it kept?)</Label>
              <Input 
                required
                value={returnFormData.location}
                onChange={e => setReturnFormData({...returnFormData, location: e.target.value})}
                placeholder="স্থান/সেলফ নম্বর"
                className="h-12 input-solid"
              />
            </div>
            <Button type="submit" className="w-full h-14 text-lg font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20">
              Confirm Return
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
