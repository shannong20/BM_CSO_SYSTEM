'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/client/context/AuthContext';
import {
  Users,
  ShieldCheck,
  HeartHandshake,
  ArrowRight,
  Plus,
  Landmark,
  Sparkles,
} from 'lucide-react';
import { CSORecord } from '@/client/types';
import { fetchCSORecords } from '@/client/lib/api';
import { MetricCard } from '@/client/components/MetricCard';
import { SectorChart } from '@/client/components/SectorChart';
import { CSOTable } from '@/client/components/CSOTable';
import { RegisterModal } from '@/client/components/RegisterModal';

export default function DashboardPage() {
  const [records, setRecords] = useState<CSORecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CSORecord | null>(null);
  const { isAdmin } = useAuth();

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchCSORecords();
        setRecords(data);
      } catch (error) {
        setRecords([]);
        setLoadError(error instanceof Error ? error.message : 'Could not load CSO records.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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

  const totalCount = records.length;
  const accreditedCount = records.filter((r) => r.status === 'Accredited').length;
  const accreditedPct = totalCount > 0 ? Math.round((accreditedCount / totalCount) * 100) : 0;
  
  const womenLedCount = records.filter((r) => r.isWomenLed).length;
  const womenLedKnownCount = records.filter((r) => typeof r.isWomenLed === 'boolean').length;
  const womenLedPct = womenLedKnownCount > 0
    ? Math.round((womenLedCount / womenLedKnownCount) * 100)
    : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#143C2C] via-[#1A4C38] to-[#205C44] p-6 sm:p-8 md:p-10 text-white shadow-xl overflow-hidden border border-[#2B604B]">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex min-h-10 items-center gap-2 px-4 rounded-full bg-white/10 text-white text-sm font-semibold backdrop-blur-md">
            <Landmark size={16} />
            <span>Province of La Union · Sangguniang Panlalawigan</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            SP Accreditation Overview
          </h1>

         

          <div className="pt-3 flex flex-wrap gap-3">
            <Link
              href="/directory"
              className="inline-flex min-h-10 items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#143C2C] text-sm font-bold shadow-sm hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
            >
              <span>Explore CSO Directory</span>
              <ArrowRight size={16} />
            </Link>

            {isAdmin && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex min-h-10 items-center gap-2 px-5 py-2.5 rounded-xl bg-[#315f2b] text-white text-sm font-semibold hover:bg-[#244b20] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
              >
                <Plus size={16} />
                <span>Register New CSO</span>
              </button>
            )}
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <Sparkles size={280} className="text-white transform translate-x-12 -translate-y-6" />
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <MetricCard
          title="CSOs in Registry"
          value={loading ? '...' : loadError ? '—' : totalCount}
          subValue="Across 20 La Union LGUs"
          badgeText="Official"
          badgeType="info"
          icon={Users}
          iconBgColor="bg-emerald-50"
          iconColor="text-[#143C2C]"
        />

        <MetricCard
          title="SP Accredited"
          value={loading ? '...' : loadError ? '—' : `${accreditedCount}`}
          subValue={`${accreditedPct}% accreditation rate`}
          badgeText={`${accreditedPct}%`}
          badgeType="success"
          icon={ShieldCheck}
          iconBgColor="bg-green-50"
          iconColor="text-[#2E7D32]"
        />

        <MetricCard
          title="Women-Led CSOs"
          value={loading ? '...' : loadError ? '—' : `${womenLedCount}`}
          subValue={`${womenLedKnownCount} records specify women-led status`}
          badgeText={`${womenLedPct}%`}
          badgeType="warning"
          icon={HeartHandshake}
          iconBgColor="bg-amber-50"
          iconColor="text-[#D97706]"
        />
      </div>

      {/* Analytics: Sector & Status Distribution */}
      {loadError && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {loadError}
        </p>
      )}
      <SectorChart records={records} />

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

        {/* Preview Table */}
        <CSOTable
          records={records.slice(0, 5)}
          onEdit={(record) => {
            setEditingRecord(record);
            setIsModalOpen(true);
          }}
        />
      </div>

      {/* Register Modal (admin only) */}
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
}
