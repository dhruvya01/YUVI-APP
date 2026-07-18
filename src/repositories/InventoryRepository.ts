import { LocalStorageRepository } from './BaseRepository';
import type { InventoryItem } from '../types';

export class InventoryRepository extends LocalStorageRepository<InventoryItem & { id: string, createdAt: string, updatedAt: string }> {
  constructor() {
    super('forever_us_panda_inventory');
    this.initDemoData();
  }

  private initDemoData() {
    const existing = localStorage.getItem(this.collectionName);
    if (!existing || JSON.parse(existing).length === 0) {
      const now = new Date().toISOString();
      const initial: (InventoryItem & { id: string, createdAt: string, updatedAt: string })[] = [
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
      localStorage.setItem(this.collectionName, JSON.stringify(initial));
    }
  }

  async addItem(item: Omit<InventoryItem, 'quantity'> & { quantity: number }): Promise<void> {
    const items = await this.findAll();
    const existing = items.find(i => i.id === item.id);
    if (existing) {
      await this.update(existing.id, { quantity: existing.quantity + item.quantity });
    } else {
      await this.create({
        ...item
      });
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
