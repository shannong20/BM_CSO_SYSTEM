import { NextResponse } from 'next/server';
import { verifyAdminCredentials } from '@/server/auth/credentials';
import { setAdminSessionCookie } from '@/server/auth/session';

export async function POST(request: Request) {
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
      return NextResponse.json(
        { error: result.error || 'Incorrect username or password.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });
    return setAdminSessionCookie(response);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Admin login is not configured.' },
      { status: 503 }
    );
  }
}
