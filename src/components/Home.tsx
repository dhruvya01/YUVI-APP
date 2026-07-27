import { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import Dashboard from './dashboard/Dashboard';

export default function Home() {
  const [now, setNow] = useState(new Date());
  const startDate = new Date('2025-12-02T00:00:00');

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const diffMs = Math.max(0, now.getTime() - startDate.getTime());
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / 1000 / 60) % 60);
  const seconds = Math.floor((diffMs / 1000) % 60);

  return (
    <div className="min-h-screen pt-3 pb-28 px-4 max-w-md mx-auto relative z-10">
      {/* Compact Floating Header */}
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-5 flex items-center justify-between px-1"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex items-center justify-center shadow-lg animate-pulse-glow">
            <span className="text-sm">💕</span>
          </div>
          <span className="font-serif text-lg font-bold text-gradient">
            Forever Us
          </span>
        </div>

        {/* Living Counter */}
        <div className="glass-panel rounded-xl px-3 py-1.5 flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[
              { val: days, label: 'd' },
              { val: hours, label: 'h' },
              { val: minutes, label: 'm' },
              { val: seconds, label: 's' },
            ].map((unit) => (
              <div key={unit.label} className="flex items-baseline">
                <motion.span
                  key={`${unit.label}-${unit.val}`}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-xs font-bold text-[var(--color-text-main)] tabular-nums"
                >
                  {unit.val}
                </motion.span>
                <span className="text-[8px] text-[var(--color-text-muted)] font-medium">{unit.label}</span>
              </div>
            ))}
          </div>
          <span className="text-[8px] text-[var(--color-accent-primary)] font-bold">❤️</span>
        </div>
      </motion.header>

      {/* Dashboard */}
      <Dashboard />
    </div>
  );
}
