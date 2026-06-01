import React, { useState } from 'react';
import { useLanguage } from '@/src/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { db } from '@/src/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, setDoc, getDoc } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getPlatformContact } from '@/src/lib/utils';

interface MemberFormProps {
  platform: string;
  platformName: string;
  onSuccess?: () => void;
}

export default function MemberForm({ platform, platformName, onSuccess }: MemberFormProps) {
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [platforms, setPlatforms] = useState<string[]>([platform]);
  const [formData, setFormData] = useState({
    fullName: '',
    phonePrimary: '',
    isWhatsApp: false,
    phoneSecondary: '',
    facebookURL: '',
    photoURL: '',
    address: '',
    occupation: '',
    institution: '',
    message: '',
    bloodGroup: '',
    lastDonationDate: '',
    membershipType: '',
    preferredCourse: '',
    classGrade: '',
    membershipId: '',
    age: '',
    weight: '',
    preferredSport: '',
    skillLevel: '',
    teamName: '',
    specialSkill: '',
    pod: '',
    availability: '',
    volunteerInterest: '',
    area: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      alert(language === 'bn' ? 'দয়া করে শর্তাবলী গ্রহণ করুন।' : 'Please accept the terms and conditions.');
      return;
    }

    if (platforms.includes('blood-bank') && !formData.bloodGroup) {
      alert(language === 'bn' ? 'দয়া করে আপনার রক্তের গ্রুপ নির্বাচন করুন।' : 'Please select your blood group.');
      return;
    }

    setLoading(true);
    try {
      // Generate Membership ID for all if not provided
      let finalMembershipId = formData.membershipId;
      if (!finalMembershipId) {
        const prefix = platforms.includes('library') ? 'LIB-' : 'MEM-';
        finalMembershipId = prefix + Math.random().toString(36).substr(2, 6).toUpperCase();
      }

      // Save to members collection
      await addDoc(collection(db, 'members'), {
        ...formData,
        membershipId: finalMembershipId,
        platform: platforms,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      // If blood bank, also save to donors
      if (platforms.includes('blood-bank')) {
        await addDoc(collection(db, 'donors'), {
          fullName: formData.fullName,
          bloodGroup: formData.bloodGroup,
          phonePrimary: formData.phonePrimary,
          isWhatsApp: formData.isWhatsApp,
          phoneSecondary: formData.phoneSecondary,
          facebookURL: formData.facebookURL,
          photoURL: formData.photoURL,
          address: formData.address,
          lastDonatedDate: formData.lastDonationDate,
          age: formData.age,
          weight: formData.weight,
          status: 'available',
          createdAt: serverTimestamp(),
        });
      }

      // Increment stats
      try {
        const statsRef = doc(db, 'stats', 'totals');
        const statsSnap = await getDoc(statsRef);
        
        if (!statsSnap.exists()) {
          await setDoc(statsRef, {
            members: 1,
            donors: platforms.includes('blood-bank') ? 1 : 0,
            books: 0,
            recipients: 500
          });
        } else {
          await updateDoc(statsRef, {
            members: increment(1),
            donors: platforms.includes('blood-bank') ? increment(1) : increment(0)
          });
        }
      } catch (statsErr) {
        console.warn('Could not update stats totals due to lack of permissions:', statsErr);
      }

      // Redirect to WhatsApp
      const selectedPlatformNames = platforms.map(p => {
        const found = [
          { id: 'foundation', label: 'Foundation' },
          { id: 'blood-bank', label: 'Blood Bank' },
          { id: 'food-bank', label: 'Food Bank' },
          { id: 'sporting-club', label: 'Sporting Club' },
          { id: 'it-education', label: 'IT Education' },
          { id: 'academic-care', label: 'Academic Care' },
          { id: 'library', label: 'Library' }
        ].find(item => item.id === p);
        return found ? found.label : p;
      }).join(', ');

      const whatsappMessage = `Hello Improvement BD, I am ${formData.fullName}. I want to join: ${selectedPlatformNames}. \nPhone: ${formData.phonePrimary}${formData.phoneSecondary ? ` / ${formData.phoneSecondary}` : ''}\nAddress: ${formData.address}${formData.bloodGroup ? `\nBlood Group: ${formData.bloodGroup}` : ''}${finalMembershipId ? `\nMembership ID: ${finalMembershipId}` : ''}`;
      const encodedMessage = encodeURIComponent(whatsappMessage);
      
      const contact = getPlatformContact(platform);
      const whatsappNumber = contact.phone;
      const whatsappUrl = `https://wa.me/880${whatsappNumber.substring(1)}?text=${encodedMessage}`; 
      
      window.open(whatsappUrl, '_blank');

      if (onSuccess) onSuccess();
      alert(language === 'bn' ? `নিবন্ধন সফল হয়েছে! ${finalMembershipId ? `আপনার আইডি: ${finalMembershipId}` : ''}` : `Registration successful! ${finalMembershipId ? `Your ID: ${finalMembershipId}` : ''}`);
    } catch (error) {
      console.error('Error adding document: ', error);
      alert(language === 'bn' ? 'কিছু ভুল হয়েছে। আবার চেষ্টা করুন।' : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-slate-100 max-w-full overflow-x-hidden">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="font-bold text-primary">পূর্ণ নাম (Full Name)</Label>
            <Input 
              id="fullName" 
              required 
              value={formData.fullName} 
              onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
              className="h-12 border-slate-200 focus:border-accent focus:ring-accent rounded-xl"
              placeholder="আপনার নাম লিখুন"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phonePrimary" className="font-bold text-primary">ফোন নম্বর (Phone Number)</Label>
            <Input 
                id="phonePrimary" 
                required 
                placeholder="০১৮XXXXXXXX"
                value={formData.phonePrimary} 
                onChange={(e) => setFormData({...formData, phonePrimary: e.target.value})} 
                className="h-12 border-slate-200 rounded-xl"
              />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneSecondary" className="font-bold text-primary">বিকল্প ফোন নম্বর (Secondary Phone - Optional)</Label>
            <Input 
              id="phoneSecondary" 
              placeholder="০১৮XXXXXXXX"
              value={formData.phoneSecondary} 
              onChange={(e) => setFormData({...formData, phoneSecondary: e.target.value})} 
              className="h-12 border-slate-200 rounded-xl"
            />
          </div>
          
          {platforms.includes('blood-bank') && (
            <>
              <div className="space-y-2">
                <Label htmlFor="bloodGroup" className="font-bold text-primary">রক্তের গ্রুপ (Blood Group)</Label>
                <Select 
                  value={formData.bloodGroup} 
                  onValueChange={(val) => setFormData({...formData, bloodGroup: val})}
                >
                  <SelectTrigger id="bloodGroup" className="h-12 border-slate-200 rounded-xl">
                    <SelectValue placeholder="গ্রুপ নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="age" className="font-bold text-primary">বয়স (Age)</Label>
                <Input 
                  id="age" 
                  type="number"
                  value={formData.age} 
                  onChange={(e) => setFormData({...formData, age: e.target.value})} 
                  className="h-12 border-slate-200 rounded-xl"
                  placeholder="যেমন: ২৫"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight" className="font-bold text-primary">ওজন (Weight - kg)</Label>
                <Input 
                  id="weight" 
                  type="number"
                  value={formData.weight} 
                  onChange={(e) => setFormData({...formData, weight: e.target.value})} 
                  className="h-12 border-slate-200 rounded-xl"
                  placeholder="যেমন: ৬৫"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastDonationDate" className="font-bold text-primary">শেষ রক্তদানের তারিখ (ঐচ্ছিক)</Label>
                <Input 
                  id="lastDonationDate" 
                  type="date"
                  value={formData.lastDonationDate} 
                  onChange={(e) => setFormData({...formData, lastDonationDate: e.target.value})} 
                  className="h-12 border-slate-200 rounded-xl"
                />
              </div>
            </>
          )}

          {platforms.includes('library') && (
            <>
              <div className="space-y-2">
                <Label htmlFor="membershipType" className="font-bold text-primary">সদস্যতার ধরন (Membership Type)</Label>
                <Select 
                  value={formData.membershipType} 
                  onValueChange={(val) => setFormData({...formData, membershipType: val})}
                >
                  <SelectTrigger id="membershipType" className="h-12 border-slate-200 rounded-xl">
                    <SelectValue placeholder="ধরন নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">ছাত্র/ছাত্রী</SelectItem>
                    <SelectItem value="professional">চাকরিজীবী</SelectItem>
                    <SelectItem value="other">অন্যান্য</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="membershipId" className="font-bold text-primary">মেম্বারশিপ আইডি (ঐচ্ছিক)</Label>
                <div className="flex gap-2">
                  <Input 
                    id="membershipId" 
                    placeholder="ফাঁকা রাখলে অটো জেনারেট হবে"
                    value={formData.membershipId} 
                    onChange={(e) => setFormData({...formData, membershipId: e.target.value})} 
                    className="h-12 border-slate-200 rounded-xl"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    className="h-12 rounded-xl"
                    onClick={() => setFormData({...formData, membershipId: 'LIB-' + Math.random().toString(36).substr(2, 6).toUpperCase()})}
                  >
                    Generate
                  </Button>
                </div>
              </div>
            </>
          )}

          {platforms.includes('it-education') && (
            <div className="space-y-2">
              <Label htmlFor="preferredCourse" className="font-bold text-primary">পছন্দের কোর্স (Preferred Course)</Label>
              <Input 
                id="preferredCourse" 
                placeholder="যেমন: গ্রাফিক ডিজাইন"
                value={formData.preferredCourse} 
                onChange={(e) => setFormData({...formData, preferredCourse: e.target.value})} 
                className="h-12 border-slate-200 rounded-xl"
              />
            </div>
          )}

          {platforms.includes('academic-care') && (
            <div className="space-y-2">
              <Label htmlFor="classGrade" className="font-bold text-primary">শ্রেণী / গ্রেড (Class / Grade)</Label>
              <Input 
                id="classGrade" 
                placeholder="যেমন: ৮ম শ্রেণী"
                value={formData.classGrade} 
                onChange={(e) => setFormData({...formData, classGrade: e.target.value})} 
                className="h-12 border-slate-200 rounded-xl"
              />
            </div>
          )}

          {platforms.includes('sporting-club') && (
            <>
              <div className="space-y-2">
                <Label htmlFor="preferredSport" className="font-bold text-primary">পছন্দের খেলা (Preferred Sport)</Label>
                <Input 
                  id="preferredSport" 
                  placeholder="যেমন: ফুটবল, ক্রিকেট, ই-স্পোর্টস"
                  value={formData.preferredSport} 
                  onChange={(e) => setFormData({...formData, preferredSport: e.target.value})} 
                  className="h-12 border-slate-200 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skillLevel" className="font-bold text-primary">দক্ষতার স্তর (Skill Level)</Label>
                <Select 
                  value={formData.skillLevel} 
                  onValueChange={(val) => setFormData({...formData, skillLevel: val})}
                >
                  <SelectTrigger id="skillLevel" className="h-12 border-slate-200 rounded-xl">
                    <SelectValue placeholder="স্তর নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">বিগিনার</SelectItem>
                    <SelectItem value="intermediate">ইন্টারমিডিয়েট</SelectItem>
                    <SelectItem value="pro">প্রো</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamName" className="font-bold text-primary">টিমের নাম (Team Name)</Label>
                <Input 
                  id="teamName" 
                  placeholder="যেমন: ইমপ্রুভমেন্ট টাইগার্স"
                  value={formData.teamName} 
                  onChange={(e) => setFormData({...formData, teamName: e.target.value})} 
                  className="h-12 border-slate-200 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialSkill" className="font-bold text-primary">বিশেষ দক্ষতা (Special Skill)</Label>
                <Input 
                  id="specialSkill" 
                  placeholder="যেমন: ফাস্ট বোলার, অলরাউন্ডার, উইঙ্গার"
                  value={formData.specialSkill} 
                  onChange={(e) => setFormData({...formData, specialSkill: e.target.value})} 
                  className="h-12 border-slate-200 rounded-xl"
                />
              </div>
            </>
          )}

          {platforms.includes('foundation') && (
            <>
              <div className="space-y-2">
                <Label htmlFor="volunteerInterest" className="font-bold text-primary">স্বেচ্ছাসেবী আগ্রহ (Interest)</Label>
                <Input 
                  id="volunteerInterest" 
                  placeholder="যেমন: ইভেন্ট ম্যানেজমেন্ট, ত্রাণ বিতরণ"
                  value={formData.volunteerInterest} 
                  onChange={(e) => setFormData({...formData, volunteerInterest: e.target.value})} 
                  className="h-12 border-slate-200 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="availability" className="font-bold text-primary">উপলব্ধতা (Availability)</Label>
                <Input 
                  id="availability" 
                  placeholder="যেমন: শুক্রবার, প্রতিদিন বিকাল"
                  value={formData.availability} 
                  onChange={(e) => setFormData({...formData, availability: e.target.value})} 
                  className="h-12 border-slate-200 rounded-xl"
                />
              </div>
            </>
          )}

          {platforms.includes('food-bank') && (
            <div className="space-y-2">
              <Label htmlFor="area" className="font-bold text-primary">এলাকা (Area/Residence)</Label>
              <Input 
                id="area" 
                placeholder="আপনার এলাকার নাম লিখুন"
                value={formData.area} 
                onChange={(e) => setFormData({...formData, area: e.target.value})} 
                className="h-12 border-slate-200 rounded-xl"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="occupation" className="font-bold text-primary">পেশা (Occupation)</Label>
            <Input 
              id="occupation" 
              placeholder="আপনার পেশা লিখুন"
              value={formData.occupation} 
              onChange={(e) => setFormData({...formData, occupation: e.target.value})} 
              className="h-12 border-slate-200 rounded-xl"
            />
          </div>
          <div className="col-span-full space-y-2">
            <Label htmlFor="institution" className="font-bold text-primary">প্রতিষ্ঠান / স্কুলের নাম</Label>
            <Input 
              id="institution" 
              placeholder="আপনার শিক্ষা প্রতিষ্ঠান বা কর্মস্থলের নাম"
              value={formData.institution} 
              onChange={(e) => setFormData({...formData, institution: e.target.value})} 
              className="h-12 border-slate-200 rounded-xl"
            />
          </div>
          <div className="col-span-full space-y-2">
            <Label htmlFor="address" className="font-bold text-primary">ঠিকানা (Address)</Label>
            <Input 
              id="address" 
              required 
              placeholder="আপনার বর্তমান ঠিকানা লিখুন"
              value={formData.address} 
              onChange={(e) => setFormData({...formData, address: e.target.value})} 
              className="h-12 border-slate-200 rounded-xl"
            />
          </div>
          <div className="col-span-full space-y-2">
            <Label htmlFor="message" className="font-bold text-primary">সংক্ষিপ্ত বার্তা (Message)</Label>
            <Textarea 
              id="message" 
              placeholder="আপনি কেন আমাদের সাথে যুক্ত হতে চান?"
              value={formData.message} 
              onChange={(e) => setFormData({...formData, message: e.target.value})} 
              className="border-slate-200 rounded-xl min-h-[100px]"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <Label className="font-bold text-primary">শর্তাবলী (Terms & Conditions)</Label>
          <ScrollArea className="h-32 w-full rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="mb-2">১. আপনি Improvement BD এর সকল নিয়ম মেনে চলতে বাধ্য থাকবেন।</p>
            <p className="mb-2">২. আপনার তথ্য শুধুমাত্র প্রতিষ্ঠানের প্রয়োজনে সংরক্ষিত থাকবে।</p>
            <p className="mb-2">৩. পরবর্তী ধাপের জন্য আপনার সাথে ফোন বা হোয়াটসঅ্যাপে যোগাযোগ করা হবে।</p>
            <p className="mb-2">৪. মেম্বারশিপের চূড়ান্ত সিদ্ধান্ত এডমিন প্যানেল গ্রহণ করবে।</p>
            <p className="mb-2">৫. প্ল্যাটফর্মের কোনো অপব্যবহার করলে মেম্বারশিপ বাতিল করা হতে পারে।</p>
          </ScrollArea>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              checked={acceptedTerms} 
              onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)} 
              className="rounded-md"
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 cursor-pointer"
            >
              আমি সকল শর্তাবলী মেনে নিচ্ছি
            </label>
          </div>
        </div>

        <Button type="submit" className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]" disabled={loading || !acceptedTerms}>
          {loading ? (language === 'bn' ? 'প্রসেসিং হচ্ছে...' : 'Processing...') : (language === 'bn' ? 'আবেদন জমা দিন' : 'Submit Application')}
        </Button>
      </form>
    </div>
  );
}
