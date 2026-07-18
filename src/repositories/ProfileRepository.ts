import { LocalStorageRepository } from './BaseRepository';
import type { Profile } from '../types';

export class ProfileRepository extends LocalStorageRepository<Profile> {
  constructor() {
    super('forever_us_profiles');
    this.initDemoData();
  }

  private initDemoData() {
    const existing = localStorage.getItem(this.collectionName);
    if (!existing || JSON.parse(existing).length === 0) {
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
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
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
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(this.collectionName, JSON.stringify(demoProfiles));
    }
  }

  async getYuvi(): Promise<Profile> {
    const items = await this.findAll();
    return items.find(p => p.id === 'yuvi')!;
  }

  async getManvi(): Promise<Profile> {
    const items = await this.findAll();
    return items.find(p => p.id === 'manvi')!;
  }
}

export const profileRepo = new ProfileRepository();
