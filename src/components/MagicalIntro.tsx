import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function MagicalIntro() {
  const { setIntroSeen } = useTheme();
  const [step, setStep] = useState(0);
  const [isBeating, setIsBeating] = useState(false);
  const [now, setNow] = useState(new Date());

  // Relationship Start Date
  const startDate = new Date('2025-12-02T00:00:00');

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const diff = Math.max(0, now.getTime() - startDate.getTime());
  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  // Simple calculation for display in the intro (accurate one in Home)
  const years = Math.floor(days / 365);
  const displayDays = days % 365;

  // Auto progression for initial text
  useEffect(() => {
    if (step === 0) {
      const t = setTimeout(() => setStep(1), 3000);
      return () => clearTimeout(t);
    }
    if (step === 1) {
      const t = setTimeout(() => setStep(2), 3000);
      return () => clearTimeout(t);
    }
    if (step === 2) {
      const t = setTimeout(() => setStep(3), 3500);
      return () => clearTimeout(t);
    }
    if (step === 3) {
      const t = setTimeout(() => setStep(4), 3000);
      return () => clearTimeout(t);
    }
    
    // After heart tap, progression
    if (step === 6) {
      const t = setTimeout(() => setStep(7), 5000); // show "Every second..."
      return () => clearTimeout(t);
    }
    if (step === 7) {
      const t = setTimeout(() => setStep(8), 5000); // show timer
      return () => clearTimeout(t);
    }
  }, [step]);

  const handleHeartTap = () => {
    setIsBeating(true);
    setStep(5);
    setTimeout(() => {
      setStep(6);
      setIsBeating(false);
    }, 4000);
  };

  const handleOpenDoor = () => {
    setStep(9); // Trigger door animation
    setTimeout(() => {
      setIntroSeen(true);
    }, 2000);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden text-white font-serif ${isBeating ? 'animate-shake' : ''}`}>
      {/* Tiny stars background */}
      <div className="absolute inset-0 opacity-50">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
      
      {/* Explosions */}
      {step === 6 && (
        <div className="absolute inset-0 pointer-events-none">
           {Array.from({ length: 100 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: (Math.random() - 0.5) * window.innerWidth * 1.5,
                y: (Math.random() - 0.5) * window.innerHeight * 1.5,
                opacity: 0,
                scale: 0
              }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <Heart className="w-6 h-6 text-rose-500" fill="currentColor" />
            </motion.div>
          ))}
        </div>
      )}

      <div className="relative z-10 text-center px-4 max-w-2xl w-full">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.p key="text0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }} className="text-2xl md:text-4xl tracking-wide">
              Hey Manvi...
            </motion.p>
          )}

          {step === 1 && (
            <motion.p key="text1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }} className="text-2xl md:text-4xl tracking-wide">
              You have something waiting for you.
            </motion.p>
          )}

          {step === 2 && (
            <motion.p key="text2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }} className="text-2xl md:text-4xl tracking-wide">
              Someone spent time creating this...
            </motion.p>
          )}
          
          {step === 3 && (
            <motion.p key="text3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }} className="text-2xl md:text-4xl tracking-wide text-rose-400">
              Just for you ❤️
            </motion.p>
          )}

          {step === 4 && (
            <motion.div key="heart" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }} className="flex flex-col items-center">
              <button onClick={handleHeartTap} className="relative group focus:outline-none outline-none">
                <Heart className="w-32 h-32 text-rose-500 drop-shadow-[0_0_25px_rgba(244,63,94,0.8)] group-hover:scale-110 transition-transform duration-500 cursor-pointer" fill="currentColor" />
              </button>
              <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="mt-8 text-xl tracking-widest text-rose-200 uppercase">
                ✨ Tap the Heart ✨
              </motion.p>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="beating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 2 }} transition={{ duration: 1 }} className="flex flex-col items-center">
               <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>
                 <Heart className="w-40 h-40 text-rose-500 drop-shadow-[0_0_50px_rgba(244,63,94,1)]" fill="currentColor" />
               </motion.div>
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="mt-12 text-2xl md:text-4xl">
                 <p className="mb-4">Some stories begin with a hello...</p>
                 <p className="mb-4">...ours began on</p>
                 <motion.p animate={{ textShadow: ["0 0 10px #fff", "0 0 20px #fff", "0 0 10px #fff"] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl md:text-5xl font-bold text-rose-400">
                   2 December 2025
                 </motion.p>
               </motion.div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="seconds" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }} className="flex flex-col items-center">
              <p className="text-3xl md:text-5xl leading-relaxed mb-4">
                "Every second since then..."
              </p>
              <p className="text-3xl md:text-5xl leading-relaxed text-rose-400 font-style: italic">
                "...has been another reason to smile."
              </p>
            </motion.div>
          )}
          
          {step === 7 && (
            <motion.div key="timer" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }} className="flex flex-col items-center">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center mt-8">
                {[{l: 'Years', v: years}, {l: 'Days', v: displayDays}, {l: 'Hours', v: hours}, {l: 'Mins', v: minutes}, {l: 'Secs', v: seconds}].filter(u => u.v > 0 || u.l === 'Secs').map((unit, i) => (
                  <div key={unit.l} className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                    <span className="text-4xl md:text-6xl font-bold font-sans text-rose-400">{unit.v}</span>
                    <span className="text-sm uppercase tracking-wider text-rose-200 mt-2">{unit.l}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          
          {step === 8 && (
            <motion.div key="door" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 2 }}>
               <div className="w-64 h-96 mx-auto border-4 border-white/20 rounded-t-full flex items-center justify-center relative overflow-hidden bg-black/50 backdrop-blur-md shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                 <div className="absolute inset-0 bg-gradient-to-t from-rose-500/20 to-transparent"></div>
                 
                 <button onClick={handleOpenDoor} className="relative z-10 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full flex items-center gap-2 backdrop-blur-lg transition-all group">
                   <Heart className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" fill="currentColor"/>
                   <span className="uppercase tracking-widest text-sm font-medium">Open Our Little World</span>
                 </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Door opening zoom animation */}
      {step === 9 && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="absolute inset-0 z-50 bg-white"
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}
