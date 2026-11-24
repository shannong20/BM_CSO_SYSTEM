import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/server/auth/session';
import { logSecurityEvent } from '@/server/audit';
import {
  deleteFirestoreCSORecord,
  getFirestoreCSORecordById,
  updateFirestoreCSORecord,
} from '@/server/cso/queries';
import { validateCSORecordInput } from '@/server/cso/validation';

export async function PUT(
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

    const body = await request.json();
    const validation = validateCSORecordInput(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.errors[0]?.message || 'Invalid CSO record data.',
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    const updatedRecord = await updateFirestoreCSORecord(existing, validation.data);
    logSecurityEvent('cso.update', { recordId: updatedRecord.id });
    return NextResponse.json({
      success: true,
      message: 'CSO updated successfully',
      data: updatedRecord,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update CSO record.',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await deleteFirestoreCSORecord(existing);
    logSecurityEvent('cso.delete', { recordId: existing.id });
    return NextResponse.json({
      success: true,
      message: 'CSO deleted permanently.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete CSO record.';
    const status = message.includes('Only archived') ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
