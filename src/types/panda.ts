export type PandaMood = 'Happy' | 'Excited' | 'Hungry' | 'Sleepy' | 'Sad' | 'Love' | 'Playful' | 'Angry' | 'Curious' | 'Relaxed';

export type PandaAction = 'Idle' | 'Walking' | 'Sleeping' | 'Eating' | 'Drinking' | 'Dancing' | 'Reading' | 'Cooking' | 'Watering' | 'Playing';

export type PandaRoom = 'Bedroom' | 'Kitchen' | 'Living Room' | 'Garden';

export interface PandaStats {
  health: number; // 0-100
  happiness: number; // 0-100
  energy: number; // 0-100
  hunger: number; // 0-100
  hydration: number; // 0-100
  cleanliness: number; // 0-100
  fun: number; // 0-100
  comfort: number; // 0-100
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
  currentAction: PandaAction;
  currentRoom: PandaRoom;
  personality: string;
  birthday: string;
  favoriteFood: string;
  favoriteToy: string;
  costume: string | null;
  skills: Record<string, number>; // Cooking, Fishing, etc.
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

export interface ArcadeStats {
  coins: number;
  hearts: number;
  streak: number;
  highScores: Record<string, number>;
  lastPlayedDate?: string;
}

export interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  text: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'food' | 'furniture' | 'costume';
  icon: string;
  quantity: number;
  effect?: string; // description of effect
}
