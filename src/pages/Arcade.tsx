import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Coins, Heart, Flame, Sparkles, Award } from 'lucide-react';
import { usePandaState } from '../hooks/usePandaState';
import CatchBamboo from '../components/panda/games/CatchBamboo';
import BubblePop from '../components/panda/games/BubblePop';

interface ArcadeGame {
  id: string;
  title: string;
  icon: string;
  description: string;
  playable: boolean;
  color: string;
}

const ARCADE_GAMES: ArcadeGame[] = [
  { id: 'catch-bamboo', title: 'Catch the Bamboo', icon: '🎋', description: 'Catch falling bamboo, avoid bombs!', playable: true, color: 'from-green-400 to-emerald-600' },
  { id: 'bubble-pop', title: 'Bubble Pop', icon: '🫧', description: 'Pop floating bubbles for points!', playable: true, color: 'from-blue-400 to-indigo-600' },
  { id: 'runner', title: 'Panda Runner', icon: '🏃‍♂️', description: 'Endless runner with Mochi!', playable: false, color: 'from-orange-400 to-red-600' },
  { id: 'memory', title: 'Memory Match', icon: '🃏', description: 'Find cute matching panda cards.', playable: false, color: 'from-purple-400 to-pink-600' },
  { id: 'frenzy', title: 'Feed Frenzy', icon: '🍎', description: 'Feed correctly moving foods.', playable: false, color: 'from-yellow-400 to-orange-600' },
  { id: 'stack', title: 'Bamboo Stack', icon: '🗼', description: 'Stack bamboo tower under heavy wind!', playable: false, color: 'from-teal-400 to-green-600' },
  { id: 'dance', title: 'Panda Dance', icon: '💃', description: 'Music rhythm dance off.', playable: false, color: 'from-pink-400 to-rose-600' },
  { id: 'hide-seek', title: 'Hide & Seek', icon: '🫣', description: 'Search bushes to find Momo.', playable: false, color: 'from-violet-400 to-purple-600' },
  { id: 'butterfly', title: 'Butterfly Chase', icon: '🦋', description: 'Catch rare flying butterflies.', playable: false, color: 'from-cyan-400 to-sky-600' },
  { id: 'fishing', title: 'Fishing Pond', icon: '🎣', description: 'Relax and catch golden fish.', playable: false, color: 'from-sky-400 to-blue-600' },
  { id: 'maze', title: 'Bamboo Maze', icon: '🌀', description: 'Navigate maze to escape traps.', playable: false, color: 'from-gray-600 to-zinc-800' },
  { id: 'puzzle', title: 'Panda Puzzle', icon: '🧩', description: 'Slide puzzle to unlock cute wallpapers.', playable: false, color: 'from-emerald-400 to-teal-600' }
];

export default function Arcade() {
  const { arcadeStats, loading, addArcadeRewards } = usePandaState();
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [lastRewards, setLastRewards] = useState<{ coins: number; xp: number } | null>(null);

  const handleFinishGame = async (score: number, coins: number, xp: number) => {
    if (!activeGameId) return;
    await addArcadeRewards(coins, 0, xp, activeGameId, score);
    setLastRewards({ coins, xp });
  };

  if (loading || !arcadeStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--color-text-main)] text-lg animate-pulse">Loading Arcade...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-12 pb-32 px-4 max-w-6xl mx-auto relative z-10">
      <AnimatePresence mode="wait">
        {activeGameId === 'catch-bamboo' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            <CatchBamboo
              highScore={arcadeStats.highScores['catch-bamboo'] || 0}
              onBack={() => { setActiveGameId(null); setLastRewards(null); }}
              onFinish={(score, coins, xp) => handleFinishGame(score, coins, xp)}
            />
          </motion.div>
        )}

        {activeGameId === 'bubble-pop' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            <BubblePop
              highScore={arcadeStats.highScores['bubble-pop'] || 0}
              onBack={() => { setActiveGameId(null); setLastRewards(null); }}
              onFinish={(score, coins, xp) => handleFinishGame(score, coins, xp)}
            />
          </motion.div>
        )}

        {!activeGameId && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
            {/* Header Dashboard */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-[var(--color-text-main)] mb-2 flex items-center justify-center gap-3">
                <Gamepad2 className="w-10 h-10 text-[var(--color-accent-primary)] animate-bounce" /> Panda Arcade
              </h1>
              <p className="text-[var(--color-text-muted)] text-md">Play mini-games to unlock special items and grow Mochi & Momo!</p>
            </div>

            {/* Currency Panels */}
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-6">
              <div className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                <Coins className="w-6 h-6 text-yellow-500 mb-1" />
                <span className="text-sm font-semibold text-[var(--color-text-main)]">{arcadeStats.coins}</span>
                <span className="text-[10px] text-[var(--color-text-muted)] uppercase">Coins</span>
              </div>
              <div className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                <Heart className="w-6 h-6 text-pink-500 mb-1" />
                <span className="text-sm font-semibold text-[var(--color-text-main)]">{arcadeStats.hearts}</span>
                <span className="text-[10px] text-[var(--color-text-muted)] uppercase">Hearts</span>
              </div>
              <div className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                <Flame className="w-6 h-6 text-orange-500 mb-1" />
                <span className="text-sm font-semibold text-[var(--color-text-main)]">{arcadeStats.streak} Days</span>
                <span className="text-[10px] text-[var(--color-text-muted)] uppercase">Streak</span>
              </div>
            </div>

            {/* Rewards Notification */}
            <AnimatePresence>
              {lastRewards && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  className="max-w-md mx-auto mb-6 glass-panel border-green-500/30 bg-green-500/10 p-4 rounded-2xl text-center text-sm font-bold text-green-700 flex justify-center items-center gap-4 relative"
                >
                  <span>🎉 Rewarded: 🪙 +{lastRewards.coins} Coins & ⭐ +{lastRewards.xp} XP to Mochi & Momo!</span>
                  <button onClick={() => setLastRewards(null)} className="absolute right-3 text-green-700 hover:text-green-900 text-xs">✕</button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Game List Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {ARCADE_GAMES.map((game) => (
                <motion.div
                  key={game.id}
                  whileHover={game.playable ? { y: -5 } : {}}
                  className={`glass-panel p-5 rounded-3xl flex flex-col justify-between border border-[var(--color-border-glass)] relative ${game.playable ? 'cursor-pointer hover:shadow-lg' : 'opacity-60 cursor-not-allowed'}`}
                  onClick={() => game.playable && setActiveGameId(game.id)}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center text-3xl shadow-md mb-4`}>
                    {game.icon}
                  </div>

                  <div className="space-y-1 mb-4">
                    <h3 className="font-bold font-serif text-lg text-[var(--color-text-main)]">{game.title}</h3>
                    <p className="text-xs text-[var(--color-text-muted)]">{game.description}</p>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    {game.playable ? (
                      <span className="text-green-500 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Playable
                      </span>
                    ) : (
                      <span className="text-[var(--color-text-muted)] font-medium">Coming Soon</span>
                    )}

                    {arcadeStats.highScores[game.id] !== undefined && (
                      <span className="text-[10px] bg-black/5 px-2 py-0.5 rounded-full text-[var(--color-text-muted)] flex items-center gap-1 font-semibold">
                        <Award className="w-3 h-3" /> High: {arcadeStats.highScores[game.id]}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
