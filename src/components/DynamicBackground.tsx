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
    </div>
  );
}
