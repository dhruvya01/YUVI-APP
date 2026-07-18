import { LocalStorageRepository } from './BaseRepository';
import type { ArcadeStats } from '../types';

export class ArcadeRepository extends LocalStorageRepository<ArcadeStats & { id: string, createdAt: string, updatedAt: string }> {
  constructor() {
    super('forever_us_arcade');
    this.initDemoData();
  }

  private initDemoData() {
    const existing = localStorage.getItem(this.collectionName);
    if (!existing || JSON.parse(existing).length === 0) {
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
      localStorage.setItem(this.collectionName, JSON.stringify(initial));
    }
  }

  async getStats(): Promise<ArcadeStats> {
    const items = await this.findAll();
    return items.find(i => i.id === 'global_arcade_stats') || {
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
