export type AccreditationStatus = 'Accredited' | 'Pending' | 'Expired' | 'Unknown';

export interface CertificateAttachment {
  name: string;
  contentType: string;
  storagePath?: string;
  url?: string;
  resourceType?: string;
}

export interface CSORecord {
  id: string;
  no?: number;
  organizationName: string;
  lguRepresented: string;
  sector: string | null;
  address: string;
  advocacy: string;
  isWomenLed: boolean | null;
  representativeName: string;
  position: string;
  contactNumber: string;
  emailAddress: string;
  accreditingAgency: string;
  resolutionNo: string;
  dateAccredited: string;
  status: AccreditationStatus;
  archived?: boolean;
  certificateAttachment?: CertificateAttachment;
  createdAt?: string;
}

export const UNSPECIFIED_VALUE = 'NOT SPECIFIED, INPUT VALUE';
export const UNSPECIFIED_LGU = UNSPECIFIED_VALUE;

export function valueOrUnspecified(value: unknown): string {
  if (typeof value !== 'string') return UNSPECIFIED_VALUE;
  const trimmed = value.trim();
  return !trimmed || /^=\s*AI\s*\(/i.test(trimmed)
    ? UNSPECIFIED_VALUE
    : trimmed;
}

export type CSORecordInput = Omit<Pick<
  CSORecord,
  | 'organizationName'
  | 'lguRepresented'
  | 'sector'
  | 'address'
  | 'advocacy'
  | 'isWomenLed'
  | 'representativeName'
  | 'position'
  | 'contactNumber'
  | 'emailAddress'
  | 'accreditingAgency'
  | 'resolutionNo'
  | 'dateAccredited'
  | 'status'
>, 'sector'> & { sector: string };

export const LA_UNION_LGUS = [
  'AGOO, LA UNION',
  'ARINGAY, LA UNION',
  'BACNOTAN, LA UNION',
  'BALAOAN, LA UNION',
  'BANGAR, LA UNION',
  'BAUANG, LA UNION',
  'BURGOS, LA UNION',
  'CABA, LA UNION',
  'CITY OF SAN FERNANDO, LA UNION',
  'LUNA, LA UNION',
  'NAGUILIAN, LA UNION',
  'PUGO, LA UNION',
  'ROSARIO, LA UNION',
  'SAN GABRIEL, LA UNION',
  'SAN JUAN, LA UNION',
  'SANTOL, LA UNION',
  'SANTO TOMAS, LA UNION',
  'SUDIPEN, LA UNION',
  'TUBAO, LA UNION',
] as const;

export const CSO_SECTORS = [
  'FISHERFOLKS',
  'FARMERS',
  'YOUTH',
  'WOMEN',
  'PERSONS WITH DISABILITIES',
  'TRANSPORT',
  'SENIOR CITIZENS',
  'INDIGENOUS PEOPLES',
  'COOPERATIVES',
  'BUSINESS & TRADE',
  'ENVIRONMENTAL',
  'HEALTH',
  'EDUCATION',
  'CIVIC / COMMUNITY',
] as const;

export const ACCREDITING_AGENCIES = [
  'DOLE',
  'CDA',
  'SEC',
  'DILG',
  'DA',
  'DSWD',
  'NCIP',
  'Other',
] as const;