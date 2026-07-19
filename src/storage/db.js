// IndexedDB setup using idb wrapper

import { openDB } from 'idb';

const DB_NAME = 'vaultsoft';
const DB_VERSION = 1;

/**
 * Initialize and return the IndexedDB database
 */
export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Store for vault metadata (salt, auth hash, settings)
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta');
      }

      // Store for encrypted vault entries
      if (!db.objectStoreNames.contains('entries')) {
        const entryStore = db.createObjectStore('entries', { keyPath: 'id' });
        entryStore.createIndex('updatedAt', 'updatedAt');
      }
    },
  });
}

/**
 * Clear all data from the database
 */
export async function clearAllData() {
  const db = await getDB();
  const tx = db.transaction(['meta', 'entries'], 'readwrite');
  await tx.objectStore('meta').clear();
  await tx.objectStore('entries').clear();
  await tx.done;
}
