import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, X, Gift } from 'lucide-react';

export default function SurpriseModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);

  useEffect(() => {
    // Show surprise modal on app launch
    const hasSeenSession = sessionStorage.getItem('manvi_surprise_seen');
    if (!hasSeenSession) {
      const timer = setTimeout(() => setIsOpen(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    sessionStorage.setItem('manvi_surprise_seen', 'true');
    setIsOpen(false);

    // Launch floating hearts explosion
    const newHearts = Array.from({ length: 25 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 90 + 5
    }));
    setHearts(newHearts);

    setTimeout(() => {
      setHearts([]);
    }, 2500);
  };

  return (
    <>
      {/* Heart Explosion Layer */}
      <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
        <AnimatePresence>
          {hearts.map((h) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 1, y: '90vh', x: `${h.x}vw`, scale: 0.5 }}
              animate={{ opacity: 0, y: '10vh', scale: 2, rotate: [0, 20, -20, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.2, ease: 'easeOut' }}
              className="absolute text-4xl drop-shadow-2xl"
            >
              💖
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Surprise Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="relative w-full max-w-sm bg-gradient-to-br from-slate-900 via-pink-950/80 to-purple-950 p-6 rounded-3xl border border-pink-500/30 shadow-2xl text-center text-white overflow-hidden"
            >
              {/* Decorative Glow */}
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-pink-500/30 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-purple-500/30 rounded-full blur-2xl pointer-events-none" />

              {/* Close Icon */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Gift Badge */}
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/30 animate-bounce">
                <Gift className="w-8 h-8 text-white" />
              </div>

              {/* Message Titles */}
              <div className="space-y-2 mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold border border-pink-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Surprise For You</span>
                </div>
                
                <h2 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-rose-200 to-purple-300">
                  This is for you Manvi ❤️
                </h2>

                <p className="text-xs text-slate-300 leading-relaxed font-medium px-2">
                  Crafted with all my love just for you, my princess! Welcome to your special place. ✨
                </p>
              </div>

              {/* Primary Action Button */}
              <button
                onClick={handleClose}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-extrabold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 border border-pink-400/30"
              >
                <Heart className="w-4 h-4 fill-white animate-pulse" />
                <span>Love You Yuvi 😘</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
