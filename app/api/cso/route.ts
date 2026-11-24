import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/server/auth/session';
import { logSecurityEvent } from '@/server/audit';
import {
  getFirestoreCSORecords,
  createFirestoreCSORecord,
} from '@/server/cso/queries';
import { validateCSORecordInput } from '@/server/cso/validation';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const lgu = searchParams.get('lgu') || '';
    const sector = searchParams.get('sector') || '';
    const status = searchParams.get('status') || '';

    const records = await getFirestoreCSORecords();

    // Apply filtering
    const filtered = records.filter((r) => {
      const matchSearch =
        !search ||
        r.organizationName.toLowerCase().includes(search) ||
        r.advocacy.toLowerCase().includes(search) ||
        r.representativeName.toLowerCase().includes(search) ||
        r.address.toLowerCase().includes(search) ||
        r.lguRepresented.toLowerCase().includes(search);

      const matchLgu = !lgu || r.lguRepresented === lgu;
      const matchSector = !sector || r.sector === sector;
      const matchStatus = !status || r.status === status;

      return matchSearch && matchLgu && matchSector && matchStatus;
    });

    return NextResponse.json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch CSO records' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const unauthorized = requireAdminSession(request);
  if (unauthorized) return unauthorized;

  try {
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

    const newRecord = await createFirestoreCSORecord(validation.data);
    logSecurityEvent('cso.create', { recordId: newRecord.id });

    return NextResponse.json({
      success: true,
      message: 'CSO registered successfully',
      data: newRecord,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to register CSO',
      },
      { status: 500 }
    );
  }
}
