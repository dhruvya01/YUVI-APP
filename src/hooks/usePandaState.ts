import { useState, useEffect, useCallback } from 'react';
import type { Panda, PandaMood, PandaAction, PandaRoom, ArcadeStats, DiaryEntry, InventoryItem } from '../types';
import { pandaRepo } from '../repositories/PandaRepository';
import { arcadeRepo } from '../repositories/ArcadeRepository';
import { diaryRepo } from '../repositories/DiaryRepository';
import { inventoryRepo } from '../repositories/InventoryRepository';

const DECAY_INTERVAL = 60000; // 1 minute decay
const AI_INTERVAL = 15000; // 15 seconds independent decision loop

const ROOMS: PandaRoom[] = ['Bedroom', 'Kitchen', 'Living Room', 'Garden'];

export function usePandaState() {
  const [mochi, setMochi] = useState<Panda | null>(null);
  const [momo, setMomo] = useState<Panda | null>(null);
  const [arcadeStats, setArcadeStats] = useState<ArcadeStats | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [diary, setDiary] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    const mochiData = await pandaRepo.getMochi();
    const momoData = await pandaRepo.getMomo();
    const arcadeData = await arcadeRepo.getStats();
    const invData = await inventoryRepo.findAll();
    const diaryData = await diaryRepo.findAll();
    setMochi(mochiData);
    setMomo(momoData);
    setArcadeStats(arcadeData);
    setInventory(invData);
    setDiary(diaryData.reverse()); // latest first
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Stat Decay Loop
  useEffect(() => {
    if (!mochi || !momo) return;

    const interval = setInterval(async () => {
      const decay = (p: Panda): Panda => {
        let { hunger, energy, cleanliness, happiness, hydration, fun, comfort, health } = p.stats;
        hunger = Math.max(0, hunger - 1);
        hydration = Math.max(0, hydration - 1.5);
        energy = Math.max(0, energy - 0.5);
        cleanliness = Math.max(0, cleanliness - 0.3);
        fun = Math.max(0, fun - 1.2);
        comfort = Math.max(0, comfort - 0.5);

        // Calculate health/happiness based on needs
        if (hunger < 20 || hydration < 20) {
          health = Math.max(0, health - 2);
          happiness = Math.max(0, happiness - 3);
        } else {
          health = Math.min(100, health + 0.5);
        }

        // Derive mood
        let mood: PandaMood = p.currentMood;
        if (hunger < 20) mood = 'Hungry';
        else if (hydration < 20) mood = 'Curious';
        else if (energy < 20) mood = 'Sleepy';
        else if (fun < 30) mood = 'Sad';
        else if (happiness > 80) mood = 'Happy';

        return {
          ...p,
          stats: { ...p.stats, hunger, hydration, energy, cleanliness, fun, comfort, happiness, health },
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

  // Weighted AI Simulation Loop
  useEffect(() => {
    if (!mochi || !momo || loading) return;

    const interval = setInterval(async () => {
      // Determine if pandas should change behavior
      if (Math.random() > 0.4) {
        const selectRandomAction = (p: Panda): { action: PandaAction, room: PandaRoom, mood: PandaMood } => {
          // Weighted decision based on stats
          if (p.stats.hunger < 30) {
            return { action: 'Eating', room: 'Kitchen', mood: 'Hungry' };
          }
          if (p.stats.energy < 25) {
            return { action: 'Sleeping', room: 'Bedroom', mood: 'Sleepy' };
          }
          
          // Random walk/interaction
          const randRoom = ROOMS[Math.floor(Math.random() * ROOMS.length)];
          let randAction: PandaAction = 'Idle';
          let randMood: PandaMood = 'Happy';

          if (randRoom === 'Kitchen') {
            randAction = Math.random() > 0.5 ? 'Cooking' : 'Eating';
          } else if (randRoom === 'Bedroom') {
            randAction = Math.random() > 0.6 ? 'Sleeping' : 'Reading';
          } else if (randRoom === 'Garden') {
            randAction = Math.random() > 0.5 ? 'Watering' : 'Walking';
          } else {
            randAction = Math.random() > 0.5 ? 'Dancing' : 'Playing';
            randMood = 'Playful';
          }

          return { action: randAction, room: randRoom, mood: randMood };
        };

        const mochiAI = selectRandomAction(mochi);
        const momoAI = selectRandomAction(momo);

        // Update Mochi
        const updatedMochi: Panda = {
          ...mochi,
          currentAction: mochiAI.action,
          currentRoom: mochiAI.room,
          currentMood: mochiAI.mood
        };

        // Update Momo
        const updatedMomo: Panda = {
          ...momo,
          currentAction: momoAI.action,
          currentRoom: momoAI.room,
          currentMood: momoAI.mood
        };

        // Check if they did something together to log in Diary
        let logText = '';
        if (updatedMochi.currentRoom === updatedMomo.currentRoom) {
          if (updatedMochi.currentAction === 'Sleeping' && updatedMomo.currentAction === 'Sleeping') {
            logText = 'Mochi and Momo fell asleep together, snoring peacefully.';
          } else if (updatedMochi.currentAction === 'Eating' || updatedMomo.currentAction === 'Eating') {
            logText = `Mochi and Momo hung out in the kitchen enjoying some delicious treats.`;
          } else {
            logText = `Mochi and Momo met in the ${updatedMochi.currentRoom} and shared a cute moment.`;
          }
        } else {
          if (Math.random() > 0.7) {
            logText = `Mochi went to the ${updatedMochi.currentRoom} to ${updatedMochi.currentAction.toLowerCase()} while Momo was busy in the ${updatedMomo.currentRoom}.`;
          }
        }

        if (logText) {
          const entry = await diaryRepo.addLog(logText);
          setDiary(prev => [entry, ...prev]);
        }

        await pandaRepo.update(updatedMochi.id, updatedMochi);
        await pandaRepo.update(updatedMomo.id, updatedMomo);
        setMochi(updatedMochi);
        setMomo(updatedMomo);
      }
    }, AI_INTERVAL);

    return () => clearInterval(interval);
  }, [mochi, momo, loading]);

  // Interactions
  const feed = async (pandaId: 'mochi' | 'momo', foodName: string) => {
    const target = pandaId === 'mochi' ? mochi : momo;
    if (!target) return;

    const isFav = target.favoriteFood === foodName;
    const newHunger = Math.min(100, target.stats.hunger + (isFav ? 40 : 20));
    const newHappiness = Math.min(100, target.stats.happiness + (isFav ? 15 : 8));
    const newXp = target.stats.xp + 15;

    let level = target.stats.level;
    let xpNeeded = target.stats.xpNeeded;
    if (newXp >= xpNeeded) {
      level += 1;
      xpNeeded = Math.floor(xpNeeded * 1.5);
    }

    const updated = {
      ...target,
      stats: { ...target.stats, hunger: newHunger, happiness: newHappiness, xp: newXp, level, xpNeeded },
      currentMood: 'Happy' as PandaMood,
      currentAction: 'Eating' as PandaAction,
      lastFed: new Date().toISOString()
    };

    await pandaRepo.update(target.id, updated);
    if (pandaId === 'mochi') setMochi(updated);
    else setMomo(updated);

    await diaryRepo.addLog(`${target.name} happily munched on some ${foodName}.`);
    const diaryData = await diaryRepo.findAll();
    setDiary(diaryData.reverse());
  };

  const play = async (pandaId: 'mochi' | 'momo', toyName: string) => {
    const target = pandaId === 'mochi' ? mochi : momo;
    if (!target) return;

    if (target.stats.energy < 20) return;

    const newEnergy = Math.max(0, target.stats.energy - 15);
    const newHappiness = Math.min(100, target.stats.happiness + 25);
    const newXp = target.stats.xp + 25;

    let level = target.stats.level;
    let xpNeeded = target.stats.xpNeeded;
    if (newXp >= xpNeeded) {
      level += 1;
      xpNeeded = Math.floor(xpNeeded * 1.5);
    }

    const updated = {
      ...target,
      stats: { ...target.stats, energy: newEnergy, happiness: newHappiness, xp: newXp, level, xpNeeded },
      currentMood: 'Excited' as PandaMood,
      currentAction: 'Playing' as PandaAction,
      lastPlayed: new Date().toISOString()
    };

    await pandaRepo.update(target.id, updated);
    if (pandaId === 'mochi') setMochi(updated);
    else setMomo(updated);

    await diaryRepo.addLog(`${target.name} played excitedly with the ${toyName}!`);
    const diaryData = await diaryRepo.findAll();
    setDiary(diaryData.reverse());
  };

  const pet = async (pandaId: 'mochi' | 'momo') => {
    const target = pandaId === 'mochi' ? mochi : momo;
    if (!target) return;

    const newFriendship = Math.min(100, target.stats.friendship + 2);
    const newHappiness = Math.min(100, target.stats.happiness + 5);

    const updated = {
      ...target,
      stats: { ...target.stats, friendship: newFriendship, happiness: newHappiness },
      currentMood: 'Love' as PandaMood
    };

    await pandaRepo.update(target.id, updated);
    if (pandaId === 'mochi') setMochi(updated);
    else setMomo(updated);
  };

  const addArcadeRewards = async (coinsReward: number, heartsReward: number, xpReward: number, gameId: string, score: number) => {
    if (!arcadeStats || !mochi || !momo) return;

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
        stats: { ...p.stats, xp: newXp, level, xpNeeded }
      };
    };

    const newMochi = distributeXp(mochi);
    const newMomo = distributeXp(momo);

    await pandaRepo.update(newMochi.id, newMochi);
    await pandaRepo.update(newMomo.id, newMomo);
    setMochi(newMochi);
    setMomo(newMomo);
  };

  const buyItem = async (item: Omit<InventoryItem, 'quantity'>, price: number) => {
    if (!arcadeStats) return false;
    if (arcadeStats.coins < price) return false;

    // Deduct coins
    const newArcade = {
      ...arcadeStats,
      coins: arcadeStats.coins - price
    };
    await arcadeRepo.saveStats(newArcade);
    setArcadeStats(newArcade);

    // Add to inventory
    await inventoryRepo.addItem({ ...item, quantity: 1 });
    const invData = await inventoryRepo.findAll();
    setInventory(invData);

    return true;
  };

  const dressUp = async (pandaId: 'mochi' | 'momo', costumeName: string | null) => {
    const target = pandaId === 'mochi' ? mochi : momo;
    if (!target) return;

    const updated = {
      ...target,
      costume: costumeName
    };

    await pandaRepo.update(target.id, updated);
    if (pandaId === 'mochi') setMochi(updated);
    else setMomo(updated);

    await diaryRepo.addLog(`${target.name} put on a cute ${costumeName || 'default'} outfit!`);
    const diaryData = await diaryRepo.findAll();
    setDiary(diaryData.reverse());
  };

  return { 
    mochi, 
    momo, 
    arcadeStats, 
    inventory,
    diary,
    loading, 
    feed, 
    play, 
    pet, 
    addArcadeRewards, 
    buyItem,
    dressUp
  };
}
