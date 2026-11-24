/**
 * Server-side validation for CSO record input.
 * Never imported by client components.
 */

import type { CSORecordInput, AccreditationStatus } from '@/shared/types';

export interface ValidationError {
  field: string;
  message: string;
}

const VALID_STATUSES: AccreditationStatus[] = ['Accredited', 'Pending', 'Expired', 'Unknown'];

function readOptionalString(
  d: Record<string, unknown>,
  field: keyof CSORecordInput,
  errors: ValidationError[],
  fallback = ''
): string {
  const value = d[field];
  if (value === undefined || value === null) return fallback;
  if (typeof value !== 'string') {
    errors.push({ field, message: `${field} must be a string.` });
    return fallback;
  }
  return value.trim();
}

export function validateCSORecordInput(
  data: unknown
): { valid: true; data: CSORecordInput } | { valid: false; errors: ValidationError[] } {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, errors: [{ field: 'root', message: 'Invalid record data.' }] };
  }

  const d = data as Record<string, unknown>;
  const errors: ValidationError[] = [];

  const organizationName = readOptionalString(d, 'organizationName', errors);
  if (!organizationName) {
    errors.push({ field: 'organizationName', message: 'Organization name is required.' });
  }

  const lguRepresented = readOptionalString(d, 'lguRepresented', errors);
  if (!lguRepresented) {
    errors.push({ field: 'lguRepresented', message: 'LGU represented is required.' });
  }

  const sector = readOptionalString(d, 'sector', errors);
  const address = readOptionalString(d, 'address', errors);
  const advocacy = readOptionalString(d, 'advocacy', errors);
  const representativeName = readOptionalString(d, 'representativeName', errors);
  const position = readOptionalString(d, 'position', errors);
  const contactNumber = readOptionalString(d, 'contactNumber', errors);
  const emailAddress = readOptionalString(d, 'emailAddress', errors);
  const accreditingAgency = readOptionalString(d, 'accreditingAgency', errors, 'DOLE');
  const resolutionNo = readOptionalString(d, 'resolutionNo', errors);
  const dateAccredited = readOptionalString(d, 'dateAccredited', errors);

  const rawStatus = d['status'] ?? 'Accredited';
  if (typeof rawStatus !== 'string' || !VALID_STATUSES.includes(rawStatus as AccreditationStatus)) {
    errors.push({ field: 'status', message: 'Invalid accreditation status.' });
  }

  const rawWomenLed = d['isWomenLed'] === undefined ? false : d['isWomenLed'];
  if (rawWomenLed !== null && typeof rawWomenLed !== 'boolean') {
    errors.push({ field: 'isWomenLed', message: 'isWomenLed must be a boolean or null.' });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      organizationName,
      lguRepresented,
      sector,
      address,
      advocacy,
      isWomenLed: rawWomenLed as boolean | null,
      representativeName,
      position,
      contactNumber,
      emailAddress,
      accreditingAgency,
      resolutionNo,
      dateAccredited,
      status: rawStatus as AccreditationStatus,
    },
  };
}
