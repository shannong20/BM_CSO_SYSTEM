'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '@/client/context/AuthContext';
import {
  CSORecord,
  UNSPECIFIED_VALUE,
  valueOrUnspecified,
} from '@/client/types';
import { fetchCertificateAttachmentUrl } from '@/client/lib/api';
import { getLocalCertificateAttachmentUrl } from '@/client/lib/attachments';
import { StatusBadge } from '@/client/components/StatusBadge';
import { TablePagination } from '@/client/components/TablePagination';
import { RecordDetailsModal } from '@/client/components/RecordDetailsModal';
import { AttachmentPreviewModal } from '@/client/components/AttachmentPreviewModal';
import { ConfirmDialog } from '@/client/components/ConfirmDialog';
import {
  Check,
  Eye,
  Paperclip,
  Archive,
  ArchiveRestore,
  Pencil,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

type SortField = 'organizationName' | 'lguRepresented' | 'status' | 'dateAccredited';
type SortDirection = 'asc' | 'desc';

interface CSOTableProps {
  records: CSORecord[];
  onArchive?: (record: CSORecord, archived: boolean) => Promise<void>;
  onDelete?: (record: CSORecord) => Promise<void>;
  onEdit?: (record: CSORecord) => void;
  onAddAttachment?: (record: CSORecord, file: File) => Promise<void>;
  onRemoveAttachment?: (record: CSORecord) => Promise<void>;
  variant?: 'full' | 'summary';
  showingArchived?: boolean;
  enablePagination?: boolean;
  defaultPageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

function displayValue(value: string | null | undefined): string {
  return valueOrUnspecified(value);
}

export const CSOTable: React.FC<CSOTableProps> = ({
  records,
  onArchive,
  onDelete,
  onEdit,
  onAddAttachment,
  onRemoveAttachment,
  variant = 'full',
  showingArchived = false,
  enablePagination = false,
  defaultPageSize = 10,
  currentPage: controlledPage,
  onPageChange,
}) => {
  const { isAdmin } = useAuth();
  const [internalPage, setInternalPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [selectedRecord, setSelectedRecord] = useState<CSORecord | null>(null);
  const [viewingAttachment, setViewingAttachment] = useState<{
    record: CSORecord;
    url: string;
  } | null>(null);
  const [openingAttachmentRecordId, setOpeningAttachmentRecordId] = useState<string | null>(null);
  const [attachmentError, setAttachmentError] = useState<{ recordId: string; message: string } | null>(null);
  const [archivingRecordId, setArchivingRecordId] = useState<string | null>(null);
  const [archiveError, setArchiveError] = useState<{ recordId: string; message: string } | null>(null);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
  const [pendingDeleteRecord, setPendingDeleteRecord] = useState<CSORecord | null>(null);
  const [deleteError, setDeleteError] = useState<{ recordId: string; message: string } | null>(null);
  const [uploadingAttachmentRecordId, setUploadingAttachmentRecordId] = useState<string | null>(null);
  const [pendingAttachmentRecord, setPendingAttachmentRecord] = useState<CSORecord | null>(null);
  const [attachmentUploadError, setAttachmentUploadError] = useState<{ recordId: string; message: string } | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [removingAttachmentRecordId, setRemovingAttachmentRecordId] = useState<string | null>(null);
  const [pendingRemoveAttachmentRecord, setPendingRemoveAttachmentRecord] = useState<CSORecord | null>(null);
  const [attachmentRemoveError, setAttachmentRemoveError] = useState<{ recordId: string; message: string } | null>(null);
  const attachmentFileInputRef = useRef<HTMLInputElement>(null);

  const currentPage = controlledPage ?? internalPage;
  const setCurrentPage = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      setInternalPage(page);
    }
  };

  useEffect(() => {
    if (!controlledPage) {
      setInternalPage(1);
    }
  }, [records, pageSize, controlledPage]);

  useEffect(() => {
    setSelectedRecord((current) => {
      if (!current) return null;
      return records.find((r) => r.id === current.id) ?? current;
    });
  }, [records]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const sortedRecords = useMemo(() => {
    if (!sortField) return records;
    const copy = [...records];
    copy.sort((a, b) => {
      const aVal = (a[sortField] ?? '').toString().toLowerCase();
      const bVal = (b[sortField] ?? '').toString().toLowerCase();
      const cmp = aVal.localeCompare(bVal);
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [records, sortField, sortDirection]);

  const totalPages = enablePagination ? Math.max(1, Math.ceil(sortedRecords.length / pageSize)) : 1;
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = enablePagination ? (safePage - 1) * pageSize : 0;
  const displayedRecords = enablePagination
    ? sortedRecords.slice(startIndex, startIndex + pageSize)
    : sortedRecords;

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown size={13} className="opacity-70" />;
    return sortDirection === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />;
  };

  const getAriaSort = (field: SortField): 'ascending' | 'descending' | 'none' => {
    if (sortField !== field) return 'none';
    return sortDirection === 'asc' ? 'ascending' : 'descending';
  };

  const handleViewAttachment = async (record: CSORecord) => {
    setOpeningAttachmentRecordId(record.id);
    setAttachmentError(null);
    try {
      const url = record.certificateAttachment?.url
        ? record.certificateAttachment.url
        : record.certificateAttachment?.storagePath
          ? await fetchCertificateAttachmentUrl(record.id)
          : await getLocalCertificateAttachmentUrl(record.id);
      setViewingAttachment({ record, url });
    } catch (error) {
      setAttachmentError({
        recordId: record.id,
        message: error instanceof Error ? error.message : 'Could not open the attachment.',
      });
    } finally {
      setOpeningAttachmentRecordId(null);
    }
  };

  const handleArchive = async (record: CSORecord) => {
    if (!onArchive) return;
    setArchivingRecordId(record.id);
    setArchiveError(null);
    try {
      await onArchive(record, !record.archived);
    } catch (error) {
      setArchiveError({
        recordId: record.id,
        message: error instanceof Error ? error.message : 'Could not update the archive status.',
      });
    } finally {
      setArchivingRecordId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!onDelete || !pendingDeleteRecord || !pendingDeleteRecord.archived) return;
    const record = pendingDeleteRecord;
    setDeletingRecordId(record.id);
    setDeleteError(null);
    try {
      await onDelete(record);
      setSelectedRecord((current) => (current?.id === record.id ? null : current));
      setPendingDeleteRecord(null);
    } catch (error) {
      setDeleteError({
        recordId: record.id,
        message: error instanceof Error ? error.message : 'Could not delete the archived record.',
      });
      setPendingDeleteRecord(null);
    } finally {
      setDeletingRecordId(null);
    }
  };

  const handleAddAttachmentClick = (record: CSORecord) => {
    setPendingAttachmentRecord(record);
    attachmentFileInputRef.current?.click();
  };

  const handleAddAttachment = async (record: CSORecord, file: File) => {
    if (!onAddAttachment) return;
    setUploadingAttachmentRecordId(record.id);
    setAttachmentUploadError(null);
    try {
      await onAddAttachment(record, file);
    } catch (error) {
      setAttachmentUploadError({
        recordId: record.id,
        message: error instanceof Error ? error.message : 'Could not add attachment.',
      });
    } finally {
      setUploadingAttachmentRecordId(null);
      setPendingAttachmentRecord(null);
      if (attachmentFileInputRef.current) {
        attachmentFileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAttachment = async () => {
    if (!onRemoveAttachment || !pendingRemoveAttachmentRecord) return;
    const record = pendingRemoveAttachmentRecord;
    setRemovingAttachmentRecordId(record.id);
    setAttachmentRemoveError(null);
    try {
      await onRemoveAttachment(record);
      setPendingRemoveAttachmentRecord(null);
    } catch (error) {
      setAttachmentRemoveError({
        recordId: record.id,
        message: error instanceof Error ? error.message : 'Could not remove the attachment.',
      });
    } finally {
      setRemovingAttachmentRecordId(null);
    }
  };

  return (
    <>
      <div className="w-full min-w-0 rounded-2xl bg-[#F3F4F6] border border-[#E5E7EB] p-3 space-y-2.5">
        {variant === 'full' && (
          <p className="hidden md:block text-xs font-medium text-[#4B5563] px-1">
            Tip: Click any row to open full organization details, representative contacts, and attachments. Scroll right for resolution and date fields.
          </p>
        )}
        {/* Mobile card list */}
        <div className="md:hidden space-y-2.5">
          {displayedRecords.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center text-[#374151]">
              <p className="text-sm font-medium">
                No {showingArchived ? 'archived ' : ''}CSO records found matching your filters.
              </p>
              <p className="text-sm mt-1">Try clearing your search query or filters.</p>
            </div>
          ) : (
            displayedRecords.map((record, index) => (
              <article
                key={record.id || index}
                onClick={() => setSelectedRecord(record)}
                className="rounded-xl bg-white p-4 border border-[#E5E7EB] shadow-sm space-y-3 active:scale-[0.99] transition-transform cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-mono text-gray-500 tabular-nums">
                      #{record.no ?? startIndex + index + 1} · {displayValue(record.lguRepresented)}
                    </p>
                    <h3 className="text-base font-bold text-gray-900 leading-snug mt-0.5">
                      {displayValue(record.organizationName)}
                    </h3>
                  </div>
                  <StatusBadge status={record.status} />
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-[#374151]">
                  {record.sector && (
                    <span className="px-2.5 py-1 rounded-md bg-gray-100 font-medium">
                      {record.sector}
                    </span>
                  )}
                  {record.representativeName && (
                    <span className="truncate">Rep: {record.representativeName}</span>
                  )}
                </div>

                <div
                  className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedRecord(record)}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-[#143C2C] bg-[#EEF5F0] hover:bg-[#DFECE3]"
                  >
                    <Eye size={14} />
                    <span>Details</span>
                  </button>
                  {isAdmin && onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(record)}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-[#374151] bg-[#F3F4F6] hover:bg-gray-200"
                    >
                      <Pencil size={14} />
                      <span>Edit</span>
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleArchive(record)}
                      disabled={archivingRecordId !== null || deletingRecordId !== null}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-[#374151] bg-[#F3F4F6] hover:bg-gray-200 disabled:opacity-60"
                    >
                      {record.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                      <span>{record.archived ? 'Restore' : 'Archive'}</span>
                    </button>
                  )}
                  {record.certificateAttachment && (
                    <button
                      type="button"
                      onClick={() => handleViewAttachment(record)}
                      disabled={openingAttachmentRecordId !== null}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-[#374151] bg-gray-100 hover:bg-gray-200 disabled:opacity-60"
                    >
                      <Paperclip size={14} />
                      <span>Attachment</span>
                    </button>
                  )}
                </div>
              </article>
            ))
          )}
        </div>

        {/* Desktop 16-column table */}
        <div
          className={
            enablePagination
              ? 'hidden md:block rounded-xl bg-white overflow-x-auto'
              : 'hidden md:block rounded-xl bg-white overflow-auto overscroll-contain'
          }
          style={
            enablePagination
              ? undefined
              : { maxHeight: 'calc(100vh - 300px)', minHeight: '320px' }
          }
        >
          <table className="w-full min-w-max text-left border-collapse text-sm whitespace-nowrap">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#143C2C] text-white font-semibold tracking-wide uppercase text-xs">
                <th className="py-3 px-3 border-r border-white/15 text-center w-12">NO.</th>
                <th aria-sort={getAriaSort('status')} className="py-3 px-4 border-r border-white/15">
                  <button
                    type="button"
                    onClick={() => handleSort('status')}
                    className="inline-flex items-center gap-1.5 uppercase font-semibold tracking-wide hover:text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white rounded"
                  >
                    <span>SP ACCREDITED</span>
                    {renderSortIcon('status')}
                  </button>
                </th>
                {variant === 'full' && (
                  <th className="py-3 px-4 border-r border-white/15 min-w-[240px]">ADVOCACY</th>
                )}
                <th className="py-3 px-3 border-r border-white/15">SECTOR</th>
                <th
                  aria-sort={getAriaSort('organizationName')}
                  className={`${variant === 'full' ? 'sticky left-0 z-20 bg-[#143C2C] shadow-[6px_0_12px_-6px_rgba(0,0,0,0.2)]' : ''} py-3 px-4 border-r border-white/15 min-w-[220px]`}
                >
                  <button
                    type="button"
                    onClick={() => handleSort('organizationName')}
                    className="inline-flex items-center gap-1.5 uppercase font-semibold tracking-wide hover:text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white rounded"
                  >
                    <span>NAME OF ORGANIZATION</span>
                    {renderSortIcon('organizationName')}
                  </button>
                </th>
                {variant === 'full' && (
                  <>
                    <th className="py-3 px-4 border-r border-white/15">NAME OF REPRESENTATIVE</th>
                    <th className="py-3 px-3 border-r border-white/15">POSITION</th>
                    <th className="py-3 px-4 border-r border-white/15 min-w-[200px]">ADDRESS</th>
                  </>
                )}
                <th aria-sort={getAriaSort('lguRepresented')} className="py-3 px-3 border-r border-white/15">
                  <button
                    type="button"
                    onClick={() => handleSort('lguRepresented')}
                    className="inline-flex items-center gap-1.5 uppercase font-semibold tracking-wide hover:text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white rounded"
                  >
                    <span>LGU REPRESENTED</span>
                    {renderSortIcon('lguRepresented')}
                  </button>
                </th>
                {variant === 'full' && (
                  <>
                    <th className="py-3 px-3 border-r border-white/15">CONTACT NUMBER</th>
                    <th className="py-3 px-4 border-r border-white/15">EMAIL ADDRESS</th>
                    <th className="py-3 px-3 border-r border-white/15 text-center">
                      ACCREDITING AGENCY<br /><span className="text-[11px] font-normal text-white/80">(SEC, CDA etc.)</span>
                    </th>
                    <th className="py-3 px-3 border-r border-white/15 text-center">
                      CHECK IF CSO<br />IS LED WOMEN
                    </th>
                    <th className="py-3 px-3 border-r border-white/15">RESOLUTION NO.</th>
                  </>
                )}
                <th aria-sort={getAriaSort('dateAccredited')} className="py-3 px-3 border-r border-white/15">
                  <button
                    type="button"
                    onClick={() => handleSort('dateAccredited')}
                    className="inline-flex items-center gap-1.5 uppercase font-semibold tracking-wide hover:text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white rounded"
                  >
                    <span>DATE ACCREDITED</span>
                    {renderSortIcon('dateAccredited')}
                  </button>
                </th>
                <th className={`${variant === 'full' ? 'sticky right-0 z-20 bg-[#143C2C] shadow-[-6px_0_12px_-6px_rgba(0,0,0,0.2)]' : ''} py-3 px-3 text-center`}>
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[#374151]">
              {displayedRecords.length === 0 ? (
                <tr>
                  <td colSpan={variant === 'full' ? 16 : 7} className="py-12 text-center text-[#374151]">
                    <p className="text-sm font-medium">
                      No {showingArchived ? 'archived ' : ''}CSO records found matching your filters.
                    </p>
                    <p className="text-sm mt-1 text-[#374151]">Try clearing your search query or filters.</p>
                  </td>
                </tr>
              ) : (
                displayedRecords.map((record, index) => (
                  <tr
                    key={record.id || index}
                    tabIndex={0}
                    onClick={() => setSelectedRecord(record)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target === e.currentTarget) {
                        setSelectedRecord(record);
                      }
                    }}
                    className="hover:bg-[#F3F6F4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#143C2C] transition-colors group cursor-pointer"
                  >
                    <td className="py-3 px-3 text-center font-medium text-[#374151] tabular-nums">
                      {record.no ?? startIndex + index + 1}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={record.status} />
                    </td>
                    {variant === 'full' && (
                      <td className="py-3 px-4 max-w-[260px] truncate font-normal text-[#374151]" title={record.advocacy}>
                        {displayValue(record.advocacy)}
                      </td>
                    )}
                    <td className="py-3 px-3 text-sm text-[#374151]">
                      {displayValue(record.sector)}
                    </td>
                    <td className={`${variant === 'full' ? 'sticky left-0 z-10 bg-white group-hover:bg-[#F3F6F4] shadow-[6px_0_12px_-6px_rgba(0,0,0,0.08)]' : ''} py-3 px-4 font-semibold text-[#111827] group-hover:text-[#143C2C] transition-colors`}>
                      {displayValue(record.organizationName)}
                    </td>
                    {variant === 'full' && (
                      <>
                        <td className="py-3 px-4 text-gray-800 font-medium">
                          {displayValue(record.representativeName)}
                        </td>
                        <td className="py-3 px-3 text-[#374151]">
                          {displayValue(record.position)}
                        </td>
                        <td className="py-3 px-4 text-[#374151] max-w-[220px] truncate" title={displayValue(record.address)}>
                          {displayValue(record.address)}
                        </td>
                      </>
                    )}
                    <td className="py-3 px-3 font-medium text-gray-800">
                      {displayValue(record.lguRepresented)}
                    </td>
                    {variant === 'full' && (
                      <>
                        <td className="py-3 px-3 font-mono text-sm text-[#374151] tabular-nums">
                          {displayValue(record.contactNumber)}
                        </td>
                        <td className="py-3 px-4 text-[#374151] truncate max-w-[180px]">
                          {record.emailAddress ? (
                            <a
                              href={`mailto:${record.emailAddress}`}
                              onClick={(e) => e.stopPropagation()}
                              className="hover:underline hover:text-[#143C2C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#143C2C]"
                            >
                              {record.emailAddress}
                            </a>
                          ) : (
                            displayValue(record.emailAddress)
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-[#374151]">
                          {displayValue(record.accreditingAgency)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {record.isWomenLed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EEF5F0] text-[#143C2C] font-semibold text-xs">
                              <Check size={12} strokeWidth={3} />
                              Yes
                            </span>
                          ) : record.isWomenLed === false ? (
                            <span className="text-[#374151] font-medium text-sm">No</span>
                          ) : (
                            <span className="text-gray-500 italic text-sm">{UNSPECIFIED_VALUE}</span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-sm text-[#374151] tabular-nums">
                          {displayValue(record.resolutionNo)}
                        </td>
                      </>
                    )}
                    <td className="py-3 px-3 text-[#374151] font-mono text-sm tabular-nums">
                      {displayValue(record.dateAccredited)}
                    </td>
                    <td
                      className={`${variant === 'full' ? 'sticky right-0 z-10 bg-white group-hover:bg-[#F3F6F4] shadow-[-6px_0_12px_-6px_rgba(0,0,0,0.08)]' : ''} py-3 px-3 text-center transition-colors`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-start gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedRecord(record)}
                          className="inline-flex min-h-9 shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2 text-xs font-medium text-[#374151] hover:text-[#111827] hover:bg-[#E5E7EB]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#143C2C] transition-colors"
                          title="View Details"
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </button>
                        {isAdmin && (
                          <>
                            {onEdit && (
                              <button
                                type="button"
                                onClick={() => onEdit(record)}
                                className="inline-flex min-h-9 shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2 text-xs font-medium text-[#374151] hover:text-[#111827] hover:bg-[#E5E7EB]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#143C2C] transition-colors"
                                title={`Edit ${record.organizationName}`}
                              >
                                <Pencil size={14} />
                                <span>Edit</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleArchive(record)}
                              disabled={archivingRecordId !== null || deletingRecordId !== null}
                              className="inline-flex min-h-9 shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2 text-xs font-medium text-[#374151] hover:text-[#111827] hover:bg-[#E5E7EB]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#143C2C] disabled:cursor-wait disabled:opacity-60 transition-colors"
                              title={record.archived ? 'Restore from archive' : 'Archive record'}
                            >
                              {record.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                              <span>
                                {archivingRecordId === record.id
                                  ? 'Saving...'
                                  : record.archived
                                    ? 'Restore'
                                    : 'Archive'}
                              </span>
                            </button>
                            {showingArchived && record.archived && onDelete && (
                              <button
                                type="button"
                                onClick={() => setPendingDeleteRecord(record)}
                                disabled={deletingRecordId !== null || archivingRecordId !== null}
                                className="inline-flex min-h-9 shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2 text-xs font-medium text-red-700 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-wait disabled:opacity-60 transition-colors"
                                title={`Permanently delete ${record.organizationName}`}
                              >
                                <Trash2 size={14} />
                                <span>{deletingRecordId === record.id ? 'Deleting...' : 'Delete'}</span>
                              </button>
                            )}
                            {onAddAttachment && (
                              <button
                                type="button"
                                onClick={() => handleAddAttachmentClick(record)}
                                disabled={uploadingAttachmentRecordId !== null}
                                title="Add attachment"
                                aria-label="Add attachment"
                                className="inline-flex min-h-9 shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2 text-xs font-medium text-[#374151] hover:text-[#111827] hover:bg-[#E5E7EB]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#143C2C] disabled:cursor-wait disabled:opacity-60 transition-colors"
                              >
                                <Paperclip size={14} />
                                <span>
                                  {uploadingAttachmentRecordId === record.id ? 'Uploading...' : 'Attach'}
                                </span>
                              </button>
                            )}
                            {record.certificateAttachment && onRemoveAttachment && (
                              <button
                                type="button"
                                onClick={() => {
                                  setAttachmentRemoveError(null);
                                  setPendingRemoveAttachmentRecord(record);
                                }}
                                disabled={removingAttachmentRecordId !== null}
                                title="Remove attachment"
                                aria-label="Remove attachment"
                                className="inline-flex min-h-9 shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2 text-xs font-medium text-red-700 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-wait disabled:opacity-60 transition-colors"
                              >
                                <Trash2 size={14} />
                                <span>
                                  {removingAttachmentRecordId === record.id ? 'Removing...' : 'Remove'}
                                </span>
                              </button>
                            )}
                          </>
                        )}
                        {record.certificateAttachment && (
                          <button
                            type="button"
                            onClick={() => handleViewAttachment(record)}
                            disabled={openingAttachmentRecordId !== null}
                            className="inline-flex min-h-9 shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2 text-xs font-medium text-[#374151] hover:text-[#111827] hover:bg-[#E5E7EB]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#143C2C] disabled:cursor-wait disabled:opacity-60 transition-colors"
                            title={`View attachment: ${record.certificateAttachment.name}`}
                          >
                            <Paperclip size={14} />
                            <span>{openingAttachmentRecordId === record.id ? 'Opening...' : 'File'}</span>
                          </button>
                        )}
                        {attachmentError?.recordId === record.id && (
                          <span className="max-w-[200px] whitespace-normal text-left text-xs text-red-700" role="alert">
                            {attachmentError.message}
                          </span>
                        )}
                        {attachmentUploadError?.recordId === record.id && (
                          <span className="max-w-[200px] whitespace-normal text-left text-xs text-red-700" role="alert">
                            {attachmentUploadError.message}
                          </span>
                        )}
                        {attachmentRemoveError?.recordId === record.id && (
                          <span className="max-w-[200px] whitespace-normal text-left text-xs text-red-700" role="alert">
                            {attachmentRemoveError.message}
                          </span>
                        )}
                        {archiveError?.recordId === record.id && (
                          <span className="max-w-[200px] whitespace-normal text-left text-xs text-red-700" role="alert">
                            {archiveError.message}
                          </span>
                        )}
                        {deleteError?.recordId === record.id && (
                          <span className="max-w-[200px] whitespace-normal text-left text-xs text-red-700" role="alert">
                            {deleteError.message}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <input
          ref={attachmentFileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && pendingAttachmentRecord) {
              handleAddAttachment(pendingAttachmentRecord, file);
            }
          }}
        />

        {enablePagination && (
          <TablePagination
            totalItems={records.length}
            currentPage={safePage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      <RecordDetailsModal
        record={selectedRecord}
        isAdmin={isAdmin}
        onClose={() => setSelectedRecord(null)}
        onEdit={onEdit}
        onViewAttachment={handleViewAttachment}
        onAddAttachmentClick={onAddAttachment ? handleAddAttachmentClick : undefined}
        onRemoveAttachmentClick={
          isAdmin && onRemoveAttachment
            ? (record) => {
                setAttachmentRemoveError(null);
                setPendingRemoveAttachmentRecord(record);
              }
            : undefined
        }
        openingAttachmentRecordId={openingAttachmentRecordId}
        uploadingAttachmentRecordId={uploadingAttachmentRecordId}
        removingAttachmentRecordId={removingAttachmentRecordId}
        attachmentError={attachmentError}
        attachmentUploadError={attachmentUploadError}
        attachmentRemoveError={attachmentRemoveError}
      />

      <AttachmentPreviewModal
        viewingAttachment={viewingAttachment}
        onClose={() => {
          if (viewingAttachment?.url.startsWith('blob:')) {
            URL.revokeObjectURL(viewingAttachment.url);
          }
          setViewingAttachment(null);
        }}
      />

      <ConfirmDialog
        isOpen={Boolean(pendingDeleteRecord)}
        title="Delete archived record?"
        description={
          pendingDeleteRecord
            ? `Permanently delete "${pendingDeleteRecord.organizationName}"? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete permanently"
        isLoading={deletingRecordId !== null}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDeleteRecord(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(pendingRemoveAttachmentRecord)}
        title="Remove attachment?"
        description={
          pendingRemoveAttachmentRecord
            ? `Remove "${pendingRemoveAttachmentRecord.certificateAttachment?.name}" from "${pendingRemoveAttachmentRecord.organizationName}"?`
            : ''
        }
        confirmLabel="Remove attachment"
        loadingLabel="Removing..."
        isLoading={removingAttachmentRecordId !== null}
        onConfirm={handleRemoveAttachment}
        onCancel={() => setPendingRemoveAttachmentRecord(null)}
      />
    </>
  );
};
