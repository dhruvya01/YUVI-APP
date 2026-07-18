import { FirebaseRepository } from './FirebaseRepository';
import type { InventoryItem } from '../types';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export class InventoryRepository extends FirebaseRepository<InventoryItem> {
  constructor() {
    super('forever_us_panda_inventory');
    this.initDemoData();
  }

  private async initDemoData() {
    try {
      const items = await this.findAll();
      if (items.length === 0) {
        const now = new Date().toISOString();
        const initial: InventoryItem[] = [
          {
            id: 'food_bamboo',
            name: 'Bamboo',
            type: 'food',
            icon: '🎋',
            quantity: 5,
            effect: '+15 Hunger',
            createdAt: now,
            updatedAt: now
          },
          {
            id: 'food_strawberry',
            name: 'Strawberry',
            type: 'food',
            icon: '🍓',
            quantity: 2,
            effect: '+20 Hunger, +10 Happiness',
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
      console.error('Failed to seed inventory data', e);
    }
  }

  async addItem(item: Omit<InventoryItem, 'quantity' | 'createdAt' | 'updatedAt'> & { quantity: number }): Promise<void> {
    const items = await this.findAll();
    const existing = items.find(i => i.id === item.id);
    if (existing) {
      await this.update(existing.id, { quantity: existing.quantity + item.quantity });
    } else {
      const docRef = doc(db, this.collectionName, item.id);
      const now = new Date().toISOString();
      const newItem = {
        ...item,
        createdAt: now,
        updatedAt: now
      };
      const { id: _, ...payload } = newItem as unknown as { id: string };
      await setDoc(docRef, payload);
    }
  }

  async useItem(itemId: string): Promise<boolean> {
    const items = await this.findAll();
    const existing = items.find(i => i.id === itemId);
    if (existing && existing.quantity > 0) {
      if (existing.quantity === 1) {
        await this.delete(existing.id);
      } else {
        await this.update(existing.id, { quantity: existing.quantity - 1 });
      }
      return true;
    }
    return false;
  }
}

export const inventoryRepo = new InventoryRepository();
