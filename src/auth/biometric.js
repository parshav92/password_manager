// WebAuthn biometric unlock via PRF key wrapping
//
// Flow:
// 1. Enable (while unlocked): confirm master password → create platform credential
//    with PRF → wrap vault key bytes with PRF secret → store wrap in IndexedDB
// 2. Unlock: biometric assertion + PRF → unwrap → import AES-GCM CryptoKey
//
// Requires a platform authenticator with PRF (Chrome Android, Safari iOS 18+, etc.)

import { getDB } from '../storage/db';
import { createAuthHash, deriveRawKeyBits } from '../crypto/keyDerivation';
import { generateIV, bufferToBase64, base64ToBuffer } from '../crypto/utils';

const BIOMETRIC_META_KEY = 'biometric';
const PRF_SALT_LABEL = 'VaultSoft biometric vault wrap v1';

/**
 * Device has a user-verifying platform authenticator (Face ID / fingerprint / etc.)
 */
export async function isBiometricAvailable() {
  if (!window.PublicKeyCredential) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

/**
 * Whether biometric unlock is enrolled for this vault on this device
 */
export async function isBiometricEnrolled() {
  const db = await getDB();
  const record = await db.get('meta', BIOMETRIC_META_KEY);
  return !!(record?.credentialId && record?.wrappedKey && record?.wrappedIv && record?.prfSalt);
}

/**
 * Enable biometric unlock. Requires master password to export key material.
 * @param {string} password
 * @returns {Promise<{ ok: true } | { ok: false, error: string }>}
 */
export async function enableBiometric(password) {
  if (!(await isBiometricAvailable())) {
    return { ok: false, error: 'Biometrics are not available on this device' };
  }

  const db = await getDB();
  const vaultMeta = await db.get('meta', 'vault');
  if (!vaultMeta) return { ok: false, error: 'Vault not set up' };

  const vaultSalt = base64ToBuffer(vaultMeta.salt);
  const authHash = await createAuthHash(password, vaultSalt);
  if (authHash !== vaultMeta.authHash) {
    return { ok: false, error: 'Incorrect master password' };
  }

  const rawVaultKey = await deriveRawKeyBits(password, vaultSalt);
  const prfSalt = new TextEncoder().encode(PRF_SALT_LABEL);

  let credential;
  try {
    credential = await navigator.credentials.create({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: {
          name: 'VaultSoft',
          id: getRpId(),
        },
        user: {
          id: crypto.getRandomValues(new Uint8Array(16)),
          name: 'vaultsoft-user',
          displayName: 'VaultSoft',
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },
          { type: 'public-key', alg: -257 },
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred',
          requireResidentKey: false,
        },
        timeout: 90000,
        extensions: {
          prf: {},
        },
      },
    });
  } catch (err) {
    return { ok: false, error: formatWebAuthnError(err, 'Could not register biometrics') };
  }

  if (!credential) {
    return { ok: false, error: 'Biometric registration was cancelled' };
  }

  const createExt = credential.getClientExtensionResults?.()?.prf;
  if (createExt && createExt.enabled === false) {
    return {
      ok: false,
      error: 'This device does not support secure biometric unlock (PRF). Try updating Chrome/Safari.',
    };
  }

  const credentialId = bufferToBase64Url(credential.rawId);

  let prfSecret = createExt?.results?.first
    ? normalizePrfSecret(createExt.results.first)
    : null;

  // Most authenticators only return PRF output on get(), not create()
  if (!prfSecret) {
    try {
      prfSecret = await evaluatePrf(credentialId, prfSalt);
    } catch (err) {
      return { ok: false, error: formatWebAuthnError(err, 'Could not derive biometric key') };
    }
  }

  if (!prfSecret) {
    return {
      ok: false,
      error: 'This device does not support secure biometric unlock (PRF). Try updating Chrome/Safari.',
    };
  }

  const { wrappedKey, wrappedIv } = await wrapRawKey(rawVaultKey, prfSecret);

  await db.put('meta', {
    credentialId,
    prfSalt: bufferToBase64(prfSalt),
    wrappedKey,
    wrappedIv,
    createdAt: Date.now(),
  }, BIOMETRIC_META_KEY);

  return { ok: true };
}

