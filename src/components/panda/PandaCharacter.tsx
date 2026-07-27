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
        return { y: [0, -12, 0], rotate: [0, -3, 3, 0], transition: { repeat: Infinity, duration: 0.6 } };
      case 'Happy':
      case 'Love':
        return { y: [0, -6, 0], transition: { repeat: Infinity, duration: 1.8 } };
      default:
        return { y: [0, -3, 0], transition: { repeat: Infinity, duration: 3.5 } };
    }
  };

  const isMomo = panda.id === 'momo';
  const sizeClasses = size === 'sm' ? 'w-16 h-16' : size === 'lg' ? 'w-28 h-28' : 'w-22 h-22';

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
        <div className="absolute -top-7 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[9px] font-bold text-white opacity-90 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 shadow-md flex items-center gap-1 z-20">
          <span>{panda.name}</span>
          <span className="text-[8px] text-amber-300">Lvl {panda.stats.level}</span>
        </div>

        {/* Costume Hat */}
        {costumeIcon && (
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            className="absolute -top-5 z-30 text-xl filter drop-shadow-md"
          >
            {costumeIcon}
          </motion.div>
        )}

        {/* Adorable Animated Panda Graphic */}
        <div className={`relative flex items-center justify-center ${reverse ? 'scale-x-[-1]' : ''} ${sizeClasses}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-lg">
            {/* Ears */}
            <circle cx="26" cy="24" r="14" fill="#2d3748" />
            <circle cx="26" cy="24" r="8" fill={isMomo ? "#f472b6" : "#4a5568"} opacity="0.6" />

            <circle cx="74" cy="24" r="14" fill="#2d3748" />
            <circle cx="74" cy="24" r="8" fill={isMomo ? "#f472b6" : "#4a5568"} opacity="0.6" />

            {/* Head */}
            <ellipse cx="50" cy="52" rx="36" ry="32" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />

            {/* Momo Bow */}
            {isMomo && (
              <g transform="translate(68, 14)">
                <path d="M-6,-4 L6,4 L6,-4 L-6,4 Z" fill="#f43f5e" />
                <circle cx="0" cy="0" r="3" fill="#fff" />
              </g>
            )}

            {/* Eye Patches */}
            <ellipse cx="36" cy="48" rx="10" ry="12" fill="#2d3748" transform="rotate(-12, 36, 48)" />
            <ellipse cx="64" cy="48" rx="10" ry="12" fill="#2d3748" transform="rotate(12, 64, 48)" />

            {/* Eyes */}
            <circle cx="37" cy="47" r="4.5" fill="#ffffff" />
            <circle cx="38" cy="46" r="2.5" fill="#000000" />
            <circle cx="39.5" cy="45" r="1" fill="#ffffff" />

            <circle cx="63" cy="47" r="4.5" fill="#ffffff" />
            <circle cx="62" cy="46" r="2.5" fill="#000000" />
            <circle cx="60.5" cy="45" r="1" fill="#ffffff" />

            {/* Cute Rosy Cheeks */}
            <ellipse cx="26" cy="58" rx="6" ry="4" fill="#f472b6" opacity={isMomo ? "0.6" : "0.35"} />
            <ellipse cx="74" cy="58" rx="6" ry="4" fill="#f472b6" opacity={isMomo ? "0.6" : "0.35"} />

            {/* Snout & Nose */}
            <ellipse cx="50" cy="57" rx="7" ry="5" fill="#f8fafc" />
            <ellipse cx="50" cy="55" rx="3.5" ry="2.5" fill="#1a202c" />

            {/* Mouth */}
            {panda.currentMood === 'Happy' || panda.currentMood === 'Love' || panda.currentMood === 'Excited' ? (
              <path d="M 45 60 Q 50 66 55 60" fill="none" stroke="#1a202c" strokeWidth="2" strokeLinecap="round" />
            ) : panda.currentMood === 'Sleepy' ? (
              <line x1="46" y1="60" x2="54" y2="60" stroke="#1a202c" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M 46 61 Q 50 64 54 61" fill="none" stroke="#1a202c" strokeWidth="1.8" strokeLinecap="round" />
            )}
          </svg>
        </div>

        {/* Mood Bubble Indicator */}
        {panda.currentMood === 'Hungry' && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-3 -right-2 bg-white border border-rose-200 shadow-md rounded-full p-1 text-xs">
            🍎
          </motion.div>
        )}
        {panda.currentMood === 'Sleepy' && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-3 -right-2 bg-blue-100 border border-blue-200 shadow-md rounded-full p-1 text-xs">
            💤
          </motion.div>
        )}
        {panda.currentMood === 'Love' && (
          <motion.div initial={{ scale: 0, y: 0 }} animate={{ scale: 1.4, y: -20, opacity: 0 }} transition={{ duration: 1.2 }} className="absolute -top-4 text-red-500 text-sm">
            ❤️
          </motion.div>
        )}
      </motion.div>

      {/* Shadow */}
      <motion.div 
        animate={{ scale: panda.currentMood === 'Excited' ? [1, 0.75, 1] : [1, 0.92, 1] }} 
        transition={{ repeat: Infinity, duration: panda.currentMood === 'Excited' ? 0.6 : 2 }}
        className="w-14 h-2 bg-black/15 rounded-[100%] mx-auto mt-1 blur-[2px]"
      />
    </div>
  );
}
