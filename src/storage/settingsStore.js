// Settings persistence — encrypted settings stored in IndexedDB meta store

import { getDB } from './db';
import { encryptObject, decryptObject } from '../crypto/encryption';

const SETTINGS_KEY = 'settings';

export const DEFAULT_SETTINGS = {
  theme: 'system', // 'light' | 'dark' | 'system'
  autoLockTimeout: 5, // minutes (0 = never)
  clipboardAutoClear: 30, // seconds (0 = off)
  defaultPasswordLength: 16,
  defaultPasswordOptions: {
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
  },
  biometricEnabled: false,
};

/**
 * Save settings (encrypted)
 */
export async function saveSettings(settings, key) {
  const db = await getDB();
  const { ciphertext, iv } = await encryptObject(settings, key);
  await db.put('meta', { ciphertext, iv }, SETTINGS_KEY);
}

/**
 * Load settings (decrypted)
 */
export async function loadSettings(key) {
  const db = await getDB();
  const record = await db.get('meta', SETTINGS_KEY);
  if (!record) return { ...DEFAULT_SETTINGS };

  try {
    const settings = await decryptObject(record.ciphertext, record.iv, key);
    return { ...DEFAULT_SETTINGS, ...settings };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}
