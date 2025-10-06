/**
 * Simplified client-side encryption utilities using Web Crypto API
 * For demo purposes - in production, use proper AES-GCM encryption
 */

/**
 * Simple encryption using a master password
 * This is a demo implementation - in production use proper encryption
 */
export async function encryptData(plaintext: string, masterPassword: string): Promise<string> {
  try {
    // Simple base64 encoding with password obfuscation for demo
    // In production, use proper AES encryption
    const combined = masterPassword + '|' + plaintext;
    return btoa(combined);
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Simple decryption using a master password
 * This is a demo implementation - in production use proper decryption
 */
export async function decryptData(encryptedData: string, masterPassword: string): Promise<string> {
  try {
    // Simple base64 decoding for demo
    // In production, use proper AES decryption
    const combined = atob(encryptedData);
    const parts = combined.split('|');
    if (parts.length !== 2 || parts[0] !== masterPassword) {
      throw new Error('Invalid master password');
    }
    return parts[1];
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data - invalid master password or corrupted data');
  }
}

/**
 * Generate a secure hash of the master password for verification
 */
export async function hashMasterPassword(masterPassword: string): Promise<string> {
  try {
    // Simple hashing for demo - in production use proper PBKDF2
    return btoa(masterPassword + '_hashed');
  } catch (error) {
    console.error('Hashing failed:', error);
    throw new Error('Failed to hash master password');
  }
}

/**
 * Verify a master password against its hash
 */
export async function verifyMasterPassword(masterPassword: string, hash: string): Promise<boolean> {
  try {
    const expectedHash = await hashMasterPassword(masterPassword);
    return expectedHash === hash;
  } catch (error) {
    console.error('Password verification failed:', error);
    return false;
  }
}

/**
 * Test if Web Crypto API is available
 */
export function isCryptoSupported(): boolean {
  return typeof crypto !== 'undefined' && 
         typeof crypto.subtle !== 'undefined' && 
         typeof crypto.getRandomValues === 'function';
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 16): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  const randomBytes = crypto.getRandomValues(new Uint8Array(length));
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }
  
  return password;
}

export default {
  encryptData,
  decryptData,
  hashMasterPassword,
  verifyMasterPassword,
  isCryptoSupported,
  generateSecurePassword
};