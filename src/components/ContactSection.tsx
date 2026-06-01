import React from 'react';
import { useLanguage } from '@/src/context/LanguageContext';
import { Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContactInfo {
  nameBn: string;
  nameEn: string;
  phone: string;
  titleBn: string;
  titleEn: string;
}

const PLATFORM_CONTACTS: Record<string, ContactInfo> = {
  foundation: {
    nameBn: 'হীরা',
    nameEn: 'Hira',
    phone: '01625230727',
    titleBn: 'ইমপ্রুভমেন্ট ফাউন্ডেশন (Improvement Foundation)',
    titleEn: 'Improvement Foundation',
  },
  'food-bank': {
    nameBn: 'ফয়সাল',
    nameEn: 'Faisal',
    phone: '01953568902',
    titleBn: 'ফুড ব্যাংক (Food Bank)',
    titleEn: 'Food Bank',
  },
  'sporting-club': {
    nameBn: 'সানজিদ',
    nameEn: 'Sanjid',
    phone: '01677188605',
    titleBn: 'স্পোর্টিং ক্লাব (Sporting Club)',
    titleEn: 'Sporting Club',
  },
  'blood-bank': {
    nameBn: 'রকিব',
    nameEn: 'Rakib',
    phone: '01971814623',
    titleBn: 'ব্লাড ব্যাংক (Blood Bank)',
    titleEn: 'Blood Bank',
  },
  'poor-fund': {
    nameBn: 'অপূর্ব',
    nameEn: 'Apurbo',
    phone: '01981159811',
    titleBn: 'দরিদ্র তহবিল (Poor Fund)',
    titleEn: 'Poor Fund',
  },
  'academy': {
    nameBn: 'ইমাম',
    nameEn: 'Emam',
    phone: '01518975474',
    titleBn: 'একাডেমিক কেয়ার (Academic Care)',
    titleEn: 'Academic Care',
  },
  'it-education': {
    nameBn: 'নাদিম',
    nameEn: 'Nadim',
    phone: '01711157183',
    titleBn: 'আইটি এডুকেশন (IT Education)',
    titleEn: 'IT Education',
  },
  'library': {
    nameBn: 'ইমাম',
    nameEn: 'Emam',
    phone: '01518975474',
    titleBn: 'লাইব্রেরি (Library)',
    titleEn: 'Library',
  },
  'kidscare': {
    nameBn: 'আল আমিন',
    nameEn: 'Al Amin',
    phone: '01722338719',
    titleBn: 'কিডস কেয়ার (Kids Care)',
    titleEn: 'Kids Care',
  },
  'rehabilitation': {
    nameBn: 'আশিক',
    nameEn: 'Ashik',
    phone: '01981159811',
    titleBn: 'পুনর্বাসন কেন্দ্র (Rehabilitation Center)',
    titleEn: 'Rehabilitation Center',
  },
};

export default function ContactSection({ platform }: { platform: string }) {
  const { language } = useLanguage();
  const contact = PLATFORM_CONTACTS[platform];

  if (!contact) return null;

  const displayName = language === 'bn' ? contact.nameBn : contact.nameEn;
  const displayTitle = language === 'bn' ? contact.titleBn : contact.titleEn;
  const cleanPhoneForWa = contact.phone.startsWith('0') ? `88${contact.phone}` : contact.phone;

  return (
    <section className="py-16 bg-white border-t border-slate-100">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-slate-50 rounded-[2.5rem] p-8 md:p-12 border border-slate-150/80 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Phone className="h-32 w-32 text-primary" />
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-4 text-center md:text-left">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-accent/10 text-accent font-bold text-xs uppercase tracking-widest">
                {language === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}
              </span>
              
              <h3 className="text-2xl md:text-3xl font-black text-primary tracking-tight">
                {language === 'bn' 
                  ? `${displayTitle} এর সাথে সরাসরি যোগাযোগ করুন`
                  : `Connect with ${displayTitle} Directly`
                }
              </h3>
              
              <p className="text-secondary font-medium text-sm md:text-base max-w-xl">
                {language === 'bn'
                  ? `আমাদের এই প্ল্যাটফর্মের পরিচালনা ও সার্বিক তত্ত্ববধানে রয়েছেন আমাদের প্রতিনিধি। যেকোনো প্রশ্ন বা জরুরি প্রয়োজনে সরাসরি কল বা হোয়াটস্যাপে মেসেজ করুন।`
                  : `Our representative is available to assist you with operations, inquiries, and immediate support. Feel free to reach out via phone call or WhatsApp.`
                }
              </p>

              <div className="pt-2">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-slate-200/60 shadow-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs font-bold text-secondary uppercase tracking-widest">
                    {language === 'bn' ? `প্রধান সমন্বয়ক: ${displayName}` : `Coordinator: ${displayName}`}
                  </p>
                  <p className="text-slate-400 font-mono text-xs">|</p>
                  <p className="text-sm font-black text-primary font-mono">{contact.phone}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto shrink-0">
              <Button
                variant="outline"
                className="w-full sm:w-auto border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white font-bold h-14 px-8 rounded-2xl shadow-lg shadow-emerald-500/5 transition-all gap-2"
                onClick={() => window.open(`https://wa.me/${cleanPhoneForWa}`, '_blank')}
              >
                <MessageSquare className="h-5 w-5" />
                {language === 'bn' ? 'হোয়াটস্যাপ করুন' : 'WhatsApp'}
              </Button>
              <Button
                className="w-full sm:w-auto bg-primary text-white hover:bg-primary/95 font-bold h-14 px-8 rounded-2xl shadow-lg shadow-primary/10 transition-all gap-2"
                onClick={() => window.open(`tel:${contact.phone}`)}
              >
                <Phone className="h-5 w-5" />
                {language === 'bn' ? 'সরাসরি কল করুন' : 'Call Now'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
