// Master password authentication flow

import { getDB } from '../storage/db';
import { deriveKey, createAuthHash } from '../crypto/keyDerivation';
import { generateSalt, bufferToBase64, base64ToBuffer } from '../crypto/utils';

/**
 * Check if a vault has been set up (master password created)
 * @returns {Promise<boolean>}
 */
export async function isVaultSetup() {
  const db = await getDB();
  const meta = await db.get('meta', 'vault');
  return !!meta;
}

/**
 * Set up a new vault with a master password
 * @param {string} password - The master password
 * @param {string} [hint] - Optional password hint
 * @returns {Promise<CryptoKey>} The derived encryption key
 */
export async function setupVault(password, hint = '') {
  const salt = generateSalt(32);
  const key = await deriveKey(password, salt);
  const authHash = await createAuthHash(password, salt);

  const db = await getDB();
  await db.put('meta', {
    salt: bufferToBase64(salt),
    authHash,
    hint,
    createdAt: Date.now(),
  }, 'vault');

  return key;
}

/**
 * Unlock the vault with a master password
 * @param {string} password - The master password
 * @returns {Promise<CryptoKey|null>} The derived key, or null if wrong password
 */
export async function unlockVault(password) {
  const db = await getDB();
  const meta = await db.get('meta', 'vault');
  if (!meta) throw new Error('Vault not set up');

  const salt = base64ToBuffer(meta.salt);
  const authHash = await createAuthHash(password, salt);

  if (authHash !== meta.authHash) {
    return null; // Wrong password
  }

  // Password correct — derive the encryption key
  return deriveKey(password, salt);
}

/**
 * Get the password hint
 * @returns {Promise<string>}
 */
export async function getPasswordHint() {
  const db = await getDB();
  const meta = await db.get('meta', 'vault');
  return meta?.hint || '';
}

/**
 * Change the master password (re-encrypts all entries)
 * @param {string} currentPassword - Current master password
 * @param {string} newPassword - New master password
 * @param {string} [newHint] - New optional hint
 * @returns {Promise<CryptoKey|null>} New key, or null if current password wrong
 */
export async function changeMasterPassword(currentPassword, newPassword, newHint = '') {
  const { getAllEntries, updateEntry } = await import('../storage/vaultStore');
  const { loadSettings, saveSettings } = await import('../storage/settingsStore');

  // Verify current password
  const currentKey = await unlockVault(currentPassword);
  if (!currentKey) return null;

  // Decrypt all data with old key
  const entries = await getAllEntries(currentKey);
  const settings = await loadSettings(currentKey);

  // Create new vault with new password
  const newKey = await setupVault(newPassword, newHint);

  // Re-encrypt all entries with new key
  for (const entry of entries) {
    const { id, createdAt, updatedAt, passwordLastChanged, ...data } = entry;
    await updateEntry(id, { ...data, createdAt, updatedAt, passwordLastChanged }, newKey);
  }

  // Re-encrypt settings
  await saveSettings(settings, newKey);

  // Biometric wrap was tied to the old key material — clear enrollment
  const { disableBiometric } = await import('./biometric');
  await disableBiometric();
  if (settings.biometricEnabled) {
    await saveSettings({ ...settings, biometricEnabled: false }, newKey);
  }

  return newKey;
}
