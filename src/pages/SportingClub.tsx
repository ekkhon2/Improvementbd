import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/src/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trophy, Users, HandHelping, Gamepad2, ChevronLeft, ChevronRight, Phone, Facebook, ShieldCheck, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import MemberForm from '@/src/components/MemberForm';
import GallerySection from '@/src/components/GallerySection';
import ContactSection from '@/src/components/ContactSection';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { collection, query, onSnapshot, where, orderBy } from 'firebase/firestore';

interface Member {
  id: string;
  fullName: string;
  occupation: string;
  photoURL?: string;
  platform: string[];
  status: string;
  isInCommittee?: boolean;
  pod?: string;
  teamName?: string;
  phonePrimary?: string;
  facebookURL?: string;
}

import { useSEO } from '@/src/hooks/useSEO';

export default function SportingClub() {
  const { language, t } = useLanguage();
  useSEO({
    title: language === 'bn' ? 'স্পোর্টিং ক্লাব - ইমপ্রুভমেন্ট বিডি' : 'Sporting Club - Improvement BD',
    description: language === 'bn' 
      ? 'ইমপ্রুভমেন্ট স্পোর্টিং ক্লাব - খেলাধুলা এবং ই-স্পোর্টসের মাধ্যমে মাদকমুক্ত সমাজ গড়ুন।' 
      : 'Improvement Sporting Club - Build a drug-free society through sports and e-sports.'
  });
  const [banners, setBanners] = useState<any[]>([]);
  const [committee, setCommittee] = useState<any[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const q = query(collection(db, 'sports_banners'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBanners(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'sports_banners');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, 'members'),
      where('platform', 'array-contains', 'sporting-club'),
      where('status', '==', 'approved'),
      where('isInCommittee', '==', true)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCommittee(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'members');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const nextBanner = () => {
    if (banners.length === 0) return;
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };
  const prevBanner = () => {
    if (banners.length === 0) return;
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const getPositionRank = (pos: string) => {
    const ranks: Record<string, number> = {
      'President': 1,
      'General Secretary': 2,
      'Team Leader': 3,
      'Captain': 4,
      'Vice Captain': 5,
      'Member': 10
    };
    return ranks[pos] || 99;
  };

  const sortedCommittee = [...committee].sort((a, b) => getPositionRank(a.pod) - getPositionRank(b.pod));

  return (
    <div className="min-h-screen">
      {/* Banner Slider */}
      <section className="relative h-[300px] md:h-[600px] overflow-hidden bg-black">
        {banners.length > 0 ? (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentBanner}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${banners[currentBanner]?.image})` }}
                >
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-center px-4">
                    <div className="max-w-3xl">
                      <div className="inline-flex mb-4 md:mb-8">
                        <img 
                          src="https://i.ibb.co.com/qY81XHDH/Improvement-sporting-club.jpg" 
                          alt="Improvement Sporting Club Logo" 
                          className="h-12 w-12 md:h-20 md:w-20 rounded-xl md:rounded-2xl object-contain bg-white p-1.5 border-2 border-accent/30 shadow-2xl shadow-accent/20"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <motion.h1 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl md:text-4xl font-black text-white mb-2 md:mb-4"
                      >
                        {banners[currentBanner]?.title}
                      </motion.h1>
                      <motion.p 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-xs md:text-lg text-white/80 mb-6 md:mb-8"
                      >
                        {banners[currentBanner]?.subtitle}
                      </motion.p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="lg" className="bg-accent text-white hover:bg-accent/90 px-8 h-12 md:h-14 shadow-lg shadow-accent/20 font-bold rounded-xl">
                            {language === 'bn' ? 'এখনই যোগ দিন' : 'Join Now'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-none bg-white rounded-3xl">
                          <MemberForm platform="sporting-club" platformName="Improvement Sporting Club" />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <button 
              onClick={prevBanner}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button 
              onClick={nextBanner}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentBanner(i)}
                  className={`w-3 h-3 rounded-full transition-all ${currentBanner === i ? 'bg-accent w-8' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <div className="text-center space-y-4">
              <div className="inline-flex mb-4">
                <img 
                  src="https://i.ibb.co.com/qY81XHDH/Improvement-sporting-club.jpg" 
                  alt="Improvement Sporting Club Logo" 
                  className="h-20 w-20 rounded-2xl object-contain bg-white p-1.5 border-2 border-accent/30 shadow-2xl shadow-accent/20"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h2 className="text-2xl font-bold text-white">Welcome to Sporting Club</h2>
              <p className="text-white/60">Loading exciting events...</p>
            </div>
          </div>
        )}
      </section>
      
      {/* Registration Section */}
      <section className="py-24 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Trophy className="absolute -top-12 -right-12 h-64 w-64 rotate-12" />
          <Users className="absolute -bottom-12 -left-12 h-64 w-64 -rotate-12" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-accent font-bold text-sm uppercase tracking-widest"
            >
              <ShieldCheck className="h-4 w-4" />
              ইমপ্রুভমেন্ট স্পোর্টিং ক্লাব
            </motion.div>
            
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              {language === 'bn' ? 'আমাদের বিজয়ী দলের অংশ হোন!' : 'Become Part of Our Winning Team!'}
            </h2>
            
            <p className="text-base md:text-lg text-white/70 font-medium">
              {language === 'bn' 
                ? 'মাদককে না বলুন, খেলাধুলাকে হ্যাঁ বলুন। আজই আমাদের মেম্বার হিসেবে যুক্ত হোন।' 
                : 'Say no to drugs, say yes to sports. Join us as a member today.'}
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-10 h-14 md:h-16 text-lg font-black rounded-[1.25rem] shadow-2xl shadow-accent/40 group transition-all hover:scale-105 active:scale-95">
                    <UserPlus className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform" />
                    {language === 'bn' ? 'সদস্য হতে আবেদন করুন' : 'Apply for Membership'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-none bg-white rounded-3xl">
                  <MemberForm platform="sporting-club" platformName="Improvement Sporting Club" />
                </DialogContent>
              </Dialog>
            </div>

            <div className="pt-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
               {[
                 { label: language === 'bn' ? 'সক্রিয় সদস্য' : 'Active Members', value: '৫০০+' },
                 { label: language === 'bn' ? 'টুর্নামেন্ট জয়' : 'Tournaments Won', value: '১৫+' },
                 { label: language === 'bn' ? 'আয়োজিত ইভেন্ট' : 'Events Organized', value: '৫০+' },
                 { label: language === 'bn' ? 'প্রশিক্ষক' : 'Trainers', value: '০৫+' }
               ].map((stat, i) => (
                 <div key={i} className="space-y-1">
                   <p className="text-3xl font-black text-accent">{stat.value}</p>
                   <p className="text-xs font-bold uppercase tracking-widest text-white/50">{stat.label}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* Committee Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-2xl md:text-4xl font-black text-primary tracking-tight">পূর্ণাঙ্গ কমিটি (Full Committee)</h2>
            <div className="w-24 h-1.5 bg-accent mx-auto rounded-full"></div>
            <p className="text-secondary font-medium max-w-2xl mx-auto">ইমপ্রুভমেন্ট স্পোর্টিং ক্লাবের মূল চালিকাশক্তি। একতা এবং নিষ্ঠার সাথে যারা ক্লাবের উন্নয়নে কাজ করছেন।</p>
          </div>

          {sortedCommittee.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
               {sortedCommittee.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full group border-none shadow-xl hover:shadow-2xl transition-all duration-500 rounded-[2rem] overflow-hidden bg-slate-50">
                      <div className="aspect-square relative overflow-hidden">
                        {member.photoURL ? (
                          <img 
                            src={member.photoURL} 
                            alt={member.fullName} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                            <Users className="h-20 w-20 text-slate-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                           <div className="flex justify-center gap-4">
                              {member.facebookURL && (
                                <a href={member.facebookURL} target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-accent transition-colors">
                                  <Facebook className="h-5 w-5" />
                                </a>
                              )}
                           </div>
                        </div>
                      </div>
                      <CardContent className="p-8 text-center space-y-3 relative">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-accent text-white text-[10px] font-black tracking-widest uppercase rounded-lg shadow-lg whitespace-nowrap">
                          {member.pod || 'Member'}
                        </div>
                        <div className="pt-2">
                          <h3 className="text-xl font-black text-primary mb-1">{member.fullName}</h3>
                          <p className="text-xs font-bold text-accent uppercase tracking-wider">{member.teamName || 'Improving Stars'}</p>
                        </div>
                        <div className="pt-4 border-t border-slate-200/60 flex flex-col gap-2">
                           <a href={`tel:${member.phonePrimary}`} className="flex items-center justify-center gap-2 text-sm font-bold text-slate-600 hover:text-primary transition-colors">
                              <Phone className="h-4 w-4" />
                              {member.phonePrimary}
                           </a>
                           {member.occupation && (
                             <p className="text-[11px] font-medium text-slate-400 italic">
                               {member.occupation}
                             </p>
                           )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
               <Users className="h-20 w-20 text-slate-300 mx-auto mb-4" />
               <p className="text-slate-400 font-medium">কমিটি মেম্বারদের তথ্য যোগ করা হচ্ছে...</p>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-20 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center p-6">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gamepad2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>ই-স্পোর্টস</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">পিসি এবং মোবাইল গেমিং টুর্নামেন্টের মাধ্যমে আপনার দক্ষতা প্রদর্শন করুন।</p>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>আউটডোর গেমস</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">ফুটবল, ক্রিকেট এবং ব্যাডমিন্টন টুর্নামেন্টের আয়োজন করা হয় নিয়মিত।</p>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>কমিউনিটি ইভেন্ট</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">সদস্যদের মধ্যে ভ্রাতৃত্ব বাড়াতে বিভিন্ন গেট-টুগেদার আয়োজন করা হয়।</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <ContactSection platform="sporting-club" />

      <GallerySection platform="sporting-club" />

      {/* Welcome Message at the bottom */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl border border-slate-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl" />
             <div className="flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left relative z-10">
                <div className="w-24 h-24 bg-accent/10 rounded-[2.5rem] flex items-center justify-center shrink-0 border-2 border-accent/20">
                   <ShieldCheck className="h-12 w-12 text-accent" />
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-3xl md:text-4xl font-black text-primary tracking-tight">
                      {language === 'bn' ? 'শুভেচ্ছাবার্তা ও লক্ষ্য' : 'Welcome Message & Mission'}
                    </h3>
                    <div className="h-1.5 w-20 bg-accent rounded-full mx-auto md:mx-0" />
                  </div>
                  <p className="text-slate-600 leading-relaxed text-lg md:text-xl font-medium whitespace-pre-line">
                    {language === 'bn' 
                      ? `মনের পরিচর্যার অনেকগুলো পদ্ধতির একটি হলো খেলাধুলা। মনের সঠিক পরিচর্যা অপরাধপ্রবণতা কমায়, আবেগ ও যুক্তির মধ্যে সমন্বয় সাধন করে বাস্তবতাকে মেনে নিতে সহায়তা করে। শিশুরা যদি খেলাধুলার সঠিক পরিবেশ না পায় তাহলে বিকল্প হিসেবে জায়গা করে নিবে।

অনলাইন গেমস, কার্টন, টিকটক ও লাইকির মতো প্রোগ্রামগুলোর মাত্রাতিরিক্ত ব্যবহার বেড়ে যাবে। যা শিশুদের ভাষা বিকাশ ও ব্যক্তিত্ব বিকাশে প্রভাব ফেলবে। যেটা শিশুর জন্য, পিতামাতার জন্য, দেশের জন্য কারো জন্য মঙ্গলজনক নয়।
তাই আমাদের ইমপ্রুভমেন্টের স্লোগান হচ্ছে- খেলায় ধূলায় বাড়ে বল, মাদক ছেড়ে খেলতে চল। 
আসুন আমরা সবাই মিলে আমাদের এলাকা, আমাদের সমাজ তথা আমাদের দেশ কে মাদকমুক্ত করতে একসাথে মিলেমিশে কাজ করি।`
                      : `Sports is one of the many methods of mind care. Proper mind care reduces crime, coordinates between emotion and logic and helps to accept reality. If children do not get the right environment for sports, they will take place as an alternative.

Excessive use of programs like online games, cartoons, TikTok and Likee will increase. Which will affect children's language development and personality development. Which is not good for the child, for the parents, for the country, for anyone.
So our Improvement slogan is - Strength increases in sports, let's play leaving drugs.
Let's all work together to make our area, our society and our country drug-free.`
                    }
                  </p>
                </div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
