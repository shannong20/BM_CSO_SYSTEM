import React from 'react';
import Link from 'next/link';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  badgeText?: string;
  badgeType?: 'success' | 'warning' | 'info';
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  delayMs?: number;
  href?: string;
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
  delayMs = 0,
  href,
}) => {
  const content = (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1.5 min-w-0">
        <p className="text-sm font-semibold text-[#374151]">{title}</p>
        <div className="flex items-baseline gap-2.5 flex-wrap">
          <p className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight tabular-nums">
            {value}
          </p>
          {badgeText && (
            <span
              className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full tabular-nums ${
                badgeType === 'success'
                  ? 'bg-[#EEF5F0] text-[#143C2C]'
                  : 'bg-[#F3F4F6] text-[#374151]'
              }`}
            >
              {badgeText}
            </span>
          )}
        </div>
        {subValue && (
          <p className="text-sm text-[#4B5563] flex items-center gap-1.5">
            <span>{subValue}</span>
            {href && (
              <ArrowRight
                size={14}
                className="text-[#245b29] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0"
              />
            )}
          </p>
        )}
      </div>

      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBgColor} ${iconColor}`}
      >
        <Icon size={24} />
      </div>
    </div>
  );

  const cardClasses =
    'block bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-sm transition-all group animate-fadeIn';

  if (href) {
    return (
      <Link
        href={href}
        style={delayMs > 0 ? { animationDelay: `${delayMs}ms` } : undefined}
        className={`${cardClasses} hover:border-[#245b29]/40 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#143C2C]`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      style={delayMs > 0 ? { animationDelay: `${delayMs}ms` } : undefined}
      className={cardClasses}
    >
      {content}
    </div>
  );
};
