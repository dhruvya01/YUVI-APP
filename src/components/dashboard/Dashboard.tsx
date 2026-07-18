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
import { Quote, CloudSun, Clock, CalendarHeart } from 'lucide-react';

const WIDGET_TYPES = [
  { id: 'counter', defaultSpan: 'col-span-2 row-span-1' },
  { id: 'clock', defaultSpan: 'col-span-1 row-span-1' },
  { id: 'quote', defaultSpan: 'col-span-1 row-span-1' },
  { id: 'weather', defaultSpan: 'col-span-1 row-span-1' },
  { id: 'memory', defaultSpan: 'col-span-2 row-span-2' },
];

export default function Dashboard() {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('dashboard-layout');
    return saved ? JSON.parse(saved) : WIDGET_TYPES.map(w => w.id);
  });

  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((items: string[]) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem('dashboard-layout', JSON.stringify(newOrder));
        return newOrder;
      });
    }
  };

  const renderWidgetContent = (id: string) => {
    switch (id) {
      case 'counter':
        return (
          <div className="flex flex-col h-full justify-center text-center">
            <h3 className="text-sm font-semibold tracking-widest text-[var(--color-text-muted)] uppercase mb-2">Together Since</h3>
            <div className="text-3xl md:text-5xl font-serif font-bold text-[var(--color-accent-primary)]">2 Dec 2025</div>
          </div>
        );
      case 'clock':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <Clock className="w-6 h-6 text-[var(--color-accent-primary)] mb-2" />
            <div className="text-3xl font-light tabular-nums">{format(time, 'HH:mm')}</div>
            <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">{format(time, 'EEEE')}</div>
          </div>
        );
      case 'quote':
        return (
          <div className="flex flex-col h-full justify-center">
            <Quote className="w-5 h-5 text-[var(--color-text-muted)] mb-2 opacity-50" />
            <p className="font-serif text-lg italic text-[var(--color-text-main)]">
              "In all the world, there is no heart for me like yours."
            </p>
          </div>
        );
      case 'weather':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <CloudSun className="w-8 h-8 text-yellow-400 mb-2" />
            <div className="text-2xl font-bold">24°C</div>
            <div className="text-sm text-[var(--color-text-muted)]">Partly Cloudy</div>
          </div>
        );
      case 'memory':
        return (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4 text-[var(--color-text-muted)] text-sm uppercase tracking-wider">
              <CalendarHeart className="w-4 h-4" /> Memory of the day
            </div>
            <div className="flex-1 rounded-xl overflow-hidden relative group">
              <img src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=800" alt="Memory" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <span className="text-white font-serif text-xl">That perfect sunset</span>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[160px]">
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
