/**
 * In-memory sliding-window rate limiter for authentication attempts.
 * Never logs or stores credentials.
 */

interface AttemptRecord {
  count: number;
  resetAt: number;
}

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 10;
const attemptsByIp = new Map<string, AttemptRecord>();

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

function pruneExpired(now: number) {
  if (attemptsByIp.size < 500) return;
  attemptsByIp.forEach((record, key) => {
    if (record.resetAt <= now) {
      attemptsByIp.delete(key);
    }
  });
}

export function checkLoginRateLimit(ip: string): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  pruneExpired(now);

  const existing = attemptsByIp.get(ip);
  if (!existing || existing.resetAt <= now) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

export function recordFailedLoginAttempt(ip: string): void {
  const now = Date.now();
  const existing = attemptsByIp.get(ip);
  if (!existing || existing.resetAt <= now) {
    attemptsByIp.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  existing.count += 1;
}

export function clearLoginAttempts(ip: string): void {
  attemptsByIp.delete(ip);
}
