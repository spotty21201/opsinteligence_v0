'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, FileText, LayoutDashboard, Settings, Ship, Workflow } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/assets', label: 'Assets', icon: Ship },
  { href: '/projects', label: 'Projects', icon: ClipboardList },
  { href: '/dispatch', label: 'Dispatch', icon: Workflow },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/admin', label: 'Admin', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-60 border-r bg-white/90 p-4">
      <div className="rounded-xl border bg-slate-50 p-3">
        <p className="text-sm font-semibold">3Sigma Ops Intelligence</p>
        <p className="font-serif text-xs italic text-slate-500">See the fleet. Plan mobilization.</p>
      </div>
      <nav className="mt-6 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={cn('flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm text-slate-600', active ? 'border-slate-200 bg-slate-100 text-slate-900' : 'hover:bg-slate-50')}>
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <p className="absolute bottom-4 w-[220px] text-[11px] text-slate-500">Built by Kolabs.Design x AIM+HDA Collective</p>
    </aside>
  );
}
