/**
 * Lightweight fetch wrappers for client-side data access.
 * All calls go to internal Next.js API routes (/api/...).
 * This file is CLIENT-ONLY and never touches Firebase directly.
 */

import type { CSORecord, CSORecordInput } from '@/shared/types';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
  message?: string;
}

const API_BASE = '';

async function request<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}${input}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const body = (await res.json()) as ApiResponse<T>;
  if (!res.ok) {
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }
  return body;
}

/** GET /api/cso - fetch all CSO records (with optional query params) */
export async function fetchCSORecords(params?: {
  search?: string;
  lgu?: string;
  sector?: string;
  status?: string;
}): Promise<CSORecord[]> {
  const qs = params
    ? '?' +
      new URLSearchParams(
        Object.fromEntries(
          Object.entries(params).filter(([, v]) => Boolean(v))
        ) as Record<string, string>
      )
    : '';
  const res = await request<CSORecord[]>(
    `/api/cso${qs}`
  );
  return (res.data as CSORecord[]) ?? [];
}

/** POST /api/cso - create a new CSO record */
export async function fetchCreateCSORecord(input: CSORecordInput): Promise<CSORecord> {
  const res = await request<CSORecord>('/api/cso', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return res.data as CSORecord;
}

/** PUT /api/cso/:id - update an existing CSO record */
export async function fetchUpdateCSORecord(
  id: string,
  input: Partial<CSORecordInput>
): Promise<CSORecord> {
  const res = await request<CSORecord>(`/api/cso/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  return res.data as CSORecord;
}

/** POST /api/cso/archive - archive/restore a CSO record */
export async function fetchArchiveCSORecord(
  id: string,
  archived: boolean
): Promise<CSORecord> {
  const res = await request<CSORecord>(
    `/api/cso/${id}/archive`,
    {
      method: 'POST',
      body: JSON.stringify({ archived }),
    }
  );
  return res.data as CSORecord;
}

/** DELETE /api/cso/:id - delete an archived CSO record */
export async function fetchDeleteCSORecord(id: string): Promise<void> {
  await request<{ success: boolean }>(`/api/cso/${id}`, {
    method: 'DELETE',
  });
}

/** GET /api/cso/:id/attachment - get certificate attachment URL */
export async function fetchCertificateAttachmentUrl(id: string): Promise<string> {
  const res = await request<{ url: string }>(`/api/cso/${id}/attachment`);
  return res.data?.url ?? '';
}

interface SignedCloudinaryUpload {
  uploadUrl: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  publicId: string;
}

/**
 * POST /api/cso/:id/attachment - direct signed upload to Cloudinary,
 * then persist the resulting attachment metadata to Firestore.
 */
export async function fetchUploadCertificateAttachment(
  id: string,
  file: File
): Promise<CSORecord> {
  const signRes = await request<SignedCloudinaryUpload>(`/api/cso/${id}/attachment`, {
    method: 'POST',
    body: JSON.stringify({ action: 'sign' }),
  });

  const signed = signRes.data;
  if (!signed) {
    throw new Error('Could not get signed upload parameters.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signed.apiKey);
  formData.append('timestamp', String(signed.timestamp));
  formData.append('signature', signed.signature);
  formData.append('folder', signed.folder);
  formData.append('public_id', signed.publicId);

  const cloudRes = await fetch(signed.uploadUrl, {
    method: 'POST',
    body: formData,
  });

  const cloudData = (await cloudRes.json()) as {
    public_id?: string;
    secure_url?: string;
    resource_type?: string;
    error?: { message?: string };
  };

  if (!cloudRes.ok || !cloudData.public_id || !cloudData.secure_url) {
    throw new Error(cloudData.error?.message || 'Cloudinary upload failed');
  }

  const completeRes = await fetch(`/api/cso/${id}/attachment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'complete',
      name: file.name,
      contentType: file.type,
      storagePath: cloudData.public_id,
      url: cloudData.secure_url,
      resourceType: cloudData.resource_type,
    }),
  });

  if (!completeRes.ok) {
    const body = (await completeRes.json()) as { error?: string };
    throw new Error(body.error || 'Failed to save attachment metadata');
  }

  return (await completeRes.json()) as CSORecord;
}

/** POST /api/auth/login - admin login */
export async function fetchAdminLogin(username: string, password: string): Promise<void> {
  const res = await request<{ success: boolean }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  if (!res.success) throw new Error('Login failed');
}

/** POST /api/auth/logout - logout */
export async function fetchLogout(): Promise<void> {
  await request<{ success: boolean }>('/api/auth/logout', {
    method: 'POST',
  });
}