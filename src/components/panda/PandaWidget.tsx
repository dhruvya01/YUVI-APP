import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Gamepad2, Apple, ShoppingBag, Home, X } from 'lucide-react';
import { usePandaState } from '../../hooks/usePandaState';
import { PandaCharacter } from './PandaCharacter';

export function PandaWidget() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mochi, momo, loading, feed, play, pet } = usePandaState();
  const [isOpen, setIsOpen] = useState(false);

  // Hide on Chat screen and Panda House full page to prevent clutter
  if (location.pathname === '/chat' || location.pathname === '/panda-house') return null;
  if (loading || !mochi || !momo) return null;

  return (
    <>
      {/* Floating Corner Round Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full glass-panel border-2 border-[var(--color-accent-primary)] shadow-2xl flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl group cursor-pointer"
        title="Open Panda Pets Widget"
      >
        <span className="text-2xl group-hover:scale-110 transition-transform">🐼</span>
        {mochi.currentMood === 'Hungry' && (
          <span className="absolute top-1 right-1 w-3 h-3 bg-rose-500 rounded-full animate-ping" />
        )}
        {mochi.currentMood === 'Hungry' && (
          <span className="absolute top-1 right-1 w-3 h-3 bg-rose-500 rounded-full" />
        )}
      </motion.button>

      {/* Floating Panda Pets Popup Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 22 }}
            className="fixed bottom-36 right-4 z-50 w-[310px] sm:w-[340px] glass-panel rounded-3xl overflow-hidden border border-[var(--color-border-glass)] shadow-2xl backdrop-blur-2xl bg-white/90 dark:bg-slate-900/90"
          >
            {/* Header Controls */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-[var(--color-border-glass)] bg-black/5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold font-serif text-[var(--color-text-main)]">Panda Pets</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] font-bold">
                  Mochi & Momo
                </span>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1 rounded-full text-[var(--color-text-muted)] hover:text-black dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Action Bar */}
            <div className="flex justify-around items-center px-4 py-2 border-b border-[var(--color-border-glass)] bg-black/5 text-xs font-semibold">
              <button 
                onClick={() => { play('mochi', 'ball'); play('momo', 'ball'); }} 
                className="flex items-center gap-1 p-1.5 hover:bg-black/5 rounded-xl text-[var(--color-text-main)] transition-colors" 
                title="Play with Pandas"
              >
                <Gamepad2 className="w-4 h-4 text-purple-500" /> Play
              </button>
              <button 
                onClick={() => { feed('mochi', 'Bamboo'); feed('momo', 'Strawberry'); }} 
                className="flex items-center gap-1 p-1.5 hover:bg-black/5 rounded-xl text-[var(--color-text-main)] transition-colors" 
                title="Feed Pandas"
              >
                <Apple className="w-4 h-4 text-rose-500" /> Feed
              </button>
              <button 
                onClick={() => { setIsOpen(false); navigate('/panda-house'); }} 
                className="flex items-center gap-1 p-1.5 hover:bg-black/5 rounded-xl text-[var(--color-text-main)] transition-colors" 
                title="Visit Shop"
              >
                <ShoppingBag className="w-4 h-4 text-amber-500" /> Shop
              </button>
              <button 
                onClick={() => { setIsOpen(false); navigate('/panda-house'); }} 
                className="flex items-center gap-1 p-1.5 hover:bg-black/5 rounded-xl text-[var(--color-text-main)] transition-colors" 
                title="Open House"
              >
                <Home className="w-4 h-4 text-blue-500" /> House
              </button>
            </div>

            {/* Two Pandas Animation Stage */}
            <div className="p-4 flex justify-around items-end h-[120px] bg-gradient-to-b from-transparent via-emerald-500/5 to-emerald-500/15 relative">
              <PandaCharacter panda={mochi} onPet={() => pet('mochi')} />
              <PandaCharacter panda={momo} onPet={() => pet('momo')} reverse />
            </div>

            {/* Live Stats Footer */}
            <div className="p-3 bg-black/5 flex justify-between text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider border-t border-[var(--color-border-glass)]">
              <div className="flex flex-col gap-1 w-1/2 pr-2 border-r border-[var(--color-border-glass)]">
                <div className="flex justify-between">
                  <span>Health</span> 
                  <span className="text-emerald-500">{mochi.stats.health}%</span>
                </div>
                <div className="w-full bg-black/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all" style={{ width: `${mochi.stats.health}%` }} />
                </div>
              </div>
              <div className="flex flex-col gap-1 w-1/2 pl-2">
                <div className="flex justify-between">
                  <span>Love</span> 
                  <span className="text-pink-500">{Math.floor((mochi.stats.friendship + momo.stats.friendship) / 2)}%</span>
                </div>
                <div className="w-full bg-black/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-pink-500 h-full transition-all" style={{ width: `${Math.floor((mochi.stats.friendship + momo.stats.friendship) / 2)}%` }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
