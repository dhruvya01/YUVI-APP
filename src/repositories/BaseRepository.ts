export interface IRepository<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
}

/**
 * Base generic repository for LocalStorage simulation.
 * All methods are async to simulate network latency, making it 
 * easy to swap this out for Firebase/Supabase later without changing UI code.
 */
export class LocalStorageRepository<T extends { id: string; createdAt: string; updatedAt: string }> implements IRepository<T> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected simulateNetworkDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100)); // 100-400ms delay
  }

  protected getItems(): T[] {
    const data = localStorage.getItem(this.collectionName);
    return data ? JSON.parse(data) : [];
  }

  protected saveItems(items: T[]): void {
    localStorage.setItem(this.collectionName, JSON.stringify(items));
  }

  async findAll(): Promise<T[]> {
    await this.simulateNetworkDelay();
    return this.getItems();
  }

  async findById(id: string): Promise<T | null> {
    await this.simulateNetworkDelay();
    const items = this.getItems();
    return items.find((item: T) => item.id === id) || null;
  }

  async create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    await this.simulateNetworkDelay();
    const items = this.getItems();
    const now = new Date().toISOString();
    
    const newItem = {
      ...item,
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    } as unknown as T;

    items.push(newItem);
    this.saveItems(items);
    return newItem;
  }

  async update(id: string, updates: Partial<T>): Promise<T> {
    await this.simulateNetworkDelay();
    const items = this.getItems();
    const index = items.findIndex((item: T) => item.id === id);
    
    if (index === -1) {
      throw new Error(`Item with id ${id} not found in ${this.collectionName}`);
    }

    const updatedItem = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    items[index] = updatedItem;
    this.saveItems(items);
    return updatedItem;
  }

  async delete(id: string): Promise<boolean> {
    await this.simulateNetworkDelay();
    const items = this.getItems();
    const initialLength = items.length;
    const filteredItems = items.filter((item: T) => item.id !== id);
    
    if (initialLength === filteredItems.length) {
      return false; // Nothing deleted
    }

    this.saveItems(filteredItems);
    return true;
  }
}
