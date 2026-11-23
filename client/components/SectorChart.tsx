'use client';

import React, { useState } from 'react';
import { CSORecord } from '@/client/types';

interface SectorChartProps {
  records: CSORecord[];
}

const DEFAULT_VISIBLE_SECTORS = 12;

export const SectorChart: React.FC<SectorChartProps> = ({ records }) => {
  const [showAllSectors, setShowAllSectors] = useState(false);

  // Aggregate by sector
  const sectorCounts: { [key: string]: number } = {};
  records.forEach((r) => {
    if (!r.sector) return;
    sectorCounts[r.sector] = (sectorCounts[r.sector] || 0) + 1;
  });

  const sortedSectors = Object.entries(sectorCounts).sort((a, b) => b[1] - a[1]);
  const displayedSectors = showAllSectors
    ? sortedSectors
    : sortedSectors.slice(0, DEFAULT_VISIBLE_SECTORS);
  const maxCount = Math.max(...Object.values(sectorCounts), 1);

  // Status breakdown
  const accreditedCount = records.filter((r) => r.status === 'Accredited').length;
  const pendingCount = records.filter((r) => r.status === 'Pending').length;
  const expiredCount = records.filter((r) => r.status === 'Expired').length;
  const total = records.length || 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sector Distribution Card */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-gray-900">Sector Distribution</h2>
            <p className="text-sm text-[#374151]">Breakdown of registered CSOs by category across La Union</p>
          </div>
          <span className="inline-flex min-h-10 items-center text-sm font-semibold px-3 rounded-lg bg-emerald-50 text-emerald-900">
            {sortedSectors.length} Sectors Active
          </span>
        </div>

        <div className={sortedSectors.length === 0 ? '' : 'grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3'}>
          {sortedSectors.length === 0 ? (
            <div className="rounded-xl bg-gray-50 px-4 py-10 text-center text-sm text-[#374151]">
              No sector data available yet.
            </div>
          ) : (
            displayedSectors.map(([sector, count]) => {
              const percentage = Math.round((count / total) * 100);
              return (
                <div key={sector} className="space-y-1.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-[#374151]">{sector}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{count} org{count > 1 ? 's' : ''}</span>
                      <span className="text-[#374151]">({percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#4E8D42] to-[#6EB160] rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {sortedSectors.length > DEFAULT_VISIBLE_SECTORS && (
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAllSectors((prev) => !prev)}
              className="inline-flex min-h-9 items-center rounded-lg px-3 text-sm font-semibold text-[#245b29] hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245b29]"
            >
              {showAllSectors
                ? 'Show top 12 sectors'
                : `Show all ${sortedSectors.length} sectors`}
            </button>
          </div>
        )}
      </div>

      {/* Accreditation Status Breakdown */}
      <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-1">Accreditation Status</h2>
          <p className="text-sm text-[#374151] mb-6">Current validity breakdown (Term 2025–2028)</p>

          <div className="space-y-4">
            {/* Accredited */}
            <div className="min-h-16 p-4 rounded-xl bg-[#F0FDF4] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#2E7D32]"></span>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Accredited</h3>
                  <p className="text-sm text-[#245b29] font-medium">Valid SP Resolution</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-[#2E7D32]">{accreditedCount}</span>
                <span className="text-sm text-[#374151] block">
                  {Math.round((accreditedCount / total) * 100)}%
                </span>
              </div>
            </div>

            {/* Pending */}
            <div className="min-h-16 p-4 rounded-xl bg-[#FFFBEB] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#8A3D00]"></span>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Pending Review</h3>
                  <p className="text-sm text-[#8A3D00] font-medium">Secretariat verification</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-[#8A3D00]">{pendingCount}</span>
                <span className="text-sm text-[#374151] block">
                  {Math.round((pendingCount / total) * 100)}%
                </span>
              </div>
            </div>

            {/* Expired */}
            <div className="min-h-16 p-4 rounded-xl bg-[#FEF2F2] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#B42318]"></span>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Expired</h3>
                  <p className="text-sm text-[#B42318] font-medium">Requires renewal</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-[#B42318]">{expiredCount}</span>
                <span className="text-sm text-[#374151] block">
                  {Math.round((expiredCount / total) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Small Note */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-[#374151] leading-normal">
          Registry records are monitored by the Sangguniang Panlalawigan Committee on Accreditation.
        </div>
      </div>
    </div>
  );
};