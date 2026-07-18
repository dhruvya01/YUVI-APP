import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { galleryPhotos } from '../data/mockData';
import { Heart, Maximize2, X, Filter } from 'lucide-react';

export default function Gallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);
  const [filterYear, setFilterYear] = useState<number | 'all'>('all');
  
  const years = ['all', ...Array.from(new Set(galleryPhotos.map(p => p.year)))];
  
  const filteredPhotos = filterYear === 'all' 
    ? galleryPhotos 
    : galleryPhotos.filter(p => p.year === filterYear);

  return (
    <div className="min-h-screen pt-12 pb-32 px-4 max-w-6xl mx-auto relative z-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 glass-panel p-4 rounded-2xl">
        <h1 className="text-3xl font-serif font-bold text-[var(--color-text-main)]">Our Memories</h1>
        
        <div className="flex items-center gap-4 overflow-x-auto pb-2 md:pb-0">
          <Filter className="w-5 h-5 text-[var(--color-text-muted)]" />
          {years.map(year => (
            <button
              key={year}
              onClick={() => setFilterYear(year as any)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                filterYear === year 
                  ? 'bg-[var(--color-accent-primary)] text-white' 
                  : 'bg-[var(--color-bg-glass)] text-[var(--color-text-muted)] hover:bg-[var(--color-border-glass)]'
              }`}
            >
              {year === 'all' ? 'All Time' : year}
            </button>
          ))}
        </div>
      </div>

      {/* Masonry Grid (simulated with CSS columns) */}
      <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
        {filteredPhotos.map((photo, i) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="break-inside-avoid"
          >
            <div 
              className="relative rounded-2xl overflow-hidden group cursor-pointer border border-[var(--color-border-glass)] hover:border-[var(--color-accent-primary)] transition-all shadow-md"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img src={photo.url} alt={photo.caption} className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <p className="text-white font-medium truncate">{photo.caption}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-white/80 text-xs">{photo.month}/{photo.year}</span>
                  <div className="flex gap-2">
                    <button className="p-1.5 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-sm transition-colors text-white" onClick={(e) => e.stopPropagation()}>
                      <Heart className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-sm transition-colors text-white">
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Fullscreen Viewer */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-black/95 backdrop-blur-lg"
            onClick={() => setSelectedPhoto(null)}
          >
            <button 
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-colors z-50"
            >
              <X className="w-6 h-6" />
            </button>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative max-w-5xl max-h-full flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedPhoto.url} 
                alt={selectedPhoto.caption} 
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" 
              />
              <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent transform translate-y-full hover:translate-y-0 transition-transform">
                <p className="text-white text-xl text-center">{selectedPhoto.caption}</p>
                <div className="flex justify-center mt-4 gap-4">
                   {['❤️', '🥹', '😂', '😍'].map(emoji => (
                     <button key={emoji} className="text-2xl hover:scale-125 transition-transform">{emoji}</button>
                   ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
