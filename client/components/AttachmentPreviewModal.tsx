'use client';

import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { X as CloseIcon } from 'lucide-react';
import { CSORecord } from '@/client/types';
import { useModalAccessibility } from '@/client/lib/useModalAccessibility';

interface AttachmentPreviewModalProps {
  viewingAttachment: { record: CSORecord; url: string } | null;
  onClose: () => void;
}

export const AttachmentPreviewModal: React.FC<AttachmentPreviewModalProps> = ({
  viewingAttachment,
  onClose,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useModalAccessibility({
    isOpen: Boolean(viewingAttachment),
    onClose,
    containerRef: dialogRef,
    initialFocusRef: closeButtonRef,
  });

  if (!viewingAttachment || typeof document === 'undefined') return null;

  const title = viewingAttachment.record.certificateAttachment?.name || 'Attachment';

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="attachment-preview-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="flex h-[min(90vh,900px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <h2 id="attachment-preview-title" className="truncate pr-4 text-sm font-semibold text-gray-900">
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245b29]"
            aria-label="Close attachment preview"
          >
            <CloseIcon size={18} />
          </button>
        </div>
        <iframe
          src={viewingAttachment.url}
          title={title}
          className="min-h-0 flex-1 border-0"
        />
        <div className="flex items-center justify-between gap-4 border-t border-gray-200 px-5 py-3 text-sm">
          <span className="text-gray-600">If the preview is blank, open or download the file directly.</span>
          <div className="flex shrink-0 gap-3">
            <a
              href={viewingAttachment.url}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[#245b29] underline"
            >
              Open file
            </a>
            <a
              href={viewingAttachment.url}
              download={viewingAttachment.record.certificateAttachment?.name || true}
              className="font-semibold text-[#245b29] underline"
            >
              Download
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
