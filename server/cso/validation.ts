/**
 * Server-side validation for CSO record input.
 * Never imported by client components.
 */

import type { CSORecordInput, AccreditationStatus } from '@/shared/types';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateCSORecordInput(data: unknown): { valid: true; data: CSORecordInput } | { valid: false; errors: ValidationError[] } {
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: [{ field: 'root', message: 'Invalid record data.' }] };
  }

  const d = data as Record<string, unknown>;
  const errors: ValidationError[] = [];

  const requiredStringFields: (keyof CSORecordInput)[] = [
    'organizationName', 'lguRepresented', 'sector', 'address',
    'advocacy', 'representativeName', 'position', 'contactNumber',
    'emailAddress', 'accreditingAgency', 'resolutionNo', 'dateAccredited',
  ];

  for (const field of requiredStringFields) {
    const value = d[field];
    if (typeof value !== 'string' || !value.trim()) {
      errors.push({ field, message: `${field} is required.` });
    }
  }

  const status = d['status'];
  const validStatuses: AccreditationStatus[] = ['Accredited', 'Pending'];
  if (typeof status !== 'string' || !validStatuses.includes(status as AccreditationStatus)) {
    errors.push({ field: 'status', message: 'Invalid accreditation status.' });
  }

  const isWomenLed = d['isWomenLed'];
  if (typeof isWomenLed !== 'boolean') {
    errors.push({ field: 'isWomenLed', message: 'isWomenLed must be a boolean.' });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      organizationName: d.organizationName as string,
      lguRepresented: d.lguRepresented as string,
      sector: d.sector as string,
      address: d.address as string,
      advocacy: d.advocacy as string,
      isWomenLed: d.isWomenLed as boolean,
      representativeName: d.representativeName as string,
      position: d.position as string,
      contactNumber: d.contactNumber as string,
      emailAddress: d.emailAddress as string,
      accreditingAgency: d.accreditingAgency as string,
      resolutionNo: d.resolutionNo as string,
      dateAccredited: d.dateAccredited as string,
      status: status as AccreditationStatus,
    },
  };
}