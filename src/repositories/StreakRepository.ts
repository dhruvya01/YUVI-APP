import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export interface LoveStreak {
  streakCount: number;
  lastYuviDate: string; // YYYY-MM-DD
  lastManviDate: string; // YYYY-MM-DD
  lastStreakDate: string; // YYYY-MM-DD
}

const DEFAULT_STREAK: LoveStreak = {
  streakCount: 1,
  lastYuviDate: '',
  lastManviDate: '',
  lastStreakDate: ''
};

export class StreakRepository {
  private docRef = doc(db, 'forever_us_streak', 'current_streak');

  private getTodayStr(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getYesterdayStr(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }

  async getStreak(): Promise<LoveStreak> {
    try {
      const snap = await getDoc(this.docRef);
      if (snap.exists()) {
        const data = snap.data() as LoveStreak;
        return this.validateStreak(data);
      }
    } catch (e) {
      console.error('Error reading streak:', e);
    }
    return DEFAULT_STREAK;
  }

  subscribeToStreak(callback: (streak: LoveStreak) => void) {
    return onSnapshot(this.docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as LoveStreak;
        callback(this.validateStreak(data));
      } else {
        callback(DEFAULT_STREAK);
      }
    });
  }

  private validateStreak(streak: LoveStreak): LoveStreak {
    const yesterday = this.getYesterdayStr();

    // If last streak date was older than yesterday, streak broke!
    if (streak.lastStreakDate && streak.lastStreakDate < yesterday) {
      return {
        ...streak,
        streakCount: 0
      };
    }
    return streak;
  }

  async recordILoveYou(sender: 'yuvi' | 'manvi'): Promise<LoveStreak> {
    const current = await this.getStreak();
    const today = this.getTodayStr();
    const yesterday = this.getYesterdayStr();

    let updated = { ...current };

    if (sender === 'yuvi') {
      updated.lastYuviDate = today;
    } else {
      updated.lastManviDate = today;
    }

    // Check if both said I Love You today
    if (updated.lastYuviDate === today && updated.lastManviDate === today) {
      if (updated.lastStreakDate !== today) {
        if (updated.lastStreakDate === yesterday) {
          updated.streakCount += 1;
        } else {
          updated.streakCount = 1; // Fresh streak started
        }
        updated.lastStreakDate = today;
      }
    }

    await setDoc(this.docRef, updated, { merge: true });
    return updated;
  }
}

export const streakRepo = new StreakRepository();
