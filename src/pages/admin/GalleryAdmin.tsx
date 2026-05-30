import React, { useState, useEffect } from 'react';
import { db } from '@/src/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Image as ImageIcon, Search, Filter, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function GalleryAdmin() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<any>({
    title: '',
    content: '',
    images: [''],
    platform: 'general',
    isFeatured: false,
    type: 'image',
    videoUrl: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPost) {
        await updateDoc(doc(db, 'gallery', editingPost.id), formData);
      } else {
        await addDoc(collection(db, 'gallery'), {
          ...formData,
          createdAt: serverTimestamp()
        });
      }
      setIsDialogOpen(false);
      setEditingPost(null);
      setFormData({ 
        title: '', 
        content: '', 
        images: [''], 
        platform: 'general', 
        isFeatured: false,
        type: 'image',
        videoUrl: ''
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content || '',
      images: post.images || [post.image] || [''],
      platform: post.platform,
      isFeatured: post.isFeatured || false,
      type: post.type || 'image',
      videoUrl: post.videoUrl || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this post?')) {
      await deleteDoc(doc(db, 'gallery', id));
    }
  };

  const filteredPosts = posts.filter(p => {
    const matchesPlatform = filterPlatform === 'all' || p.platform === filterPlatform;
    const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlatform && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-primary">Gallery & Content</h2>
          <p className="text-secondary font-medium">Manage images, blog posts, and featured content for all platforms.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-accent hover:bg-accent/90 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-accent/20"
              onClick={() => {
                setEditingPost(null);
                setFormData({ 
                  title: '', 
                  content: '', 
                  images: [''], 
                  platform: 'general', 
                  isFeatured: false,
                  type: 'image',
                  videoUrl: ''
                });
              }}
            >
              <Plus className="mr-2 h-5 w-5" /> Add New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl dialog-solid">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary">
                {editingPost ? 'Edit Gallery Post' : 'Create New Gallery Post'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold text-primary">Title</Label>
                  <Input 
                    required 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    placeholder="Enter title"
                    className="h-12 input-solid"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-primary">Platform</Label>
                  <Select value={formData.platform} onValueChange={val => setFormData({...formData, platform: val})}>
                    <SelectTrigger className="h-12 input-solid">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="foundation">Foundation</SelectItem>
                      <SelectItem value="blood-bank">Blood Bank</SelectItem>
                      <SelectItem value="food-bank">Food Bank</SelectItem>
                      <SelectItem value="sporting-club">Sporting Club</SelectItem>
                      <SelectItem value="it-education">IT Education</SelectItem>
                      <SelectItem value="academic-care">Academic Care</SelectItem>
                      <SelectItem value="library">Library</SelectItem>
                      <SelectItem value="rehabilitation">Rehabilitation & Old Age Home</SelectItem>
                      <SelectItem value="kidscare">Kids Care</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-primary">Post Type</Label>
                <Select value={formData.type} onValueChange={val => setFormData({...formData, type: val})}>
                  <SelectTrigger className="h-12 input-solid">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="image">Image Gallery</SelectItem>
                    <SelectItem value="video">Video (YouTube)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.type === 'video' ? (
                <div className="space-y-2">
                  <Label className="font-bold text-primary">YouTube Video URL</Label>
                  <Input 
                    value={formData.videoUrl} 
                    onChange={e => setFormData({...formData, videoUrl: e.target.value})} 
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="h-12 input-solid"
                  />
                  <p className="text-xs text-secondary italic">Paste the full YouTube URL here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold text-primary">Image URLs (Max 4)</Label>
                    {formData.images.length < 4 && (
                      <Button type="button" size="sm" variant="outline" onClick={() => setFormData({...formData, images: [...formData.images, '']})}>
                        <Plus className="h-4 w-4 mr-1" /> Add Image
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {formData.images.map((img: string, idx: number) => (
                      <div key={idx} className="flex gap-2">
                        <Input 
                          value={img} 
                          onChange={e => {
                            const newImgs = [...formData.images];
                            newImgs[idx] = e.target.value;
                            setFormData({...formData, images: newImgs});
                          }} 
                          placeholder={`Image URL ${idx + 1}`}
                          className="h-12 input-solid"
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-12 w-12 text-red-500" 
                          onClick={() => setFormData({...formData, images: formData.images.filter((_: any, i: number) => i !== idx)})}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="font-bold text-primary">Description / Content</Label>
                <Textarea 
                  value={formData.content} 
                  onChange={e => setFormData({...formData, content: e.target.value})} 
                  placeholder="Write a brief description..."
                  className="min-h-[120px] rounded-xl border-slate-200 resize-none input-solid"
                />
              </div>

              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <Checkbox 
                  id="featured" 
                  checked={formData.isFeatured} 
                  onCheckedChange={(val) => setFormData({...formData, isFeatured: !!val})} 
                  className="h-5 w-5 rounded-md"
                />
                <Label htmlFor="featured" className="font-bold text-primary cursor-pointer">
                  Featured Content
                  <span className="block text-xs text-secondary font-medium">This will be highlighted on the platform page.</span>
                </Label>
              </div>

              <Button type="submit" className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20">
                {editingPost ? 'Update Gallery Post' : 'Publish to Gallery'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
          <Input 
            placeholder="Search posts by title..." 
            className="pl-12 h-14 input-solid text-lg font-medium shadow-sm"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
          <Select value={filterPlatform} onValueChange={setFilterPlatform}>
            <SelectTrigger className="pl-12 h-14 input-solid text-lg font-bold text-primary shadow-sm">
              <SelectValue placeholder="Filter Platform" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="general">General</SelectItem>
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post) => (
          <div key={post.id} className="group card-solid">
            <div className="p-0">
              <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                {(post.images?.[0] || post.image) ? (
                  <img 
                    src={post.images?.[0] || post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    referrerPolicy="no-referrer" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${post.id}/800/600`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ImageIcon className="h-16 w-16" />
                  </div>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className="bg-white/90 text-primary hover:bg-white font-bold backdrop-blur-sm border-none">
                    {post.platform}
                  </Badge>
                  {post.isFeatured && (
                    <Badge className="bg-accent text-white font-bold border-none">
                      Featured
                    </Badge>
                  )}
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl text-primary mb-2 line-clamp-1">{post.title}</h3>
                <p className="text-sm text-secondary font-medium line-clamp-2 mb-6 h-10">
                  {post.content || 'No description provided.'}
                </p>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-11 font-bold rounded-xl border-slate-200 hover:bg-slate-50" 
                    onClick={() => handleEdit(post)}
                  >
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="h-11 w-11 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl" 
                    onClick={() => handleDelete(post.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredPosts.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="inline-flex p-6 rounded-full bg-slate-100 mb-4">
              <ImageIcon className="h-12 w-12 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-primary">No posts found</h3>
            <p className="text-secondary font-medium">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
