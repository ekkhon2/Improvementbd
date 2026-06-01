import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { collection, query, onSnapshot, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Heart, Trash2, Check, X, Filter, Sparkles, Search, Calendar, Phone, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Donation {
  id: string;
  name: string;
  platform: string;
  platformName: string;
  method: string;
  amount: number;
  note: string;
  sourceNumber: string;
  transactionId: string;
  paymentType?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

export default function DonationsAdmin() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPaymentType, setFilterPaymentType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const q = query(collection(db, 'donations'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Donation[];
      setDonations(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'donations');
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id: string, nextStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'donations', id), {
        status: nextStatus
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'donations');
    }
  };

  const handleDeleteDonation = async (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this donation record?')) {
      try {
        await deleteDoc(doc(db, 'donations', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'donations');
      }
    }
  };

  // Human friendly formatting with Exact Time
  const formatTimestamp = (ts: any): { en: string; bn: string } => {
    if (!ts) return { en: 'N/A', bn: 'N/A' };
    try {
      let date: Date;
      if (ts.toDate && typeof ts.toDate === 'function') {
        date = ts.toDate();
      } else if (ts.seconds) {
        date = new Date(ts.seconds * 1000);
      } else {
        date = new Date(ts);
      }
      const formattedEn = date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      const formattedBn = date.toLocaleString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      return { en: formattedEn, bn: formattedBn };
    } catch (e) {
      return { en: 'N/A', bn: 'N/A' };
    }
  };

  const filteredDonations = donations.filter(d => {
    const matchesPlatform = filterPlatform === 'all' || d.platform === filterPlatform;
    const matchesStatus = filterStatus === 'all' || d.status === filterStatus;
    const matchesPaymentType = filterPaymentType === 'all' || 
      (filterPaymentType === 'special-mail' && d.paymentType === 'special-meal') ||
      (filterPaymentType === 'regular' && d.paymentType !== 'special-meal');
    
    const term = searchQuery.toLowerCase().trim();
    const matchesSearch = !term || 
      (d.name || '').toLowerCase().includes(term) ||
      (d.sourceNumber || '').toLowerCase().includes(term) ||
      (d.transactionId || '').toLowerCase().includes(term) ||
      (d.method || '').toLowerCase().includes(term) ||
      (d.platformName || '').toLowerCase().includes(term) ||
      String(d.amount).includes(term);

    return matchesPlatform && matchesStatus && matchesPaymentType && matchesSearch;
  });

  const STATUS_RANK: Record<string, number> = {
    'approved': 1,
    'pending': 2,
    'rejected': 3
  };

  const sortedDonations = [...filteredDonations].sort((a, b) => {
    const rankA = STATUS_RANK[a.status] || 99;
    const rankB = STATUS_RANK[b.status] || 99;
    if (rankA !== rankB) {
      return rankA - rankB;
    }
    const timeA = a.createdAt?.seconds || 0;
    const timeB = b.createdAt?.seconds || 0;
    return timeB - timeA;
  });

  const totalVerifiedFunds = donations
    .filter(d => d.status === 'approved')
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  const pendingCount = donations.filter(d => d.status === 'pending').length;
  const approvedCount = donations.filter(d => d.status === 'approved').length;

  return (
    <div className="space-y-8">
      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Heart className="h-28 w-28 text-white animate-pulse" />
          </div>
          <CardContent className="p-8">
            <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Total Verified Funds raised</p>
            <h2 className="text-4xl font-black mt-2">৳{totalVerifiedFunds.toLocaleString('bn-BD')}</h2>
            <p className="text-xs text-emerald-400 font-bold mt-2 flex items-center gap-1">
              <Sparkles className="h-4 w-4" /> Supporting humanity welfare
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl rounded-3xl bg-white">
          <CardContent className="p-8">
            <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Pending Review</p>
            <h2 className="text-4xl font-black mt-2 text-amber-500">
              {pendingCount}
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-2">Manual TXN verification needed</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl rounded-3xl bg-white">
          <CardContent className="p-8">
            <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Approved Transactions</p>
            <h2 className="text-4xl font-black mt-2 text-emerald-500">
              {approvedCount}
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-2">Successfully reviewed and saved</p>
          </CardContent>
        </Card>
      </div>

      {/* Control bar with Search and Filters */}
      <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <span className="font-black text-sm text-primary uppercase tracking-wide">Manage & Track Donations</span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Select value={filterPlatform} onValueChange={setFilterPlatform}>
              <SelectTrigger className="w-52 bg-slate-50 border-slate-100 rounded-xl h-11 text-xs font-bold">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-xl">
                <SelectItem value="all">Every Organization</SelectItem>
                <SelectItem value="foundation">Foundation (ফাউন্ডেশন)</SelectItem>
                <SelectItem value="poor-fund">Poor Fund (দরিদ্র তহবিল)</SelectItem>
                <SelectItem value="rehabilitation">Rehabilitation (রিল্যাবিলিটেশন)</SelectItem>
                <SelectItem value="kidscare">Kids Care (শিশু যত্ন)</SelectItem>
                <SelectItem value="food-bank">Food Bank (খাদ্য ব্যাংক)</SelectItem>
                <SelectItem value="blood-bank">Blood Bank (রক্ত দান)</SelectItem>
                <SelectItem value="sporting-club">Sporting Club (খেলাধুলা)</SelectItem>
                <SelectItem value="academic-care">Academic Care (একাডেমিক)</SelectItem>
                <SelectItem value="it-education">IT Education (আইটি শিক্ষা)</SelectItem>
                <SelectItem value="library">Library (লাইব্রেরি)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-44 bg-slate-50 border-slate-100 rounded-xl h-11">
                <SelectValue placeholder="Verification State" />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-xl">
                <SelectItem value="all">Every Status</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPaymentType} onValueChange={setFilterPaymentType}>
              <SelectTrigger className="w-48 bg-slate-50 border-slate-100 rounded-xl h-11 text-xs font-bold">
                <SelectValue placeholder="Donation Type" />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-xl">
                <SelectItem value="all">All Donations (সব ধরণ)</SelectItem>
                <SelectItem value="regular">Regular (সাধারণ অনুদান)</SelectItem>
                <SelectItem value="special-mail">Special Meal (স্পেশাল মিল)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Dynamic Search Box */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Donor name, Sender number, Method or Transaction ID..."
            className="pl-11 h-12 bg-slate-50/50 border-slate-200 rounded-xl font-medium text-sm focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Donations List */}
      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {sortedDonations.map(donation => {
            const timeObj = formatTimestamp(donation.createdAt);
            return (
              <motion.div
                key={donation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all relative overflow-hidden"
              >
                {/* Visual marker bar */}
                <div className={`absolute top-0 left-0 bottom-0 w-2 ${
                  donation.status === 'approved' ? 'bg-emerald-500' :
                  donation.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'
                }`} />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pl-2">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-slate-800 text-lg">{donation.name || 'Anonymous Donor'}</span>
                      <Badge className="bg-slate-100 text-slate-700 capitalize font-black rounded-lg px-2 py-0.5 border-none text-[10px]">
                        {donation.platformName || donation.platform}
                      </Badge>
                      {donation.paymentType === 'special-meal' ? (
                        <Badge className="bg-amber-100 text-amber-800 font-black rounded-lg px-2 py-0.5 border-none text-[10px] tracking-wide">
                          🍲 Special Meal (স্পেশাল মিল)
                        </Badge>
                      ) : (
                        <Badge className="bg-sky-100 text-sky-800 font-black rounded-lg px-2 py-0.5 border-none text-[10px] tracking-wide">
                          🎁 General Donation (সাধারণ অনুদান)
                        </Badge>
                      )}
                      <Badge className="bg-rose-50 text-[#8b0000] font-black rounded-lg px-2 py-0.5 border-none text-[10px] tracking-wide">
                        Verified Member Payment
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold text-slate-500">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-black">Donation Sum</span>
                        <span className="text-primary font-black text-base text-[#8b0000]">৳{donation.amount}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-black flex items-center gap-1">Donation Method</span>
                        <span className="capitalize text-slate-700 font-bold">{donation.method}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-black flex items-center gap-1"><Phone className="h-3 w-3" /> Sender Account</span>
                        <span className="text-slate-700 font-mono">{donation.sourceNumber || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-black flex items-center gap-1"><Hash className="h-3 w-3" /> Transaction ID</span>
                        <span className="font-mono text-primary uppercase bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 font-black">{donation.transactionId}</span>
                      </div>
                    </div>

                    {/* Highly detailed Timestamp Display as required by user */}
                    <div className="p-3 bg-slate-50/60 rounded-xl flex flex-col md:flex-row md:items-center justify-between text-xs font-semibold text-slate-600 gap-2 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-slate-500 uppercase tracking-wider text-[10px] font-black">Donated At / প্রদানের সময়:</span>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 font-mono">
                        <span className="text-slate-800 font-black">{timeObj.bn}</span>
                        <span className="hidden md:inline text-slate-300">|</span>
                        <span className="text-slate-500 text-[11px]">{timeObj.en}</span>
                      </div>
                    </div>

                    {donation.note && (
                      <div className="p-3 bg-red-50/30 rounded-xl text-xs font-bold text-slate-700 italic border border-red-50/50">
                        " {donation.note} "
                      </div>
                    )}
                  </div>

                  {/* Status badges & Admin Controls */}
                  <div className="flex items-center gap-3 self-end md:self-center">
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="text-[10px] text-slate-400 uppercase font-black block">Status</span>
                      {donation.status === 'approved' && (
                        <Badge className="bg-green-100 text-green-800 font-black rounded-lg border-none uppercase tracking-wider text-[9px] px-2 py-1">Approved & Completed</Badge>
                      )}
                      {donation.status === 'rejected' && (
                        <Badge className="bg-red-100 text-red-800 font-black rounded-lg border-none uppercase tracking-wider text-[9px] px-2 py-1">Rejected</Badge>
                      )}
                      {donation.status === 'pending' && (
                        <Badge className="bg-amber-100 text-amber-800 font-black rounded-lg border-none animate-pulse uppercase tracking-wider text-[9px] px-2 py-1">Pending Review</Badge>
                      )}
                    </div>

                    <div className="flex gap-1.5 border-l pl-4 border-slate-100">
                      <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100/80">
                        {donation.status !== 'approved' && (
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => handleUpdateStatus(donation.id, 'approved')}
                            className="h-9 w-9 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg shrink-0"
                            title="Approve Transaction"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        {donation.status !== 'rejected' && (
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => handleUpdateStatus(donation.id, 'rejected')}
                            className="h-9 w-9 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg shrink-0"
                            title="Reject Transaction"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        {(donation.status === 'approved' || donation.status === 'rejected') && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleUpdateStatus(donation.id, 'pending')}
                            className="h-8 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                            title="Reset to Pending"
                          >
                            Reset
                          </Button>
                        )}
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => handleDeleteDonation(donation.id)}
                        className="h-10 w-10 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                        title="Delete Record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {sortedDonations.length === 0 && (
            <div className="py-20 text-center text-slate-400 font-bold bg-white rounded-3xl border border-dashed border-slate-250">
              No matching donation records found. Adjust filters or search terms.
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
