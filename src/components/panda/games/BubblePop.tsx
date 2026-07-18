import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Volume2, VolumeX, ArrowLeft } from 'lucide-react';

interface BubblePopProps {
  onBack: () => void;
  onFinish: (score: number, coins: number, xp: number) => void;
  highScore: number;
}

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  type: 'standard' | 'golden' | 'spiky';
  speed: number;
  popped: boolean;
}

export default function BubblePop({ onBack, onFinish, highScore }: BubblePopProps) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bubbleIdCounter = useRef(0);

  // Sound generator
  const playPopSound = (type: 'standard' | 'golden' | 'spiky') => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'standard') {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'golden') {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'spiky') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch (e) {
      // Audio context blocked
    }
  };

  // Start game
  const startGame = () => {
    setScore(0);
    setTimeLeft(45);
    setGameState('playing');
    setBubbles([]);
  };

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setGameState('gameover');
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  // Bubble Spawning and Movement Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    // Spawn rate
    const spawnInterval = setInterval(() => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      
      const typeRand = Math.random();
      let type: 'standard' | 'golden' | 'spiky' = 'standard';
      if (typeRand > 0.9) type = 'golden';
      else if (typeRand > 0.75) type = 'spiky';

      const newBubble: Bubble = {
        id: bubbleIdCounter.current++,
        x: Math.random() * (width - 60) + 10,
        y: 500, // Spawn offscreen bottom
        size: type === 'golden' ? 45 : type === 'spiky' ? 55 : 50,
        type,
        speed: 1.5 + Math.random() * 2,
        popped: false
      };

      setBubbles((b) => [...b, newBubble]);
    }, 450);

    // Physics update frame loop
    let animFrame: number;
    const updateBubbles = () => {
      setBubbles((currBubbles) => {
        return currBubbles
          .map((b) => ({
            ...b,
            y: b.y - b.speed // Float upwards
          }))
          .filter((b) => b.y > -100); // Filter out off-screen top
      });
      animFrame = requestAnimationFrame(updateBubbles);
    };

    animFrame = requestAnimationFrame(updateBubbles);

    return () => {
      clearInterval(spawnInterval);
      cancelAnimationFrame(animFrame);
    };
  }, [gameState]);

  const handlePop = (id: number, type: 'standard' | 'golden' | 'spiky') => {
    if (gameState !== 'playing') return;

    setBubbles((curr) => curr.map((b) => (b.id === id ? { ...b, popped: true } : b)));
    playPopSound(type);

    if (type === 'standard') {
      setScore((s) => s + 10);
    } else if (type === 'golden') {
      setScore((s) => s + 30);
    } else if (type === 'spiky') {
      setScore((s) => Math.max(0, s - 20));
    }
  };

  useEffect(() => {
    if (gameState === 'gameover') {
      const finalCoins = Math.floor(score / 4);
      const finalXp = Math.floor(score / 2);
      onFinish(score, finalCoins, finalXp);
    }
  }, [gameState]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Header controls */}
      <div className="w-full max-w-lg flex justify-between items-center mb-4 relative z-20">
        <button onClick={onBack} className="flex items-center gap-2 px-3 py-1.5 glass-panel rounded-full text-sm text-[var(--color-text-main)] hover:bg-black/10 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>
        <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 glass-panel rounded-full hover:bg-black/10 transition-colors">
          {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4 text-red-500" />}
        </button>
      </div>

      <div 
        ref={containerRef}
        className="relative glass-panel rounded-3xl overflow-hidden shadow-2xl border border-[var(--color-border-glass)] w-full max-w-md aspect-[4/5] bg-gradient-to-b from-blue-200/50 to-pink-100/50 cursor-pointer select-none"
      >
        {/* Render Bubbles */}
        <AnimatePresence>
          {bubbles.map((b) => {
            if (b.popped) return null;
            return (
              <motion.div
                key={b.id}
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.8, x: b.x, y: b.y }}
                exit={{ scale: 1.4, opacity: 0, transition: { duration: 0.1 } }}
                onClick={() => handlePop(b.id, b.type)}
                className={`absolute rounded-full flex items-center justify-center border-2 shadow-inner`}
                style={{
                  width: b.size,
                  height: b.size,
                  borderColor: b.type === 'golden' ? '#e9c46a' : b.type === 'spiky' ? '#e76f51' : '#a8dadc',
                  background: b.type === 'golden' ? 'radial-gradient(circle, rgba(233,196,106,0.6) 0%, rgba(244,162,97,0.3) 100%)' : b.type === 'spiky' ? 'radial-gradient(circle, rgba(231,111,81,0.6) 0%, rgba(230,57,70,0.3) 100%)' : 'radial-gradient(circle, rgba(168,218,220,0.4) 0%, rgba(69,123,157,0.2) 100%)',
                }}
              >
                {b.type === 'golden' && <span className="text-xs">⭐</span>}
                {b.type === 'spiky' && <span className="text-xs">💥</span>}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Stats overlay */}
        {gameState === 'playing' && (
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none z-10">
            <div className="bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-bold">
              Score: {score}
            </div>
            <div className="bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-bold">
              Time: {timeLeft}s
            </div>
          </div>
        )}

        {/* Idle screen */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel p-8 rounded-3xl max-w-xs space-y-6">
              <h2 className="text-2xl font-bold font-serif text-[var(--color-text-main)]">Bubble Pop! 🫧</h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                Bubbles are floating up! Pop blue and gold bubbles. Avoid spiky red bubbles!
              </p>
              <div className="text-sm font-semibold text-[var(--color-accent-primary)]">
                High Score: {highScore} pts
              </div>
              <button onClick={startGame} className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--color-accent-primary)] text-white font-bold rounded-2xl hover:bg-[var(--color-accent-secondary)] transition-colors shadow-lg">
                <Play className="w-5 h-5 fill-current" /> Start Game
              </button>
            </motion.div>
          </div>
        )}

        {/* Game over screen */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-10">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel p-8 rounded-3xl max-w-xs space-y-6">
              <h2 className="text-2xl font-bold font-serif text-[var(--color-accent-primary)] font-semibold">Time's Up!</h2>
              <div className="space-y-2">
                <div className="text-lg text-[var(--color-text-main)] font-bold">Final Score: {score}</div>
                {score > highScore && <div className="text-xs text-green-500 font-bold animate-bounce">New High Score! 🎉</div>}
                <div className="text-xs text-[var(--color-text-muted)]">High Score: {Math.max(score, highScore)}</div>
              </div>
              
              <div className="border-t border-[var(--color-border-glass)] pt-4 flex justify-around text-xs font-bold text-[var(--color-text-main)]">
                <div>🪙 +{Math.floor(score / 4)} Coins</div>
                <div>⭐ +{Math.floor(score / 2)} XP</div>
              </div>

              <div className="flex gap-2">
                <button onClick={startGame} className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--color-accent-primary)] text-white font-bold rounded-2xl hover:bg-[var(--color-accent-secondary)] transition-colors">
                  <RotateCcw className="w-4 h-4" /> Try Again
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
