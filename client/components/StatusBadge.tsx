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
        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-[#E8F5E9] text-[#245b29] ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] mr-1.5"></span>
        Accredited
      </span>
    );
  }

  if (normStatus === 'pending') {
    return (
      <span
        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-[#FFF3E0] text-[#8A3D00] ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#EF6C00] mr-1.5"></span>
        Pending
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-1.5"></span>
      Not specified
    </span>
  );
};