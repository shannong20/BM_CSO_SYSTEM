'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  HelpCircle,
  Menu,
  X,
  FileCheck2,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/client/context/AuthContext';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  active: boolean;
  soon: boolean;
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAuth();

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      active: pathname === '/',
      soon: false,
    },
    {
      name: 'CSO Directory',
      href: '/directory',
      icon: Users,
      active: pathname.startsWith('/directory') || pathname.startsWith('/register'),
      soon: false,
    },
  ];
  return (
    <>
      {/* Mobile hamburger button */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2.5 rounded-lg bg-[#143C2C] text-white shadow-md focus:outline-none"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#143C2C] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-[#1B4D39] ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 flex-1 flex flex-col">
          {/* Logo & Header */}
          <div className="flex items-center gap-3 pb-6 border-b border-[#1E523D]">
            <div className="w-10 h-10 rounded-xl bg-[#20523C] flex items-center justify-center text-emerald-300 shadow-inner">
              <FileCheck2 size={22} className="text-[#A4E0B8]" />
            </div>
            <div>
              <p className="font-bold text-lg text-white leading-tight tracking-tight">CSOTrack</p>
              <p className="text-sm font-semibold text-[#B0D1C2] tracking-wider uppercase">
                SP REGISTRY · 2025–2028
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1.5 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    item.active
                      ? 'bg-[#0E2B1F] text-white shadow-sm ring-1 ring-white/10'
                      : 'text-[#B0D1C2] hover:text-white hover:bg-[#1B4D39]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={18}
                      className={item.active ? 'text-white' : 'text-[#B0D1C2]'}
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.soon && (
                    <span className="inline-flex min-h-10 items-center text-sm uppercase font-semibold px-3 rounded-full bg-[#1F4A39] text-[#E1F0E8]">
                      Soon
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Help Box */}
          <div className="mt-auto pt-6">
            <div className="p-4 rounded-xl bg-[#1A4735] text-white relative overflow-hidden">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-[#245C45] flex items-center justify-center text-emerald-300">
                  <HelpCircle size={14} />
                </div>
                <p className="text-sm font-semibold text-white">Need help?</p>
              </div>
              <p className="text-sm leading-relaxed text-[#D1E7DD]">
                Review the data guide for registration and accreditation.
              </p>
            </div>

            {/* User Info & Logout */}
            <div className="mt-4 pt-4 border-t border-[#1E523D]">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-[#B0D1C2] hover:text-white hover:bg-[#1B4D39] transition-colors"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>

            {/* Footer Tag */}
            <div className="mt-4 pt-3 border-t border-[#1E523D] text-center">
              <p className="text-sm tracking-widest font-bold text-white uppercase">
                Province of La Union
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};