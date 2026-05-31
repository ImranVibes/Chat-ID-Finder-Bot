interface CacheEntry {
  json: string;
  photoFileId?: string;
}

class CacheManager {
  private cache = new Map<string, CacheEntry>();

  /**
   * Saves a raw payload and an optional photo file ID.
   * Returns a unique 8-character cache ID.
   */
  public save(jsonObj: any, photoFileId?: string): string {
    const id = Math.random().toString(36).substring(2, 10);
    this.cache.set(id, {
      json: JSON.stringify(jsonObj, null, 2),
      photoFileId
    });
    // Set a timeout to clean up after 1 hour to prevent memory leaks
    setTimeout(() => this.cache.delete(id), 60 * 60 * 1000);
    return id;
  }

  /**
   * Retrieves a cache entry by its ID.
   */
  public get(id: string): CacheEntry | undefined {
    return this.cache.get(id);
  }
}

export const botCache = new CacheManager();
