'use client';

import React, { useState } from 'react';
import { useAuth } from '@/client/context/AuthContext';
import type { UserRole } from '@/client/lib/auth';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
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

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-10 bg-[#143C2C]"
      style={{
        backgroundImage:
          'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(135deg, #0E2B1F 0%, #143C2C 50%, #1F573F 100%)',
        backgroundSize: '24px 24px, 100% 100%',
      }}
    >
      <div className="w-full max-w-lg space-y-5 animate-fadeIn">
        {/* Centered Glassmorphism Login Card */}
        <form
          onSubmit={handleLogin}
          className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 sm:p-10 shadow-[0_16px_48px_rgba(0,0,0,0.35)] space-y-6"
        >
          {/* Card Header */}
          <div className="flex flex-col items-center text-center space-y-2.5 pb-4 border-b border-white/15">
            <BrandLogo size={48} />
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                CSOTrack
              </h1>
              <p className="text-sm text-white/75">
                SP Accredited CSO Registry · Term 2025–2028
              </p>
            </div>
          </div>

          {/* Segmented Role Switch */}
          <div
            role="tablist"
            aria-label="Access type"
            className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-black/20 border border-white/10"
          >
            <button
              type="button"
              role="tab"
              aria-selected={selectedRole === 'guest'}
              onClick={() => {
                setSelectedRole('guest');
                setError('');
              }}
              className={`min-h-10 rounded-lg text-sm font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${
                selectedRole === 'guest'
                  ? 'bg-white text-[#143C2C] shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Public Guest
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={selectedRole === 'admin'}
              onClick={() => {
                setSelectedRole('admin');
                setError('');
              }}
              className={`min-h-10 rounded-lg text-sm font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${
                selectedRole === 'admin'
                  ? 'bg-white text-[#143C2C] shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Administrator
            </button>
          </div>

          {selectedRole === 'guest' ? (
            <p className="text-sm text-white/80 leading-relaxed text-center py-2">
              Browse and search accredited Civil Society Organizations across La Union. No account or password is required.
            </p>
          ) : (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="admin-username"
                  className="mb-1.5 block text-sm font-medium text-white/90"
                >
                  Email or username
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
                  className="min-h-11 w-full rounded-xl px-3.5 text-base text-white bg-white/10 border border-white/25 placeholder:text-white/45 outline-none transition-all focus:border-white/60 focus:ring-2 focus:ring-white/20"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="mb-1.5 block text-sm font-medium text-white/90"
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
                    placeholder="Enter password"
                    className="min-h-11 w-full rounded-xl px-3.5 pr-11 text-base text-white bg-white/10 border border-white/25 placeholder:text-white/45 outline-none transition-all focus:border-white/60 focus:ring-2 focus:ring-white/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((shown) => !shown)}
                    className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-white/70 hover:text-white transition-colors"
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
              className="rounded-xl px-3.5 py-2.5 text-sm font-medium bg-red-500/20 border border-red-300/40 text-red-100"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="group w-full min-h-10 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all bg-white text-[#143C2C] hover:bg-gray-100 active:scale-[0.99] shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center justify-center gap-2">
              {isSubmitting ? (
                <span className="inline-block w-4 h-4 rounded-full border-2 border-[#143C2C]/30 border-t-[#143C2C] animate-spin" />
              ) : (
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              )}
              <span>
                {selectedRole === 'admin' ? 'Sign in' : 'Open CSO Directory'}
              </span>
            </span>
          </button>
        </form>

        <p className="text-center text-xs text-white/65">
          Province of La Union · Sangguniang Panlalawigan
        </p>
      </div>
    </div>
  );
}
