import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, ArrowLeft } from 'lucide-react';

interface MemoryMatchProps {
  onBack: () => void;
  onFinish: (score: number, coins: number, xp: number) => void;
  highScore: number;
}

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

const EMOJIS = ['🐼', '🎋', '💕', '🌸', '🦋', '⭐', '🍡', '🎀'];

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function MemoryMatch({ onBack, onFinish, highScore }: MemoryMatchProps) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const lockRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSound = useCallback((type: 'flip' | 'match' | 'fail' | 'win') => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);

      if (type === 'flip') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.06);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08);
        osc.start(); osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'match') {
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1046, ctx.currentTime + 0.15);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        osc.start(); osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'fail') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.15);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
        osc.start(); osc.stop(ctx.currentTime + 0.15);
      } else {
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1568, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
        osc.start(); osc.stop(ctx.currentTime + 0.4);
      }
    } catch { /* blocked */ }
  }, []);

  const initCards = useCallback(() => {
    const pairs = shuffleArray([...EMOJIS, ...EMOJIS]);
    return pairs.map((emoji, i) => ({
      id: i,
      emoji,
      flipped: false,
      matched: false,
    }));
  }, []);

  const startGame = () => {
    setCards(initCards());
    setFlippedIds([]);
    setMoves(0);
    setMatchCount(0);
    setTimeLeft(60);
    setCombo(0);
    setScore(0);
    setGameState('playing');
    lockRef.current = false;
  };

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameState('gameover');
          clearInterval(timer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  const handleCardClick = (id: number) => {
    if (gameState !== 'playing') return;
    if (lockRef.current) return;

    const card = cards[id];
    if (card.flipped || card.matched) return;

    playSound('flip');

    const newCards = [...cards];
    newCards[id] = { ...newCards[id], flipped: true };
    setCards(newCards);

    const newFlipped = [...flippedIds, id];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      lockRef.current = true;
      setMoves(m => m + 1);

      const [first, second] = newFlipped;
      if (newCards[first].emoji === newCards[second].emoji) {
        // Match!
        setTimeout(() => {
          playSound('match');
          setCards(prev => prev.map(c =>
            c.id === first || c.id === second ? { ...c, matched: true } : c
          ));
          setFlippedIds([]);
          const newCombo = combo + 1;
          setCombo(newCombo);
          const points = 100 + (newCombo * 25);
          setScore(s => s + points);
          setMatchCount(m => {
            const next = m + 1;
            if (next >= EMOJIS.length) {
              setGameState('gameover');
              playSound('win');
            }
            return next;
          });
          lockRef.current = false;
        }, 300);
      } else {
        // No match
        setTimeout(() => {
          playSound('fail');
          setCards(prev => prev.map(c =>
            c.id === first || c.id === second ? { ...c, flipped: false } : c
          ));
          setFlippedIds([]);
          setCombo(0);
          lockRef.current = false;
        }, 600);
      }
    }
  };

  // Gameover rewards
  useEffect(() => {
    if (gameState === 'gameover') {
      const timeBonus = timeLeft * 5;
      const moveBonus = Math.max(0, 200 - moves * 5);
      const finalScore = score + timeBonus + moveBonus;
      setScore(finalScore);
      onFinish(finalScore, Math.floor(finalScore / 8), Math.floor(finalScore / 3));
    }
  }, [gameState]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg flex justify-between items-center mb-3 relative z-20">
        <button onClick={onBack} className="flex items-center gap-2 px-3 py-1.5 glass-panel rounded-full text-sm text-[var(--color-text-main)] hover:bg-black/10">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="relative w-full max-w-md">
        {/* Stats bar */}
        {gameState === 'playing' && (
          <div className="flex justify-between items-center mb-3 px-1">
            <div className="glass-panel px-3 py-1 rounded-full text-xs font-bold text-[var(--color-text-main)]">
              ⏱ {timeLeft}s
            </div>
            <div className="glass-panel px-3 py-1 rounded-full text-xs font-bold text-[var(--color-text-main)]">
              🎯 {matchCount}/{EMOJIS.length}
            </div>
            <div className="glass-panel px-3 py-1 rounded-full text-xs font-bold text-[var(--color-text-main)]">
              ✨ {score}
            </div>
            {combo > 1 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="glass-panel px-3 py-1 rounded-full text-xs font-bold text-orange-500 bg-orange-500/10"
              >
                🔥 x{combo}
              </motion.div>
            )}
          </div>
        )}

        {/* Card Grid */}
        {gameState === 'playing' && (
          <div className="grid grid-cols-4 gap-2.5">
            {cards.map((card) => (
              <motion.div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                whileTap={{ scale: 0.95 }}
                className="relative aspect-square cursor-pointer"
                style={{ perspective: '600px' }}
              >
                <motion.div
                  animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="w-full h-full relative"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front (hidden) */}
                  <div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 shadow-lg flex items-center justify-center border-2 border-white/20"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <span className="text-2xl">🎴</span>
                  </div>

                  {/* Back (emoji) */}
                  <div
                    className={`absolute inset-0 rounded-2xl flex items-center justify-center shadow-lg border-2 transition-colors ${
                      card.matched
                        ? 'bg-gradient-to-br from-green-300 to-emerald-400 border-green-400/50'
                        : 'bg-white/90 border-pink-300/30'
                    }`}
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <span className="text-3xl">{card.emoji}</span>
                  </div>
                </motion.div>

                {/* Match sparkle */}
                <AnimatePresence>
                  {card.matched && (
                    <motion.div
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 2, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <span className="text-xl">✨</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

        {/* Idle */}
        {gameState === 'idle' && (
          <div className="glass-panel rounded-3xl p-8 text-center space-y-5">
            <div className="text-5xl mb-2">🃏</div>
            <h2 className="text-xl font-bold font-serif text-[var(--color-text-main)]">Memory Match</h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              Flip cards and find matching pairs! Chain combos for bonus points. Be fast — the clock is ticking!
            </p>
            <div className="text-sm font-semibold text-[var(--color-accent-primary)]">
              High Score: {highScore} pts
            </div>
            <button onClick={startGame} className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--color-accent-primary)] text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform">
              <Play className="w-5 h-5 fill-current" /> Play
            </button>
          </div>
        )}

        {/* Gameover */}
        {gameState === 'gameover' && (
          <div className="glass-panel rounded-3xl p-8 text-center space-y-4">
            {matchCount >= EMOJIS.length ? (
              <>
                <div className="text-4xl mb-1">🎉</div>
                <h2 className="text-xl font-bold font-serif text-green-500">You Won!</h2>
              </>
            ) : (
              <>
                <div className="text-4xl mb-1">⏰</div>
                <h2 className="text-xl font-bold font-serif text-rose-500">Time's Up!</h2>
              </>
            )}
            <div className="text-lg font-bold text-[var(--color-text-main)]">Score: {score}</div>
            <div className="text-xs text-[var(--color-text-muted)]">
              {matchCount}/{EMOJIS.length} pairs · {moves} moves
            </div>
            {score > highScore && <div className="text-xs text-green-500 font-bold animate-bounce">🎉 New High Score!</div>}
            <div className="border-t border-[var(--color-border-glass)] pt-3 flex justify-around text-xs font-bold text-[var(--color-text-main)]">
              <span>🪙 +{Math.floor(score / 8)}</span>
              <span>⭐ +{Math.floor(score / 3)} XP</span>
            </div>
            <button onClick={startGame} className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--color-accent-primary)] text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform">
              <RotateCcw className="w-4 h-4" /> Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
