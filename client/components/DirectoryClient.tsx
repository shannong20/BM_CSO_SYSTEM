'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/client/context/AuthContext';
import {
  Download,
  Plus,
  Search,
  RotateCcw,
  X,
  Archive,
  ArchiveRestore,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { CSORecord } from '@/client/types';
import {
  fetchArchiveCSORecord,
  fetchDeleteCSORecord,
  fetchUploadCertificateAttachment,
} from '@/client/lib/api';
import { CSOTable } from '@/client/components/CSOTable';
import { RegisterModal } from '@/client/components/RegisterModal';

interface DirectoryClientProps {
  initialRecords: CSORecord[];
  initialError?: string;
}

export const DirectoryClient: React.FC<DirectoryClientProps> = ({
  initialRecords,
  initialError = '',
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [records, setRecords] = useState<CSORecord[]>(initialRecords);
  const [statusMessage, setStatusMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') ?? '');
  const [debouncedQuery, setDebouncedQuery] = useState(() => searchParams.get('q') ?? '');
  const [selectedLgu, setSelectedLgu] = useState(() => searchParams.get('lgu') ?? '');
  const [selectedSector, setSelectedSector] = useState(() => searchParams.get('sector') ?? '');
  const [selectedStatus, setSelectedStatus] = useState(() => searchParams.get('status') ?? '');
  const [showArchived, setShowArchived] = useState(() => searchParams.get('archived') === '1');
  const [currentPage, setCurrentPage] = useState(() => {
    const parsed = Number(searchParams.get('page') ?? '1');
    return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CSORecord | null>(null);
  const { isAdmin } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set('q', debouncedQuery);
    if (selectedLgu) params.set('lgu', selectedLgu);
    if (selectedSector) params.set('sector', selectedSector);
    if (selectedStatus) params.set('status', selectedStatus);
    if (showArchived) params.set('archived', '1');
    if (currentPage > 1) params.set('page', String(currentPage));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [debouncedQuery, selectedLgu, selectedSector, selectedStatus, showArchived, currentPage, pathname, router]);

  useEffect(() => {
    if (!statusMessage) return;
    const timer = setTimeout(() => setStatusMessage(''), 4000);
    return () => clearTimeout(timer);
  }, [statusMessage]);

  const recordsInCurrentView = useMemo(
    () => records.filter((record) => Boolean(record.archived) === showArchived),
    [records, showArchived]
  );

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (r.organizationName || '').toLowerCase().includes(q) ||
        (r.advocacy || '').toLowerCase().includes(q) ||
        (r.representativeName || '').toLowerCase().includes(q) ||
        (r.address || '').toLowerCase().includes(q) ||
        (r.resolutionNo || '').toLowerCase().includes(q) ||
        (r.accreditingAgency || '').toLowerCase().includes(q) ||
        (r.lguRepresented || '').toLowerCase().includes(q) ||
        (r.sector || '').toLowerCase().includes(q);

      const matchesLgu = !selectedLgu || r.lguRepresented === selectedLgu;
      const matchesSector = !selectedSector || r.sector === selectedSector;
      const matchesStatus = !selectedStatus || r.status === selectedStatus;

      return (
        matchesSearch &&
        matchesLgu &&
        matchesSector &&
        matchesStatus &&
        Boolean(r.archived) === showArchived
      );
    });
  }, [records, searchQuery, selectedLgu, selectedSector, selectedStatus, showArchived]);

  const lguOptions = useMemo(
    () =>
      Array.from(new Set(recordsInCurrentView.map((record) => record.lguRepresented).filter(Boolean))).sort(
        (a, b) => a.localeCompare(b)
      ),
    [recordsInCurrentView]
  );

  const sectorOptions = useMemo(
    () =>
      Array.from(
        new Set(
          recordsInCurrentView
            .map((record) => record.sector)
            .filter((sector): sector is string => Boolean(sector))
        )
      ).sort((a, b) => a.localeCompare(b)),
    [recordsInCurrentView]
  );

  const handleRegisterSuccess = (newRecord: CSORecord) => {
    if (editingRecord) {
      handleRecordUpdate(newRecord);
      setEditingRecord(null);
      setStatusMessage(`Updated "${newRecord.organizationName}".`);
    } else {
      setRecords((prev) => [newRecord, ...prev]);
      setCurrentPage(1);
      setStatusMessage(`Registered "${newRecord.organizationName}".`);
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
    setStatusMessage(
      archived
        ? `Archived "${record.organizationName}".`
        : `Restored "${record.organizationName}".`
    );
  };

  const handleDelete = async (record: CSORecord) => {
    await fetchDeleteCSORecord(record.id);
    setRecords((prev) => prev.filter((current) => current.id !== record.id));
    setStatusMessage(`Permanently deleted "${record.organizationName}".`);
  };

  const handleAddAttachment = async (record: CSORecord, file: File) => {
    const updatedRecord = await fetchUploadCertificateAttachment(record.id, file);
    handleRecordUpdate(updatedRecord);
    setStatusMessage(`Uploaded attachment "${file.name}" for "${record.organizationName}".`);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setSelectedLgu('');
    setSelectedSector('');
    setSelectedStatus('');
    setCurrentPage(1);
  };

  const exportToCSV = (rowsToExport: CSORecord[], filename = 'SP_Accredited_CSO_Registry_2025_2028.csv') => {
    const headers = [
      'NO.',
      'SP ACCREDITED',
      'ADVOCACY',
      'SECTOR',
      'NAME OF ORGANIZATION',
      'NAME OF REPRESENTATIVE',
      'POSITION',
      'ADDRESS',
      'LGU REPRESENTED',
      'CONTACT NUMBER',
      'EMAIL ADDRESS',
      'ACCREDITING AGENCY',
      'CHECK IF CSO IS LED WOMEN',
      'RESOLUTION NO.',
      'DATE ACCREDITED',
    ];

    const escapeCSV = (str: string | number | boolean | undefined) => {
      if (str === undefined || str === null) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = rowsToExport.map((r, idx) => [
      idx + 1,
      escapeCSV(r.status === 'Unknown' ? 'NOT SPECIFIED, INPUT VALUE' : r.status),
      escapeCSV(r.advocacy ?? ''),
      escapeCSV(r.sector ?? ''),
      escapeCSV(r.organizationName),
      escapeCSV(r.representativeName),
      escapeCSV(r.position),
      escapeCSV(r.address),
      escapeCSV(r.lguRepresented),
      escapeCSV(r.contactNumber),
      escapeCSV(r.emailAddress),
      escapeCSV(r.accreditingAgency),
      r.isWomenLed === null || r.isWomenLed === undefined ? 'NOT SPECIFIED, INPUT VALUE' : r.isWomenLed ? 'Yes' : 'No',
      escapeCSV(r.resolutionNo),
      escapeCSV(r.dateAccredited),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusCounts = useMemo(() => {
    const counts = { all: recordsInCurrentView.length, Accredited: 0, Pending: 0, Expired: 0 };
    recordsInCurrentView.forEach((r) => {
      if (r.status === 'Accredited') counts.Accredited += 1;
      else if (r.status === 'Pending') counts.Pending += 1;
      else if (r.status === 'Expired') counts.Expired += 1;
    });
    return counts;
  }, [recordsInCurrentView]);

  return (
    <div className="space-y-5 animate-fadeIn min-w-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {isAdmin && (
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#245b29] hover:text-[#143C2C] hover:underline mb-1.5"
            >
              <ArrowLeft size={15} />
              <span>Back to Dashboard</span>
            </Link>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
            {showArchived ? 'Archived CSO Records' : 'SP Accredited CSO Registry'}
          </h1>
          <p className="text-sm sm:text-base text-[#4B5563] mt-1">
            Official organization records and accreditation details · Term 2025–2028
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setShowArchived((current) => !current);
                setCurrentPage(1);
              }}
              aria-pressed={showArchived}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-[#374151] shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245b29]"
            >
              {showArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
              <span>
                {showArchived
                  ? 'View Active Records'
                  : `Archived (${records.filter((record) => record.archived).length})`}
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={() => exportToCSV(filteredRecords)}
            className="inline-flex min-h-11 items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-[#374151] text-sm font-semibold hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245b29] transition-colors shadow-sm"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setEditingRecord(null);
                setIsModalOpen(true);
              }}
              className="inline-flex min-h-11 items-center gap-2 px-5 py-2.5 rounded-xl bg-[#143C2C] hover:bg-[#1B4D39] text-white text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#143C2C] transition-colors shadow-sm"
            >
              <Plus size={16} />
              <span>Register CSO</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Status Tabs */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Quick status filter">
        {[
          { value: '', label: 'All Records', count: statusCounts.all },
          { value: 'Accredited', label: 'Accredited', count: statusCounts.Accredited },
          { value: 'Pending', label: 'Pending Review', count: statusCounts.Pending },
          { value: 'Expired', label: 'Expired', count: statusCounts.Expired },
        ].map((tab) => {
          const active = selectedStatus === tab.value;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => {
                setSelectedStatus(tab.value);
                setCurrentPage(1);
              }}
              aria-pressed={active}
              className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all tabular-nums focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#143C2C] ${
                active
                  ? 'bg-[#143C2C] text-white shadow-sm'
                  : 'bg-white text-[#374151] border border-[#E5E7EB] hover:bg-gray-50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  active ? 'bg-white/20 text-white' : 'bg-gray-100 text-[#374151]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Labeled Search & Filters Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E7EB] shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
          <div className="md:col-span-5">
            <label htmlFor="directory-search" className="block text-xs font-semibold text-[#374151] mb-1.5">
              Search organization, representative, or resolution no.
            </label>
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4B5563] pointer-events-none"
              />
              <input
                id="directory-search"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Type a name, barangay, or resolution..."
                className="w-full min-h-11 pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#143C2C]/20 focus:border-[#143C2C] transition-all placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setDebouncedQuery('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg text-[#374151] hover:text-gray-900 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#245b29]"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          <div className="md:col-span-3">
            <label htmlFor="directory-lgu" className="block text-xs font-semibold text-[#374151] mb-1.5">
              City / Municipality (LGU)
            </label>
            <select
              id="directory-lgu"
              value={selectedLgu}
              onChange={(e) => {
                setSelectedLgu(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full min-h-11 px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#143C2C]/20 focus:border-[#143C2C] transition-all"
            >
              <option value="">All LGUs</option>
              {lguOptions.map((lgu) => (
                <option key={lgu} value={lgu}>
                  {lgu}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="directory-sector" className="block text-xs font-semibold text-[#374151] mb-1.5">
              Sector
            </label>
            <select
              id="directory-sector"
              value={selectedSector}
              onChange={(e) => {
                setSelectedSector(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full min-h-11 px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#143C2C]/20 focus:border-[#143C2C] transition-all"
            >
              <option value="">All sectors</option>
              {sectorOptions.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="button"
              onClick={handleResetFilters}
              disabled={!searchQuery && !selectedLgu && !selectedSector && !selectedStatus}
              className="w-full min-h-11 px-3.5 py-2.5 rounded-xl border border-gray-300 text-[#374151] hover:text-red-700 hover:bg-red-50 hover:border-red-200 disabled:opacity-45 disabled:hover:bg-transparent disabled:hover:text-[#374151] disabled:hover:border-gray-300 disabled:cursor-not-allowed text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#245b29] transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={14} />
              <span>Clear filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-gray-800">
            {`${filteredRecords.length} ${filteredRecords.length === 1 ? 'organization' : 'organizations'} found`}
          </p>
          {(searchQuery || selectedLgu || selectedSector || selectedStatus) && (
            <span className="text-sm text-[#374151]">
              (Filtered from {recordsInCurrentView.length} total)
            </span>
          )}
        </div>
        {statusMessage && (
          <p
            role="status"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-[#245b29]"
          >
            <CheckCircle2 size={15} />
            <span>{statusMessage}</span>
          </p>
        )}
      </div>

      {initialError && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {initialError}
        </p>
      )}

      <CSOTable
        records={filteredRecords}
        onArchive={handleArchive}
        onDelete={handleDelete}
        onEdit={(record) => {
          setEditingRecord(record);
          setIsModalOpen(true);
        }}
        onAddAttachment={handleAddAttachment}
        showingArchived={showArchived}
        enablePagination
        defaultPageSize={8}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

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
