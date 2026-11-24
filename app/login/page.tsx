'use client';

import React, { useState } from 'react';
import { useAuth } from '@/client/context/AuthContext';
import type { UserRole } from '@/client/lib/auth';
import { ShieldCheck, User, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from '@/client/components/BrandLogo';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('guest');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { login, loginAdmin, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      if (selectedRole === 'admin') {
        await loginAdmin(username, password);
      } else {
        login('guest');
      }
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles: { value: UserRole; label: string; description: string; icon: React.ElementType }[] = [
    {
      value: 'guest',
      label: 'Browse Directory (Guest)',
      description: 'Search and view accredited CSO records and certificates. No password needed.',
      icon: User,
    },
    {
      value: 'admin',
      label: 'Administrator',
      description: 'Register new CSOs, update accreditation records, and upload certificates.',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 bg-[#F3F6F4]">
      <div className="w-full max-w-md space-y-6 animate-fadeIn">
        {/* Civic Header */}
        <div className="text-center flex flex-col items-center space-y-2">
          <div className="p-2.5 rounded-2xl bg-[#143C2C] shadow-sm">
            <BrandLogo size={44} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#245b29] pt-1">
            Province of La Union · Sangguniang Panlalawigan
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
            Sign in to CSOTrack
          </h1>
          <p className="text-sm text-[#4B5563]">
            Official SP Accredited CSO Registry (Term 2025–2028)
          </p>
        </div>

        {/* High-contrast Form Card */}
        <form
          onSubmit={handleLogin}
          className="rounded-2xl bg-white p-6 sm:p-8 border border-[#E5E7EB] shadow-sm space-y-5"
        >
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-[#111827] mb-2">
              Choose how you want to continue
            </legend>
            {roles.map((role) => {
              const isSelected = selectedRole === role.value;
              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role.value);
                    setError('');
                  }}
                  aria-pressed={isSelected}
                  className={`w-full flex items-start gap-3.5 p-4 rounded-xl border-2 text-left transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#143C2C] ${
                    isSelected
                      ? 'border-[#143C2C] bg-[#F2F7F4]'
                      : 'border-[#E5E7EB] bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl ${
                      isSelected
                        ? 'bg-[#143C2C] text-white'
                        : 'bg-gray-100 text-[#374151]'
                    }`}
                  >
                    <role.icon size={20} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#111827] text-base leading-snug">
                      {role.label}
                    </p>
                    <p className="text-sm mt-0.5 leading-relaxed text-[#4B5563]">
                      {role.description}
                    </p>
                  </div>

                  {isSelected && (
                    <CheckCircle2 size={20} className="text-[#143C2C] shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </fieldset>

          {selectedRole === 'admin' && (
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <div>
                <label
                  htmlFor="admin-username"
                  className="mb-1.5 block text-sm font-semibold text-[#111827]"
                >
                  Admin Email / Username
                </label>
                <input
                  id="admin-username"
                  name="username"
                  type="email"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="admin@launion.gov.ph"
                  className="min-h-11 w-full rounded-xl px-3.5 text-base text-[#111827] bg-white border border-gray-300 placeholder:text-gray-400 outline-none transition-all focus:border-[#143C2C] focus:ring-2 focus:ring-[#143C2C]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="mb-1.5 block text-sm font-semibold text-[#111827]"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="min-h-11 w-full rounded-xl px-3.5 pr-12 text-base text-[#111827] bg-white border border-gray-300 placeholder:text-gray-400 outline-none transition-all focus:border-[#143C2C] focus:ring-2 focus:ring-[#143C2C]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((shown) => !shown)}
                    className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-xl px-4 py-3 text-sm font-medium bg-red-50 border border-red-200 text-red-800"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="group w-full min-h-12 px-5 py-3 rounded-xl text-base font-semibold transition-all bg-[#143C2C] text-white hover:bg-[#1B4D39] active:scale-[0.99] shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#143C2C] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center justify-center gap-2">
              {isSubmitting ? (
                <span className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
              )}
              <span>
                {selectedRole === 'admin' ? 'Sign in as Administrator' : 'Continue to CSO Directory'}
              </span>
            </span>
          </button>
        </form>

        <p className="text-center text-xs text-[#6B7280]">
          Provincial Government of La Union · SP Committee on Accreditation
        </p>
      </div>
    </div>
  );
}
