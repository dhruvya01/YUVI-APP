import { NavLink, useLocation } from 'react-router-dom';
import { Home, Image as ImageIcon, User, MessageCircle, Gamepad2, HeartHandshake } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navigation() {
  const location = useLocation();

  if (location.pathname === '/chat') return null;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/gallery', icon: ImageIcon, label: 'Memories' },
    { path: '/chat', icon: MessageCircle, label: 'Chat' },
    { path: '/panda-house', icon: HeartHandshake, label: 'Pets' },
    { path: '/arcade', icon: Gamepad2, label: 'Arcade' },
    { path: '/profiles', icon: User, label: 'Profile' },
  ];

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 25 }}
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md"
    >
      <div className="relative rounded-2xl px-2 py-1.5 flex items-center justify-around"
        style={{
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(24px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {navItems.map((item) => {
          const isActive = item.path === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl transition-all"
            >
              <div className="relative">
                <item.icon
                  className={`w-[18px] h-[18px] transition-all duration-300 ${
                    isActive
                      ? 'text-white scale-110'
                      : 'text-white/40 group-hover:text-white/60'
                  }`}
                />
                {isActive && (
                  <motion.div
                    layoutId="nav-glow"
                    className="absolute -inset-2.5 rounded-xl"
                    style={{
                      background: `radial-gradient(circle, var(--glow) 0%, transparent 70%)`,
                      opacity: 0.7,
                      zIndex: -1,
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </div>
              <span className={`text-[8px] font-semibold tracking-wide transition-all duration-300 ${
                isActive ? 'text-white/90' : 'text-white/30'
              }`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="nav-dot"
                  className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[var(--color-accent-primary)]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </NavLink>
          );
        })}
      </div>
    </motion.nav>
  );
}
