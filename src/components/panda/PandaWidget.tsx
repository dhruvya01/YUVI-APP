import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Apple, ShoppingBag, Home, Minus } from 'lucide-react';
import { usePandaState } from '../../hooks/usePandaState';
import { PandaCharacter } from './PandaCharacter';

export function PandaWidget() {
  const navigate = useNavigate();
  const { mochi, momo, loading, feed, play, pet } = usePandaState();
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 350, y: window.innerHeight - 200 });

  // Load saved position
  useEffect(() => {
    const saved = localStorage.getItem('panda_widget_state');
    if (saved) {
      try {
        const { isMinimized: min, position: pos } = JSON.parse(saved);
        setIsMinimized(min);
        if (pos) setPosition(pos);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Save state on change
  useEffect(() => {
    localStorage.setItem('panda_widget_state', JSON.stringify({ isMinimized, position }));
  }, [isMinimized, position]);

  if (loading || !mochi || !momo) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragEnd={(_, info) => setPosition({ x: position.x + info.offset.x, y: position.y + info.offset.y })}
      initial={position}
      animate={position}
      className={`fixed z-50 glass-panel shadow-2xl border border-[var(--color-border-glass)] overflow-hidden transition-all duration-300 ${isMinimized ? 'w-16 h-16 rounded-full' : 'w-[330px] rounded-3xl'}`}
      style={{ touchAction: 'none' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      
      {isMinimized ? (
        <button 
          onClick={() => setIsMinimized(false)}
          className="w-full h-full flex items-center justify-center relative group"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform">🐼</span>
          {mochi.currentMood === 'Hungry' && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping" />}
        </button>
      ) : (
        <div className="flex flex-col h-full relative">
          {/* Header Controls */}
          <div className="flex justify-between items-center p-3 border-b border-[var(--color-border-glass)] bg-black/5">
            <div className="flex gap-2">
              <button onClick={() => { play('mochi', 'ball'); play('momo', 'ball'); }} className="p-1.5 bg-black/5 hover:bg-black/10 rounded-full transition-colors text-[var(--color-text-main)]" title="Play">
                <Gamepad2 className="w-4 h-4" />
              </button>
              <button onClick={() => { feed('mochi', 'Bamboo'); feed('momo', 'Strawberry'); }} className="p-1.5 bg-black/5 hover:bg-black/10 rounded-full transition-colors text-red-500" title="Feed">
                <Apple className="w-4 h-4" />
              </button>
              <button onClick={() => navigate('/panda-house')} className="p-1.5 bg-black/5 hover:bg-black/10 rounded-full transition-colors text-yellow-600" title="Shop">
                <ShoppingBag className="w-4 h-4" />
              </button>
              <button onClick={() => navigate('/panda-house')} className="p-1.5 bg-black/5 hover:bg-black/10 rounded-full transition-colors text-blue-500" title="Panda House">
                <Home className="w-4 h-4" />
              </button>
            </div>
            <button onClick={() => setIsMinimized(true)} className="p-1.5 text-[var(--color-text-muted)] hover:text-black transition-colors">
              <Minus className="w-4 h-4" />
            </button>
          </div>

          {/* Pandas Area */}
          <div className="p-4 flex justify-around items-end h-[120px] bg-gradient-to-b from-transparent to-green-500/10 relative">
            {/* Background elements like bamboo could go here */}
            
            <PandaCharacter panda={mochi} onPet={() => pet('mochi')} />
            <PandaCharacter panda={momo} onPet={() => pet('momo')} reverse />
          </div>

          {/* Stats Bar */}
          <div className="px-4 pb-3 flex justify-between text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider">
            <div className="flex flex-col gap-1 w-1/2 pr-2 border-r border-[var(--color-border-glass)]">
              <div className="flex justify-between"><span>Health</span> <span className="text-green-500">{mochi.stats.health}%</span></div>
              <div className="w-full bg-black/10 h-1 rounded-full overflow-hidden"><div className="bg-green-500 h-full" style={{ width: `${mochi.stats.health}%` }} /></div>
            </div>
            <div className="flex flex-col gap-1 w-1/2 pl-2">
              <div className="flex justify-between"><span>Friendship</span> <span className="text-pink-500">{Math.floor((mochi.stats.friendship + momo.stats.friendship)/2)}%</span></div>
              <div className="w-full bg-black/10 h-1 rounded-full overflow-hidden"><div className="bg-pink-500 h-full" style={{ width: `${Math.floor((mochi.stats.friendship + momo.stats.friendship)/2)}%` }} /></div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
