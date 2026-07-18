import { useState, useEffect } from "react";

import { motion } from 'framer-motion';

export default function Home() {
  const [now, setNow] = useState(new Date());
  const startDate = new Date('2025-12-02T00:00:00');

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const diff = Math.max(0, now.getTime() - startDate.getTime());
  
  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor((diff / (1000 * 60 * 60 * 24)) % 30.4375); // approx days per month
  const months = Math.floor((diff / (1000 * 60 * 60 * 24 * 30.4375)) % 12);
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="glass-panel p-8 md:p-12 rounded-3xl max-w-3xl w-full text-center relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[var(--color-accent-primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[var(--color-accent-secondary)] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 1.5, delay: 0.8 }}
            className="w-32 h-32 md:w-48 md:h-48 mx-auto rounded-full border-4 border-[var(--color-border-glass)] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.2)] mb-8 flex items-center justify-center bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)]"
          >
            {/* Placeholder for couple photo */}
            <span className="text-4xl md:text-6xl text-white font-serif italic">Y & M</span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 tracking-tight">
            YUVI <span className="text-[var(--color-accent-primary)] animate-pulse inline-block mx-2">❤️</span> MANVI
          </h1>
          
          <p className="text-xl md:text-2xl italic font-serif text-[var(--color-text-muted)] mb-10">
            "Every day with you is my favorite day."
          </p>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 text-center mt-8">
            {[
              { label: 'Years', value: years },
              { label: 'Months', value: months },
              { label: 'Days', value: days },
              { label: 'Hours', value: hours },
              { label: 'Mins', value: minutes },
              { label: 'Secs', value: seconds },
            ].map((unit, i) => (
              <motion.div 
                key={unit.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + (i * 0.1), type: "spring" }}
                className="glass-panel-darker rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden group hover:border-[var(--color-accent-primary)] transition-colors"
              >
                <div className="absolute inset-0 bg-[var(--color-accent-primary)] opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <span className="text-2xl md:text-4xl font-bold font-sans text-[var(--color-text-main)] drop-shadow-md">
                  {unit.value}
                </span>
                <span className="text-xs md:text-sm uppercase tracking-widest text-[var(--color-accent-primary)] mt-1 font-medium">
                  {unit.label}
                </span>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-6 flex items-center justify-center gap-4">
             <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-border-glass)] to-transparent flex-1"></div>
             <span className="text-xs uppercase tracking-widest text-[var(--color-text-muted)]">Time Together</span>
             <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-border-glass)] to-transparent flex-1"></div>
          </div>
          
          {/* Navigation Buttons Row */}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
             {[
               { label: 'Our Story', path: '/story' }, 
               { label: 'Our Memories', path: '/gallery' }, 
               { label: 'Letters', path: '/letters' }, 
               { label: 'Gallery', path: '/gallery' }, 
               { label: 'Forever', path: '/' }, 
               { label: 'Music', path: '/' }
             ].map((btn, i) => (
                <motion.button
                   key={btn.label + i}
                   onClick={() => window.location.href = btn.path}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 1.5 + (i * 0.1) }}
                   className="px-6 py-3 rounded-full glass-panel hover:bg-[var(--color-bg-glass)] border border-[var(--color-border-glass)] hover:border-[var(--color-accent-primary)] text-sm uppercase tracking-wider transition-all hover:scale-105 active:scale-95 z-50 relative"
                >
                   {btn.label}
                </motion.button>
             ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
