import { NextResponse } from 'next/server';
import { verifyAdminCredentials } from '@/server/auth/credentials';

export async function POST(request: Request) {
  let credentials: { username?: unknown; password?: unknown };
  try {
    credentials = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid login request.' }, { status: 400 });
  }

  const result = verifyAdminCredentials(
    credentials?.username,
    credentials?.password
  );

  if (!result.valid) {
    return NextResponse.json(
      { error: result.error || 'Incorrect username or password.' },
      { status: result.error?.includes('configured') ? 503 : 401 }
    );
  }

  return NextResponse.json({ success: true });
}
