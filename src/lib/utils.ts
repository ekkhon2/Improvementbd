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

export function formatImageUrl(url: any): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return '';
  }

  // 1. Convert ibb.co sharing links to direct i.ibb.co.com links
  // Example: https://ibb.co/gwhSryL -> https://i.ibb.co.com/gwhSryL/image.jpg
  // Or: https://ibb.co/v6jNcH6c -> https://i.ibb.co.com/v6jNcH6c/image.jpg
  const ibbRegex = /^https?:\/\/(?:www\.)?ibb\.co\/([a-zA-Z0-9]+)$/i;
  const ibbMatch = trimmed.match(ibbRegex);
  if (ibbMatch) {
    return `https://i.ibb.co.com/${ibbMatch[1]}/image.jpg`;
  }

  // 2. Convert Google Drive sharing links to direct download/display links
  // Format 1: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  const driveRegex1 = /^https?:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i;
  const driveMatch1 = trimmed.match(driveRegex1);
  if (driveMatch1) {
    return `https://lh3.googleusercontent.com/d/${driveMatch1[1]}`;
  }

  // Format 2: https://drive.google.com/open?id=FILE_ID
  const driveRegex2 = /[?&]id=([a-zA-Z0-9_-]+)/i;
  if (trimmed.includes('drive.google.com')) {
    const driveMatch2 = trimmed.match(driveRegex2);
    if (driveMatch2) {
      return `https://lh3.googleusercontent.com/d/${driveMatch2[1]}`;
    }
  }

  return trimmed;
}

