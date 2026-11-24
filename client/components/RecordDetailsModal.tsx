'use client';

import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Check,
  X as CloseIcon,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Paperclip,
  Pencil,
  Trash2,
} from 'lucide-react';
import { CSORecord, UNSPECIFIED_VALUE, valueOrUnspecified } from '@/client/types';
import { StatusBadge } from '@/client/components/StatusBadge';
import { useModalAccessibility } from '@/client/lib/useModalAccessibility';

interface RecordDetailsModalProps {
  record: CSORecord | null;
  isAdmin: boolean;
  onClose: () => void;
  onEdit?: (record: CSORecord) => void;
  onViewAttachment: (record: CSORecord) => void;
  onAddAttachmentClick?: (record: CSORecord) => void;
  onRemoveAttachmentClick?: (record: CSORecord) => void;
  openingAttachmentRecordId: string | null;
  uploadingAttachmentRecordId: string | null;
  removingAttachmentRecordId: string | null;
  attachmentError: { recordId: string; message: string } | null;
  attachmentUploadError: { recordId: string; message: string } | null;
  attachmentRemoveError: { recordId: string; message: string } | null;
}

function displayValue(value: string | null | undefined): string {
  return valueOrUnspecified(value);
}

export const RecordDetailsModal: React.FC<RecordDetailsModalProps> = ({
  record,
  isAdmin,
  onClose,
  onEdit,
  onViewAttachment,
  onAddAttachmentClick,
  onRemoveAttachmentClick,
  openingAttachmentRecordId,
  uploadingAttachmentRecordId,
  removingAttachmentRecordId,
  attachmentError,
  attachmentUploadError,
  attachmentRemoveError,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useModalAccessibility({
    isOpen: Boolean(record),
    onClose,
    containerRef: dialogRef,
    initialFocusRef: closeButtonRef,
  });

  if (!record || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="record-details-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-5 border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.08)] relative animate-fadeIn"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg text-[#374151] hover:text-gray-900 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245b29]"
          aria-label="Close record details"
        >
          <CloseIcon size={18} />
        </button>

        <div className="flex flex-wrap items-center gap-2 mb-1.5 pr-10">
          <StatusBadge status={record.status} />
          {(record.isWomenLed === true || record.isWomenLed === false) && (
            <span
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-semibold text-sm ${
                record.isWomenLed
                  ? 'bg-[#E8F5E9] text-[#245b29]'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {record.isWomenLed && <Check size={12} strokeWidth={3} />}
              {record.isWomenLed ? 'Women-Led Organization' : 'Not Women-Led'}
            </span>
          )}
          {record.isWomenLed !== true && record.isWomenLed !== false && (
            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 font-semibold text-sm">
              Women-Led: {UNSPECIFIED_VALUE}
            </span>
          )}
        </div>

        <h2 id="record-details-title" className="text-xl font-bold text-gray-900 mt-1.5">
          {displayValue(record.organizationName)}
        </h2>
        <p className="text-sm text-[#374151] mt-1 flex items-center gap-1">
          <MapPin size={13} className="text-emerald-700 shrink-0" />
          <span>
            {displayValue(record.address)} ({displayValue(record.lguRepresented)})
          </span>
        </p>

        <div className="mt-3.5 p-3 rounded-xl bg-gray-50">
          <span className="text-sm font-bold uppercase tracking-wider text-[#374151] block mb-0.5">
            ADVOCACY &amp; PURPOSE
          </span>
          <p className="text-sm text-[#374151] leading-snug font-medium">
            {displayValue(record.advocacy)}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3.5 text-sm">
          <div>
            <span className="text-[#374151] block">Sector</span>
            <span className="font-semibold text-gray-800">{displayValue(record.sector)}</span>
          </div>
          <div>
            <span className="text-[#374151] block">Accrediting Agency</span>
            <span className="font-semibold text-gray-800">{displayValue(record.accreditingAgency)}</span>
          </div>
          <div>
            <span className="text-[#374151] block">Representative</span>
            <span className="font-semibold text-gray-800">{displayValue(record.representativeName)}</span>
            <span className="text-sm text-[#374151] block">{displayValue(record.position)}</span>
          </div>
          <div>
            <span className="text-[#374151] block">Resolution No.</span>
            <span className="font-mono font-semibold text-gray-800">{displayValue(record.resolutionNo)}</span>
          </div>
          <div className="sm:col-span-2 pt-2 border-t border-gray-200 flex flex-wrap gap-4 text-[#374151]">
            <span className="flex items-center gap-1.5">
              <Phone size={13} /> {displayValue(record.contactNumber)}
            </span>
            <span className="flex items-center gap-1.5">
              <Mail size={13} /> {displayValue(record.emailAddress)}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={13} /> Accredited: {displayValue(record.dateAccredited)}
            </span>
          </div>

          <div className="sm:col-span-2 pt-2.5 border-t border-gray-200 space-y-1.5">
            <span className="text-[#374151] block font-medium">Attachment</span>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gray-50 px-3 py-2">
              <span className="truncate text-sm text-gray-700">
                {record.certificateAttachment
                  ? record.certificateAttachment.name
                  : 'No file attached.'}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                {record.certificateAttachment && (
                  <button
                    type="button"
                    onClick={() => onViewAttachment(record)}
                    disabled={openingAttachmentRecordId !== null}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 text-sm font-semibold text-[#245b29] hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245b29] disabled:opacity-60"
                  >
                    <Paperclip size={14} />
                    {openingAttachmentRecordId === record.id ? 'Opening...' : 'View attachment'}
                  </button>
                )}
                {isAdmin && onAddAttachmentClick && (
                  <button
                    type="button"
                    onClick={() => onAddAttachmentClick(record)}
                    disabled={uploadingAttachmentRecordId !== null}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-[#374151] hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245b29] disabled:opacity-60"
                  >
                    <Paperclip size={14} />
                    {uploadingAttachmentRecordId === record.id
                      ? 'Uploading...'
                      : record.certificateAttachment
                        ? 'Replace'
                        : 'Add attachment'}
                  </button>
                )}
                {isAdmin && record.certificateAttachment && onRemoveAttachmentClick && (
                  <button
                    type="button"
                    onClick={() => onRemoveAttachmentClick(record)}
                    disabled={removingAttachmentRecordId !== null}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:opacity-60"
                  >
                    <Trash2 size={14} />
                    {removingAttachmentRecordId === record.id ? 'Removing...' : 'Remove'}
                  </button>
                )}
              </div>
            </div>
            {attachmentError?.recordId === record.id && (
              <p className="text-xs text-red-700" role="alert">
                {attachmentError.message}
              </p>
            )}
            {attachmentUploadError?.recordId === record.id && (
              <p className="text-xs text-red-700" role="alert">
                {attachmentUploadError.message}
              </p>
            )}
            {attachmentRemoveError?.recordId === record.id && (
              <p className="text-xs text-red-700" role="alert">
                {attachmentRemoveError.message}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-3">
          {isAdmin && onEdit && (
            <button
              type="button"
              onClick={() => {
                onEdit(record);
                onClose();
              }}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-[#374151] shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245b29]"
            >
              <Pencil size={15} />
              Edit
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 px-5 py-2 rounded-xl bg-[#315f2b] hover:bg-[#244b20] text-white text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245b29] transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
