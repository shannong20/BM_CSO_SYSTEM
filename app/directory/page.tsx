'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/client/context/AuthContext';
import {
  Download,
  Plus,
  Search,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  X,
  Archive,
  ArchiveRestore,
} from 'lucide-react';
import { CSORecord } from '@/client/types';
import {
  fetchCSORecords,
  fetchArchiveCSORecord,
  fetchDeleteCSORecord,
  fetchUploadCertificateAttachment,
} from '@/client/lib/api';
import { CSOTable } from '@/client/components/CSOTable';
import { RegisterModal } from '@/client/components/RegisterModal';

export default function DirectoryPage() {
  const [records, setRecords] = useState<CSORecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLgu, setSelectedLgu] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CSORecord | null>(null);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const { isAdmin } = useAuth();

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchCSORecords();
      setRecords(data);
      setLoadError('');
    } catch (error) {
      setRecords([]);
      setLoadError(error instanceof Error ? error.message : 'Could not load CSO records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const recordsInCurrentView = useMemo(
    () => records.filter((record) => Boolean(record.archived) === showArchived),
    [records, showArchived]
  );

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Search matching across multiple fields
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

      // LGU filter
      const matchesLgu = !selectedLgu || r.lguRepresented === selectedLgu;

      // Sector filter
      const matchesSector = !selectedSector || r.sector === selectedSector;

      // Status filter
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
    () => Array.from(new Set(recordsInCurrentView.map((record) => record.lguRepresented).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b)),
    [recordsInCurrentView]
  );
  const sectorOptions = useMemo(
    () => Array.from(new Set(
      recordsInCurrentView
        .map((record) => record.sector)
        .filter((sector): sector is string => Boolean(sector))
    ))
      .sort((a, b) => a.localeCompare(b)),
    [recordsInCurrentView]
  );

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

  const handleDelete = async (record: CSORecord) => {
    await fetchDeleteCSORecord(record.id);
    setRecords((prev) => prev.filter((current) => current.id !== record.id));
  };

  const handleAddAttachment = async (record: CSORecord, file: File) => {
    const updatedRecord = await fetchUploadCertificateAttachment(record.id, file);
    handleRecordUpdate(updatedRecord);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedLgu('');
    setSelectedSector('');
    setSelectedStatus('');
  };

  const exportToCSV = (records: CSORecord[], filename = 'SP_Accredited_CSO_Registry_2025_2028.csv') => {
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

    const rows = records.map((r, idx) => [
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
      'data:text/csv;charset=utf-8,\\uFEFF' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn min-w-0">
      {/* Header Bar matching Figma */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            SP Accredited CSO Registry
          </h1>
          <p className="text-sm text-[#374151] mt-1">
            Official organization records and accreditation details · 2025–2028
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => setShowArchived((current) => !current)}
              aria-pressed={showArchived}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-[#374151] shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245b29]"
            >
              {showArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
              <span>{showArchived ? 'Active records' : `Archived (${records.filter((record) => record.archived).length})`}</span>
            </button>
          )}
          <button
            onClick={() => exportToCSV(filteredRecords)}
            className="inline-flex min-h-10 items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-[#374151] text-sm font-semibold hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245b29] transition-colors shadow-sm"
          >
            <Download size={16} />
            <span>Export</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => {
                setEditingRecord(null);
                setIsModalOpen(true);
              }}
              className="inline-flex min-h-10 items-center gap-2 px-5 py-2.5 rounded-xl bg-[#315f2b] hover:bg-[#244b20] text-white text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#143C2C] transition-colors shadow-sm"
            >
              <Plus size={16} />
              <span>Register CSO</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filters Toolbar Card matching Figma */}
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#374151] pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any registry field..."
              className="w-full min-h-10 pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4E8D42] focus:border-transparent transition-all placeholder:text-[#374151] placeholder:opacity-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-[#374151] hover:text-gray-900 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#245b29]"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* LGU Filter Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedLgu}
              onChange={(e) => setSelectedLgu(e.target.value)}
              className="w-full min-h-10 px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#4E8D42] focus:border-transparent transition-all"
            >
              <option value="">All LGUs</option>
              {lguOptions.map((lgu) => (
                <option key={lgu} value={lgu}>
                  {lgu}
                </option>
              ))}
            </select>
          </div>

          {/* Sector Filter Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full min-h-10 px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#4E8D42] focus:border-transparent transition-all"
            >
              <option value="">All sectors</option>
              {sectorOptions.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full min-h-10 px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#4E8D42] focus:border-transparent transition-all"
            >
              <option value="">All statuses</option>
              <option value="Accredited">Accredited</option>
              <option value="Pending">Pending</option>
              <option value="Expired">Expired</option>
              <option value="Unknown">Not specified</option>

            </select>
          </div>

          {/* Reset Filters / Extra Button */}
          <div className="md:col-span-1 flex justify-end">
            {(searchQuery || selectedLgu || selectedSector || selectedStatus) ? (
              <button
                onClick={handleResetFilters}
                className="w-full md:w-auto min-h-10 px-3 py-2.5 rounded-xl border border-gray-200 text-[#374151] hover:text-red-700 hover:bg-red-50 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#245b29] transition-colors flex items-center justify-center gap-1.5"
                title="Reset all filters"
              >
                <RotateCcw size={14} />
                <span className="md:hidden">Reset</span>
              </button>
            ) : (
              <button
                disabled
                className="w-full md:w-auto min-h-10 px-3 py-2.5 rounded-xl border border-gray-200 text-[#374151] text-sm font-semibold flex items-center justify-center gap-1.5 cursor-default"
              >
                <SlidersHorizontal size={14} />
                <span className="hidden xl:inline">Filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Info Bar matching Figma */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-gray-800">
            {filteredRecords.length} {filteredRecords.length === 1 ? 'organization' : 'organizations'} found
          </p>
          {(searchQuery || selectedLgu || selectedSector || selectedStatus) && (
            <span className="text-sm text-[#374151]">(Filtered from {records.length} total)</span>
          )}
        </div>

      </div>

      {/* CSO Table */}
      {loadError && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {loadError}
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
      />

      {/* Registration Modal Overlay (admin only) */}
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
