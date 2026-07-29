// Lipp Board - Security & Biometrics (WebAuthn / Passkey & PIN) Service

/**
 * Gera um hash SHA-256 para o PIN informado utilizando a Web Crypto API nativa do navegador.
 */
export async function hashPin(pin) {
  if (!pin) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(pin.toString());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifica se um PIN bate com o hash armazenado.
 */
export async function verifyPin(pin, storedHash) {
  if (!pin || !storedHash) return false;
  const hash = await hashPin(pin);
  return hash === storedHash;
}

/**
 * Checa se o navegador/dispositivo suporta a WebAuthn API (Face ID, Touch ID, Windows Hello).
 */
export function isWebAuthnAvailable() {
  return (
    typeof window !== 'undefined' &&
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
  );
}

/**
 * Checa se um autenticador de plataforma (ex: Face ID / Touch ID) está disponível no dispositivo.
 */
export async function isPlatformAuthenticatorAvailable() {
  if (!isWebAuthnAvailable()) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch (err) {
    console.warn('Erro ao checar autenticador de plataforma WebAuthn:', err);
    return false;
  }
}

/**
 * Cadastra a biometria do dispositivo (Face ID / Passkey) usando a WebAuthn API.
 */
export async function registerBiometrics(userHandle = 'lippdev', userName = 'Filipe Moreira') {
  if (!isWebAuthnAvailable()) {
    throw new Error('WebAuthn não é suportado neste navegador.');
  }

  // Desafios e IDs aleatórios convertidos para Uint8Array
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const userId = new TextEncoder().encode(userHandle);

  const publicKeyCredentialCreationOptions = {
    challenge,
    rp: {
      name: 'Lipp Board PWA',
      id: window.location.hostname
    },
    user: {
      id: userId,
      name: userName,
      displayName: userName
    },
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' },  // ES256
      { alg: -257, type: 'public-key' } // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform', // Força o uso da biometria local (Face ID / Touch ID)
      userVerification: 'required',
      residentKey: 'preferred'
    },
    timeout: 60000,
    attestation: 'none'
  };

  try {
    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions
    });

    if (!credential) {
      throw new Error('Não foi possível gerar a credencial biométrica.');
    }

    // Converte o ID da credencial para string Base64 para armazenar no store
    const credentialId = arrayBufferToBase64(credential.rawId);
    return credentialId;
  } catch (err) {
    console.error('Erro ao cadastrar biometria:', err);
    throw err;
  }
}

/**
 * Solicita autenticação biométrica (Face ID / Touch ID) via WebAuthn API.
 */
export async function authenticateBiometrics(rawCredentialId = null) {
  if (!isWebAuthnAvailable()) {
    throw new Error('Biometria não suportada neste dispositivo.');
  }

  const challenge = crypto.getRandomValues(new Uint8Array(32));

  const publicKeyCredentialRequestOptions = {
    challenge,
    timeout: 60000,
    userVerification: 'required',
    rpId: window.location.hostname
  };

  if (rawCredentialId) {
    const credentialIdBuffer = base64ToArrayBuffer(rawCredentialId);
    publicKeyCredentialRequestOptions.allowCredentials = [
      {
        id: credentialIdBuffer,
        type: 'public-key',
        transports: ['internal']
      }
    ];
  }

  try {
    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions
    });

    return !!assertion;
  } catch (err) {
    console.error('Erro ao autenticar com biometria:', err);
    throw err;
  }
}

// Helpers para conversão de ArrayBuffer / Base64
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
