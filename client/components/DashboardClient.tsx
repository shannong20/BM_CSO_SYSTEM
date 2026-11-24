'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/client/context/AuthContext';
import {
  Users,
  ShieldCheck,
  HeartHandshake,
  ArrowRight,
  Plus,
  Landmark,
  Clock,
} from 'lucide-react';
import { BrandLogo } from '@/client/components/BrandLogo';
import { CSORecord } from '@/client/types';
import {
  fetchArchiveCSORecord,
  fetchUploadCertificateAttachment,
} from '@/client/lib/api';
import { MetricCard } from '@/client/components/MetricCard';
import { SectorChart } from '@/client/components/SectorChart';
import { CSOTable } from '@/client/components/CSOTable';
import { RegisterModal } from '@/client/components/RegisterModal';

interface DashboardClientProps {
  initialRecords: CSORecord[];
  initialError?: string;
}

export const DashboardClient: React.FC<DashboardClientProps> = ({
  initialRecords,
  initialError = '',
}) => {
  const [records, setRecords] = useState<CSORecord[]>(initialRecords);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CSORecord | null>(null);
  const { isAdmin } = useAuth();

  const handleRegisterSuccess = (newRecord: CSORecord) => {
    if (editingRecord) {
      handleRecordUpdate(newRecord);
      setEditingRecord(null);
    } else {
      setRecords((prev) => [newRecord, ...prev]);
    }
  };

  const handleRecordUpdate = (updatedRecord: CSORecord) => {
    setRecords((prev) =>
      prev.map((record) => (record.id === updatedRecord.id ? updatedRecord : record))
    );
  };

  const handleArchive = async (record: CSORecord, archived: boolean) => {
    const updatedRecord = await fetchArchiveCSORecord(record.id, archived);
    handleRecordUpdate(updatedRecord);
  };

  const handleAddAttachment = async (record: CSORecord, file: File) => {
    const updatedRecord = await fetchUploadCertificateAttachment(record.id, file);
    handleRecordUpdate(updatedRecord);
  };

  const activeRecords = records.filter((r) => !r.archived);
  const totalCount = activeRecords.length;
  const accreditedCount = activeRecords.filter((r) => r.status === 'Accredited').length;
  const pendingCount = activeRecords.filter((r) => r.status === 'Pending').length;
  const accreditedPct = totalCount > 0 ? Math.round((accreditedCount / totalCount) * 100) : 0;

  const womenLedCount = activeRecords.filter((r) => r.isWomenLed).length;
  const womenLedKnownCount = activeRecords.filter((r) => typeof r.isWomenLed === 'boolean').length;
  const womenLedPct =
    womenLedKnownCount > 0 ? Math.round((womenLedCount / womenLedKnownCount) * 100) : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative rounded-2xl bg-[#143C2C] p-6 sm:p-7 text-white shadow-sm overflow-hidden border border-[#1E523D]">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex min-h-9 items-center gap-2 px-3.5 rounded-full bg-white/10 text-white text-sm font-medium">
            <Landmark size={15} />
            <span>Province of La Union · Sangguniang Panlalawigan (Term 2025–2028)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
            SP Accreditation Overview
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 max-w-2xl leading-relaxed">
            View accredited Civil Society Organizations across La Union, track pending reviews, or register a new organization record.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/directory"
              className="group inline-flex min-h-11 items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#143C2C] text-sm font-bold shadow-sm hover:bg-emerald-50 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all"
            >
              <span>Open CSO Directory</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>

            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex min-h-11 items-center gap-2 px-5 py-2.5 rounded-xl bg-[#27632A] border border-white/15 text-white text-sm font-semibold hover:bg-[#317835] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all"
              >
                <Plus size={16} />
                <span>Register New CSO</span>
              </button>
            )}

            {pendingCount > 0 && (
              <Link
                href="/directory?status=Pending"
                className="inline-flex min-h-11 items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/15 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all tabular-nums"
              >
                <Clock size={16} />
                <span>Review Pending ({pendingCount})</span>
              </Link>
            )}
          </div>
        </div>

        {/* Authentic Provincial Seal Watermark */}
        <div
          aria-hidden="true"
          className="hidden sm:flex absolute right-6 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none select-none"
        >
          <BrandLogo size={170} />
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <MetricCard
          title="CSOs in Registry"
          value={initialError ? '—' : totalCount}
          subValue="Across 20 La Union LGUs"
          badgeText="All Active"
          badgeType="info"
          icon={Users}
          iconBgColor="bg-emerald-50"
          iconColor="text-[#143C2C]"
          delayMs={0}
          href="/directory"
        />

        <MetricCard
          title="SP Accredited"
          value={initialError ? '—' : `${accreditedCount}`}
          subValue={`${accreditedPct}% accreditation rate`}
          badgeText={`${accreditedPct}%`}
          badgeType="success"
          icon={ShieldCheck}
          iconBgColor="bg-green-50"
          iconColor="text-[#2E7D32]"
          delayMs={60}
          href="/directory?status=Accredited"
        />

        <MetricCard
          title="Women-Led CSOs"
          value={initialError ? '—' : `${womenLedCount}`}
          subValue={`${womenLedKnownCount} records specify status`}
          badgeText={`${womenLedPct}%`}
          badgeType="warning"
          icon={HeartHandshake}
          iconBgColor="bg-amber-50"
          iconColor="text-[#D97706]"
          delayMs={120}
        />
      </div>

      {initialError && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {initialError}
        </p>
      )}
      <SectorChart records={activeRecords} />

      {/* Latest Registry Entries Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              Latest Registry Entries
            </h2>
            <p className="text-sm text-[#374151]">
              Recent civil society organization accreditations filed for Sangguniang Panlalawigan recognition.
            </p>
          </div>

          <Link
            href="/directory"
            className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#245b29] hover:text-[#143C2C] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245b29]"
          >
            <span>View all directory records</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <CSOTable
          records={activeRecords.slice(0, 20)}
          enablePagination
          defaultPageSize={5}
          onArchive={handleArchive}
          onAddAttachment={handleAddAttachment}
          onEdit={(record) => {
            setEditingRecord(record);
            setIsModalOpen(true);
          }}
        />
      </div>

      {isAdmin && (
        <RegisterModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingRecord(null);
          }}
          onSuccess={handleRegisterSuccess}
          record={editingRecord}
        />
      )}
    </div>
  );
};
