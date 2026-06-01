import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Image as ImageIcon, Users, ShieldCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SportsAdmin() {
  const [banners, setBanners] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCommitteeDialogOpen, setIsCommitteeDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [editingMember, setEditingMember] = useState<any>(null);
  
  // Coach states
  const [coaches, setCoaches] = useState<any[]>([]);
  const [isCoachDialogOpen, setIsCoachDialogOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState<any>(null);
  const [coachFormData, setCoachFormData] = useState({
    name: '',
    fbId: '',
    team: '',
    specialSkill: '',
    photoURL: ''
  });
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    order: 0
  });

  const [committeeFormData, setCommitteeFormData] = useState({
    pod: '',
    teamName: '',
    isInCommittee: false
  });

  useEffect(() => {
    const q = query(collection(db, 'sports_banners'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBanners(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'sports_banners');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, 'members'), 
      where('platform', 'array-contains', 'sporting-club'),
      where('status', '==', 'approved')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'members');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'sports_coaches'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCoaches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'sports_coaches');
    });
    return () => unsubscribe();
  }, []);

  const handleCoachSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCoach) {
        await updateDoc(doc(db, 'sports_coaches', editingCoach.id), coachFormData);
      } else {
        await addDoc(collection(db, 'sports_coaches'), {
          ...coachFormData,
          createdAt: serverTimestamp()
        });
      }
      setIsCoachDialogOpen(false);
      setEditingCoach(null);
      setCoachFormData({ name: '', fbId: '', team: '', specialSkill: '', photoURL: '' });
    } catch (error) {
      handleFirestoreError(error, editingCoach ? OperationType.UPDATE : OperationType.CREATE, 'sports_coaches');
    }
  };

  const handleEditCoach = (coach: any) => {
    setEditingCoach(coach);
    setCoachFormData({
      name: coach.name || '',
      fbId: coach.fbId || '',
      team: coach.team || '',
      specialSkill: coach.specialSkill || '',
      photoURL: coach.photoURL || ''
    });
    setIsCoachDialogOpen(true);
  };

  const handleDeleteCoach = async (id: string) => {
    if (confirm('Delete this coach profile permanently?')) {
      try {
        await deleteDoc(doc(db, 'sports_coaches', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `sports_coaches/${id}`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        order: Number(formData.order)
      };
      if (editingBanner) {
        await updateDoc(doc(db, 'sports_banners', editingBanner.id), dataToSave);
      } else {
        await addDoc(collection(db, 'sports_banners'), {
          ...dataToSave,
          createdAt: serverTimestamp()
        });
      }
      setIsDialogOpen(false);
      setEditingBanner(null);
      setFormData({ title: '', subtitle: '', image: '', order: banners.length });
    } catch (error) {
      handleFirestoreError(error, editingBanner ? OperationType.UPDATE : OperationType.CREATE, 'sports_banners');
    }
  };

  const handleCommitteeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    try {
      await updateDoc(doc(db, 'members', editingMember.id), committeeFormData);
      setIsCommitteeDialogOpen(false);
      setEditingMember(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `members/${editingMember.id}`);
    }
  };

  const handleEdit = (banner: any) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      image: banner.image || '',
      order: banner.order || 0
    });
    setIsDialogOpen(true);
  };

  const handleEditCommittee = (member: any) => {
    setEditingMember(member);
    setCommitteeFormData({
      pod: member.pod || '',
      teamName: member.teamName || '',
      isInCommittee: member.isInCommittee || false
    });
    setIsCommitteeDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this banner?')) {
      try {
        await deleteDoc(doc(db, 'sports_banners', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `sports_banners/${id}`);
      }
    }
  };

  const committeeMembers = members.filter(m => m.isInCommittee);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-primary">Sports Management</h2>
          <p className="text-secondary font-medium">Manage banners and committee members for the Sporting Club.</p>
        </div>
      </div>

      <Tabs defaultValue="banners" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-14 p-1 bg-slate-100 rounded-2xl mb-8">
          <TabsTrigger value="banners" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <ImageIcon className="h-4 w-4 mr-2" /> Banners
          </TabsTrigger>
          <TabsTrigger value="committee" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Users className="h-4 w-4 mr-2" /> Committee
          </TabsTrigger>
          <TabsTrigger value="coaches" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <ShieldCheck className="h-4 w-4 mr-2" /> Coaches
          </TabsTrigger>
        </TabsList>

        <TabsContent value="banners" className="space-y-8 outline-none">
          <div className="flex justify-end">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-accent hover:bg-accent/90 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-accent/20"
                  onClick={() => {
                    setEditingBanner(null);
                    setFormData({ title: '', subtitle: '', image: '', order: banners.length });
                  }}
                >
                  <Plus className="mr-2 h-5 w-5" /> Add New Banner
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg dialog-solid">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-primary">
                    {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-primary">ব্যানার ইমেজ ইউআরএল (Image URL)</Label>
                    <Input 
                      required 
                      value={formData.image} 
                      onChange={e => setFormData({...formData, image: e.target.value})} 
                      placeholder="https://ibb.co/..."
                      className="h-12 input-solid"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-primary">প্রধান শিরোনাম (Title)</Label>
                    <Input 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})} 
                      placeholder="যেমন: ই-স্পোর্টস টুর্নামেন্ট ২০২৪"
                      className="h-12 input-solid"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-primary">উপ-শিরোনাম (Subtitle)</Label>
                    <Input 
                      value={formData.subtitle} 
                      onChange={e => setFormData({...formData, subtitle: e.target.value})} 
                      placeholder="যেমন: অংশ নিন এবং জিতে নিন আকর্ষণীয় পুরস্কার"
                      className="h-12 input-solid"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-primary">ডিসপ্লে অর্ডার (Display Order)</Label>
                    <Input 
                      type="number"
                      value={formData.order} 
                      onChange={e => setFormData({...formData, order: Number(e.target.value)})} 
                      placeholder="যেমন: 0, 1, 2..."
                      className="h-12 input-solid"
                    />
                  </div>
                  <Button type="submit" className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20">
                    {editingBanner ? 'ব্যানার আপডেট করুন' : 'ব্যানার যোগ করুন'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {banners.map((banner) => (
              <div key={banner.id} className="group card-solid">
                <div className="p-0">
                  <div className="aspect-[21/9] bg-slate-100 relative overflow-hidden">
                    <img 
                      src={banner.image} 
                      alt={banner.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-8">
                      {banner.title && <h3 className="text-white font-bold text-2xl mb-1">{banner.title}</h3>}
                      {banner.subtitle && <p className="text-white/80 font-medium">{banner.subtitle}</p>}
                    </div>
                  </div>
                  <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center text-sm font-bold text-secondary">
                      <ImageIcon className="h-4 w-4 mr-2" /> Order: {banner.order}
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        className="h-10 font-bold rounded-xl border-slate-200 hover:bg-slate-50" 
                        onClick={() => handleEdit(banner)}
                      >
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="h-10 w-10 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl" 
                        onClick={() => handleDelete(banner.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="committee" className="space-y-8 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* All Sports Members */}
            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-100">
              <CardHeader className="p-8 border-b border-slate-50">
                <CardTitle className="text-2xl font-black text-primary flex items-center gap-3">
                  <Users className="h-6 w-6 text-accent" />
                  All Sports Members
                </CardTitle>
                <p className="text-sm text-secondary font-medium">Approved members of the Sporting Club platform.</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[600px] overflow-y-auto p-8 space-y-4">
                  {members.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center overflow-hidden border border-slate-100">
                          {member.photoURL ? (
                            <img src={member.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <Users className="h-6 w-6 text-slate-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-primary">{member.fullName}</p>
                          <p className="text-xs text-secondary font-medium">{member.phonePrimary}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {member.isInCommittee ? (
                          <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold">In Committee</Badge>
                        ) : null}
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="rounded-lg hover:bg-white"
                          onClick={() => handleEditCommittee(member)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Committee Layout Preview */}
            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-100 bg-slate-900 text-white">
              <CardHeader className="p-8 border-b border-white/10">
                <CardTitle className="text-2xl font-black flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-accent" />
                  Committee Preview
                </CardTitle>
                <p className="text-sm text-white/60 font-medium">This is how the committee will appear on the public page.</p>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  {committeeMembers.length > 0 ? (
                    committeeMembers.map(m => (
                      <div key={m.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                          {m.photoURL ? (
                            <img src={m.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <Users className="h-6 w-6 text-white/20" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold truncate">{m.fullName}</p>
                          <p className="text-xs text-accent font-bold uppercase tracking-widest">{m.pod || 'Member'}</p>
                          <p className="text-[10px] text-white/40 truncate">{m.teamName || 'No Team'}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20 opacity-40 italic">
                      No members added to the committee yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Dialog open={isCommitteeDialogOpen} onOpenChange={setIsCommitteeDialogOpen}>
            <DialogContent className="max-w-md dialog-solid">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-primary">
                  Committee Settings
                </DialogTitle>
                <p className="text-secondary font-medium">{editingMember?.fullName}</p>
              </DialogHeader>
              <form onSubmit={handleCommitteeSubmit} className="space-y-6 pt-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <Label htmlFor="isInCommittee" className="font-bold text-primary cursor-pointer">
                    Show in Committee
                  </Label>
                  <Checkbox 
                    id="isInCommittee"
                    checked={committeeFormData.isInCommittee}
                    onCheckedChange={(val) => setCommitteeFormData({...committeeFormData, isInCommittee: !!val})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="font-bold text-primary">Designation / Pod</Label>
                  <Select 
                    value={committeeFormData.pod} 
                    onValueChange={(val) => setCommitteeFormData({...committeeFormData, pod: val})}
                  >
                    <SelectTrigger className="h-12 input-solid">
                      <SelectValue placeholder="Select Position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Team Leader">Team Leader</SelectItem>
                      <SelectItem value="Captain">Captain</SelectItem>
                      <SelectItem value="Vice Captain">Vice Captain</SelectItem>
                      <SelectItem value="President">President</SelectItem>
                      <SelectItem value="Member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-primary">Team Name</Label>
                  <Input 
                    value={committeeFormData.teamName}
                    onChange={(e) => setCommitteeFormData({...committeeFormData, teamName: e.target.value})}
                    placeholder="Enter team name"
                    className="h-12 input-solid"
                  />
                </div>

                <Button type="submit" className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20">
                  Save Changes
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="coaches" className="space-y-8 outline-none">
          <div className="flex justify-end">
            <Dialog open={isCoachDialogOpen} onOpenChange={setIsCoachDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-accent hover:bg-accent/90 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-accent/20"
                  onClick={() => {
                    setEditingCoach(null);
                    setCoachFormData({ name: '', fbId: '', team: '', specialSkill: '', photoURL: '' });
                  }}
                >
                  <Plus className="h-5 w-5 mr-1" /> Add Coach
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md dialog-solid">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-primary">
                    {editingCoach ? 'Edit Coach Profile' : 'Add New Coach'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCoachSubmit} className="space-y-4 pt-4">
                  <div className="space-y-1.5">
                    <Label className="font-bold text-primary">Name / নাম</Label>
                    <Input 
                      value={coachFormData.name}
                      onChange={(e) => setCoachFormData({...coachFormData, name: e.target.value})}
                      placeholder="e.g. সঞ্জিদ হাসান (Sanjid Hasan)"
                      className="h-11 input-solid text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-bold text-primary">Team Name / দলের নাম</Label>
                    <Input 
                      value={coachFormData.team}
                      onChange={(e) => setCoachFormData({...coachFormData, team: e.target.value})}
                      placeholder="e.g. Improvement Cricket Academy"
                      className="h-11 input-solid text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-bold text-primary">Special Skill / বিশেষ দক্ষতা</Label>
                    <Input 
                      value={coachFormData.specialSkill}
                      onChange={(e) => setCoachFormData({...coachFormData, specialSkill: e.target.value})}
                      placeholder="e.g. BCB Level 1 Certified Cricket Coach"
                      className="h-11 input-solid text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-bold text-primary">Facebook URL / ফেসবুক আইডি</Label>
                    <Input 
                      value={coachFormData.fbId}
                      onChange={(e) => setCoachFormData({...coachFormData, fbId: e.target.value})}
                      placeholder="e.g. https://facebook.com/username"
                      className="h-11 input-solid text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-bold text-primary">Photo URL / ছবির লিংক</Label>
                    <Input 
                      value={coachFormData.photoURL}
                      onChange={(e) => setCoachFormData({...coachFormData, photoURL: e.target.value})}
                      placeholder="e.g. https://images.unsplash.com/..."
                      className="h-11 input-solid text-sm"
                    />
                  </div>

                  <Button type="submit" className="w-full h-12 text-base font-bold rounded-xl shadow-lg">
                    {editingCoach ? 'Save Coach Profile' : 'Create Coach Profile'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coaches.length > 0 ? (
              coaches.map((c) => (
                <div key={c.id} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 flex items-start gap-4 justify-between group">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                      {c.photoURL ? (
                        <img src={c.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <Users className="h-6 w-6 text-slate-300 m-5" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black text-slate-800 leading-tight">{c.name}</h4>
                      <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider font-mono">{c.team}</p>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">{c.specialSkill}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg"
                      onClick={() => handleEditCoach(c)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      onClick={() => handleDeleteCoach(c.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-400">No coaches added to the database yet.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
