import { useState, useEffect, useCallback } from 'react';
import type { Panda, PandaMood, ArcadeStats } from '../types';
import { pandaRepo } from '../repositories/PandaRepository';
import { arcadeRepo } from '../repositories/ArcadeRepository';

const DECAY_INTERVAL = 60000; // 1 minute in real time

export function usePandaState() {
  const [mochi, setMochi] = useState<Panda | null>(null);
  const [momo, setMomo] = useState<Panda | null>(null);
  const [arcadeStats, setArcadeStats] = useState<ArcadeStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPandas = useCallback(async () => {
    setLoading(true);
    const mochiData = await pandaRepo.getMochi();
    const momoData = await pandaRepo.getMomo();
    const arcadeData = await arcadeRepo.getStats();
    setMochi(mochiData);
    setMomo(momoData);
    setArcadeStats(arcadeData);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPandas();
  }, [loadPandas]);

  // Stat Decay Loop
  useEffect(() => {
    if (!mochi || !momo) return;

    const interval = setInterval(async () => {
      const decay = (p: Panda): Panda => {
        let { hunger, energy, cleanliness, happiness } = p.stats;
        hunger = Math.max(0, hunger - 1);
        energy = Math.max(0, energy - 0.5);
        cleanliness = Math.max(0, cleanliness - 0.2);
        
        if (hunger < 30) happiness = Math.max(0, happiness - 2);

        // Derive mood
        let mood: PandaMood = p.currentMood;
        if (hunger < 20) mood = 'Hungry';
        else if (energy < 20) mood = 'Sleepy';
        else if (happiness > 80) mood = 'Happy';

        return {
          ...p,
          stats: { ...p.stats, hunger, energy, cleanliness, happiness },
          currentMood: mood
        };
      };

      const newMochi = decay(mochi);
      const newMomo = decay(momo);

      await pandaRepo.update(newMochi.id, newMochi);
      await pandaRepo.update(newMomo.id, newMomo);
      setMochi(newMochi);
      setMomo(newMomo);
    }, DECAY_INTERVAL);

    return () => clearInterval(interval);
  }, [mochi, momo]);

  const feed = async (pandaId: 'mochi' | 'momo', foodName: string) => {
    const target = pandaId === 'mochi' ? mochi : momo;
    if (!target) return;

    const isFav = target.favoriteFood === foodName;
    const newHunger = Math.min(100, target.stats.hunger + (isFav ? 30 : 15));
    const newHappiness = Math.min(100, target.stats.happiness + (isFav ? 10 : 5));
    const newXp = target.stats.xp + 10;
    
    let level = target.stats.level;
    let xpNeeded = target.stats.xpNeeded;
    if (newXp >= xpNeeded) {
      level += 1;
      xpNeeded = Math.floor(xpNeeded * 1.5);
    }

    const updated = {
      ...target,
      stats: {
        ...target.stats,
        hunger: newHunger,
        happiness: newHappiness,
        xp: newXp,
        level,
        xpNeeded
      },
      currentMood: 'Happy' as PandaMood,
      lastFed: new Date().toISOString()
    };

    await pandaRepo.update(target.id, updated);
    if (pandaId === 'mochi') setMochi(updated);
    else setMomo(updated);
  };

  const play = async (pandaId: 'mochi' | 'momo', _gameName: string) => {
    const target = pandaId === 'mochi' ? mochi : momo;
    if (!target) return;
    
    if (target.stats.energy < 20) return; // Too tired to play

    const newEnergy = Math.max(0, target.stats.energy - 15);
    const newHappiness = Math.min(100, target.stats.happiness + 20);
    const newXp = target.stats.xp + 20;

    let level = target.stats.level;
    let xpNeeded = target.stats.xpNeeded;
    if (newXp >= xpNeeded) {
      level += 1;
      xpNeeded = Math.floor(xpNeeded * 1.5);
    }

    const updated = {
      ...target,
      stats: {
        ...target.stats,
        energy: newEnergy,
        happiness: newHappiness,
        xp: newXp,
        level,
        xpNeeded
      },
      currentMood: 'Excited' as PandaMood,
      lastPlayed: new Date().toISOString()
    };

    await pandaRepo.update(target.id, updated);
    if (pandaId === 'mochi') setMochi(updated);
    else setMomo(updated);
  };

  const pet = async (pandaId: 'mochi' | 'momo') => {
    const target = pandaId === 'mochi' ? mochi : momo;
    if (!target) return;

    const newFriendship = Math.min(100, target.stats.friendship + 1);
    const newHappiness = Math.min(100, target.stats.happiness + 2);

    const updated = {
      ...target,
      stats: {
        ...target.stats,
        friendship: newFriendship,
        happiness: newHappiness
      },
      currentMood: 'Love' as PandaMood
    };

    await pandaRepo.update(target.id, updated);
    if (pandaId === 'mochi') setMochi(updated);
    else setMomo(updated);
  };

  const addArcadeRewards = async (coinsReward: number, heartsReward: number, xpReward: number, gameId: string, score: number) => {
    if (!arcadeStats || !mochi || !momo) return;

    // Update global stats
    const updatedHighScores = { ...arcadeStats.highScores };
    if (!updatedHighScores[gameId] || score > updatedHighScores[gameId]) {
      updatedHighScores[gameId] = score;
    }

    const newArcade = {
      ...arcadeStats,
      coins: arcadeStats.coins + coinsReward,
      hearts: arcadeStats.hearts + heartsReward,
      highScores: updatedHighScores
    };

    await arcadeRepo.saveStats(newArcade);
    setArcadeStats(newArcade);

    // Distribute XP to both pandas
    const distributeXp = (p: Panda): Panda => {
      const newXp = p.stats.xp + xpReward;
      let level = p.stats.level;
      let xpNeeded = p.stats.xpNeeded;
      if (newXp >= xpNeeded) {
        level += 1;
        xpNeeded = Math.floor(xpNeeded * 1.5);
      }
      return {
        ...p,
        stats: {
          ...p.stats,
          xp: newXp,
          level,
          xpNeeded
        }
      };
    };

    const newMochi = distributeXp(mochi);
    const newMomo = distributeXp(momo);

    await pandaRepo.update(newMochi.id, newMochi);
    await pandaRepo.update(newMomo.id, newMomo);
    setMochi(newMochi);
    setMomo(newMomo);
  };

  return { mochi, momo, arcadeStats, loading, feed, play, pet, addArcadeRewards };
}
