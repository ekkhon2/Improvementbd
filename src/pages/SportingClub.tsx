import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/src/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trophy, Users, HandHelping, Gamepad2, ChevronLeft, ChevronRight, Phone, Facebook, ShieldCheck, UserPlus, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import MemberForm from '@/src/components/MemberForm';
import GallerySection from '@/src/components/GallerySection';
import ContactSection from '@/src/components/ContactSection';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { collection, query, onSnapshot, where, orderBy } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { formatImageUrl } from '@/src/lib/utils';

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
  const navigate = useNavigate();
  useSEO({
    title: language === 'bn' ? 'স্পোর্টিং ক্লাব - ইমপ্রুভমেন্ট বিডি' : 'Sporting Club - Improvement BD',
    description: language === 'bn' 
      ? 'ইমপ্রুভমেন্ট স্পোর্টিং ক্লাব - খেলাধুলা এবং ই-স্পোর্টসের মাধ্যমে মাদকমুক্ত সমাজ গড়ুন।' 
      : 'Improvement Sporting Club - Build a drug-free society through sports and e-sports.'
  });
  const [banners, setBanners] = useState<any[]>([]);
  const [committee, setCommittee] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
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
    const q = query(collection(db, 'sports_coaches'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCoaches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'sports_coaches');
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
      <section className="py-6 md:py-10 bg-slate-50/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="relative h-[250px] sm:h-[350px] md:h-[450px] overflow-hidden rounded-2xl md:rounded-[2.5rem] bg-black shadow-xl">
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
                    <div className="absolute inset-0 bg-slate-950 overflow-hidden">
                      {/* Blurred Background layer to fill empty side-bars */}
                      <img 
                        src={banners[currentBanner]?.image} 
                        alt="" 
                        className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none"
                        referrerPolicy="no-referrer"
                      />
                      {/* Primary un-cropped layer */}
                      <img 
                        src={banners[currentBanner]?.image} 
                        alt={banners[currentBanner]?.title} 
                        className="absolute inset-0 w-full h-full object-contain z-10"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/10 z-20 flex items-end justify-center pb-8 px-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-accent text-white hover:bg-accent/95 px-8 h-12 text-sm font-black rounded-xl shadow-lg shadow-accent/35 hover:scale-[1.02] active:scale-95 transition-all">
                              {language === 'bn' ? 'এখনই যোগ দিন' : 'Join Now'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-none bg-white rounded-3xl">
                            <MemberForm platform="sporting-club" platformName="Improvement Sporting Club" />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <button 
                  onClick={prevBanner}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/30 hover:bg-black/55 text-white transition-all hover:scale-105"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button 
                  onClick={nextBanner}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/30 hover:bg-black/55 text-white transition-all hover:scale-105"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {banners.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentBanner(i)}
                      className={`w-2 h-2 rounded-full transition-all ${currentBanner === i ? 'bg-accent w-6' : 'bg-white/40'}`}
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
                      className="h-16 w-16 rounded-xl object-contain bg-white p-1 border-2 border-accent/20"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h2 className="text-xl font-bold text-white">Welcome to Sporting Club</h2>
                  <p className="text-white/60 text-sm">Loading exciting events...</p>
                </div>
              </div>
            )}
          </div>
        </div>
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
            
            <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
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

      {/* Coaches Section */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl animate-in fade-in duration-500">
          <div className="text-center mb-16 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs uppercase tracking-widest border border-emerald-200">
              <Sparkles className="h-3 w-3" />
              {language === 'bn' ? 'দক্ষ গাইডলাইন' : 'Expert Coaching'}
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-primary tracking-tight">
              {language === 'bn' ? 'আমাদের অত্যন্ত দক্ষ ও অভিজ্ঞ কোচবৃন্দ' : 'Our Highly Experienced Coaches'}
            </h2>
            <div className="w-20 h-1.5 bg-accent mx-auto rounded-full"></div>
            <p className="text-secondary font-medium max-w-xl mx-auto text-sm md:text-base">
              {language === 'bn' 
                ? 'অনন্য প্রশিক্ষণ ও সঠিক দিশা দেওয়ার জন্য যারা সবসময় পাশে আছেন।' 
                : 'Dedicated trainers and professionals guiding our players to success.'}
            </p>
          </div>

          {coaches.length > 0 ? (
            <div className="relative group/coaches">
              <div 
                id="coaches-track"
                className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {coaches.map((coach) => (
                  <div key={coach.id} className="w-[280px] sm:w-[310px] shrink-0 snap-start bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center text-center space-y-4">
                    {/* Passport-size photo frame */}
                    <div className="w-32 h-40 bg-slate-100 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-inner shrink-0 relative">
                      <img 
                        src={formatImageUrl(coach.photoURL) || 'https://images.unsplash.com/photo-1542156822-6924d1a71aba?w=400&auto=format&fit=crop&q=60'} 
                        alt={coach.name} 
                        className="w-full h-full object-cover object-top" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542156822-6924d1a71aba?w=400&auto=format&fit=crop&q=60';
                        }}
                      />
                    </div>
                    {/* Coach details and action */}
                    <div className="flex-grow flex flex-col justify-between w-full">
                      <div className="space-y-2">
                        <Badge variant="outline" className="text-[10px] font-black tracking-widest text-[#047857] bg-emerald-50 border-emerald-200 uppercase font-mono px-2 py-0.5">
                          {coach.team}
                        </Badge>
                        <h3 className="text-lg font-black text-primary leading-tight">
                          {coach.name}
                        </h3>
                        <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                          <span className="font-extrabold text-slate-800">Speciality: </span>
                          {coach.specialSkill}
                        </p>
                      </div>
                      
                      {coach.fbId && (
                        <div className="pt-4">
                          <a 
                            href={coach.fbId} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-slate-900 hover:bg-emerald-600 hover:text-white text-slate-200 hover:text-white text-[11px] font-black rounded-xl transition-all uppercase tracking-wider shadow-sm font-mono"
                          >
                            <Facebook className="h-3.5 w-3.5 fill-current" />
                            {language === 'bn' ? 'যোগাযোগ করুন' : 'Contact Coach'}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 opacity-60 italic">
              {language === 'bn' ? 'কোনো কোচ তথ্য পাওয়া যায়নি।' : 'No coaches added yet.'}
            </div>
          )}
        </div>
      </section>

      {/* Committee Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-6">
            <h2 className="text-2xl md:text-3xl font-black text-primary tracking-tight">পূর্ণাঙ্গ কমিটি (Full Committee)</h2>
            <div className="w-24 h-1.5 bg-accent mx-auto rounded-full"></div>
            <p className="text-secondary font-medium max-w-2xl mx-auto sm:text-base text-xs">
              ইমপ্রুভমেন্ট স্পোর্টিং ক্লাবের মূল চালিকাশক্তি। একতা এবং নিষ্ঠার সাথে যারা ক্লাবের উন্নয়নে কাজ করছেন।
            </p>
            
            <div className="flex justify-center pt-2 pb-6">
              <Button 
                onClick={() => navigate('/sporting-club/players')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold h-14 px-8 rounded-full shadow-lg shadow-emerald-500/20 group transition-all duration-300 hover:scale-105"
              >
                {language === 'bn' ? 'আমাদের খেলোয়াড়বৃন্দ দেখুন (See Our Players)' : 'See Our Players'}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
              </Button>
            </div>

            {/* Our Teams Sliding Segment (Point 8) */}
            <div className="pt-8 max-w-5xl mx-auto space-y-6">
              <div className="flex items-center justify-center gap-2">
                <div className="h-0.5 w-8 bg-slate-200"></div>
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest font-mono">
                  {language === 'bn' ? 'আমাদের সক্রিয় দলসমূহ' : 'Our Active Teams'}
                </h3>
                <div className="h-0.5 w-8 bg-slate-200"></div>
              </div>

              {/* Slider slideshow */}
              <div className="relative group/teams px-8">
                <div 
                  id="teams-track"
                  className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x scroll-smooth"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
                  {[
                    {
                      name: language === 'bn' ? 'ইমপ্রুভমেন্ট ক্রিকেট একাডেমি' : 'Improvement Cricket Academy',
                      logo: 'https://images.unsplash.com/photo-1540747737956-378724044302?w=150&auto=format&fit=crop&q=60'
                    },
                    {
                      name: language === 'bn' ? 'ইমপ্রুভমেন্ট ফুটবল ক্লাব' : 'Improvement Football Club',
                      logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150&auto=format&fit=crop&q=60'
                    },
                    {
                      name: language === 'bn' ? 'ইমপ্রুভমেন্ট ই-স্পোর্টস নিনজাস' : 'Improvement Esports Ninjas',
                      logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=60'
                    },
                    {
                      name: language === 'bn' ? 'ইমপ্রুভমেন্ট অ্যাথলেটিক ক্লাব' : 'Improvement Athletic Club',
                      logo: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=150&auto=format&fit=crop&q=60'
                    },
                    {
                      name: language === 'bn' ? 'ইমপ্রুভমেন্ট ব্যাডমিন্টন কিংস' : 'Improvement Badminton Kings',
                      logo: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=150&auto=format&fit=crop&q=60'
                    },
                    {
                      name: language === 'bn' ? 'ইমপ্রুভমেন্ট ভলিবল ওয়ারিয়র্স' : 'Improvement Volleyball Warriors',
                      logo: 'https://images.unsplash.com/photo-1592656094267-764a4515757d?w=150&auto=format&fit=crop&q=60'
                    }
                  ].map((team, idx) => (
                    <div 
                      key={idx} 
                      className="w-[180px] xs:w-[200px] sm:w-[220px] shrink-0 snap-start bg-slate-50/80 rounded-2xl p-4 border border-slate-100/70 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all duration-300 flex flex-col items-center text-center space-y-3 group/card"
                    >
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md bg-white shrink-0">
                        <img 
                          src={team.logo} 
                          alt={team.name} 
                          className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <p className="text-xs font-black text-slate-800 leading-tight group-hover/card:text-emerald-700 transition-colors">
                        {team.name}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Left & Right Sliding Buttons */}
                <button
                  onClick={() => {
                    const el = document.getElementById('teams-track');
                    if (el) el.scrollLeft -= 240;
                  }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-slate-200/80 shadow-md text-slate-700 hover:bg-slate-50 flex items-center justify-center opacity-0 group-hover/teams:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('teams-track');
                    if (el) el.scrollLeft += 240;
                  }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-slate-200/80 shadow-md text-slate-700 hover:bg-slate-50 flex items-center justify-center opacity-0 group-hover/teams:opacity-100 transition-opacity"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
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
                  <p className="text-slate-600 leading-relaxed text-sm md:text-base font-medium whitespace-pre-line">
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
