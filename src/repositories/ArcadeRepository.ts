import { FirebaseRepository } from './FirebaseRepository';
import type { ArcadeStats } from '../types';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export class ArcadeRepository extends FirebaseRepository<ArcadeStats & { id: string, createdAt: string, updatedAt: string }> {
  constructor() {
    super('forever_us_arcade');
    this.initDemoData();
  }

  private async initDemoData() {
    try {
      const items = await this.findAll();
      if (items.length === 0) {
        const now = new Date().toISOString();
        const initial: (ArcadeStats & { id: string, createdAt: string, updatedAt: string })[] = [
          {
            id: 'global_arcade_stats',
            coins: 100,
            hearts: 50,
            streak: 1,
            highScores: {
              'catch-bamboo': 0,
              'bubble-pop': 0
            },
            createdAt: now,
            updatedAt: now
          }
        ];
        
        for (const i of initial) {
          const docRef = doc(db, this.collectionName, i.id);
          const { id: _, ...payload } = i as unknown as { id: string };
          await setDoc(docRef, payload);
        }
      }
    } catch (e) {
      console.error('Failed to seed arcade data', e);
    }
  }

  async getStats(): Promise<ArcadeStats> {
    let stats = await this.findById('global_arcade_stats');
    if (!stats) {
      await this.initDemoData();
      stats = await this.findById('global_arcade_stats');
    }
    return stats || {
      coins: 100,
      hearts: 50,
      streak: 1,
      highScores: {}
    };
  }

  async saveStats(stats: ArcadeStats): Promise<void> {
    const now = new Date().toISOString();
    await this.update('global_arcade_stats', {
      ...stats,
      updatedAt: now
    });
  }
}

export const arcadeRepo = new ArcadeRepository();
