import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/src/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Video, ChevronLeft, ChevronRight, CheckCircle2, Keyboard, Trophy, BookOpen } from 'lucide-react';
import MemberForm from '@/src/components/MemberForm';
import GallerySection from '@/src/components/GallerySection';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { collection, query, onSnapshot, where, orderBy } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Course {
  id: string;
  title: string;
  category: string;
  classLevel?: string; // New field
  description: string;
  images: string[];
  platform: 'it-education' | 'academic-care';
  features?: string[];
}

export default function EducationPage({ platform }: { platform: 'it-education' | 'academic-care' }) {
  const { language, t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeClass, setActiveClass] = useState('all'); // New filter
  const [categories, setCategories] = useState<string[]>([]);
  const courseSectionRef = useRef<HTMLElement>(null);

  const scrollToCourses = () => {
    courseSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const q = query(collection(db, 'courses'), where('platform', '==', platform), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const courseList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
      setCourses(courseList);
      
      // Extract unique categories
      const cats = Array.from(new Set(courseList.map(c => c.category)));
      setCategories(cats);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'courses');
    });
    return () => unsubscribe();
  }, [platform]);

  const isIT = platform === 'it-education';

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || course.category === activeCategory;
    const matchesClass = activeClass === 'all' || course.classLevel === activeClass;
    return matchesSearch && matchesCategory && matchesClass;
  });

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Hero */}
      <section className="bg-white py-8 md:py-12 border-b">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-4xl font-black text-[#8b0000] mb-6 md:mb-8">
            {isIT ? (language === 'bn' ? 'আইটি এডুকেশন কোর্সসমূহ' : 'IT Education Courses') : (language === 'bn' ? 'একাডেমিক কেয়ার কোর্সসমূহ' : 'Academic Care Courses')}
          </h1>

          {/* Welcome Message */}
          <div className="max-w-4xl mx-auto mb-10 text-left bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-4 right-4 z-10">
              <Button 
                onClick={scrollToCourses}
                className="bg-primary text-white hover:bg-primary/90 font-bold px-6 h-12 rounded-xl border-4 border-white shadow-xl flex items-center gap-2 group transition-all hover:scale-105"
              >
                <BookOpen className="h-5 w-5 group-hover:animate-bounce" />
                {language === 'bn' ? 'কোর্সসমূহ দেখুন' : 'See Courses'}
              </Button>
            </div>

            {isIT && (
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Keyboard className="h-24 w-24 text-primary" />
              </div>
            )}
            <h2 className="text-xl font-black text-primary mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#8b0000]" />
              {language === 'bn' ? 'শুভেচ্ছা বার্তা' : 'Welcome Message'}
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base font-medium mb-6">
              {isIT ? (
                language === 'bn' 
                ? `অতীতে ফিরে গিয়ে গল্পের শুরুটা পরিবর্তন করা হয়তো সম্ভব নয়, কিন্তু কঠোর পরিশ্রম আর দক্ষতার মাধ্যমে গল্পের শেষটা নতুন করে সাজানো অবশ্যই সম্ভব। মাত্র ২টি কম্পিউটার নিয়ে আমাদের যাত্রা শুরু হয়েছিল, আর আজ আলহামদুলিল্লাহ ৫০টিরও বেশি আধুনিক কম্পিউটারের সুবিধা নিয়ে আমরা আপনাদের সেবা দিয়ে যাচ্ছি।`
                : `We cannot change the past, but we can rewrite our future through hard work and determination. Our training center started with only 2 computers, and today we are proud to serve you with over 50 state-of-the-art computers.`
              ) : (
                language === 'bn'
                ? `একাডেমিক কেয়ারের প্রধান লক্ষ্য হচ্ছে প্রযুক্তিনির্ভর ও মানসম্মত শিক্ষাদানের মাধ্যমে শিক্ষার্থীদের মেধা ও আত্মবিশ্বাসের বিকাশ ঘটানো। আমাদের নিজস্ব ভবন ও চমৎকার ক্লাসরুমের পরিবেশ, শিক্ষকের নিবিড় মনোযোগ এবং উন্নত শিট শিক্ষার্থীদের ভালো ফলাফল অর্জনে সাহায্য করে।`
                : `Our academic care aims to foster intelligence and self-confidence through premium education. We combine personal teacher attention, specialized resources, and a great classroom setting to prepare students for academic success.`
              )}
            </p>
            {isIT && (
              <div className="flex flex-col sm:flex-row gap-4 items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm mb-4">
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="font-black text-primary mb-1">{language === 'bn' ? 'টাইপিং টেস্ট' : 'Typing Test'}</h4>
                  <p className="text-xs text-slate-500 font-bold">{language === 'bn' ? 'আপনার টাইপিং স্পিড পরীক্ষা করুন এবং নিজেকে ইমপ্রুভ করুন।' : 'Test your typing speed and improve yourself.'}</p>
                </div>
                <Link to="/typing-test">
                  <Button className="bg-[#8b0000] hover:bg-[#a00000] text-white font-bold px-8 rounded-xl h-12 shadow-lg shadow-red-900/10">
                    <Keyboard className="mr-2 h-5 w-5" /> {language === 'bn' ? 'টেস্ট শুরু করুন' : 'Start Test'}
                  </Button>
                </Link>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 items-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm">
              <div className="flex-1 text-center sm:text-left">
                <h4 className="font-black text-emerald-900 mb-1">{language === 'bn' ? 'অনলাইন এক্সাম সেন্টার' : 'Online Exam Center'}</h4>
                <p className="text-xs text-emerald-600 font-bold">{language === 'bn' ? 'আপনার মেধা যাচাই করুন এবং পরীক্ষার জন্য প্রস্তুতি নিন।' : 'Test your knowledge and prepare for exams.'}</p>
              </div>
              <Link to={`/exam-center/${platform}`}>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 rounded-xl h-12 shadow-lg shadow-emerald-900/10">
                  <Trophy className="mr-2 h-5 w-5" /> {language === 'bn' ? 'এক্সাম সেন্টারে যান' : 'Go to Exam Center'}
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Search & Filters */}
          <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                placeholder={language === 'bn' ? 'কোর্ড খুঁজুন...' : 'Search courses...'}
                className="pl-12 h-12 md:h-14 rounded-full border-slate-200 shadow-sm focus:ring-accent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                variant={activeCategory === 'all' ? 'default' : 'outline'}
                className={`rounded-full px-6 h-10 font-bold ${activeCategory === 'all' ? 'bg-[#8b0000] hover:bg-[#a00000]' : 'border-slate-200 text-slate-600'}`}
                onClick={() => setActiveCategory('all')}
              >
                {language === 'bn' ? 'সকল কোর্স' : 'All Courses'}
              </Button>
              {categories.map(cat => (
                <Button 
                  key={cat}
                  variant={activeCategory === cat ? 'default' : 'outline'}
                  className={`rounded-full px-6 h-10 font-bold ${activeCategory === cat ? 'bg-[#8b0000] hover:bg-[#a00000]' : 'border-slate-200 text-slate-600'}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </Button>
              ))}

              {!isIT && (
                <div className="w-full md:w-48">
                  <Select value={activeClass} onValueChange={setActiveClass}>
                    <SelectTrigger className="rounded-full h-11 border-slate-200 bg-white font-bold text-primary">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      <SelectItem value="Class 6">Class 6</SelectItem>
                      <SelectItem value="Class 7">Class 7</SelectItem>
                      <SelectItem value="Class 8">Class 8</SelectItem>
                      <SelectItem value="Class 9">Class 9</SelectItem>
                      <SelectItem value="Class 10">Class 10</SelectItem>
                      <SelectItem value="Class 11">Class 11</SelectItem>
                      <SelectItem value="Class 12">Class 12</SelectItem>
                      <SelectItem value="ADMISSION">ADMISSION</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Course Grid */}
      <section ref={courseSectionRef} className="py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-10 w-2 bg-accent rounded-full" />
            <h2 className="text-3xl font-black text-primary">
              {isIT ? (language === 'bn' ? 'সফটওয়্যার ও আইটি কোর্স' : 'Software & IT Courses') : (language === 'bn' ? 'একাডেমিক প্রোগ্রামসমূহ' : 'Academic Programs')}
              {!isIT && activeClass !== 'all' && <span className="text-accent ml-2">({activeClass})</span>}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredCourses.map(course => (
              <Card key={course.id} className="flex flex-col overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow rounded-2xl bg-white group">
                {/* Course Image with Icon Overlay */}
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img 
                    src={course.images?.[0] || 'https://picsum.photos/seed/course/800/600'} 
                    alt={course.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                    <div className="w-10 h-10 bg-[#8b0000] rounded-full flex items-center justify-center text-white shadow-lg">
                      <Video className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>

                <CardContent className="p-6 flex-1 flex flex-col">
                  {/* Title & Info */}
                  <div className="mb-2 flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-widest bg-slate-100">
                      {course.category}
                    </Badge>
                    {course.platform === 'academic-care' && course.classLevel && (
                      <Badge className="bg-accent text-white border-none font-bold">
                        {course.classLevel}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-2 min-h-[3.5rem]">
                    {course.title}
                  </h3>

                  {/* Features List */}
                  <ul className="space-y-2 mb-8 flex-1">
                    {course.features?.slice(0, 5).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                        <CheckCircle2 className="h-4 w-4 text-[#8b0000] shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {(!course.features || course.features.length === 0) && (
                      <li className="text-sm text-slate-400 italic">No features listed.</li>
                    )}
                  </ul>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <Link to={`/course/${course.id}`}>
                      <Button variant="outline" className="w-full border-slate-200 text-slate-700 font-bold h-11 rounded-lg hover:bg-slate-50">
                        {language === 'bn' ? 'প্রোগ্রাম দেখুন' : 'View Program'}
                      </Button>
                    </Link>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-[#8b0000] hover:bg-[#a00000] text-white font-bold h-11 rounded-lg shadow-md shadow-red-900/10">
                          {language === 'bn' ? 'এনরোল করুন' : 'Enroll Now'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-none bg-white rounded-3xl">
                        <MemberForm platform={platform} platformName={course.title} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredCourses.length === 0 && (
            <div className="text-center py-32 bg-white rounded-3xl shadow-sm border border-slate-100">
              <div className="inline-flex p-6 bg-slate-50 rounded-full mb-6">
                <Search className="h-12 w-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">কোন কোর্স পাওয়া যায়নি</h3>
              <p className="text-slate-500">আপনার সার্চ বা ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।</p>
            </div>
          )}

          {/* Pagination UI */}
          {filteredCourses.length > 0 && (
            <div className="mt-16 flex justify-center items-center gap-4">
              <Button variant="outline" size="icon" className="rounded-lg border-slate-200 disabled:opacity-50" disabled>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex gap-2">
                <Button variant="default" className="w-10 h-10 p-0 bg-[#8b0000] hover:bg-[#a00000] font-bold rounded-lg">1</Button>
                <Button variant="outline" className="w-10 h-10 p-0 border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50">2</Button>
              </div>
              <Button variant="outline" size="icon" className="rounded-lg border-slate-200">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </section>

      <GallerySection platform={platform} />
    </div>
  );
}
