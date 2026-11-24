'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/client/context/AuthContext';
import {
  X,
  ArrowLeft,
  Building2,
  UserCheck,
  Award,
  CheckCircle2,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import {
  CSORecord,
  LA_UNION_LGUS,
  CSO_SECTORS,
  ACCREDITING_AGENCIES,
  CSORecordInput,
} from '@/client/types';
import { fetchCreateCSORecord } from '@/client/lib/api';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newRecord: CSORecord) => void;
  record?: CSORecord | null;
}

const createEmptyFormData = (): CSORecordInput => ({
  organizationName: '',
  lguRepresented: '',
  sector: '',
  address: '',
  advocacy: '',
  isWomenLed: false,
  representativeName: '',
  position: '',
  contactNumber: '',
  emailAddress: '',
  accreditingAgency: 'DOLE',
  resolutionNo: '',
  dateAccredited: new Date().toISOString().split('T')[0],
  status: 'Accredited',
});

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  record = null,
}) => {
  const { isAdmin } = useAuth();

  // Guard: only admins can access the registration modal
  if (!isAdmin) return null;

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState<CSORecordInput>(createEmptyFormData);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentStep(1);
    setErrorMsg('');
    if (record) {
      setFormData({
        organizationName: record.organizationName,
        lguRepresented: record.lguRepresented.replace(/^NAGUILL?AN(?=, LA UNION$)/i, 'NAGUILIAN'),
        sector: (record.sector ?? '').toLocaleUpperCase(),
        address: record.address,
        advocacy: record.advocacy,
        isWomenLed: record.isWomenLed,
        representativeName: record.representativeName,
        position: record.position,
        contactNumber: record.contactNumber,
        emailAddress: record.emailAddress,
        accreditingAgency: record.accreditingAgency,
        resolutionNo: record.resolutionNo,
        dateAccredited: record.dateAccredited,
        status: record.status,
      });
    } else {
      setFormData(createEmptyFormData());
    }
  }, [isOpen, record]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errorMsg) setErrorMsg('');
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!formData.organizationName.trim()) {
        setErrorMsg('Please enter the organization name.');
        return false;
      }
      if (!formData.lguRepresented) {
        setErrorMsg('Please select the LGU represented.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setErrorMsg('');
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3);
    }
  };

  const handleBack = () => {
    setErrorMsg('');
    setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const savedRecord = await fetchCreateCSORecord(formData);
      onSuccess(savedRecord);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to save organization record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 md:p-10">
      <div className="relative w-full max-w-4xl max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] md:max-h-[calc(100dvh-5rem)] bg-white rounded-2xl shadow-2xl overflow-y-auto">
        {/* Modal Top Header Bar */}
        <div className="bg-white px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {record ? 'Edit CSO record' : 'Add an SP accreditation record'}
            </h2>
            <p className="text-sm text-[#374151] mt-0.5">
              Capture the fields used in the official 2025–2028 CSO registry.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex min-h-10 items-center gap-1.5 px-3 rounded-lg text-sm text-[#374151] hover:text-gray-900 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#143C2C] transition-colors"
          >
            <X size={18} />
            <span className="hidden sm:inline font-medium">Cancel</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Back link */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-[#374151] hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#143C2C] transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to directory</span>
            </button>
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 overflow-x-auto">
            {/* Step 1 */}
            <button
              type="button"
              onClick={() => currentStep > 1 && setCurrentStep(1)}
              className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm whitespace-nowrap transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#143C2C] ${currentStep === 1
                ? 'bg-[#143C2C] text-white font-semibold'
                : currentStep > 1
                  ? 'text-[#245b29] font-medium hover:bg-emerald-50'
                  : 'text-[#4B5563]'
                }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${currentStep === 1
                  ? 'bg-white/20 text-white'
                  : currentStep > 1
                    ? 'bg-emerald-100 text-[#245b29]'
                    : 'bg-gray-100 text-[#4B5563]'
                  }`}
              >
                {currentStep > 1 ? <CheckCircle2 size={16} /> : '1'}
              </div>
              <span>Organization</span>
            </button>

            <ChevronRight size={16} className="text-[#6B7280] hidden sm:block" aria-hidden="true" />

            {/* Step 2 */}
            <button
              type="button"
              onClick={() => currentStep > 2 && setCurrentStep(2)}
              className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm whitespace-nowrap transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#143C2C] ${currentStep === 2
                ? 'bg-[#143C2C] text-white font-semibold'
                : currentStep > 2
                  ? 'text-[#245b29] font-medium hover:bg-emerald-50'
                  : 'text-[#4B5563]'
                }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${currentStep === 2
                  ? 'bg-white/20 text-white'
                  : currentStep > 2
                    ? 'bg-emerald-100 text-[#245b29]'
                    : 'bg-gray-100 text-[#4B5563]'
                  }`}
              >
                {currentStep > 2 ? <CheckCircle2 size={16} /> : '2'}
              </div>
              <span>Representative</span>
            </button>

            <ChevronRight size={16} className="text-[#6B7280] hidden sm:block" aria-hidden="true" />

            {/* Step 3 */}
            <div
              className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm whitespace-nowrap ${currentStep === 3
                ? 'bg-[#143C2C] text-white font-semibold'
                : 'text-[#4B5563]'
                }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${currentStep === 3
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-[#4B5563]'
                  }`}
              >
                3
              </div>
              <span>Accreditation</span>
            </div>
          </div>

          {/* Validation Error Banner */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 text-red-800 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              {errorMsg}
            </div>
          )}

          {/* Form Step Cards */}
          <form
            onSubmit={handleSubmit}
            className="[&_input::placeholder]:text-[#374151] [&_input::placeholder]:opacity-100 [&_textarea::placeholder]:text-[#374151] [&_textarea::placeholder]:opacity-100"
          >
            {/* Step 1: Organization profile */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-start gap-4 pb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#EBF3E8] text-[#3A7530] flex items-center justify-center shrink-0">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <span className="text-sm font-bold uppercase tracking-wider text-[#245b29] block">
                      SECTION 01
                    </span>
                    <h3 className="text-lg font-bold text-gray-900">Organization profile</h3>
                    <p className="text-sm text-[#374151]">
                      Basic information used in the public CSO directory.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-semibold text-[#374151]">
                      Name of Organization <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleChange}
                      placeholder="e.g. La Union Coastal Guardians"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4E8D42] focus:border-transparent transition-all shadow-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#374151]">
                      LGU Represented <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="lguRepresented"
                      value={formData.lguRepresented}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4E8D42] focus:border-transparent transition-all shadow-sm"
                      required
                    >
                      <option value="">Select an LGU</option>
                      {formData.lguRepresented &&
                        !LA_UNION_LGUS.some((lgu) => lgu === formData.lguRepresented) && (
                          <option value={formData.lguRepresented}>
                            {formData.lguRepresented}
                          </option>
                        )}
                      {LA_UNION_LGUS.map((lgu) => (
                        <option key={lgu} value={lgu}>
                          {lgu}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#374151]">
                      Sector
                    </label>
                    <select
                      name="sector"
                      value={formData.sector}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4E8D42] focus:border-transparent transition-all shadow-sm"
                    >
                      <option value="">Select a sector</option>
                      {formData.sector &&
                        !CSO_SECTORS.some((sector) => sector === formData.sector) && (
                          <option value={formData.sector}>{formData.sector}</option>
                        )}
                      {CSO_SECTORS.map((sector) => (
                        <option key={sector} value={sector}>
                          {sector}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-semibold text-[#374151]">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Barangay, municipality, La Union"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4E8D42] focus:border-transparent transition-all shadow-sm"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-semibold text-[#374151]">
                      Advocacy <span className="text-sm font-normal text-gray-500"></span>
                    </label>
                    <textarea
                      name="advocacy"
                      rows={3}
                      value={formData.advocacy}
                      onChange={handleChange}
                      placeholder="Describe the organization's main advocacy and community work."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4E8D42] focus:border-transparent transition-all shadow-sm"
                    />
                  </div>

                  <div className="md:col-span-2 pt-2">
                    <label className="inline-flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors w-full">
                      <input
                        type="checkbox"
                        name="isWomenLed"
                        checked={Boolean(formData.isWomenLed)}
                        onChange={handleChange}
                        className="w-4 h-4 rounded text-[#4E8D42] focus:ring-[#4E8D42] border-gray-300"
                      />
                      <div>
                        <span className="text-sm font-semibold text-[#374151] block">
                          Check if CSO is led by WOMEN
                        </span>
                        <span className="text-sm text-[#374151]">
                          Identifies organizations headed by women leadership or primarily focused on women empowerment.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="min-h-10 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#374151] hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#143C2C] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="min-h-10 px-6 py-2.5 rounded-xl bg-[#315f2b] hover:bg-[#244b20] text-white text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#143C2C] transition-colors flex items-center gap-2"
                  >
                    <span>Continue to Representative</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Authorized representative */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-start gap-4 pb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#EBF3E8] text-[#3A7530] flex items-center justify-center shrink-0">
                    <UserCheck size={24} />
                  </div>
                  <div>
                    <span className="text-sm font-bold uppercase tracking-wider text-[#245b29] block">
                      SECTION 02
                    </span>
                    <h3 className="text-lg font-bold text-gray-900">Authorized representative</h3>
                    <p className="text-sm text-[#374151]">
                      Leadership contacts registered with the provincial secretariat.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-semibold text-[#374151]">
                      Name of Representative <span className="text-sm font-normal text-gray-500"></span>
                    </label>
                    <input
                      type="text"
                      name="representativeName"
                      value={formData.representativeName}
                      onChange={handleChange}
                      placeholder="e.g. Maria Teresa Valdez"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4E8D42] focus:border-transparent transition-all shadow-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#374151]">
                      Position <span className="text-sm font-normal text-gray-500"></span>
                    </label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      placeholder="e.g. President / Chairperson / Executive Director"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4E8D42] focus:border-transparent transition-all shadow-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#374151]">
                      Contact Number <span className="text-sm font-normal text-gray-500"></span>
                    </label>
                    <input
                      type="text"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      placeholder="e.g. 0917 123 4401"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4E8D42] focus:border-transparent transition-all shadow-sm"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-semibold text-[#374151]">
                      Email Address <span className="text-sm font-normal text-gray-500"></span>
                    </label>
                    <input
                      type="email"
                      name="emailAddress"
                      value={formData.emailAddress}
                      onChange={handleChange}
                      placeholder="e.g. mt.valdez@example.org"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4E8D42] focus:border-transparent transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="min-h-10 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#374151] hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#143C2C] transition-colors flex items-center gap-1.5"
                  >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="min-h-10 px-6 py-2.5 rounded-xl bg-[#315f2b] hover:bg-[#244b20] text-white text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#143C2C] transition-colors flex items-center gap-2"
                  >
                    <span>Continue to Accreditation</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Accreditation details */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-start gap-4 pb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#EBF3E8] text-[#3A7530] flex items-center justify-center shrink-0">
                    <Award size={24} />
                  </div>
                  <div>
                    <span className="text-sm font-bold uppercase tracking-wider text-[#245b29] block">
                      SECTION 03
                    </span>
                    <h3 className="text-lg font-bold text-gray-900">Accreditation details</h3>
                    <p className="text-sm text-[#374151]">
                      Sangguniang Panlalawigan accreditation credentials (Term 2025–2028).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#374151]">
                      Accrediting Agency (SEC, CDA etc.)
                    </label>
                    <select
                      name="accreditingAgency"
                      value={formData.accreditingAgency}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4E8D42] focus:border-transparent transition-all shadow-sm"
                    >
                      {formData.accreditingAgency &&
                        !ACCREDITING_AGENCIES.some((agency) => agency === formData.accreditingAgency) && (
                          <option value={formData.accreditingAgency}>
                            {formData.accreditingAgency}
                          </option>
                        )}
                      {ACCREDITING_AGENCIES.map((agency) => (
                        <option key={agency} value={agency}>
                          {agency}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#374151]">
                      SP Accredited Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4E8D42] focus:border-transparent transition-all shadow-sm"
                    >
                      <option value="Accredited">Accredited</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#374151]">
                      Resolution No. <span className="text-sm font-normal text-gray-500"></span>
                    </label>
                    <input
                      type="text"
                      name="resolutionNo"
                      value={formData.resolutionNo}
                      onChange={handleChange}
                      placeholder="e.g. LU-2024-017"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4E8D42] focus:border-transparent transition-all shadow-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#374151]">
                      Date Accredited <span className="text-sm font-normal text-gray-500"></span>
                    </label>
                    <input
                      type="date"
                      name="dateAccredited"
                      value={formData.dateAccredited}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4E8D42] focus:border-transparent transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="min-h-10 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#374151] hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#143C2C] transition-colors flex items-center gap-1.5"
                  >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-h-10 px-7 py-2.5 rounded-xl bg-[#315f2b] hover:bg-[#244b20] text-white text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#143C2C] transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Saving organization...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>{record ? 'Save changes' : 'Save organization'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};
