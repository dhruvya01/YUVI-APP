import { LocalStorageRepository } from './BaseRepository';
import type { Memory } from '../types';

export class MemoryRepository extends LocalStorageRepository<Memory> {
  constructor() {
    super('forever_us_memories');
    // Pre-populate with demo data if empty
    this.initDemoData();
  }

  private initDemoData() {
    const existing = localStorage.getItem(this.collectionName);
    if (!existing || JSON.parse(existing).length === 0) {
      const demoMemories: Memory[] = [
        {
          id: '1',
          title: 'The Day We Met',
          date: '2025-12-02T10:00:00Z',
          description: 'The start of our forever.',
          photos: [],
          tags: ['milestone', 'love'],
          favorite: true,
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(this.collectionName, JSON.stringify(demoMemories));
    }
  }

  async findFavorites(): Promise<Memory[]> {
    const items = await this.findAll();
    return items.filter(m => m.favorite);
  }

  async findByYear(year: string): Promise<Memory[]> {
    const items = await this.findAll();
    return items.filter(m => m.date.startsWith(year));
  }
}

// Export singleton instance
export const memoryRepo = new MemoryRepository();
