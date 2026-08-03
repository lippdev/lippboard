// Lipp Board - Security & Biometrics (WebAuthn / Password) Service

const PBKDF2_ITERATIONS = 210000;
const PBKDF2_HASH = 'SHA-256';

function bytesToBase64(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function utf8(str) {
  return new TextEncoder().encode(String(str));
}

function constantTimeEquals(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function ensureCrypto() {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error('Web Crypto API indisponível neste navegador.');
  }
}

export async function createPasswordRecord(password) {
  ensureCrypto();
  if (!password) return { hash: '', salt: '' };

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', utf8(password), 'PBKDF2', false, ['deriveBits']);
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: PBKDF2_HASH,
    },
    key,
    256
  );

  return {
    hash: bytesToBase64(new Uint8Array(derivedBits)),
    salt: bytesToBase64(salt),
  };
}

export async function verifyPassword(password, storedHash, storedSalt) {
  ensureCrypto();
  if (!password || !storedHash || !storedSalt) return false;

  const salt = base64ToBytes(storedSalt);
  const key = await crypto.subtle.importKey('raw', utf8(password), 'PBKDF2', false, ['deriveBits']);
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: PBKDF2_HASH,
    },
    key,
    256
  );

  return constantTimeEquals(bytesToBase64(new Uint8Array(derivedBits)), storedHash);
}

// Backwards-compatible aliases for older code paths.
export async function hashPin(pin) {
  const { hash } = await createPasswordRecord(pin);
  return hash;
}

export async function verifyPin(pin, storedHash, storedSalt = '') {
  return verifyPassword(pin, storedHash, storedSalt);
}

export function isWebAuthnAvailable() {
  return (
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
  );
}

export async function isPlatformAuthenticatorAvailable() {
  if (!isWebAuthnAvailable()) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch (err) {
    console.warn('Erro ao checar autenticador de plataforma WebAuthn:', err);
    return false;
  }
}

export async function registerBiometrics(userHandle = 'lippboard', userName = 'Lipp Board') {
  if (!isWebAuthnAvailable()) {
    throw new Error('WebAuthn não é suportado neste navegador.');
  }

  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const userId = utf8(userHandle || 'lippboard');
  const rpId = window.location.hostname;

  const publicKeyCredentialCreationOptions = {
    challenge,
    rp: {
      name: 'Lipp Board PWA',
      id: rpId,
    },
    user: {
      id: userId,
      name: userHandle || 'lippboard',
      displayName: userName || 'Lipp Board',
    },
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' },
      { alg: -257, type: 'public-key' },
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'required',
      residentKey: 'preferred',
    },
    timeout: 60000,
    attestation: 'none',
  };

  try {
    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    });

    if (!credential) {
      throw new Error('Não foi possível gerar a credencial biométrica.');
    }

    return bytesToBase64(new Uint8Array(credential.rawId));
  } catch (err) {
    console.error('Erro ao cadastrar biometria:', err);
    throw err;
  }
}

export async function authenticateBiometrics(rawCredentialId = null) {
  if (!isWebAuthnAvailable()) {
    throw new Error('Biometria não suportada neste dispositivo.');
  }

  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const publicKeyCredentialRequestOptions = {
    challenge,
    timeout: 60000,
    userVerification: 'required',
    rpId: window.location.hostname,
  };

  if (rawCredentialId) {
    publicKeyCredentialRequestOptions.allowCredentials = [
      {
        id: base64ToBytes(rawCredentialId),
        type: 'public-key',
        transports: ['internal'],
      },
    ];
  }

  try {
    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    });
    return !!assertion;
  } catch (err) {
    console.error('Erro ao autenticar com biometria:', err);
    throw err;
  }
}
