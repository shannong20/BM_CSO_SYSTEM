import React from 'react';
import { getFirestoreCSORecords } from '@/server/cso/queries';
import { DashboardClient } from '@/client/components/DashboardClient';
import type { CSORecord } from '@/shared/types';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let initialRecords: CSORecord[] = [];
  let initialError = '';

  try {
    initialRecords = await getFirestoreCSORecords();
  } catch (error) {
    initialError = error instanceof Error ? error.message : 'Could not load CSO records.';
  }

  return <DashboardClient initialRecords={initialRecords} initialError={initialError} />;
}
