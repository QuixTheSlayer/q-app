/**
 * Generates a UUID string using the Web Crypto API when available.
 * Falls back to a polyfill implementation if crypto.randomUUID is unavailable.
 * 
 * @returns {string} A UUID v4 string suitable for client-side identifiers
 * 
 * @example
 * const id = generateCryptoUID();
 */
export default function generateCryptoUID () {
  if(typeof self !== "undefined" && typeof self.crypto?.randomUUID === 'function') {
    return self.crypto.randomUUID();
  }

  if(typeof crypto !== "undefined" && typeof crypto?.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (c as any ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c as any / 4)))).toString(16)
  );
}
