import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableWidget } from './SortableWidget';
import { format } from 'date-fns';
import { Quote, CloudSun, Clock, CalendarHeart, MessageCircle, HeartHandshake, Gamepad2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { memoryRepo } from '../../repositories/MemoryRepository';
import { profileRepo } from '../../repositories/ProfileRepository';
import type { Memory, Profile } from '../../types';

const WIDGET_TYPES = [
  { id: 'counter', defaultSpan: 'col-span-2 row-span-1' },
  { id: 'shortcuts', defaultSpan: 'col-span-2 row-span-1' },
  { id: 'clock', defaultSpan: 'col-span-1 row-span-1' },
  { id: 'quote', defaultSpan: 'col-span-1 row-span-1' },
  { id: 'weather', defaultSpan: 'col-span-1 row-span-1' },
  { id: 'memory', defaultSpan: 'col-span-2 row-span-2' },
];

const LOVE_QUOTES = [
  "In all the world, there is no heart for me like yours.",
  "You are my today and all of my tomorrows.",
  "I loved you yesterday, I love you still, I always have, I always will.",
  "Home is wherever I am with you.",
  "Every love story is beautiful, but ours is my favorite."
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('dashboard-layout');
    return saved ? JSON.parse(saved) : WIDGET_TYPES.map(w => w.id);
  });

  const [time, setTime] = useState(new Date());
  const [latestMemory, setLatestMemory] = useState<Memory | null>(null);
  const [yuvi, setYuvi] = useState<Profile | null>(null);
  const [manvi, setManvi] = useState<Profile | null>(null);
  const [quoteIndex, setQuoteIndex] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const mems = await memoryRepo.findAll();
        if (mems.length > 0) {
          mems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setLatestMemory(mems[0]);
        }
        const y = await profileRepo.getYuvi();
        const m = await profileRepo.getManvi();
        setYuvi(y);
        setManvi(m);
      } catch (e) {
        console.error('Failed to load dashboard data:', e);
      }
    }
    loadData();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((itemsList: string[]) => {
        const oldIndex = itemsList.indexOf(active.id as string);
        const newIndex = itemsList.indexOf(over.id as string);
        const newOrder = arrayMove(itemsList, oldIndex, newIndex);
        localStorage.setItem('dashboard-layout', JSON.stringify(newOrder));
        return newOrder;
      });
    }
  };

  const nextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % LOVE_QUOTES.length);
  };

  const renderWidgetContent = (id: string) => {
    switch (id) {
      case 'counter':
        return (
          <div className="flex flex-col h-full justify-center text-center p-2">
            <h3 className="text-xs font-semibold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
              Together Forever
            </h3>
            <div className="text-2xl font-serif font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)]">
              2 Dec 2025
            </div>
            {/* Quick Couple Avatars */}
            <div className="flex items-center justify-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 rounded-full border border-blue-500 overflow-hidden bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold">
                  {yuvi?.photo ? <img src={yuvi.photo} alt="Yuvi" className="w-full h-full object-cover" /> : 'Y'}
                </div>
                <span className="text-[10px] font-bold text-[var(--color-text-main)]">Yuvi</span>
              </div>
              <span className="text-xs text-rose-500 font-bold">❤️</span>
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 rounded-full border border-pink-500 overflow-hidden bg-pink-600 flex items-center justify-center text-[10px] text-white font-bold">
                  {manvi?.photo ? <img src={manvi.photo} alt="Manvi" className="w-full h-full object-cover" /> : 'M'}
                </div>
                <span className="text-[10px] font-bold text-[var(--color-text-main)]">Manvi</span>
              </div>
            </div>
          </div>
        );

      case 'shortcuts':
        return (
          <div className="flex items-center justify-around h-full px-2">
            <button 
              onClick={() => navigate('/chat')}
              className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-white transition-all group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span>Snap Chat</span>
            </button>
            <button 
              onClick={() => navigate('/panda-house')}
              className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-white transition-all group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <HeartHandshake className="w-5 h-5 text-white" />
              </div>
              <span>Pets</span>
            </button>
            <button 
              onClick={() => navigate('/gallery')}
              className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-white transition-all group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              <span>Memories</span>
            </button>
            <button 
              onClick={() => navigate('/arcade')}
              className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-white transition-all group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <span>Arcade</span>
            </button>
          </div>
        );

      case 'clock':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <Clock className="w-5 h-5 text-[var(--color-accent-primary)] mb-1" />
            <div className="text-2xl font-bold tabular-nums text-[var(--color-text-main)]">{format(time, 'HH:mm')}</div>
            <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">{format(time, 'EEEE')}</div>
          </div>
        );

      case 'quote':
        return (
          <div className="flex flex-col h-full justify-between p-1 cursor-pointer" onClick={nextQuote}>
            <div className="flex items-center justify-between">
              <Quote className="w-4 h-4 text-[var(--color-accent-primary)] opacity-70" />
              <Sparkles className="w-3 h-3 text-amber-400" />
            </div>
            <p className="font-serif text-xs italic text-[var(--color-text-main)] leading-tight my-1">
              "{LOVE_QUOTES[quoteIndex]}"
            </p>
            <span className="text-[9px] text-[var(--color-text-muted)] text-right font-medium">Tap for next ✨</span>
          </div>
        );

      case 'weather':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <CloudSun className="w-7 h-7 text-amber-400 mb-1" />
            <div className="text-xl font-bold text-[var(--color-text-main)]">24°C</div>
            <div className="text-[10px] text-[var(--color-text-muted)] font-medium">Warm & Sunny ☀️</div>
          </div>
        );

      case 'memory':
        return (
          <div className="flex flex-col h-full cursor-pointer" onClick={() => navigate('/gallery')}>
            <div className="flex items-center justify-between mb-2 text-[var(--color-text-muted)] text-xs font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><CalendarHeart className="w-4 h-4 text-rose-500" /> Featured Memory</span>
              <span className="text-[10px] text-[var(--color-accent-primary)]">View All →</span>
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden relative group border border-[var(--color-border-glass)]">
              {latestMemory?.photos?.[0] ? (
                <img 
                  src={latestMemory.photos[0]} 
                  alt={latestMemory.title} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-rose-500/20 via-purple-500/20 to-indigo-500/20 flex flex-col items-center justify-center p-4 text-center">
                  <span className="text-3xl mb-1">📸</span>
                  <span className="text-xs font-bold text-[var(--color-text-main)]">Add Your First Photo Memory</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
                <span className="text-white font-serif text-sm font-bold truncate">
                  {latestMemory?.title || 'Our Sweet Moments'}
                </span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getWidgetClass = (id: string) => {
    const config = WIDGET_TYPES.find(w => w.id === id);
    return config ? config.defaultSpan : 'col-span-1 row-span-1';
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[140px]">
          {items.map((id: string) => (
            <SortableWidget key={id} id={id} className={getWidgetClass(id)}>
              {renderWidgetContent(id)}
            </SortableWidget>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
