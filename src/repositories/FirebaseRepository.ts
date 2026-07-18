import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc
} from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { db } from '../firebase';
import type { IRepository } from './BaseRepository';

export class FirebaseRepository<T extends { id: string; createdAt: string; updatedAt: string }> implements IRepository<T> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  async findAll(): Promise<T[]> {
    const colRef = collection(db, this.collectionName);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data() as DocumentData;
      return {
        id: docSnapshot.id,
        ...data
      } as T;
    });
  }

  async findById(id: string): Promise<T | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnapshot = await getDoc(docRef);
    if (!docSnapshot.exists()) return null;
    return {
      id: docSnapshot.id,
      ...docSnapshot.data()
    } as T;
  }

  async create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const docId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
    const docRef = doc(db, this.collectionName, docId);
    const now = new Date().toISOString();
    
    const newItem = {
      ...item,
      id: docId,
      createdAt: now,
      updatedAt: now
    } as unknown as T;

    // Remove id from the document payload to avoid duplicates in document fields
    const { id: _, ...payload } = newItem as unknown as { id: string };

    await setDoc(docRef, payload);
    return newItem;
  }

  async update(id: string, updates: Partial<T>): Promise<T> {
    const docRef = doc(db, this.collectionName, id);
    const now = new Date().toISOString();
    const cleanUpdates = { ...updates, updatedAt: now };
    
    // Ensure we don't try to write the id field back
    delete (cleanUpdates as unknown as { id?: string }).id;

    await updateDoc(docRef, cleanUpdates as DocumentData);
    
    const updatedDoc = await this.findById(id);
    if (!updatedDoc) {
      throw new Error(`Failed to retrieve updated document ${id}`);
    }
    return updatedDoc;
  }

  async delete(id: string): Promise<boolean> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
    return true;
  }
}
