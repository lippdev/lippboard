import {
  browserSupportsWebAuthn,
  browserSupportsWebAuthnAutofill,
  platformAuthenticatorIsAvailable,
  startAuthentication,
  startRegistration,
} from '@simplewebauthn/browser';
import {
  beginPasskeyLogin,
  beginPasskeyRegistration,
  completePasskeyLogin,
  completePasskeyRegistration,
} from './backendService.js';

export function isFaceIdAvailable() {
  return browserSupportsWebAuthn() && typeof window !== 'undefined' && window.isSecureContext;
}

export async function isPlatformFaceIdAvailable() {
  if (!isFaceIdAvailable()) return false;
  try {
    return await platformAuthenticatorIsAvailable();
  } catch (err) {
    console.warn('Falha ao verificar Face ID disponível:', err);
    return false;
  }
}

export async function registerFaceId() {
  const optionsResponse = await beginPasskeyRegistration();
  const attestationResponse = await startRegistration(optionsResponse.options);
  return completePasskeyRegistration(attestationResponse);
}

export async function loginWithFaceId() {
  const optionsResponse = await beginPasskeyLogin();
  const authenticationResponse = await startAuthentication(optionsResponse.options);
  return completePasskeyLogin(authenticationResponse);
}

export function supportsWebAuthnAutofill() {
  return browserSupportsWebAuthnAutofill();
}
