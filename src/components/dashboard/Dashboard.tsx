import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Heart,
  CalendarHeart,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { memoryRepo } from '../../repositories/MemoryRepository';
import { profileRepo } from '../../repositories/ProfileRepository';
import { usePandaState } from '../../hooks/usePandaState';
import { PandaCharacter } from '../panda/PandaCharacter';
import type { Memory, Profile } from '../../types';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { mochi, momo } = usePandaState();
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
        setYuvi(await profileRepo.getYuvi());
        setManvi(await profileRepo.getManvi());
      } catch (e) {
        console.error('Failed to load dashboard data:', e);
      }
    }
    loadData();
  }, []);

  const triggerLoveEffect = (emoji: string) => {
    const newHeart = { id: Date.now(), emoji, x: Math.random() * 80 + 10 };
    setFloatingHearts((prev) => [...prev, newHeart]);
    setTimeout(() => setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id)), 2000);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 relative">

      {/* Floating Hearts Layer */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {floatingHearts.map((h) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 1, y: '80vh', x: `${h.x}vw`, scale: 0.5 }}
              animate={{ opacity: 0, y: '10vh', scale: 1.8, rotate: [0, 20, -20, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="absolute text-3xl drop-shadow-lg"
            >
              {h.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ━━━ Hero Couple Card ━━━ */}
      <motion.div
        variants={item}
        className="relative p-5 rounded-3xl overflow-hidden border border-[var(--color-border-glass)] shadow-xl card-hover"
        style={{
          background: 'linear-gradient(135deg, rgba(244,63,94,0.08) 0%, rgba(168,85,247,0.06) 50%, rgba(244,63,94,0.04) 100%)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Decorative corner orbs */}
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-[var(--color-accent-primary)] opacity-[0.06] blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full bg-[var(--color-accent-secondary)] opacity-[0.06] blur-2xl" />

        <div className="flex items-center justify-center mb-3">
          <div className="flex items-center gap-1.5 bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] text-[10px] font-bold px-3 py-1 rounded-full border border-[var(--color-accent-primary)]/20">
            <Heart className="w-3 h-3 fill-current animate-pulse" />
            <span>Soulmates • Infinite Love</span>
          </div>
        </div>

        <div className="flex items-center justify-around py-1 relative">
          {/* Yuvi */}
          <button className="flex flex-col items-center gap-1.5 group" onClick={() => navigate('/profiles')}>
            <div className="relative">
              <div className="w-[60px] h-[60px] rounded-2xl border-[3px] border-blue-500/60 p-[2px] shadow-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 overflow-hidden group-hover:scale-105 transition-transform">
                {yuvi?.photo ? (
                  <img src={yuvi.photo} alt="Yuvi" className="w-full h-full rounded-xl object-cover" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-2xl bg-blue-500/10 rounded-xl">👨‍💻</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[var(--color-bg-base)]" />
            </div>
            <span className="text-[10px] font-bold text-[var(--color-text-main)]">Yuvi 💙</span>
          </button>

          {/* Center Heart */}
          <div className="flex flex-col items-center">
            <motion.button
              whileTap={{ scale: 0.9 }}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-xl shadow-lg shadow-rose-500/20"
              onClick={() => triggerLoveEffect('💖')}
            >
              💖
            </motion.button>
            <span className="text-[8px] font-bold text-[var(--color-text-muted)] mt-1.5 tracking-wider uppercase">Since Dec 2</span>
          </div>

          {/* Manvi */}
          <button className="flex flex-col items-center gap-1.5 group" onClick={() => navigate('/profiles')}>
            <div className="relative">
              <div className="w-[60px] h-[60px] rounded-2xl border-[3px] border-pink-500/60 p-[2px] shadow-lg bg-gradient-to-br from-pink-500/20 to-rose-500/20 overflow-hidden group-hover:scale-105 transition-transform">
                {manvi?.photo ? (
                  <img src={manvi.photo} alt="Manvi" className="w-full h-full rounded-xl object-cover" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-2xl bg-pink-500/10 rounded-xl">👩‍🎨</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[var(--color-bg-base)]" />
            </div>
            <span className="text-[10px] font-bold text-[var(--color-text-main)]">Manvi 💖</span>
          </button>
        </div>
      </motion.div>

      {/* ━━━ Quick Access Grid ━━━ */}
      <motion.div variants={item} className="grid grid-cols-4 gap-2">
        {[
          { label: 'Chat', path: '/chat', color: 'from-blue-500 to-indigo-600', emoji: '💬' },
          { label: 'Pets', path: '/panda-house', color: 'from-emerald-500 to-teal-600', emoji: '🐼' },
          { label: 'Memories', path: '/gallery', color: 'from-rose-500 to-pink-600', emoji: '📸' },
          { label: 'Arcade', path: '/arcade', color: 'from-purple-500 to-violet-600', emoji: '🕹️' },
        ].map((app) => (
          <motion.button
            key={app.label}
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate(app.path)}
            className="glass-panel p-3 rounded-2xl flex flex-col items-center gap-1.5 card-hover border border-[var(--color-border-glass)]"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center text-lg shadow-md`}>
              {app.emoji}
            </div>
            <span className="text-[9px] font-bold text-[var(--color-text-main)] tracking-tight">
              {app.label}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* ━━━ Panda Sanctuary Widget ━━━ */}
      <motion.div
        variants={item}
        className="glass-panel p-4 rounded-3xl border border-[var(--color-border-glass)] shadow-lg card-hover overflow-hidden relative"
      >
        <div className="absolute -top-6 -right-6 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl" />
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🐼</span>
            <h3 className="text-xs font-bold text-[var(--color-text-main)]">Panda Sanctuary</h3>
          </div>
          <button onClick={() => navigate('/panda-house')} className="text-[10px] font-bold text-emerald-500 hover:underline">
            Visit →
          </button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl border border-[var(--color-border-glass)] bg-black/5">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/panda-house')}>
            {mochi && <PandaCharacter panda={mochi} onPet={() => triggerLoveEffect('💖')} size="md" />}
            {momo && <PandaCharacter panda={momo} onPet={() => triggerLoveEffect('💖')} size="sm" reverse />}
            <div>
              <p className="text-xs font-bold text-[var(--color-text-main)]">Mochi & Momo</p>
              <p className="text-[9px] text-[var(--color-text-muted)]">Big & Small Dude Pandas 🌿</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => triggerLoveEffect('🎋')}
            className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-[10px] font-bold shadow-md"
          >
            Feed 🎋
          </motion.button>
        </div>
      </motion.div>

      {/* ━━━ Polaroid Memory Spotlight ━━━ */}
      <motion.div
        variants={item}
        onClick={() => navigate('/gallery')}
        className="glass-panel p-4 rounded-3xl border border-[var(--color-border-glass)] shadow-lg cursor-pointer card-hover group"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-[var(--color-accent-primary)] font-bold text-[10px]">
            <CalendarHeart className="w-4 h-4" />
            <span>Memory Spotlight</span>
          </div>
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>

        <div className="bg-white p-2.5 rounded-2xl shadow-lg border border-slate-100 relative transform -rotate-1 group-hover:rotate-0 transition-transform duration-500">
          <div className="w-full h-36 rounded-xl overflow-hidden relative bg-slate-100">
            {latestMemory?.photos?.[0] ? (
              <img
                src={latestMemory.photos[0]}
                alt={latestMemory.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-pink-50 to-purple-50 flex flex-col items-center justify-center">
                <span className="text-3xl mb-1">📷</span>
                <span className="text-[10px] font-medium text-slate-400">Add your first photo!</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
          <p className="pt-2 text-center font-serif italic font-bold text-[10px] text-slate-700 truncate">
            {latestMemory?.title || 'Our Sweet Moment ❤️'}
          </p>
        </div>
      </motion.div>

      {/* ━━━ Affection Buttons ━━━ */}
      <motion.div variants={item} className="glass-panel p-3 rounded-2xl border border-[var(--color-border-glass)] shadow-lg">
        <div className="flex items-center justify-center gap-2">
          {[
            { emoji: '😘', label: 'Kiss' },
            { emoji: '🫂', label: 'Hug' },
            { emoji: '❤️', label: 'Love' },
            { emoji: '🌹', label: 'Rose' },
            { emoji: '🦋', label: 'Butterfly' },
          ].map((btn) => (
            <motion.button
              key={btn.label}
              whileTap={{ scale: 0.85, rotate: 10 }}
              onClick={() => triggerLoveEffect(btn.emoji)}
              className="flex-1 py-2 rounded-xl bg-black/5 hover:bg-[var(--color-accent-primary)]/10 flex items-center justify-center text-lg transition-colors"
              title={btn.label}
            >
              {btn.emoji}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
