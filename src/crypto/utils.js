// Crypto utility helpers — salt, IV, and encoding

/**
 * Generate a random salt for key derivation
 * @param {number} length - Salt length in bytes (default 16)
 * @returns {Uint8Array}
 */
export function generateSalt(length = 16) {
  return crypto.getRandomValues(new Uint8Array(length));
}

/**
 * Generate a random initialization vector for AES-GCM
 * @returns {Uint8Array} 12-byte IV (recommended for AES-GCM)
 */
export function generateIV() {
  return crypto.getRandomValues(new Uint8Array(12));
}

/**
 * Convert a string to an ArrayBuffer
 */
export function stringToBuffer(str) {
  return new TextEncoder().encode(str);
}

/**
 * Convert an ArrayBuffer to a string
 */
export function bufferToString(buffer) {
  return new TextDecoder().decode(buffer);
}

/**
 * Convert an ArrayBuffer to a hex string
 */
export function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert a hex string back to a Uint8Array
 */
export function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Convert a Uint8Array to a base64 string
 */
export function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert a base64 string to a Uint8Array
 */
export function base64ToBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Generate a UUID v4
 */
export function generateId() {
  return crypto.randomUUID();
}
