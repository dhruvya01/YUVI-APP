export type PandaMood = 'Happy' | 'Excited' | 'Hungry' | 'Sleepy' | 'Sad' | 'Love' | 'Playful' | 'Angry' | 'Curious' | 'Relaxed';

export interface PandaStats {
  health: number; // 0-100
  happiness: number; // 0-100
  energy: number; // 0-100
  hunger: number; // 0-100
  cleanliness: number; // 0-100
  friendship: number; // 0-100
  level: number;
  xp: number;
  xpNeeded: number;
}

export interface Panda {
  id: string; // 'mochi' | 'momo'
  name: string;
  ownerId: string; // 'yuvi' | 'manvi'
  stats: PandaStats;
  currentMood: PandaMood;
  birthday: string;
  favoriteFood: string;
  favoriteToy: string;
  costume: string | null;
  lastFed: string; // ISO String
  lastPlayed: string;
  lastSlept: string;
  createdAt: string;
  updatedAt: string;
}

export interface PandaWidgetState {
  isMinimized: boolean;
  position: { x: number; y: number };
}
