import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Heart, Trash2, X, Image as ImageIcon, Calendar, Sparkles } from 'lucide-react';
import { memoryRepo } from '../repositories/MemoryRepository';
import type { Memory } from '../types';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Gallery() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const items = await memoryRepo.findAll();
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setMemories(items);
    } catch (e) { console.error('Failed to load memories:', e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMemories(); }, []);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Please select an image under 5MB.'); return; }
    const reader = new FileReader();
    reader.onloadend = () => { if (typeof reader.result === 'string') setBase64Image(reader.result); };
    reader.readAsDataURL(file);
  };

  const handleAddMemory = async () => {
    if (!title.trim()) { alert('Please enter a title!'); return; }
    try {
      setIsSubmitting(true);
      await memoryRepo.create({
        title: title.trim(), date: date || new Date().toISOString(),
        description: description.trim(), photos: base64Image ? [base64Image] : [],
        tags: ['love', 'memory'], favorite: false, comments: []
      });
      setTitle(''); setDescription(''); setBase64Image(null); setShowAddModal(false);
      await fetchMemories();
    } catch (e) { console.error('Error:', e); alert('Failed to save!'); }
    finally { setIsSubmitting(false); }
  };

  const handleToggleFavorite = async (memory: Memory, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await memoryRepo.update(memory.id, { favorite: !memory.favorite });
      setMemories(prev => prev.map(m => m.id === memory.id ? updated : m));
    } catch (err) { console.error('Failed:', err); }
  };

  const handleDeleteMemory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this memory?')) return;
    try {
      await memoryRepo.delete(id);
      setMemories(prev => prev.filter(m => m.id !== id));
      if (selectedMemory?.id === id) setSelectedMemory(null);
    } catch (err) { console.error('Failed:', err); }
  };

  const formatDate = (dateStr: string) => {
    try { return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch { return dateStr; }
  };

  return (
    <div className="pt-3 pb-28 px-4 max-w-md mx-auto relative z-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-5"
      >
        <div>
          <h1 className="text-xl font-serif font-bold text-[var(--color-text-main)] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--color-accent-primary)]" /> Our Memories
          </h1>
          <p className="text-[10px] text-[var(--color-text-muted)] font-medium mt-0.5">Cherished moments, forever</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowAddModal(true)}
          className="w-10 h-10 bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] text-white rounded-xl flex items-center justify-center shadow-lg"
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <div className="w-5 h-5 border-2 border-[var(--color-accent-primary)] border-t-transparent rounded-full animate-spin" />
            Loading memories...
          </div>
        </div>
      ) : memories.length === 0 ? (
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-panel p-8 rounded-3xl text-center border border-[var(--color-border-glass)] space-y-4 mt-8">
          <div className="w-16 h-16 bg-[var(--color-accent-primary)]/10 rounded-2xl flex items-center justify-center mx-auto text-3xl">📸</div>
          <h3 className="text-base font-bold text-[var(--color-text-main)]">No Memories Yet</h3>
          <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">Start capturing your beautiful moments together!</p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2 bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] text-white rounded-xl text-xs font-bold shadow-lg inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add First Memory
          </motion.button>
        </motion.div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {memories.map((mem) => {
            const hasPhoto = mem.photos && mem.photos.length > 0 && mem.photos[0];
            return (
              <motion.div
                key={mem.id}
                variants={item}
                className="glass-panel rounded-2xl overflow-hidden border border-[var(--color-border-glass)] shadow-lg cursor-pointer card-hover group"
                onClick={() => setSelectedMemory(mem)}
              >
                {hasPhoto ? (
                  <div className="relative w-full h-48 overflow-hidden">
                    <img src={mem.photos[0]} alt={mem.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="font-serif font-bold text-sm text-white drop-shadow-md truncate">{mem.title}</h3>
                      <div className="flex items-center gap-1 text-[9px] text-white/80 mt-0.5">
                        <Calendar className="w-2.5 h-2.5" />
                        <span>{formatDate(mem.date)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="w-full h-20 bg-gradient-to-r from-[var(--color-accent-primary)]/10 to-[var(--color-accent-secondary)]/10 rounded-xl flex items-center justify-center mb-3">
                      <span className="text-2xl">💖</span>
                    </div>
                    <h3 className="font-serif font-bold text-sm text-[var(--color-text-main)] truncate">{mem.title}</h3>
                    <div className="flex items-center gap-1 text-[9px] text-[var(--color-text-muted)] mt-1">
                      <Calendar className="w-2.5 h-2.5" />
                      <span>{formatDate(mem.date)}</span>
                    </div>
                  </div>
                )}

                {/* Action buttons overlay */}
                <div className="flex items-center justify-between px-3 py-2 border-t border-[var(--color-border-glass)]">
                  {mem.description ? (
                    <p className="text-[9px] text-[var(--color-text-muted)] line-clamp-1 flex-1 mr-2">{mem.description}</p>
                  ) : (
                    <span className="text-[9px] text-[var(--color-text-muted)] italic">No note</span>
                  )}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => handleToggleFavorite(mem, e)}
                      className={`p-1.5 rounded-lg transition-colors ${mem.favorite ? 'text-rose-500 bg-rose-500/10' : 'text-[var(--color-text-muted)] hover:text-rose-500'}`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${mem.favorite ? 'fill-current' : ''}`} />
                    </button>
                    <button onClick={(e) => handleDeleteMemory(mem.id, e)} className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md" onClick={() => setShowAddModal(false)}>
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-sm p-5 rounded-t-3xl sm:rounded-3xl border border-[var(--color-border-glass)] shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
              style={{ background: 'var(--bg-base)', backdropFilter: 'blur(20px)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-glass)]">
                <h3 className="text-base font-bold font-serif text-[var(--color-text-main)]">New Memory ✨</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">Title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Our First Picnic 🧺"
                    className="w-full px-3 py-2.5 bg-black/5 border border-[var(--color-border-glass)] rounded-xl text-xs text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)]/50" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-black/5 border border-[var(--color-border-glass)] rounded-xl text-xs text-[var(--color-text-main)]" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">Photo</label>
                  <div className="border-2 border-dashed border-[var(--color-border-glass)] rounded-xl p-3 text-center cursor-pointer hover:border-[var(--color-accent-primary)] transition-colors relative">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    {base64Image ? (
                      <div className="space-y-1.5">
                        <img src={base64Image} alt="Preview" className="h-28 w-full object-cover rounded-lg" />
                        <p className="text-[9px] text-emerald-500 font-bold">✓ Ready</p>
                      </div>
                    ) : (
                      <div className="py-3 text-[var(--color-text-muted)] space-y-1">
                        <ImageIcon className="w-6 h-6 mx-auto text-[var(--color-accent-primary)] opacity-50" />
                        <p className="text-[10px] font-medium">Tap to upload</p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">Note</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="A sweet note..."
                    className="w-full px-3 py-2.5 bg-black/5 border border-[var(--color-border-glass)] rounded-xl text-xs text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)]/50 resize-none" />
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddMemory}
                disabled={isSubmitting || !title.trim()}
                className="w-full py-3 bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] text-white font-bold rounded-xl text-xs shadow-lg disabled:opacity-40"
              >
                {isSubmitting ? 'Saving...' : 'Save Memory ❤️'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedMemory && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl" onClick={() => setSelectedMemory(null)}>
            <button onClick={() => setSelectedMemory(null)} className="absolute top-4 right-4 p-2 text-white bg-white/10 hover:bg-white/20 rounded-xl z-50">
              <X className="w-5 h-5" />
            </button>
            <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }} className="max-w-md w-full rounded-3xl overflow-hidden p-4 border border-white/10 text-white space-y-3" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)' }} onClick={(e) => e.stopPropagation()}>
              {selectedMemory.photos?.[0] && (
                <img src={selectedMemory.photos[0]} alt={selectedMemory.title} className="w-full max-h-[55vh] object-contain rounded-2xl shadow-2xl" />
              )}
              <div className="space-y-1.5">
                <h3 className="text-base font-serif font-bold">{selectedMemory.title}</h3>
                <p className="text-[10px] text-white/50">{formatDate(selectedMemory.date)}</p>
                {selectedMemory.description && (
                  <p className="text-xs text-white/80 leading-relaxed pt-2 border-t border-white/10">{selectedMemory.description}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
