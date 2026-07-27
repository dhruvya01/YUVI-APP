import { motion } from 'framer-motion';
import type { Panda } from '../../types';

interface PandaCharacterProps {
  panda: Panda;
  onPet: () => void;
  reverse?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PandaCharacter({ panda, onPet, reverse, size = 'md' }: PandaCharacterProps) {
  const getIdleAnimation = () => {
    switch (panda.currentMood) {
      case 'Sleepy':
        return { y: [0, 2, 0], scaleY: [1, 0.97, 1], transition: { repeat: Infinity, duration: 3 } };
      case 'Excited':
      case 'Playful':
        return { y: [0, -12, 0], rotate: [0, -4, 4, 0], transition: { repeat: Infinity, duration: 0.6 } };
      case 'Happy':
      case 'Love':
        return { y: [0, -6, 0], transition: { repeat: Infinity, duration: 1.8 } };
      default:
        return { y: [0, -3, 0], transition: { repeat: Infinity, duration: 3.5 } };
    }
  };

  const isMomo = panda.id === 'momo';
  // One big (lg = w-32 h-32), one small (sm = w-20 h-20)
  const sizeClasses = size === 'sm' ? 'w-20 h-20' : size === 'lg' ? 'w-32 h-32' : 'w-24 h-24';

  const costumeIcons: Record<string, string> = {
    Royal: '👑', Crown: '👑',
    Shades: '🕶️', Glasses: '🕶️',
    Wizard: '🧙‍♂️',
    Ninja: '🥷',
    Chef: '👨‍🍳',
    Superhero: '🦸',
  };

  const costumeIcon = panda.costume ? (costumeIcons[panda.costume] || '🎩') : null;

  return (
    <div className="relative cursor-pointer group flex flex-col items-center select-none" onClick={onPet}>
      <motion.div animate={getIdleAnimation()} className="relative z-10 flex flex-col items-center">
        
        {/* Name Tag & Level */}
        <div className="absolute -top-7 bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[9px] font-extrabold text-white opacity-90 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 shadow-md flex items-center gap-1 z-20">
          <span>{panda.name}</span>
          <span className="text-[8px] text-amber-300">Lvl {panda.stats.level}</span>
        </div>

        {/* Costume Hat */}
        {costumeIcon && (
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            className="absolute -top-5 z-30 text-2xl filter drop-shadow-md"
          >
            {costumeIcon}
          </motion.div>
        )}

        {/* Panda Dude Image (User Uploaded Artwork) */}
        <div className={`relative flex items-center justify-center rounded-3xl overflow-hidden shadow-xl border-2 ${isMomo ? 'border-pink-300/60 bg-pink-100/40' : 'border-sky-300/60 bg-sky-100/40'} ${reverse ? 'scale-x-[-1]' : ''} ${sizeClasses}`}>
          <img 
            src="/assets/panda_dude.png" 
            alt={panda.name} 
            className="w-full h-full object-cover rounded-2xl" 
          />

          {/* Momo Pink Bow Accent */}
          {isMomo && (
            <div className="absolute top-1 right-1 text-sm filter drop-shadow z-20">
              🎀
            </div>
          )}
        </div>

        {/* Mood Bubble Indicator */}
        {panda.currentMood === 'Hungry' && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-3 -right-2 bg-white border border-rose-200 shadow-md rounded-full p-1 text-xs z-30">
            🍎
          </motion.div>
        )}
        {panda.currentMood === 'Sleepy' && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-3 -right-2 bg-blue-100 border border-blue-200 shadow-md rounded-full p-1 text-xs z-30">
            💤
          </motion.div>
        )}
        {panda.currentMood === 'Love' && (
          <motion.div initial={{ scale: 0, y: 0 }} animate={{ scale: 1.4, y: -20, opacity: 0 }} transition={{ duration: 1.2 }} className="absolute -top-4 text-red-500 text-sm z-30">
            ❤️
          </motion.div>
        )}
      </motion.div>

      {/* Shadow */}
      <motion.div 
        animate={{ scale: panda.currentMood === 'Excited' ? [1, 0.75, 1] : [1, 0.92, 1] }} 
        transition={{ repeat: Infinity, duration: panda.currentMood === 'Excited' ? 0.6 : 2 }}
        className={`bg-black/20 rounded-[100%] mx-auto mt-1 blur-[2px] ${size === 'sm' ? 'w-12 h-1.5' : 'w-20 h-2.5'}`}
      />
    </div>
  );
}
