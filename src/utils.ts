import crypto from 'crypto';

/**
 * Generates a SHA256 hash for a given string.
 * @param input The input string
 * @returns The SHA256 hash as hex string
 */
export function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Removes local path parts and normalizes slashes (OS-independent).
 * @param path The path string
 * @returns The cleaned path
 */
export function cleanPath(path: string): string {
  // Entfernt Backslashes und Slashes, normalisiert den Pfad OS-unabhängig
  return path.replace(/[\\/]+/g, '/');
}

/**
 * Outputs debug logs if DEBUG_LLMS_TXT=1 is set.
 * @param args Arbitrary arguments for logging
 */
export function debugLog(...args: string[]) {
  if (process.env.DEBUG_LLMS_TXT === '1') {
    // eslint-disable-next-line no-console
    console.log('[llms-txt]', ...args);
  }
}
