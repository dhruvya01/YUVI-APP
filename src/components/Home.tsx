import { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import Dashboard from './dashboard/Dashboard';
import { Bell } from 'lucide-react';

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
    <div className="min-h-screen pt-12 pb-32 px-4 max-w-6xl mx-auto relative z-10">
      {/* Dynamic Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-4 z-40 mb-12 glass-panel rounded-full px-6 py-3 flex items-center justify-between shadow-lg backdrop-blur-xl border border-[var(--color-border-glass)]"
      >
        <div className="flex items-center gap-2">
           <span className="font-serif text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)]">
             Forever Us
           </span>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden md:flex gap-4 text-sm font-medium text-[var(--color-text-muted)]">
             <span>{days}d {hours}h {minutes}m {seconds}s</span>
           </div>
           <button className="relative p-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors">
             <Bell className="w-5 h-5 text-[var(--color-text-main)]" />
             <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
             <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
           </button>
        </div>
      </motion.header>

      {/* Main Dashboard Grid */}
      <Dashboard />
    </div>
  );
}
