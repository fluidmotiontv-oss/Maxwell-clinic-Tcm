export interface EncryptedEnvelope {
  ciphertextB64: string;
  ivB64: string;
  saltB64: string;
  algorithm: 'AES-256-GCM';
}

const PBKDF2_ITERATIONS = 100_000;

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function isWebCryptoAvailable(): boolean {
  return typeof window !== 'undefined' && Boolean(window.crypto && window.crypto.subtle);
}

async function deriveAesGcmKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptClinicalText(
  plaintext: string,
  passphrase: string
): Promise<EncryptedEnvelope> {
  if (!isWebCryptoAvailable()) {
    throw new Error('Web Crypto API is unavailable in this browser context.');
  }
  if (!passphrase.trim()) {
    throw new Error('An encryption passphrase is required.');
  }

  const enc = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesGcmKey(passphrase, salt);

  const cipherBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plaintext)
  );

  return {
    ciphertextB64: bytesToBase64(new Uint8Array(cipherBuffer)),
    ivB64: bytesToBase64(iv),
    saltB64: bytesToBase64(salt),
    algorithm: 'AES-256-GCM',
  };
}

export async function decryptClinicalText(
  envelope: EncryptedEnvelope,
  passphrase: string
): Promise<string> {
  if (!isWebCryptoAvailable()) {
    throw new Error('Web Crypto API is unavailable in this browser context.');
  }
  if (!passphrase.trim()) {
    throw new Error('Enter your clinician passphrase to decrypt.');
  }

  const salt = base64ToBytes(envelope.saltB64);
  const iv = base64ToBytes(envelope.ivB64);
  const ciphertext = base64ToBytes(envelope.ciphertextB64);
  const key = await deriveAesGcmKey(passphrase, salt);

  const plainBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as unknown as BufferSource },
    key,
    ciphertext as unknown as BufferSource
  );

  const dec = new TextDecoder();
  return dec.decode(plainBuffer);
}
