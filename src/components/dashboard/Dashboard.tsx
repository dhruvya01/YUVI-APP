import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarHeart, 
  MessageCircle, 
  HeartHandshake, 
  Gamepad2, 
  Image as ImageIcon, 
  Sparkles,
  Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { memoryRepo } from '../../repositories/MemoryRepository';
import { profileRepo } from '../../repositories/ProfileRepository';
import type { Memory, Profile } from '../../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [latestMemory, setLatestMemory] = useState<Memory | null>(null);
  const [yuvi, setYuvi] = useState<Profile | null>(null);
  const [manvi, setManvi] = useState<Profile | null>(null);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; emoji: string; x: number }[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const mems = await memoryRepo.findAll();
        if (mems.length > 0) {
          mems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setLatestMemory(mems[0]);
        }
        const y = await profileRepo.getYuvi();
        const m = await profileRepo.getManvi();
        setYuvi(y);
        setManvi(m);
      } catch (e) {
        console.error('Failed to load dashboard data:', e);
      }
    }
    loadData();
  }, []);

  const triggerLoveEffect = (emoji: string) => {
    const newHeart = { id: Date.now(), emoji, x: Math.random() * 80 + 10 };
    setFloatingHearts((prev) => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 2000);
  };

  return (
    <div className="space-y-4 relative">
      
      {/* Floating Hearts Animation Layer */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {floatingHearts.map((h) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 1, y: '80vh', x: `${h.x}vw`, scale: 0.8 }}
              animate={{ opacity: 0, y: '20vh', scale: 1.6, rotate: [0, 15, -15, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, ease: 'easeOut' }}
              className="absolute text-3xl drop-shadow-lg"
            >
              {h.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Hero Relationship & Couple Card */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-panel p-5 rounded-3xl relative overflow-hidden border border-[var(--color-border-glass)] shadow-xl bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-rose-500/10"
      >
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center gap-1.5 bg-rose-500/20 text-rose-400 text-xs font-bold px-3.5 py-1 rounded-full border border-rose-500/30">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
            <span>99.9% Match • Infinite Love</span>
          </div>
        </div>

        {/* Avatars & Connection Line */}
        <div className="flex items-center justify-around py-2 relative">
          <div className="flex flex-col items-center gap-1.5 group cursor-pointer" onClick={() => navigate('/profiles')}>
            <div className="w-16 h-16 rounded-full border-4 border-blue-500/80 p-0.5 shadow-lg relative bg-blue-600 overflow-hidden group-hover:scale-105 transition-transform">
              {yuvi?.photo ? (
                <img src={yuvi.photo} alt="Yuvi" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="w-full h-full flex items-center justify-center font-bold text-white text-xl">👨‍💻</span>
              )}
            </div>
            <span className="text-xs font-extrabold text-[var(--color-text-main)]">Yuvi 💙</span>
          </div>

          <div className="flex flex-col items-center">
            <motion.div 
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white text-lg shadow-md cursor-pointer"
              onClick={() => triggerLoveEffect('💖')}
            >
              💖
            </motion.div>
            <span className="text-[9px] font-bold text-rose-400 mt-1 uppercase tracking-wider">Together 2 Dec</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 group cursor-pointer" onClick={() => navigate('/profiles')}>
            <div className="w-16 h-16 rounded-full border-4 border-pink-500/80 p-0.5 shadow-lg relative bg-pink-600 overflow-hidden group-hover:scale-105 transition-transform">
              {manvi?.photo ? (
                <img src={manvi.photo} alt="Manvi" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="w-full h-full flex items-center justify-center font-bold text-white text-xl">👩‍🎨</span>
              )}
            </div>
            <span className="text-xs font-extrabold text-[var(--color-text-main)]">Manvi 💖</span>
          </div>
        </div>
      </motion.div>

      {/* Adorable Quick App Shortcuts Grid */}
      <div className="grid grid-cols-4 gap-2.5">
        {[
          { label: 'Chat', icon: MessageCircle, path: '/chat', color: 'from-blue-500 to-indigo-600', emoji: '💬' },
          { label: 'Pets', icon: HeartHandshake, path: '/panda-house', color: 'from-emerald-500 to-teal-600', emoji: '🐼' },
          { label: 'Memories', icon: ImageIcon, path: '/gallery', color: 'from-rose-500 to-pink-600', emoji: '📸' },
          { label: 'Arcade', icon: Gamepad2, path: '/arcade', color: 'from-purple-500 to-amber-500', emoji: '🕹️' },
        ].map((app) => (
          <button
            key={app.label}
            onClick={() => navigate(app.path)}
            className="glass-panel p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 hover:scale-105 active:scale-95 transition-all border border-[var(--color-border-glass)] shadow-md group"
          >
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${app.color} flex items-center justify-center text-white shadow-lg text-lg group-hover:rotate-6 transition-transform`}>
              <span>{app.emoji}</span>
            </div>
            <span className="text-[10px] font-extrabold text-[var(--color-text-main)] tracking-tight">
              {app.label}
            </span>
          </button>
        ))}
      </div>

      {/* Crazy Cute Panda Sanctuary Widget */}
      <div className="glass-panel p-4 rounded-3xl border border-[var(--color-border-glass)] shadow-xl relative overflow-hidden bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐼</span>
            <h3 className="text-sm font-extrabold text-[var(--color-text-main)]">Panda Sanctuary</h3>
          </div>
          <button 
            onClick={() => navigate('/panda-house')}
            className="text-[10px] font-bold text-emerald-400 hover:underline"
          >
            Visit House →
          </button>
        </div>

        <div className="flex items-center justify-between bg-black/10 p-3 rounded-2xl border border-[var(--color-border-glass)]">
          <div className="flex items-center gap-3">
            <motion.div 
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-3xl"
            >
              🐼
            </motion.div>
            <div>
              <p className="text-xs font-extrabold text-[var(--color-text-main)]">Bao Bao & Princess</p>
              <p className="text-[10px] text-[var(--color-text-muted)] font-medium">Happiness: 100% • Super Cozy</p>
            </div>
          </div>

          <button
            onClick={() => triggerLoveEffect('🎋')}
            className="px-3 py-1.5 bg-emerald-500 text-white rounded-full text-xs font-bold shadow-md hover:bg-emerald-600 active:scale-95 transition-all flex items-center gap-1"
          >
            <span>Feed 🎋</span>
          </button>
        </div>
      </div>

      {/* Polaroid Memory Spotlight */}
      <div 
        onClick={() => navigate('/gallery')}
        className="glass-panel p-4 rounded-3xl border border-[var(--color-border-glass)] shadow-xl cursor-pointer hover:border-rose-400 transition-colors group"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
            <CalendarHeart className="w-4 h-4 text-rose-500" />
            <span>Polaroid Memory Spotlight</span>
          </div>
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>

        {/* Polaroid Card */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 relative transform -rotate-1 group-hover:rotate-0 transition-transform">
          <div className="w-full h-40 rounded-xl overflow-hidden relative bg-slate-800">
            {latestMemory?.photos?.[0] ? (
              <img 
                src={latestMemory.photos[0]} 
                alt={latestMemory.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-pink-400/20 to-purple-400/20 flex flex-col items-center justify-center p-4 text-center">
                <span className="text-4xl mb-2">📷</span>
                <span className="text-xs font-bold text-slate-300">Tap to upload your first Polaroid photo!</span>
              </div>
            )}
          </div>
          <div className="pt-2 text-center">
            <p className="font-serif italic font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
              {latestMemory?.title || 'Our Sweet Moment ❤️'}
            </p>
          </div>
        </div>
      </div>

      {/* Virtual Love & Kiss Dispatcher */}
      <div className="glass-panel p-4 rounded-3xl border border-[var(--color-border-glass)] shadow-xl text-center space-y-3">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-text-muted)]">
          Send Instant Affection
        </h4>
        <div className="flex items-center justify-center gap-2">
          {[
            { label: 'Kiss 😘', emoji: '😘' },
            { label: 'Hug 🫂', emoji: '🫂' },
            { label: 'Heart ❤️', emoji: '❤️' },
            { label: 'Rose 🌹', emoji: '🌹' },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={() => triggerLoveEffect(btn.emoji)}
              className="flex-1 py-2 px-1 bg-black/10 hover:bg-rose-500/20 text-[var(--color-text-main)] rounded-2xl text-xs font-bold border border-[var(--color-border-glass)] active:scale-90 transition-all flex items-center justify-center gap-1"
            >
              <span>{btn.emoji}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
