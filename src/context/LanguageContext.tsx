import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'bn' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  bn: {
    'nav.home': 'হোম',
    'nav.foundation': 'ফাউন্ডেশন',
    'nav.bloodBank': 'ব্লাড ব্যাংক',
    'nav.foodBank': 'ফুড ব্যাংক',
    'nav.sportingClub': 'স্পোর্টিং ক্লাব',
    'nav.itEducation': 'আইটি এডুকেশন',
    'nav.academicCare': 'একাডেমিক কেয়ার',
    'nav.library': 'লাইব্রেরি',
    'nav.rehabilitation': 'পুনর্বাসন কেন্দ্র',
    'nav.kidscare': 'কিডস কেয়ার',
    'nav.admin': 'অ্যাডমিন',
    'hero.title': 'Improvement BD',
    'hero.subtitle': 'সেবার মাধ্যমে সমাজ পরিবর্তন',
    'common.learnMore': 'আরো জানুন',
    'common.newMember': 'নতুন সদস্য হিসেবে যোগ দিন',
    'common.submit': 'জমা দিন',
    'common.loading': 'অপেক্ষা করুন...',
    'common.details': 'বিস্তারিত',
    'common.readMore': 'বিস্তারিত পড়ুন',
    'common.viewDetails': 'বিস্তারিত দেখুন',
    'common.joinUs': 'আমাদের সাথে যুক্ত হন',
    'stats.activeMembers': 'সক্রিয় সদস্য',
    'stats.bloodDonors': 'রক্তদাতা',
    'stats.serviceRecipients': 'সেবা গ্রহীতা',
    'stats.booksCollection': 'বই সংগ্রহ',
    'about.title': 'আমাদের সম্পর্কে',
    'about.heading': 'সমাজের ইতিবাচক পরিবর্তনে আমরা অঙ্গীকারবদ্ধ',
    'about.description': 'ইম্প্রুভমেন্ট বিডি একটি অলাভজনক সামাজিক সংগঠন যা সমাজের বিভিন্ন স্তরে ইতিবাচক পরিবর্তন আনতে কাজ করে যাচ্ছে। আমাদের বিভিন্ন প্ল্যাটফর্মের মাধ্যমে আমরা শিক্ষা, স্বাস্থ্য, এবং মানবিক সহায়তায় নিবেদিত।',
    'about.humanitarian': 'মানবিক সেবা',
    'about.humanitarianDesc': 'অসহায় মানুষের পাশে দাঁড়ানো আমাদের মূল লক্ষ্য।',
    'about.unity': 'একতা',
    'about.unityDesc': 'সবাই মিলে একটি সুন্দর সমাজ গড়ার প্রত্যয়।',
    'blood.giveBlood': 'রক্ত দিন',
    'blood.findDonor': 'রক্তদাতা খুঁজুন',
    'library.takeBook': 'বই নিন',
    'library.newMember': 'নতুন সদস্য হন',
  },
  en: {
    'nav.home': 'Home',
    'nav.foundation': 'Foundation',
    'nav.bloodBank': 'Blood Bank',
    'nav.foodBank': 'Food Bank',
    'nav.sportingClub': 'Sporting Club',
    'nav.itEducation': 'IT Education',
    'nav.academicCare': 'Academic Care',
    'nav.library': 'Library',
    'nav.rehabilitation': 'Rehabilitation',
    'nav.kidscare': 'Kids Care',
    'nav.admin': 'Admin',
    'hero.title': 'Improvement BD',
    'hero.subtitle': 'Changing Society Through Service',
    'common.learnMore': 'Learn More',
    'common.newMember': 'Add New Member',
    'common.submit': 'Submit',
    'common.loading': 'Loading...',
    'common.details': 'Details',
    'common.readMore': 'Read More',
    'common.viewDetails': 'View Details',
    'common.joinUs': 'Join Us Now',
    'stats.activeMembers': 'Active Members',
    'stats.bloodDonors': 'Blood Donors',
    'stats.serviceRecipients': 'Service Recipients',
    'stats.booksCollection': 'Books Collection',
    'about.title': 'About Us',
    'about.heading': 'Committed to Positive Social Change',
    'about.description': 'Improvement BD is a non-profit social organization working to bring positive change at various levels of society. Through our various platforms, we are dedicated to education, health, and humanitarian aid.',
    'about.humanitarian': 'Humanitarian Service',
    'about.humanitarianDesc': 'Standing by helpless people is our main goal.',
    'about.unity': 'Unity',
    'about.unityDesc': 'A commitment to building a beautiful society together.',
    'blood.giveBlood': 'Donate Blood',
    'blood.findDonor': 'Find Donor',
    'library.takeBook': 'Take Book',
    'library.newMember': 'Become a Member',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('bn');

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations['bn']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
