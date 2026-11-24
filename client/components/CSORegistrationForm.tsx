'use client';

import React, { useEffect, useState } from 'react';
import {
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
  CSORecordInput,
  LA_UNION_LGUS,
  CSO_SECTORS,
  ACCREDITING_AGENCIES,
} from '@/client/types';

interface CSORegistrationFormProps {
  record?: CSORecord | null;
  onSubmitRecord: (data: CSORecordInput) => Promise<void>;
  onCancel: () => void;
  variant?: 'modal' | 'page';
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

export const CSORegistrationForm: React.FC<CSORegistrationFormProps> = ({
  record = null,
  onSubmitRecord,
  onCancel,
  variant = 'modal',
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState<CSORecordInput>(createEmptyFormData);

  useEffect(() => {
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
  }, [record]);

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
    if (!validateStep(1) || !validateStep(3)) return;

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await onSubmitRecord(formData);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to save organization record. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardClass =
    variant === 'page'
      ? 'bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-6 animate-fadeIn'
      : 'space-y-6 animate-fadeIn';

  return (
    <div className="space-y-6">
      {/* 3-Step Indicator Bar */}
      <div
        className={`flex items-center justify-center gap-4 sm:gap-10 py-3 px-4 overflow-x-auto text-sm ${
          variant === 'page'
            ? 'bg-white rounded-2xl border border-gray-200/80 shadow-sm'
            : 'bg-gray-50 rounded-xl'
        }`}
      >
        {/* Step 1 */}
        <button
          type="button"
          onClick={() => currentStep > 1 && setCurrentStep(1)}
          disabled={currentStep === 1}
          className={`flex items-center gap-2.5 ${
            currentStep === 1
              ? 'text-gray-900 font-bold'
              : currentStep > 1
                ? 'text-[#245b29] font-medium cursor-pointer hover:underline'
                : 'text-[#374151]'
          }`}
        >
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep === 1
                ? 'bg-[#143C2C] text-white'
                : currentStep > 1
                  ? 'bg-emerald-100 text-[#245b29]'
                  : 'bg-gray-200 text-[#374151]'
            }`}
          >
            {currentStep > 1 ? <CheckCircle2 size={15} /> : '1'}
          </span>
          <span>Organization</span>
        </button>

        <ChevronRight size={14} className="text-gray-400 hidden sm:block" />

        {/* Step 2 */}
        <button
          type="button"
          onClick={() => {
            if (currentStep > 2) {
              setCurrentStep(2);
            } else if (currentStep === 1 && validateStep(1)) {
              setCurrentStep(2);
            }
          }}
          className={`flex items-center gap-2.5 cursor-pointer ${
            currentStep === 2
              ? 'text-gray-900 font-bold'
              : currentStep > 2
                ? 'text-[#245b29] font-medium hover:underline'
                : 'text-[#374151]'
          }`}
        >
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep === 2
                ? 'bg-[#143C2C] text-white'
                : currentStep > 2
                  ? 'bg-emerald-100 text-[#245b29]'
                  : 'bg-gray-200 text-[#374151]'
            }`}
          >
            {currentStep > 2 ? <CheckCircle2 size={15} /> : '2'}
          </span>
          <span>Representative</span>
        </button>

        <ChevronRight size={14} className="text-gray-400 hidden sm:block" />

        {/* Step 3 */}
        <div
          className={`flex items-center gap-2.5 ${
            currentStep === 3 ? 'text-gray-900 font-bold' : 'text-[#374151]'
          }`}
        >
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep === 3 ? 'bg-[#143C2C] text-white' : 'bg-gray-200 text-[#374151]'
            }`}
          >
            3
          </span>
          <span>Accreditation</span>
        </div>
      </div>

      {/* Validation Error Banner */}
      {errorMsg && (
        <div role="alert" className="p-4 rounded-xl bg-red-50 text-red-800 text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Step Cards */}
      <form
        onSubmit={handleSubmit}
        className="[&_input::placeholder]:text-[#374151] [&_input::placeholder]:opacity-100 [&_textarea::placeholder]:text-[#374151] [&_textarea::placeholder]:opacity-100"
      >
        {/* Step 1: Organization profile */}
        {currentStep === 1 && (
          <div className={cardClass}>
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
                <label className="text-sm font-semibold text-[#374151]">Sector</label>
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
                <label className="text-sm font-semibold text-[#374151]">Address</label>
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
                <label className="text-sm font-semibold text-[#374151]">Advocacy</label>
                <textarea
                  name="advocacy"
                  rows={3}
                  value={formData.advocacy}
                  onChange={handleChange}
                  placeholder="Describe the organization's main advocacy and community work."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4E8D42] focus:border-transparent transition-all shadow-sm"
                />
              </div>

              <div className="md:col-span-2 pt-1">
                <label className="inline-flex items-center gap-3 cursor-pointer p-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors w-full">
                  <input
                    type="checkbox"
                    name="isWomenLed"
                    checked={Boolean(formData.isWomenLed)}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-[#4E8D42] focus:ring-[#4E8D42] border-gray-300"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-900 block">
                      Check if CSO is led by WOMEN
                    </span>
                    <span className="text-sm text-[#374151]">
                      Check if the organization is led by a female president/director or primarily advances women development.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
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

        {/* Step 2: Authorized Representative */}
        {currentStep === 2 && (
          <div className={cardClass}>
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
                  Designated official for provincial correspondence and CSO directory registry.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-[#374151]">
                  Name of Representative
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
                <label className="text-sm font-semibold text-[#374151]">Position</label>
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
                <label className="text-sm font-semibold text-[#374151]">Contact Number</label>
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
                <label className="text-sm font-semibold text-[#374151]">Email Address</label>
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

        {/* Step 3: Accreditation Details */}
        {currentStep === 3 && (
          <div className={cardClass}>
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
                  Official Sangguniang Panlalawigan accreditation documentation for 2025–2028.
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
                  <option value="Expired">Expired</option>
                  <option value="Unknown">Not specified</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#374151]">Resolution No.</label>
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
                <label className="text-sm font-semibold text-[#374151]">Date Accredited</label>
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
  );
};
