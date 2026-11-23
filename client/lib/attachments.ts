/**
 * Client-side certificate attachment helpers using IndexedDB.
 * This file is CLIENT-ONLY. It never touches Firebase Storage directly;
 * server-side Storage operations go through Next.js API routes.
 */

import type { CSORecord, CertificateAttachment } from '@/client/types';

const ATTACHMENTS_DB_NAME = 'csotrack_attachments';
const ATTACHMENTS_STORE_NAME = 'certificates';

function openAttachmentsDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(ATTACHMENTS_DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(ATTACHMENTS_STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open certificate storage.'));
  });
}

async function getLocalCertificate(recordId: string): Promise<Blob> {
  const database = await openAttachmentsDatabase();
  try {
    return await new Promise<Blob>((resolve, reject) => {
      const request = database
        .transaction(ATTACHMENTS_STORE_NAME, 'readonly')
        .objectStore(ATTACHMENTS_STORE_NAME)
        .get(recordId);
      request.onsuccess = () => {
        if (request.result instanceof Blob) {
          resolve(request.result);
        } else {
          reject(new Error('The saved certificate could not be found in this browser.'));
        }
      };
      request.onerror = () => reject(request.error ?? new Error('Could not read the saved certificate.'));
    });
  } finally {
    database.close();
  }
}

async function deleteLocalCertificate(recordId: string): Promise<void> {
  const database = await openAttachmentsDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(ATTACHMENTS_STORE_NAME, 'readwrite');
      transaction.objectStore(ATTACHMENTS_STORE_NAME).delete(recordId);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('Could not delete the saved certificate.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('Certificate deletion was interrupted.'));
    });
  } finally {
    database.close();
  }
}

/**
 * Save a certificate file blob into IndexedDB keyed by record id.
 */
export async function saveLocalCertificate(recordId: string, file: File): Promise<void> {
  const database = await openAttachmentsDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(ATTACHMENTS_STORE_NAME, 'readwrite');
      transaction.objectStore(ATTACHMENTS_STORE_NAME).put(file, recordId);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('Could not save the certificate.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('Certificate save was interrupted.'));
    });
  } finally {
    database.close();
  }
}

/**
 * Get a local (IndexedDB) certificate attachment URL as an object URL.
 */
export async function getLocalCertificateAttachmentUrl(recordId: string): Promise<string> {
  if (typeof indexedDB === 'undefined') {
    throw new Error('Certificate attachments are not supported in this browser.');
  }
  const file = await getLocalCertificate(recordId);
  return URL.createObjectURL(file);
}

/**
 * Delete a local (IndexedDB) certificate attachment.
 */
export async function removeLocalCertificateAttachment(recordId: string): Promise<void> {
  if (typeof indexedDB === 'undefined') {
    throw new Error('Certificate attachments are not supported in this browser.');
  }
  await deleteLocalCertificate(recordId);
}

/**
 * Build a CertificateAttachment object from a File (local-only, no storagePath yet).
 */
export function buildLocalAttachment(file: File): CertificateAttachment {
  return {
    name: file.name,
    contentType: file.type,
  };
}