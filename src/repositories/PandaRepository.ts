import { FirebaseRepository } from './FirebaseRepository';
import type { Panda } from '../types';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export class PandaRepository extends FirebaseRepository<Panda> {
  constructor() {
    super('forever_us_pandas');
    this.initDemoData();
  }

  private async initDemoData() {
    try {
      const items = await this.findAll();
      if (items.length === 0) {
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
              hunger: 70,
              hydration: 80,
              cleanliness: 100,
              fun: 75,
              comfort: 85,
              friendship: 50,
              level: 1,
              xp: 0,
              xpNeeded: 100
            },
            currentMood: 'Happy',
            currentAction: 'Idle',
            currentRoom: 'Bedroom',
            personality: 'Energetic',
            birthday: now,
            favoriteFood: 'Bamboo',
            favoriteToy: 'Ball',
            costume: null,
            skills: {
              Cooking: 1,
              Fishing: 1,
              Gaming: 1,
              Reading: 1
            },
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
              hydration: 75,
              cleanliness: 90,
              fun: 80,
              comfort: 90,
              friendship: 50,
              level: 1,
              xp: 0,
              xpNeeded: 100
            },
            currentMood: 'Playful',
            currentAction: 'Idle',
            currentRoom: 'Bedroom',
            personality: 'Lazy',
            birthday: now,
            favoriteFood: 'Strawberry',
            favoriteToy: 'Teddy',
            costume: null,
            skills: {
              Cooking: 1,
              Fishing: 1,
              Gaming: 1,
              Reading: 1
            },
            lastFed: now,
            lastPlayed: now,
            lastSlept: now,
            createdAt: now,
            updatedAt: now
          }
        ];
        
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
    let p = await this.findById('mochi');
    if (!p) {
      await this.initDemoData();
      p = await this.findById('mochi');
    }
    return p!;
  }

  async getMomo(): Promise<Panda> {
    let p = await this.findById('momo');
    if (!p) {
      await this.initDemoData();
      p = await this.findById('momo');
    }
    return p!;
  }
}

export const pandaRepo = new PandaRepository();
