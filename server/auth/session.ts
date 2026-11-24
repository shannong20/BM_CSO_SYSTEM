import { createHmac, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { getAdminCredentials } from './credentials';

const SESSION_COOKIE_NAME = 'csotrack_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getSessionSecret(): Buffer {
  const explicitSecret = process.env.CSO_SESSION_SECRET?.trim();
  if (explicitSecret) {
    return Buffer.from(explicitSecret, 'utf8');
  }
  const { username, password } = getAdminCredentials();
  return createHmac('sha256', password).update(username).digest();
}

function signPayload(payloadB64: string, secret: Buffer): string {
  return createHmac('sha256', secret).update(payloadB64).digest('base64url');
}

export function createAdminSessionToken(): string {
  const payload = {
    role: 'admin' as const,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = signPayload(payloadB64, getSessionSecret());
  return `${payloadB64}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payloadB64, providedSig] = parts;
  if (!payloadB64 || !providedSig) return false;

  let secret: Buffer;
  try {
    secret = getSessionSecret();
  } catch {
    return false;
  }

  const expectedSig = signPayload(payloadB64, secret);
  const providedBuf = Buffer.from(providedSig, 'utf8');
  const expectedBuf = Buffer.from(expectedSig, 'utf8');
  if (providedBuf.length !== expectedBuf.length || !timingSafeEqual(providedBuf, expectedBuf)) {
    return false;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as {
      role?: unknown;
      exp?: unknown;
    };
    return decoded.role === 'admin' && typeof decoded.exp === 'number' && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

function readCookieValue(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  const prefix = `${name}=`;
  for (const part of cookieHeader.split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      return decodeURIComponent(trimmed.slice(prefix.length));
    }
  }
  return undefined;
}

export function isAdminRequest(request: Request): boolean {
  const token = readCookieValue(request.headers.get('cookie'), SESSION_COOKIE_NAME);
  return verifyAdminSessionToken(token);
}

export function requireAdminSession(request: Request): NextResponse | null {
  if (isAdminRequest(request)) {
    return null;
  }
  return NextResponse.json(
    {
      success: false,
      error: 'Unauthorized: admin session required. Please sign in again.',
    },
    { status: 401 }
  );
}

export function setAdminSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: createAdminSessionToken(),
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}

export function clearAdminSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}
