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
}: {
  filters: FilterState;
  search: string;
  onSearch: (value: string) => void;
  onFilter: (key: keyof FilterState, value: string) => void;
  onExport: () => void;
  counts: { assets: number; projects: number };
  exporting?: boolean;
}) {
  return (
    <div className="space-y-1.5 rounded-2xl border bg-white/95 p-2 shadow-soft">
      <div className="flex items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search assets or projects" className="pl-9" />
        </div>
        <select className="h-9 appearance-none rounded-xl border bg-white px-2 text-sm text-slate-900" value={filters.region} onChange={(e) => onFilter('region', e.target.value)}>
          <option>All</option>
          <option>Java</option>
          <option>Sumatra</option>
          <option>Kalimantan</option>
          <option>Sulawesi</option>
          <option>Papua</option>
        </select>
        <select className="h-9 appearance-none rounded-xl border bg-white px-2 text-sm text-slate-900" value={filters.serviceLine} onChange={(e) => onFilter('serviceLine', e.target.value)}>
          <option>All</option>
          <option>Dredging</option>
          <option>Dewatering</option>
          <option>SoilImprovement</option>
        </select>
        <select className="h-9 appearance-none rounded-xl border bg-white px-2 text-sm text-slate-900" value={filters.status} onChange={(e) => onFilter('status', e.target.value)}>
          <option>All</option>
          <option>Working</option>
          <option>Mobilizing</option>
          <option>Idle</option>
          <option>Maintenance</option>
          <option>Standby</option>
        </select>
        <select className="h-9 appearance-none rounded-xl border bg-white px-2 text-sm text-slate-900" value={filters.phase} onChange={(e) => onFilter('phase', e.target.value)}>
          <option>All</option>
          <option>Mobilisasi</option>
          <option>Survey</option>
          <option>Lokasi</option>
          <option>Perakitan</option>
          <option>Operasi</option>
          <option>Disposal</option>
        </select>
        <Button variant="outline" onClick={onExport} disabled={exporting}>
          <Download className="mr-2 h-4 w-4" />{exporting ? 'Exporting...' : 'Export'}
        </Button>
      </div>
      <p className="px-1 text-[11px] text-slate-500">Filter by region, service line, status, phase. Showing {counts.assets} assets and {counts.projects} projects.</p>
    </div>
  );
}
