import { ChromaClient, Collection } from 'chromadb';
import path from 'path';
import fs from 'fs';

const MEMORY_DIR = path.join(process.cwd(), 'data', 'memory');

// Ensure the memory directory exists
if (!fs.existsSync(MEMORY_DIR)) {
  fs.mkdirSync(MEMORY_DIR, { recursive: true });
}

// Interface for memory entry
export interface MemoryEntry {
  id: string;
  text: string;
  metadata: {
    timestamp: string;
    speaker: 'user' | 'companion';
    companionId: number;
    userId: number;
    importance?: number;
  };
}

class MemoryService {
  private client: ChromaClient;
  private collections: Map<string, Collection>;
  
  constructor() {
    this.client = new ChromaClient();
    this.collections = new Map();
  }

  /**
   * Initialize a collection for a specific user-companion pair
   */
  private async getCollection(userId: number, companionId: number, sessionId?: string): Promise<Collection> {
    // Use session ID for guests to ensure isolation
    const collectionName = sessionId && userId === 999999 
      ? `memory_guest_${sessionId}_${companionId}` 
      : `memory_${userId}_${companionId}`;
    
    if (this.collections.has(collectionName)) {
      return this.collections.get(collectionName)!;
    }
    
    try {
      // Try to get the collection if it exists
      const collection = await this.client.getCollection({
        name: collectionName
      });
      this.collections.set(collectionName, collection);
      return collection;
    } catch (error) {
      // Create a new collection if it doesn't exist
      const collection = await this.client.createCollection({
        name: collectionName,
        metadata: { userId, companionId }
      });
      this.collections.set(collectionName, collection);
      return collection;
    }
  }

  /**
   * Add a memory entry to the database
   */
  async addMemory(memory: Omit<MemoryEntry, 'id'>): Promise<string> {
    const { text, metadata } = memory;
    const { userId, companionId } = metadata;
    
    // Generate a unique ID
    const id = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const collection = await this.getCollection(userId, companionId);
    
    // Add the entry to the collection
    await collection.add({
      ids: [id],
      metadatas: [metadata],
      documents: [text]
    });
    
    return id;
  }

  /**
   * Query for relevant memories based on current context
   */
  async queryMemories(
    userId: number,
    companionId: number,
    query: string,
    limit: number = 5
  ): Promise<MemoryEntry[]> {
    const collection = await this.getCollection(userId, companionId);
    
    // Perform semantic search
    const results = await collection.query({
      queryTexts: [query],
      nResults: limit
    });
    
    if (!results || !results.ids || results.ids.length === 0 || !results.ids[0]?.length) {
      return [];
    }
    
    // Format results into memory entries
    const memories: MemoryEntry[] = [];
    for (let i = 0; i < results.ids[0].length; i++) {
      memories.push({
        id: results.ids[0][i],
        text: results.documents?.[0]?.[i] || '',
        metadata: results.metadatas?.[0]?.[i] as MemoryEntry['metadata']
      });
    }
    
    return memories;
  }

  /**
   * Get all memories for a user-companion pair
   */
  async getAllMemories(userId: number, companionId: number): Promise<MemoryEntry[]> {
    try {
      const collection = await this.getCollection(userId, companionId);
      
      // Get all entries
      const results = await collection.get();
      
      if (!results || !results.ids || results.ids.length === 0) {
        return [];
      }
      
      // Format results into memory entries
      const memories: MemoryEntry[] = [];
      for (let i = 0; i < results.ids.length; i++) {
        memories.push({
          id: results.ids[i],
          text: results.documents?.[i] || '',
          metadata: results.metadatas?.[i] as MemoryEntry['metadata']
        });
      }
      
      // Sort by timestamp (newest first)
      memories.sort((a, b) => {
        return new Date(b.metadata.timestamp).getTime() - new Date(a.metadata.timestamp).getTime();
      });
      
      return memories;
    } catch (error) {
      console.error('Error getting memories:', error);
      return [];
    }
  }

  /**
   * Delete a specific memory entry
   */
  async deleteMemory(userId: number, companionId: number, memoryId: string): Promise<boolean> {
    try {
      const collection = await this.getCollection(userId, companionId);
      await collection.delete({ ids: [memoryId] });
      return true;
    } catch (error) {
      console.error('Error deleting memory:', error);
      return false;
    }
  }

  /**
   * Clear all memories for a user-companion pair
   */
  async clearAllMemories(userId: number, companionId: number): Promise<boolean> {
    try {
      const collection = await this.getCollection(userId, companionId);
      await collection.delete();
      this.collections.delete(`memory_${userId}_${companionId}`);
      return true;
    } catch (error) {
      console.error('Error clearing memories:', error);
      return false;
    }
  }
}

// Create a singleton instance
export const memoryService = new MemoryService();
