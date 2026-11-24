'use client';

import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useAuth } from '@/client/context/AuthContext';
import { CSORecord, CSORecordInput } from '@/client/types';
import { fetchCreateCSORecord, fetchUpdateCSORecord } from '@/client/lib/api';
import { useModalAccessibility } from '@/client/lib/useModalAccessibility';
import { CSORegistrationForm } from '@/client/components/CSORegistrationForm';
import { ConfirmDialog } from '@/client/components/ConfirmDialog';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newRecord: CSORecord) => void;
  record?: CSORecord | null;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  record = null,
}) => {
  const { isAdmin } = useAuth();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const requestClose = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
      return;
    }
    onClose();
  };

  useModalAccessibility({
    isOpen: isAdmin && isOpen,
    onClose: requestClose,
    containerRef: dialogRef,
    initialFocusRef: closeButtonRef,
    canClose: !showDiscardConfirm,
  });

  if (!isAdmin || !isOpen || typeof document === 'undefined') return null;

  const handleSubmitRecord = async (formData: CSORecordInput) => {
    const savedRecord = record
      ? await fetchUpdateCSORecord(record.id, formData)
      : await fetchCreateCSORecord(formData);
    setIsDirty(false);
    onSuccess(savedRecord);
    onClose();
  };

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-modal-title"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isDirty) {
            onClose();
          }
        }}
      >
        <div
          ref={dialogRef}
          className="relative w-full max-w-3xl max-h-[calc(100dvh-1.5rem)] overflow-y-auto md:overflow-visible bg-white rounded-2xl shadow-2xl"
        >
          <div className="bg-white px-6 pt-4 pb-3 flex items-center justify-between border-b border-gray-100 rounded-t-2xl">
            <div>
              <h2 id="register-modal-title" className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                {record ? 'Edit CSO record' : 'Add an SP accreditation record'}
              </h2>
              <p className="text-xs sm:text-sm text-[#4B5563]">
                Capture the fields used in the official 2025–2028 CSO registry.
              </p>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={requestClose}
              className="flex min-h-9 items-center gap-1.5 px-2.5 rounded-lg text-sm text-[#374151] hover:text-gray-900 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#143C2C] transition-colors"
            >
              <X size={18} />
              <span className="hidden sm:inline font-medium">Cancel</span>
            </button>
          </div>

          <div className="px-6 py-4">
            <CSORegistrationForm
              record={record}
              onSubmitRecord={handleSubmitRecord}
              onCancel={requestClose}
              onDirtyChange={setIsDirty}
              variant="modal"
            />
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDiscardConfirm}
        title="Discard unsaved changes?"
        description="You have unsaved edits in this form. Closing now will lose those changes."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        onConfirm={() => {
          setShowDiscardConfirm(false);
          setIsDirty(false);
          onClose();
        }}
        onCancel={() => setShowDiscardConfirm(false)}
      />
    </>,
    document.body
  );
};
