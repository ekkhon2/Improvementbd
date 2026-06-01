import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/src/context/LanguageContext';
import { db } from '@/src/lib/firebase';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Facebook, 
  Sparkles, 
  Trophy, 
  Zap, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Users, 
  Search,
  BookOpen,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

interface Player {
  id: string;
  fullName: string;
  facebookURL?: string;
  teamName?: string;
  specialSkill?: string;
  skillLevel: 'pro' | 'intermediate' | 'beginner';
  photoURL?: string;
}

const DEMO_PLAYERS: Player[] = [
  // Pro Players
  {
    id: 'demo-1',
    fullName: 'সঞ্জিদ রহমান (Sanjid)',
    facebookURL: 'https://facebook.com',
    teamName: 'Improvement Ninjas',
    specialSkill: 'পাওয়ার হিটার এবং অলরাউন্ডার (Power Hitter & Allrounder)',
    skillLevel: 'pro',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 'demo-2',
    fullName: 'নদিম চৌধুরী (Nadim)',
    facebookURL: 'https://facebook.com',
    teamName: 'Improvement Warriors',
    specialSkill: 'ক্লিনিক্যাল ফিনিশার এবং স্ট্রাইকার (Clinical Finisher & Striker)',
    skillLevel: 'pro',
    photoURL: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 'demo-3',
    fullName: 'রকিব হাসান (Rakib)',
    facebookURL: 'https://facebook.com',
    teamName: 'Improvement Tigers',
    specialSkill: 'এক্সপ্রেস ফাস্ট বোলার (Express Fast Bowler)',
    skillLevel: 'pro',
    photoURL: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=60'
  },
  // Intermediate Players
  {
    id: 'demo-4',
    fullName: 'তানভীর আহমেদ (Tanvir)',
    facebookURL: 'https://facebook.com',
    teamName: 'Improvement Ninjas',
    specialSkill: 'লেফট আর্ট স্পিনার (Left-Arm Orthodox Spin)',
    skillLevel: 'intermediate',
    photoURL: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 'demo-5',
    fullName: 'ফয়সাল মাহমুদ (Faisal)',
    facebookURL: 'https://facebook.com',
    teamName: 'Improvement Tigers',
    specialSkill: 'সলিড টপ-অর্ডার ব্যাটসম্যান (Solid Top-Order Batsman)',
    skillLevel: 'intermediate',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 'demo-6',
    fullName: 'আশিকুর রহমান (Ashik)',
    facebookURL: 'https://facebook.com',
    teamName: 'Improvement Warriors',
    specialSkill: 'মিডফিল্ড প্লেমেকার (Midfield Playmaker)',
    skillLevel: 'intermediate',
    photoURL: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=60'
  },
  // Beginner Players
  {
    id: 'demo-7',
    fullName: 'হীরা তালুকদার (Hira)',
    facebookURL: 'https://facebook.com',
    teamName: 'Improvement Tigers',
    specialSkill: 'অ্যাথলেটিক উইকেটকিপার (Wicketkeeper-Batsman)',
    skillLevel: 'beginner',
    photoURL: 'https://images.unsplash.com/photo-1520341280432-4749d4d7bcf9?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 'demo-8',
    fullName: 'অপূর্ব রায় (Apurbo)',
    facebookURL: 'https://facebook.com',
    teamName: 'Improvement Ninjas',
    specialSkill: 'শার্প রিফ্লেক্স গোলকিপার (Reflex Goalkeeper)',
    skillLevel: 'beginner',
    photoURL: 'https://images.unsplash.com/photo-1489980508314-941910ded1f4?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 'demo-9',
    fullName: 'ইমাম হোসাইন (Emam)',
    facebookURL: 'https://facebook.com',
    teamName: 'Improvement Warriors',
    specialSkill: 'ডিফেন্ডার উইঙ্গার (Agile Wingback)',
    skillLevel: 'beginner',
    photoURL: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=400&auto=format&fit=crop&q=60'
  }
];

