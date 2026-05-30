import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Image as ImageIcon, MoveUp, MoveDown, Video, Settings as SettingsIcon } from 'lucide-react';
import { setDoc, getDoc } from 'firebase/firestore';

export default function BannerAdmin() {
  const [banners, setBanners] = useState<any[]>([]);
  const [bannerMode, setBannerMode] = useState<'auto' | 'video' | 'carousel'>('auto');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    link: '',
    type: 'image', // 'image' or 'video'
    videoUrl: '',
    order: 0
  });

  useEffect(() => {
    const q = query(collection(db, 'banners'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBanners(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'banners');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      const snap = await getDoc(doc(db, 'settings', 'banners'));
      if (snap.exists()) {
        setBannerMode(snap.data().mode || 'auto');
      }
    };
    fetchSettings();
  }, []);

  const updateBannerMode = async (mode: 'auto' | 'video' | 'carousel') => {
    try {
      await setDoc(doc(db, 'settings', 'banners'), { mode });
      setBannerMode(mode);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/banners');
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
        await updateDoc(doc(db, 'banners', editingBanner.id), dataToSave);
      } else {
        await addDoc(collection(db, 'banners'), {
          ...dataToSave,
          createdAt: serverTimestamp()
        });
      }
      setIsDialogOpen(false);
      setEditingBanner(null);
      setFormData({ title: '', subtitle: '', image: '', link: '', type: 'image', videoUrl: '', order: banners.length });
    } catch (error) {
      handleFirestoreError(error, editingBanner ? OperationType.UPDATE : OperationType.CREATE, 'banners');
    }
  };

  const handleEdit = (banner: any) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      image: banner.image || '',
      link: banner.link || '',
      type: banner.type || 'image',
      videoUrl: banner.videoUrl || '',
      order: banner.order
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this banner?')) {
      try {
        await deleteDoc(doc(db, 'banners', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `banners/${id}`);
      }
    }
  };

  const moveBanner = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= banners.length) return;

    const banner1 = banners[index];
    const banner2 = banners[newIndex];

    await updateDoc(doc(db, 'banners', banner1.id), { order: banner2.order });
    await updateDoc(doc(db, 'banners', banner2.id), { order: banner1.order });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <SettingsIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-primary">Banner Display Mode</h3>
            <p className="text-sm text-secondary font-medium">Choose how banners are displayed on the homepage.</p>
          </div>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          {[
            { id: 'auto', label: 'Auto Priority' },
            { id: 'video', label: 'Video Only' },
            { id: 'carousel', label: 'Images Only' }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => updateBannerMode(mode.id as any)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                bannerMode === mode.id 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-secondary hover:text-primary'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-primary">Hero Banners</h2>
          <p className="text-secondary font-medium">Manage the swiping banners on the homepage hero section.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-accent hover:bg-accent/90 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-accent/20"
              onClick={() => {
                setEditingBanner(null);
                setFormData({ title: '', subtitle: '', image: '', link: '', order: banners.length });
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
                <Label className="font-bold text-primary">ব্যানারের ধরন (Banner Type)</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={val => setFormData({...formData, type: val})}
                >
                  <SelectTrigger className="h-12 border-slate-200">
                    <SelectValue placeholder="ধরন নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">ইমেজ ব্যানার (Image)</SelectItem>
                    <SelectItem value="video">ইউটিউব ভিডিও ব্যানার (Video)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.type === 'image' ? (
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
              ) : (
                <div className="space-y-2">
                  <Label className="font-bold text-primary">ইউটিউব ভিডিও ইউআরএল (YouTube URL)</Label>
                  <Input 
                    required 
                    value={formData.videoUrl} 
                    onChange={e => setFormData({...formData, videoUrl: e.target.value})} 
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="h-12 input-solid"
                  />
                  <p className="text-xs text-slate-500">দ্রষ্টব্য: ভিডিও ব্যানার সক্রিয় থাকলে শুধুমাত্র সেটিই প্রদর্শিত হবে।</p>
                </div>
              )}
              <div className="space-y-2">
                <Label className="font-bold text-primary">প্রধান শিরোনাম (ঐচ্ছিক)</Label>
                <Input 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="যেমন: মানবতার সেবায় আমরা"
                  className="h-12 input-solid"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-primary">উপ-শিরোনাম (ঐচ্ছিক)</Label>
                <Input 
                  value={formData.subtitle} 
                  onChange={e => setFormData({...formData, subtitle: e.target.value})} 
                  placeholder="যেমন: আমাদের সাথে যুক্ত হোন"
                  className="h-12 input-solid"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-primary">বাটন লিঙ্ক (ঐচ্ছিক)</Label>
                <Input 
                  value={formData.link} 
                  onChange={e => setFormData({...formData, link: e.target.value})} 
                  placeholder="যেমন: /foundation"
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
                <p className="text-xs text-slate-500">ছোট সংখ্যা আগে প্রদর্শিত হবে।</p>
              </div>
              <Button type="submit" className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20">
                {editingBanner ? 'ব্যানার আপডেট করুন' : 'ব্যানার যোগ করুন'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {banners.map((banner, index) => (
          <div key={banner.id} className="group card-solid">
            <div className="p-0">
              <div className="aspect-[21/9] bg-slate-100 relative overflow-hidden">
                {banner.type === 'video' ? (
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                    <Video className="h-12 w-12 text-white/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold text-sm bg-black/50 px-3 py-1 rounded-full">YouTube Video</span>
                    </div>
                  </div>
                ) : (
                  <img 
                    src={banner.image} 
                    alt={banner.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${banner.id}/1200/500`;
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-8">
                  {banner.title && <h3 className="text-white font-bold text-2xl mb-1">{banner.title}</h3>}
                  {banner.subtitle && <p className="text-white/80 font-medium">{banner.subtitle}</p>}
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="h-10 w-10 rounded-xl bg-white/90 backdrop-blur-sm"
                    onClick={() => moveBanner(index, 'up')}
                    disabled={index === 0}
                  >
                    <MoveUp className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="h-10 w-10 rounded-xl bg-white/90 backdrop-blur-sm"
                    onClick={() => moveBanner(index, 'down')}
                    disabled={index === banners.length - 1}
                  >
                    <MoveDown className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center text-sm font-bold text-secondary">
                  <ImageIcon className="h-4 w-4 mr-2" /> Order: {banner.order + 1}
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
        {banners.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="inline-flex p-6 rounded-full bg-slate-100 mb-4">
              <ImageIcon className="h-12 w-12 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-primary">No banners added yet</h3>
            <p className="text-secondary font-medium">Add some banners to showcase on the homepage.</p>
          </div>
        )}
      </div>
    </div>
  );
}
