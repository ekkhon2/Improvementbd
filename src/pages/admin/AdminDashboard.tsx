import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { collection, query, onSnapshot, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Droplets, 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isResetting, setIsResetting] = useState(false);
  const [stats, setStats] = useState({
    members: 0,
    donors: 0,
    books: 0,
    pendingRequests: 0
  });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;

    // Fetch Totals
    const unsubStats = onSnapshot(doc(db, 'stats', 'totals'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStats(prev => ({
          ...prev,
          members: data.members || 0,
          donors: data.donors || 0,
          books: data.books || 0
        }));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'stats/totals');
    });

    // Fetch Recent Requests & Pending Count
    const q = query(collection(db, 'members'), orderBy('createdAt', 'desc'), limit(5));
    const unsubRequests = onSnapshot(q, (snap) => {
      const requests = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      setRecentRequests(requests);
      
      // Count pending (this is a bit inefficient for large datasets, but fine for now)
      // In a real app, we'd have a separate counter for pending
      const pending = requests.filter(r => r.status === 'pending').length;
      setStats(prev => ({ ...prev, pendingRequests: pending }));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'members');
    });

    setLoading(false);
    return () => {
      unsubStats();
      unsubRequests();
    };
  }, [isAdmin]);

  const statCards = [
    { title: 'Total Members', value: stats.members, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Blood Donors', value: stats.donors, icon: Droplets, color: 'text-rose-600', bg: 'bg-rose-50' },
    { title: 'Library Books', value: stats.books, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Pending Requests', value: stats.pendingRequests, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-2">Mission Control</h4>
          <h1 className="text-4xl font-black text-primary tracking-tight">System Overview</h1>
          <p className="text-secondary font-medium mt-1">Real-time monitoring and administrative tools for Improvement BD.</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-black text-primary uppercase tracking-wider">System Operational</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} transition-transform group-hover:scale-110`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
            </div>
            <div>
              <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">{stat.title}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-3xl font-black text-primary">{stat.value.toLocaleString()}</h3>
                <span className="text-[10px] font-bold text-emerald-500">+2%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
          <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-xl font-black text-primary">Recent Inbound Requests</h3>
              <p className="text-xs font-bold text-secondary uppercase tracking-widest mt-1">Membership Pipeline</p>
            </div>
            <button 
              onClick={() => navigate('/admin/members')}
              className="text-xs font-black text-accent uppercase tracking-widest hover:underline"
            >
              View All
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between px-10 py-6 hover:bg-slate-50/80 transition-colors group">
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-primary text-xl border border-slate-200 group-hover:bg-white transition-colors overflow-hidden">
                    {request.photoURL ? (
                      <img src={request.photoURL} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      request.fullName?.charAt(0)
                    )}
                  </div>
                  <div>
                    <p className="font-black text-primary text-lg">{request.fullName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-black text-secondary uppercase tracking-widest">{request.platform}</span>
                      <div className="h-1 w-1 rounded-full bg-slate-300" />
                      <span className="text-[10px] font-bold text-slate-400">
                        {request.createdAt?.toDate ? format(request.createdAt.toDate(), 'HH:mm') : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="hidden sm:block text-right">
                    <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">Date Received</p>
                    <p className="text-sm font-bold text-primary">
                      {request.createdAt?.toDate ? format(request.createdAt.toDate(), 'MMM dd, yyyy') : 'N/A'}
                    </p>
                  </div>
                  <Badge 
                    variant={request.status === 'approved' ? 'default' : request.status === 'pending' ? 'secondary' : 'destructive'}
                    className="h-8 px-4 font-black uppercase text-[10px] tracking-widest rounded-full"
                  >
                    {request.status}
                  </Badge>
                </div>
              </div>
            ))}
            {recentRequests.length === 0 && (
              <div className="py-20 text-center">
                <Clock className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <p className="text-secondary font-bold">No active requests in queue.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions / System Status */}
        <div className="space-y-10">
          <div className="bg-primary p-8 rounded-[2.5rem] shadow-2xl shadow-primary/20 text-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 h-40 w-40 bg-white/5 rounded-full blur-3xl" />
            <h3 className="text-xl font-black mb-8 relative z-10">Command Center</h3>
            <div className="space-y-4 relative z-10">
              {[
                { name: 'Manage Members', icon: Users, path: '/admin/members' },
                { name: 'Gallery Posts', icon: ImageIcon, path: '/admin/gallery' },
                { name: 'Hero Banners', icon: ImageIcon, path: '/admin/banners' },
                { name: 'Blood Donors', icon: Droplets, path: '/admin/blood' },
                { name: 'Food Bank Menu', icon: BookOpen, path: '/admin/food-bank' },
              ].map((action) => (
                <button 
                  key={action.name}
                  onClick={() => navigate(action.path)}
                  className="w-full flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 hover:border-white/20 group"
                >
                  <span className="font-bold text-sm tracking-tight">{action.name}</span>
                  <action.icon className="h-5 w-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm">
            <h3 className="text-lg font-black text-primary mb-6">Platform Health</h3>
            <div className="space-y-6">
              {[
                { name: 'Foundation', status: 'Optimal', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { name: 'Blood Bank', status: 'Optimal', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { name: 'Food Bank', status: 'Maintenance', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
              ].map((p) => (
                <div key={p.name} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-xl ${p.bg} flex items-center justify-center ${p.color}`}>
                      <p.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-black text-sm text-primary">{p.name}</p>
                      <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">{p.status}</p>
                    </div>
                  </div>
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-200 group-hover:bg-accent transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
