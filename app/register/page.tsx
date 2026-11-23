'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/client/context/AuthContext';
import {
  X,
  ArrowLeft,
  Building2,
  UserCheck,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import {
  LA_UNION_LGUS,
  CSO_SECTORS,
  ACCREDITING_AGENCIES,
  AccreditationStatus,
} from '@/client/types';
import { fetchCreateCSORecord } from '@/client/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();

  // Redirect guests away from registration page
  useEffect(() => {
    if (!isAdmin) {
      router.push('/directory');
    }
  }, [isAdmin, router]);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
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
    status: 'Accredited' as AccreditationStatus,
  });

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
      if (!formData.advocacy.trim()) {
        setErrorMsg('Please describe the advocacy and community work.');
        return false;
      }
    } else if (step === 2) {
      if (!formData.representativeName.trim()) {
        setErrorMsg('Please provide the authorized representative name.');
        return false;
      }
      if (!formData.position.trim()) {
        setErrorMsg('Please specify the position/role (e.g., President).');
        return false;
      }
      if (!formData.contactNumber.trim()) {
        setErrorMsg('Please enter a contact number.');
        return false;
      }
      if (!formData.emailAddress.trim()) {
        setErrorMsg('Please enter an email address.');
        return false;
      }
    } else if (step === 3) {
      if (!formData.accreditingAgency) {
        setErrorMsg('Please select the accrediting agency.');
        return false;
      }
      if (!formData.resolutionNo.trim()) {
        setErrorMsg('Please provide the resolution number.');
        return false;
      }
      if (!formData.dateAccredited) {
        setErrorMsg('Please choose the date accredited.');
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
      await fetchCreateCSORecord(formData);
      router.push('/directory');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to register organization. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Add an SP accreditation record
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Capture the fields used in the official 2025–2028 CSO registry.
          </p>
        </div>

        <Link
          href="/directory"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <X size={17} />
          <span>Cancel</span>
        </Link>
      </div>

      {/* Back Link */}
      <div>
        <Link
          href="/directory"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to directory</span>
        </Link>
      </div>

      {/* Stepper matching Figma */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-sm flex items-center justify-center gap-4 sm:gap-10 overflow-x-auto">
        {/* Step 1 */}
        <div
          onClick={() => currentStep > 1 && setCurrentStep(1)}
          className={`flex items-center gap-3 cursor-pointer ${currentStep === 1
              ? 'text-gray-900 font-bold'
              : currentStep > 1
                ? 'text-emerald-700 font-medium'
                : 'text-gray-400'
            }`}
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${currentStep === 1
                ? 'bg-[#143C2C] text-white'
                : currentStep > 1
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-gray-100 text-gray-500'
              }`}
          >
            {currentStep > 1 ? <CheckCircle2 size={16} /> : '1'}
          </div>
          <span className="text-xs sm:text-sm whitespace-nowrap">Organization</span>
        </div>

        <ChevronRight size={14} className="text-gray-300 hidden sm:block" />

        {/* Step 2 */}
        <div
          onClick={() => currentStep > 2 && setCurrentStep(2)}
          className={`flex items-center gap-3 cursor-pointer ${currentStep === 2
              ? 'text-gray-900 font-bold'
              : currentStep > 2
                ? 'text-emerald-700 font-medium'
                : 'text-gray-400'
            }`}
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${currentStep === 2
                ? 'bg-[#143C2C] text-white'
                : currentStep > 2
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-gray-100 text-gray-500'
              }`}
          >
            {currentStep > 2 ? <CheckCircle2 size={16} /> : '2'}
          </div>
          <span className="text-xs sm:text-sm whitespace-nowrap">Representative</span>
        </div>

        <ChevronRight size={14} className="text-gray-300 hidden sm:block" />

        {/* Step 3 */}
        <div
          className={`flex items-center gap-3 ${currentStep === 3 ? 'text-gray-900 font-bold' : 'text-gray-400'
            }`}
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${currentStep === 3
                ? 'bg-[#143C2C] text-white'
                : 'bg-gray-100 text-gray-500'
              }`}
          >
            3
          </div>
          <span className="text-xs sm:text-sm whitespace-nowrap">Accreditation</span>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-600"></span>
          {errorMsg}
        </div>
      )}

      {/* Main Form Formats */}
      <form onSubmit={handleSubmit}>
        {/* Step 1: Organization Profile matching Figma */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-6 animate-fadeIn">
            <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-[#EBF3E8] text-[#3A7530] flex items-center justify-center shrink-0">
                <Building2 size={24} />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#3A7530] block">
                  SECTION 01
                </span>
                <h2 className="text-lg font-bold text-gray-900">Organization profile</h2>
                <p className="text-xs text-gray-500">
                  Basic information used in the public CSO directory.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-gray-700">
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
                <label className="text-xs font-semibold text-gray-700">
                  LGU Represented <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="lguRepresented"
                    value={formData.lguRepresented}
                    onChange={handleChange}
                    className="w-full appearance-none rounded-xl border-2 border-[#4E8D42] bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none transition-all focus:border-[#4E8D42] focus:ring-2 focus:ring-[#4E8D42]/20"
                    required
                  >
                    <option value="">Select an LGU</option>
                    {LA_UNION_LGUS.map((lgu) => (
                      <option key={lgu} value={lgu}>
                        {lgu}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#4E8D42]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Sector
                </label>
                <select
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4E8D42] focus:border-transparent transition-all shadow-sm"
                >
                  <option value="">Select a sector</option>
                  {CSO_SECTORS.map((sector) => (
                    <option key={sector} value={sector}>
                      {sector}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-gray-700">
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
                <label className="text-xs font-semibold text-gray-700">
                  Advocacy <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="advocacy"
                  rows={3}
                  value={formData.advocacy}
                  onChange={handleChange}
                  placeholder="Describe the organization's main advocacy and community work."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4E8D42] focus:border-transparent transition-all shadow-sm"
                  required
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <label className="inline-flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors w-full">
                  <input
                    type="checkbox"
                    name="isWomenLed"
                    checked={formData.isWomenLed}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-[#4E8D42] focus:ring-[#4E8D42] border-gray-300"
                  />
                  <div>
                    <span className="text-xs font-semibold text-gray-800 block">
                      Check if CSO is led by WOMEN
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Check if the organization is led by a female president/director or primarily advances women development.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <Link
                href="/directory"
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-[#549448] hover:bg-[#437838] text-white text-sm font-semibold shadow-sm transition-colors flex items-center gap-2"
              >
                <span>Continue to Representative</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Authorized Representative */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-6 animate-fadeIn">
            <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-[#EBF3E8] text-[#3A7530] flex items-center justify-center shrink-0">
                <UserCheck size={24} />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#3A7530] block">
                  SECTION 02
                </span>
                <h2 className="text-lg font-bold text-gray-900">Authorized representative</h2>
                <p className="text-xs text-gray-500">
                  Designated official for provincial correspondence and CSO directory registry.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-gray-700">
                  Name of Representative <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="representativeName"
                  value={formData.representativeName}
                  onChange={handleChange}
                  placeholder="e.g. Maria Teresa Valdez"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4E8D42] focus:border-transparent transition-all shadow-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Position <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="e.g. President / Chairperson / Executive Director"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4E8D42] focus:border-transparent transition-all shadow-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="e.g. 0917 123 4401"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4E8D42] focus:border-transparent transition-all shadow-sm"
                  required
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="emailAddress"
                  value={formData.emailAddress}
                  onChange={handleChange}
                  placeholder="e.g. mt.valdez@example.org"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4E8D42] focus:border-transparent transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-[#549448] hover:bg-[#437838] text-white text-sm font-semibold shadow-sm transition-colors flex items-center gap-2"
              >
                <span>Continue to Accreditation</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Accreditation Details */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-6 animate-fadeIn">
            <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-[#EBF3E8] text-[#3A7530] flex items-center justify-center shrink-0">
                <Award size={24} />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#3A7530] block">
                  SECTION 03
                </span>
                <h2 className="text-lg font-bold text-gray-900">Accreditation details</h2>
                <p className="text-xs text-gray-500">
                  Official Sangguniang Panlalawigan accreditation documentation for 2025–2028.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Accrediting Agency (SEC, CDA etc.) <span className="text-red-500">*</span>
                </label>
                <select
                  name="accreditingAgency"
                  value={formData.accreditingAgency}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4E8D42] focus:border-transparent transition-all shadow-sm"
                  required
                >
                  {ACCREDITING_AGENCIES.map((agency) => (
                    <option key={agency} value={agency}>
                      {agency}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  SP Accredited Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4E8D42] focus:border-transparent transition-all shadow-sm"
                  required
                >
                  <option value="Accredited">Accredited</option>
                  <option value="Pending">Pending</option>
                
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Resolution No. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="resolutionNo"
                  value={formData.resolutionNo}
                  onChange={handleChange}
                  placeholder="e.g. LU-2024-017"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4E8D42] focus:border-transparent transition-all shadow-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Date Accredited <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateAccredited"
                  value={formData.dateAccredited}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4E8D42] focus:border-transparent transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-7 py-2.5 rounded-xl bg-[#549448] hover:bg-[#437838] text-white text-sm font-semibold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Saving organization...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Save organization</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
