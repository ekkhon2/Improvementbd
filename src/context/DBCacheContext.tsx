import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/src/lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  Query, 
  DocumentReference, 
  onSnapshot,
  getDocsFromCache,
  getDocFromCache
} from 'firebase/firestore';

// Multi-tab safe unique storage namespace
const CACHE_KEY_PREFIX = 'ibd_firestore_cache_v1_';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

interface DBCacheContextType {
  // Generic collection fetch with caching and background updates
  getCachedCollection: <T>(
    colName: string, 
    queryObject: Query, 
    ttlMs?: number,
    forceRefresh?: boolean
  ) => Promise<T[]>;
  
  // Generic single document fetch with caching and background updates
  getCachedDoc: <T>(
    docPath: string, 
    ttlMs?: number,
    forceRefresh?: boolean
  ) => Promise<T | null>;

  // Clear cache for a specific collection or everything
  invalidateCache: (key: string) => void;
  invalidateAllCaches: () => void;

  // Optimistic UI / Direct update of cache so user changes reflect instantly
  updateCacheDirectly: <T>(key: string, data: T) => void;
}

const DBCacheContext = createContext<DBCacheContextType | undefined>(undefined);

// Helper to check if cache is valid matching TTL
function isCacheValid(timestamp: number, ttlMs: number): boolean {
  return Date.now() - timestamp < ttlMs;
}

// Safely get item from localStorage with in-memory fallback
const memoryCache: Record<string, CacheItem<any>> = {};

function safeGetCache<T>(key: string): CacheItem<T> | null {
  try {
    // Try Memory first for ultra-fast access
    if (memoryCache[key]) {
      return memoryCache[key];
    }
    const stored = localStorage.getItem(CACHE_KEY_PREFIX + key);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as CacheItem<T>;
    // Populate memory cache
    memoryCache[key] = parsed;
    return parsed;
  } catch (e) {
    console.warn('LocalStorage reads bypassed:', e);
    return memoryCache[key] || null;
  }
}

function safeSetCache<T>(key: string, data: T) {
  const item: CacheItem<T> = {
    data,
    timestamp: Date.now()
  };
  memoryCache[key] = item;
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(item));
    // Trigger storage event to sync other tabs if needed
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.warn('LocalStorage writing bypassed:', e);
  }
}

function safeRemoveCache(key: string) {
  delete memoryCache[key];
  try {
    localStorage.removeItem(CACHE_KEY_PREFIX + key);
  } catch (e) {
    // ignore
  }
}

