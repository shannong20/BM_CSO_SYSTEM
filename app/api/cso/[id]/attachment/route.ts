import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/server/auth/session';
import {
  createCloudinarySignedUpload,
  isCloudinaryConfigured,
} from '@/server/cloudinary';
import {
  getFirestoreCSORecordById,
  getFirestoreCertificateAttachmentUrl,
  saveFirestoreCertificateAttachment,
} from '@/server/cso/queries';
import type { CertificateAttachment } from '@/shared/types';

export async function GET(
  _request: Request,
  context: { params: { id: string } }
) {
  try {
    const record = await getFirestoreCSORecordById(context.params.id);
    if (!record) {
      return NextResponse.json(
        { success: false, error: 'CSO record not found.' },
        { status: 404 }
      );
    }

    const url = await getFirestoreCertificateAttachmentUrl(record);
    return NextResponse.json({
      success: true,
      data: { url },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load attachment URL.',
      },
      { status: 400 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  const unauthorized = requireAdminSession(request);
  if (unauthorized) return unauthorized;

  try {
    if (!isCloudinaryConfigured) {
      return NextResponse.json(
        { success: false, error: 'Cloudinary is not configured on the server.' },
        { status: 503 }
      );
    }

    const record = await getFirestoreCSORecordById(context.params.id);
    if (!record) {
      return NextResponse.json(
        { success: false, error: 'CSO record not found.' },
        { status: 404 }
      );
    }

    const body = (await request.json()) as {
      action?: string;
      name?: string;
      contentType?: string;
      storagePath?: string;
      url?: string;
      resourceType?: string;
    };

    if (body.action === 'sign') {
      const signedPayload = createCloudinarySignedUpload(record.id);
      return NextResponse.json({
        success: true,
        data: signedPayload,
      });
    }

    if (body.action === 'complete') {
      if (!body.name || !body.storagePath || !body.url) {
        return NextResponse.json(
          { success: false, error: 'Missing attachment metadata.' },
          { status: 400 }
        );
      }

      const attachment: CertificateAttachment = {
        name: body.name,
        contentType: body.contentType || 'application/octet-stream',
        storagePath: body.storagePath,
        url: body.url,
        resourceType: body.resourceType,
      };

      const updatedRecord = await saveFirestoreCertificateAttachment(record, attachment);
      return NextResponse.json(updatedRecord);
    }

    return NextResponse.json(
      { success: false, error: 'Unsupported attachment action.' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process attachment.',
      },
      { status: 500 }
    );
  }
}
