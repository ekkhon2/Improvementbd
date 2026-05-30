import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Compass, 
  Database, 
  ShieldAlert, 
  BookOpen, 
  Coins, 
  Clock, 
  Layers, 
  Printer, 
  CheckCircle, 
  Users, 
  Sparkles, 
  FileText,
  MousePointerClick
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function MasterBlueprint() {
  const [activeTab, setActiveTab] = useState<'overview' | 'database' | 'donations' | 'typing' | 'ownership'>('overview');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:p-0">
      {/* Top Banner / Hero */}
      <div className="p-8 md:p-12 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl relative overflow-hidden shadow-xl print:bg-white print:text-black print:p-0 print:shadow-none">
        <div className="absolute top-0 right-0 p-12 opacity-10 animate-pulse hidden md:block print:hidden">
          <Compass className="h-44 w-44 text-white" />
        </div>
        <div className="relative space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 text-xs font-black uppercase tracking-widest text-accent print:hidden">
            <Sparkles className="h-4.5 w-4.5" /> Interactive Smart Blueprint
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Improvement BD Master Guide & Operational Blueprint
          </h1>
          <p className="text-slate-300 font-medium text-sm md:text-base print:text-slate-700">
            A comprehensive, transparent operation blueprint and source mapping designed for the platform owners. This acts as an offline mentor, technical guide, and operations manual.
          </p>
          <div className="flex flex-wrap gap-3 pt-2 print:hidden">
            <Button onClick={handlePrint} className="bg-accent hover:bg-accent/90 text-white font-black rounded-xl px-6 h-12 shadow-lg shadow-accent/20">
              <Printer className="mr-2 h-5 w-5" /> Print Blueprint / Save as PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Interactive Tabs Menu - Hidden on print */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 print:hidden">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'overview' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Compass className="h-4 w-4" /> System Overview
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`py-3 px-5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'database' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Database className="h-4 w-4" /> Databases & Collections
        </button>
        <button
          onClick={() => setActiveTab('donations')}
          className={`py-3 px-5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'donations' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Coins className="h-4 w-4" /> Donation Auditing
        </button>
        <button
          onClick={() => setActiveTab('typing')}
          className={`py-3 px-5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'typing' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Clock className="h-4 w-4" /> Typing Test Mechanics
        </button>
        <button
          onClick={() => setActiveTab('ownership')}
          className={`py-3 px-5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'ownership' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Users className="h-4 w-4" /> Double Ownership Rules
        </button>
      </div>

      {/* Main Print Layout (Combines everything when printing) */}
      <div className="space-y-8 print:block">
        
        {/* --- SECTION 1: SYSTEM OVERVIEW --- */}
        <div className={`${activeTab === 'overview' ? 'block' : 'hidden md:print:block'}`}>
          <Card className="border-none shadow-xl rounded-3xl bg-white p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b pb-4 border-slate-100">
              <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-800">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800">১. সিস্টেম পরিচিতি ও আর্কিটেকচার (System Architecture)</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">How the website handles and boots requests</p>
              </div>
            </div>

            <div className="space-y-4 text-slate-600 font-medium leading-relaxed text-sm">
              <p>
                <strong>Improvement BD</strong> একটি কমপ্লিট ডিকাপলড হাইব্রিড সিঙ্গেল পেজ লাইভ ড্যাশবোর্ড স্ক্রিন সিস্টেম। এটি আপনার ডিভাইসের ব্রাউজার লোড কমানোর লক্ষ্যে এবং দ্রুততম স্পিড বজায় রাখতে সম্পূর্ণ ক্লায়েন্ট-সাইড রাউটিংসহ ক্লাউডের সাথে ইন্টিগ্রেটেড রয়েছে।
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <h3 className="font-black text-slate-800 text-base flex items-center gap-1.5">
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-500" /> ক্রোম ও অন্যান্য ব্রাউজার সাপোর্ট
                  </h3>
                  <p className="text-xs text-slate-500">
                    সবচেয়ে আধুনিক React 18, Vite এবং Tailwind CSS দিয়ে তৈরি করার ফলে এটি মোবাইল, লাইভ আইপ্যাড বা যেকোনো ল্যাপটপে সর্বোচ্চ রেসপনসিভনেস প্রদান করে।
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <h3 className="font-black text-slate-800 text-base flex items-center gap-1.5">
                    <ShieldAlert className="h-4.5 w-4.5 text-amber-500" /> এডমিন কনসোল লক (Security Rules)
                  </h3>
                  <p className="text-xs text-slate-500">
                    এডমিন প্যানেলে যেকোনো ডিলিট বা কাস্টম অ্যাকশন করতে গেলে সিস্টেমে সরাসরি সিকিউরিটি চেক কার্যকর হয়। ইউজার যদি <code className="bg-slate-200 px-1 rounded text-red-600">ekkhon2@gmail.com</code> মেইলে লগইন না করা থাকে তবে কোনো ডাটা পরিবর্তন করতে পারবে না।
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* --- SECTION 2: DATABASES & COLLECTIONS DOCUMENTATION --- */}
        <div className={`${activeTab === 'database' ? 'block' : 'hidden md:print:block'}`}>
          <Card className="border-none shadow-xl rounded-3xl bg-white p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b pb-4 border-slate-100">
              <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-800">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800">২. ডাটাবেজ সংরক্ষণ ও স্কিমা ম্যাপিং (Database Schema Maps)</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">How data is saved inside Firestore Collections</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium text-slate-500">
                সিস্টেমে ব্যবহৃত প্রতিটি Firestore কালেকশন এবং সেটির ভেতরে থাকা ডকুমেন্টস ডাটাগুলোর বিবরণী নিচে ম্যাপ করা আছে:
              </p>

              <div className="space-y-4 pt-2">
                {/* Collection item */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <span className="font-mono text-base font-black text-rose-700 bg-rose-50 px-3 py-1 rounded-xl">donations</span>
                    <Badge className="bg-slate-800 text-white font-black">Core Finance</Badge>
                  </div>
                  <p className="text-xs text-slate-600 font-bold pt-1">
                    দানকারীদের নামের তালিকা, দানের খাত, ট্রানজেকশন আইডি এবং সঠিক প্রদানের সময় সংরক্ষণ করে।
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-slate-100 text-xs font-semibold text-slate-500">
                    <span className="text-slate-800 font-bold">Fields:</span> name, amount, method, sourceNumber, transactionId, note, platform, platformName, status, createdAt
                  </div>
                </div>

                {/* Collection item */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <span className="font-mono text-base font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-xl">members</span>
                    <Badge className="bg-slate-800 text-white font-black">All Users</Badge>
                  </div>
                  <p className="text-xs text-slate-600 font-bold pt-1">
                    платেশন মেম্বারদের কার্ড রেজিস্ট্রেশন ডাটা ও এপ্রুভাল ট্র্যাক করতে এটি ব্যবহৃত হয়।
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-slate-100 text-xs font-semibold text-slate-500">
                    <span className="text-slate-800 font-bold">Fields:</span> name, email, phone, bloodGroup, platform, address, status, createdAt
                  </div>
                </div>

                {/* Collection item */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <span className="font-mono text-base font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl">blood_donors</span>
                    <Badge className="bg-slate-800 text-white font-black">Blood Bank</Badge>
                  </div>
                  <p className="text-xs text-slate-600 font-bold pt-1">
                    স্বেচ্ছাসেবী রক্তদাতাদের বিবরণ ও তাদের লাস্ট রক্তদানের সময় তালিকাভুক্ত রাখে।
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-slate-100 text-xs font-semibold text-slate-500">
                    <span className="text-slate-800 font-bold">Fields:</span> name, bloodGroup, phone, lastDonated, location, status, createdAt
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* --- SECTION 3: DONATION AUDITING MECHANICS --- */}
        <div className={`${activeTab === 'donations' ? 'block' : 'hidden md:print:block'}`}>
          <Card className="border-none shadow-xl rounded-3xl bg-white p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b pb-4 border-slate-100">
              <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-800">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800">৩. ডোনেশন অডিটিং ও ট্র্যাকিং হিসাব (Finance Systems)</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">How to audit & track transaction flows transparently</p>
              </div>
            </div>

            <div className="space-y-6 text-slate-600 font-medium text-sm leading-relaxed">
              <div className="p-4 bg-red-50/50 rounded-2xl border border-red-100 space-y-2">
                <h3 className="font-black text-[#8b0000] text-base">১০০% ফ্রি পেমেন্ট নম্বরসমূহ</h3>
                <p className="text-xs">
                  কোনো প্রকার মধ্যস্থতাকারী ফি ছাড়াই সরাসরি সমাজসেবার জন্য দানকৃত টাকা রিসিভ করার অফিশিয়াল নম্বর:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 bg-white rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-black text-pink-500 block">bKash (বিকাশ)</span>
                    <span className="text-base font-black text-slate-800">01711157183</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-black text-amber-500 block">Nagad (নগদ)</span>
                    <span className="text-base font-black text-slate-800">01712251051</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-black text-blue-500 block">Upay (উপায়)</span>
                    <span className="text-base font-black text-slate-800">01711157183</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                  <MousePointerClick className="h-4 w-4 text-primary" /> কীভাবে এপ্রুভাল বাটন ব্যাক-এন্ডে কাজ করে:
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-xs text-slate-500 pl-2">
                  <li>ইউজার অনুদান ফর্ম সাবমিট করলে তা সাথে সাথে এডমিন প্যানেলের <strong>Donations</strong> ট্যাবে পেন্ডিং হিসেবে তালিকাভুক্ত হয়।</li>
                  <li>এডমিন বিকাশ/নগদে টাকা রিসিভ দেখে "Approve" (✔) চাপলে ফায়ারস্টোরে ওই ডকুমেন্টের স্ট্যাটাস <code className="bg-slate-200 px-1 rounded">"status": "approved"</code> হয়ে যায়।</li>
                  <li>এপ্রুভ হওয়ার সেকেন্ডের মধ্যে হোমপেজ ও ড্যাশবোর্ডের মোট অনুদানের গ্রাফে কারেক্ট হিসাব স্বয়ংক্রিয়ভাবে আপডেট হয়ে যায়।</li>
                </ol>
              </div>
            </div>
          </Card>
        </div>

        {/* --- SECTION 4: TYPING TEST MECHANICS --- */}
        <div className={`${activeTab === 'typing' ? 'block' : 'hidden md:print:block'}`}>
          <Card className="border-none shadow-xl rounded-3xl bg-white p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b pb-4 border-slate-100">
              <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-800">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800">৪. টাইপিং টেস্ট অ্যালগরিদম ও মেথোডোলজি (Typing Mechanics)</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">How speed and accuracy metrics are computed</p>
              </div>
            </div>

            <div className="space-y-4 text-slate-600 font-medium text-sm leading-relaxed">
              <p>
                টাইপিং টেস্ট পেজে ব্যবহারকারী রিয়েল-টাইমে ইংরেজি বা বাংলা কিবোর্ড ট্রেইনার পারফর্ম করতে পারে। তাদের স্পিড এবং নির্ভুলতার হিসাব নিচের নিয়ম অনুযায়ী হয়:
              </p>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <h3 className="font-black text-slate-800">টাইমিং অপশন (Timing Presets)</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 bg-white rounded-xl border text-center">
                    <span className="font-mono text-lg font-black text-primary">১ মিনিট</span>
                    <span className="text-[10px] text-slate-400 block uppercase">60 Seconds</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border text-center">
                    <span className="font-mono text-lg font-black text-primary">১০ মিনিট</span>
                    <span className="text-[10px] text-slate-400 block uppercase">600 Seconds</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border text-center">
                    <span className="font-mono text-lg font-black text-primary">৩০ মিনিট</span>
                    <span className="text-[10px] text-slate-400 block uppercase">1800 Seconds</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* --- SECTION 5: DOUBLE OWNERSHIP INSTRUCTIONS --- */}
        <div className={`${activeTab === 'ownership' ? 'block' : 'hidden md:print:block'}`}>
          <Card className="border-none shadow-xl rounded-3xl bg-white p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b pb-4 border-slate-100">
              <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-800">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800">৫. যৌথ মালিকানা পরিচালনা ও ফিউচার টিপস (Co-Ownership Management)</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">How to manage the platform concurrently without friction</p>
              </div>
            </div>

            <div className="space-y-4 text-slate-600 font-medium text-sm leading-relaxed">
              <p>
                আপনারা যেহেতু দুজন পার্টনার মিলে এই ওয়েবসাইটটি পরিচালনা করছেন, সে ক্ষেত্রে ভবিষ্যতে কোড পরিবর্তনের ক্ষেত্রে এই মাস্টার রুলগুলো মাথায় রাখবেন:
              </p>

              <ul className="space-y-3 pl-4 list-disc text-xs text-slate-500">
                <li>
                  <strong>পেমেন্ট নম্বর পরিবর্তন করতে চাইলে:</strong> সরাসরি <code className="bg-slate-100 px-1 rounded font-mono text-red-600">/src/components/DonationModal.tsx</code> ফাইলে গিয়ে কাঙ্ক্ষিত নম্বরসমূহ পরিবর্তন করলেই হবে।
                </li>
                <li>
                  <strong>কোনো সদস্য ব্লক বা ডিলিট করতে চাইলে:</strong> এডমিন প্যানেলের <strong>All Members</strong> ট্যাবে ডেডিকেটেড ট্র্যাশ ক্যান বাটনে ক্লিক করে সহজেই নিষ্ক্রিয় করা যাবে।
                </li>
                <li>
                  <strong>তথ্য ব্যাকআপ নেওয়া:</strong> কোনো বড় ধরনের পরিবর্তনের আগে বা পরীক্ষার তালিকা ক্লাসরুমে আপলোডের আগে অবশ্যই এই ডকুমেন্টেশনের সাহায্য নিবেন।
                </li>
              </ul>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
