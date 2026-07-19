// Vault CRUD operations — all data stored as encrypted blobs in IndexedDB

import { getDB } from './db';
import { encryptObject, decryptObject } from '../crypto/encryption';
import { generateId } from '../crypto/utils';

/**
 * Add a new vault entry
 * @param {Object} entryData - Plain entry data
 * @param {CryptoKey} key - Encryption key
 * @returns {Promise<string>} The new entry ID
 */
export async function addEntry(entryData, key) {
  const db = await getDB();
  const id = generateId();
  const now = Date.now();

  const plainEntry = {
    ...entryData,
    id,
    createdAt: now,
    updatedAt: now,
    passwordLastChanged: now,
  };

  const { ciphertext, iv } = await encryptObject(plainEntry, key);

  await db.put('entries', {
    id,
    ciphertext,
    iv,
    updatedAt: now, // stored unencrypted for sorting
  });

  return id;
}

/**
 * Update an existing vault entry
 * @param {string} id - Entry ID
 * @param {Object} entryData - Updated plain entry data
 * @param {CryptoKey} key - Encryption key
 */
export async function updateEntry(id, entryData, key) {
  const db = await getDB();
  const now = Date.now();

  // Get existing to check if password changed
  const existing = await getEntry(id, key);
  const passwordChanged = existing && existing.password !== entryData.password;

  const plainEntry = {
    ...entryData,
    id,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    passwordLastChanged: passwordChanged ? now : (existing?.passwordLastChanged || now),
  };

  const { ciphertext, iv } = await encryptObject(plainEntry, key);

  await db.put('entries', {
    id,
    ciphertext,
    iv,
    updatedAt: now,
  });
}

/**
 * Get and decrypt a single vault entry
 * @param {string} id - Entry ID
 * @param {CryptoKey} key - Decryption key
 * @returns {Promise<Object|null>}
 */
export async function getEntry(id, key) {
  const db = await getDB();
  const record = await db.get('entries', id);
  if (!record) return null;

  try {
    return await decryptObject(record.ciphertext, record.iv, key);
  } catch {
    console.error('Failed to decrypt entry:', id);
    return null;
  }
}

/**
 * Get and decrypt all vault entries
 * @param {CryptoKey} key - Decryption key
 * @returns {Promise<Object[]>}
 */
export async function getAllEntries(key) {
  const db = await getDB();
  const records = await db.getAll('entries');

  const entries = await Promise.all(
    records.map(async (record) => {
      try {
        return await decryptObject(record.ciphertext, record.iv, key);
      } catch {
        console.error('Failed to decrypt entry:', record.id);
        return null;
      }
    })
  );

  return entries.filter(Boolean);
}

/**
 * Delete a vault entry
 * @param {string} id - Entry ID
 */
export async function deleteEntry(id) {
  const db = await getDB();
  await db.delete('entries', id);
}

/**
 * Get the total count of entries (without decryption)
 * @returns {Promise<number>}
 */
export async function getEntryCount() {
  const db = await getDB();
  return db.count('entries');
}
