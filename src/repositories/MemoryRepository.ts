import { FirebaseRepository } from './FirebaseRepository';
import type { Memory } from '../types';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export class MemoryRepository extends FirebaseRepository<Memory> {
  constructor() {
    super('forever_us_memories');
    this.initDemoData();
  }

  private async initDemoData() {
    try {
      const items = await this.findAll();
      if (items.length === 0) {
        const now = new Date().toISOString();
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
            createdAt: now,
            updatedAt: now
          }
        ];
        
        for (const m of demoMemories) {
          const docRef = doc(db, this.collectionName, m.id);
          const { id: _, ...payload } = m as unknown as { id: string };
          await setDoc(docRef, payload);
        }
      }
    } catch (e) {
      console.error('Failed to seed memory data', e);
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

export const memoryRepo = new MemoryRepository();
