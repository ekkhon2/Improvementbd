import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Image as ImageIcon, Users, ShieldCheck, Search, Trophy } from 'lucide-react';
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
  const [memberSearch, setMemberSearch] = useState('');
  
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

  // Dynamic Players and Teams States
  const [allSportsMembers, setAllSportsMembers] = useState<any[]>([]);
  const [sportsTeams, setSportsTeams] = useState<any[]>([]);
  
  // Players tab UI/Control states
  const [isPlayerAddDialogOpen, setIsPlayerAddDialogOpen] = useState(false);
  const [isPlayerEditDialogOpen, setIsPlayerEditDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [playerSearch, setPlayerSearch] = useState('');
  
  const [playerFormData, setPlayerFormData] = useState({
    fullName: '',
    phonePrimary: '',
    facebookURL: '',
    photoURL: '',
    teamName: '',
    skillLevel: 'beginner',
    preferredSport: 'cricket',
    specialSkill: '',
    totalRuns: 0,
    totalWickets: 0
  });

  // Teams tab UI/Control states
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [teamSearch, setTeamSearch] = useState('');
  
  const [teamFormData, setTeamFormData] = useState({
    name: '',
    logo: '',
    leaderName: '',
    coachName: ''
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

  // Fetch all sporting members (pending & approved) for structural tabs
  useEffect(() => {
    const q = query(
      collection(db, 'members'),
      where('platform', 'array-contains', 'sporting-club')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAllSportsMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'members');
    });
    return () => unsubscribe();
  }, []);

  // Fetch all sports teams
  useEffect(() => {
    const q = query(collection(db, 'sports_teams'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSportsTeams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'sports_teams');
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

  const handleRemoveFromCommittee = async (memberId: string) => {
    if (confirm('Are you sure you want to remove this member from the committee?')) {
      try {
        await updateDoc(doc(db, 'members', memberId), {
          isInCommittee: false
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `members/${memberId}`);
      }
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

  // Player action handlers
  const handlePlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSave = {
        fullName: playerFormData.fullName,
        phonePrimary: playerFormData.phonePrimary,
        facebookURL: playerFormData.facebookURL,
        photoURL: playerFormData.photoURL,
        teamName: playerFormData.teamName,
        skillLevel: playerFormData.skillLevel,
        preferredSport: playerFormData.preferredSport,
        specialSkill: playerFormData.specialSkill,
        totalRuns: Number(playerFormData.totalRuns) || 0,
        totalWickets: Number(playerFormData.totalWickets) || 0,
        platform: ['sporting-club'],
        status: 'approved'
      };
      
      if (editingPlayer) {
        await updateDoc(doc(db, 'members', editingPlayer.id), {
          fullName: playerFormData.fullName,
          phonePrimary: playerFormData.phonePrimary,
          facebookURL: playerFormData.facebookURL,
          photoURL: playerFormData.photoURL,
          teamName: playerFormData.teamName,
          skillLevel: playerFormData.skillLevel,
          preferredSport: playerFormData.preferredSport,
          specialSkill: playerFormData.specialSkill,
          totalRuns: Number(playerFormData.totalRuns) || 0,
          totalWickets: Number(playerFormData.totalWickets) || 0,
        });
        setIsPlayerEditDialogOpen(false);
      } else {
        await addDoc(collection(db, 'members'), {
          ...dataToSave,
          createdAt: serverTimestamp()
        });
        setIsPlayerAddDialogOpen(false);
      }
      setEditingPlayer(null);
      setPlayerFormData({
        fullName: '',
        phonePrimary: '',
        facebookURL: '',
        photoURL: '',
        teamName: '',
        skillLevel: 'beginner',
        preferredSport: 'cricket',
        specialSkill: '',
        totalRuns: 0,
        totalWickets: 0
      });
    } catch (error) {
      handleFirestoreError(error, editingPlayer ? OperationType.UPDATE : OperationType.CREATE, 'members');
    }
  };

  const handleEditPlayer = (player: any) => {
    setEditingPlayer(player);
    setPlayerFormData({
      fullName: player.fullName || '',
      phonePrimary: player.phonePrimary || '',
      facebookURL: player.facebookURL || '',
      photoURL: player.photoURL || '',
      teamName: player.teamName || '',
      skillLevel: player.skillLevel || 'beginner',
      preferredSport: player.preferredSport || 'cricket',
      specialSkill: player.specialSkill || '',
      totalRuns: player.totalRuns !== undefined ? player.totalRuns : 0,
      totalWickets: player.totalWickets !== undefined ? player.totalWickets : 0
    });
    setIsPlayerEditDialogOpen(true);
  };

  const handleApproveRequest = async (memberId: string) => {
    try {
      await updateDoc(doc(db, 'members', memberId), {
        status: 'approved'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `members/${memberId}`);
    }
  };

  const handleRemovePlayer = async (memberId: string) => {
    if (confirm('Are you sure you want to delete this player/request permanently?')) {
      try {
        await deleteDoc(doc(db, 'members', memberId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `members/${memberId}`);
      }
    }
  };

  // Team action handlers
  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTeam) {
        await updateDoc(doc(db, 'sports_teams', editingTeam.id), teamFormData);
      } else {
        await addDoc(collection(db, 'sports_teams'), {
          ...teamFormData,
          createdAt: serverTimestamp()
        });
      }
      setIsTeamDialogOpen(false);
      setEditingTeam(null);
      setTeamFormData({ name: '', logo: '', leaderName: '', coachName: '' });
    } catch (error) {
      handleFirestoreError(error, editingTeam ? OperationType.UPDATE : OperationType.CREATE, 'sports_teams');
    }
  };

  const handleEditTeam = (team: any) => {
    setEditingTeam(team);
    setTeamFormData({
      name: team.name || '',
      logo: team.logo || '',
      leaderName: team.leaderName || '',
      coachName: team.coachName || ''
    });
    setIsTeamDialogOpen(true);
  };

  const handleDeleteTeam = async (id: string) => {
    if (confirm('Delete this team permanently?')) {
      try {
        await deleteDoc(doc(db, 'sports_teams', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `sports_teams/${id}`);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-primary">Sports Management</h2>
          <p className="text-secondary font-medium">Manage banners and committee members for the Sporting Club.</p>
        </div>
      </div>

      <Tabs defaultValue="banners" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto md:h-14 p-1 bg-slate-100 rounded-2xl mb-8 gap-1">
          <TabsTrigger value="banners" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <ImageIcon className="h-4 w-4 mr-2" /> Banners
          </TabsTrigger>
          <TabsTrigger value="committee" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Users className="h-4 w-4 mr-2" /> Committee
          </TabsTrigger>
          <TabsTrigger value="coaches" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <ShieldCheck className="h-4 w-4 mr-2" /> Coaches
          </TabsTrigger>
          <TabsTrigger value="players" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Users className="h-4 w-4 mr-2" /> Players
          </TabsTrigger>
          <TabsTrigger value="teams" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Trophy className="h-4 w-4 mr-2" /> Teams
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
              <CardHeader className="p-8 border-b border-slate-50 space-y-4">
                <div>
                  <CardTitle className="text-2xl font-black text-primary flex items-center gap-3">
                    <Users className="h-6 w-6 text-accent" />
                    All Sports Members
                  </CardTitle>
                  <p className="text-sm text-secondary font-medium">Approved members of the Sporting Club platform.</p>
                </div>
                {/* Search Bar for Quick Addition */}
                <div className="relative">
                  <Input 
                    type="text"
                    placeholder="Search member by name, phone or sport..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="h-11 pl-4 pr-4 rounded-xl border-slate-200 focus:ring-1 focus:ring-accent"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[600px] overflow-y-auto p-8 space-y-4">
                  {members.filter(m => {
                    const q = memberSearch.toLowerCase();
                    return (m.fullName || '').toLowerCase().includes(q) || 
                      (m.phonePrimary || '').includes(q) || 
                      (m.preferredSport || '').toLowerCase().includes(q) ||
                      (m.teamName || '').toLowerCase().includes(q);
                  }).map(member => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl transition-all group">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center overflow-hidden border border-slate-100 shrink-0">
                          {member.photoURL ? (
                            <img src={member.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <Users className="h-6 w-6 text-slate-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-primary truncate">{member.fullName}</p>
                          <p className="text-xs text-secondary font-medium">{member.phonePrimary}</p>
                          {member.preferredSport && (
                            <p className="text-[10px] text-accent font-bold mt-0.5">{member.preferredSport}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {member.isInCommittee ? (
                          <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px]">In Committee</Badge>
                        ) : null}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className={`rounded-xl font-bold h-9 text-xs px-3 gap-1 ${
                            member.isInCommittee 
                              ? 'border-slate-200 text-slate-700 hover:bg-slate-50' 
                              : 'border-accent bg-accent/5 text-accent hover:bg-accent/10'
                          }`}
                          onClick={() => handleEditCommittee(member)}
                        >
                          {member.isInCommittee ? 'Manage' : '+ Add'}
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
                      <div key={m.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 gap-4 group">
                        <div className="flex items-center gap-4 min-w-0">
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
                        
                        {/* Interactive Edit and Direct Remove Options */}
                        <div className="flex gap-2 shrink-0">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-9 w-9 p-0 text-white hover:bg-white/15 rounded-xl transition-all"
                            onClick={() => handleEditCommittee(m)}
                            title="Edit Role/Team"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-9 w-9 p-0 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition-all"
                            onClick={() => handleRemoveFromCommittee(m.id)}
                            title="Remove from Committee"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

        {/* Players Tab Content */}
        <TabsContent value="players" className="space-y-8 outline-none">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input 
                value={playerSearch}
                onChange={e => setPlayerSearch(e.target.value)}
                placeholder="খেলোয়াড় খুঁজুন..."
                className="pl-10 h-10 input-solid"
              />
            </div>
            
            <Dialog open={isPlayerAddDialogOpen} onOpenChange={setIsPlayerAddDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-accent hover:bg-accent/90 text-white font-bold h-11 px-5 rounded-xl shadow-md cursor-pointer w-full sm:w-auto"
                  onClick={() => {
                    setEditingPlayer(null);
                    setPlayerFormData({
                      fullName: '',
                      phonePrimary: '',
                      facebookURL: '',
                      photoURL: '',
                      teamName: '',
                      skillLevel: 'beginner',
                      preferredSport: 'cricket',
                      specialSkill: '',
                      totalRuns: 0,
                      totalWickets: 0
                    });
                  }}
                >
                  <Plus className="mr-1.5 h-4 w-4" /> সরাসরি প্লেয়ার যোগ করুন
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md dialog-solid max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-primary">সরাসরি নতুন খেলোয়াড় যোগ করুন</DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePlayerSubmit} className="space-y-4 pt-4">
                  <div className="space-y-1.5">
                    <Label className="font-bold text-primary">খেলোয়াড়ের নাম (Full Name)</Label>
                    <Input 
                      required 
                      value={playerFormData.fullName} 
                      onChange={e => setPlayerFormData({...playerFormData, fullName: e.target.value})}
                      placeholder="যেমন: ইমরান হোসেন"
                      className="input-solid h-10"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="font-bold text-primary">মোবাইল নম্বর</Label>
                      <Input 
                        required 
                        value={playerFormData.phonePrimary} 
                        onChange={e => setPlayerFormData({...playerFormData, phonePrimary: e.target.value})}
                        placeholder="যেমন: 01700000000"
                        className="input-solid h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-bold text-primary">ফেসবুক প্রোফাইল লিংক</Label>
                      <Input 
                        value={playerFormData.facebookURL} 
                        onChange={e => setPlayerFormData({...playerFormData, facebookURL: e.target.value})}
                        placeholder="যেমন: https://facebook.com/..."
                        className="input-solid h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-bold text-primary">পাসপোর্ট সাইজ ছবি লিংক (Photo URL)</Label>
                    <Input 
                      value={playerFormData.photoURL} 
                      onChange={e => setPlayerFormData({...playerFormData, photoURL: e.target.value})}
                      placeholder="https://images.unsplash.com/..."
                      className="input-solid h-10"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="font-bold text-primary">খেলার ধরণ (Sport)</Label>
                      <Select 
                        value={playerFormData.preferredSport} 
                        onValueChange={val => setPlayerFormData({...playerFormData, preferredSport: val})}
                      >
                        <SelectTrigger className="input-solid h-10 bg-white">
                          <SelectValue placeholder="খেলা নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent className="bg-white z-[9999]">
                          <SelectItem value="cricket">ক্রিকেট (Cricket)</SelectItem>
                          <SelectItem value="football">ফুটবল (Football)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-bold text-primary">খেলোয়াড় লেবেল (Level)</Label>
                      <Select 
                        value={playerFormData.skillLevel} 
                        onValueChange={val => setPlayerFormData({...playerFormData, skillLevel: val as any})}
                      >
                        <SelectTrigger className="input-solid h-10 bg-white">
                          <SelectValue placeholder="লেভেল নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent className="bg-white z-[9999]">
                          <SelectItem value="pro">প্রো লেভেল (Pro)</SelectItem>
                          <SelectItem value="intermediate">ইন্টারমিডিয়েট (Intermediate)</SelectItem>
                          <SelectItem value="beginner">বিগিনার (Beginner)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="font-bold text-primary">দলের নাম (Team Name)</Label>
                      <Input 
                        value={playerFormData.teamName} 
                        onChange={e => setPlayerFormData({...playerFormData, teamName: e.target.value})}
                        placeholder="যেমন: ইমপ্রুভমেন্ট ফাইটারস"
                        className="input-solid h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-bold text-primary">বিশেষ দক্ষতা (Specialty)</Label>
                      <Input 
                        value={playerFormData.specialSkill} 
                        onChange={e => setPlayerFormData({...playerFormData, specialSkill: e.target.value})}
                        placeholder="যেমন: ফার্স্ট বোলার / রাইট-হ্যান্ড স্ট্রাইকার"
                        className="input-solid h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div className="space-y-1.5">
                      <Label className="font-bold text-primary">মোট রান (Lifetime Runs)</Label>
                      <Input 
                        type="number"
                        value={playerFormData.totalRuns} 
                        onChange={e => setPlayerFormData({...playerFormData, totalRuns: Number(e.target.value) || 0})}
                        placeholder="যেমন: 3500"
                        className="input-solid h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-bold text-primary">মোট উইকেট (Lifetime Wickets)</Label>
                      <Input 
                        type="number"
                        value={playerFormData.totalWickets} 
                        onChange={e => setPlayerFormData({...playerFormData, totalWickets: Number(e.target.value) || 0})}
                        placeholder="যেমন: 45"
                        className="input-solid h-10"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-11 text-base font-bold rounded-xl shadow-md mt-2">
                    খেলোয়াড় সংরক্ষণ করুন
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Pending requests */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pending</Badge>
              নতুন সদস্য আবেদন তালিকা (Pending Membership Requests)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allSportsMembers.filter(m => m.status === 'pending').length > 0 ? (
                allSportsMembers.filter(m => m.status === 'pending').map(m => (
                  <div key={m.id} className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col md:flex-row justify-between gap-4 shadow-sm text-left">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                        {m.photoURL ? (
                          <img src={m.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <Users className="h-5 w-5 text-slate-300 m-4.5" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-800 text-sm">{m.fullName}</h4>
                        <p className="text-xs text-slate-500 font-mono">{m.phonePrimary} {m.address ? `| ${m.address}` : ''}</p>
                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                          Sport: {m.preferredSport || m.interest || 'Not Specified'} {m.skillLevel ? `(${m.skillLevel})` : ''}
                        </p>
                        {m.message && (
                          <p className="text-[11px] text-slate-400 italic font-medium leading-tight">" {m.message} "</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:flex-col shrink-0">
                      <Button 
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl w-full"
                        onClick={() => handleApproveRequest(m.id)}
                      >
                        অনুমোদন (Approve)
                      </Button>
                      <Button 
                        size="sm"
                        variant="ghost"
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 font-bold rounded-xl w-full"
                        onClick={() => handleRemovePlayer(m.id)}
                      >
                        বাতিল (Reject)
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs font-bold text-slate-400">কোনো নতুন ক্লাব সদস্যের আবেদন জমা নেই।</p>
                </div>
              )}
            </div>
          </div>

          {/* Active players list */}
          <div className="space-y-4 pt-4 border-t border-slate-150">
            <h3 className="text-lg font-black text-slate-800">
              বর্তমান সক্রিয় খেলোয়াড়বৃন্দ (Active Players & Statistics)
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allSportsMembers.filter(m => {
                if (m.status !== 'approved') return false;
                if (!playerSearch) return true;
                const searchTxt = playerSearch.toLowerCase();
                return m.fullName.toLowerCase().includes(searchTxt) || 
                       (m.teamName || '').toLowerCase().includes(searchTxt) ||
                       (m.preferredSport || '').toLowerCase().includes(searchTxt);
              }).length > 0 ? (
                allSportsMembers.filter(m => {
                  if (m.status !== 'approved') return false;
                  if (!playerSearch) return true;
                  const searchTxt = playerSearch.toLowerCase();
                  return m.fullName.toLowerCase().includes(searchTxt) || 
                         (m.teamName || '').toLowerCase().includes(searchTxt) ||
                         (m.preferredSport || '').toLowerCase().includes(searchTxt);
                }).map(p => (
                  <div key={p.id} className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between text-left">
                    <div>
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                          {p.photoURL ? (
                            <img src={p.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <Users className="h-6 w-6 text-slate-300 m-5" />
                          )}
                        </div>
                        <div className="min-w-0 space-y-1 text-left">
                          <h4 className="font-extrabold text-slate-800 leading-tight truncate">{p.fullName}</h4>
                          <Badge className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg
                            ${p.skillLevel === 'pro' ? 'bg-amber-100 text-amber-800 animate-pulse' : ''}
                            ${p.skillLevel === 'intermediate' ? 'bg-emerald-100 text-emerald-800' : ''}
                            ${p.skillLevel === 'beginner' ? 'bg-sky-100 text-sky-850' : ''}
                          `}>
                            {p.skillLevel ? p.skillLevel.toUpperCase() : 'MEMBER'}
                          </Badge>
                          <p className="text-[10px] font-bold text-emerald-600 font-mono uppercase tracking-wider truncate">{p.teamName || 'NO TEAM'}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{p.phonePrimary || 'No Phone'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100 flex-grow">
                        <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-50">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total Runs</p>
                          <p className="text-sm font-black text-slate-800">{p.totalRuns || 0}</p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-50">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total Wickets</p>
                          <p className="text-sm font-black text-slate-800">{p.totalWickets || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl flex-grow font-bold h-9 bg-slate-50 hover:bg-slate-100 text-slate-700"
                        onClick={() => handleEditPlayer(p)}
                      >
                        <Edit className="h-3.5 w-3.5 mr-1" /> এডিট
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl hover:bg-rose-50 text-rose-500 hover:text-rose-600 border-slate-100 shrink-0 h-9"
                        onClick={() => handleRemovePlayer(p.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-16 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                  <p className="text-sm font-bold text-slate-400">কোনো খেলোয়াড় পাওয়া যায়নি।</p>
                </div>
              )}
            </div>
          </div>

          {/* Edit player statistics catalog */}
          <Dialog open={isPlayerEditDialogOpen} onOpenChange={setIsPlayerEditDialogOpen}>
            <DialogContent className="max-w-md dialog-solid max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-primary">খেলোয়াড়ের তথ্য ও স্কোর আপডেট</DialogTitle>
                <p className="text-slate-500 font-bold">{editingPlayer?.fullName}</p>
              </DialogHeader>
              <form onSubmit={handlePlayerSubmit} className="space-y-4 pt-4 text-left">
                <div className="space-y-1.5">
                  <Label className="font-bold text-primary">খেলোয়াড়ের নাম (Full Name)</Label>
                  <Input 
                    required 
                    value={playerFormData.fullName} 
                    onChange={e => setPlayerFormData({...playerFormData, fullName: e.target.value})}
                    className="input-solid h-10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="font-bold text-primary">মোবাইল নম্বর</Label>
                    <Input 
                      required 
                      value={playerFormData.phonePrimary} 
                      onChange={e => setPlayerFormData({...playerFormData, phonePrimary: e.target.value})}
                      className="input-solid h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-bold text-primary">ফেসবুক প্রোফাইল লিংক</Label>
                    <Input 
                      value={playerFormData.facebookURL} 
                      onChange={e => setPlayerFormData({...playerFormData, facebookURL: e.target.value})}
                      className="input-solid h-10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="font-bold text-primary">ছবি লিংক (Photo URL)</Label>
                  <Input 
                    value={playerFormData.photoURL} 
                    onChange={e => setPlayerFormData({...playerFormData, photoURL: e.target.value})}
                    className="input-solid h-10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="font-bold text-primary">খেলার ধরণ (Sport)</Label>
                    <Select 
                      value={playerFormData.preferredSport} 
                      onValueChange={val => setPlayerFormData({...playerFormData, preferredSport: val})}
                    >
                      <SelectTrigger className="input-solid h-10 bg-white">
                        <SelectValue placeholder="খেলা নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-[9999]">
                        <SelectItem value="cricket">ক্রিকেট (Cricket)</SelectItem>
                        <SelectItem value="football">ফুটবল (Football)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-bold text-primary">খেলোয়াড় লেবেল (Level)</Label>
                    <Select 
                      value={playerFormData.skillLevel} 
                      onValueChange={val => setPlayerFormData({...playerFormData, skillLevel: val as any})}
                    >
                      <SelectTrigger className="input-solid h-10 bg-white">
                        <SelectValue placeholder="লেভেল নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-[9999]">
                        <SelectItem value="pro">প্রো লেভেল (Pro)</SelectItem>
                        <SelectItem value="intermediate">ইন্টারমিডিয়েট (Intermediate)</SelectItem>
                        <SelectItem value="beginner">বিগিনার (Beginner)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="font-bold text-primary">দলের নাম (Team Name)</Label>
                    <Input 
                      value={playerFormData.teamName} 
                      onChange={e => setPlayerFormData({...playerFormData, teamName: e.target.value})}
                      className="input-solid h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-bold text-primary">विशेष দক্ষতা (Specialty)</Label>
                    <Input 
                      value={playerFormData.specialSkill} 
                      onChange={e => setPlayerFormData({...playerFormData, specialSkill: e.target.value})}
                      className="input-solid h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 bg-slate-50/50 p-3 rounded-2xl">
                  <div className="space-y-1.5">
                    <Label className="font-extrabold text-blue-700">মোট রান (Total Runs)</Label>
                    <Input 
                      type="number"
                      value={playerFormData.totalRuns} 
                      onChange={e => setPlayerFormData({...playerFormData, totalRuns: Number(e.target.value) || 0})}
                      className="input-solid h-10 border-blue-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-extrabold text-blue-700">মোট উইকেট (Total Wickets)</Label>
                    <Input 
                      type="number"
                      value={playerFormData.totalWickets} 
                      onChange={e => setPlayerFormData({...playerFormData, totalWickets: Number(e.target.value) || 0})}
                      className="input-solid h-10 border-blue-200"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-base font-bold rounded-xl shadow-md mt-2">
                  তথ্য ও পরিসংখ্যান আপডেট করুন
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Teams Tab Content */}
        <TabsContent value="teams" className="space-y-8 outline-none">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input 
                value={teamSearch}
                onChange={e => setTeamSearch(e.target.value)}
                placeholder="দল খুঁজুন..."
                className="pl-10 h-10 input-solid"
              />
            </div>
            
            <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-accent hover:bg-accent/90 text-white font-bold h-11 px-5 rounded-xl shadow-md cursor-pointer w-full sm:w-auto"
                  onClick={() => {
                    setEditingTeam(null);
                    setTeamFormData({ name: '', logo: '', leaderName: '', coachName: '' });
                  }}
                >
                  <Plus className="mr-1.5 h-4 w-4" /> নতুন স্পোর্টস টিম যোগ করুন
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md dialog-solid">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-primary">
                    {editingTeam ? 'টিমের তথ্য পরিবর্তন করুন' : 'নতুন টিম ক্রিয়েট করুন'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleTeamSubmit} className="space-y-4 pt-4 text-left">
                  <div className="space-y-1.5">
                    <Label className="font-bold text-primary">টিমের নাম (Team Name)</Label>
                    <Input 
                      required 
                      value={teamFormData.name} 
                      onChange={e => setTeamFormData({...teamFormData, name: e.target.value})}
                      placeholder="যেমন: ইমপ্রুভমেন্ট ক্রিকেট একাডেমি"
                      className="input-solid h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-bold text-primary">টিম লোগো ছবি লিংক (Passport Image URL)</Label>
                    <Input 
                      value={teamFormData.logo} 
                      onChange={e => setTeamFormData({...teamFormData, logo: e.target.value})}
                      placeholder="https://images.unsplash.com/..."
                      className="input-solid h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-bold text-primary">টিম লিডারের নাম (Team Leader)</Label>
                    <Input 
                      value={teamFormData.leaderName} 
                      onChange={e => setTeamFormData({...teamFormData, leaderName: e.target.value})}
                      placeholder="যেমন: সঞ্জিদ রহমান"
                      className="input-solid h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-bold text-primary">কোচের নাম (Team Coach)</Label>
                    <Input 
                      value={teamFormData.coachName} 
                      onChange={e => setTeamFormData({...teamFormData, coachName: e.target.value})}
                      placeholder="যেমন:BCB সার্টিফাইড কোচ"
                      className="input-solid h-11"
                    />
                  </div>

                  <Button type="submit" className="w-full h-12 text-base font-bold rounded-xl shadow-lg mt-2">
                    {editingTeam ? 'টিমের তথ্য সেভ করুন' : 'নতুন টিম এড করুন'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sportsTeams.filter(t => {
              if (!teamSearch) return true;
              return t.name.toLowerCase().includes(teamSearch.toLowerCase());
            }).length > 0 ? (
              sportsTeams.filter(t => {
                if (!teamSearch) return true;
                return t.name.toLowerCase().includes(teamSearch.toLowerCase());
              }).map(team => (
                <div key={team.id} className="bg-white rounded-3xl border border-slate-100 p-6 flex items-start gap-4 justify-between shadow-sm hover:shadow-md transition-all text-left">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-50 shrink-0 border-2 border-white shadow-sm flex items-center justify-center">
                      {team.logo ? (
                        <img src={team.logo} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <Trophy className="h-6 w-6 text-slate-300" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black text-slate-800 leading-tight">{team.name}</h4>
                      {team.leaderName && (
                        <p className="text-xs text-slate-500">
                          <span className="font-bold text-slate-600">Leader:</span> {team.leaderName}
                        </p>
                      )}
                      {team.coachName && (
                        <p className="text-xs text-slate-500">
                          <span className="font-bold text-slate-600">Coach:</span> {team.coachName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg"
                      onClick={() => handleEditTeam(team)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-rose-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg"
                      onClick={() => handleDeleteTeam(team.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                <Trophy className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-400">কোনো টিম যোগ করা হয়নি এখনো।</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
