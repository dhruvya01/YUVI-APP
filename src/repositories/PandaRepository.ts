import { FirebaseRepository } from './FirebaseRepository';
import type { Panda } from '../types';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const DEFAULT_MOCHI: Panda = {
  id: 'mochi',
  name: 'Mochi',
  ownerId: 'yuvi',
  stats: {
    health: 100, happiness: 85, energy: 90, hunger: 75, hydration: 80,
    cleanliness: 100, fun: 75, comfort: 85, friendship: 50, level: 1, xp: 0, xpNeeded: 100
  },
  currentMood: 'Happy', currentAction: 'Idle', currentRoom: 'Bedroom', personality: 'Energetic',
  birthday: new Date().toISOString(), favoriteFood: 'Bamboo', favoriteToy: 'Ball', costume: null,
  skills: { Cooking: 1, Fishing: 1, Gaming: 1, Reading: 1 },
  lastFed: new Date().toISOString(), lastPlayed: new Date().toISOString(), lastSlept: new Date().toISOString(),
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
};

export const DEFAULT_MOMO: Panda = {
  id: 'momo',
  name: 'Momo',
  ownerId: 'manvi',
  stats: {
    health: 100, happiness: 90, energy: 85, hunger: 70, hydration: 75,
    cleanliness: 90, fun: 80, comfort: 90, friendship: 50, level: 1, xp: 0, xpNeeded: 100
  },
  currentMood: 'Playful', currentAction: 'Idle', currentRoom: 'Bedroom', personality: 'Lazy',
  birthday: new Date().toISOString(), favoriteFood: 'Strawberry', favoriteToy: 'Teddy', costume: null,
  skills: { Cooking: 1, Fishing: 1, Gaming: 1, Reading: 1 },
  lastFed: new Date().toISOString(), lastPlayed: new Date().toISOString(), lastSlept: new Date().toISOString(),
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
};

export class PandaRepository extends FirebaseRepository<Panda> {
  constructor() {
    super('forever_us_pandas');
    this.initDemoData();
  }

  private async initDemoData() {
    try {
      const items = await this.findAll();
      if (items.length === 0) {
        const demoPandas: Panda[] = [DEFAULT_MOCHI, DEFAULT_MOMO];
        for (const p of demoPandas) {
          const docRef = doc(db, this.collectionName, p.id);
          const { id: _, ...payload } = p as unknown as { id: string };
          await setDoc(docRef, payload);
        }
      }
    } catch (e) {
      console.error('Failed to seed panda data', e);
    }
  }

  async getMochi(): Promise<Panda> {
    try {
      const p = await this.findById('mochi');
      return p || DEFAULT_MOCHI;
    } catch {
      return DEFAULT_MOCHI;
    }
  }

  async getMomo(): Promise<Panda> {
    try {
      const p = await this.findById('momo');
      return p || DEFAULT_MOMO;
    } catch {
      return DEFAULT_MOMO;
    }
  }
}

export const pandaRepo = new PandaRepository();
