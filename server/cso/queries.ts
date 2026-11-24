/**
 * Server-only Firestore queries for the cso_records collection.
 *
 * This file is SERVER-ONLY. It must never be imported by client components.
 * It is used exclusively by Next.js API routes inside app/api/.
 */

import {
  db,
  isFirebaseConfigured,
} from '@/server/firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  deleteField,
  Timestamp,
} from 'firebase/firestore';
import { deleteFromCloudinary } from '@/server/cloudinary';
import type { CSORecord, CSORecordInput, CertificateAttachment } from '@/shared/types';
import { valueOrUnspecified } from '@/shared/types';

const COLLECTION_MANUAL = 'cso_records';
const COLLECTION_SEEDED = 'cso_organizations';

/** Map a raw Firestore document to a CSORecord (server-side mapping) */
function mapDocToRecord(id: string, data: Record<string, any>, index: number): CSORecord {
  const rawStatus = String(data.status || data.spAccredited || '').trim().toUpperCase();
  const status: CSORecord['status'] =
    rawStatus === 'ACCREDITED' ? 'Accredited'
      : 'Pending';

  const womenLedValue = data.isWomenLed ?? data.womenLed;
  const normalizedWomenLed =
    typeof womenLedValue === 'boolean'
      ? womenLedValue
      : typeof womenLedValue === 'string'
        ? womenLedValue.trim().toLowerCase()
        : '';
  const isWomenLed =
    normalizedWomenLed === true || normalizedWomenLed === 'yes' || normalizedWomenLed === 'true'
      ? true
      : normalizedWomenLed === false || normalizedWomenLed === 'no' || normalizedWomenLed === 'false'
        ? false
        : null;

  const sourceRow = Number(data.sourceRow);
  const lguRepresented = String(data.lguRepresented || '').replace(/^NAGUILL?AN(?=, LA UNION$)/i, 'NAGUILIAN');
  const sector = typeof data.sector === 'string' && data.sector.trim() ? data.sector : null;

  return {
    id,
    no: Number.isInteger(sourceRow) && sourceRow > 1 ? sourceRow - 1 : index,
    organizationName: data.organizationName || '',
    lguRepresented,
    sector,
    address: data.address || '',
    advocacy: data.advocacy ?? '',
    isWomenLed,
    representativeName: data.representativeName || '',
    position: data.position || '',
    contactNumber: data.contactNumber || '',
    emailAddress: data.emailAddress || '',
    accreditingAgency: data.accreditingAgency || '',
    resolutionNo: data.resolutionNo || data.resolutionNumber || '',
    dateAccredited: data.dateAccredited || '',
    status,
    archived: Boolean(data.archived),
    certificateAttachment: data.certificateAttachment,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
  };
}

function getTimestampMillis(value: unknown): number {
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    const date = value.toDate();
    return date.getTime();
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }
  return 0;
}

/**
 * Fetch all CSO records from Firestore.
 * Reads both `cso_records` (hand-entered) and `cso_organizations` (seeded).
 */
export async function getFirestoreCSORecords(): Promise<CSORecord[]> {
  if (!isFirebaseConfigured || !db) {
    return [];
  }

  const [manualSnap, seededSnap] = await Promise.all([
    getDocs(collection(db, COLLECTION_MANUAL)),
    getDocs(collection(db, COLLECTION_SEEDED)),
  ]);

  const allDocs: Array<{ snap: any; ts: number; sourceRow: number | null }> = [];

  manualSnap.forEach((d) => {
    const data = d.data();
    const ts = getTimestampMillis(data.createdAt) || getTimestampMillis(data.dateAccredited);
    const sourceRow = Number.isInteger(data.sourceRow) ? data.sourceRow : null;
    allDocs.push({ snap: d, ts, sourceRow });
  });

  seededSnap.forEach((d) => {
    const data = d.data();
    const ts = getTimestampMillis(data.createdAt) || getTimestampMillis(data.dateAccredited);
    const sourceRow = Number.isInteger(data.sourceRow) ? data.sourceRow : null;
    allDocs.push({ snap: d, ts, sourceRow });
  });

  if (allDocs.length === 0) return [];

  allDocs.sort((a, b) => {
    if (a.sourceRow !== null && b.sourceRow !== null) return a.sourceRow - b.sourceRow;
    if (a.sourceRow !== null) return -1;
    if (b.sourceRow !== null) return 1;
    return b.ts - a.ts;
  });

  return allDocs.map(({ snap }, i) => mapDocToRecord(snap.id, snap.data(), i + 1));
}

/**
 * Create a new CSO record in Firestore.
 */
export async function createFirestoreCSORecord(input: CSORecordInput): Promise<CSORecord> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured on the server.');
  }

  const newId = 'cso-' + Date.now();
  const createdAtIso = new Date().toISOString();

  const recordToSave = { ...input, sector: input.sector.trim() || null };
  const newRecord: CSORecord = {
    ...recordToSave,
    id: newId,
    no: 0,
    createdAt: createdAtIso,
  };

  const docRef = doc(db, COLLECTION_MANUAL, newId);
  await setDoc(docRef, {
    ...recordToSave,
    id: newId,
    createdAt: Timestamp.now(),
  });

  return newRecord;
}

/**
 * Update an existing CSO record in Firestore.
 */
