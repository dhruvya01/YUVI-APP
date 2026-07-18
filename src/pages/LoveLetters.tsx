import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loveLetters } from '../data/mockData';
import { Mail, Lock, Heart, X, PenTool } from 'lucide-react';

export default function LoveLetters() {
  const [openedLetterId, setOpenedLetterId] = useState<number | null>(null);
  const [isReading, setIsReading] = useState(false);

  const handleOpenEnvelope = (letter: any) => {
    if (letter.locked) return;
    setOpenedLetterId(letter.id);
    
    // Simulate envelope opening animation delay before showing letter text
    setTimeout(() => {
      setIsReading(true);
    }, 1500);
  };

  const closeLetter = () => {
    setIsReading(false);
    setTimeout(() => {
      setOpenedLetterId(null);
    }, 500);
  };

  return (
    <div className="min-h-screen pt-12 pb-32 px-4 max-w-5xl mx-auto relative z-10">
      <div className="flex items-center justify-between mb-12 glass-panel p-4 rounded-2xl">
        <h1 className="text-3xl font-serif font-bold text-[var(--color-text-main)]">Love Letters</h1>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-bg-glass)] border border-[var(--color-border-glass)] hover:bg-[var(--color-border-glass)] transition-colors text-[var(--color-text-main)]">
          <PenTool className="w-5 h-5" />
          <span className="font-medium text-sm">Write Letter</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loveLetters.map((letter, i) => (
          <motion.div
            key={letter.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            onClick={() => handleOpenEnvelope(letter)}
            className={`relative group cursor-pointer perspective-1000 ${letter.locked ? 'opacity-80' : ''}`}
          >
            {/* The Envelope */}
            <div className={`w-full h-48 md:h-56 rounded-lg relative transition-all duration-500 transform-style-3d group-hover:scale-105 shadow-xl ${
              letter.locked ? 'bg-gray-200 dark:bg-gray-800' : 'bg-[#fdfbf7] dark:bg-[#2a242c]'
            }`}>
              
              {/* Envelope Flap (Top) */}
              <div className="absolute top-0 inset-x-0 h-1/2 origin-top transition-transform duration-700 z-20">
                <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full drop-shadow-md">
                  <polygon points="0,0 100,0 50,50" fill={letter.locked ? 'currentColor' : '#f4eee0'} className={letter.locked ? 'text-gray-300 dark:text-gray-700' : ''} />
                </svg>
                {/* Wax Seal */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-10 h-10 rounded-full bg-red-700 shadow-lg flex items-center justify-center border-2 border-red-900 z-30">
                  {letter.locked ? <Lock className="w-4 h-4 text-white/80" /> : <Heart className="w-5 h-5 text-white/80" fill="currentColor" />}
                </div>
              </div>
              
              {/* Envelope Body */}
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center z-10 pt-12">
                 <div>
                   <h3 className={`font-serif text-lg font-bold mb-2 ${letter.locked ? 'text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>
                     {letter.title}
                   </h3>
                   {letter.locked && (
                     <p className="text-xs text-red-500 font-bold uppercase tracking-widest mt-2 flex items-center justify-center gap-1">
                       <Lock className="w-3 h-3" /> Unlocks {letter.unlockDate}
                     </p>
                   )}
                 </div>
              </div>
              
              {/* Envelope Bottom Flap */}
              <div className="absolute bottom-0 inset-x-0 h-full pointer-events-none overflow-hidden rounded-b-lg">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute bottom-0 w-full h-full opacity-50">
                  <polygon points="0,100 50,50 100,100" fill="currentColor" className={letter.locked ? 'text-gray-400 dark:text-gray-600' : 'text-[#e9e3d3] dark:text-[#3d3440]'} />
                </svg>
              </div>

            </div>
          </motion.div>
        ))}
      </div>

      {/* Reading Modal */}
      <AnimatePresence>
        {openedLetterId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             {/* Backdrop */}
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/80 backdrop-blur-md"
               onClick={closeLetter}
             />
             
             {/* Letter Paper */}
             {isReading && (
               <motion.div
                 initial={{ opacity: 0, y: 100, scale: 0.8, rotateX: -20 }}
                 animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                 exit={{ opacity: 0, y: 50, scale: 0.9 }}
                 transition={{ type: "spring", damping: 20 }}
                 className="relative w-full max-w-2xl bg-[#fffcf5] text-gray-800 p-8 md:p-12 shadow-2xl rounded-sm"
                 style={{
                   backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #e5e5e5 31px, #e5e5e5 32px)',
                   backgroundAttachment: 'local',
                   lineHeight: '32px'
                 }}
               >
                 <button onClick={closeLetter} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-800 transition-colors">
                   <X className="w-6 h-6" />
                 </button>
                 
                 {loveLetters.map(letter => letter.id === openedLetterId && (
                   <div key={letter.id} className="mt-8">
                     <p className="font-serif italic text-right mb-8 text-gray-500">{new Date(letter.date).toLocaleDateString()}</p>
                     <motion.div 
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       transition={{ duration: 2 }}
                       className="font-serif text-lg md:text-xl whitespace-pre-wrap"
                     >
                       {/* Simulate typing effect by animating characters or just fading in slowly */}
                       {letter.content}
                     </motion.div>
                     
                     <div className="mt-12 text-right">
                       <p className="font-serif text-xl text-rose-500 italic">Yours always,</p>
                       <p className="font-serif text-2xl font-bold mt-2">Yuvi</p>
                     </div>
                   </div>
                 ))}
               </motion.div>
             )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
