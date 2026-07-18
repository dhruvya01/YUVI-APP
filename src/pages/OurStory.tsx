import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { storyTimeline } from '../data/mockData';
import { Play, Pause, X, Calendar, ChevronRight } from 'lucide-react';

export default function OurStory() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playIndex, setPlayIndex] = useState(0);

  // Slideshow effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      setSelectedId(storyTimeline[playIndex].id);
      timer = setTimeout(() => {
        setPlayIndex((prev) => (prev + 1) % storyTimeline.length);
      }, 4000); // 4 seconds per slide
    }
    return () => clearTimeout(timer);
  }, [isPlaying, playIndex]);

  const togglePlay = () => {
    if (!isPlaying) {
      setPlayIndex(0);
      setSelectedId(storyTimeline[0].id);
    } else {
      setSelectedId(null);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen pt-12 pb-32 px-4 max-w-4xl mx-auto relative z-10">
      <div className="flex items-center justify-between mb-12 glass-panel p-4 rounded-2xl">
        <h1 className="text-3xl font-serif font-bold text-[var(--color-text-main)]">Our Story</h1>
        <button 
          onClick={togglePlay}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-accent-primary)] text-white hover:bg-[var(--color-accent-secondary)] transition-colors shadow-lg"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          <span className="font-medium tracking-wide uppercase text-sm">
            {isPlaying ? 'Stop' : 'Play Story'}
          </span>
        </button>
      </div>

      <div className="relative">
        {/* Timeline center line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-[var(--color-border-glass)] transform md:-translate-x-1/2"></div>

        {storyTimeline.map((item, index) => {
          const isEven = index % 2 === 0;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`relative mb-12 w-full flex flex-col md:flex-row items-center ${isEven ? 'md:justify-start' : 'md:justify-end'}`}
            >
              {/* Timeline Dot */}
              <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-[var(--color-accent-primary)] border-4 border-[var(--color-bg-base)] shadow-[0_0_10px_var(--color-glow)] transform -translate-x-1/2 z-10 mt-4 md:mt-0"></div>

              {/* Content Card */}
              <div className={`w-full md:w-5/12 pl-12 md:pl-0 ${isEven ? 'md:pr-12 text-left md:text-right' : 'md:pl-12 text-left'}`}>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedId(item.id)}
                  className="glass-panel p-4 rounded-2xl cursor-pointer group overflow-hidden border border-[var(--color-border-glass)] hover:border-[var(--color-accent-primary)] transition-colors"
                >
                  <div className="relative h-48 w-full rounded-xl overflow-hidden mb-4">
                     <img src={item.image} alt={item.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                        <div className="flex items-center gap-2 text-white/90">
                           <Calendar className="w-4 h-4" />
                           <span className="text-sm font-medium">{new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric'})}</span>
                        </div>
                     </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-[var(--color-text-main)] group-hover:text-[var(--color-accent-primary)] transition-colors">{item.title}</h3>
                  <p className="text-[var(--color-text-muted)] text-sm line-clamp-2">{item.description}</p>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox / Expandable Memory */}
      <AnimatePresence>
        {selectedId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => !isPlaying && setSelectedId(null)}
          >
            {storyTimeline.map(item => item.id === selectedId && (
              <motion.div
                key={item.id}
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-[var(--color-bg-base)] w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative h-64 md:h-96 w-full">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  {!isPlaying && (
                    <button 
                      onClick={() => setSelectedId(null)}
                      className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  )}
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-2 text-[var(--color-accent-primary)] mb-2">
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium tracking-wide uppercase">{new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric'})}</span>
                  </div>
                  <h2 className="text-3xl font-serif font-bold mb-4 text-[var(--color-text-main)]">{item.title}</h2>
                  <p className="text-lg leading-relaxed text-[var(--color-text-muted)]">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