export async function updateFirestoreCSORecord(
  record: CSORecord,
  updates: CSORecordInput
): Promise<CSORecord> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured on the server.');
  }

  const updatesToSave = { ...updates, sector: updates.sector.trim() || null };
  const updatedRecord = { ...record, ...updatesToSave };

  const manualRecordRef = doc(db, COLLECTION_MANUAL, record.id);
  const manualSnapshot = await getDoc(manualRecordRef);
  const recordRef = manualSnapshot.exists() ? manualRecordRef : doc(db, COLLECTION_SEEDED, record.id);
  const snapshot = manualSnapshot.exists() ? manualSnapshot : await getDoc(recordRef);

  if (!snapshot.exists()) {
    throw new Error('This CSO record could not be found in the database.');
  }

  await setDoc(recordRef, updatesToSave, { merge: true });
  return updatedRecord;
}

/**
 * Archive or restore a CSO record in Firestore.
 */
export async function setFirestoreCSORecordArchived(
  record: CSORecord,
  archived: boolean
): Promise<CSORecord> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured on the server.');
  }

  const updatedRecord = { ...record, archived };

  const manualRecordRef = doc(db, COLLECTION_MANUAL, record.id);
  const manualSnapshot = await getDoc(manualRecordRef);
  const recordRef = manualSnapshot.exists() ? manualRecordRef : doc(db, COLLECTION_SEEDED, record.id);
  const snapshot = manualSnapshot.exists() ? manualSnapshot : await getDoc(recordRef);

  if (!snapshot.exists()) {
    throw new Error('This CSO record could not be found in the database.');
  }

  await setDoc(recordRef, { archived }, { merge: true });
  return updatedRecord;
}

/**
 * Delete an archived CSO record from Firestore.
 */
export async function deleteFirestoreCSORecord(record: CSORecord): Promise<void> {
  if (!record.archived) {
    throw new Error('Only archived CSO records can be deleted.');
  }

  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured on the server.');
  }

  const manualRecordRef = doc(db, COLLECTION_MANUAL, record.id);
  const manualSnapshot = await getDoc(manualRecordRef);
  const recordRef = manualSnapshot.exists() ? manualRecordRef : doc(db, COLLECTION_SEEDED, record.id);
  const snapshot = manualSnapshot.exists() ? manualSnapshot : await getDoc(recordRef);

  if (!snapshot.exists() || snapshot.data().archived !== true) {
    throw new Error('This archived CSO record could not be found in the database.');
  }

  if (record.certificateAttachment?.storagePath) {
    await deleteFromCloudinary(
      record.certificateAttachment.storagePath,
      record.certificateAttachment.resourceType
    );
  }

  await deleteDoc(recordRef);
}

/**
 * Fetch a single CSO record by id from Firestore.
 */
export async function getFirestoreCSORecordById(id: string): Promise<CSORecord | null> {
  if (!isFirebaseConfigured || !db) {
    return null;
  }

  const manualRecordRef = doc(db, COLLECTION_MANUAL, id);
  const manualSnapshot = await getDoc(manualRecordRef);
  if (manualSnapshot.exists()) {
    return mapDocToRecord(manualSnapshot.id, manualSnapshot.data(), 1);
  }

  const seededRecordRef = doc(db, COLLECTION_SEEDED, id);
  const seededSnapshot = await getDoc(seededRecordRef);
  if (seededSnapshot.exists()) {
    return mapDocToRecord(seededSnapshot.id, seededSnapshot.data(), 1);
  }

  return null;
}

/**
 * Get a download URL for a certificate attachment stored in Cloudinary.
 */
export async function getFirestoreCertificateAttachmentUrl(record: CSORecord): Promise<string> {
  const attachment = record.certificateAttachment;
  if (!attachment) {
    throw new Error('No certificate attachment is available for this CSO.');
  }

  if (!attachment.url) {
    throw new Error('No attachment URL is available for this CSO.');
  }

  return attachment.url;
}

/**
 * Save a Cloudinary certificate attachment metadata object onto a CSO record in Firestore.
 */
export async function saveFirestoreCertificateAttachment(
  record: CSORecord,
  attachment: CertificateAttachment
): Promise<CSORecord> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured on the server.');
  }

  const manualRecordRef = doc(db, COLLECTION_MANUAL, record.id);
  const manualSnapshot = await getDoc(manualRecordRef);
  const recordRef = manualSnapshot.exists() ? manualRecordRef : doc(db, COLLECTION_SEEDED, record.id);
  const snapshot = manualSnapshot.exists() ? manualSnapshot : await getDoc(recordRef);

  if (!snapshot.exists()) {
    throw new Error('This CSO record could not be found in the database.');
  }

  const previousPath = record.certificateAttachment?.storagePath;
  if (previousPath && previousPath !== attachment.storagePath) {
    await deleteFromCloudinary(previousPath, record.certificateAttachment?.resourceType);
  }

  await setDoc(recordRef, { certificateAttachment: attachment }, { merge: true });

  return { ...record, certificateAttachment: attachment };
}

/**
 * Remove a certificate attachment from Cloudinary and its CSO record.
 */
export async function removeFirestoreCertificateAttachment(
  record: CSORecord
): Promise<CSORecord> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured on the server.');
  }

  const manualRecordRef = doc(db, COLLECTION_MANUAL, record.id);
  const manualSnapshot = await getDoc(manualRecordRef);
  const recordRef = manualSnapshot.exists() ? manualRecordRef : doc(db, COLLECTION_SEEDED, record.id);
  const snapshot = manualSnapshot.exists() ? manualSnapshot : await getDoc(recordRef);

  if (!snapshot.exists()) {
    throw new Error('This CSO record could not be found in the database.');
  }

  const attachment = snapshot.data().certificateAttachment as CertificateAttachment | undefined;
  if (attachment?.storagePath) {
    await deleteFromCloudinary(attachment.storagePath, attachment.resourceType);
  }

  await setDoc(recordRef, { certificateAttachment: deleteField() }, { merge: true });

  return { ...record, certificateAttachment: undefined };
}