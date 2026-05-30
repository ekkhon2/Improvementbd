import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { collection, onSnapshot, query, where, doc, updateDoc, addDoc, serverTimestamp, orderBy, getDocs, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, CreditCard, History, BookOpen, User, Phone, Mail, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function LibraryMembersAdmin() {
  const [members, setMembers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [memberHistory, setMemberHistory] = useState<any[]>([]);
  const [memberBooks, setMemberBooks] = useState<any[]>([]);
  const [memberFees, setMemberFees] = useState<any[]>([]);
  const [isFeeDialogOpen, setIsFeeDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feeData, setFeeData] = useState({ amount: '', note: '' });
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [selectedLending, setSelectedLending] = useState<any>(null);
  const [returnFormData, setReturnFormData] = useState({ receivedBy: '', location: '' });

  useEffect(() => {
    const q = query(collection(db, 'members'), where('platform', 'array-contains', 'library'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const membersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setMembers(membersList);
      
      if (selectedMember) {
        const updated = membersList.find(m => m.id === selectedMember.id);
        if (updated) setSelectedMember(updated);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'members');
    });
    return () => unsubscribe();
  }, [selectedMember?.id]);

  useEffect(() => {
    if (!selectedMember) return;

    // Real-time Lending History
    const lendQ = query(collection(db, 'lending'), where('memberId', '==', selectedMember.id));
    const unsubLend = onSnapshot(lendQ, (snapshot) => {
      const history = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any))
        .sort((a, b) => {
          const timeA = a.createdAt?.seconds || Date.now() / 1000;
          const timeB = b.createdAt?.seconds || Date.now() / 1000;
          return timeB - timeA;
        });
      setMemberHistory(history);
      setMemberBooks(history.filter((h: any) => h.status === 'borrowed'));
    });

    // Real-time Fee History
    const feeQ = query(collection(db, 'library_fees'), where('memberId', '==', selectedMember.id));
    const unsubFee = onSnapshot(feeQ, (snapshot) => {
      const fees = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any))
        .sort((a, b) => {
          const timeA = a.date?.seconds || Date.now() / 1000;
          const timeB = b.date?.seconds || Date.now() / 1000;
          return timeB - timeA;
        });
      setMemberFees(fees);
    });

    return () => {
      unsubLend();
      unsubFee();
    };
  }, [selectedMember?.id]);

  const fetchMemberDetails = (member: any) => {
    setSelectedMember(member);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const membershipId = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit ID

    try {
      await addDoc(collection(db, 'members'), {
        fullName: formData.get('fullName'),
        phonePrimary: formData.get('phone'),
        email: formData.get('email'),
        membershipId,
        platform: ['library'],
        status: 'approved',
        createdAt: serverTimestamp(),
        feesPaid: 0,
        totalFees: 0
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'members');
    }
  };

  const handleCollectFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || isProcessing) return;

    try {
      setIsProcessing(true);
      const amount = Number(feeData.amount);
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount.');
        return;
      }
      
      console.log('Starting fee collection for:', selectedMember.id, 'Amount:', amount);

      // 1. Record fee in history
      const feeRef = await addDoc(collection(db, 'library_fees'), {
        memberId: selectedMember.id,
        memberName: selectedMember.fullName,
        amount,
        note: feeData.note,
        date: serverTimestamp(),
        type: 'library_fee'
      });
      console.log('Fee record created:', feeRef.id);

      // 2. Update member's total fees paid
      await updateDoc(doc(db, 'members', selectedMember.id), {
        feesPaid: (selectedMember.feesPaid || 0) + amount
      });
      console.log('Member profile updated');

      // Optimistic update for immediate UI feedback
      setSelectedMember(prev => prev ? { ...prev, feesPaid: (prev.feesPaid || 0) + amount } : null);

      setIsFeeDialogOpen(false);
      setFeeData({ amount: '', note: '' });
      alert('Fee collected successfully!');
    } catch (error) {
      console.error('Fee collection failed:', error);
      if (error instanceof Error && error.message.includes('permission-denied')) {
        alert('Permission Denied: You do not have permission to collect fees. Please check if you are an admin.');
      } else {
        alert('Failed to collect fee. Please try again. Error: ' + (error instanceof Error ? error.message : String(error)));
      }
      handleFirestoreError(error, OperationType.UPDATE, `members/${selectedMember.id}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReturnBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLending || isProcessing) return;

    try {
      setIsProcessing(true);
      
      // 1. Update lending record
      await updateDoc(doc(db, 'lending', selectedLending.id), {
        status: 'returned',
        returnDate: serverTimestamp(),
        receivedBy: returnFormData.receivedBy,
        location: returnFormData.location
      });

      // 2. Update book status to available
      if (selectedLending.bookId) {
        await updateDoc(doc(db, 'books', selectedLending.bookId), {
          status: 'available',
          receivedBy: returnFormData.receivedBy,
          currentLocation: returnFormData.location
        });
      }

      setIsReturnDialogOpen(false);
      setSelectedLending(null);
      setReturnFormData({ receivedBy: '', location: '' });
      alert('Book returned successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `lending/${selectedLending.id}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredMembers = members.filter(m => 
    m.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.membershipId?.includes(searchQuery) ||
    m.phonePrimary?.includes(searchQuery)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-primary">Library Members</h2>
          <p className="text-secondary font-medium">Manage membership IDs, fees, and borrowing history.</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-accent/20">
              <UserPlus className="mr-2 h-5 w-5" /> New Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md dialog-solid">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary">Add Library Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddMember} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="font-bold">Full Name</Label>
                <Input name="fullName" required placeholder="Member's full name" className="h-12 input-solid" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Phone Number</Label>
                <Input name="phone" required placeholder="017XXXXXXXX" className="h-12 input-solid" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Email (Optional)</Label>
                <Input name="email" type="email" placeholder="email@example.com" className="h-12 input-solid" />
              </div>
              <Button type="submit" className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20">
                Create Membership
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Members List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
            <Input 
              placeholder="Search by ID or Name..." 
              className="pl-12 h-14 input-solid font-medium shadow-sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {filteredMembers.map(m => (
              <button
                key={m.id}
                onClick={() => fetchMemberDetails(m)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedMember?.id === m.id 
                    ? 'bg-primary text-white border-primary shadow-lg scale-[1.02]' 
                    : 'bg-white border-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className="font-bold text-lg">{m.fullName}</p>
                  <Badge className={selectedMember?.id === m.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}>
                    ID: {m.membershipId || 'N/A'}
                  </Badge>
                </div>
                <p className={`text-sm ${selectedMember?.id === m.id ? 'text-white/70' : 'text-secondary'}`}>
                  {m.phonePrimary}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Member Details */}
        <div className="lg:col-span-2">
          {selectedMember ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-primary text-white p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-6">
                      <div className="h-20 w-20 rounded-3xl bg-white/10 flex items-center justify-center text-3xl font-black border border-white/20 overflow-hidden">
                        {selectedMember.photoURL ? (
                          <img src={selectedMember.photoURL} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          selectedMember.fullName?.charAt(0)
                        )}
                      </div>
                      <div>
                        <h3 className="text-3xl font-black">{selectedMember.fullName}</h3>
                        <div className="flex items-center gap-3 mt-1 opacity-80">
                          <Badge className="bg-white/20 text-white border-none font-bold">
                            MEMBER ID: {selectedMember.membershipId}
                          </Badge>
                          <span className="text-sm font-medium">Joined {selectedMember.createdAt?.toDate ? format(selectedMember.createdAt.toDate(), 'MMM yyyy') : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Dialog open={isFeeDialogOpen} onOpenChange={setIsFeeDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl h-12 shadow-lg shadow-emerald-500/20">
                            <CreditCard className="mr-2 h-5 w-5" /> Collect Fee
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md dialog-solid">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-primary">Collect Membership Fee</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleCollectFee} className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <Label className="font-bold">Amount (BDT)</Label>
                              <Input 
                                type="number" 
                                required 
                                value={feeData.amount}
                                onChange={e => setFeeData({...feeData, amount: e.target.value})}
                                placeholder="e.g. 500" 
                                className="h-12 input-solid" 
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="font-bold">Note</Label>
                              <Input 
                                value={feeData.note}
                                onChange={e => setFeeData({...feeData, note: e.target.value})}
                                placeholder="Monthly fee / Registration" 
                                className="h-12 input-solid" 
                              />
                            </div>
                            <Button type="submit" disabled={isProcessing} className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20">
                              {isProcessing ? 'Processing...' : 'Confirm Fee Collection'}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-2">Total Fees Paid</p>
                      <h4 className="text-2xl font-black text-primary">৳ {selectedMember.feesPaid || 0}</h4>
                    </div>
                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-2">Books Borrowed</p>
                      <h4 className="text-2xl font-black text-primary">{memberBooks.length} Active</h4>
                    </div>
                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-2">Contact</p>
                      <h4 className="text-sm font-bold text-primary truncate">{selectedMember.phonePrimary}</h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Borrowing History */}
                    <div className="space-y-6">
                      <h4 className="text-xl font-black text-primary flex items-center gap-2">
                        <History className="h-5 w-5 text-accent" /> Borrowing History
                      </h4>
                      <div className="space-y-3">
                        {memberHistory.map(h => (
                          <div key={h.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${h.status === 'borrowed' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                <BookOpen className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-bold text-sm text-primary">{h.bookTitle}</p>
                                <p className="text-[10px] text-secondary font-medium">
                                  {h.lendDate?.toDate ? format(h.lendDate.toDate(), 'MMM dd') : 'N/A'} 
                                  {h.status === 'borrowed' ? ` • Due: ${h.dueDate}` : ` • Ret: ${h.returnDate?.toDate ? format(h.returnDate.toDate(), 'MMM dd') : 'N/A'}`}
                                </p>
                                {h.location && (
                                  <p className="text-[10px] text-emerald-600 font-bold mt-1 italic">
                                    Location: {h.location} {h.receivedBy && `(by ${h.receivedBy})`}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`text-[10px] ${h.status === 'borrowed' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {h.status === 'borrowed' ? 'Active' : 'Returned'}
                              </Badge>
                              {h.status === 'borrowed' && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-7 px-2 text-[10px] font-bold border-amber-200 text-amber-700 hover:bg-amber-50"
                                  onClick={() => {
                                    setSelectedLending(h);
                                    setIsReturnDialogOpen(true);
                                  }}
                                >
                                  Return
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                        {memberHistory.length === 0 && (
                          <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-xs text-secondary font-bold italic">No borrowing history.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Fee History */}
                    <div className="space-y-6">
                      <h4 className="text-xl font-black text-primary flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-emerald-500" /> Fee Collection History
                      </h4>
                      <div className="overflow-hidden rounded-2xl border border-slate-100">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 text-[10px] font-black text-secondary uppercase tracking-widest">
                            <tr>
                              <th className="px-4 py-3">Amount</th>
                              <th className="px-4 py-3">Date</th>
                              <th className="px-4 py-3">Note</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {memberFees.map(f => (
                              <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 font-bold text-primary">৳ {f.amount}</td>
                                <td className="px-4 py-3 text-secondary font-medium">
                                  {f.date?.toDate ? format(f.date.toDate(), 'MMM dd, yyyy') : 'Just now'}
                                </td>
                                <td className="px-4 py-3 text-secondary font-medium truncate max-w-[100px]">
                                  {f.note || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {memberFees.length === 0 && (
                          <div className="py-8 text-center bg-slate-50 border-t border-dashed border-slate-200">
                            <p className="text-xs text-secondary font-bold italic">No fee history.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
              <div className="p-6 rounded-full bg-white shadow-sm mb-4">
                <User className="h-12 w-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-primary">Select a member</h3>
              <p className="text-secondary font-medium">Choose a member from the list to view their details and history.</p>
            </div>
          )}
        </div>
      </div>

      {/* Return Book Dialog */}
      <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <DialogContent className="max-w-md dialog-solid">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">Return Book</DialogTitle>
          </DialogHeader>
          {selectedLending && (
            <form onSubmit={handleReturnBook} className="space-y-4 pt-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
                <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">Book Title</p>
                <p className="font-bold text-primary">{selectedLending.bookTitle}</p>
              </div>
              <div className="space-y-4">
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
                  <Label className="font-bold text-primary">বইটি বর্তমানে কোথায় রাখা হলো?</Label>
                  <Input 
                    required 
                    value={returnFormData.location}
                    onChange={e => setReturnFormData({...returnFormData, location: e.target.value})}
                    placeholder="স্থান/সেলফ নম্বর" 
                    className="h-12 input-solid" 
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="flex-1 h-14 font-bold rounded-xl"
                  onClick={() => setIsReturnDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isProcessing} 
                  className="flex-[2] h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20"
                >
                  {isProcessing ? 'Processing...' : 'Confirm Return'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
