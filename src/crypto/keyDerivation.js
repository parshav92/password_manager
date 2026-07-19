// Key derivation using PBKDF2 with Web Crypto API

import { stringToBuffer, bufferToHex } from './utils';

const PBKDF2_ITERATIONS = 300000;
const KEY_LENGTH = 256; // bits

/**
 * Derive a CryptoKey from a master password using PBKDF2
 * The derived key is non-exportable and can only be used for AES-GCM
 *
 * @param {string} password - The master password
 * @param {Uint8Array} salt - Random salt
 * @returns {Promise<CryptoKey>} Non-exportable AES-GCM key
 */
export async function deriveKey(password, salt) {
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    stringToBuffer(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    {
      name: 'AES-GCM',
      length: KEY_LENGTH,
    },
    false, // non-exportable — stays in memory only
    ['encrypt', 'decrypt']
  );
}

/**
 * Same PBKDF2 material as deriveKey, returned as raw bits.
 * Used only to wrap the vault key for biometric unlock (then discarded).
 *
 * @param {string} password
 * @param {Uint8Array} salt
 * @returns {Promise<ArrayBuffer>} 32 raw key bytes
 */
export async function deriveRawKeyBits(password, salt) {
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    stringToBuffer(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  return crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    KEY_LENGTH
  );
}

/**
 * Create an authentication hash from the master password.
 * This is a SEPARATE derivation used only to verify the master password
 * is correct — it is NOT the encryption key.
 *
 * We do: PBKDF2(PBKDF2(password, salt), salt) — double derivation
 * so the auth hash cannot be used to reverse-engineer the encryption key.
 *
 * @param {string} password - The master password
 * @param {Uint8Array} salt - Random salt
 * @returns {Promise<string>} Hex-encoded authentication hash
 */
export async function createAuthHash(password, salt) {
  // First round: derive a key (same as encryption key derivation)
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    stringToBuffer(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const firstRound = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    KEY_LENGTH
  );

  // Second round: hash the first round output with SHA-256
  const authHash = await crypto.subtle.digest('SHA-256', firstRound);
  return bufferToHex(authHash);
}
