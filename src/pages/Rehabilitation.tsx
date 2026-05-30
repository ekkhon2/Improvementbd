import React from 'react';
import { useLanguage } from '@/src/context/LanguageContext';
import GallerySection from '@/src/components/GallerySection';
import DonationModal from '@/src/components/DonationModal';
import { Heart, Home, ShieldCheck } from 'lucide-react';

export default function Rehabilitation() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-slate-900 text-white py-12 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex mb-6 md:mb-8 p-1 bg-white/10 rounded-[2.5rem] backdrop-blur-sm">
             <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-slate-800 flex items-center justify-center border-2 border-white/20 overflow-hidden shadow-2xl">
                <Home className="h-12 w-12 md:h-16 md:w-16 text-accent" />
             </div>
          </div>
          <h1 className="text-3xl md:text-6xl font-extrabold mb-4 md:mb-6 tracking-tight">ইমপ্রুভমেন্ট বৃদ্ধাশ্রম ও পুনর্বাসন কেন্দ্র</h1>
          <p className="text-lg md:text-xl opacity-80 max-w-2xl mx-auto leading-relaxed px-4 font-medium">
            (Improvement Rehabilitation Center & Old Age Home)
          </p>
          
          <div className="mt-8 flex justify-center">
            <DonationModal platform="rehabilitation" platformName={language === 'bn' ? 'পুনর্বাসন কেন্দ্র' : 'Rehabilitation'} />
          </div>
          
          <div className="max-w-4xl mx-auto mt-16 text-left bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/10 shadow-xl">
            <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-accent" />
              আমাদের লক্ষ্য ও উদ্দেশ্য
            </h2>
            <p className="text-white/80 leading-relaxed text-sm md:text-base font-medium whitespace-pre-line">
              {language === 'bn' 
                ? `ইমপ্রুভমেন্ট বৃদ্ধাশ্রম ও পুনর্বাসন কেন্দ্র মূলত সেইসব প্রবীণদের জন্য যারা জীবনের শেষ সময়ে এসে একটু শান্তি এবং সুচিকিৎসার প্রত্যাশা করেন। আমরা বিশ্বাস করি প্রতিটি প্রবীণ ব্যক্তি সম্মানের সাথে বেঁচে থাকার অধিকার রাখেন। 

এখানে আমরা তাদেরকে শুধু থাকার জায়গাই দিই না, বরং একটি পরিবারের মতো পরিবেশ প্রদান করি যেখানে তারা নিজেদের আপনজন মনে করতে পারেন। সুষম খাবার, নিয়মিত স্বাস্থ্য পরীক্ষা এবং বিনোদনের ব্যবস্থা রাখা হয়েছে আমাদের এই কেন্দ্রে।

আমাদের মূল উদ্দেশ্য হচ্ছে অবহেলিত এবং নিঃসঙ্গ প্রবীণদের মুখে হাসি ফোটানো এবং তাদের জীবনের শেষ সময়টুকু আনন্দময় করে তোলা।`
                : `Improvement Rehabilitation Center & Old Age Home is primarily for those seniors who expect a little peace and good treatment at the end of their lives. We believe every senior has the right to live with dignity.

Here we don't just provide them a place to stay, but provide a family-like environment where they can feel at home. Balanced food, regular health check-ups and entertainment arrangements have been kept in our center.

Our main objective is to bring smiles to the faces of neglected and lonely seniors and make the last period of their lives joyful.`
              }
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <GallerySection platform="rehabilitation" />

      {/* Philosophy */}
      <section className="py-20 bg-muted/5">
        <div className="container mx-auto px-4 text-center">
            <Heart className="h-12 w-12 text-rose-500 mx-auto mb-6 animate-pulse" />
            <h2 className="text-2xl md:text-4xl font-black text-primary mb-6">সেবাই যেখানে পরম ধর্ম</h2>
            <p className="text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
                পরিত্যক্ত নয়, পরম মমতায় আগলে রাখি আমরা। আমাদের প্রতিটি সদস্য আমাদের পরিবারের অংশ। তাদের সুস্বাস্থ্য ও মানসিক প্রশান্তিই আমাদের মূল লক্ষ্য।
            </p>
        </div>
      </section>
    </div>
  );
}
