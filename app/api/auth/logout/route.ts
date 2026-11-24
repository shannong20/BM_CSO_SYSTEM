import { NextResponse } from 'next/server';
import { clearAdminSessionCookie } from '@/server/auth/session';

export async function POST() {
  const response = NextResponse.json({ success: true });
  return clearAdminSessionCookie(response);
}
