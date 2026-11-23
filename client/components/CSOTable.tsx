'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/client/context/AuthContext';
import {
  CSORecord,
  UNSPECIFIED_VALUE,
  valueOrUnspecified,
} from '@/client/types';
import {
  fetchArchiveCSORecord,
  fetchDeleteCSORecord,
} from '@/client/lib/api';
import {
  getLocalCertificateAttachmentUrl,
  saveLocalCertificate,
  removeLocalCertificateAttachment,
  buildLocalAttachment,
} from '@/client/lib/attachments';
import { StatusBadge } from '@/client/components/StatusBadge';
import {
  Check,
  X as CloseIcon,
  Eye,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Paperclip,
  Archive,
  ArchiveRestore,
  Pencil,
  Trash2,
} from 'lucide-react';

interface CSOTableProps {
  records: CSORecord[];
  onArchive?: (record: CSORecord, archived: boolean) => Promise<void>;
  onDelete?: (record: CSORecord) => Promise<void>;
  onEdit?: (record: CSORecord) => void;
  onAddAttachment?: (record: CSORecord, file: File) => Promise<void>;
  showingArchived?: boolean;
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
  showingArchived = false,
}) => {
  const { isAdmin } = useAuth();
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
  const [deleteError, setDeleteError] = useState<{ recordId: string; message: string } | null>(null);
  const [uploadingAttachmentRecordId, setUploadingAttachmentRecordId] = useState<string | null>(null);
  const [pendingAttachmentRecord, setPendingAttachmentRecord] = useState<CSORecord | null>(null);
  const [attachmentUploadError, setAttachmentUploadError] = useState<{ recordId: string; message: string } | null>(null);
  const attachmentFileInputRef = useRef<HTMLInputElement>(null);

  const handleViewAttachment = async (record: CSORecord) => {
    setOpeningAttachmentRecordId(record.id);
    setAttachmentError(null);
    try {
      const url = await getLocalCertificateAttachmentUrl(record.id);
      setViewingAttachment({ record, url });
    } catch (error) {
      setAttachmentError({
        recordId: record.id,
        message: error instanceof Error ? error.message : 'Could not open the certificate.',
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

  const handleDelete = async (record: CSORecord) => {
    if (!onDelete || !record.archived) return;
    if (!window.confirm(`Permanently delete \"${record.organizationName}\"? This cannot be undone.`)) return;
    setDeletingRecordId(record.id);
    setDeleteError(null);
    try {
      await onDelete(record);
      setSelectedRecord((current) => current?.id === record.id ? null : current);
    } catch (error) {
      setDeleteError({
        recordId: record.id,
        message: error instanceof Error ? error.message : 'Could not delete the archived record.',
      });
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

  return (
    <>
      <div className="w-full min-w-0 rounded-2xl bg-gray-100 p-4">
        <div
          className="rounded-xl bg-white overflow-auto overscroll-contain"
          style={{ maxHeight: 'calc(100vh - 300px)', minHeight: '320px' }}
        >
          <table className="w-full min-w-max text-left border-collapse text-sm whitespace-nowrap">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#27632A] text-white font-bold tracking-wide uppercase text-sm">
                <th className="py-4 px-3 border-r border-white/20 text-center w-12">NO.</th>
                <th className="py-4 px-4 border-r border-white/20">SP ACCREDITED</th>
                <th className="py-4 px-4 border-r border-white/20 min-w-[240px]">ADVOCACY</th>
                <th className="py-4 px-3 border-r border-white/20">SECTOR</th>
                <th className="py-4 px-4 border-r border-white/20 min-w-[220px]">NAME OF ORGANIZATION</th>
                <th className="py-4 px-4 border-r border-white/20">NAME OF REPRESENTATIVE</th>
                <th className="py-4 px-3 border-r border-white/20">POSITION</th>
                <th className="py-4 px-4 border-r border-white/20 min-w-[200px]">ADDRESS</th>
                <th className="py-4 px-3 border-r border-white/20">LGU REPRESENTED</th>
                <th className="py-4 px-3 border-r border-white/20">CONTACT NUMBER</th>
                <th className="py-4 px-4 border-r border-white/20">EMAIL ADDRESS</th>
                <th className="py-4 px-3 border-r border-white/20 text-center">
                  ACCREDITING AGENCY<br /><span className="text-sm font-normal">(SEC, CDA etc.)</span>
                </th>
                <th className="py-4 px-3 border-r border-white/20 text-center">
                  CHECK IF CSO<br />IS LED WOMEN
                </th>
                <th className="py-4 px-3 border-r border-white/20">RESOLUTION NO.</th>
                <th className="py-4 px-3 border-r border-white/20">DATE ACCREDITED</th>
                <th className="py-4 px-3 text-center min-w-[190px]">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[#374151]">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={16} className="py-12 text-center text-[#374151]">
                    <p className="text-sm font-medium">
                      No {showingArchived ? 'archived ' : ''}CSO records found matching your filters.
                    </p>
                    <p className="text-sm mt-1 text-[#374151]">Try clearing your search query or filters.</p>
                  </td>
                </tr>
              ) : (
                records.map((record, index) => (
                  <tr
                    key={record.id || index}
                    className="hover:bg-emerald-50/40 transition-colors group cursor-pointer"
                    onClick={() => setSelectedRecord(record)}
                  >
                    <td className="py-3 px-3 text-center font-medium text-[#374151]">
                      {record.no ?? index + 1}
                    </td>
                    <td className="py-3 px-4">
                      {record.status === 'Unknown' ? (
                        <span className="text-sm text-gray-500">{UNSPECIFIED_VALUE}</span>
                      ) : (
                        <StatusBadge status={record.status} className="min-h-10" />
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-[260px] truncate font-normal text-[#374151]" title={record.advocacy}>
                      {displayValue(record.advocacy)}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-3 py-1 rounded-md bg-gray-100 text-[#374151] font-medium text-sm">
                        {displayValue(record.sector)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900 group-hover:text-[#2E7D32] transition-colors">
                      {displayValue(record.organizationName)}
                    </td>
                    <td className="py-3 px-4 text-gray-800 font-medium">
                      {displayValue(record.representativeName)}
                    </td>
                    <td className="py-3 px-3 text-[#374151]">
                      {displayValue(record.position)}
                    </td>
                    <td className="py-3 px-4 text-[#374151] max-w-[220px] truncate" title={displayValue(record.address)}>
                      {displayValue(record.address)}
                    </td>
                    <td className="py-3 px-3 font-medium text-gray-800">
                      {displayValue(record.lguRepresented)}
                    </td>
                    <td className="py-3 px-3 font-mono text-sm text-[#374151]">
                      {displayValue(record.contactNumber)}
                    </td>
                    <td className="py-3 px-4 text-[#374151] truncate max-w-[180px]">
                      {record.emailAddress ? (
                        <a
                          href={`mailto:${record.emailAddress}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:underline hover:text-[#245b29] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245b29]"
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
                        <span className="inline-flex min-h-10 items-center gap-1 px-3 rounded-full bg-[#E8F5E9] text-[#245b29] font-semibold text-sm">
                          <Check size={12} strokeWidth={3} />
                          Yes
                        </span>
                      ) : record.isWomenLed === false ? (
                        <span className="text-[#374151] font-medium text-sm">No</span>
                      ) : (
                        <span className="text-gray-500 italic text-sm">{UNSPECIFIED_VALUE}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-sm text-[#374151]">
                      {displayValue(record.resolutionNo)}
                    </td>
                    <td className="py-3 px-3 text-[#374151] font-mono text-sm">
                      {displayValue(record.dateAccredited)}
                    </td>
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-start gap-1">
                        <button
                          onClick={() => setSelectedRecord(record)}
                          className="inline-flex min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2 text-[#374151] hover:text-emerald-800 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245b29] transition-colors"
                          title="View Details"
                        >
                          <Eye size={15} />
                          <span>View details</span>
                        </button>
                        {isAdmin && (
                          <>
                            {onEdit && (
                              <button
                                onClick={() => onEdit(record)}
                                className="inline-flex min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2 text-[#374151] hover:text-blue-800 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245b29] transition-colors"
                                title={`Edit ${record.organizationName}`}
                              >
                                <Pencil size={15} />
                                <span>Edit</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleArchive(record)}
                              disabled={archivingRecordId !== null || deletingRecordId !== null}
                              className="inline-flex min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2 text-[#374151] hover:text-amber-800 hover:bg-amber-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245b29] disabled:cursor-wait disabled:opacity-60 transition-colors"
                              title={record.archived ? 'Restore from archive' : 'Archive record'}
                            >
                              {record.archived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
                              <span>
                                {archivingRecordId === record.id
                                  ? 'Updating...'
                                  : record.archived
                                    ? 'Restore'
                                    : 'Archive'}
                              </span>
                            </button>
                            {showingArchived && record.archived && onDelete && (
                              <button
                                onClick={() => handleDelete(record)}
                                disabled={deletingRecordId !== null || archivingRecordId !== null}
                                className="inline-flex min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2 text-red-700 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-wait disabled:opacity-60 transition-colors"
                                title={`Permanently delete ${record.organizationName}`}
                              >
                                <Trash2 size={15} />
                                <span>{deletingRecordId === record.id ? 'Deleting...' : 'Delete'}</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleAddAttachmentClick(record)}
                              disabled={uploadingAttachmentRecordId !== null}
                              title="Add certificate attachment"
                              aria-label="Add certificate attachment"
                              className="inline-flex min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2 text-[#374151] hover:text-emerald-800 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245b29] disabled:cursor-wait disabled:opacity-60 transition-colors"
                            >
                              <Paperclip size={15} />
                              <span>
                                {uploadingAttachmentRecordId === record.id ? 'Uploading...' : 'Add attachment'}
                              </span>
                            </button>
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
                          </>
                        )}
                        {record.certificateAttachment && (
                          <button
                            onClick={() => handleViewAttachment(record)}
                            disabled={openingAttachmentRecordId !== null}
                            className="inline-flex min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2 text-[#374151] hover:text-emerald-800 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245b29] disabled:cursor-wait disabled:opacity-60 transition-colors"
                            title={`View certificate: ${record.certificateAttachment.name}`}
                          >
                            <Paperclip size={15} />
                            <span>{openingAttachmentRecordId === record.id ? 'Opening...' : 'View attachment'}</span>
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
      </div>

      {/* Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.08)] relative animate-fadeIn">
            <button
              onClick={() => setSelectedRecord(null)}
              className="absolute top-5 right-5 inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-[#374151] hover:text-gray-900 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245b29]"
              aria-label="Close record details"
            >
              <CloseIcon size={18} />
            </button>

            <div className="flex items-center gap-2 mb-2">
              {selectedRecord.status === 'Unknown' ? (
                <span className="text-sm text-gray-500">{UNSPECIFIED_VALUE}</span>
              ) : (
                <StatusBadge status={selectedRecord.status} />
              )}
              {(selectedRecord.isWomenLed === true || selectedRecord.isWomenLed === false) && (
                <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-semibold text-sm ${
                  selectedRecord.isWomenLed
                    ? 'bg-[#E8F5E9] text-[#245b29]'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {selectedRecord.isWomenLed && <Check size={12} strokeWidth={3} />}
                  {selectedRecord.isWomenLed ? 'Women-Led Organization' : 'Not Women-Led'}
                </span>
              )}
              {selectedRecord.isWomenLed !== true && selectedRecord.isWomenLed !== false && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 font-semibold text-sm">
                  Women-Led: {UNSPECIFIED_VALUE}
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-2">
              {displayValue(selectedRecord.organizationName)}
            </h2>
            <p className="text-sm text-[#374151] mt-1 flex items-center gap-1">
              <MapPin size={13} className="text-emerald-700" />
              {displayValue(selectedRecord.address)} ({displayValue(selectedRecord.lguRepresented)})
            </p>

            <div className="mt-5 p-4 rounded-xl bg-gray-50">
              <span className="text-sm font-bold uppercase tracking-wider text-[#374151] block mb-1">
                ADVOCACY & PURPOSE
              </span>
              <p className="text-sm text-[#374151] leading-relaxed font-medium">
                {displayValue(selectedRecord.advocacy)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-5 text-sm">
              <div>
                <span className="text-[#374151] block">Sector</span>
                <span className="font-semibold text-gray-800">{displayValue(selectedRecord.sector)}</span>
              </div>
              <div>
                <span className="text-[#374151] block">Accrediting Agency</span>
                <span className="font-semibold text-gray-800">{displayValue(selectedRecord.accreditingAgency)}</span>
              </div>
              <div>
                <span className="text-[#374151] block">Representative</span>
                <span className="font-semibold text-gray-800">{displayValue(selectedRecord.representativeName)}</span>
                <span className="text-sm text-[#374151] block">{displayValue(selectedRecord.position)}</span>
              </div>
              <div>
                <span className="text-[#374151] block">Resolution No.</span>
                <span className="font-mono font-semibold text-gray-800">{displayValue(selectedRecord.resolutionNo)}</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-gray-200 flex flex-wrap gap-4 text-[#374151]">
                <span className="flex items-center gap-1.5">
                  <Phone size={13} /> {displayValue(selectedRecord.contactNumber)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail size={13} /> {displayValue(selectedRecord.emailAddress)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} /> Accredited: {displayValue(selectedRecord.dateAccredited)}
                </span>
              </div>
              {selectedRecord.certificateAttachment && (
                <div className="col-span-2">
                  <button
                    type="button"
                    onClick={() => handleViewAttachment(selectedRecord)}
                    disabled={openingAttachmentRecordId !== null}
                    className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-[#245b29] hover:bg-emerald-50 disabled:opacity-60"
                  >
                    <Paperclip size={15} />
                    {openingAttachmentRecordId === selectedRecord.id ? 'Opening attachment...' : 'View attachment'}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
              {isAdmin && onEdit && (
                <button
                  onClick={() => {
                    onEdit(selectedRecord);
                    setSelectedRecord(null);
                  }}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-[#374151] shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245b29]"
                >
                  <Pencil size={15} />
                  Edit
                </button>
              )}
              <button
                onClick={() => setSelectedRecord(null)}
                className="min-h-10 px-5 py-2 rounded-xl bg-[#315f2b] hover:bg-[#244b20] text-white text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245b29] transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
      {viewingAttachment && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex h-[min(90vh,900px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
              <h2 className="truncate pr-4 text-sm font-semibold text-gray-900">
                {viewingAttachment.record.certificateAttachment?.name || 'CSO certificate'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  if (viewingAttachment.url.startsWith('blob:')) {
                    URL.revokeObjectURL(viewingAttachment.url);
                  }
                  setViewingAttachment(null);
                }}
                className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                aria-label="Close certificate preview"
              >
                <CloseIcon size={18} />
              </button>
            </div>
            <iframe
              src={viewingAttachment.url}
              title={viewingAttachment.record.certificateAttachment?.name || 'CSO certificate'}
              className="min-h-0 flex-1 border-0"
            />
            <div className="flex items-center justify-between gap-4 border-t border-gray-200 px-5 py-3 text-sm">
              <span className="text-gray-600">If the preview is blank, open or download the file directly.</span>
              <div className="flex shrink-0 gap-3">
                <a
                  href={viewingAttachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#245b29] underline"
                >
                  Open file
                </a>
                <a
                  href={viewingAttachment.url}
                  download={viewingAttachment.record.certificateAttachment?.name || true}
                  className="font-semibold text-[#245b29] underline"
                >
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};