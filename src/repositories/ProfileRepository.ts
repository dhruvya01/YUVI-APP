import { FirebaseRepository } from './FirebaseRepository';
import type { Profile } from '../types';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export class ProfileRepository extends FirebaseRepository<Profile> {
  constructor() {
    super('forever_us_profiles');
    this.initDemoData();
  }

  private async initDemoData() {
    try {
      const items = await this.findAll();
      if (items.length === 0) {
        const now = new Date().toISOString();
        const demoProfiles: Profile[] = [
          {
            id: 'yuvi',
            name: 'Yuvi',
            nickname: 'Yuv',
            birthday: 'January 1, 2000',
            color: 'Blue',
            food: 'Pizza',
            song: 'Perfect - Ed Sheeran',
            movie: 'Inception',
            quote: '"To infinity and beyond."',
            traits: 'Funny, Caring, Loyal',
            loveLanguage: 'Quality Time',
            hobbies: 'Gaming, Coding, Photography',
            dreamDest: 'Tokyo, Japan',
            mood: '😊 Happy',
            status: 'Online',
            avatar: 'Y',
            themePreference: 'default',
            createdAt: now,
            updatedAt: now
          },
          {
            id: 'manvi',
            name: 'Manvi',
            nickname: 'Manu',
            birthday: 'February 14, 2000',
            color: 'Pink',
            food: 'Pasta',
            song: 'A Thousand Years',
            movie: 'The Notebook',
            quote: '"Love is in the air."',
            traits: 'Sweet, Creative, Passionate',
            loveLanguage: 'Words of Affirmation',
            hobbies: 'Painting, Reading, Travel',
            dreamDest: 'Paris, France',
            mood: '🥰 Loved',
            status: 'Online',
            avatar: 'M',
            themePreference: 'default',
            createdAt: now,
            updatedAt: now
          }
        ];
        
        for (const p of demoProfiles) {
          const docRef = doc(db, this.collectionName, p.id);
          const { id: _, ...payload } = p as unknown as { id: string };
          await setDoc(docRef, payload);
        }
      }
    } catch (e) {
      console.error('Failed to init profile data', e);
    }
  }

  async getYuvi(): Promise<Profile> {
    let p = await this.findById('yuvi');
    if (!p) {
      await this.initDemoData();
      p = await this.findById('yuvi');
    }
    return p!;
  }

  async getManvi(): Promise<Profile> {
    let p = await this.findById('manvi');
    if (!p) {
      await this.initDemoData();
      p = await this.findById('manvi');
    }
    return p!;
  }
}

export const profileRepo = new ProfileRepository();
