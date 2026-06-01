import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/src/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'motion/react';
import { 
  ArrowRight,
  Users,
  Droplets,
  Heart,
  BookOpen
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { doc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { useSEO } from '@/src/hooks/useSEO';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const platforms = [
  {
    name: "Improvement Foundation",
    bnName: "ইম্প্রুভমেন্ট ফাউন্ডেশন",
    slug: "foundation",
    desc: "Social service and volunteer activities",
    bnDesc: "সমাজসেবামূলক কাজ ও স্বেচ্ছাসেবী কার্যক্রম",
    logo: "https://i.ibb.co.com/v6vxhj3Y/Improvement-Foundation.jpg"
  },
  {
    name: "Improvement Blood Bank",
    bnName: "ইম্প্রুভমেন্ট ব্লাড ব্যাংক",
    slug: "blood-bank",
    desc: "Blood donation activities and services",
    bnDesc: "রক্তদান কার্যক্রম ও সেবাসমূহ",
    logo: "https://i.ibb.co.com/C5NVj9mX/Improvement-Blood-Bank.jpg"
  },
  {
    name: "Improvement Food Bank",
    bnName: "ইম্প্রুভমেন্ট ফুড ব্যাংক",
    slug: "food-bank",
    desc: "Delivering food through Food For All program",
    bnDesc: "ফুড ফর অল প্রোগ্রামের মাধ্যমে খাবার পৌঁছানো",
    logo: "https://i.ibb.co.com/zWwHgHV7/Improvement-Food-Bank.jpg"
  },
  {
    name: "Improvement Sporting Club",
    bnName: "ইম্প্রুভমেন্ট স্পোর্টিং ক্লাব",
    slug: "sporting-club",
    desc: "E-sports and sports events",
    bnDesc: "ই-স্পোর্টস এবং খেলাধুলা ইভেন্ট",
    logo: "https://i.ibb.co.com/qY81XHDH/Improvement-sporting-club.jpg"
  },
  {
    name: "Improvement IT Education",
    bnName: "ইম্প্রুভমেন্ট আইটি এডুকেশন",
    slug: "it-education",
    desc: "Advanced technology courses",
    bnDesc: "উন্নত প্রযুক্তির কোর্সসমূহ",
    logo: "https://i.ibb.co.com/NgmJMWzq/Improvement-IT-Education.jpg"
  },
  {
    name: "Improvement Academic Care",
    bnName: "ইম্প্রুভমেন্ট একাডেমিক কেয়ার",
    slug: "academic-care",
    desc: "Care for school and college students",
    bnDesc: "স্কুল কলেজের স্টুডেন্টদের জন্য কেয়ার",
    logo: "https://i.ibb.co.com/RpkV8nZ4/Improvement-Academic-Care.jpg"
  },
  {
    name: "Improvement Library",
    bnName: "ইম্প্রুভমেন্ট লাইব্রেরি",
    slug: "library",
    desc: "Beautiful arrangement for borrowing and reading books",
    bnDesc: "বই ধার ও পড়ার সুন্দর ব্যবস্থা",
    logo: "https://i.ibb.co.com/v6jNcH6c/Improvement-Library.jpg"
  },
  {
    name: "Improvement Rehabilitation",
    bnName: "পুনর্বাসন কেন্দ্র",
    slug: "rehabilitation",
    desc: "Rehabilitation and old age home care services",
    bnDesc: "বৃদ্ধাশ্রম এবং পুনর্বাসন সেবা কার্যক্রমসমূহ",
    logo: "https://picsum.photos/seed/rehabilitation/300/300"
  },
  {
    name: "Kids Care Center",
    bnName: "কিডস কেয়ার",
    slug: "kidscare",
    desc: "Nursery and modern day care services",
    bnDesc: "শিশুদের খেলাধুলা ও ডে-কেয়ার সেবা কার্যক্রম",
    logo: "https://picsum.photos/seed/kidscare/300/300"
  },
  {
    name: "Poor Fund",
    bnName: "দরিদ্র তহবিল",
    slug: "poor-fund",
    desc: "Financial emergency and welfare assistance",
    bnDesc: "অসহায় মানুষদের বিশেষ অনুদান তহবিল",
    logo: "https://picsum.photos/seed/poorfund/300/300"
  }
];

export default function Home() {
  const { language, t } = useLanguage();
  useSEO({
    title: language === 'bn' ? 'হোম - ইমপ্রুভমেন্ট বিডি' : 'Home - Improvement BD',
    description: language === 'bn' 
      ? 'ইমপ্রুভমেন্ট বিডি একটি বহুমুখী সামাজিক সংগঠন যা রক্তদান, আইটি শিক্ষা, লাইব্রেরি এবং স্পোর্টিং ক্লাবের মাধ্যমে সমাজের উন্নয়নে কাজ করে।' 
      : 'Improvement BD is a multi-platform community organization working for social development through blood donation, IT education, library, and sporting club.'
  });
  const [stats, setStats] = useState({
    members: 0,
    donors: 0,
    books: 0,
    recipients: 500
  });
  const [banners, setBanners] = useState<any[]>([]);
  const [bannerMode, setBannerMode] = useState<'auto' | 'video' | 'carousel'>('auto');

  useEffect(() => {
    // Fetch Banners
    const bannersQuery = query(collection(db, 'banners'), orderBy('order', 'asc'));
    const unsubBanners = onSnapshot(bannersQuery, (snap) => {
      setBanners(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'banners');
    });

    const unsubStats = onSnapshot(doc(db, 'stats', 'totals'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStats({
          members: data.members || 0,
          donors: data.donors || 0,
          books: data.books || 0,
          recipients: data.recipients || 500
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'stats/totals');
    });

    const unsubSettings = onSnapshot(doc(db, 'settings', 'banners'), (snap) => {
      if (snap.exists()) {
        setBannerMode(snap.data().mode || 'auto');
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/banners');
    });

    return () => {
      unsubBanners();
      unsubStats();
      unsubSettings();
    };
  }, []);

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoBanner = banners.find(b => b.type === 'video');
  const imageBanners = banners.filter(b => b.type === 'image' || !b.type);

  const showVideo = (bannerMode === 'video' && videoBanner) || 
                    (bannerMode === 'auto' && videoBanner);
  
  const bannersToDisplay = showVideo ? [videoBanner!] : imageBanners;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b">
        {showVideo ? (
          <div className="bg-slate-900 py-8 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <div className="relative aspect-video rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/10 bg-black group">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${getYoutubeId(videoBanner!.videoUrl)}?autoplay=1&mute=1&loop=1&playlist=${getYoutubeId(videoBanner!.videoUrl)}&controls=1&showinfo=0&rel=0&modestbranding=1`}
                    title="Hero Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-view"
                    allowFullScreen
                  ></iframe>
                  <div className="absolute inset-0 bg-black/20 pointer-events-none group-hover:bg-black/0 transition-all duration-500"></div>
                </div>
                
                <div className="mt-10 text-center space-y-6">
                  {videoBanner!.title && (
                    <motion.h1 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="text-3xl md:text-5xl font-black text-white leading-tight"
                    >
                      {videoBanner!.title}
                    </motion.h1>
                  )}
                  {videoBanner!.subtitle && (
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="text-lg md:text-xl text-white/70 font-medium max-w-3xl mx-auto"
                    >
                      {videoBanner!.subtitle}
                    </motion.p>
                  )}
                  {videoBanner!.link && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="pt-4"
                    >
                      <Link to={videoBanner!.link}>
                        <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-10 h-14 text-lg shadow-xl shadow-accent/20 transition-all font-bold rounded-2xl">
                          {t('common.viewDetails')}
                        </Button>
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : bannersToDisplay.length > 0 ? (
          <Swiper
            modules={[Navigation, Pagination, Autoplay, EffectFade]}
            effect="fade"
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            loop={bannersToDisplay.length > 1}
            className="h-[500px] md:h-[700px] w-full"
          >
            {bannersToDisplay.map((banner) => (
              <SwiperSlide key={banner.id}>
                <div className="relative w-full h-full">
                  <img 
                    src={banner.image} 
                    alt={banner.title} 
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${banner.id}/1920/1080`;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-center px-4">
                    <div className="max-w-4xl">
                      {banner.title && (
                        <motion.h1 
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8 }}
                          className="text-4xl md:text-7xl font-black text-white mb-6 leading-tight drop-shadow-2xl"
                        >
                          {banner.title}
                        </motion.h1>
                      )}
                      {banner.subtitle && (
                        <motion.p 
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className="text-lg md:text-2xl text-white/90 mb-10 font-medium drop-shadow-lg"
                        >
                          {banner.subtitle}
                        </motion.p>
                      )}
                      {banner.link && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.4 }}
                        >
                          <Link to={banner.link}>
                            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-10 h-16 text-xl shadow-2xl shadow-accent/20 transition-all font-bold rounded-2xl">
                              {t('common.viewDetails')}
                            </Button>
                          </Link>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="py-24 md:py-32">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            </div>
            <div className="container mx-auto px-4 relative z-10">
              <div className="text-center max-w-4xl mx-auto mb-20">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight text-gradient"
                >
                  {t('hero.title')}
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-xl md:text-2xl text-secondary mb-12 leading-relaxed max-w-3xl mx-auto font-medium"
                >
                  {t('hero.subtitle')}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-wrap justify-center gap-6"
                >
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-10 h-16 text-xl shadow-xl shadow-primary/20 transition-all font-bold rounded-2xl">
                    {t('common.joinUs')}
                  </Button>
                  <Button size="lg" variant="outline" className="border-border hover:bg-muted text-primary px-10 h-16 text-xl transition-all font-bold rounded-2xl">
                    {t('common.learnMore')}
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 relative z-10 mt-16 md:mt-24 pb-12 md:pb-24">
          <div className="text-center mb-16 space-y-4">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-accent/10 text-accent font-bold text-xs uppercase tracking-widest">
              {language === 'bn' ? 'আমাদের সামাজিক প্ল্যাটফর্মসমূহ' : 'Our Social Platforms'}
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-primary tracking-tight">
              {language === 'bn' ? 'সবার কল্যাণে আমাদের ১০টি সেবা খাত' : '10 Services Dedicated to Humanity'}
            </h2>
            <div className="w-16 h-1 bg-accent mx-auto rounded-full"></div>
            <p className="text-secondary font-medium max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
              {language === 'bn' 
                ? 'ইমপ্রুভমেন্ট বিডি সুবিধাবঞ্চিত ও অসহায় মানুষের সামগ্রিক মান উন্নয়নে ও সামাজিক শিক্ষা প্রসারে এই ১০টি অঙ্গ-প্ল্যাটফর্মের মাধ্যমে কাজ করে যাচ্ছে।'
                : 'Improvement BD is actively working across 10 specialized welfare domains to uplift underprivileged communities and foster professional development.'
              }
            </p>
          </div>

          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            spaceBetween={24}
            slidesPerView={1}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            navigation
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 }
            }}
            className="pb-14"
          >
            {platforms.map((platform, index) => (
              <SwiperSlide key={platform.slug}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * (index % 4) }}
                  className="h-full py-4"
                >
                  <Link to={`/${platform.slug}`} className="block h-full">
                    <Card className="h-[430px] bg-white border-border hover:border-accent/50 hover:shadow-2xl transition-all hover:-translate-y-2 group overflow-hidden rounded-[2rem] flex flex-col justify-between">
                      <CardHeader className="flex flex-col items-center text-center p-6 pb-2">
                        <div className="w-24 h-24 rounded-3xl overflow-hidden mb-6 shadow-md group-hover:shadow-xl transition-all bg-slate-50 border border-slate-100 flex items-center justify-center">
                          <img 
                            src={platform.logo} 
                            alt={platform.name} 
                            className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${platform.slug}/300/300`;
                            }}
                          />
                        </div>
                        <CardTitle className="text-xl font-bold text-primary group-hover:text-accent transition-colors line-clamp-1 mb-1">
                          {language === 'bn' ? platform.bnName : platform.name}
                        </CardTitle>
                        <CardDescription className="mt-1 line-clamp-3 text-xs md:text-sm text-secondary leading-relaxed font-medium px-1">
                          {language === 'bn' ? platform.bnDesc : platform.desc}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex justify-center pb-6">
                        <div className="flex items-center gap-2 text-accent font-bold opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 text-sm">
                          <span>{t('common.details')}</span>
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-20 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="text-center space-y-3">
              <div className="inline-flex p-4 rounded-2xl bg-slate-50 text-primary mb-2 shadow-sm">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="text-4xl font-extrabold text-primary">{stats.members}+</h3>
              <p className="text-xs font-bold text-secondary uppercase tracking-widest">
                {t('stats.activeMembers')}
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="inline-flex p-4 rounded-2xl bg-red-50 text-danger mb-2 shadow-sm">
                <Droplets className="h-7 w-7" />
              </div>
              <h3 className="text-4xl font-extrabold text-primary">{stats.donors}+</h3>
              <p className="text-xs font-bold text-secondary uppercase tracking-widest">
                {t('stats.bloodDonors')}
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="inline-flex p-4 rounded-2xl bg-blue-50 text-accent mb-2 shadow-sm">
                <Heart className="h-7 w-7" />
              </div>
              <h3 className="text-4xl font-extrabold text-primary">৫০০+</h3>
              <p className="text-xs font-bold text-secondary uppercase tracking-widest">
                {t('stats.serviceRecipients')}
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="inline-flex p-4 rounded-2xl bg-green-50 text-success mb-2 shadow-sm">
                <BookOpen className="h-7 w-7" />
              </div>
              <h3 className="text-4xl font-extrabold text-primary">{stats.books}+</h3>
              <p className="text-xs font-bold text-secondary uppercase tracking-widest">
                {t('stats.booksCollection')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 md:py-28 bg-background relative overflow-hidden">
        {/* Soft atmospheric background rings */}
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 md:gap-24">
            <div className="flex-1 relative">
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-accent/10 rounded-3xl -z-10 blur-xl"></div>
              <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-slate-900/10 rounded-3xl -z-10 blur-xl"></div>
              
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-slate-100 relative group">
                <img 
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800" 
                  alt="Community Action" 
                  className="w-full h-[400px] object-cover transition-all duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>

            <div className="flex-1 space-y-10">
              <div className="space-y-6">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-accent/10 text-accent font-bold text-xs uppercase tracking-widest">
                  {t('about.title')}
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-primary leading-tight tracking-tight">
                  {t('about.heading')}
                </h2>
                <p className="text-base md:text-lg text-secondary leading-relaxed font-medium">
                  {t('about.description')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="flex items-start gap-5 group">
                  <div className="p-3.5 rounded-2xl bg-red-50 text-danger shadow-sm group-hover:bg-red-100 transition-colors duration-300">
                    <Heart className="h-6 w-6" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-primary mb-1 text-base">{t('about.humanitarian')}</h5>
                    <p className="text-sm text-secondary leading-relaxed font-medium">{t('about.humanitarianDesc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-5 group">
                  <div className="p-3.5 rounded-2xl bg-blue-50 text-accent shadow-sm group-hover:bg-blue-100 transition-colors duration-300">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-primary mb-1 text-base">{t('about.unity')}</h5>
                    <p className="text-sm text-secondary leading-relaxed font-medium">{t('about.unityDesc')}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button size="lg" className="bg-primary hover:bg-primary/95 text-white px-12 h-14 shadow-xl shadow-primary/20 transition-all font-bold rounded-2xl hover:scale-105 active:scale-95 duration-300">
                  {t('common.readMore')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
