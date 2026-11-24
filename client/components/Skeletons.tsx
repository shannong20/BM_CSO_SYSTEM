'use client';

import React from 'react';

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 6 }) => {
  return (
    <div
      className="w-full rounded-2xl bg-gray-100 p-4 space-y-3"
      aria-busy="true"
      aria-label="Loading CSO directory records"
    >
      <div className="rounded-xl bg-white overflow-hidden">
        <div className="h-12 bg-[#143C2C]/85 animate-pulse" />
        <div className="divide-y divide-gray-100 p-4 space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-3 pt-2 first:pt-0">
              <div className="col-span-1 h-5 rounded bg-gray-200 animate-pulse" />
              <div className="col-span-2 h-5 rounded bg-gray-200 animate-pulse" />
              <div className="col-span-3 h-5 rounded bg-gray-200 animate-pulse" />
              <div className="col-span-3 h-5 rounded bg-gray-200 animate-pulse" />
              <div className="col-span-3 h-5 rounded bg-gray-200 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
      <div className="h-44 rounded-2xl bg-[#143C2C]/90 p-6 sm:p-7 space-y-3 animate-pulse">
        <div className="h-4 w-64 rounded bg-white/15" />
        <div className="h-8 w-72 rounded bg-white/20" />
        <div className="h-4 w-96 max-w-full rounded bg-white/15" />
        <div className="pt-2 flex gap-2.5">
          <div className="h-9 w-40 rounded-xl bg-white/25" />
          <div className="h-9 w-36 rounded-xl bg-white/15" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-36 rounded-2xl bg-white p-6 border border-[#E5E7EB] shadow-sm space-y-3">
            <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
            <div className="h-8 w-20 rounded bg-gray-200 animate-pulse" />
            <div className="h-3 w-40 rounded bg-gray-100 animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72 rounded-2xl bg-white p-6 border border-[#E5E7EB] shadow-sm animate-pulse" />
        <div className="h-72 rounded-2xl bg-white p-6 border border-[#E5E7EB] shadow-sm animate-pulse" />
      </div>
      <TableSkeleton rows={5} />
    </div>
  );
};
