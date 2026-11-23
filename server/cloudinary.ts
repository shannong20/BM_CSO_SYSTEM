import { createHash } from 'crypto';

/**
 * Server-only Cloudinary helper for direct signed uploads and asset deletion.
 * Uses Cloudinary's REST API directly with SHA-1 signatures (no extra SDK needed).
 */

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() || '';
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim() || '';
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim() || '';
  return { cloudName, apiKey, apiSecret };
}

export const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
    process.env.CLOUDINARY_API_KEY?.trim() &&
    process.env.CLOUDINARY_API_SECRET?.trim()
);

/**
 * Generate a Cloudinary SHA-1 signature for sorted parameters.
 */
function signCloudinaryParams(
  params: Record<string, string | number>,
  apiSecret: string
): string {
  const serialized = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== '')
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return createHash('sha1').update(`${serialized}${apiSecret}`).digest('hex');
}

export interface SignedUploadPayload {
  uploadUrl: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  publicId: string;
}

/**
 * Create a signed upload payload so the browser can upload directly to Cloudinary
 * without passing file bytes through Next.js / Vercel API routes.
 */
export function createCloudinarySignedUpload(recordId: string): SignedUploadPayload {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not configured on the server.');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'cso_certificates';
  const safeRecordId = recordId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const publicId = `${safeRecordId}_${timestamp}`;

  const signature = signCloudinaryParams(
    {
      folder,
      public_id: publicId,
      timestamp,
    },
    apiSecret
  );

  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    apiKey,
    timestamp,
    signature,
    folder,
    publicId,
  };
}

/**
 * Delete an uploaded attachment from Cloudinary by public_id.
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType?: string
): Promise<void> {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  if (!cloudName || !apiKey || !apiSecret || !publicId) {
    return;
  }

  const typesToTry = resourceType ? [resourceType] : ['image', 'raw'];
  for (const type of typesToTry) {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = signCloudinaryParams(
      {
        public_id: publicId,
        timestamp,
      },
      apiSecret
    );

    const body = new URLSearchParams({
      public_id: publicId,
      timestamp: String(timestamp),
      api_key: apiKey,
      signature,
    });

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${type}/destroy`,
      {
        method: 'POST',
        body,
      }
    );

    if (response.ok) {
      const result = (await response.json()) as { result?: string };
      if (result.result === 'ok') {
        return;
      }
    }
  }
}
