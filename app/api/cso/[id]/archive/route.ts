import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/server/auth/session';
import { logSecurityEvent } from '@/server/audit';
import {
  getFirestoreCSORecordById,
  setFirestoreCSORecordArchived,
} from '@/server/cso/queries';

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  const unauthorized = requireAdminSession(request);
  if (unauthorized) return unauthorized;

  try {
    const existing = await getFirestoreCSORecordById(context.params.id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'CSO record not found.' },
        { status: 404 }
      );
    }

    const body = (await request.json()) as { archived?: unknown };
    if (typeof body?.archived !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'archived must be a boolean.' },
        { status: 400 }
      );
    }

    const updatedRecord = await setFirestoreCSORecordArchived(existing, body.archived);
    logSecurityEvent('cso.archive', { recordId: existing.id, archived: body.archived });
    return NextResponse.json({
      success: true,
      data: updatedRecord,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update archive status.',
      },
      { status: 500 }
    );
  }
}