export function DBCacheProvider({ children }: { children: React.ReactNode }) {
  // Clear caches older than 24 hours to prevent stale accumulation
  useEffect(() => {
    try {
      const keys = Object.keys(localStorage);
      const currentTime = Date.now();
      keys.forEach(k => {
        if (k.startsWith(CACHE_KEY_PREFIX)) {
          const item = localStorage.getItem(k);
          if (item) {
            const parsed = JSON.parse(item);
            if (currentTime - parsed.timestamp > 24 * 60 * 60 * 1000) {
              localStorage.removeItem(k);
            }
          }
        }
      });
    } catch (e) {
      // ignore
    }
  }, []);

  const getCachedCollection = async <T extends unknown>(
    colName: string, 
    queryObject: Query, 
    ttlMs: number = 5 * 60 * 1000, // Default 5 mins TTL
    forceRefresh: boolean = false
  ): Promise<T[]> => {
    const cacheKey = `col_${colName}_${queryObject.toString ? queryObject.toString() : ''}`;
    const cached = safeGetCache<T[]>(cacheKey);

    if (cached && isCacheValid(cached.timestamp, ttlMs) && !forceRefresh) {
      // Return cached immediately, and optionally refresh in the background if within 80% of TTL expiry
      const isStaleSoon = (Date.now() - cached.timestamp) > (ttlMs * 0.8);
      if (isStaleSoon) {
        // Silent background sync
        getDocs(queryObject).then(snap => {
          const freshData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any as T[];
          safeSetCache(cacheKey, freshData);
        }).catch(() => {});
      }
      return cached.data;
    }

    // Try fetching from local SDK cache first (saves network completely)
    try {
      if (!forceRefresh) {
        const localSnap = await getDocsFromCache(queryObject);
        if (localSnap && !localSnap.empty) {
          const localData = localSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any as T[];
          // Set cache and spin up asynchronous background sync to fetch updates
          safeSetCache(cacheKey, localData);
          getDocs(queryObject).then(freshSnap => {
            const serverData = freshSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any as T[];
            safeSetCache(cacheKey, serverData);
          }).catch(() => {});
          return localData;
        }
      }
    } catch (e) {
      // Offline/cache read fail, continue to network fetch
    }

    // Network fetch
    try {
      const snap = await getDocs(queryObject);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any as T[];
      safeSetCache(cacheKey, data);
      return data;
    } catch (error) {
      console.warn(`Firestore read failed for ${colName}, fallback to cache or empty list:`, error);
      return cached ? cached.data : [];
    }
  };

  const getCachedDoc = async <T extends unknown>(
    docPath: string, 
    ttlMs: number = 3 * 60 * 1000, // Default 3 mins for single docs
    forceRefresh: boolean = false
  ): Promise<T | null> => {
    const cacheKey = `doc_${docPath}`;
    const cached = safeGetCache<T>(cacheKey);

    if (cached && isCacheValid(cached.timestamp, ttlMs) && !forceRefresh) {
      return cached.data;
    }

    // Try SDK offline cache first
    try {
      if (!forceRefresh) {
        const parts = docPath.split('/');
        if (parts.length >= 2) {
          const docRef = doc(db, parts[0], parts.slice(1).join('/'));
          const cachedSnap = await getDocFromCache(docRef);
          if (cachedSnap.exists()) {
            const data = { id: cachedSnap.id, ...cachedSnap.data() } as any as T;
            safeSetCache(cacheKey, data);
            
            // Background refresh
            getDoc(docRef).then(freshSnap => {
              if (freshSnap.exists()) {
                safeSetCache(cacheKey, { id: freshSnap.id, ...freshSnap.data() } as any as T);
              }
            }).catch(() => {});
            return data;
          }
        }
      }
    } catch (e) {
      // continue to network
    }

    // Network fetch
    try {
      const parts = docPath.split('/');
      if (parts.length < 2) return null;
      const docRef = doc(db, parts[0], parts.slice(1).join('/'));
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() } as any as T;
        safeSetCache(cacheKey, data);
        return data;
      }
      return null;
    } catch (error) {
      console.warn(`Firestore getDoc failed for ${docPath}, fallback to cache:`, error);
      return cached ? cached.data : null;
    }
  };

  const invalidateCache = (key: string) => {
    // Remove individual entry
    safeRemoveCache(key);
    // Scan all keys matching prefixes
    try {
      const prefix = CACHE_KEY_PREFIX + key;
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith(prefix) || k.includes(`col_${key}`) || k.includes(`doc_${key}`)) {
          localStorage.removeItem(k);
        }
      });
      // also clear memory
      Object.keys(memoryCache).forEach(k => {
        if (k.startsWith(key) || k.includes(`col_${key}`) || k.includes(`doc_${key}`)) {
          delete memoryCache[k];
        }
      });
    } catch (e) {
      // ignore
    }
  };

  const invalidateAllCaches = () => {
    try {
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith(CACHE_KEY_PREFIX)) {
          localStorage.removeItem(k);
        }
      });
      Object.keys(memoryCache).forEach(k => {
        delete memoryCache[k];
      });
    } catch (e) {
      // ignore
    }
  };

  const updateCacheDirectly = <T extends unknown>(key: string, data: T) => {
    safeSetCache(key, data);
  };

  return (
    <DBCacheContext.Provider value={{
      getCachedCollection,
      getCachedDoc,
      invalidateCache,
      invalidateAllCaches,
      updateCacheDirectly
    }}>
      {children}
    </DBCacheContext.Provider>
  );
}

export function useDBCache() {
  const context = useContext(DBCacheContext);
  if (context === undefined) {
    throw new Error('useDBCache must be used within a DBCacheProvider');
  }
  return context;
}
