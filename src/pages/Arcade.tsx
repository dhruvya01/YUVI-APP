import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Coins, Heart, Flame, Sparkles, Award } from 'lucide-react';
import { usePandaState } from '../hooks/usePandaState';
import CatchBamboo from '../components/panda/games/CatchBamboo';
import BubblePop from '../components/panda/games/BubblePop';
import MemoryMatch from '../components/panda/games/MemoryMatch';
import PandaRunner from '../components/panda/games/PandaRunner';

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
  { id: 'runner', title: 'Panda Runner', icon: '🏃', description: 'Tap to jump over obstacles!', playable: true, color: 'from-orange-400 to-red-600' },
  { id: 'memory', title: 'Memory Match', icon: '🃏', description: 'Find cute matching panda cards!', playable: true, color: 'from-purple-400 to-pink-600' },
  { id: 'frenzy', title: 'Feed Frenzy', icon: '🍎', description: 'Feed correctly moving foods.', playable: false, color: 'from-yellow-400 to-orange-600' },
  { id: 'stack', title: 'Bamboo Stack', icon: '🗼', description: 'Stack bamboo tower under heavy wind!', playable: false, color: 'from-teal-400 to-green-600' },
  { id: 'dance', title: 'Panda Dance', icon: '💃', description: 'Music rhythm dance off.', playable: false, color: 'from-pink-400 to-rose-600' },
  { id: 'butterfly', title: 'Butterfly Chase', icon: '🦋', description: 'Catch rare flying butterflies.', playable: false, color: 'from-cyan-400 to-sky-600' },
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

  const renderGame = () => {
    const props = {
      onBack: () => { setActiveGameId(null); setLastRewards(null); },
      onFinish: handleFinishGame,
    };

    switch (activeGameId) {
      case 'catch-bamboo':
        return <CatchBamboo {...props} highScore={arcadeStats.highScores['catch-bamboo'] || 0} />;
      case 'bubble-pop':
        return <BubblePop {...props} highScore={arcadeStats.highScores['bubble-pop'] || 0} />;
      case 'runner':
        return <PandaRunner {...props} highScore={arcadeStats.highScores['runner'] || 0} />;
      case 'memory':
        return <MemoryMatch {...props} highScore={arcadeStats.highScores['memory'] || 0} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-12 pb-32 px-4 max-w-6xl mx-auto relative z-10">
      <AnimatePresence mode="wait">
        {activeGameId && (
          <motion.div key={activeGameId} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            {renderGame()}
          </motion.div>
        )}

        {!activeGameId && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-[var(--color-text-main)] mb-1 flex items-center justify-center gap-2">
                <Gamepad2 className="w-8 h-8 text-[var(--color-accent-primary)] animate-bounce" /> Panda Arcade
              </h1>
              <p className="text-[var(--color-text-muted)] text-sm">Play games & earn rewards for Mochi & Momo! 🐼</p>
            </div>

            {/* Currency */}
            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-5">
              <div className="glass-panel p-3 rounded-2xl flex flex-col items-center text-center">
                <Coins className="w-5 h-5 text-yellow-500 mb-0.5" />
                <span className="text-sm font-bold text-[var(--color-text-main)]">{arcadeStats.coins}</span>
                <span className="text-[9px] text-[var(--color-text-muted)] uppercase">Coins</span>
              </div>
              <div className="glass-panel p-3 rounded-2xl flex flex-col items-center text-center">
                <Heart className="w-5 h-5 text-pink-500 mb-0.5" />
                <span className="text-sm font-bold text-[var(--color-text-main)]">{arcadeStats.hearts}</span>
                <span className="text-[9px] text-[var(--color-text-muted)] uppercase">Hearts</span>
              </div>
              <div className="glass-panel p-3 rounded-2xl flex flex-col items-center text-center">
                <Flame className="w-5 h-5 text-orange-500 mb-0.5" />
                <span className="text-sm font-bold text-[var(--color-text-main)]">{arcadeStats.streak}</span>
                <span className="text-[9px] text-[var(--color-text-muted)] uppercase">Streak</span>
              </div>
            </div>

            {/* Rewards toast */}
            <AnimatePresence>
              {lastRewards && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-sm mx-auto mb-4 glass-panel border-green-500/30 bg-green-500/10 p-3 rounded-2xl text-center text-xs font-bold text-green-600 relative"
                >
                  🎉 +{lastRewards.coins} Coins & +{lastRewards.xp} XP earned!
                  <button onClick={() => setLastRewards(null)} className="absolute right-2 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-800 text-[10px]">✕</button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Game Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {ARCADE_GAMES.map((game) => (
                <motion.div
                  key={game.id}
                  whileHover={game.playable ? { y: -4 } : {}}
                  whileTap={game.playable ? { scale: 0.97 } : {}}
                  className={`glass-panel p-4 rounded-2xl flex flex-col border border-[var(--color-border-glass)] relative ${game.playable ? 'cursor-pointer hover:shadow-lg active:shadow-md' : 'opacity-50 cursor-not-allowed'}`}
                  onClick={() => game.playable && setActiveGameId(game.id)}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center text-2xl shadow-md mb-3`}>
                    {game.icon}
                  </div>
                  <h3 className="font-bold font-serif text-sm text-[var(--color-text-main)] mb-0.5">{game.title}</h3>
                  <p className="text-[10px] text-[var(--color-text-muted)] mb-3 flex-1">{game.description}</p>
                  <div className="flex justify-between items-center text-[10px]">
                    {game.playable ? (
                      <span className="text-green-500 font-semibold flex items-center gap-0.5">
                        <Sparkles className="w-3 h-3" /> Play
                      </span>
                    ) : (
                      <span className="text-[var(--color-text-muted)]">Soon</span>
                    )}
                    {arcadeStats.highScores[game.id] !== undefined && (
                      <span className="bg-black/5 px-1.5 py-0.5 rounded-full text-[var(--color-text-muted)] flex items-center gap-0.5 font-semibold">
                        <Award className="w-2.5 h-2.5" /> {arcadeStats.highScores[game.id]}
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
