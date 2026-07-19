// AES-256-GCM encryption and decryption using Web Crypto API

import { generateIV, stringToBuffer, bufferToString, bufferToBase64, base64ToBuffer } from './utils';

/**
 * Encrypt a plaintext string using AES-256-GCM
 *
 * @param {string} plaintext - The data to encrypt
 * @param {CryptoKey} key - The AES-GCM key (from deriveKey)
 * @returns {Promise<{ ciphertext: string, iv: string }>} Base64-encoded ciphertext and IV
 */
export async function encrypt(plaintext, key) {
  const iv = generateIV();
  const encoded = stringToBuffer(plaintext);

  const cipherBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encoded
  );

  return {
    ciphertext: bufferToBase64(cipherBuffer),
    iv: bufferToBase64(iv),
  };
}

/**
 * Decrypt an AES-256-GCM ciphertext
 *
 * @param {string} ciphertext - Base64-encoded ciphertext
 * @param {string} iv - Base64-encoded initialization vector
 * @param {CryptoKey} key - The AES-GCM key
 * @returns {Promise<string>} Decrypted plaintext
 */
export async function decrypt(ciphertext, iv, key) {
  const cipherBuffer = base64ToBuffer(ciphertext);
  const ivBuffer = base64ToBuffer(iv);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer,
    },
    key,
    cipherBuffer
  );

  return bufferToString(decryptedBuffer);
}

/**
 * Encrypt an object (serialized as JSON)
 *
 * @param {Object} data - The object to encrypt
 * @param {CryptoKey} key - The AES-GCM key
 * @returns {Promise<{ ciphertext: string, iv: string }>}
 */
export async function encryptObject(data, key) {
  const json = JSON.stringify(data);
  return encrypt(json, key);
}

/**
 * Decrypt an object (deserialized from JSON)
 *
 * @param {string} ciphertext - Base64-encoded ciphertext
 * @param {string} iv - Base64-encoded IV
 * @param {CryptoKey} key - The AES-GCM key
 * @returns {Promise<Object>}
 */
export async function decryptObject(ciphertext, iv, key) {
  const json = await decrypt(ciphertext, iv, key);
  return JSON.parse(json);
}
