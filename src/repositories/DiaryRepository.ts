import { LocalStorageRepository } from './BaseRepository';
import type { DiaryEntry } from '../types';

export class DiaryRepository extends LocalStorageRepository<DiaryEntry & { id: string, createdAt: string, updatedAt: string }> {
  constructor() {
    super('forever_us_panda_diary');
    this.initDemoData();
  }

  private initDemoData() {
    const existing = localStorage.getItem(this.collectionName);
    if (!existing || JSON.parse(existing).length === 0) {
      const now = new Date().toISOString();
      const initial: (DiaryEntry & { id: string, createdAt: string, updatedAt: string })[] = [
        {
          id: 'initial_entry',
          date: new Date().toISOString().split('T')[0],
          text: 'Mochi and Momo moved into their new Panda House! They are excited to explore the rooms and garden.',
          createdAt: now,
          updatedAt: now
        }
      ];
      localStorage.setItem(this.collectionName, JSON.stringify(initial));
    }
  }

  async addLog(text: string): Promise<DiaryEntry> {
    const now = new Date().toISOString();
    return this.create({
      date: now.split('T')[0],
      text
    });
  }
}

export const diaryRepo = new DiaryRepository();
