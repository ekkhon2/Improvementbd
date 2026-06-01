import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/src/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Clock, ChevronLeft, CheckCircle2, Play, ExternalLink, Share2, Info, BookOpen, GraduationCap, Trophy } from 'lucide-react';
import MemberForm from '@/src/components/MemberForm';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  images: string[];
  platform: 'it-education' | 'academic-care';
  duration?: string;
  price?: string;
  features?: string[];
  syllabus?: string[];
  achievements?: string[];
  promoVideoUrl?: string;
  demoPlaylistUrl?: string;
  instructorName?: string;
  instructorPhoto?: string;
  instructorExperience?: string;
}

export default function CourseDetails() {
  const { id } = useParams();
  const { language, t } = useLanguage();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchCourse = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'courses', id));
        if (docSnap.exists()) {
          setCourse({ id: docSnap.id, ...docSnap.data() } as Course);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `courses/${id}`);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const getYoutubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    let videoId = '';
    if (url.includes('v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b0000]"></div>
          <p className="text-slate-400 font-bold animate-pulse">Loading Course Details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
        <div className="text-center space-y-6">
          <div className="inline-flex p-6 bg-red-50 rounded-full">
            <Info className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-900">Course not found</h2>
          <Link to="/">
            <Button className="bg-[#8b0000] hover:bg-[#a00000] rounded-xl h-12 px-8 font-bold">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isIT = course.platform === 'it-education';
  const promoEmbedUrl = getYoutubeEmbedUrl(course.promoVideoUrl);

  return (
    <div className="min-h-screen bg-white">
      {/* Minimalist Header */}
      <div className="border-b sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link to={isIT ? '/it-education' : '/academic-care'} className="flex items-center text-slate-500 hover:text-slate-900 font-bold transition-colors group">
            <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-slate-100 mr-2 transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </div>
            {language === 'bn' ? 'পিছনে যান' : 'Back'}
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10 md:gap-16">
          {/* Mobile Enrollment Section (Top) */}
          <div className="lg:hidden order-first">
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white ring-1 ring-slate-100">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={course.images?.[0] || 'https://picsum.photos/seed/course/800/600'} 
                  alt="" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer" 
                />
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Investment</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{course.price || '৳ ৫,০০০'}</h3>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-600 border-none font-black px-3 py-1 rounded-full text-[10px]">
                    BEST VALUE
                  </Badge>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full h-14 text-lg font-black rounded-2xl shadow-lg shadow-[#8b0000]/20 bg-[#8b0000] hover:bg-[#a00000] text-white">
                      Enroll Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl p-0 border-none bg-white rounded-3xl max-h-[90vh] overflow-y-auto">
                    <MemberForm platform={course.platform} platformName={`${course.title} Enrollment`} />
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          </div>

          {/* Left Column: Content */}
          <div className="lg:col-span-7 space-y-10 md:space-y-16 lg:order-1">
            {/* Title Section */}
            <div className="space-y-4 md:space-y-6">
              <Badge className="bg-[#8b0000]/10 text-[#8b0000] border-none px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] rounded-full">
                {course.category}
              </Badge>
              <h1 className="text-3xl md:text-6xl font-black text-slate-900 leading-[1.1]">
                {course.title}
              </h1>
              <div className="flex flex-wrap gap-6 md:gap-8 pt-2 md:pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                    <p className="font-bold text-slate-900">{course.duration || '3 Months'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                    <p className="font-bold text-emerald-600">Enrollment Open</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Promo Video Section */}
            {promoEmbedUrl && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <Play className="h-6 w-6 text-[#8b0000]" />
                  {language === 'bn' ? 'কোর্স পরিচিতি ভিডিও' : 'Course Introduction Video'}
                </h2>
                <div className="aspect-video rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200 bg-slate-900 border-8 border-white">
                  <iframe 
                    src={promoEmbedUrl}
                    className="w-full h-full"
                    allowFullScreen
                    title="Course Promo Video"
                  />
                </div>
              </div>
            )}

            {/* Course Content Tabs */}
            <div className="space-y-8">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0 gap-8">
                  <TabsTrigger 
                    value="overview" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-[#8b0000] rounded-none px-0 py-4 text-xl font-black text-slate-400 data-[state=active]:text-slate-900 transition-all"
                  >
                    {language === 'bn' ? 'কোর্স ওভারভিউ' : 'Course Overview'}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="syllabus" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-[#8b0000] rounded-none px-0 py-4 text-xl font-black text-slate-400 data-[state=active]:text-slate-900 transition-all"
                  >
                    {language === 'bn' ? 'সিলেবাস' : 'Syllabus'}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="achievements" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-[#8b0000] rounded-none px-0 py-4 text-xl font-black text-slate-400 data-[state=active]:text-slate-900 transition-all"
                  >
                    {language === 'bn' ? 'অর্জনসমূহ' : 'Achievements'}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="pt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: course.description }} />
                </TabsContent>

                <TabsContent value="syllabus" className="pt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6">
                      <BookOpen className="h-6 w-6 text-[#8b0000]" />
                      {language === 'bn' ? 'কোর্স কন্টেন্ট' : 'Course Content'}
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {(course.syllabus && course.syllabus.length > 0 ? course.syllabus : ['No syllabus added yet']).map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-slate-700">
                          <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-xs font-black text-[#8b0000]">
                            {String(i + 1).padStart(2, '0')}
                          </div>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="achievements" className="pt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                      {language === 'bn' ? 'কোর্স শেষে যা করতে পারবেন' : 'What You Will Achieve'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(course.achievements && course.achievements.length > 0 ? course.achievements : ['No achievements listed yet']).map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 font-bold text-slate-700">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Features (Legacy/Other) */}
            {course.features && course.features.length > 0 && (
              <div className="space-y-8 pt-8 border-t border-slate-100">
                <h2 className="text-2xl font-black text-slate-900">
                  {language === 'bn' ? 'অন্যান্য বৈশিষ্ট্যসমূহ' : "Other Features"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {course.features.map((feature, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-4 p-6 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-[#8b0000]/20 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 group-hover:bg-[#8b0000] transition-colors">
                        <CheckCircle2 className="h-4 w-4 text-[#8b0000] group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-slate-700 font-bold">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructor Section */}
            {course.instructorName && (
              <div className="space-y-8 pt-12 border-t-2 border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-2 bg-accent rounded-full" />
                  <div>
                    <h2 className="text-3xl font-black text-primary tracking-tight">
                      {language === 'bn' ? 'কোর্স ইন্সট্রাক্টর' : 'Course Instructor'}
                    </h2>
                    <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">Expert Guidance for Your Success</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-white/50 rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center gap-8 md:gap-12 group transition-all hover:shadow-2xl hover:shadow-slate-300/50 relative overflow-hidden">
                   {/* Decorative background circle */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-accent/10 transition-colors" />
                  
                  <div className="relative">
                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl rotate-3 group-hover:rotate-0 transition-all duration-500 shrink-0">
                      <img 
                        src={course.instructorPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructorName}`} 
                        alt={course.instructorName} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {/* Badge on photo */}
                    <div className="absolute -bottom-2 -right-2 bg-accent text-white p-3 rounded-2xl shadow-xl">
                       <GraduationCap className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="text-center md:text-left space-y-4 relative z-10 flex-1">
                    <div>
                      <h3 className="text-3xl md:text-4xl font-black text-primary tracking-tight mb-2">{course.instructorName}</h3>
                      <Badge className="bg-primary text-white border-none font-black px-4 py-1 rounded-full text-xs">SENIOR MENTOR</Badge>
                    </div>
                    
                    <div className="space-y-4">
                      <p className="text-slate-600 font-medium text-lg leading-relaxed italic">
                        "{course.instructorExperience}"
                      </p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        {[
                          { label: 'Verified Instructor', icon: CheckCircle2 },
                          { label: 'Industry Expert', icon: Trophy },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl shadow-sm border border-slate-100">
                             <item.icon className="h-4 w-4 text-emerald-500" />
                             <span className="text-xs font-bold text-slate-500">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Sidebar (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-5 lg:order-2">
            <div className="sticky top-32 space-y-8">
              <Card className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[2.5rem] overflow-hidden bg-white ring-1 ring-slate-100">
                <div className="aspect-[16/10] overflow-hidden">
                  <img 
                    src={course.images?.[0] || 'https://picsum.photos/seed/course/800/600'} 
                    alt="" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
                <div className="p-10 space-y-8">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Investment</p>
                      <h3 className="text-5xl font-black text-slate-900 tracking-tight">{course.price || '৳ ৫,০০০'}</h3>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-600 border-none font-black px-4 py-1.5 rounded-full mb-1">
                      BEST VALUE
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full h-16 text-xl font-black rounded-2xl shadow-xl shadow-[#8b0000]/20 bg-[#8b0000] hover:bg-[#a00000] text-white transition-all hover:scale-[1.02] active:scale-95">
                          Enroll Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl p-0 border-none bg-white rounded-3xl max-h-[90vh] overflow-y-auto">
                        <MemberForm platform={course.platform} platformName={`${course.title} Enrollment`} />
                      </DialogContent>
                    </Dialog>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {course.demoPlaylistUrl && (
                        <Button 
                          variant="outline" 
                          className="h-14 font-black rounded-2xl border-2 border-slate-100 hover:bg-slate-50 text-slate-700 gap-2"
                          onClick={() => window.open(course.demoPlaylistUrl, '_blank')}
                        >
                          <Play className="h-4 w-4 fill-current" />
                          Demo Class
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        className={`h-14 font-black rounded-2xl border-2 border-slate-100 hover:bg-slate-50 text-slate-700 gap-2 ${!course.demoPlaylistUrl ? 'col-span-2' : ''}`}
                        onClick={() => {
                          const msg = encodeURIComponent(`Hello! I'm interested in the ${course.title} course. Can I get more details?`);
                          const whatsappNumber = isIT ? '8801711157183' : '8801518975474';
                          window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, '_blank');
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Inquiry
                      </Button>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-100 space-y-4">
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span className="text-slate-400 uppercase tracking-widest text-[10px]">Access</span>
                      <span className="text-slate-900">Lifetime</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span className="text-slate-400 uppercase tracking-widest text-[10px]">Support</span>
                      <span className="text-slate-900">24/7 Q&A</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span className="text-slate-400 uppercase tracking-widest text-[10px]">Certificate</span>
                      <span className="text-slate-900">Verified</span>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="relative z-10">
                  <h4 className="text-xl font-black mb-2">Need Guidance?</h4>
                  <p className="text-white/60 text-sm font-medium mb-6 leading-relaxed">
                    Not sure if this course is right for you? Talk to our expert mentors for a free consultation.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <Play className="h-5 w-5 text-white fill-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Chat with Advisor</p>
                      <a 
                        href={`https://wa.me/${isIT ? '8801711157183' : '8801518975474'}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-lg font-black tracking-tight hover:text-accent transition-colors"
                      >
                        {isIT ? '01711157183' : '01518975474'}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
