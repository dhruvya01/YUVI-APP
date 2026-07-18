import { FirebaseRepository } from './FirebaseRepository';
import type { DiaryEntry } from '../types';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export class DiaryRepository extends FirebaseRepository<DiaryEntry> {
  constructor() {
    super('forever_us_panda_diary');
    this.initDemoData();
  }

  private async initDemoData() {
    try {
      const items = await this.findAll();
      if (items.length === 0) {
        const now = new Date().toISOString();
        const initial: DiaryEntry[] = [
          {
            id: 'initial_entry',
            date: new Date().toISOString().split('T')[0],
            text: 'Mochi and Momo moved into their new Panda House! They are excited to explore the rooms and garden.',
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
      console.error('Failed to seed diary data', e);
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
