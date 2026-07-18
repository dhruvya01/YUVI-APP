import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

export function SortableWidget({ id, children, className = '' }: { id: string; children: React.ReactNode; className?: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative glass-panel rounded-2xl border border-[var(--color-border-glass)] overflow-hidden flex flex-col ${
        isDragging ? 'opacity-50 shadow-2xl scale-105' : 'shadow-lg hover:border-[var(--color-accent-primary)] transition-colors'
      } ${className}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="w-full h-6 absolute top-0 inset-x-0 cursor-grab active:cursor-grabbing flex items-center justify-center bg-black/5 hover:bg-black/10 transition-colors z-20 group"
      >
        <GripHorizontal className="w-4 h-4 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="flex-1 p-6 mt-4 relative z-10 flex flex-col">
        {children}
      </div>
    </motion.div>
  );
}
