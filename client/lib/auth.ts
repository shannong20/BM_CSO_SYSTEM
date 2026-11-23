/**
 * Client-side authentication helpers (localStorage-based demo auth).
 * This file is CLIENT-ONLY. It uses window/localStorage and must not be imported by server code.
 */

export type UserRole = 'admin' | 'guest';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

const STORAGE_KEY = 'csotrack_user';

export const DEMO_USERS: Record<string, User> = {
  admin: {
    id: 'admin-1',
    email: 'admin@cso-track.la-union.gov.ph',
    name: 'System Administrator',
    role: 'admin',
  },
  guest: {
    id: 'guest-1',
    email: 'guest@cso-track.la-union.gov.ph',
    name: 'Guest User',
    role: 'guest',
  },
};

/**
 * Get the currently logged-in user from localStorage (demo mode).
 * Returns null if no user is logged in.
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

/**
 * Log in a user by role (demo mode). Stores user in localStorage.
 */
export function login(role: UserRole): User {
  const user = DEMO_USERS[role];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }
  return user;
}

/**
 * Log out the current user. Clears localStorage.
 */
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Check if the current user is an admin.
 */
export function isAdminUser(): boolean {
  const user = getCurrentUser();
  return user?.role === 'admin';
}

/**
 * Check if the current user is a guest.
 */
export function isGuestUser(): boolean {
  const user = getCurrentUser();
  return user?.role === 'guest';
}

/**
 * Check if any user is authenticated.
 */
export function isAuthenticatedUser(): boolean {
  return getCurrentUser() !== null;
}