import { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { Link, useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  Droplets, 
  BookOpen, 
  GraduationCap, 
  Image as ImageIcon,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { loginWithGoogle, logout } from '@/src/lib/firebase';

import MembersAdmin from './admin/MembersAdmin';
import BloodAdmin from './admin/BloodAdmin';
import LibraryAdmin from './admin/LibraryAdmin';
import CoursesAdmin from './admin/CoursesAdmin';
import GalleryAdmin from './admin/GalleryAdmin';
import BannerAdmin from './admin/BannerAdmin';
import ExamsAdmin from './admin/ExamsAdmin';
import AdminDashboard from './admin/AdminDashboard';
import PlatformAdmin from './admin/PlatformAdmin';
import SportsAdmin from './admin/SportsAdmin';
import LibraryMembersAdmin from './admin/LibraryMembersAdmin';
import FoodAdmin from './admin/FoodAdmin';

export default function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>;

  if (!user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-6 bg-slate-50 p-4">
        <div className="p-10 bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 text-center max-w-md w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
          <div className="mb-8">
            <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-sm">
              <LayoutDashboard className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-primary tracking-tight mb-2">Admin Portal</h1>
            <p className="text-secondary font-medium">Authorized Personnel Only</p>
          </div>
          <Button onClick={loginWithGoogle} size="lg" className="w-full h-14 text-lg font-black rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]">
            Login with Google
          </Button>
          <p className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Improvement BD Management System</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-6 bg-slate-50 p-4">
        <div className="p-10 bg-white rounded-[2.5rem] shadow-2xl border border-red-100 text-center max-w-md w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />
          <div className="mb-8">
            <div className="h-20 w-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-100 shadow-sm">
              <X className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-black text-red-600 tracking-tight mb-2">Access Denied</h1>
            <p className="text-secondary font-medium px-4">You do not have administrative privileges. Please contact the system owner.</p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline" className="w-full h-14 text-lg font-black rounded-2xl border-2 transition-all hover:bg-slate-50">
            Return to Homepage
          </Button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'All Members', icon: Users, path: '/admin/members' },
    { name: 'Blood Bank', icon: Droplets, path: '/admin/blood' },
    { name: 'Library', icon: BookOpen, path: '/admin/library' },
    { name: 'Education', icon: GraduationCap, path: '/admin/courses' },
    { name: 'Exams', icon: BookOpen, path: '/admin/exams' },
    { name: 'Banners', icon: ImageIcon, path: '/admin/banners' },
    { name: 'Sports Banners', icon: ImageIcon, path: '/admin/sports-banners' },
    { name: 'Food Bank', icon: BookOpen, path: '/admin/food-bank' },
    { name: 'Gallery', icon: ImageIcon, path: '/admin/gallery' },
  ];

  const platforms = [
    { name: 'Foundation', path: '/admin/platform/foundation' },
    { name: 'Food Bank', path: '/admin/platform/food-bank' },
    { name: 'Sporting Club', path: '/admin/platform/sporting-club' },
    { name: 'IT Education', path: '/admin/platform/it-education' },
    { name: 'Academic Care', path: '/admin/platform/academic-care' },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-primary text-white transition-transform lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-20 items-center justify-between px-8 border-b border-white/10">
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter">IMPROVEMENT BD</span>
            <span className="text-[10px] font-bold tracking-[0.2em] text-accent uppercase opacity-80">Admin Console</span>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10" onClick={() => setIsSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex flex-col h-[calc(100vh-5rem)] justify-between">
          <nav className="p-6 space-y-8 overflow-y-auto">
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-3 mb-4">Main Menu</p>
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    location.pathname === item.path 
                      ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-3 mb-4">Platforms</p>
              {platforms.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    location.pathname === item.path 
                      ? 'bg-white/10 text-white' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${location.pathname === item.path ? 'bg-accent' : 'bg-white/20'}`} />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </nav>

          <div className="p-6 border-t border-white/10">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 font-bold h-12 rounded-xl" 
              onClick={logout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
            <h2 className="text-xl font-bold text-primary">
              {menuItems.find(i => i.path === location.pathname)?.name || 
               platforms.find(p => p.path === location.pathname)?.name || 
               'Admin Console'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-primary">{user.displayName}</span>
              <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Administrator</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
              <img src={user.photoURL || ''} alt="Admin" className="h-full w-full object-cover" />
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-8">
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/members" element={<MembersAdmin />} />
              <Route path="/blood" element={<BloodAdmin />} />
              <Route path="/library" element={<LibraryAdmin />} />
              <Route path="/courses" element={<CoursesAdmin />} />
              <Route path="/exams" element={<ExamsAdmin />} />
              <Route path="/gallery" element={<GalleryAdmin />} />
              <Route path="/banners" element={<BannerAdmin />} />
              <Route path="/sports-banners" element={<SportsAdmin />} />
              <Route path="/library/members" element={<LibraryMembersAdmin />} />
              <Route path="/food-bank" element={<FoodAdmin />} />
              <Route path="/platform/:platformId" element={<PlatformAdmin />} />
            </Routes>
        </main>
      </div>
    </div>
  );
}
