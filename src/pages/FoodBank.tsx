import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/src/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Utensils, Users, HandHelping, ShoppingBasket, Plus, Trash2, Send, Calendar, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import MemberForm from '@/src/components/MemberForm';
import GallerySection from '@/src/components/GallerySection';
import ContactSection from '@/src/components/ContactSection';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { collection, query, onSnapshot, where, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

interface Member {
  id: string;
  fullName: string;
  occupation: string;
  photoURL?: string;
}

interface MenuItem {
  id: string;
  name: string;
  perPersonCost: number;
}

interface DonationRow {
  id: string;
  date: string;
  mealItemId: string;
  quantity: number;
  subTotal: number;
}

export default function FoodBank() {
  const { language, t } = useLanguage();
  const [members, setMembers] = useState<Member[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [donationRows, setDonationRows] = useState<DonationRow[]>([
    { id: '1', date: '', mealItemId: '', quantity: 1, subTotal: 0 }
  ]);
  const [message, setMessage] = useState('');
  const [isDonationDialogOpen, setIsDonationDialogOpen] = useState(false);
  
  // Custom payment details states for Admin tracking
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [payMethod, setPayMethod] = useState('');
  const [txId, setTxId] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'members'), 
      where('platform', '==', 'food-bank'),
      where('status', '==', 'approved')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Member[];
      setMembers(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'members');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = collection(db, 'food_donation_menu');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuItem[];
      // Client-side sort fallback
      list.sort((a, b) => {
        const timeA = (a as any).createdAt?.seconds || 0;
        const timeB = (b as any).createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setMenuItems(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'food_donation_menu');
    });
    return () => unsubscribe();
  }, []);

  const addDonationRow = () => {
    setDonationRows([
      ...donationRows,
      { id: Math.random().toString(36).substr(2, 9), date: '', mealItemId: '', quantity: 1, subTotal: 0 }
    ]);
  };

  const removeDonationRow = (id: string) => {
    if (donationRows.length === 1) return;
    setDonationRows(donationRows.filter(row => row.id !== id));
  };

  const updateDonationRow = (id: string, field: keyof DonationRow, value: any) => {
    setDonationRows(donationRows.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };
        if (field === 'mealItemId' || field === 'quantity') {
          const menuItem = menuItems.find(m => m.id === (field === 'mealItemId' ? value : row.mealItemId));
          const quantity = field === 'quantity' ? value : row.quantity;
          updatedRow.subTotal = menuItem ? menuItem.perPersonCost * quantity : 0;
        }
        return updatedRow;
      }
      return row;
    }));
  };

  const calculateTotal = () => {
    return donationRows.reduce((sum, row) => sum + row.subTotal, 0);
  };

  const handleSendDonation = async () => {
    if (!donorName || !donorPhone || !payMethod || !txId) {
      setFormError(language === 'bn' ? 'অনুগ্রহ করে সব প্রয়োজনীয় তথ্য পূরণ করুন।' : 'Please fill in all required fields.');
      return;
    }
    
    // Check if meal is chose
    const totalAmount = calculateTotal();
    if (totalAmount <= 0) {
      setFormError(language === 'bn' ? 'অনুগ্রহ করে কমপক্ষে ১টি মেল আইটেম নির্বাচন করুন।' : 'Please select at least one meal item.');
      return;
    }

    setFormError('');

    let donationText = `*New Special Meal Donation Request*\n\n`;
    donationText += `*Donor Name:* ${donorName}\n`;
    donationText += `*Sender Phone:* ${donorPhone}\n`;
    donationText += `*Payment Method:* ${payMethod}\n`;
    donationText += `*Transaction ID:* ${txId}\n\n`;

    let summaryNote = `[Special Meal Summary]\n`;
    donationRows.forEach((row, index) => {
      const menuItem = menuItems.find(m => m.id === row.mealItemId);
      donationText += `*Item ${index + 1}:*\n`;
      donationText += `- Date: ${row.date || 'Any Date'}\n`;
      donationText += `- Menu: ${menuItem ? menuItem.name : 'Not selected'}\n`;
      donationText += `- Quantity: ${row.quantity}\n`;
      donationText += `- Sub Total: ৳${row.subTotal}\n\n`;
      
      summaryNote += `- Date: ${row.date || 'Any Date'}, Menu: ${menuItem ? menuItem.name : 'N/A'}, Qty: ${row.quantity}, Cost: ৳${row.subTotal}\n`;
    });
    
    donationText += `*Total Amount:* ৳${totalAmount}\n`;
    if (message) {
      donationText += `\n*Message:* ${message}`;
      summaryNote += `\nMessage: ${message}`;
    }

    try {
      await addDoc(collection(db, 'donations'), {
        platform: 'food-bank',
        platformName: 'Food Bank - Special Meal',
        name: donorName,
        sourceNumber: donorPhone,
        method: payMethod,
        transactionId: txId,
        amount: Number(totalAmount),
        note: summaryNote,
        paymentType: 'special-meal',
        status: 'pending',
        createdAt: serverTimestamp()
      });

      const whatsappUrl = `https://wa.me/8801953568902?text=${encodeURIComponent(donationText)}`;
      window.open(whatsappUrl, '_blank');
      
      setDonorName('');
      setDonorPhone('');
      setPayMethod('');
      setTxId('');
      setMessage('');
      setIsDonationDialogOpen(false);
      
      alert(language === 'bn' 
        ? 'আপনার স্পেশাল মিল বুকিং সফলভাবে সিস্টেমে রেকর্ড করা হয়েছে! আপনাকে হোয়াটস্যাপে নিয়ে যাওয়া হচ্ছে।' 
        : 'Your special meal booking has been saved successfully in records. Redirecting you to WhatsApp now.');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, 'donations');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-slate-900 text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex mb-8"
          >
            <img 
              src="https://i.ibb.co.com/zWwHgHV7/Improvement-Food-Bank.jpg" 
              alt="Improvement Food Bank Logo" 
              className="h-20 w-20 md:h-32 md:w-32 rounded-3xl object-contain bg-white p-2 border-4 border-danger/30 shadow-2xl shadow-danger/20"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-7xl font-black mb-6 tracking-tight"
          >
            Improvement Food Bank
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-2xl opacity-80 max-w-3xl mx-auto font-medium leading-relaxed mb-12"
          >
            {language === 'bn'
              ? '"ফুড ফর অল" প্রোগ্রামের মাধ্যমে আমরা ক্ষুধার্ত মানুষের মুখে হাসি ফোটাতে কাজ করছি। আপনার সামান্য সাহায্য কারো জীবনের বড় পরিবর্তন আনতে পারে।'
              : 'Nourishing Communities, One Meal at a Time. Making a difference through our "Food for All" initiative.'}
          </motion.p>
          
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="flex flex-wrap justify-center gap-6"
          >
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-white hover:bg-white/90 text-primary px-10 h-14 shadow-xl font-black rounded-2xl transition-all hover:scale-105 active:scale-95">
                  <HandHelping className="h-6 w-6 mr-2" /> {language === 'bn' ? 'মেম্বার হিসেবে যোগ দিন' : 'Join as Member'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-none bg-white rounded-3xl">
                <MemberForm platform="food-bank" platformName="Improvement Food Bank" />
              </DialogContent>
            </Dialog>

            <Dialog open={isDonationDialogOpen} onOpenChange={setIsDonationDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-danger hover:bg-danger/90 text-white px-10 h-14 shadow-xl shadow-danger/20 font-black rounded-2xl transition-all hover:scale-105 active:scale-95">
                  <Utensils className="h-6 w-6 mr-2" /> {language === 'bn' ? 'ডোনেট করুন' : 'Donate Now'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-1 border-none bg-white rounded-[2rem] overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-hide">
                  <DialogHeader className="mb-10 text-center">
                    <DialogTitle className="text-4xl font-black text-primary tracking-tight">SPECIAL MEAL</DialogTitle>
                    <div className="h-1.5 w-16 bg-danger/20 mx-auto rounded-full mt-2" />
                  </DialogHeader>

                  <div className="space-y-6">
                    {/* Header Row */}
                    <div className="hidden md:grid grid-cols-[1fr_2fr_1fr_1fr_auto] gap-4 bg-emerald-500 text-white p-4 rounded-xl font-black text-sm uppercase tracking-wider text-center">
                      <div>Date</div>
                      <div>Meal Item</div>
                      <div>Quantity</div>
                      <div>Sub Total</div>
                      <div className="w-10"></div>
                    </div>

                    <AnimatePresence initial={false}>
                      {donationRows.map((row) => (
                        <motion.div 
                          key={row.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr_1fr_auto] gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200"
                        >
                          <div className="space-y-2">
                            <Label className="md:hidden font-bold">Date</Label>
                            <Input 
                              type="text" 
                              placeholder="Any Date" 
                              value={row.date}
                              onChange={(e) => updateDonationRow(row.id, 'date', e.target.value)}
                              className="h-12 bg-white rounded-xl border-slate-200 text-center"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="md:hidden font-bold">Meal Item</Label>
                            <Select 
                              value={row.mealItemId} 
                              onValueChange={(val) => updateDonationRow(row.id, 'mealItemId', val)}
                            >
                              <SelectTrigger className="h-12 bg-white rounded-xl border-slate-200">
                                <SelectValue placeholder="Rice, Chicken and..." />
                              </SelectTrigger>
                              <SelectContent>
                                {menuItems.map((item) => (
                                  <SelectItem key={item.id} value={item.id}>
                                    {item.name} (৳{item.perPersonCost}/meal)
                                  </SelectItem>
                                ))}
                                {menuItems.length === 0 && (
                                  <SelectItem value="none" disabled>বিকল্প মেনু নেই</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="md:hidden font-bold">Quantity</Label>
                            <Input 
                              type="number" 
                              min="1"
                              value={row.quantity}
                              onChange={(e) => updateDonationRow(row.id, 'quantity', parseInt(e.target.value) || 0)}
                              className="h-12 bg-white rounded-xl border-slate-200 text-center"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="md:hidden font-bold">Sub Total</Label>
                            <div className="h-12 bg-slate-100 rounded-xl flex items-center justify-center font-black text-primary border border-slate-200">
                              {row.subTotal}
                            </div>
                          </div>
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            className="h-10 w-10 rounded-lg shrink-0 mx-auto"
                            onClick={() => removeDonationRow(row.id)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    <Button 
                      variant="outline" 
                      onClick={addDonationRow} 
                      className="w-full h-12 border-dashed border-2 rounded-xl text-slate-400 font-bold hover:text-primary transition-all"
                    >
                      <Plus className="h-5 w-5 mr-2" /> Add More Rows
                    </Button>

                    {/* Donor and Payment Validation Section */}
                    <div className="bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/10 space-y-4 my-6 text-left">
                      <h4 className="text-emerald-800 font-black text-sm uppercase tracking-wide flex items-center gap-2">
                        <Heart className="h-4 w-4 text-emerald-600 animate-pulse" />
                        {language === 'bn' ? 'দাতা ও পেমেন্ট বিবরণী' : 'Donor & Payment details'}
                      </h4>
                      
                      {formError && (
                        <div className="text-xs font-bold text-red-500 p-3 bg-red-50 rounded-xl">
                          {formError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                            {language === 'bn' ? 'দাতার নাম *' : 'Donor Name *'}
                          </Label>
                          <Input 
                            value={donorName} 
                            onChange={(e) => setDonorName(e.target.value)} 
                            placeholder={language === 'bn' ? 'যেমন: মোহাম্মদ আরিফ' : 'e.g. Mohd Arif'} 
                            className="bg-white border-slate-200 rounded-xl h-11 text-sm font-semibold"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                            {language === 'bn' ? 'প্রেরক মোবাইল *' : 'Sender Phone *'}
                          </Label>
                          <Input 
                            value={donorPhone} 
                            onChange={(e) => setDonorPhone(e.target.value)} 
                            placeholder={language === 'bn' ? 'যেমন: 017xxxxxxxx' : 'e.g. 017xxxxxxxx'} 
                            className="bg-white border-slate-200 rounded-xl h-11 text-sm font-semibold"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                            {language === 'bn' ? 'পেমেন্ট মাধ্যম (বিকাশ/নগদ/রকেট/ব্যাংক) *' : 'Payment Method (bKash/Nagad/Rocket/Bank) *'}
                          </Label>
                          <Input 
                            value={payMethod} 
                            onChange={(e) => setPayMethod(e.target.value)} 
                            placeholder={language === 'bn' ? 'যেমন: bKash' : 'e.g. bKash'} 
                            className="bg-white border-slate-200 rounded-xl h-11 text-sm font-semibold"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                            {language === 'bn' ? 'ট্রানজেকশন আইডি *' : 'Transaction ID (TxID) *'}
                          </Label>
                          <Input 
                            value={txId} 
                            onChange={(e) => setTxId(e.target.value)} 
                            placeholder={language === 'bn' ? 'যেমন: TR289A0BD' : 'e.g. TR289A0BD'} 
                            className="bg-slate-50 border-slate-200 focus:bg-white rounded-xl h-11 text-sm font-semibold font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mt-8">
                      <Label className="font-bold text-slate-500 uppercase tracking-widest text-xs">ENTER YOUR MESSAGE</Label>
                      <Textarea 
                        placeholder="আপনার বার্তা লিখুন..." 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-[120px] bg-yellow-50/30 border-slate-200 rounded-xl focus:ring-danger"
                      />
                    </div>

                    <div className="flex items-center justify-between p-6 bg-slate-900 text-white rounded-[2rem] mt-8">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Total Donation</p>
                        <h4 className="text-3xl font-black tracking-tight">৳{calculateTotal()}</h4>
                      </div>
                      <Button 
                        onClick={handleSendDonation}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white h-16 px-10 text-2xl font-black rounded-2xl shadow-xl shadow-emerald-500/20 group"
                      >
                        <Send className="h-6 w-6 mr-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        SENT
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
      </section>

      {/* Programs */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-24">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-10 border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[3rem] bg-white group hover:shadow-2xl transition-all duration-500">
                <div className="flex flex-col sm:flex-row items-start gap-8">
                  <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <ShoppingBasket className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black mb-4 tracking-tight text-primary">ফুড ফর অল</h3>
                    <p className="text-slate-500 text-lg leading-relaxed font-bold">
                      আমরা নিয়মিতভাবে ছিন্নমূল এবং অসহায় মানুষের মাঝে রান্না করা খাবার এবং শুকনো খাবার বিতরণ করি।
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-10 border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[3rem] bg-white group hover:shadow-2xl transition-all duration-500">
                <div className="flex flex-col sm:flex-row items-start gap-8">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <HandHelping className="h-8 w-8 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black mb-4 tracking-tight text-primary">ইভেন্ট সাপোর্ট</h3>
                    <p className="text-slate-500 text-lg leading-relaxed font-bold">
                      বিভিন্ন সামাজিক অনুষ্ঠানে বেঁচে যাওয়া খাবার সংগ্রহ করে তা ক্ষুধার্তদের মাঝে পৌঁছে দেওয়া হয়।
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          <div className="space-y-12">
            <div className="text-center space-y-4">
               <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tight">আমাদের মেম্বারবৃন্দ</h2>
               <div className="h-1.5 w-24 bg-accent/30 mx-auto rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {members.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="border-none shadow-md hover:shadow-xl transition-all rounded-[2rem] bg-white group overflow-hidden">
                    <CardContent className="p-6 flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border-2 border-slate-50 group-hover:border-accent transition-colors">
                        {m.photoURL ? (
                          <img src={m.photoURL} alt={m.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <Users className="h-8 w-8 text-slate-300" />
                        )}
                      </div>
                      <div>
                        <p className="font-black text-primary text-lg leading-tight mb-1">{m.fullName}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{m.occupation}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              {members.length === 0 && (
                <div className="col-span-full text-center py-20 bg-slate-100 rounded-[3rem] border-2 border-dashed border-slate-200">
                  <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold italic">বর্তমানে কোন মেম্বার তালিকাভুক্ত নেই।</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <ContactSection platform="food-bank" />

      <GallerySection platform="food-bank" />
    </div>
  );
}
