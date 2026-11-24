'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/client/context/AuthContext';
import { CSORecordInput } from '@/client/types';
import { fetchCreateCSORecord } from '@/client/lib/api';
import { CSORegistrationForm } from '@/client/components/CSORegistrationForm';

export default function RegisterPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin) {
      router.push('/directory');
    }
  }, [isAdmin, router]);

  const handleSubmitRecord = async (formData: CSORecordInput) => {
    await fetchCreateCSORecord(formData);
    router.push('/directory');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
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

      <div>
        <Link
          href="/directory"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to directory</span>
        </Link>
      </div>

      <CSORegistrationForm
        onSubmitRecord={handleSubmitRecord}
        onCancel={() => router.push('/directory')}
        variant="page"
      />
    </div>
  );
}
