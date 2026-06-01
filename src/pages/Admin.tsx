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
  X,
  Heart,
  Compass,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { loginWithGoogle, loginWithGoogleRedirect, logout } from '@/src/lib/firebase';

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
import DonationsAdmin from './admin/DonationsAdmin';
import MasterBlueprint from './admin/MasterBlueprint';

export default function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [signProgress, setSignProgress] = useState(false);

  const handlePopupLogin = async () => {
    try {
      setAuthError(null);
      setSignProgress(true);
      await loginWithGoogle();
    } catch (err: any) {
      console.error("Google popup error: ", err);
      setAuthError(err.message || String(err));
    } finally {
      setSignProgress(false);
    }
  };

  const handleRedirectLogin = async () => {
    try {
      setAuthError(null);
      setSignProgress(true);
      await loginWithGoogleRedirect();
    } catch (err: any) {
      console.error("Google redirect error: ", err);
      setAuthError(err.message || String(err));
      setSignProgress(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>;

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 font-sans">
        <div className="p-8 bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 text-center max-w-lg w-full relative overflow-hidden space-y-6">
          <div className="absolute top-0 left-0 w-full h-2.5 bg-primary" />
          
          <div className="space-y-4">
            <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100 shadow-sm">
              <LayoutDashboard className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-primary tracking-tight">Admin Portal</h1>
            <p className="text-sm text-secondary font-medium px-4">Authorized administrative personnel and system owners only</p>
          </div>

          {authError && (
            <div className="bg-red-50 text-red-700 text-xs font-bold p-4 rounded-2xl border border-red-100 text-left flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-extrabold text-red-800">লগইন ত্রুটি (Login Error):</p>
                <p className="font-medium opacity-90">{authError}</p>
              </div>
            </div>
          )}

          {/* Dynamic Warning about Security Popups with a visual wrapper */}
          <div className="bg-amber-55/80 border border-amber-200 text-amber-900 text-xs font-semibold p-4 rounded-2xl text-left space-y-2">
            <div className="flex items-center gap-2 text-amber-800 font-extrabold text-xs">
              <AlertCircle className="h-4 w-4" />
              <span>আইফ্রেম ও পপ-আপ সতর্কতা (Iframe & Popup Warning)</span>
            </div>
            <p className="opacity-90 font-medium leading-relaxed">
              ব্রাউজারের সিকিউরিটি পলিসির কারণে আইফ্রেমের (Web Preview) ভেতরে গুগল পপ-আপ ব্লক হতে পারে। যদি <strong>"Login with Google"</strong> বাটনে ক্লিক করার পর পপ-আপ না খোলে, তাহলে নিচের যেকোনো একটি পদ্ধতি অনুসরণ করুন:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[11px] font-bold opacity-90">
              <li>অফিসিয়াল প্রিভিউ স্ক্রিনের ডান কোণায় থাকা <strong className="text-primary">"Open in new tab"</strong> আইকনে ক্লিক করে নতুন উইন্ডোতে অ্যাপটি ওপেন করে লগইন করুন।</li>
              <li>পপ-আপের পরিবর্তে নিচের <strong className="text-emerald-700">"Login using Redirect"</strong> বাটনটি ব্যবহার করুন।</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button 
              onClick={handlePopupLogin} 
              disabled={signProgress}
              size="lg" 
              className="flex-1 h-14 bg-primary hover:bg-primary/95 text-white text-sm font-black rounded-2xl shadow-xl shadow-primary/10 transition-all active:scale-95 duration-200"
            >
              {signProgress ? 'Signing in...' : 'Login with Google'}
            </Button>
            <Button 
              onClick={handleRedirectLogin} 
              disabled={signProgress}
              variant="outline"
              size="lg" 
              className="flex-1 h-14 border-2 border-emerald-600 hover:bg-emerald-50 text-emerald-700 text-sm font-black rounded-2xl transition-all"
            >
              Login using Redirect
            </Button>
          </div>

          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2">Improvement BD Management System</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 font-sans">
        <div className="p-8 bg-white rounded-[2.5rem] shadow-2xl border border-red-100 text-center max-w-md w-full relative overflow-hidden space-y-6">
          <div className="absolute top-0 left-0 w-full h-2.5 bg-red-600" />
          
          <div className="space-y-4">
            <div className="h-16 w-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto border border-red-100 shadow-sm">
              <X className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-red-600 tracking-tight">Access Denied</h1>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-xs space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider block">Logged in as (আপনার ইমেইল):</span>
              <span className="font-extrabold text-slate-800 break-all text-sm">{user.email}</span>
            </div>
            <p className="text-xs text-secondary font-medium leading-relaxed px-2">
              আপনার ইমেইলটি এডমিন লিস্টে নিবন্ধিত নয়। শুধুমাত্র <strong>ekkhon2@gmail.com</strong> ইমেইলটি প্রধান এডমিন পোর্টালে এক্সেস পাবে।
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button 
              onClick={async () => {
                await logout();
                setAuthError(null);
              }}
              className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-red-500/10 transition-all"
            >
              Logout & Switch Account
            </Button>
            <Button 
              onClick={() => navigate('/')} 
              variant="outline" 
              className="w-full h-14 text-sm font-bold rounded-2xl border-2 transition-all hover:bg-slate-50"
            >
              Return to Homepage
            </Button>
          </div>

          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2">Improvement BD Security Service</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Donations', icon: Heart, path: '/admin/donations' },
    { name: 'All Members', icon: Users, path: '/admin/members' },
    { name: 'Blood Bank', icon: Droplets, path: '/admin/blood' },
    { name: 'Library', icon: BookOpen, path: '/admin/library' },
    { name: 'Education', icon: GraduationCap, path: '/admin/courses' },
    { name: 'Exams', icon: BookOpen, path: '/admin/exams' },
    { name: 'Banners', icon: ImageIcon, path: '/admin/banners' },
    { name: 'Sports Banners', icon: ImageIcon, path: '/admin/sports-banners' },
    { name: 'Food Bank', icon: BookOpen, path: '/admin/food-bank' },
    { name: 'Gallery', icon: ImageIcon, path: '/admin/gallery' },
    { name: 'Master Blueprint', icon: Compass, path: '/admin/blueprint' },
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
              <Route path="/donations" element={<DonationsAdmin />} />
              <Route path="/platform/:platformId" element={<PlatformAdmin />} />
              <Route path="/blueprint" element={<MasterBlueprint />} />
            </Routes>
        </main>
      </div>
    </div>
  );
}
