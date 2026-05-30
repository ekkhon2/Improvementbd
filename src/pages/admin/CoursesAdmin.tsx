import React, { useState, useEffect } from 'react';
import { db } from '@/src/lib/firebase';
import { collection, onSnapshot, query, where, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import RichTextEditor from '@/src/components/RichTextEditor';
import { Plus, Edit, Trash2, GraduationCap, Search, Filter, BookOpen, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CoursesAdmin() {
  const [courses, setCourses] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successType, setSuccessType] = useState<'add' | 'update'>('add');
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    platform: 'it-education',
    classLevel: '', // New field
    images: [''],
    features: [''],
    syllabus: [''],
    achievements: [''],
    demoPlaylistUrl: '',
    promoVideoUrl: '',
    duration: '',
    price: '',
    instructorName: '',
    instructorPhoto: '',
    instructorExperience: ''
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'courses'), (snapshot) => {
      setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cleanData = {
        ...formData,
        features: formData.features.filter(f => f.trim() !== ''),
        syllabus: formData.syllabus.filter(s => s.trim() !== ''),
        achievements: formData.achievements.filter(a => a.trim() !== '')
      };
      if (editingCourse) {
        await updateDoc(doc(db, 'courses', editingCourse.id), cleanData);
      } else {
        await addDoc(collection(db, 'courses'), {
          ...cleanData,
          createdAt: serverTimestamp()
        });
      }
      const isUpdate = !!editingCourse;
      setIsDialogOpen(false);
      setSuccessType(isUpdate ? 'update' : 'add');
      setShowSuccess(true);
      setEditingCourse(null);
      setFormData({ title: '', category: '', description: '', platform: 'it-education', classLevel: '', images: [''], features: [''], syllabus: [''], achievements: [''], demoPlaylistUrl: '', promoVideoUrl: '', duration: '', price: '' });
      
      // We can use a local variable for the success message or just rely on the fact that we reset it
      // But let's make it more robust by using a separate state or just checking if it was an update
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (course: any) => {
    setEditingCourse(course);
    setFormData({
      title: course.title || '',
      category: course.category || '',
      description: course.description || '',
      platform: course.platform || 'it-education',
      classLevel: course.classLevel || '',
      images: course.images || [''],
      features: course.features || [''],
      syllabus: course.syllabus || [''],
      achievements: course.achievements || [''],
      demoPlaylistUrl: course.demoPlaylistUrl || '',
      promoVideoUrl: course.promoVideoUrl || '',
      duration: course.duration || '',
      price: course.price || '',
      instructorName: course.instructorName || '',
      instructorPhoto: course.instructorPhoto || '',
      instructorExperience: course.instructorExperience || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this course?')) {
      await deleteDoc(doc(db, 'courses', id));
    }
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const addSyllabus = () => {
    setFormData({ ...formData, syllabus: [...formData.syllabus, ''] });
  };

  const updateSyllabus = (index: number, value: string) => {
    const newSyllabus = [...formData.syllabus];
    newSyllabus[index] = value;
    setFormData({ ...formData, syllabus: newSyllabus });
  };

  const removeSyllabus = (index: number) => {
    const newSyllabus = formData.syllabus.filter((_, i) => i !== index);
    setFormData({ ...formData, syllabus: newSyllabus });
  };

  const addAchievement = () => {
    setFormData({ ...formData, achievements: [...formData.achievements, ''] });
  };

  const updateAchievement = (index: number, value: string) => {
    const newAchievements = [...formData.achievements];
    newAchievements[index] = value;
    setFormData({ ...formData, achievements: newAchievements });
  };

  const removeAchievement = (index: number) => {
    const newAchievements = formData.achievements.filter((_, i) => i !== index);
    setFormData({ ...formData, achievements: newAchievements });
  };

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         c.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = filterPlatform === 'all' || c.platform === filterPlatform;
    return matchesSearch && matchesPlatform;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-primary">Course Management</h2>
          <p className="text-secondary font-medium">Manage educational programs, curriculum, and enrollment details.</p>
        </div>
        
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-accent hover:bg-accent/90 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-accent/20"
                onClick={() => {
                  setEditingCourse(null);
                  setFormData({ 
                    title: '', 
                    category: '', 
                    description: '', 
                    platform: 'it-education', 
                    images: [''],
                    features: [''],
                    syllabus: [''],
                    achievements: [''],
                    demoPlaylistUrl: '',
                    promoVideoUrl: '',
                    duration: '',
                    price: '',
                    instructorName: '',
                    instructorPhoto: '',
                    instructorExperience: ''
                  });
                }}
              >
                <Plus className="mr-2 h-5 w-5" /> Add New Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[98vw] md:max-w-[95vw] w-full h-[98vh] md:h-[95vh] rounded-2xl md:rounded-3xl p-0 bg-white border-none shadow-2xl sm:max-w-none overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 h-full overflow-hidden">
                {/* Form Side */}
                <div className="overflow-y-auto p-4 md:p-8 border-r border-slate-100 bg-white custom-scrollbar h-full">
                  <DialogHeader className="mb-6 md:mb-8 sticky top-0 bg-white z-10 pb-4 border-b border-slate-50">
                    <DialogTitle className="text-2xl md:text-3xl font-black text-primary tracking-tight">
                      {editingCourse ? 'Edit Course Details' : 'Create New Course'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="font-bold text-primary">কোর্সের শিরোনাম (Course Title)</Label>
                        <Input 
                          required 
                          value={formData.title} 
                          onChange={e => setFormData({...formData, title: e.target.value})} 
                          placeholder="যেমন: গ্রাফিক ডিজাইন মাস্টারক্লাস"
                          className="h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-accent"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-primary">ক্যাটাগরি (Category)</Label>
                        <Input 
                          required 
                          value={formData.category} 
                          onChange={e => setFormData({...formData, category: e.target.value})} 
                          placeholder="যেমন: ডিজাইন, প্রোগ্রামিং"
                          className="h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-accent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="font-bold text-primary">প্ল্যাটফর্ম (Platform)</Label>
                        <Select value={formData.platform} onValueChange={val => setFormData({...formData, platform: val, classLevel: val === 'it-education' ? '' : formData.classLevel})}>
                          <SelectTrigger className="h-12 rounded-xl border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="it-education">IT Education</SelectItem>
                            <SelectItem value="academic-care">Academic Care</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {formData.platform === 'academic-care' && (
                        <div className="space-y-2 animate-in slide-in-from-left duration-300">
                          <Label className="font-bold text-primary">ক্লাস / লেভেল (Class Level)</Label>
                          <Select value={formData.classLevel} onValueChange={val => setFormData({...formData, classLevel: val})}>
                            <SelectTrigger className="h-12 rounded-xl border-slate-200">
                              <SelectValue placeholder="Select Class" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="Class 6">Class 6</SelectItem>
                              <SelectItem value="Class 7">Class 7</SelectItem>
                              <SelectItem value="Class 8">Class 8</SelectItem>
                              <SelectItem value="Class 9">Class 9</SelectItem>
                              <SelectItem value="Class 10">Class 10</SelectItem>
                              <SelectItem value="Class 11">Class 11</SelectItem>
                              <SelectItem value="Class 12">Class 12</SelectItem>
                              <SelectItem value="ADMISSION">ADMISSION</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label className="font-bold text-primary">থাম্বনেইল ইউআরএল (Thumbnail URL)</Label>
                        <Input 
                          value={formData.images[0]} 
                          onChange={e => setFormData({...formData, images: [e.target.value]})} 
                          placeholder="https://ibb.co/..."
                          className="h-12 rounded-xl border-slate-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="font-bold text-primary">কোর্স ফি (Price)</Label>
                        <Input 
                          value={formData.price} 
                          onChange={e => setFormData({...formData, price: e.target.value})} 
                          placeholder="যেমন: ৳ ৫,০০০"
                          className="h-12 rounded-xl border-slate-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-primary">সময়কাল (Duration)</Label>
                        <Input 
                          value={formData.duration} 
                          onChange={e => setFormData({...formData, duration: e.target.value})} 
                          placeholder="যেমন: ৩ মাস"
                          className="h-12 rounded-xl border-slate-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="font-bold text-primary">প্রমোশনাল ভিডিও (YouTube URL)</Label>
                        <Input 
                          value={formData.promoVideoUrl} 
                          onChange={e => setFormData({...formData, promoVideoUrl: e.target.value})} 
                          placeholder="https://youtube.com/watch?v=..."
                          className="h-12 rounded-xl border-slate-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-primary">ডেমো ক্লাস প্লেলিস্ট (YouTube Playlist URL)</Label>
                        <Input 
                          value={formData.demoPlaylistUrl} 
                          onChange={e => setFormData({...formData, demoPlaylistUrl: e.target.value})} 
                          placeholder="https://youtube.com/playlist?list=..."
                          className="h-12 rounded-xl border-slate-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold text-primary">কোর্স ওভারভিউ (Course Overview - Description)</Label>
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <RichTextEditor 
                          value={formData.description} 
                          onChange={val => setFormData({...formData, description: val})} 
                        />
                      </div>
                    </div>

                    {/* Instructor Section */}
                    <div className="space-y-6 pt-6 border-t border-slate-100 italic">
                      <div>
                        <h3 className="text-lg font-black text-primary mb-1">প্রশিক্ষকের তথ্য (Instructor Information)</h3>
                        <p className="text-sm text-slate-400 font-medium">কোর্স ইন্সট্রাক্টরের বিস্তারিত এখানে প্রদান করুন।</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="font-bold text-primary">ইন্সট্রাক্টরের নাম (Instructor Name)</Label>
                          <Input 
                            value={formData.instructorName} 
                            onChange={e => setFormData({...formData, instructorName: e.target.value})} 
                            placeholder="যেমন: ইঞ্জিনিয়ার আল-আমিন"
                            className="h-12 rounded-xl border-slate-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold text-primary">ইন্সট্রাক্টরের ছবি ইউআরএল (Instructor Photo URL)</Label>
                          <Input 
                            value={formData.instructorPhoto} 
                            onChange={e => setFormData({...formData, instructorPhoto: e.target.value})} 
                            placeholder="https://ibb.co/..."
                            className="h-12 rounded-xl border-slate-200"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label className="font-bold text-primary">অভিজ্ঞতা / বিবরণ (Experience / Bio)</Label>
                          <Input 
                            value={formData.instructorExperience} 
                            onChange={e => setFormData({...formData, instructorExperience: e.target.value})} 
                            placeholder="যেমন: ৫ বছরের ইন্ডাস্ট্রি অভিজ্ঞতা এবং ১০+ সফল প্রজেক্ট"
                            className="h-12 rounded-xl border-slate-200"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="font-bold text-primary">সিলেবাস / কোর্স কন্টেন্ট (Syllabus - Point by Point)</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addSyllabus} className="rounded-lg">
                          <Plus className="h-4 w-4 mr-1" /> Add Topic
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {formData.syllabus.map((item, index) => (
                          <div key={index} className="flex gap-2">
                            <Input 
                              value={item} 
                              onChange={e => updateSyllabus(index, e.target.value)} 
                              placeholder={`Topic ${index + 1}`}
                              className="h-11 rounded-xl border-slate-200"
                            />
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeSyllabus(index)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="font-bold text-primary">অর্জনসমূহ (Achievements - What they will learn)</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addAchievement} className="rounded-lg">
                          <Plus className="h-4 w-4 mr-1" /> Add Achievement
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {formData.achievements.map((item, index) => (
                          <div key={index} className="flex gap-2">
                            <Input 
                              value={item} 
                              onChange={e => updateAchievement(index, e.target.value)} 
                              placeholder={`Achievement ${index + 1}`}
                              className="h-11 rounded-xl border-slate-200"
                            />
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeAchievement(index)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="font-bold text-primary">অন্যান্য বৈশিষ্ট্যসমূহ (Other Features)</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addFeature} className="rounded-lg">
                          <Plus className="h-4 w-4 mr-1" /> Add Feature
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {formData.features.map((feature, index) => (
                          <div key={index} className="flex gap-2">
                            <Input 
                              value={feature} 
                              onChange={e => updateFeature(index, e.target.value)} 
                              placeholder={`Feature ${index + 1}`}
                              className="h-11 rounded-xl border-slate-200"
                            />
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeFeature(index)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4 sticky bottom-0 bg-white pt-6 border-t border-slate-50">
                      <Button type="submit" className="flex-1 h-16 text-xl font-black rounded-2xl shadow-xl shadow-primary/20 bg-primary text-white">
                        {editingCourse ? 'কোর্স আপডেট করুন' : 'কোর্স লঞ্চ করুন'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={async () => {
                          try {
                            const cleanData = {
                              ...formData,
                              features: formData.features.filter(f => f.trim() !== ''),
                              syllabus: formData.syllabus.filter(s => s.trim() !== ''),
                              achievements: formData.achievements.filter(a => a.trim() !== '')
                            };
                            if (editingCourse) {
                              await updateDoc(doc(db, 'courses', editingCourse.id), cleanData);
                              alert('Changes saved successfully!');
                            } else {
                              const docRef = await addDoc(collection(db, 'courses'), {
                                ...cleanData,
                                createdAt: serverTimestamp()
                              });
                              setEditingCourse({ id: docRef.id, ...cleanData });
                              alert('Course created successfully! You can continue editing.');
                            }
                          } catch (error) {
                            console.error(error);
                          }
                        }}
                        className="h-16 px-8 text-lg font-bold rounded-2xl border-2 border-slate-100 hover:bg-slate-50"
                      >
                        Save & Continue
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Preview Side */}
                <div className="hidden lg:block bg-slate-50 overflow-y-auto p-8 border-l border-slate-100 custom-scrollbar">
                  <div className="sticky top-0">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Live Preview</h3>
                      <Badge className="bg-emerald-500 text-white border-none">Active</Badge>
                    </div>
                    
                    <div className="space-y-8">
                      {/* Card Preview */}
                      <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
                        <div className="aspect-video bg-slate-100 relative">
                          {formData.images[0] && (
                            <img src={formData.images[0]} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          )}
                          <div className="absolute top-4 left-4 flex flex-col gap-2">
                            <Badge className="bg-white/90 text-primary font-bold backdrop-blur-sm border-none">
                              {formData.platform === 'it-education' ? 'IT' : 'Academic'}
                            </Badge>
                            {formData.platform === 'academic-care' && formData.classLevel && (
                              <Badge className="bg-accent text-white font-bold border-none">
                                {formData.classLevel}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="p-6">
                          <Badge variant="secondary" className="mb-2 text-[10px] font-bold uppercase tracking-widest">
                            {formData.category || 'Category'}
                          </Badge>
                          <h4 className="font-bold text-xl text-primary mb-4 line-clamp-1">{formData.title || 'Course Title'}</h4>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-black text-primary">{formData.price || '৳ ০'}</span>
                            <span className="text-xs font-bold text-secondary">{formData.duration || 'Duration'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Content Preview */}
                      <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 space-y-6">
                        <div>
                          <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Overview</h5>
                          <div className="text-sm text-slate-600 line-clamp-3 prose prose-sm" dangerouslySetInnerHTML={{ __html: formData.description || 'Description will appear here...' }} />
                        </div>
                        
                        {formData.syllabus.some(s => s.trim()) && (
                          <div>
                            <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Syllabus</h5>
                            <div className="space-y-2">
                              {formData.syllabus.filter(s => s.trim()).slice(0, 3).map((s, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                  {s}
                                </div>
                              ))}
                              {formData.syllabus.filter(s => s.trim()).length > 3 && (
                                <p className="text-xs text-slate-400 font-bold">+{formData.syllabus.filter(s => s.trim()).length - 3} more topics</p>
                              )}
                            </div>
                          </div>
                        )}

                        {formData.achievements.some(a => a.trim()) && (
                          <div>
                            <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Achievements</h5>
                            <div className="space-y-2">
                              {formData.achievements.filter(a => a.trim()).slice(0, 3).map((a, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm font-bold text-emerald-600">
                                  <CheckCircle2 className="h-4 w-4" />
                                  {a}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Instructor Preview */}
                        {formData.instructorName && (
                          <div className="pt-6 border-t border-slate-100">
                            <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Instructor</h5>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                              <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-sm shrink-0">
                                {formData.instructorPhoto && <img src={formData.instructorPhoto} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                              </div>
                              <div>
                                <p className="font-bold text-primary leading-none mb-1">{formData.instructorName}</p>
                                <p className="text-[10px] font-bold text-slate-400 line-clamp-1">{formData.instructorExperience || 'No experience info added'}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
          <Input 
            placeholder="Search courses by title or category..." 
            className="pl-12 h-14 bg-white border-none shadow-sm rounded-2xl text-lg font-medium"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
          <Select value={filterPlatform} onValueChange={setFilterPlatform}>
            <SelectTrigger className="pl-12 h-14 bg-white border-none shadow-sm rounded-2xl text-lg font-bold text-primary">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="it-education">IT Education</SelectItem>
              <SelectItem value="academic-care">Academic Care</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="group border-none shadow-md hover:shadow-2xl transition-all rounded-[2rem] bg-white overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-video bg-slate-100 relative overflow-hidden">
                {course.images?.[0] ? (
                  <img 
                    src={course.images[0]} 
                    alt={course.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    referrerPolicy="no-referrer" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${course.id}/800/600`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <GraduationCap className="h-16 w-16" />
                  </div>
                )}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <Badge className="bg-white/90 text-primary hover:bg-white font-bold backdrop-blur-sm border-none">
                    {course.platform === 'it-education' ? 'IT' : 'Academic'}
                  </Badge>
                  {course.platform === 'academic-care' && course.classLevel && (
                    <Badge className="bg-accent text-white font-bold border-none">
                      {course.classLevel}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-secondary">
                    {course.category}
                  </Badge>
                </div>
                <h3 className="font-bold text-xl text-primary mb-6 line-clamp-1">{course.title}</h3>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-11 font-bold rounded-xl border-slate-200 hover:bg-slate-50" 
                    onClick={() => handleEdit(course)}
                  >
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="h-11 w-11 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl" 
                    onClick={() => handleDelete(course.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredCourses.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="inline-flex p-6 rounded-full bg-slate-100 mb-4">
              <GraduationCap className="h-12 w-12 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-primary">No courses found</h3>
            <p className="text-secondary font-medium">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

      {/* Success Popup */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-black text-primary mb-2">অভিনন্দন!</h3>
            <p className="text-secondary font-medium mb-8">
              আপনার কোর্সটি সফলভাবে {successType === 'update' ? 'আপডেট' : 'লঞ্চ'} করা হয়েছে।
            </p>
            <Button 
              onClick={() => setShowSuccess(false)}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-lg shadow-primary/20"
            >
              ঠিক আছে
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
