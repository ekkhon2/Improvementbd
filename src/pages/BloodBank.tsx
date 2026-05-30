import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/src/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Droplets, Search, UserPlus, Phone, MapPin, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import MemberForm from '@/src/components/MemberForm';
import GallerySection from '@/src/components/GallerySection';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

interface Donor {
  id: string;
  fullName: string;
  bloodGroup: string;
  address: string;
  lastDonatedDate: string;
  phonePrimary: string;
  phoneSecondary?: string;
  isWhatsApp?: boolean;
  photoURL?: string;
}

import { useSEO } from '@/src/hooks/useSEO';

export default function BloodBank() {
  const { language, t } = useLanguage();
  useSEO({
    title: language === 'bn' ? 'ব্লাড ব্যাংক - ইমপ্রুভমেন্ট বিডি' : 'Blood Bank - Improvement BD',
    description: language === 'bn' 
      ? 'ইমপ্রুভমেন্ট ব্লাড ব্যাংক - জরুরি প্রয়োজনে রক্তদাতা খুঁজুন এবং আমাদের রক্তদান কার্যক্রমে অংশ নিন।' 
      : 'Improvement Blood Bank - Find blood donors in emergencies and join our blood donation activities.'
  });
  const [donors, setDonors] = useState<Donor[]>([]);
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'donors'), orderBy('fullName'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const donorList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Donor[];
      setDonors(donorList);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'donors');
    });
    return () => unsubscribe();
  }, []);

  const filteredDonors = donors.filter(donor => {
    const matchesSearch = donor.fullName.toLowerCase().includes(search.toLowerCase()) || 
                         donor.address.toLowerCase().includes(search.toLowerCase());
    const matchesGroup = filterGroup === 'all' || donor.bloodGroup === filterGroup;
    return matchesSearch && matchesGroup;
  });

  const getStatusColor = (lastDate: string) => {
    if (!lastDate) return 'bg-success';
    const last = new Date(lastDate);
    const fourMonthsAgo = new Date();
    fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
    return last > fourMonthsAgo ? 'bg-danger' : 'bg-success';
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-slate-900 text-white py-12 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex mb-6 md:mb-8">
            <img 
              src="https://i.ibb.co.com/C5NVj9mX/Improvement-Blood-Bank.jpg" 
              alt="Improvement Blood Bank Logo" 
              className="h-16 w-16 md:h-24 md:w-24 rounded-2xl md:rounded-3xl object-contain bg-white p-1.5 border-2 border-danger/30 shadow-2xl shadow-danger/20"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-3xl md:text-6xl font-extrabold mb-4 md:mb-6 tracking-tight">Improvement Blood Bank</h1>
          <p className="text-lg md:text-xl opacity-80 max-w-2xl mx-auto leading-relaxed px-4">
            {language === 'bn'
              ? 'আপনার এক ব্যাগ রক্ত বাঁচাতে পারে একটি প্রাণ। আমাদের রক্তদাতা তালিকায় যুক্ত হোন অথবা প্রয়োজনীয় রক্তদাতা খুঁজুন।'
              : 'The Gift of Life, Flowing Through Us. Join our community of life-savers or find the vital support you need.'}
          </p>
          <div className="mt-8 md:mt-12 flex flex-wrap justify-center gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-danger hover:bg-danger/90 text-white px-8 h-12 md:h-14 shadow-lg shadow-danger/20 font-bold rounded-xl">
                  <Droplets className="h-5 w-5 mr-2" /> {language === 'bn' ? 'রক্তদাতা হিসেবে যোগ দিন' : 'Join as Donor'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-none bg-white rounded-3xl">
                <MemberForm platform="blood-bank" platformName="Improvement Blood Bank" />
              </DialogContent>
            </Dialog>
          </div>

          {/* Welcome Message */}
          <div className="max-w-4xl mx-auto mt-16 text-left bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/10 shadow-xl">
            <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
              <Droplets className="h-5 w-5 text-red-500" />
              {language === 'bn' ? 'শুভেচ্ছা বার্তা' : 'Welcome Message'}
            </h2>
            <p className="text-white/80 leading-relaxed text-sm md:text-base font-medium whitespace-pre-line">
              {language === 'bn' 
                ? `রক্তের কোনো বিকল্প নেই, এবং মানুষের শরীরের রক্তের প্রয়োজনীয়তা অপরিসীম। মুমূর্ষু রোগীকে বাঁচাতে প্রায়ই আমাদের অত্যন্ত দ্রুত রক্তদানের প্রয়োজন হয়। দুর্ঘটনা, অস্ত্রোপচার, প্রসবকালীন জটিলতা এবং বিভিন্ন রক্তের ব্যাধির ক্ষেত্রে শত শত মানুষের জীবন শুধুমাত্র সময়ে রক্ত পাওয়ার ওপর নির্ভর করে।

১৮ থেকে ৬০ বছর বয়সী যেকোনো সুস্থ ব্যক্তি প্রতি চার মাস পরপর রক্তের কোনো ক্ষতি ছাড়াই নিরাপদে রক্তদান করতে পারেন। রক্তদান করলে আমাদের শরীরের নতুন কণিকা তৈরির প্রক্রিয়া আরও সক্রিয় হয়ে ওঠে। আপনার একটি ক্ষুদ্র পদক্ষেপ বাঁচাতে পারে কোনো একটি মূল্যবান জীবন।`
                : `There is no true substitute for human blood, and its need in medical emergencies is immense. From physical trauma and critical surgeries to childbirth and treating blood disorders, millions of lives rely entirely on timely blood donations.

Any healthy individual between 18 and 60 years old can safely donate blood every four months. Doing so stimulates your bone marrow to produce fresh blood cells, which improves your own health. Your quick decision could save a precious life.`
              }
            </p>
          </div>
        </div>
      </section>

      {/* Search & List */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="নাম বা এলাকা দিয়ে খুঁজুন..." 
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 w-full md:w-[300px]">
              <Label className="text-sm font-bold text-slate-600 ml-1">গ্রুপ সিলেক্ট করুন</Label>
              <Select value={filterGroup} onValueChange={setFilterGroup}>
                <SelectTrigger className="w-full h-14 bg-white border-none shadow-sm rounded-2xl text-lg font-bold text-danger">
                  <SelectValue placeholder="রক্তের গ্রুপ" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">সব গ্রুপ</SelectItem>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDonors.map(donor => {
              const isAvailable = getStatusColor(donor.lastDonatedDate) === 'bg-success';
              return (
                <Card key={donor.id} className="overflow-hidden group hover:shadow-2xl transition-all duration-500 border-none bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50">
                  <CardContent className="p-8">
                    {/* Profile Photo */}
                    <div className="flex justify-center mb-8">
                      <div className="w-40 h-40 rounded-[2.5rem] bg-slate-100 flex items-center justify-center font-black text-primary text-5xl overflow-hidden border-4 border-white shadow-2xl shadow-slate-200 ring-1 ring-slate-100 relative group-hover:scale-105 transition-transform duration-500">
                        {donor.photoURL ? (
                          <img src={donor.photoURL} alt={donor.fullName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          donor.fullName?.charAt(0)
                        )}
                      </div>
                    </div>

                    {/* Info Section */}
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-2xl font-black text-primary tracking-tight mb-2">{donor.fullName}</h3>
                        <Badge className="bg-rose-50 text-rose-600 hover:bg-rose-100 border-none font-black text-lg px-4 py-1 rounded-xl">
                          Blood Group: {donor.bloodGroup}
                        </Badge>
                      </div>
                      
                      <div className="space-y-4 pt-2">
                        <div className="flex items-start gap-4 text-secondary font-bold">
                          <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 text-primary">
                            <Phone className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest opacity-50 mb-0.5">Phone Number</p>
                            <p className="text-sm">{donor.phonePrimary} {donor.phoneSecondary && `/ ${donor.phoneSecondary}`}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4 text-secondary font-bold">
                          <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 text-primary">
                            <MapPin className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest opacity-50 mb-0.5">Address</p>
                            <p className="text-sm">{donor.address}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4 text-secondary font-bold">
                          <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 text-primary">
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest opacity-50 mb-0.5">Last Donation</p>
                            <p className="text-sm">{donor.lastDonatedDate || 'No record'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Status - Large and Prominent */}
                      <div className={`mt-8 p-6 rounded-[2rem] ${isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'} transition-all border-2 ${isAvailable ? 'border-emerald-100' : 'border-rose-100'}`}>
                        <div className="flex items-center gap-3 mb-2">
                          {isAvailable ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Eligibility Status</p>
                        </div>
                        <p className="text-2xl font-black tracking-tight">
                          {isAvailable ? 'রক্তদানে সক্ষম' : 'বর্তমানে রক্তদানে অক্ষম'}
                        </p>
                        <p className="text-[11px] font-bold mt-2 opacity-60 leading-tight">
                          {isAvailable 
                            ? 'You can contact this donor for blood donation.' 
                            : 'This donor has donated recently and needs rest.'}
                        </p>
                      </div>

                      <Button 
                        className="w-full h-16 mt-4 text-lg font-black rounded-[1.5rem] shadow-xl shadow-primary/20 bg-primary text-white hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        onClick={() => window.open(`tel:${donor.phonePrimary}`)}
                      >
                        কল করুন
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filteredDonors.length === 0 && (
              <div className="col-span-full text-center py-20 text-muted-foreground">
                কোন রক্তদাতা পাওয়া যায়নি।
              </div>
            )}
          </div>
        </div>
      </section>

      <GallerySection platform="blood-bank" />
    </div>
  );
}
