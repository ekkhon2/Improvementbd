import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import GallerySection from '../components/GallerySection';
import DonationModal from '../components/DonationModal';
import { Heart, Coins, Gift, ShieldAlert } from 'lucide-react';

export default function PoorFund() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-slate-900 text-white py-16 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex mb-6 md:mb-8 p-1 bg-white/10 rounded-[2.5rem] backdrop-blur-sm">
             <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-rose-950 flex items-center justify-center border-2 border-white/20 overflow-hidden shadow-2xl">
                <Coins className="h-12 w-12 md:h-16 md:w-16 text-accent" />
             </div>
          </div>
          <h1 className="text-3xl md:text-6xl font-extrabold mb-4 md:mb-6 tracking-tight">
            {language === 'bn' ? 'দরিদ্র তহবিল (Poor Fund)' : 'Poor Fund'}
          </h1>
          <p className="text-lg md:text-xl opacity-80 max-w-2xl mx-auto leading-relaxed px-4 font-medium">
            {language === 'bn' 
              ? 'অসহায়, নিঃস্ব এবং দুস্থ মানুষের তাৎক্ষণিক পাশে দাঁড়াতে এবং মৌলিক চাহিদা পূরণে আমাদের বিশেষ তহবিল।' 
              : 'Our special welfare fund to provide immediate support and basic necessities to the underprivileged and helpless people.'}
          </p>

          <div className="mt-10 flex justify-center">
            <DonationModal platform="poor-fund" platformName={language === 'bn' ? 'দরিদ্র তহবিল' : 'Poor Fund'} />
          </div>
          
          <div className="max-w-4xl mx-auto mt-16 text-left bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/10 shadow-xl">
            <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
              <Gift className="h-5 w-5 text-accent animate-bounce" />
              {language === 'bn' ? 'তহবিলের উদ্দেশ্য ও কার্যকারিতা' : 'Our Mission & Objective'}
            </h2>
            <p className="text-white/80 leading-relaxed text-sm md:text-base font-medium whitespace-pre-line">
              {language === 'bn' 
                ? `ইমপ্রুভমেন্ট বিডির দরিদ্র তহবিল (Poor Fund) মূলত সমাজের পিছিয়ে পড়া, অতিদরিদ্র এবং জরুরি চিকিৎসা বা আর্থিক সংকটে পড়া মানুষের পাশে দাঁড়ানোর জন্য গঠিত হয়েছে। 

এই তহবিলের সুবিধা সমূহ:
১. জটিল রোগে আক্রান্ত রোগীদের জরুরি চিকিৎসায় আর্থিক সহায়তা প্রদান।
২. গৃহহীন ও অতিদরিদ্র পরিবারকে শীতবস্ত্র ও খাদ্য সামগ্রী বিতরণ।
৩. মেধাবী কিন্তু অসচ্ছল শিক্ষার্থীদের শিক্ষা সামগ্রী ও পড়াশোনা চালিয়ে নেওয়ার খরচ যোগান।
৪. হঠাৎ নেমে আসা দুর্যোগ বা প্রাকৃতিক সংকটে দুর্গতদের তাৎক্ষণিক পুনর্বাসন ও ত্রাণ প্রদান।

আমরা কোনো প্রাতিষ্ঠানিক সদস্য ফি বা বাঁধাধরা মাসিক বিল দিয়ে এটি পরিচালনা করিনা। এটি পুরোপুরি আপনাদের দেওয়া সদকা, দান এবং সহমর্মিতাপূর্ণ ভালোবাসায় পরিচালিত হয়।`
                : `Improvement BD's Poor Fund is established primarily to assist marginalized, destitute, and financially helpless individuals facing medical or livelihood emergencies.

Key Focus Areas:
1. Providing financial medical aid for critical patients.
2. Distributing winter clothes and food support to families in extreme poverty.
3. Funding education fees and study supplies for talented, underprivileged students.
4. Immediate disaster relief and structural rehabilitation during unexpected crises.

This fund operates purely on your voluntary charity, Sadakah, and compassionate contributions without any mandatory subscription fees.`
              }
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-primary tracking-tight">
            {language === 'bn' ? 'তহবিলের বিগত কার্যক্রম ও গ্যালারি' : 'Past Activities & Gallery'}
          </h2>
          <p className="text-slate-500 font-medium mt-2">
            {language === 'bn' ? 'আমাদের বিতরণ ও সমাজসেবামূলক কিছু খণ্ডচিত্র' : 'Glances of our charitable distributions and operations'}
          </p>
        </div>
        <GallerySection platform="poor-fund" />
      </div>

      {/* Trust & Transparency */}
      <section className="py-20 bg-muted/5 border-t">
        <div className="container mx-auto px-4 text-center max-w-3xl">
            <ShieldAlert className="h-12 w-12 text-[#8b0000] mx-auto mb-6" />
            <h2 className="text-2xl md:text-4xl font-black text-primary mb-6">
              {language === 'bn' ? 'শতভাগ স্বচ্ছতা ও জবাবদিহিতা' : '100% Transparency & Accountability'}
            </h2>
            <p className="text-slate-600 font-medium leading-relaxed">
              {language === 'bn' 
                ? 'আপনার দেওয়া প্রতিটি পয়সা অসহায় মানুষের কল্যাণে ব্যয় করা হয়। আমাদের সকল আয় ও ব্যয়ের তালিকা নিয়মিত আমাদের ফেসবুক পেইজ এবং অডিট রিপোর্টে প্রকাশ করা হয়। আপনার সামান্য দান ফিরিয়ে দিতে পারে কারো হারানো মুখের হাসি।' 
                : 'Every single penny you contribute is spent directly on the welfare of those in need. All income and expenditure reports are regularly published for high transparency. Your small gesture can bring back a smile.'}
            </p>
        </div>
      </section>
    </div>
  );
}
