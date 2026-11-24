import React, { Suspense } from 'react';
import { getFirestoreCSORecords } from '@/server/cso/queries';
import { DirectoryClient } from '@/client/components/DirectoryClient';
import { TableSkeleton } from '@/client/components/Skeletons';
import type { CSORecord } from '@/shared/types';

export const dynamic = 'force-dynamic';

export default async function DirectoryPage() {
  let initialRecords: CSORecord[] = [];
  let initialError = '';

  try {
    initialRecords = await getFirestoreCSORecords();
  } catch (error) {
    initialError = error instanceof Error ? error.message : 'Could not load CSO records.';
  }

  return (
    <Suspense fallback={<TableSkeleton rows={8} />}>
      <DirectoryClient initialRecords={initialRecords} initialError={initialError} />
    </Suspense>
  );
}
