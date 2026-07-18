import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudRain, Lock, ScanFace } from 'lucide-react';

export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [time, setTime] = useState(new Date());
  const [unlockMethod, setUnlockMethod] = useState<'swipe' | 'pin' | 'face'>('swipe');
  const [pin, setPin] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUnlock = () => {
    setIsUnlocking(true);
    setTimeout(() => {
      onUnlock();
    }, 1200); // Wait for zoom out animation
  };

  const handlePinEntry = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        // Auto unlock on 4 digits (e.g. 0212 or any for demo)
        setTimeout(() => handleUnlock(), 300);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  // Calculate days together preview
  const startDate = new Date('2025-12-02T00:00:00');
  const diffTime = Math.abs(time.getTime() - startDate.getTime());
  const daysTogether = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return (
    <AnimatePresence>
      {!isUnlocking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-between text-white overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.8) 100%)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          {/* Animated Particles/Orbs in background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <motion.div 
               animate={{ y: [0, -20, 0], opacity: [0.3, 0.5, 0.3] }}
               transition={{ duration: 5, repeat: Infinity }}
               className="absolute top-[10%] left-[20%] w-64 h-64 bg-[var(--color-accent-primary)]/20 rounded-full blur-[80px]"
             />
             <motion.div 
               animate={{ y: [0, 20, 0], opacity: [0.2, 0.4, 0.2] }}
               transition={{ duration: 7, repeat: Infinity }}
               className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-[var(--color-accent-secondary)]/20 rounded-full blur-[100px]"
             />
          </div>

          {/* Top Section: Clock & Widgets */}
          <div className="flex flex-col items-center mt-20 z-10 w-full px-8">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <h1 className="text-8xl font-light tracking-tighter mb-2" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
              </h1>
              <p className="text-xl font-medium tracking-wide text-white/80">
                {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </motion.div>

            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 flex gap-4"
            >
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 flex items-center gap-2">
                <CloudRain className="w-5 h-5 text-blue-300" />
                <span className="font-medium">18°C Rain</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-pink-500 to-red-500 flex items-center justify-center text-[10px] border border-white/50">M</div>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-[10px] border border-white/50">Y</div>
                </div>
                <span className="font-medium text-sm">{daysTogether} Days</span>
              </div>
            </motion.div>
          </div>

          {/* Bottom Section: Unlock Mechanism */}
          <div className="z-10 w-full pb-16 flex flex-col items-center">
            
            <AnimatePresence mode="wait">
              {unlockMethod === 'swipe' && (
                <motion.div
                  key="swipe"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => setUnlockMethod('face')}
                >
                  <Lock className="w-6 h-6 text-white/50 mb-2" />
                  <p className="text-white/70 font-medium tracking-wide">Swipe up or click to unlock</p>
                </motion.div>
              )}

              {unlockMethod === 'face' && (
                <motion.div
                  key="face"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="flex flex-col items-center"
                  onClick={() => {
                     // Simulate face ID scan then unlock
                     setTimeout(() => handleUnlock(), 800);
                  }}
                >
                  <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center relative overflow-hidden cursor-pointer group">
                     <motion.div 
                       animate={{ y: ['-100%', '200%'] }}
                       transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                       className="absolute inset-0 bg-gradient-to-b from-transparent via-green-400/30 to-transparent h-10 w-full z-10"
                     />
                     <ScanFace className="w-10 h-10 text-white group-hover:text-green-300 transition-colors relative z-20" />
                  </div>
                  <p className="mt-4 text-white/70 text-sm">Face ID Demo</p>
                  <button onClick={() => setUnlockMethod('pin')} className="mt-4 text-xs text-white/50 hover:text-white transition-colors">Use PIN Instead</button>
                </motion.div>
              )}

              {unlockMethod === 'pin' && (
                <motion.div
                  key="pin"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center w-full max-w-xs"
                >
                  <p className="text-white/90 font-medium tracking-widest mb-6">ENTER PASSCODE</p>
                  
                  {/* Pin Dots */}
                  <div className="flex gap-4 mb-8">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className={`w-3 h-3 rounded-full border border-white/50 transition-all duration-200 ${pin.length > i ? 'bg-white' : 'bg-transparent'}`} />
                    ))}
                  </div>

                  {/* Numpad */}
                  <div className="grid grid-cols-3 gap-6">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                      <button 
                        key={num}
                        onClick={() => handlePinEntry(num)}
                        className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-2xl font-light transition-colors"
                      >
                        {num}
                      </button>
                    ))}
                    <button onClick={() => setUnlockMethod('swipe')} className="text-sm font-medium text-white/50 hover:text-white">Cancel</button>
                    <button 
                      onClick={() => handlePinEntry('0')}
                      className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-2xl font-light transition-colors"
                    >
                      0
                    </button>
                    <button onClick={handleBackspace} className="text-sm font-medium text-white/50 hover:text-white">Delete</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
