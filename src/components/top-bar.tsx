'use client';

import { Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface FilterState {
  region: string;
  serviceLine: string;
  status: string;
  phase: string;
}

export function TopBar({
  filters,
  search,
  onSearch,
  onFilter,
  onExport,
  counts,
  exporting,
  exportDisabled,
}: {
  filters: FilterState;
  search: string;
  onSearch: (value: string) => void;
  onFilter: (key: keyof FilterState, value: string) => void;
  onExport: () => void;
  counts: { assets: number; projects: number };
  exporting?: boolean;
  exportDisabled?: boolean;
}) {
  return (
    <div className="space-y-1.5 rounded-2xl border bg-white/95 p-2 shadow-soft">
      <div className="flex items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search assets or projects" className="pl-9" />
        </div>
        <div className="hidden lg:grid lg:grid-cols-4 lg:gap-2">
          <label className="grid gap-1 text-[11px] text-slate-500">
            <span>Region</span>
            <select className="h-9 appearance-none rounded-xl border bg-white px-2 text-sm text-slate-900 focus:border-[color:var(--brand-primary)]" value={filters.region} onChange={(e) => onFilter('region', e.target.value)}>
              <option>All</option>
              <option>Java</option>
              <option>Sumatra</option>
              <option>Kalimantan</option>
              <option>Sulawesi</option>
              <option>Papua</option>
            </select>
          </label>
          <label className="grid gap-1 text-[11px] text-slate-500">
            <span>Service</span>
            <select className="h-9 appearance-none rounded-xl border bg-white px-2 text-sm text-slate-900 focus:border-[color:var(--brand-primary)]" value={filters.serviceLine} onChange={(e) => onFilter('serviceLine', e.target.value)}>
              <option>All</option>
              <option>Dredging</option>
              <option>Dewatering</option>
              <option>SoilImprovement</option>
            </select>
          </label>
          <label className="grid gap-1 text-[11px] text-slate-500">
            <span>Status</span>
            <select className="h-9 appearance-none rounded-xl border bg-white px-2 text-sm text-slate-900 focus:border-[color:var(--brand-primary)]" value={filters.status} onChange={(e) => onFilter('status', e.target.value)}>
              <option>All</option>
              <option>Working</option>
              <option>Mobilizing</option>
              <option>Idle</option>
              <option>Maintenance</option>
              <option>Standby</option>
            </select>
          </label>
          <label className="grid gap-1 text-[11px] text-slate-500">
            <span>Phase</span>
            <select className="h-9 appearance-none rounded-xl border bg-white px-2 text-sm text-slate-900 focus:border-[color:var(--brand-primary)]" value={filters.phase} onChange={(e) => onFilter('phase', e.target.value)}>
              <option>All</option>
              <option>Mobilisasi</option>
              <option>Survey</option>
              <option>Lokasi</option>
              <option>Perakitan</option>
              <option>Operasi</option>
              <option>Disposal</option>
            </select>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2 lg:hidden">
          <select className="h-9 appearance-none rounded-xl border bg-white px-2 text-sm text-slate-900 focus:border-[color:var(--brand-primary)]" value={filters.region} onChange={(e) => onFilter('region', e.target.value)}>
            <option value="All">Region: All</option>
            <option>Java</option>
            <option>Sumatra</option>
            <option>Kalimantan</option>
            <option>Sulawesi</option>
            <option>Papua</option>
          </select>
          <select className="h-9 appearance-none rounded-xl border bg-white px-2 text-sm text-slate-900 focus:border-[color:var(--brand-primary)]" value={filters.serviceLine} onChange={(e) => onFilter('serviceLine', e.target.value)}>
            <option value="All">Service: All</option>
            <option>Dredging</option>
            <option>Dewatering</option>
            <option>SoilImprovement</option>
          </select>
          <select className="h-9 appearance-none rounded-xl border bg-white px-2 text-sm text-slate-900 focus:border-[color:var(--brand-primary)]" value={filters.status} onChange={(e) => onFilter('status', e.target.value)}>
            <option value="All">Status: All</option>
            <option>Working</option>
            <option>Mobilizing</option>
            <option>Idle</option>
            <option>Maintenance</option>
            <option>Standby</option>
          </select>
          <select className="h-9 appearance-none rounded-xl border bg-white px-2 text-sm text-slate-900 focus:border-[color:var(--brand-primary)]" value={filters.phase} onChange={(e) => onFilter('phase', e.target.value)}>
            <option value="All">Phase: All</option>
            <option>Mobilisasi</option>
            <option>Survey</option>
            <option>Lokasi</option>
            <option>Perakitan</option>
            <option>Operasi</option>
            <option>Disposal</option>
          </select>
        </div>
        <Button variant="outline" onClick={onExport} disabled={exporting || exportDisabled} title="Export selected project report">
          <Download className="mr-2 h-4 w-4" />{exporting ? 'Exporting...' : 'Export'}
        </Button>
      </div>
      <p className="px-1 text-[11px] text-slate-500">Filter by region, service line, status, phase. Showing <span className="font-semibold text-slate-700">{counts.assets}</span> assets and <span className="font-semibold text-slate-700">{counts.projects}</span> projects.</p>
      <p className="px-1 text-[11px] text-slate-500">Click a marker to view details and dispatch.</p>
    </div>
  );
}
