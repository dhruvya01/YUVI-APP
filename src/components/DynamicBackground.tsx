import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

export default function DynamicBackground() {
  const { theme } = useTheme();

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Background gradients or particles can go here based on theme */}
      {theme === 'sakura' && (
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-rose-50 opacity-50"></div>
      )}
      {theme === 'midnight' && (
        <div className="absolute inset-0 bg-[#0f172a]">
          {/* Simple stars for midnight */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white rounded-full opacity-30"
              style={{
                width: Math.random() * 3 + 'px',
                height: Math.random() * 3 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
              }}
              animate={{ opacity: [0.1, 0.5, 0.1] }}
              transition={{ duration: Math.random() * 3 + 2, repeat: Infinity }}
            />
          ))}
        </div>
      )}
      
      {theme === 'panda-paradise' && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Sunlight rays */}
          <motion.div 
            className="absolute -top-[20%] -left-[10%] w-[120%] h-[120%] opacity-20"
            style={{
              background: 'radial-gradient(circle at 50% 0%, rgba(255, 255, 200, 0.8) 0%, transparent 60%)',
            }}
            animate={{ rotate: [0, 5, -5, 0], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Bamboo stalks */}
          {Array.from({ length: 8 }).map((_, i) => {
            const isForeground = i % 2 === 0;
            return (
              <motion.div
                key={`bamboo-${i}`}
                className={`absolute bottom-0 w-8 md:w-12 bg-gradient-to-t from-[#2F3E34] to-[#A8D5BA] rounded-t-full shadow-lg origin-bottom`}
                style={{
                  height: `${70 + Math.random() * 40}%`,
                  left: `${(i + 1) * 12 + (Math.random() * 5 - 2)}%`,
                  opacity: isForeground ? 0.7 : 0.4,
                  zIndex: isForeground ? 10 : 1,
                  filter: isForeground ? 'blur(0px)' : 'blur(4px)',
                }}
                animate={{ rotate: [0, Math.random() * 2 + 1, -1 * (Math.random() * 2 + 1), 0] }}
                transition={{ duration: 8 + Math.random() * 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                {/* Bamboo nodes */}
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className="absolute w-[120%] -left-[10%] h-1 bg-[#2F3E34] opacity-50" style={{ bottom: `${(j + 1) * 15}%` }} />
                ))}
              </motion.div>
            );
          })}

          {/* Floating Leaves */}
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={`leaf-${i}`}
              className="absolute text-2xl opacity-60 drop-shadow-sm"
              initial={{ 
                top: '-10%', 
                left: `${Math.random() * 100}%`,
                rotate: Math.random() * 360 
              }}
              animate={{ 
                top: '110%', 
                left: `${Math.random() * 100}%`,
                rotate: Math.random() * 360 + 360
              }}
              transition={{ 
                duration: 10 + Math.random() * 10, 
                repeat: Infinity, 
                ease: 'linear',
                delay: Math.random() * 10 
              }}
            >
              🍃
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
