'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ClipboardList, FileText, LayoutDashboard, Menu, Settings, Ship, Workflow, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
            className={cn('flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm text-slate-600', active ? 'border-slate-200 bg-slate-100 text-slate-900' : 'hover:bg-slate-50')}
          >
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

      <aside className="hidden h-screen w-60 border-r bg-white/90 p-4 md:block">
        <div className="rounded-xl border bg-slate-50 p-3">
          <p className="text-sm font-semibold">3Sigma Ops Intelligence</p>
          <p className="font-serif text-xs italic text-slate-500">See the fleet. Plan mobilization.</p>
        </div>
        <NavItems pathname={pathname} />
        <p className="absolute bottom-4 w-[220px] text-[11px] text-slate-500">Built by Kolabs.Design x AIM+HDA Collective</p>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button className="absolute inset-0 bg-slate-900/30" onClick={() => setOpen(false)} aria-label="close navigation" />
          <aside className="relative z-10 h-full w-72 border-r bg-white p-4">
            <div className="flex items-center justify-between rounded-xl border bg-slate-50 p-3">
              <p className="text-sm font-semibold">3Sigma Ops Intelligence</p>
              <button onClick={() => setOpen(false)} className="rounded-lg border p-1"><X className="h-4 w-4" /></button>
            </div>
            <NavItems pathname={pathname} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
