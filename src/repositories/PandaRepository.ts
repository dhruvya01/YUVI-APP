import { LocalStorageRepository } from './BaseRepository';
import type { Panda } from '../types';

export class PandaRepository extends LocalStorageRepository<Panda> {
  constructor() {
    super('forever_us_pandas');
    this.initDemoData();
  }

  private initDemoData() {
    const existing = localStorage.getItem(this.collectionName);
    if (!existing || JSON.parse(existing).length === 0) {
      const now = new Date().toISOString();
      const demoPandas: Panda[] = [
        {
          id: 'mochi',
          name: 'Mochi',
          ownerId: 'yuvi',
          stats: {
            health: 100,
            happiness: 80,
            energy: 90,
            hunger: 70, // lower means hungry
            cleanliness: 100,
            friendship: 50,
            level: 1,
            xp: 0,
            xpNeeded: 100
          },
          currentMood: 'Happy',
          birthday: now,
          favoriteFood: 'Bamboo',
          favoriteToy: 'Ball',
          costume: null,
          lastFed: now,
          lastPlayed: now,
          lastSlept: now,
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'momo',
          name: 'Momo',
          ownerId: 'manvi',
          stats: {
            health: 100,
            happiness: 85,
            energy: 85,
            hunger: 60,
            cleanliness: 90,
            friendship: 50,
            level: 1,
            xp: 0,
            xpNeeded: 100
          },
          currentMood: 'Playful',
          birthday: now,
          favoriteFood: 'Strawberry',
          favoriteToy: 'Teddy',
          costume: null,
          lastFed: now,
          lastPlayed: now,
          lastSlept: now,
          createdAt: now,
          updatedAt: now
        }
      ];
      localStorage.setItem(this.collectionName, JSON.stringify(demoPandas));
    }
  }

  async getMochi(): Promise<Panda> {
    const items = await this.findAll();
    return items.find(p => p.id === 'mochi')!;
  }

  async getMomo(): Promise<Panda> {
    const items = await this.findAll();
    return items.find(p => p.id === 'momo')!;
  }
}

export const pandaRepo = new PandaRepository();
