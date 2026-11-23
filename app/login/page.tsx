'use client';

import React, { useState } from 'react';
import { useAuth } from '@/client/context/AuthContext';
import type { UserRole } from '@/client/lib/auth';
import { ShieldCheck, User, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>('guest');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { login, loginAdmin, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    // Already logged in, redirect to appropriate page
    return null; // The layout will handle redirect via router in useEffect if needed
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
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
      value: 'admin',
      label: 'Administrator',
      description: 'Full access: register CSOs, upload certificates, manage all records.',
      icon: ShieldCheck,
    },
    {
      value: 'guest',
      label: 'Guest',
      description: 'View only: browse the CSO directory and read records. Cannot register or upload.',
      icon: User,
    },
  ];

  return (
    /* ── Glassmorphism background ── */
    <div
      className="relative min-h-screen flex items-center justify-center p-4 sm:p-8 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0d2b1e 0%, #143C2C 40%, #1a5c3a 70%, #22703f 100%)',
      }}
    >
      {/* Decorative blurred orbs for the glass effect backdrop */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: '-10%', left: '-10%',
          width: '480px', height: '480px', borderRadius: '50%',
          background: 'rgba(34, 112, 63, 0.45)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', bottom: '-12%', right: '-8%',
          width: '520px', height: '520px', borderRadius: '50%',
          background: 'rgba(20, 60, 44, 0.55)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: '40%', left: '55%',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.07)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Glassmorphism card ── */}
      <form
        onSubmit={handleLogin}
        className="relative z-10 max-w-md w-full space-y-6 rounded-2xl p-8 sm:p-10"
        style={{
          background: 'rgba(255, 255, 255, 0.10)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.20)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
        }}
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow">
            CSOTrack Login
          </h1>
          <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Select your role to access the SP Accredited CSO Registry.
          </p>
        </div>

        {/* Role selector */}
        <div className="space-y-3">
          {roles.map((role) => {
            const isSelected = selectedRole === role.value;
            return (
              <button
                key={role.value}
                type="button"
                onClick={() => setSelectedRole(role.value)}
                className="w-full flex items-start gap-3 px-4 py-4 rounded-xl transition-all text-left"
                style={{
                  background: isSelected
                    ? 'rgba(255,255,255,0.20)'
                    : 'rgba(255,255,255,0.07)',
                  border: isSelected
                    ? '1px solid rgba(255,255,255,0.45)'
                    : '1px solid rgba(255,255,255,0.15)',
                  boxShadow: isSelected ? '0 4px 16px rgba(0,0,0,0.20)' : 'none',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
              >
                {/* Role icon */}
                <div
                  className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full"
                  style={{
                    background: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.10)',
                    border: '1px solid rgba(255,255,255,0.25)',
                  }}
                >
                  <role.icon size={18} className="text-white" />
                </div>

                {/* Label + description */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm leading-tight">{role.label}</p>
                  <p className="text-xs mt-0.5 leading-snug" style={{ color: 'rgba(255,255,255,0.60)' }}>
                    {role.description}
                  </p>
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <div
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center self-center"
                    style={{ background: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.6)' }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Admin credentials */}
        {selectedRole === 'admin' && (
          <div className="space-y-4">
            {/* Username */}
            <div>
              <label
                htmlFor="admin-username"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: 'rgba(255,255,255,0.85)' }}
              >
                Username
              </label>
              <input
                id="admin-username"
                name="username"
                type="email"
                autoComplete="username"
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="admin@example.com"
                className="min-h-11 w-full rounded-xl px-3 text-sm outline-none transition-all placeholder:text-white/30"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: 'white',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
                onFocus={(e) => {
                  e.target.style.border = '1px solid rgba(255,255,255,0.55)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.10)';
                }}
                onBlur={(e) => {
                  e.target.style.border = '1px solid rgba(255,255,255,0.25)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="admin-password"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: 'rgba(255,255,255,0.85)' }}
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
                  placeholder="••••••••"
                  className="min-h-11 w-full rounded-xl px-3 pr-11 text-sm outline-none transition-all placeholder:text-white/30"
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    color: 'white',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                  }}
                  onFocus={(e) => {
                    e.target.style.border = '1px solid rgba(255,255,255,0.55)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.10)';
                  }}
                  onBlur={(e) => {
                    e.target.style.border = '1px solid rgba(255,255,255,0.25)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((shown) => !shown)}
                  className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center hover:opacity-80 transition-opacity"
                  style={{ color: 'rgba(255,255,255,0.65)' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <p
            role="alert"
            className="rounded-xl px-3 py-2.5 text-sm"
            style={{
              background: 'rgba(239,68,68,0.20)',
              border: '1px solid rgba(239,68,68,0.40)',
              color: '#fca5a5',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            {error}
          </p>
        )}

        {/* Submit button */}
        <button
          disabled={isSubmitting || !selectedRole}
          className="w-full min-h-11 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={
            !selectedRole
              ? {
                  background: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.35)',
                  cursor: 'not-allowed',
                  border: '1px solid rgba(255,255,255,0.12)',
                }
              : {
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.12) 100%)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.35)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.20)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }
          }
          onMouseEnter={(e) => {
            if (selectedRole) {
              (e.currentTarget as HTMLButtonElement).style.background =
                'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.18) 100%)';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedRole) {
              (e.currentTarget as HTMLButtonElement).style.background =
                'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.12) 100%)';
            }
          }}
        >
          <span className="flex items-center justify-center gap-2">
            {isSubmitting ? (
              <span className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <ArrowRight size={16} />
            )}
            <span>Continue as {selectedRole?.charAt(0).toUpperCase() + selectedRole!.slice(1)}</span>
          </span>
        </button>

        {/* Guest notice */}
        {selectedRole === 'guest' && (
          <div className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.50)' }}>
            Guest access is view-only and does not require credentials.
          </div>
        )}
      </form>
    </div>
  );
}
