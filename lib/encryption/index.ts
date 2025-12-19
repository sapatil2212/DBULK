import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.JWT_SECRET || 'default-encryption-key-change-in-production';

export function encrypt(text: string): string {
  if (!text) return '';
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

export function decrypt(encryptedText: string): string {
  if (!encryptedText) return '';
  const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export function hashSHA256(text: string): string {
  return CryptoJS.SHA256(text).toString();
}

export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}

export function generateOTP(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    otp += digits[randomValues[i] % 10];
  }
  return otp;
}
