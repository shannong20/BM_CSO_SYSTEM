import { timingSafeEqual } from 'crypto';
import { getServerEnv } from '../env';

/**
 * Server-only admin credential verification.
 * Never imported by client components.
 */

function matchesCredential(provided: string, expected: string | undefined): boolean {
  if (!expected) return false;
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);
}

export interface AdminCredentials {
  username: string;
  password: string;
}

export function getAdminCredentials(): AdminCredentials {
  const { csoAdminUsername, csoAdminPassword } = getServerEnv();
  return { username: csoAdminUsername, password: csoAdminPassword };
}

export function verifyAdminCredentials(
  username: unknown,
  password: unknown
): { valid: boolean; error?: string } {
  if (typeof username !== 'string' || typeof password !== 'string') {
    return { valid: false, error: 'Invalid login request.' };
  }

  const { username: expectedUsername, password: expectedPassword } = getAdminCredentials();

  if (!matchesCredential(username, expectedUsername) || !matchesCredential(password, expectedPassword)) {
    return { valid: false, error: 'Incorrect username or password.' };
  }

  return { valid: true };
}