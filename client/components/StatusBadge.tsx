import React from 'react';
import { AccreditationStatus } from '@/client/types';

interface StatusBadgeProps {
  status: AccreditationStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const normStatus = status?.toLowerCase() || '';

  if (normStatus === 'accredited') {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EEF5F0] text-[#143C2C] ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#143C2C] mr-1.5" />
        Accredited
      </span>
    );
  }

  if (normStatus === 'pending') {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB] ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#6B7280] mr-1.5" />
        Pending
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F3F4F6] text-[#4B5563] ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF] mr-1.5" />
      Not specified
    </span>
  );
};
