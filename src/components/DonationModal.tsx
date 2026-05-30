import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle2, Heart, HelpCircle, Shield, Sparkles, CreditCard, Landmark, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

interface DonationModalProps {
  platform: string;
  platformName: string;
  triggerButton?: React.ReactNode;
}

export default function DonationModal({ platform, platformName, triggerButton }: DonationModalProps) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
  // Manual form values
  const [name, setName] = useState('');
  const [method, setMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [sourceNumber, setSourceNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  
  // Loading & success
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMess, setErrorMess] = useState('');

  const resetForm = () => {
    setName('');
    setMethod('');
    setAmount('');
    setNote('');
    setSourceNumber('');
    setTransactionId('');
    setSuccess(false);
    setErrorMess('');
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !method || !amount || !sourceNumber || !transactionId) {
      setErrorMess(language === 'bn' ? 'অনুগ্রহ করে সব প্রয়োজনীয় ক্ষেত্র পূরণ করুন।' : 'Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setErrorMess('');
    try {
      await addDoc(collection(db, 'donations'), {
        platform,
        platformName,
        name,
        method,
        amount: Number(amount),
        note,
        sourceNumber,
        transactionId,
        paymentType: 'manual',
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMess(language === 'bn' ? 'ডাটাবেজে যুক্ত করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' : 'Failed to process. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button size="lg" className="bg-gradient-to-r from-red-600 via-[#8b0000] to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-10 h-14 shadow-2xl shadow-red-600/20 font-black rounded-2xl gap-2 transition-all hover:scale-105 active:scale-95">
            <Heart className="h-6 w-6 text-white animate-pulse" />
            {language === 'bn' ? 'ডোনেট করুন' : 'Donate Now'}
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-0 border-none bg-white rounded-[2.5rem] shadow-2xl">
        <div className="relative overflow-hidden bg-[#8b0000] text-white p-8 rounded-t-[2.5rem] flex flex-col items-center text-center">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl mb-4 backdrop-blur-sm">
            <Heart className="h-8 w-8 text-accent animate-pulse" />
          </div>
          <DialogTitle className="text-2xl md:text-3xl font-black tracking-tight uppercase">
            {language === 'bn' ? `${platformName} দান তহবিল` : `${platformName} Donation Fund`}
          </DialogTitle>
          <p className="text-white/70 text-xs md:text-sm font-bold uppercase tracking-widest mt-2">
            {language === 'bn' ? 'মানবতার সেবায় আপনার ক্ষুদ্র অংশীদারিত্ব' : 'Your contribution towards humanity'}
          </p>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center space-y-4"
              >
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto border border-green-100">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-800">
                  {language === 'bn' ? 'সফলভাবে সম্পন্ন হয়েছে!' : 'Submitted Successfully!'}
                </h3>
                <p className="text-slate-500 font-medium px-6">
                  {language === 'bn' 
                    ? 'আপনার দানের তথ্যটি আমরা পেয়েছি। আমাদের টিম এটি ভেরিফাই করবে। আপনার শুভকামনা ও দানের জন্য ধন্যবাদ!' 
                    : 'We have received your payment details. Our admin team will verify it. Thank you for your kindness.'}
                </p>
                <Button onClick={() => setIsOpen(false)} className="bg-primary rounded-xl px-8 h-12 mt-4 font-black">
                  {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                </Button>
              </motion.div>
            ) : (
              <motion.form
                key="manual-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleManualSubmit}
                className="space-y-4"
              >
                {/* Top Notification Block */}
                <div className="p-4 bg-red-50/50 rounded-2xl border border-red-100 space-y-3">
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed text-center">
                    {language === 'bn' 
                      ? 'আমাদের সমাজসেবামূলক উদ্যোগে শরিক হওয়ার জন্য আপনাকে ধন্যবাদ। নিচের নাম্বারে টাকা পাঠিয়ে নিচের ফরমটি পূরণ করার অনুরোধ রইলো:'
                      : 'Thank you for joining our welfare initiative. Please send your donation to any number listed below and fill in this verification form:'}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                      <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-pink-500 block"></span>
                        {language === 'bn' ? 'বিকাশ (bKash):' : 'bKash:'}
                      </span>
                      <span className="text-base font-black text-[#8b0000]">01711157183</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                      <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block"></span>
                        {language === 'bn' ? 'নগদ (Nagad):' : 'Nagad:'}
                      </span>
                      <span className="text-base font-black text-[#8b0000]">01712251051</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                      <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block"></span>
                        {language === 'bn' ? 'উপায় (Upay):' : 'Upay:'}
                      </span>
                      <span className="text-base font-black text-[#8b0000]">01711157183</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 font-bold text-center">
                    * {language === 'bn' ? 'উক্ত সকল নম্বরগুলো পার্সোনাল হিসেবে সচল রয়েছে' : 'All above numbers are active as Personal accounts'}
                  </p>
                </div>

                {errorMess && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-red-600 text-xs font-bold border border-red-100">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMess}</span>
                  </div>
                )}

                {/* Name Input */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-600 text-xs uppercase tracking-wider">
                    {language === 'bn' ? 'আপনার নাম' : 'Your Name'} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder={language === 'bn' ? 'সম্পূর্ণ নাম লিখুন' : 'Enter your full name'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 rounded-xl bg-slate-50 border-slate-200"
                    required
                  />
                </div>

                {/* Method & Amount row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-600 text-xs uppercase tracking-wider">
                      {language === 'bn' ? 'দানের মাধ্যম' : 'Donation Method'} <span className="text-red-500">*</span>
                    </Label>
                    <Select value={method} onValueChange={setMethod}>
                      <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-xl">
                        <SelectValue placeholder={language === 'bn' ? 'নির্বাচন করুন' : 'Select Method'} />
                      </SelectTrigger>
                      <SelectContent className="bg-white rounded-xl shadow-xl">
                        <SelectItem value="bKash">bKash (বিকাশ)</SelectItem>
                        <SelectItem value="Nagad">Nagad (নগদ)</SelectItem>
                        <SelectItem value="Upay">Upay (উপায়)</SelectItem>
                        <SelectItem value="Other">Other (অন্যান্য)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-600 text-xs uppercase tracking-wider">
                      {language === 'bn' ? 'দানের পরিমান' : 'Donation Amount'} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      placeholder="৳ ৫০০০"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-12 rounded-xl bg-slate-50 border-slate-200"
                      required
                    />
                  </div>
                </div>

                {/* Source Number and TxnID */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-600 text-xs uppercase tracking-wider">
                      {language === 'bn' ? 'যে নাম্বার থেকে দান করা হয়েছে' : 'Source Number'} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="tel"
                      placeholder="017XXXXXXXX"
                      value={sourceNumber}
                      onChange={(e) => setSourceNumber(e.target.value)}
                      className="h-12 rounded-xl bg-slate-50 border-slate-200"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-600 text-xs uppercase tracking-wider">
                      {language === 'bn' ? 'ট্রানজেকশন আইডি' : 'Transaction ID'} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      placeholder="9K32MXA97"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="h-12 rounded-xl bg-slate-50 border-slate-200"
                      required
                    />
                  </div>
                </div>

                {/* Note */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-600 text-xs uppercase tracking-wider">
                    {language === 'bn' ? 'নোট (ঐচ্ছিক)' : 'Note (Optional)'}
                  </Label>
                  <Textarea
                    placeholder={language === 'bn' ? 'আপনার বার্তা বা কোন বিশেষ অনুরোধ এখানে বলুন' : 'Write down any note or special request...'}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="min-h-[80px] rounded-xl bg-slate-50 border-slate-200"
                  />
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-primary text-white rounded-2xl font-black text-lg transition-all hover:bg-primary/95 disabled:bg-slate-200"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                      Prcoessing...
                    </span>
                  ) : (
                    <span>{language === 'bn' ? 'ডাটা সংরক্ষণ করুন' : 'Confirm Information'}</span>
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
