import React from 'react';
import { useLanguage } from '@/src/context/LanguageContext';
import GallerySection from '@/src/components/GallerySection';
import DonationModal from '@/src/components/DonationModal';
import { Baby, Stars, Heart } from 'lucide-react';

export default function KidsCare() {
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
             <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-indigo-900 flex items-center justify-center border-2 border-white/20 overflow-hidden shadow-2xl">
                <Baby className="h-12 w-12 md:h-16 md:w-16 text-pink-400" />
             </div>
          </div>
          <h1 className="text-3xl md:text-6xl font-extrabold mb-4 md:mb-6 tracking-tight">Kids Care</h1>
          <p className="text-lg md:text-xl opacity-80 max-w-2xl mx-auto leading-relaxed px-4 font-medium">
            শিশুদের সঠিক বিকাশ ও নিরাপদ আগামীর জন্য আমাদের এই উদ্যোগ।
          </p>
          
          <div className="mt-8 flex justify-center">
            <DonationModal platform="kidscare" platformName="Kids Care" />
          </div>
          
          <div className="max-w-4xl mx-auto mt-16 text-left bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/10 shadow-xl">
            <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
              <Stars className="h-5 w-5 text-yellow-400" />
              আমাদের সেবাসমূহ
            </h2>
            <p className="text-white/80 leading-relaxed text-sm md:text-base font-medium whitespace-pre-line">
              {language === 'bn' 
                ? `কিডস কেয়ার (Kids Care) একটি আধুনিক শিশু পরিচর্যা কেন্দ্র যেখানে আপনার সন্তানের নিরাপত্তা এবং সঠিক মানসিক বিকাশের দিকে সর্বোচ্চ গুরুত্ব দেওয়া হয়। 

আমাদের এখানে রয়েছে-
১. নিরাপদ ও পরিচ্ছন্ন পরিবেশ।
২. অভিজ্ঞ কেয়ারগিভার ও শিক্ষিকাবৃন্দ।
৩. খেলাধুলার মাধ্যমে শিক্ষা প্রদান।
৪. নিয়মিত স্বাস্থ্য ও পুষ্টি পর্যবেক্ষণ।

আমরা বিশ্বাস করি প্রতিটি শিশু একটি ফুলের মতো, যার সঠিক পরিচর্যা তাকে একটি সুন্দর ভবিষ্যতের দিকে এগিয়ে নিয়ে যাবে। আপনার সন্তানের সোনালী দিনগুলো নিশ্চিত করতে আমরা সর্বদা আপনাদের পাশে আছি।`
                : `Kids Care is a modern child care center where your child's safety and proper mental development are given top priority.

We have here-
1. Safe and clean environment.
2. Experienced caregivers and teachers.
3. Teaching through sports and play.
4. Regular health and nutrition monitoring.

We believe every child is like a flower, whose proper care will lead them to a bright future. We are always by your side to ensure your child's golden days.`
              }
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <GallerySection platform="kidscare" />

      {/* Summary */}
      <section className="py-20 bg-muted/5">
        <div className="container mx-auto px-4 text-center">
            <div className="flex justify-center gap-4 mb-8">
                <Heart className="h-10 w-10 text-pink-500" />
                <Stars className="h-10 w-10 text-yellow-500" />
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-primary mb-6">আপনার সন্তানের দ্বিতীয় বাড়ি</h2>
            <p className="text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
                আমরা আপনার অনুপস্থিতিতে আপনার সন্তানের তেমনি যত্ন নিই যেমনটা আপনি নেন। তাদের প্রতিটি মুহূর্ত কাটুক আনন্দে ও নিরাপদে।
            </p>
        </div>
      </section>
    </div>
  );
}