/**
 * Remove biometric enrollment for this device
 */
export async function disableBiometric() {
  const db = await getDB();
  await db.delete('meta', BIOMETRIC_META_KEY);
}

/**
 * Unlock vault with platform biometrics
 * @returns {Promise<{ key: CryptoKey|null, cancelled?: boolean, error?: string }>}
 */
export async function unlockWithBiometric() {
  const db = await getDB();
  const record = await db.get('meta', BIOMETRIC_META_KEY);
  if (!record?.credentialId || !record?.wrappedKey) {
    return { key: null, error: 'Biometric unlock is not set up' };
  }

  const prfSalt = base64ToBuffer(record.prfSalt);
  let prfSecret;
  try {
    prfSecret = await evaluatePrf(record.credentialId, prfSalt);
  } catch (err) {
    if (err?.name === 'NotAllowedError') {
      return { key: null, cancelled: true };
    }
    return { key: null, error: formatWebAuthnError(err, 'Biometric unlock failed') };
  }
  if (!prfSecret) {
    return {
      key: null,
      error: 'This device could not derive a biometric key. Re-enable biometric unlock in Settings.',
    };
  }

  try {
    const key = await unwrapRawKey(record.wrappedKey, record.wrappedIv, prfSecret);
    return { key };
  } catch {
    return {
      key: null,
      error: 'Biometric data is invalid. Re-enable biometric unlock in Settings.',
    };
  }
}

// --- internals ---

function getRpId() {
  const host = window.location.hostname;
  // WebAuthn rejects bare IPs on some browsers; hostname is fine for localhost / domains
  return host;
}

async function evaluatePrf(credentialId, prfSalt) {
  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rpId: getRpId(),
      allowCredentials: [{
        type: 'public-key',
        id: base64UrlToBuffer(credentialId),
        transports: ['internal'],
      }],
      userVerification: 'required',
      timeout: 90000,
      extensions: {
        prf: {
          eval: {
            first: prfSalt,
          },
        },
      },
    },
  });

  if (!assertion) return null;
  const first = assertion.getClientExtensionResults?.()?.prf?.results?.first;
  return first ? normalizePrfSecret(first) : null;
}

function normalizePrfSecret(value) {
  const bytes = value instanceof ArrayBuffer ? new Uint8Array(value) : new Uint8Array(value);
  // AES-256 needs 32 bytes; take first 32 if longer
  return bytes.byteLength === 32 ? bytes : bytes.slice(0, 32);
}

async function wrapRawKey(rawVaultKey, prfSecret) {
  const wrapKey = await crypto.subtle.importKey(
    'raw',
    prfSecret,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  const iv = generateIV();
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    wrapKey,
    rawVaultKey
  );
  return {
    wrappedKey: bufferToBase64(cipherBuffer),
    wrappedIv: bufferToBase64(iv),
  };
}

async function unwrapRawKey(wrappedKeyB64, wrappedIvB64, prfSecret) {
  const wrapKey = await crypto.subtle.importKey(
    'raw',
    prfSecret,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
  const raw = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToBuffer(wrappedIvB64) },
    wrapKey,
    base64ToBuffer(wrappedKeyB64)
  );
  return crypto.subtle.importKey(
    'raw',
    raw,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function formatWebAuthnError(err, fallback) {
  const name = err?.name || '';
  if (name === 'NotAllowedError') return 'Biometric prompt was cancelled or timed out';
  if (name === 'InvalidStateError') return 'A biometric credential already exists. Disable and try again.';
  if (name === 'NotSupportedError') return 'Biometrics are not supported in this browser';
  if (name === 'SecurityError') return 'Biometrics require a secure context (HTTPS or localhost)';
  return err?.message || fallback;
}

function bufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (let i = 0; i < bytes.length; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBuffer(base64url) {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
