import { NextResponse } from 'next/server';
import { verifyAdminCredentials } from '@/server/auth/credentials';
import { setAdminSessionCookie } from '@/server/auth/session';
import {
  checkLoginRateLimit,
  clearLoginAttempts,
  getClientIp,
  recordFailedLoginAttempt,
} from '@/server/auth/rateLimit';
import { logSecurityEvent } from '@/server/audit';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkLoginRateLimit(ip);
  if (!limit.allowed) {
    logSecurityEvent('auth.login.rate_limited', { ip, retryAfterSeconds: limit.retryAfterSeconds });
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(limit.retryAfterSeconds) },
      }
    );
  }

  let credentials: { username?: unknown; password?: unknown };
  try {
    credentials = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid login request.' }, { status: 400 });
  }

  try {
    const result = verifyAdminCredentials(
      credentials?.username,
      credentials?.password
    );

    if (!result.valid) {
      recordFailedLoginAttempt(ip);
      logSecurityEvent('auth.login.failure', { ip });
      return NextResponse.json(
        { error: result.error || 'Incorrect username or password.' },
        { status: 401 }
      );
    }

    clearLoginAttempts(ip);
    logSecurityEvent('auth.login.success', { ip });
    const response = NextResponse.json({ success: true });
    return setAdminSessionCookie(response);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Admin login is not configured.' },
      { status: 503 }
    );
  }
}
