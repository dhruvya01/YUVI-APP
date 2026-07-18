import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Image as ImageIcon, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navigation() {
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/story', icon: BookOpen, label: 'Story' },
    { path: '/gallery', icon: ImageIcon, label: 'Gallery' },
    { path: '/letters', icon: Mail, label: 'Letters' },
  ];

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.5, type: 'spring' }}
      className="fixed bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 z-50 w-[95%] md:w-auto"
    >
      <div className="glass-panel rounded-full px-4 md:px-8 py-3 flex items-center justify-around md:justify-center md:gap-8 shadow-2xl">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `relative group p-2 flex flex-col items-center transition-all ${
                isActive ? 'text-[var(--color-accent-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="text-[10px] mt-1 font-medium tracking-wider hidden md:block opacity-0 group-hover:opacity-100 absolute -top-8 bg-[var(--color-bg-glass)] px-2 py-1 rounded backdrop-blur-md border border-[var(--color-border-glass)] transition-opacity shadow-lg">
                  {item.label}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="nav-indicator"
                    className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)]"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
        
        {/* Placeholder for future features button */}
        <button className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors group relative">
           <div className="flex flex-col items-center">
             <div className="flex gap-0.5">
               <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
               <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
               <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
             </div>
           </div>
        </button>
      </div>
    </motion.div>
  );
}
