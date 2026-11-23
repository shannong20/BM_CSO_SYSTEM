'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/client/context/AuthContext';
import { Sidebar } from '@/client/components/Sidebar';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (pathname === '/login') {
      if (isAuthenticated) {
        router.replace(isAdmin ? '/' : '/directory');
      }
      return;
    }

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (!isAdmin && (pathname === '/' || pathname.startsWith('/register'))) {
      router.replace('/directory');
    }
  }, [isAdmin, isAuthenticated, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center">
        <p role="status" className="inline-flex items-center gap-3 text-sm font-medium text-[#245b29]">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#245b29]/20 border-t-[#245b29]" />
          Loading CSOTrack...
        </p>
      </div>
    );
  }
  if (pathname === '/login') {
    return isAuthenticated ? null : <main className="min-h-screen w-full">{children}</main>;
  }
  if (!isAuthenticated) return null;
  if (!isAdmin && (pathname === '/' || pathname.startsWith('/register'))) return null;

  return (
    <>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64 min-h-screen overflow-hidden">
        <main className="w-full flex-1 p-4 sm:p-6 md:p-8 lg:p-10 min-w-0">
          {children}
        </main>
      </div>
    </>
  );
}