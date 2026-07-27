import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

export default function DynamicBackground() {
  const { theme } = useTheme();

  // Memoize particles to avoid re-renders
  const orbs = useMemo(() => Array.from({ length: 4 }, (_, i) => ({
    id: i,
    size: 200 + i * 80,
    x: (i * 25 + 10) + '%',
    y: (i * 20 + 5) + '%',
    duration: 18 + i * 4,
  })), []);

  const stars = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    id: i,
    size: 1 + (i % 3),
    x: ((i * 37.7) % 100) + '%',
    y: ((i * 23.3) % 100) + '%',
    delay: (i * 0.3) % 4,
    duration: 2 + (i % 3) * 1.5,
  })), []);

  const getOrbColors = () => {
    switch (theme) {
      case 'midnight': return ['rgba(59,130,246,0.12)', 'rgba(139,92,246,0.10)', 'rgba(14,165,233,0.08)', 'rgba(99,102,241,0.06)'];
      case 'galaxy': return ['rgba(217,70,239,0.15)', 'rgba(168,85,247,0.12)', 'rgba(139,92,246,0.10)', 'rgba(236,72,153,0.08)'];
      case 'lavender': return ['rgba(168,85,247,0.10)', 'rgba(192,132,252,0.08)', 'rgba(147,51,234,0.06)', 'rgba(216,180,254,0.05)'];
      case 'ocean': return ['rgba(14,165,233,0.10)', 'rgba(34,211,238,0.08)', 'rgba(59,130,246,0.06)', 'rgba(125,211,252,0.05)'];
      case 'forest': return ['rgba(34,197,94,0.10)', 'rgba(74,222,128,0.08)', 'rgba(22,163,74,0.06)', 'rgba(134,239,172,0.05)'];
      case 'panda-paradise': return ['rgba(168,213,186,0.15)', 'rgba(200,184,138,0.10)', 'rgba(120,180,150,0.08)', 'rgba(180,200,160,0.06)'];
      default: return ['rgba(244,63,94,0.10)', 'rgba(253,164,175,0.08)', 'rgba(251,113,133,0.06)', 'rgba(244,63,94,0.04)'];
    }
  };

  const isDark = theme === 'midnight' || theme === 'galaxy';
  const orbColors = getOrbColors();

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Base ambient gradient */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: isDark
            ? `radial-gradient(ellipse at 20% 20%, ${orbColors[0]} 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, ${orbColors[1]} 0%, transparent 50%)`
            : `radial-gradient(ellipse at 30% 0%, ${orbColors[0]} 0%, transparent 60%), radial-gradient(ellipse at 70% 100%, ${orbColors[1]} 0%, transparent 60%)`,
        }}
      />

      {/* Floating orbs */}
      {orbs.map((orb, i) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, ${orbColors[i]} 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -25, 15, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Stars for dark themes */}
      {isDark && stars.map((star) => (
        <motion.div
          key={`star-${star.id}`}
          className="absolute rounded-full bg-white"
          style={{
            width: star.size,
            height: star.size,
            left: star.x,
            top: star.y,
          }}
          animate={{ opacity: [0.1, 0.6, 0.1] }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
          }}
        />
      ))}

      {/* Panda paradise special: floating leaves */}
      {theme === 'panda-paradise' && (
        <>
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={`leaf-${i}`}
              className="absolute text-lg opacity-40"
              style={{
                left: `${(i * 12.5)}%`,
              }}
              initial={{ top: '-5%', rotate: 0 }}
              animate={{ top: '105%', rotate: 360 }}
              transition={{
                duration: 15 + i * 3,
                repeat: Infinity,
                ease: 'linear',
                delay: i * 2,
              }}
            >
              {i % 2 === 0 ? '🍃' : '🌿'}
            </motion.div>
          ))}
        </>
      )}

      {/* Mesh noise overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />
    </div>
  );
}
