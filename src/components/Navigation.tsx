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
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, type: 'spring' }}
      className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-50 w-[98%] max-w-md"
    >
      <div className="glass-panel rounded-full px-3 py-2 flex items-center justify-between shadow-2xl backdrop-blur-xl border border-[var(--color-border-glass)]">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `relative group p-2 flex flex-col items-center transition-all ${
                isActive ? 'text-[var(--color-accent-primary)] font-bold scale-110' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="w-5 h-5" />
                <span className="text-[9px] mt-0.5 font-medium tracking-wider hidden md:block opacity-0 group-hover:opacity-100 absolute -top-8 bg-[var(--color-bg-glass)] px-2 py-1 rounded backdrop-blur-md border border-[var(--color-border-glass)] transition-opacity shadow-lg">
                  {item.label}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)]"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </motion.div>
  );
}