export default function SportingPlayers() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [dbPlayers, setDbPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState('');
  
  // Track open states for 'See All' dropdowns
  const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({
    pro: false,
    intermediate: false,
    beginner: false
  });

  // Fetch sporting club members
  useEffect(() => {
    const q = query(
      collection(db, 'members'),
      where('platform', 'array-contains', 'sporting-club'),
      where('status', '==', 'approved')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const playersList = snapshot.docs.map(doc => {
        const data = doc.data();
        let level: 'pro' | 'intermediate' | 'beginner' = 'beginner';
        if (data.skillLevel === 'pro') level = 'pro';
        else if (data.skillLevel === 'intermediate') level = 'intermediate';
        
        return {
          id: doc.id,
          fullName: data.fullName,
          facebookURL: data.facebookURL || '',
          teamName: data.teamName || 'Improvement Club',
          specialSkill: data.specialSkill || data.preferredSport || 'Sporting Member',
          skillLevel: level,
          photoURL: data.photoURL || 'https://images.unsplash.com/photo-1431324155629-1a6edd1dec8d?w=400&auto=format&fit=crop&q=60'
        } as Player;
      });
      setDbPlayers(playersList);
    });

    return () => unsubscribe();
  }, []);

  // Merge database players with mock players to ensure a rich list is shown
  const allPlayers = [...dbPlayers, ...DEMO_PLAYERS.filter(demo => 
    !dbPlayers.some(dbP => dbP.fullName.toLowerCase() === demo.fullName.toLowerCase())
  )];

  // Filter with search
  const filteredPlayers = allPlayers.filter(p => {
    const q = search.toLowerCase();
    return p.fullName.toLowerCase().includes(q) || 
      (p.teamName || '').toLowerCase().includes(q) || 
      (p.specialSkill || '').toLowerCase().includes(q);
  });

  const proPlayers = filteredPlayers.filter(p => p.skillLevel === 'pro');
  const intermediatePlayers = filteredPlayers.filter(p => p.skillLevel === 'intermediate');
  const beginnerPlayers = filteredPlayers.filter(p => p.skillLevel === 'beginner');

  const levelsConfig = [
    {
      key: 'pro',
      titleBn: 'প্রো লেভেল খেলোয়াড় (Pro Level Players)',
      titleEn: 'Pro Level Players',
      icon: <Trophy className="h-6 w-6 text-yellow-500 animate-bounce" />,
      color: 'border-yellow-200 bg-yellow-50/40 text-yellow-700',
      players: proPlayers
    },
    {
      key: 'intermediate',
      titleBn: 'ইন্টারমিডিয়েট লেভেল খেলোয়াড় (Intermediate Level Players)',
      titleEn: 'Intermediate Level Players',
      icon: <Zap className="h-6 w-6 text-emerald-500" />,
      color: 'border-emerald-200 bg-emerald-50/40 text-emerald-700',
      players: intermediatePlayers
    },
    {
      key: 'beginner',
      titleBn: 'বিগিনার লেভেল খেলোয়াড় (Beginner Level Players)',
      titleEn: 'Beginner Level Players',
      icon: <Sparkles className="h-6 w-6 text-sky-500" />,
      color: 'border-sky-200 bg-sky-50/40 text-sky-700',
      players: beginnerPlayers
    }
  ];

  const handleToggleExpand = (levelKey: string) => {
    setExpandedLevels(prev => ({
      ...prev,
      [levelKey]: !prev[levelKey]
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Premium Dark Top Banner */}
      <div className="relative bg-slate-950 text-white overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <Button 
            onClick={() => navigate('/sporting-club')}
            variant="ghost" 
            className="text-white hover:bg-white/10 hover:text-white mb-8 border border-white/10 rounded-full h-10 px-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'bn' ? 'স্পোর্টিং ক্লাবে ফিরুন' : 'Back to Sporting Club'}
          </Button>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl text-center md:text-left">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs uppercase tracking-widest border border-emerald-500/10">
                <Trophy className="h-3 w-3" />
                {language === 'bn' ? 'ইমপ্রুভমেন্ট স্পোর্টিং ক্লাব' : 'Improvement Sporting Club'}
              </span>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                {language === 'bn' ? 'আমাদের খেলোয়াড়বৃন্দ' : 'Meet Our Players'}
              </h1>
              <p className="text-slate-400 font-medium text-base md:text-lg">
                {language === 'bn' 
                  ? 'একতা ও স্পোর্টসম্যানশিপের সাথে যারা আমাদের মাঠ কাঁপিয়ে চলেছেন। আমাদের প্রো, ইন্টারমিডিয়েট ও বিগিনার খেলোয়াড়দের তালিকা।'
                  : 'United with dedication, training, and sportsmanship. Scroll through our active players across three progressive leagues.'
                }
              </p>
            </div>

            {/* Premium Interactive Search */}
            <div className="w-full md:w-96">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'খেলোয়াড় বা দক্ষতা খুঁজুন...' : 'Search player or skill...'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-14 bg-white/5 border border-white/10 hover:border-white/20 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-white pl-12 pr-4 rounded-2xl outline-none font-medium text-sm transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Channels of Levels */}
      <div className="container mx-auto px-4 max-w-7xl mt-12 space-y-16">
        {levelsConfig.map(({ key, titleBn, titleEn, icon, color, players }) => {
          if (players.length === 0) return null;
          const isExpanded = expandedLevels[key];

          return (
            <section key={key} className="space-y-6">
              {/* Category Header */}
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-sm shrink-0">
                    {icon}
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                      {language === 'bn' ? titleBn : titleEn}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium font-mono uppercase tracking-widest mt-0.5">
                      {players.length} {language === 'bn' ? 'সদস্য অ্যাক্টিভ' : 'active players'}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => handleToggleExpand(key)}
                  variant="outline"
                  className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold h-10 px-5 rounded-xl text-xs gap-1.5 shadow-sm transition-all"
                >
                  {isExpanded ? (
                    language === 'bn' ? 'স্লাইড দেখুন' : 'Show Slider'
                  ) : (
                    <>
                      {language === 'bn' ? 'সব দেখুন' : 'See All'}
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>

              {/* Toggle Content: Slider vs Grid Dropdown */}
              <AnimatePresence mode="wait">
                {isExpanded ? (
                  // Expand View: Interactive Grid of Players
                  <motion.div
                    key={`${key}-grid`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 pt-2"
                  >
                    {players.map((player) => (
                      <PlayerCard key={player.id} player={player} />
                    ))}
                  </motion.div>
                ) : (
                  // Slider View: Animated Horizontal Paging Slider
                  <motion.div
                    key={`${key}-slider`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative pt-2"
                  >
                    <SliderCarousel players={players} />
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          );
        })}
      </div>
    </div>
  );
}

/* Custom Responsive Slider Component */
function SliderCarousel({ players }: { players: Player[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setShowLeft(scrollLeft > 10);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [players]);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollStep = 320;
      const target = containerRef.current.scrollLeft + (direction === 'left' ? -scrollStep : scrollStep);
      containerRef.current.scrollTo({
        left: target,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative group/carousel">
      {/* Scrollable Track */}
      <div
        ref={containerRef}
        onScroll={checkScroll}
        className="flex gap-5 md:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {players.map((player) => (
          <div key={player.id} className="w-[200px] xs:w-[240px] sm:w-[280px] shrink-0 snap-start">
            <PlayerCard player={player} />
          </div>
        ))}
      </div>

      {/* Navigation Buttons (Visible on desktop hover) */}
      {showLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white border border-slate-200/80 shadow-lg text-slate-800 hover:bg-slate-50 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity focus:opacity-100"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
      {showRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white border border-slate-200/80 shadow-lg text-slate-800 hover:bg-slate-50 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity focus:opacity-100"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}

/* Polished Photo Card Component */
const PlayerCard: React.FC<{ player: Player }> = ({ player }) => {
  const { language } = useLanguage();

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-150/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group h-[380px] md:h-[400px]">
      {/* Player Photo (Medium Size, Top Half) */}
      <div className="relative aspect-[4/5] bg-slate-100 overflow-hidden shrink-0">
        <img
          src={player.photoURL}
          alt={player.fullName}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Level Tag Overlay */}
        <div className="absolute top-3 left-3">
          <Badge className={`
            font-black text-[9px] uppercase tracking-wider rounded-lg border px-2 py-0.5
            ${player.skillLevel === 'pro' ? 'bg-amber-500 border-amber-600 text-white shadow-sm' : ''}
            ${player.skillLevel === 'intermediate' ? 'bg-emerald-600 border-emerald-700 text-white shadow-sm' : ''}
            ${player.skillLevel === 'beginner' ? 'bg-sky-500 border-sky-600 text-white shadow-sm' : ''}
          `}>
            {player.skillLevel === 'pro' && 'PRO'}
            {player.skillLevel === 'intermediate' && 'INTERMEDIATE'}
            {player.skillLevel === 'beginner' && 'BEGINNER'}
          </Badge>
        </div>
      </div>

      {/* Info Body */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div className="space-y-1.5">
          {/* Team Name badge */}
          <p className="text-[10px] font-black tracking-widest text-emerald-600 uppercase font-mono">
            {player.teamName}
          </p>
          
          {/* Name */}
          <h3 className="font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors text-sm md:text-base tracking-tight leading-tight line-clamp-1">
            {player.fullName}
          </h3>

          {/* Social skill description */}
          <p className="text-xs text-slate-500 font-medium leading-snug line-clamp-2">
            <span className="font-bold text-slate-700">Skill:</span> {player.specialSkill}
          </p>
        </div>

        {/* Facebook Link Button */}
        {player.facebookURL && (
          <div className="pt-2">
            <a
              href={player.facebookURL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-slate-950 text-white hover:bg-emerald-600 rounded-xl text-[11px] font-black font-mono transition-all uppercase tracking-wider shadow-sm hover:shadow-md"
            >
              <Facebook className="h-3.5 w-3.5 fill-current" />
              {language === 'bn' ? 'ফেসবুক প্রোফাইল' : 'Facebook ID'}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
