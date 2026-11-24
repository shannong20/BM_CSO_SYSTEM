/**
 * Structured security audit logger.
 * Never log credentials, session tokens, or sensitive PII.
 */

export type SecurityEventType =
  | 'auth.login.success'
  | 'auth.login.failure'
  | 'auth.login.rate_limited'
  | 'cso.create'
  | 'cso.update'
  | 'cso.archive'
  | 'cso.delete'
  | 'cso.attachment.complete';

export function logSecurityEvent(
  event: SecurityEventType,
  details: Record<string, string | boolean | number | undefined>
): void {
  const entry = {
    ts: new Date().toISOString(),
    event,
    ...details,
  };
  if (event === 'auth.login.failure' || event === 'auth.login.rate_limited') {
    console.warn('[security]', JSON.stringify(entry));
  } else {
    console.info('[security]', JSON.stringify(entry));
  }
}
