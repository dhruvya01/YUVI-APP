export interface Memory {
  id: string;
  title: string;
  date: string; // ISO String
  description: string;
  photos: string[];
  tags: string[];
  location?: string;
  weather?: string;
  mood?: string;
  favorite: boolean;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface Profile {
  id: string;
  name: string;
  nickname: string;
  birthday: string;
  color: string;
  food: string;
  song: string;
  movie: string;
  quote: string;
  traits: string;
  loveLanguage: string;
  hobbies: string;
  dreamDest: string;
  mood: string;
  status: 'Online' | 'Offline' | 'Busy';
  avatar: string;
  themePreference: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  text: string;
  senderId: string; // 'yuvi' | 'manvi' | 'cupid'
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'voice' | 'sticker';
  attachmentUrl?: string;
}

export interface Task {
  id: string;
  title: string;
  assigneeId: string; // 'yuvi' | 'manvi' | 'both'
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  completed: boolean;
  category: string;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  title: string;
  price?: number;
  priority: 'low' | 'medium' | 'high';
  purchased: boolean;
  favorite: boolean;
  image?: string;
  notes?: string;
  createdAt: string;
}

export interface Settings {
  theme: string;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  blurIntensity: number;
}
