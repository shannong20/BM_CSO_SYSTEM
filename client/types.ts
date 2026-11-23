/**
 * Client-facing type and value re-exports from shared.
 * Client components import from here instead of reaching into server/.
 */

// Types
export type {
  AccreditationStatus,
  CertificateAttachment,
  CSORecord,
  CSORecordInput,
} from '@/shared/types';

// Values (constants and utility functions)
export {
  LA_UNION_LGUS,
  CSO_SECTORS,
  ACCREDITING_AGENCIES,
  UNSPECIFIED_VALUE,
  UNSPECIFIED_LGU,
  valueOrUnspecified,
} from '@/shared/types';