import { NextResponse } from 'next/server';
import {
  getFirestoreCSORecords,
  createFirestoreCSORecord,
} from '@/server/cso/queries';

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
  try {
    const body = await request.json();

    const {
      organizationName,
      lguRepresented,
      sector,
      address,
      advocacy,
      isWomenLed,
      representativeName,
      position,
      contactNumber,
      emailAddress,
      accreditingAgency,
      resolutionNo,
      dateAccredited,
      status,
    } = body;

    if (!organizationName || !lguRepresented || !sector || !address) {
      return NextResponse.json(
        { success: false, error: 'Missing required organization fields.' },
        { status: 400 }
      );
    }

    const newRecord = await createFirestoreCSORecord({
      organizationName,
      lguRepresented,
      sector,
      address,
      advocacy: advocacy || '',
      isWomenLed: Boolean(isWomenLed),
      representativeName: representativeName || '',
      position: position || '',
      contactNumber: contactNumber || '',
      emailAddress: emailAddress || '',
      accreditingAgency: accreditingAgency || 'DOLE',
      resolutionNo: resolutionNo || '',
      dateAccredited: dateAccredited || '',
      status: (status as any) || 'Accredited',
    });

    return NextResponse.json({
      success: true,
      message: 'CSO registered successfully',
      data: newRecord,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to register CSO' },
      { status: 500 }
    );
  }
}
