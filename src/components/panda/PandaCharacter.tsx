import { motion } from 'framer-motion';
import type { Panda } from '../../types';

interface PandaCharacterProps {
  panda: Panda;
  onPet: () => void;
  reverse?: boolean; // Flip the image if needed
}

export function PandaCharacter({ panda, onPet, reverse }: PandaCharacterProps) {
  // Determine animation based on mood
  const getIdleAnimation = () => {
    switch (panda.currentMood) {
      case 'Sleepy':
        return { y: [0, 2, 0], scaleY: [1, 0.98, 1], transition: { repeat: Infinity, duration: 3 } };
      case 'Excited':
      case 'Playful':
        return { y: [0, -10, 0], transition: { repeat: Infinity, duration: 0.6 } };
      case 'Happy':
      case 'Love':
        return { y: [0, -5, 0], transition: { repeat: Infinity, duration: 2 } };
      default:
        return { y: [0, -2, 0], transition: { repeat: Infinity, duration: 4 } };
    }
  };

  return (
    <div className="relative cursor-pointer group" onClick={onPet}>
      <motion.div animate={getIdleAnimation()} className="relative z-10 flex flex-col items-center">
        {/* Name Tag */}
        <div className="absolute -top-6 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {panda.name} Lvl {panda.stats.level}
        </div>
        
        {/* Panda Image */}
        <div className={`
          flex items-center justify-center overflow-hidden
          ${reverse ? 'scale-x-[-1]' : ''} 
          ${panda.id === 'mochi' ? 'w-24 h-24' : 'w-16 h-16'}
        `}>
           <img 
              src={`/assets/panda_${panda.id}.png`} 
              alt={panda.name} 
              className="w-full h-full object-contain drop-shadow-xl" 
              style={{ mixBlendMode: 'multiply' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<span class="text-3xl">🐼</span>';
              }} 
           />
        </div>
        
        {/* Mood Bubble */}
        {panda.currentMood === 'Hungry' && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-4 -right-4 bg-white shadow rounded-full p-1 text-xs">
            🍎
          </motion.div>
        )}
        {panda.currentMood === 'Sleepy' && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-4 -right-4 bg-blue-100 shadow rounded-full p-1 text-xs">
            💤
          </motion.div>
        )}
        {panda.currentMood === 'Love' && (
          <motion.div initial={{ scale: 0, y: 0 }} animate={{ scale: 1.5, y: -20, opacity: 0 }} transition={{ duration: 1 }} className="absolute -top-2 text-red-500 text-lg">
            ❤️
          </motion.div>
        )}
      </motion.div>
      
      {/* Shadow */}
      <motion.div 
        animate={{ scale: panda.currentMood === 'Excited' ? [1, 0.8, 1] : [1, 0.95, 1] }} 
        transition={{ repeat: Infinity, duration: panda.currentMood === 'Excited' ? 0.6 : 2 }}
        className="w-16 h-2 bg-black/10 rounded-[100%] mx-auto mt-2 blur-[2px]"
      />
    </div>
  );
}
