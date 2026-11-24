import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/server/auth/session';

export async function GET(request: Request) {
  return NextResponse.json({
    admin: isAdminRequest(request),
  });
}
