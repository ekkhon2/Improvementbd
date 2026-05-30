import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/src/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Heart, Users, HandHelping, Globe, MapPin, ChevronRight, Phone, ArrowLeft } from 'lucide-react';
import MemberForm from '@/src/components/MemberForm';
import GallerySection from '@/src/components/GallerySection';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { collection, query, onSnapshot, where } from 'firebase/firestore';

interface Member {
  id: string;
  fullName: string;
  occupation: string;
  address: string;
  photoURL?: string;
  foundationArea?: string;
  position?: string;
  phonePrimary: string;
}

const POSITION_RANK: Record<string, number> = {
  'সভাপতি': 1,
  'সহ-সভাপতি': 2,
  'সাধারণ সম্পাদক': 3,
  'সহ-সাধারণ সম্পাদক': 4,
  'সাংগঠনিক সম্পাদক': 5,
  'কোষাধ্যক্ষ': 6,
  'দপ্তর সম্পাদক': 7,
  'প্রচার সম্পাদক': 8,
  'সদস্য': 9,
  'কর্মী': 10
};

const getPositionRank = (position?: string) => {
  if (!position) return 100;
  const normalized = position.trim();
  return POSITION_RANK[normalized] || 99;
};

export default function Foundation() {
  const { language, t } = useLanguage();
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'members'), 
      where('platform', 'array-contains', 'foundation'),
      where('status', '==', 'approved')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Member[];
      setMembers(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'members');
    });
    return () => unsubscribe();
  }, []);

  // Group members by area
  const areas = Array.from(new Set(members.map(m => m.foundationArea).filter(Boolean))) as string[];
  
  const areaMembers = selectedArea 
    ? members
        .filter(m => m.foundationArea === selectedArea)
        .sort((a, b) => getPositionRank(a.position) - getPositionRank(b.position))
    : [];

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
              src="https://i.ibb.co.com/v6vxhj3Y/Improvement-Foundation.jpg" 
              alt="Improvement Foundation Logo" 
              className="h-16 w-16 md:h-24 md:w-24 rounded-2xl md:rounded-3xl object-contain bg-white p-1.5 border-2 border-accent/30 shadow-2xl shadow-accent/20"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-3xl md:text-6xl font-extrabold mb-4 md:mb-6 tracking-tight">Improvement Foundation</h1>
          <p className="text-lg md:text-xl opacity-80 max-w-2xl mx-auto leading-relaxed px-4">
            {language === 'bn' 
              ? 'মানবতার সেবায় আমরা অঙ্গীকারবদ্ধ। আমাদের বিভিন্ন সামাজিক উন্নয়নমূলক কর্মকাণ্ডের মাধ্যমে আমরা একটি সুন্দর সমাজ গড়তে কাজ করছি।'
              : 'Humanity Acknowledged, Lives Transformed. We are dedicated to building a better society through compassionate social initiatives.'}
          </p>
          <div className="mt-8 md:mt-12">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-8 h-12 md:h-14 shadow-lg shadow-accent/20 font-bold rounded-xl">
                  <HandHelping className="h-5 w-5 mr-2" /> {language === 'bn' ? 'ভলান্টিয়ার হিসেবে যোগ দিন' : 'Join as Volunteer'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-none bg-white rounded-3xl">
                <MemberForm platform="foundation" platformName="Improvement Foundation" />
              </DialogContent>
            </Dialog>
          </div>

          {/* Welcome Message */}
          <div className="max-w-4xl mx-auto mt-16 text-left bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/10 shadow-xl">
            <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
              <HandHelping className="h-5 w-5 text-accent" />
              {language === 'bn' ? 'শুভেচ্ছা বার্তা' : 'Welcome Message'}
            </h2>
            <p className="text-white/80 leading-relaxed text-sm md:text-base font-medium whitespace-pre-line">
              {language === 'bn' 
                ? `আমরা যে সমাজে বেড়ে উঠেছি, মানুষ হিসেবে তার প্রতি আমাদের বড় একটি দায়িত্ব রয়েছে। একা কখনোই বড় হওয়া সম্ভব নয়; পরিবার ও চারপাশের সকল মানুষের সাহায্যেই আমরা এগিয়ে চলি। এই দায়বদ্ধতা থেকেই ইমপ্রুভমেন্ট ফাউন্ডেশনের পথচলা। 

আমরা নিজেদের সর্বোচ্চ সামর্থ্য দিয়ে ঢাকা শহরের এবং পুরো বাংলাদেশের প্রতিটি অলিতে-গলিতে মানুষের পাশে থাকার লক্ষ্যে কাজ করে যাচ্ছি। আসুন, আমাদের এই পথচলায় আপনিও সামর্থ্য অনুযায়ী অংশ নিন। সবার সদিচ্ছায় একদিন বিজয় হবেই ইনশাআল্লাহ্।`
                : `We have a profound responsibility to the society we grew up in. None of us can succeed alone; we rely on our families, communities, and those around us. Out of this gratitude, the Improvement Foundation was born.

We are dedicated to working tirelessly across every corner of Dhaka and eventually all of Bangladesh to stand alongside people in need. Join us on this journey to make a positive impact in our society.`
              }
            </p>
          </div>
        </div>
      </section>

      {/* Activities */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            <Card className="text-center p-6 border-accent/20 rounded-[2rem] shadow-xl shadow-slate-100">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>পরিবেশ রক্ষা</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">গাছ লাগানো এবং পরিবেশ সচেতনতা বৃদ্ধিতে আমরা নিয়মিত কাজ করি।</p>
              </CardContent>
            </Card>
            <Card className="text-center p-6 border-accent/20 rounded-[2rem] shadow-xl shadow-slate-100">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>শিক্ষা সহায়তা</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">অসহায় শিক্ষার্থীদের শিক্ষা উপকরণ এবং আর্থিক সহায়তা প্রদান।</p>
              </CardContent>
            </Card>
            <Card className="text-center p-6 border-accent/20 rounded-[2rem] shadow-xl shadow-slate-100">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>ত্রাণ বিতরণ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">প্রাকৃতিক দুর্যোগে ক্ষতিগ্রস্তদের মাঝে খাদ্য ও প্রয়োজনীয় সামগ্রী বিতরণ।</p>
              </CardContent>
            </Card>
          </div>

          {!selectedArea ? (
            <div className="space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-black text-primary tracking-tight">এলাকাভিত্তিক কমিটি</h2>
                <p className="text-muted-foreground max-w-xl mx-auto">আমাদের ফাউন্ডেশনের কার্যক্রম এলাকাভিত্তিক কমিটির মাধ্যমে পরিচালিত হয়। আপনার এলাকার কমিটি দেখতে নিচে ক্লিক করুন।</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {areas.length > 0 ? areas.map(area => (
                  <button 
                    key={area}
                    onClick={() => setSelectedArea(area)}
                    className="group relative p-8 bg-white border-2 border-slate-100 rounded-[2.5rem] text-left hover:border-accent hover:shadow-2xl hover:shadow-accent/10 transition-all duration-500 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                      <MapPin className="h-20 w-20 text-accent" />
                    </div>
                    <div className="relative z-10 space-y-4">
                      <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                        <MapPin className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-primary mb-1">{area}</h3>
                        <p className="text-sm text-muted-foreground font-bold">কমিটি দেখুন <ChevronRight className="inline h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" /></p>
                      </div>
                    </div>
                  </button>
                )) : (
                  <div className="col-span-full text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <p className="text-muted-foreground font-bold italic">বর্তমানে কোন এলাকাভিত্তিক কমিটি তালিকাভুক্ত নেই।</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedArea(null)}
                  className="w-fit h-12 px-6 rounded-2xl hover:bg-slate-100 font-bold text-primary gap-2"
                >
                  <ArrowLeft className="h-5 w-5" /> সব এলাকা
                </Button>
                <div className="text-right">
                  <h2 className="text-4xl font-black text-primary tracking-tight">{selectedArea} কমিটি</h2>
                  <p className="text-accent font-bold">Improvement Foundation</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {areaMembers.map((m, index) => (
                  <Card 
                    key={m.id} 
                    className={`overflow-hidden border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] group hover:scale-[1.02] transition-all duration-500 ${index === 0 ? 'sm:col-span-2 lg:col-span-3 xl:col-span-4 max-w-2xl mx-auto w-full' : ''}`}
                  >
                    <CardContent className={`p-8 flex flex-col items-center text-center ${index === 0 ? 'md:flex-row md:text-left md:items-start gap-8' : 'gap-6'}`}>
                      <div className={`${index === 0 ? 'w-48 h-48 md:w-56 md:h-56' : 'w-32 h-32'} rounded-[2.5rem] bg-slate-100 flex items-center justify-center font-black text-primary text-4xl overflow-hidden border-4 border-white shadow-2xl shadow-slate-200 shrink-0`}>
                        {m.photoURL ? (
                          <img src={m.photoURL} alt={m.fullName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          m.fullName?.charAt(0)
                        )}
                      </div>
                      
                      <div className="space-y-4 flex-1">
                        <div>
                          <Badge className="bg-accent/10 text-accent hover:bg-accent/20 border-none font-black text-xs px-4 py-1 rounded-full mb-2 uppercase tracking-widest">
                            {m.position || 'সদস্য'}
                          </Badge>
                          <h3 className={`${index === 0 ? 'text-3xl' : 'text-xl'} font-black text-primary tracking-tight`}>{m.fullName}</h3>
                          <p className="text-sm text-muted-foreground font-bold">{m.occupation}</p>
                        </div>

                        <div className="pt-2 space-y-2">
                          <div className="flex items-center justify-center md:justify-start gap-2 text-secondary font-bold text-sm">
                            <Phone className="h-4 w-4 text-accent" />
                            {m.phonePrimary}
                          </div>
                          <div className="flex items-center justify-center md:justify-start gap-2 text-secondary font-bold text-sm">
                            <MapPin className="h-4 w-4 text-accent" />
                            {m.address}
                          </div>
                        </div>

                        <Button 
                          size="sm"
                          className="w-full md:w-fit px-8 rounded-xl font-bold bg-primary text-white hover:bg-primary/90"
                          onClick={() => window.open(`tel:${m.phonePrimary}`)}
                        >
                          কল করুন
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <GallerySection platform="foundation" />
    </div>
  );
}
