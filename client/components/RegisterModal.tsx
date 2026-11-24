'use client';

import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useAuth } from '@/client/context/AuthContext';
import { CSORecord, CSORecordInput } from '@/client/types';
import { fetchCreateCSORecord, fetchUpdateCSORecord } from '@/client/lib/api';
import { useModalAccessibility } from '@/client/lib/useModalAccessibility';
import { CSORegistrationForm } from '@/client/components/CSORegistrationForm';

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

  useModalAccessibility({
    isOpen: isAdmin && isOpen,
    onClose,
    containerRef: dialogRef,
    initialFocusRef: closeButtonRef,
  });

  if (!isAdmin || !isOpen || typeof document === 'undefined') return null;

  const handleSubmitRecord = async (formData: CSORecordInput) => {
    const savedRecord = record
      ? await fetchUpdateCSORecord(record.id, formData)
      : await fetchCreateCSORecord(formData);
    onSuccess(savedRecord);
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 md:p-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-4xl max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] md:max-h-[calc(100dvh-5rem)] bg-white rounded-2xl shadow-2xl overflow-y-auto"
      >
        <div className="bg-white px-6 py-5 flex items-center justify-between">
          <div>
            <h2 id="register-modal-title" className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {record ? 'Edit CSO record' : 'Add an SP accreditation record'}
            </h2>
            <p className="text-sm text-[#374151] mt-0.5">
              Capture the fields used in the official 2025–2028 CSO registry.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex min-h-10 items-center gap-1.5 px-3 rounded-lg text-sm text-[#374151] hover:text-gray-900 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#143C2C] transition-colors"
          >
            <X size={18} />
            <span className="hidden sm:inline font-medium">Cancel</span>
          </button>
        </div>

        <div className="p-6 sm:p-8">
          <CSORegistrationForm
            record={record}
            onSubmitRecord={handleSubmitRecord}
            onCancel={onClose}
            variant="modal"
          />
        </div>
      </div>
    </div>,
    document.body
  );
};
