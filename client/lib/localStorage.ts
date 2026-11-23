/**
 * Client-side offline cache helpers for CSO records.
 * Uses browser localStorage as a fallback when Firestore is unavailable.
 * This file is CLIENT-ONLY.
 */

import type { CSORecord } from '@/shared/types';

const LOCAL_STORAGE_KEY = 'csotrack_records_cache';

const LEGACY_DEMO_RECORD_IDS = new Set([
  'cso-001',
  'cso-002',
  'cso-003',
  'cso-004',
  'cso-005',
  'cso-006',
  'cso-007',
  'cso-008',
]);

function normalizeLgu(value: unknown): string {
  const importValueOrUnspecified = (v: unknown): string => {
    if (typeof v !== 'string') return 'NOT SPECIFIED, INPUT VALUE';
    const trimmed = v.trim();
    return !trimmed || /^=\s*AI\s*\(/i.test(trimmed)
      ? 'NOT SPECIFIED, INPUT VALUE'
      : trimmed;
  };
  const lgu = importValueOrUnspecified(value);
  if (lgu === 'NOT SPECIFIED, INPUT VALUE') return lgu;
  return lgu.replace(/^NAGUILL?AN(?=, LA UNION$)/i, 'NAGUILIAN');
}

/**
 * Get cached or seeded records from browser storage.
 */
export function getLocalRecords(): CSORecord[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const records = parsed.filter(
      (record) =>
        !record ||
        typeof record.id !== 'string' ||
        !LEGACY_DEMO_RECORD_IDS.has(record.id)
    ).map((record) => ({
      ...record,
      lguRepresented: normalizeLgu(record.lguRepresented),
    }));
    if (records.length !== parsed.length) {
      saveLocalRecords(records);
    }
    return records;
  } catch {
    return [];
  }
}

/**
 * Persist records to browser storage.
 */
export function saveLocalRecords(records: CSORecord[]): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
    return true;
  } catch (e) {
    console.error('Failed to save to local storage', e);
    return false;
  }
}