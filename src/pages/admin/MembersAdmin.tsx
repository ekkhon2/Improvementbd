import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '@/src/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, increment, addDoc, serverTimestamp } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { UserPlus, Search, Filter, Trash2, Check, X as CloseIcon, Eye, Edit, Save } from 'lucide-react';

export default function MembersAdmin() {
  const { platformId } = useParams();
  const [members, setMembers] = useState<any[]>([]);
  const [filterPlatform, setFilterPlatform] = useState(platformId || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [newMember, setNewMember] = useState({
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
    availability: '',
    volunteerInterest: '',
    area: '',
    platform: platformId ? [platformId] : ['foundation'],
    status: 'approved'
  });

  useEffect(() => {
    if (platformId) {
      setFilterPlatform(platformId);
      setNewMember(prev => ({ ...prev, platform: platformId }));
    }
  }, [platformId]);

  useEffect(() => {
    const q = query(collection(db, 'members'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    await updateDoc(doc(db, 'members', id), { status });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this member?')) {
      await deleteDoc(doc(db, 'members', id));
      await updateDoc(doc(db, 'stats', 'totals'), {
        members: increment(-1)
      });
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalMembershipId = newMember.membershipId;
      if (!finalMembershipId) {
        const prefix = newMember.platform.includes('library') ? 'LIB-' : 'MEM-';
        finalMembershipId = prefix + Math.random().toString(36).substr(2, 6).toUpperCase();
      }

      await addDoc(collection(db, 'members'), {
        ...newMember,
        membershipId: finalMembershipId,
        createdAt: serverTimestamp()
      });

      if (newMember.platform.includes('blood-bank')) {
        await addDoc(collection(db, 'donors'), {
          fullName: newMember.fullName,
          bloodGroup: newMember.bloodGroup,
          phonePrimary: newMember.phonePrimary,
          isWhatsApp: newMember.isWhatsApp,
          phoneSecondary: newMember.phoneSecondary,
          facebookURL: newMember.facebookURL,
          photoURL: newMember.photoURL,
          address: newMember.address,
          lastDonatedDate: newMember.lastDonationDate,
          age: newMember.age,
          weight: newMember.weight,
          status: 'available',
          createdAt: serverTimestamp(),
        });
      }

      await updateDoc(doc(db, 'stats', 'totals'), {
        members: increment(1),
        donors: newMember.platform.includes('blood-bank') ? increment(1) : increment(0)
      });

      setIsAddDialogOpen(false);
      setNewMember({
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
        availability: '',
        volunteerInterest: '',
        area: '',
        platform: platformId ? [platformId] : ['foundation'],
        status: 'approved'
      });
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    try {
      await updateDoc(doc(db, 'members', selectedMember.id), editData);
      setIsEditing(false);
      setSelectedMember({ ...selectedMember, ...editData });
      alert('Member updated successfully!');
    } catch (error) {
      console.error("Error updating member:", error);
      alert('Failed to update member.');
    }
  };

  const openDetail = (member: any) => {
    setSelectedMember(member);
    setEditData(member);
    setIsEditing(false);
    setIsDetailDialogOpen(true);
  };

  const filteredMembers = members.filter(m => {
    const matchesPlatform = filterPlatform === 'all' || 
                           (Array.isArray(m.platform) ? m.platform.includes(filterPlatform) : m.platform === filterPlatform);
    const matchesSearch = m.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         m.phonePrimary?.includes(searchQuery) ||
                         m.membershipId?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlatform && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-primary">
            {platformId ? `${platformId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Members` : 'Membership Management'}
          </h2>
          <p className="text-secondary font-medium">Manage and review membership requests across all platforms.</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-accent/20">
              <UserPlus className="mr-2 h-5 w-5" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dialog-solid p-0">
            <div className="p-8">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-bold text-primary">Add New Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddMember} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-bold text-primary">পুরো নাম (Full Name)</Label>
                    <Input 
                      id="name" 
                      value={newMember.fullName} 
                      onChange={e => setNewMember({...newMember, fullName: e.target.value})}
                      placeholder="পুরো নাম লিখুন"
                      required
                      className="h-12 input-solid"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-bold text-primary">ফোন নম্বর (Phone Number)</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="phone" 
                        value={newMember.phonePrimary} 
                        onChange={e => setNewMember({...newMember, phonePrimary: e.target.value})}
                        placeholder="ফোন নম্বর লিখুন"
                        required
                        className="h-12 input-solid flex-1"
                      />
                      <div className="flex items-center space-x-2 bg-slate-50 px-3 h-12 rounded-xl border border-slate-100">
                        <Checkbox 
                          id="isWhatsAppAdd" 
                          checked={newMember.isWhatsApp}
                          onCheckedChange={(checked) => setNewMember({...newMember, isWhatsApp: checked as boolean})}
                        />
                        <Label htmlFor="isWhatsAppAdd" className="text-[10px] font-bold text-success cursor-pointer">WhatsApp</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-full space-y-3">
                    <Label className="font-bold text-primary">প্ল্যাটফর্ম নির্বাচন করুন (Select Platforms)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      {[
                        { id: 'foundation', label: 'Foundation' },
                        { id: 'blood-bank', label: 'Blood Bank' },
                        { id: 'food-bank', label: 'Food Bank' },
                        { id: 'sporting-club', label: 'Sporting Club' },
                        { id: 'it-education', label: 'IT Education' },
                        { id: 'academic-care', label: 'Academic Care' },
                        { id: 'library', label: 'Library' }
                      ].map(p => (
                        <div key={p.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`platform-${p.id}`} 
                            checked={newMember.platform.includes(p.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewMember({ ...newMember, platform: [...newMember.platform, p.id] });
                              } else {
                                setNewMember({ ...newMember, platform: newMember.platform.filter(id => id !== p.id) });
                              }
                            }}
                          />
                          <Label htmlFor={`platform-${p.id}`} className="text-sm font-medium cursor-pointer">{p.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneSecondary" className="font-bold text-primary">বিকল্প ফোন (Secondary Phone)</Label>
                    <Input 
                      id="phoneSecondary" 
                      value={newMember.phoneSecondary} 
                      onChange={e => setNewMember({...newMember, phoneSecondary: e.target.value})}
                      placeholder="বিকল্প ফোন নম্বর"
                      className="h-12 input-solid"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="photoURLAdd" className="font-bold text-primary">ছবি লিংক (Photo URL)</Label>
                    <Input 
                      id="photoURLAdd" 
                      value={newMember.photoURL} 
                      onChange={e => setNewMember({...newMember, photoURL: e.target.value})}
                      placeholder="https://..."
                      className="h-12 input-solid"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="facebookURLAdd" className="font-bold text-primary">ফেসবুক লিংক (Facebook URL)</Label>
                    <Input 
                      id="facebookURLAdd" 
                      value={newMember.facebookURL} 
                      onChange={e => setNewMember({...newMember, facebookURL: e.target.value})}
                      placeholder="https://facebook.com/..."
                      className="h-12 input-solid"
                    />
                  </div>

                  <div className="col-span-full space-y-2">
                    <Label htmlFor="address" className="font-bold text-primary">ঠিকানা (Address)</Label>
                    <Input 
                      id="address" 
                      value={newMember.address} 
                      onChange={e => setNewMember({...newMember, address: e.target.value})}
                      placeholder="ঠিকানা লিখুন"
                      className="h-12 input-solid"
                    />
                  </div>

                  {newMember.platform.includes('blood-bank') && (
                    <>
                      <div className="space-y-2">
                        <Label className="font-bold text-primary">রক্তের গ্রুপ (Blood Group)</Label>
                        <Select value={newMember.bloodGroup} onValueChange={v => setNewMember({...newMember, bloodGroup: v})}>
                          <SelectTrigger className="h-12 rounded-xl border-slate-200">
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
                        <Label className="font-bold text-primary">বয়স (Age)</Label>
                        <Input 
                          type="number"
                          value={newMember.age} 
                          onChange={e => setNewMember({...newMember, age: e.target.value})}
                          className="h-12 input-solid"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-primary">ওজন (Weight)</Label>
                        <Input 
                          type="number"
                          value={newMember.weight} 
                          onChange={e => setNewMember({...newMember, weight: e.target.value})}
                          className="h-12 input-solid"
                        />
                      </div>
                    </>
                  )}

                  {newMember.platform.includes('foundation') && (
                    <>
                      <div className="space-y-2">
                        <Label className="font-bold text-primary">এলাকা (Foundation Area)</Label>
                        <Input 
                          value={newMember.foundationArea} 
                          onChange={e => setNewMember({...newMember, foundationArea: e.target.value})}
                          placeholder="যেমন: হাজারীবাগ, লালবাগ"
                          className="h-12 input-solid"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-primary">পদবী (Position)</Label>
                        <Select value={newMember.position} onValueChange={v => setNewMember({...newMember, position: v})}>
                          <SelectTrigger className="h-12 rounded-xl border-slate-200">
                            <SelectValue placeholder="পদবী নির্বাচন করুন" />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              'সভাপতি',
                              'সহ-সভাপতি',
                              'সাধারণ সম্পাদক',
                              'যুগ্ম সাধারণ সম্পাদক',
                              'সাংগঠনিক সম্পাদক',
                              'কোষাধ্যক্ষ',
                              'প্রচার সম্পাদক',
                              'দপ্তর সম্পাদক',
                              'সদস্য',
                              'কর্মী'
                            ].map(pos => (
                              <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {newMember.platform.includes('library') && (
                    <>
                      <div className="space-y-2">
                        <Label className="font-bold text-primary">সদস্যতার ধরন (Type)</Label>
                        <Select value={newMember.membershipType} onValueChange={v => setNewMember({...newMember, membershipType: v})}>
                          <SelectTrigger className="h-12 rounded-xl border-slate-200">
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
                        <Label className="font-bold text-primary">মেম্বারশিপ আইডি (ID)</Label>
                        <Input 
                          value={newMember.membershipId} 
                          onChange={e => setNewMember({...newMember, membershipId: e.target.value})}
                          placeholder="ফাঁকা রাখলে অটো জেনারেট হবে"
                          className="h-12 input-solid"
                        />
                      </div>
                    </>
                  )}

                  {newMember.platform.includes('it-education') && (
                    <div className="space-y-2">
                      <Label className="font-bold text-primary">পছন্দের কোর্স (Course)</Label>
                      <Input 
                        value={newMember.preferredCourse} 
                        onChange={e => setNewMember({...newMember, preferredCourse: e.target.value})}
                        className="h-12 input-solid"
                      />
                    </div>
                  )}

                  {newMember.platform.includes('academic-care') && (
                    <div className="space-y-2">
                      <Label className="font-bold text-primary">শ্রেণী (Class)</Label>
                      <Input 
                        value={newMember.classGrade} 
                        onChange={e => setNewMember({...newMember, classGrade: e.target.value})}
                        className="h-12 input-solid"
                      />
                    </div>
                  )}

                  {newMember.platform.includes('sporting-club') && (
                    <>
                      <div className="space-y-2">
                        <Label className="font-bold text-primary">পছন্দের খেলা (Sport)</Label>
                        <Input 
                          value={newMember.preferredSport} 
                          onChange={e => setNewMember({...newMember, preferredSport: e.target.value})}
                          className="h-12 input-solid"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-primary">টিমের নাম (Team Name)</Label>
                        <Input 
                          value={newMember.teamName} 
                          onChange={e => setNewMember({...newMember, teamName: e.target.value})}
                          className="h-12 input-solid"
                          placeholder="যেমন: ইমপ্রুভমেন্ট টাইগার্স"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-primary">विशेष দক্ষতা (Special Skill)</Label>
                        <Input 
                          value={newMember.specialSkill} 
                          onChange={e => setNewMember({...newMember, specialSkill: e.target.value})}
                          className="h-12 input-solid"
                          placeholder="যেমন: লেফট-আর্ম স্পিনার"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-primary">দক্ষতার স্তর (Level)</Label>
                        <Select value={newMember.skillLevel} onValueChange={v => setNewMember({...newMember, skillLevel: v})}>
                          <SelectTrigger className="h-12 rounded-xl border-slate-200">
                            <SelectValue placeholder="স্তর নির্বাচন করুন" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">বিগিনার</SelectItem>
                            <SelectItem value="intermediate">ইন্টারমিডিয়েট</SelectItem>
                            <SelectItem value="pro">প্রো</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label className="font-bold text-primary">পেশা (Occupation)</Label>
                    <Input 
                      value={newMember.occupation} 
                      onChange={e => setNewMember({...newMember, occupation: e.target.value})}
                      className="h-12 input-solid"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-primary">প্রতিষ্ঠান (Institution)</Label>
                    <Input 
                      value={newMember.institution} 
                      onChange={e => setNewMember({...newMember, institution: e.target.value})}
                      className="h-12 input-solid"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20">সদস্য যোগ করুন</Button>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
          <Input 
            placeholder="Search by name, phone or membership ID..." 
            className="pl-12 h-14 input-solid text-lg font-medium shadow-sm"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        {!platformId && (
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
            <Select value={filterPlatform} onValueChange={setFilterPlatform}>
              <SelectTrigger className="pl-12 h-14 input-solid text-lg font-bold text-primary shadow-sm">
                <SelectValue placeholder="Filter Platform" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="foundation">Foundation</SelectItem>
                <SelectItem value="blood-bank">Blood Bank</SelectItem>
                <SelectItem value="food-bank">Food Bank</SelectItem>
                <SelectItem value="sporting-club">Sporting Club</SelectItem>
                <SelectItem value="it-education">IT Education</SelectItem>
                <SelectItem value="academic-care">Academic Care</SelectItem>
                <SelectItem value="library">Library</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="card-solid">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="h-16 px-8 font-bold text-primary">Member Info</TableHead>
              {!platformId && <TableHead className="h-16 font-bold text-primary">Platform</TableHead>}
              <TableHead className="h-16 font-bold text-primary">Status</TableHead>
              <TableHead className="h-16 font-bold text-primary">Joined Date</TableHead>
              <TableHead className="h-16 px-8 text-right font-bold text-primary">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow key={member.id} className="hover:bg-slate-50/50 border-slate-50 transition-colors">
                <TableCell className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-primary shrink-0 overflow-hidden border border-slate-200">
                      {member.photoURL ? (
                        <img src={member.photoURL} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        member.fullName?.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="font-bold text-primary">{member.fullName}</p>
                        {member.isWhatsApp && (
                          <svg className="h-3 w-3 fill-success" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                        )}
                      </div>
                      <p className="text-sm text-secondary font-medium">{member.phonePrimary}</p>
                    </div>
                  </div>
                </TableCell>
                {!platformId && (
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(member.platform) ? member.platform.map((p: string) => (
                        <Badge key={p} variant="outline" className="capitalize font-bold border-slate-200 text-secondary text-[10px] px-1">
                          {p.replace('-', ' ')}
                        </Badge>
                      )) : (
                        <Badge variant="outline" className="capitalize font-bold border-slate-200 text-secondary text-[10px] px-1">
                          {member.platform?.replace('-', ' ')}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                )}
                <TableCell>
                  <Badge 
                    variant={member.status === 'approved' ? 'default' : member.status === 'rejected' ? 'destructive' : 'secondary'}
                    className="h-7 px-3 font-bold"
                  >
                    {member.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm font-medium text-secondary">
                  {member.createdAt?.toDate ? format(member.createdAt.toDate(), 'dd MMM yyyy') : 'N/A'}
                </TableCell>
                <TableCell className="px-8 text-right space-x-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-9 w-9 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                    onClick={() => openDetail(member)}
                  >
                    <Eye className="h-5 w-5" />
                  </Button>
                  {member.status === 'pending' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-9 w-9 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                        onClick={() => handleStatusChange(member.id, 'approved')}
                      >
                        <Check className="h-5 w-5" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-9 w-9 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg"
                        onClick={() => handleStatusChange(member.id, 'rejected')}
                      >
                        <CloseIcon className="h-5 w-5" />
                      </Button>
                    </>
                  )}
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                    onClick={() => handleDelete(member.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredMembers.length === 0 && (
              <TableRow>
                <TableCell colSpan={platformId ? 4 : 5} className="h-40 text-center text-secondary font-medium italic">
                  No members found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Member Detail & Edit Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto dialog-solid p-0">
          <div className="p-8">
            <DialogHeader className="mb-6 flex flex-row items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-primary">
                {isEditing ? 'Edit Member Details' : 'Member Details'}
              </DialogTitle>
              {!isEditing && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl gap-2"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4" /> Edit
                </Button>
              )}
            </DialogHeader>

            {selectedMember && (
              <div className="flex flex-col items-center mb-8">
                <div className="h-32 w-28 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-4xl text-primary overflow-hidden border-2 border-slate-200 shadow-inner mb-4">
                  {selectedMember.photoURL ? (
                    <img src={selectedMember.photoURL} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    selectedMember.fullName?.charAt(0)
                  )}
                </div>
                <h3 className="text-xl font-bold text-primary">{selectedMember.fullName}</h3>
                <Badge variant="outline" className="mt-2 font-bold border-slate-200">
                  ID: {selectedMember.membershipId || 'N/A'}
                </Badge>
              </div>
            )}

            {selectedMember && (
              <form onSubmit={handleUpdateMember} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Common Fields */}
                  <div className="space-y-2">
                    <Label className="font-bold text-primary">Full Name</Label>
                    {isEditing ? (
                      <Input 
                        value={editData.fullName} 
                        onChange={e => setEditData({...editData, fullName: e.target.value})}
                        className="h-12 input-solid"
                      />
                    ) : (
                      <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-medium">{selectedMember.fullName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-primary">Phone Number</Label>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Input 
                          value={editData.phonePrimary} 
                          onChange={e => setEditData({...editData, phonePrimary: e.target.value})}
                          className="h-12 input-solid flex-1"
                        />
                        <div className="flex items-center space-x-2 bg-slate-50 px-3 h-12 rounded-xl border border-slate-100">
                          <Checkbox 
                            id="isWhatsAppEdit" 
                            checked={editData.isWhatsApp}
                            onCheckedChange={(checked) => setEditData({...editData, isWhatsApp: checked as boolean})}
                          />
                          <Label htmlFor="isWhatsAppEdit" className="text-[10px] font-bold text-success cursor-pointer">WhatsApp</Label>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-medium flex items-center gap-2">
                        {selectedMember.phonePrimary}
                        {selectedMember.isWhatsApp && (
                          <svg className="h-4 w-4 fill-success" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-primary">Secondary Phone</Label>
                    {isEditing ? (
                      <Input 
                        value={editData.phoneSecondary} 
                        onChange={e => setEditData({...editData, phoneSecondary: e.target.value})}
                        className="h-12 input-solid"
                      />
                    ) : (
                      <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-medium">{selectedMember.phoneSecondary || 'N/A'}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-primary">Photo URL</Label>
                    {isEditing ? (
                      <Input 
                        value={editData.photoURL} 
                        onChange={e => setEditData({...editData, photoURL: e.target.value})}
                        className="h-12 input-solid"
                      />
                    ) : (
                      <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        {selectedMember.photoURL && (
                          <img src={selectedMember.photoURL} alt="" className="h-12 w-10 object-cover rounded border border-slate-200" referrerPolicy="no-referrer" />
                        )}
                        <p className="font-medium text-xs truncate flex-1">{selectedMember.photoURL || 'No photo link'}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-primary">Facebook URL</Label>
                    {isEditing ? (
                      <Input 
                        value={editData.facebookURL} 
                        onChange={e => setEditData({...editData, facebookURL: e.target.value})}
                        className="h-12 input-solid"
                      />
                    ) : (
                      <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-medium truncate">
                        {selectedMember.facebookURL ? (
                          <a href={selectedMember.facebookURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {selectedMember.facebookURL}
                          </a>
                        ) : 'N/A'}
                      </p>
                    )}
                  </div>

                  <div className="col-span-full space-y-3">
                    <Label className="font-bold text-primary">Platform</Label>
                    {isEditing ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        {[
                          { id: 'foundation', label: 'Foundation' },
                          { id: 'blood-bank', label: 'Blood Bank' },
                          { id: 'food-bank', label: 'Food Bank' },
                          { id: 'sporting-club', label: 'Sporting Club' },
                          { id: 'it-education', label: 'IT Education' },
                          { id: 'academic-care', label: 'Academic Care' },
                          { id: 'library', label: 'Library' }
                        ].map(p => (
                          <div key={p.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`edit-platform-${p.id}`} 
                              checked={Array.isArray(editData.platform) ? editData.platform.includes(p.id) : editData.platform === p.id}
                              onCheckedChange={(checked) => {
                                const currentPlatforms = Array.isArray(editData.platform) ? editData.platform : [editData.platform];
                                if (checked) {
                                  setEditData({ ...editData, platform: [...currentPlatforms, p.id] });
                                } else {
                                  setEditData({ ...editData, platform: currentPlatforms.filter(id => id !== p.id) });
                                }
                              }}
                            />
                            <Label htmlFor={`edit-platform-${p.id}`} className="text-sm font-medium cursor-pointer">{p.label}</Label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        {Array.isArray(selectedMember.platform) ? selectedMember.platform.map((p: string) => (
                          <Badge key={p} className="capitalize font-bold bg-white text-accent border-slate-200">
                            {p.replace('-', ' ')}
                          </Badge>
                        )) : (
                          <Badge className="capitalize font-bold bg-white text-accent border-slate-200">
                            {selectedMember.platform?.replace('-', ' ')}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="col-span-full space-y-2">
                    <Label className="font-bold text-primary">Address</Label>
                    {isEditing ? (
                      <Input 
                        value={editData.address} 
                        onChange={e => setEditData({...editData, address: e.target.value})}
                        className="h-12 input-solid"
                      />
                    ) : (
                      <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-medium">{selectedMember.address}</p>
                    )}
                  </div>

                  {/* Platform Specific Fields */}
                  {editData.platform.includes('foundation') && (
                    <>
                      <div className="space-y-2">
                        <Label className="font-bold text-primary">Foundation Area</Label>
                        {isEditing ? (
                          <Input 
                            value={editData.foundationArea} 
                            onChange={e => setEditData({...editData, foundationArea: e.target.value})}
                            className="h-12 input-solid"
                          />
                        ) : (
                          <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-medium">{selectedMember.foundationArea || 'N/A'}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-primary">Position</Label>
                        {isEditing ? (
                          <Select value={editData.position} onValueChange={v => setEditData({...editData, position: v})}>
                            <SelectTrigger className="h-12 rounded-xl border-slate-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[
                                'সভাপতি',
                                'সহ-সভাপতি',
                                'সাধারণ সম্পাদক',
                                'যুগ্ম সাধারণ সম্পাদক',
                                'সাংগঠনিক সম্পাদক',
                                'কোষাধ্যক্ষ',
                                'প্রচার সম্পাদক',
                                'দপ্তর সম্পাদক',
                                'সদস্য',
                                'কর্মী'
                              ].map(pos => (
                                <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-medium">{selectedMember.position || 'N/A'}</p>
                        )}
                      </div>
                    </>
                  )}

                  {selectedMember.bloodGroup && (
                    <div className="space-y-2">
                      <Label className="font-bold text-primary">Blood Group</Label>
                      {isEditing ? (
                        <Select value={editData.bloodGroup} onValueChange={v => setEditData({...editData, bloodGroup: v})}>
                          <SelectTrigger className="h-12 rounded-xl border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                              <SelectItem key={group} value={group}>{group}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-bold text-rose-600">{selectedMember.bloodGroup}</p>
                      )}
                    </div>
                  )}

                  {selectedMember.age && (
                    <div className="space-y-2">
                      <Label className="font-bold text-primary">Age</Label>
                      {isEditing ? (
                        <Input 
                          type="number"
                          value={editData.age} 
                          onChange={e => setEditData({...editData, age: e.target.value})}
                          className="h-12 input-solid"
                        />
                      ) : (
                        <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-medium">{selectedMember.age}</p>
                      )}
                    </div>
                  )}

                  {selectedMember.weight && (
                    <div className="space-y-2">
                      <Label className="font-bold text-primary">Weight</Label>
                      {isEditing ? (
                        <Input 
                          type="number"
                          value={editData.weight} 
                          onChange={e => setEditData({...editData, weight: e.target.value})}
                          className="h-12 input-solid"
                        />
                      ) : (
                        <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-medium">{selectedMember.weight} kg</p>
                      )}
                    </div>
                  )}

                  {selectedMember.membershipId && (
                    <div className="space-y-2">
                      <Label className="font-bold text-primary">Membership ID</Label>
                      {isEditing ? (
                        <Input 
                          value={editData.membershipId} 
                          onChange={e => setEditData({...editData, membershipId: e.target.value})}
                          className="h-12 input-solid"
                        />
                      ) : (
                        <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-bold text-primary">{selectedMember.membershipId}</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="font-bold text-primary">Occupation</Label>
                    {isEditing ? (
                      <Input 
                        value={editData.occupation} 
                        onChange={e => setEditData({...editData, occupation: e.target.value})}
                        className="h-12 input-solid"
                      />
                    ) : (
                      <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-medium">{selectedMember.occupation || 'N/A'}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-primary">Institution</Label>
                    {isEditing ? (
                      <Input 
                        value={editData.institution} 
                        onChange={e => setEditData({...editData, institution: e.target.value})}
                        className="h-12 input-solid"
                      />
                    ) : (
                      <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-medium">{selectedMember.institution || 'N/A'}</p>
                    )}
                  </div>

                  <div className="col-span-full space-y-2">
                    <Label className="font-bold text-primary">Message / Note</Label>
                    {isEditing ? (
                      <Input 
                        value={editData.message} 
                        onChange={e => setEditData({...editData, message: e.target.value})}
                        className="h-12 input-solid"
                      />
                    ) : (
                      <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-medium italic">"{selectedMember.message || 'No message'}"</p>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-4 pt-4">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="flex-1 h-12 font-bold rounded-xl"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 h-12 font-bold rounded-xl gap-2"
                    >
                      <Save className="h-4 w-4" /> Save Changes
                    </Button>
                  </div>
                )}
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
