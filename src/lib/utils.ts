import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface ContactInfo {
  nameBn: string;
  nameEn: string;
  phone: string;
}

export const PLATFORM_CONTACTS: Record<string, ContactInfo> = {
  foundation: { nameBn: 'হীরা', nameEn: 'Hira', phone: '01625230727' },
  'food-bank': { nameBn: 'ফয়সাল', nameEn: 'Faisal', phone: '01953568902' },
  'sporting-club': { nameBn: 'সানজিদ', nameEn: 'Sanjid', phone: '01677188605' },
  'blood-bank': { nameBn: 'রাকিব', nameEn: 'Rakib', phone: '01971814623' },
  'poor-fund': { nameBn: 'অপূর্ব', nameEn: 'Apurbo', phone: '01981159811' },
  'academic-care': { nameBn: 'ইমাম', nameEn: 'Emam', phone: '01518975474' },
  'it-education': { nameBn: 'নাদিম', nameEn: 'Nadim', phone: '01711157183' },
  library: { nameBn: 'ইমাম', nameEn: 'Emam', phone: '01518975474' },
  kidscare: { nameBn: 'আল আমিন', nameEn: 'Al Amin', phone: '01722338719' },
  rehabilitation: { nameBn: 'আশিক', nameEn: 'Ashik', phone: '01981159811' },
};

export function getPlatformContact(platform: string): ContactInfo {
  // Normalize platform string if needed
  let key = platform.toLowerCase().trim();
  if (key === 'academy') key = 'academic-care';
  if (key === 'it') key = 'it-education';
  if (key === 'library') key = 'library';
  if (key === 'kids re care' || key === 'kidscare') key = 'kidscare';
  if (key === 'rehabilitation center' || key === 'rehabilitation') key = 'rehabilitation';
  
  return PLATFORM_CONTACTS[key] || { nameBn: 'হীরা', nameEn: 'Hira', phone: '01625230727' };
}

