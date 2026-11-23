/**
 * Server-only environment variable handling.
 * Reads secrets that must never be exposed to the browser (no NEXT_PUBLIC_ prefix).
 */

export interface ServerEnv {
  csoAdminUsername: string;
  csoAdminPassword: string;
}

export function getServerEnv(): ServerEnv {
  const username = process.env.CSO_ADMIN_USERNAME;
  const password = process.env.CSO_ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error(
      'CSO_ADMIN_USERNAME and CSO_ADMIN_PASSWORD must be set on the server. ' +
      'Check .env.local or your deployment environment variables.'
    );
  }

  return { csoAdminUsername: username, csoAdminPassword: password };
}