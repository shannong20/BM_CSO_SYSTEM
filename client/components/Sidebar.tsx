'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  HelpCircle,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/client/context/AuthContext';
import { BrandLogo } from '@/client/components/BrandLogo';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  active: boolean;
  soon: boolean;
}

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggleCollapse,
}) => {
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
      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 flex h-14 items-center justify-between bg-[#143C2C] px-4 text-white shadow-sm border-b border-[#1B4D39]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg bg-[#1B4D39] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            aria-label="Toggle Navigation"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <BrandLogo size={28} />
          <span className="font-bold text-base tracking-tight">CSOTrack</span>
        </div>
        <span className="text-xs font-semibold text-[#B0D1C2] uppercase tracking-wider">
          SP Registry
        </span>
      </header>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 ${
          collapsed ? 'lg:w-20' : 'lg:w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } bg-[#143C2C] text-white flex flex-col justify-between transition-all duration-300 ease-in-out border-r border-[#1B4D39]`}
      >
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:inline-flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-50 h-7 w-7 items-center justify-center rounded-full bg-white text-[#143C2C] border border-gray-200 shadow-md hover:bg-emerald-50 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245b29] transition-all"
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        )}

        <div className={`${collapsed ? 'p-4 lg:px-3' : 'p-5'} flex-1 flex flex-col`}>
          {/* Logo & Header */}
          <div
            className={`flex items-center pb-5 border-b border-[#1E523D] ${
              collapsed ? 'lg:justify-center' : 'gap-3'
            }`}
          >
            <BrandLogo size={collapsed ? 36 : 42} className="shrink-0 drop-shadow-sm" />
            <div className={collapsed ? 'lg:hidden' : ''}>
              <p className="font-bold text-lg text-white leading-tight tracking-tight">CSOTrack</p>
              <p className="text-xs font-semibold text-[#B0D1C2] tracking-wider uppercase">
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
                  title={collapsed ? item.name : undefined}
                  aria-label={item.name}
                  className={`flex items-center rounded-xl text-sm font-medium transition-colors ${
                    collapsed
                      ? 'justify-between lg:justify-center px-3.5 py-2.5 lg:px-2'
                      : 'justify-between px-3.5 py-2.5'
                  } ${
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
                    <span className={collapsed ? 'lg:hidden' : ''}>{item.name}</span>
                  </div>

                  {item.soon && (
                    <span
                      className={`${
                        collapsed ? 'lg:hidden' : ''
                      } inline-flex min-h-10 items-center text-sm uppercase font-semibold px-3 rounded-full bg-[#1F4A39] text-[#E1F0E8]`}
                    >
                      Soon
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Help Box */}
          <div className="mt-auto pt-6">
            <div className={`${collapsed ? 'lg:hidden' : ''} p-4 rounded-xl bg-[#1A4735] text-white relative overflow-hidden`}>
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
                type="button"
                onClick={logout}
                title={collapsed ? 'Logout' : undefined}
                aria-label="Logout"
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-[#B0D1C2] hover:text-white hover:bg-[#1B4D39] transition-colors ${
                  collapsed ? 'lg:justify-center lg:px-2' : ''
                }`}
              >
                <LogOut size={16} />
                <span className={collapsed ? 'lg:hidden' : ''}>Logout</span>
              </button>
            </div>

            {/* Footer Tag */}
            <div className={`${collapsed ? 'lg:hidden' : ''} mt-4 pt-3 border-t border-[#1E523D] text-center`}>
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