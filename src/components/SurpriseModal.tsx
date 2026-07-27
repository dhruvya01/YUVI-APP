import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, X, Gift } from 'lucide-react';

const CUTE_PARTICLES = ['🌸', '🎀', '💕', '✨', '💖', '🧸', '🌷', '💘', '🦋', '⭐'];

export default function SurpriseModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [particles, setParticles] = useState<{ id: number; emoji: string; x: number; delay: number }[]>([]);

  useEffect(() => {
    const hasSeenSession = sessionStorage.getItem('manvi_surprise_seen');
    if (!hasSeenSession) {
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  // Ambient sparkles inside the modal
  const sparkles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 4 + Math.random() * 6,
      delay: Math.random() * 3,
    })), []);

  const handleClose = () => {
    sessionStorage.setItem('manvi_surprise_seen', 'true');
    setIsOpen(false);

    const newParticles = Array.from({ length: 24 }, (_, i) => ({
      id: Date.now() + i,
      emoji: CUTE_PARTICLES[i % CUTE_PARTICLES.length],
      x: Math.random() * 85 + 7,
      delay: Math.random() * 0.5,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 3000);
  };

  return (
    <>
      {/* Particle explosion layer */}
      <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, y: '80vh', x: `${p.x}vw`, scale: 0.4, rotate: 0 }}
              animate={{ opacity: 0, y: '5vh', scale: 1.8, rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.5, ease: 'easeOut', delay: p.delay }}
              className="absolute text-2xl filter drop-shadow-lg"
            >
              {p.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 260 }}
              className="relative w-full max-w-xs overflow-hidden rounded-[28px] border border-white/10 shadow-2xl"
              style={{
                background: 'linear-gradient(145deg, #1a1125 0%, #2d1b3d 30%, #1f1530 70%, #150f20 100%)',
              }}
            >
              {/* Ambient sparkles */}
              {sparkles.map((s) => (
                <motion.div
                  key={s.id}
                  className="absolute rounded-full bg-white pointer-events-none"
                  style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
                  animate={{ opacity: [0, 0.3, 0], scale: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: s.delay }}
                />
              ))}

              {/* Gradient orbs */}
              <div className="absolute -top-16 -left-16 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl" />

              {/* Content */}
              <div className="relative z-10 p-7 text-center">
                {/* Close */}
                <button onClick={handleClose} className="absolute top-3 right-3 p-1.5 rounded-full bg-white/5 text-white/30 hover:text-white/60 transition-colors">
                  <X className="w-4 h-4" />
                </button>

                {/* Gift icon */}
                <motion.div
                  animate={{ y: [0, -6, 0], rotate: [0, 3, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-pink-500/30"
                >
                  <Gift className="w-8 h-8 text-white" />
                </motion.div>

                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-pink-300 text-[10px] font-bold border border-pink-500/20 mb-3">
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                  <span>A Surprise For You</span>
                </div>

                {/* Message */}
                <h2 className="text-xl font-black tracking-tight mb-2 text-gradient-shimmer"
                  style={{
                    background: 'linear-gradient(90deg, #f9a8d4 0%, #c084fc 25%, #fff 50%, #f9a8d4 75%, #c084fc 100%)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'shimmer 3s linear infinite',
                  }}
                >
                  This is for you Manvi ❤️
                </h2>

                <p className="text-[11px] text-white/50 leading-relaxed font-medium mb-6 px-2">
                  Crafted with endless love just for you. Welcome to your special place ✨
                </p>

                {/* CTA */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClose}
                  className="w-full py-3 rounded-2xl font-extrabold text-sm text-white flex items-center justify-center gap-2 border border-pink-400/20 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #ec4899, #f43f5e, #a855f7)',
                    boxShadow: '0 4px 24px rgba(244,63,94,0.3)',
                  }}
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Love You 💕</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
