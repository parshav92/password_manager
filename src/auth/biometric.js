// WebAuthn biometric authentication

/**
 * Check if the platform supports biometric (WebAuthn platform authenticator)
 * @returns {Promise<boolean>}
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
 * Register a biometric credential
 * This stores a credential tied to the device's biometric hardware
 *
 * @returns {Promise<{ credentialId: string, rawId: ArrayBuffer } | null>}
 */
export async function registerBiometric() {
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: 'VaultSoft',
          id: window.location.hostname,
        },
        user: {
          id: crypto.getRandomValues(new Uint8Array(16)),
          name: 'vaultsoft-user',
          displayName: 'VaultSoft User',
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },   // ES256
          { type: 'public-key', alg: -257 },  // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred',
        },
        timeout: 60000,
      },
    });

    if (!credential) return null;

    const credentialId = bufferToBase64Url(credential.rawId);
    return { credentialId, rawId: credential.rawId };
  } catch (err) {
    console.error('Biometric registration failed:', err);
    return null;
  }
}

/**
 * Authenticate using a registered biometric credential
 *
 * @param {string} credentialId - The stored credential ID
 * @returns {Promise<boolean>} Whether authentication succeeded
 */
export async function authenticateBiometric(credentialId) {
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [{
          type: 'public-key',
          id: base64UrlToBuffer(credentialId),
        }],
        userVerification: 'required',
        timeout: 60000,
      },
    });

    return !!assertion;
  } catch (err) {
    console.error('Biometric authentication failed:', err);
    return false;
  }
}

// --- Helper encoders for WebAuthn ---

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
  const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
