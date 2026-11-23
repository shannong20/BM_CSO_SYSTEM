import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  badgeText?: string;
  badgeType?: 'success' | 'warning' | 'info';
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subValue,
  badgeText,
  badgeType = 'success',
  icon: Icon,
  iconBgColor = 'bg-emerald-50',
  iconColor = 'text-emerald-700',
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[#374151] uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-2.5">
            <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</p>
            {badgeText && (
              <span
                className={`inline-flex min-h-10 items-center text-sm font-bold px-3 rounded-full ${
                  badgeType === 'success'
                    ? 'bg-[#E8F5E9] text-[#2E7D32]'
                    : badgeType === 'warning'
                    ? 'bg-[#FFF3E0] text-[#8A3D00]'
                    : 'bg-blue-50 text-blue-700'
                }`}
              >
                {badgeText}
              </span>
            )}
          </div>
          {subValue && <p className="text-sm text-[#374151] mt-1">{subValue}</p>}
        </div>

        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBgColor} ${iconColor} group-hover:scale-105 transition-transform`}
        >
          <Icon size={24} />
        </div>
      </div>

      {/* Decorative subtle bottom accent bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#4E8D42]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};