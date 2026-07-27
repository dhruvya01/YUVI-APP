import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Heart, Trash2, X, Image as ImageIcon, Calendar, Sparkles } from 'lucide-react';
import { memoryRepo } from '../repositories/MemoryRepository';
import type { Memory } from '../types';

export default function Gallery() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Memory Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const items = await memoryRepo.findAll();
      // Sort newest first
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setMemories(items);
    } catch (e) {
      console.error('Failed to load memories:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  // Convert uploaded image file to Base64 string
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit file size to ~3MB to ensure fast Base64 storage
    if (file.size > 5 * 1024 * 1024) {
      alert('File size is too large. Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setBase64Image(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddMemory = async () => {
    if (!title.trim()) {
      alert('Please enter a title for your memory!');
      return;
    }

    try {
      setIsSubmitting(true);
      const newMemoryData = {
        title: title.trim(),
        date: date || new Date().toISOString(),
        description: description.trim(),
        photos: base64Image ? [base64Image] : [],
        tags: ['love', 'memory'],
        favorite: false,
        comments: []
      };

      await memoryRepo.create(newMemoryData);
      
      // Reset form and refresh list
      setTitle('');
      setDescription('');
      setBase64Image(null);
      setShowAddModal(false);
      await fetchMemories();
    } catch (e) {
      console.error('Error adding memory:', e);
      alert('Failed to save memory. Please try again!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleFavorite = async (memory: Memory, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await memoryRepo.update(memory.id, { favorite: !memory.favorite });
      setMemories(prev => prev.map(m => m.id === memory.id ? updated : m));
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleDeleteMemory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this memory?')) return;
    try {
      await memoryRepo.delete(id);
      setMemories(prev => prev.filter(m => m.id !== id));
      if (selectedMemory?.id === id) setSelectedMemory(null);
    } catch (err) {
      console.error('Failed to delete memory:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="pt-6 pb-28 px-4 max-w-md mx-auto relative z-10">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-6 glass-panel p-4 rounded-2xl border border-[var(--color-border-glass)] shadow-lg">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[var(--color-text-main)] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--color-accent-primary)]" /> Our Memories
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] font-medium">Save & cherish your moments forever</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="p-2.5 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] text-white rounded-full transition-all shadow-md flex items-center justify-center"
          title="Add New Memory"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Memories Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20 text-sm text-[var(--color-text-muted)] animate-pulse">
          Loading memories...
        </div>
      ) : memories.length === 0 ? (
        <div className="glass-panel p-8 rounded-3xl text-center border border-[var(--color-border-glass)] space-y-4 my-8">
          <div className="w-16 h-16 bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] rounded-full flex items-center justify-center mx-auto text-3xl">
            📸
          </div>
          <h3 className="text-lg font-bold text-[var(--color-text-main)]">No Memories Added Yet</h3>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            Click the "+" button above to add your first photo and memory together!
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-[var(--color-accent-primary)] text-white rounded-full text-xs font-bold shadow-md hover:scale-105 transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add First Memory
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {memories.map((mem) => {
            const hasPhoto = mem.photos && mem.photos.length > 0 && mem.photos[0];
            return (
              <motion.div
                key={mem.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-3xl overflow-hidden border border-[var(--color-border-glass)] shadow-xl cursor-pointer hover:border-[var(--color-accent-primary)]/50 transition-all group"
                onClick={() => setSelectedMemory(mem)}
              >
                {/* Photo Display (Base64) */}
                {hasPhoto ? (
                  <div className="relative w-full h-56 overflow-hidden bg-black/5">
                    <img 
                      src={mem.photos[0]} 
                      alt={mem.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                  </div>
                ) : (
                  <div className="w-full h-28 bg-gradient-to-r from-[var(--color-accent-primary)]/20 to-[var(--color-accent-secondary)]/20 flex items-center justify-center p-4 text-center">
                    <span className="text-2xl">💖</span>
                  </div>
                )}

                {/* Memory Info */}
                <div className="p-4 flex flex-col justify-between space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold font-serif text-base text-[var(--color-text-main)] leading-snug">
                      {mem.title}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => handleToggleFavorite(mem, e)}
                        className={`p-1.5 rounded-full transition-colors ${
                          mem.favorite ? 'text-rose-500 bg-rose-500/10' : 'text-[var(--color-text-muted)] hover:text-rose-500'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${mem.favorite ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteMemory(mem.id, e)}
                        className="p-1.5 rounded-full text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {mem.description && (
                    <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
                      {mem.description}
                    </p>
                  )}

                  <div className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)] font-medium pt-1 border-t border-[var(--color-border-glass)]">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(mem.date)}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Memory Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel w-full max-w-sm p-6 rounded-3xl border border-[var(--color-border-glass)] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border-glass)] pb-3">
                <h3 className="text-lg font-bold font-serif text-[var(--color-text-main)]">Add New Memory</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-full text-[var(--color-text-muted)] hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Our First Picnic 🧺"
                    className="w-full px-3 py-2 bg-[var(--color-bg-glass)] border border-[var(--color-border-glass)] rounded-xl text-xs text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-accent-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-bg-glass)] border border-[var(--color-border-glass)] rounded-xl text-xs text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-accent-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">Memory Photo</label>
                  <div className="border-2 border-dashed border-[var(--color-border-glass)] rounded-xl p-3 text-center cursor-pointer hover:border-[var(--color-accent-primary)] transition-colors relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    {base64Image ? (
                      <div className="space-y-2">
                        <img src={base64Image} alt="Preview" className="h-32 w-full object-cover rounded-lg mx-auto" />
                        <p className="text-[10px] text-emerald-500 font-bold">Image loaded in Base64 format ✓</p>
                      </div>
                    ) : (
                      <div className="py-2 text-[var(--color-text-muted)] space-y-1">
                        <ImageIcon className="w-6 h-6 mx-auto text-[var(--color-accent-primary)]" />
                        <p className="text-xs font-medium">Click or drag an image to upload</p>
                        <p className="text-[9px]">Saves directly as Base64</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">Description / Note</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Write a sweet note about this moment..."
                    className="w-full px-3 py-2 bg-[var(--color-bg-glass)] border border-[var(--color-border-glass)] rounded-xl text-xs text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-accent-primary)] resize-none"
                  />
                </div>
              </div>

              <button
                onClick={handleAddMemory}
                disabled={isSubmitting || !title.trim()}
                className="w-full py-2.5 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] text-white font-bold rounded-xl text-xs transition-all disabled:opacity-40 shadow-md"
              >
                {isSubmitting ? 'Saving Memory...' : 'Save Memory ❤️'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Photo Lightbox */}
      <AnimatePresence>
        {selectedMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
            onClick={() => setSelectedMemory(null)}
          >
            <button 
              onClick={() => setSelectedMemory(null)}
              className="absolute top-4 right-4 p-2 text-white bg-white/20 hover:bg-white/30 rounded-full transition-colors z-50"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full glass-panel rounded-3xl overflow-hidden p-4 border border-white/20 text-white space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedMemory.photos && selectedMemory.photos[0] && (
                <img 
                  src={selectedMemory.photos[0]} 
                  alt={selectedMemory.title} 
                  className="w-full max-h-[60vh] object-contain rounded-2xl shadow-2xl mx-auto" 
                />
              )}
              <div className="space-y-1">
                <h3 className="text-lg font-serif font-bold text-white">{selectedMemory.title}</h3>
                <p className="text-xs text-white/70">{formatDate(selectedMemory.date)}</p>
                {selectedMemory.description && (
                  <p className="text-xs text-white/90 leading-relaxed pt-2 border-t border-white/10">
                    {selectedMemory.description}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
