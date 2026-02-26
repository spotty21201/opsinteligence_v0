'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ClipboardList, FileText, LayoutDashboard, Menu, Settings, Ship, Workflow, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TrisigmaLogo } from '@/components/brand/trisigma-logo';

const items = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/assets', label: 'Assets', icon: Ship },
  { href: '/projects', label: 'Projects', icon: ClipboardList },
  { href: '/dispatch', label: 'Dispatch', icon: Workflow },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/admin', label: 'Admin', icon: Settings },
];

function NavItems({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="mt-6 space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'relative flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm text-slate-600 transition-colors',
              active ? 'border-[color:var(--brand-soft-blue)] bg-[color:var(--brand-soft)] text-[color:var(--brand-primary)]' : 'hover:bg-white',
            )}
          >
            {active ? <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r bg-[color:var(--brand-primary)]" /> : null}
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-white px-4 md:hidden">
        <button onClick={() => setOpen(true)} className="rounded-lg border p-2"><Menu className="h-4 w-4" /></button>
        <p className="text-sm font-semibold">3Sigma Ops Intelligence</p>
        <span className="w-8" />
      </header>

      <aside className="hidden h-screen w-64 border-r border-[#E5E7EB] bg-[#F7FAFD] p-4 md:block">
        <div className="rounded-2xl border bg-white px-4 py-4 shadow-soft">
          <TrisigmaLogo />
          <p className="mt-2 text-[21px] font-extrabold tracking-[-0.01em] text-slate-900">3Sigma Ops Intelligence</p>
          <p className="mt-1 text-[14px] italic text-slate-700" style={{ fontFamily: 'var(--font-serif)' }}>See the fleet. Plan mobilization.</p>
          <div className="mt-3 h-[2px] rounded bg-gradient-to-r from-[#1D498B] to-[#36787D]" />
          <span className="mt-3 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium text-slate-500">Release 0.0 Demo</span>
        </div>
        <NavItems pathname={pathname} />
        <p className="absolute bottom-4 w-[220px] text-[11px] text-slate-500">Built by Kolabs.Design <span className="text-[color:var(--accent-orange)]">•</span> AIM+HDA Collective</p>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button className="absolute inset-0 bg-slate-900/30" onClick={() => setOpen(false)} aria-label="close navigation" />
          <aside className="relative z-10 h-full w-72 border-r border-[#E5E7EB] bg-[#F7FAFD] p-4">
            <div className="rounded-2xl border bg-white px-4 py-4 shadow-soft">
              <div className="flex items-start justify-between">
                <div>
                  <TrisigmaLogo />
                  <p className="mt-2 text-[20px] font-extrabold tracking-[-0.01em] text-slate-900">3Sigma Ops Intelligence</p>
                  <p className="mt-1 text-[14px] italic text-slate-700" style={{ fontFamily: 'var(--font-serif)' }}>See the fleet. Plan mobilization.</p>
                </div>
                <button onClick={() => setOpen(false)} className="rounded-lg border p-1"><X className="h-4 w-4" /></button>
              </div>
              <div className="mt-3 h-[2px] rounded bg-gradient-to-r from-[#1D498B] to-[#36787D]" />
              <span className="mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium text-slate-500">Release 0.0 Demo</span>
            </div>
            <NavItems pathname={pathname} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
