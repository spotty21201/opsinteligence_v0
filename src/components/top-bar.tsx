'use client';

import { Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  selectedProjectName,
  onClearSelection,
}: {
  filters: FilterState;
  search: string;
  onSearch: (value: string) => void;
  onFilter: (key: keyof FilterState, value: string) => void;
  onExport: () => void;
  counts: { assets: number; projects: number };
  exporting?: boolean;
  exportDisabled?: boolean;
  selectedProjectName?: string | null;
  onClearSelection?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[rgba(20,131,138,0.14)] bg-[linear-gradient(180deg,rgba(255,252,246,0.97)_0%,rgba(245,250,251,0.94)_100%)] p-3 shadow-soft sm:p-2 sm:backdrop-blur">
      <div className="flex flex-col gap-2.5 sm:gap-1">
        <div className="relative w-full min-w-0">
          <Search className="absolute left-3 top-3 h-4 w-4 text-[color:var(--brand-secondary)]/80 sm:top-2" />
          <Input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search assets or projects"
            className="w-full pl-9 sm:h-8 sm:text-[13px]"
          />
        </div>
        <div className="hidden sm:grid sm:grid-cols-2 sm:gap-1.5 lg:grid-cols-4">
          <label className="grid gap-0 text-[11px] text-slate-500">
            <span>Region</span>
            <select
              className="h-8 w-full appearance-none rounded-xl border border-[rgba(23,58,103,0.12)] bg-white/85 px-2 text-[13px] text-slate-900 focus:border-[color:var(--brand-primary)]"
              value={filters.region}
              onChange={(e) => onFilter('region', e.target.value)}
            >
              <option>All</option>
              <option>Java</option>
              <option>Sumatra</option>
              <option>Kalimantan</option>
              <option>Sulawesi</option>
              <option>Papua</option>
            </select>
          </label>
          <label className="grid gap-0 text-[11px] text-slate-500">
            <span>Service</span>
            <select
              className="h-8 w-full appearance-none rounded-xl border border-[rgba(23,58,103,0.12)] bg-white/85 px-2 text-[13px] text-slate-900 focus:border-[color:var(--brand-primary)]"
              value={filters.serviceLine}
              onChange={(e) => onFilter('serviceLine', e.target.value)}
            >
              <option>All</option>
              <option>Dredging</option>
              <option>Dewatering</option>
              <option>SoilImprovement</option>
            </select>
          </label>
          <label className="grid gap-0 text-[11px] text-slate-500">
            <span>Status</span>
            <select
              className="h-8 w-full appearance-none rounded-xl border border-[rgba(23,58,103,0.12)] bg-white/85 px-2 text-[13px] text-slate-900 focus:border-[color:var(--brand-primary)]"
              value={filters.status}
              onChange={(e) => onFilter('status', e.target.value)}
            >
              <option>All</option>
              <option>Working</option>
              <option>Mobilizing</option>
              <option>Idle</option>
              <option>Maintenance</option>
              <option>Standby</option>
            </select>
          </label>
          <label className="grid gap-0 text-[11px] text-slate-500">
            <span>Phase</span>
            <select
              className="h-8 w-full appearance-none rounded-xl border border-[rgba(23,58,103,0.12)] bg-white/85 px-2 text-[13px] text-slate-900 focus:border-[color:var(--brand-primary)]"
              value={filters.phase}
              onChange={(e) => onFilter('phase', e.target.value)}
            >
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
        <div className="grid grid-cols-2 gap-2 sm:hidden">
          <select className="h-10 w-full appearance-none rounded-xl border bg-white px-2 text-sm text-slate-900 focus:border-[color:var(--brand-primary)]" value={filters.region} onChange={(e) => onFilter('region', e.target.value)}>
            <option value="All">Region: All</option>
            <option>Java</option>
            <option>Sumatra</option>
            <option>Kalimantan</option>
            <option>Sulawesi</option>
            <option>Papua</option>
          </select>
          <select className="h-10 w-full appearance-none rounded-xl border bg-white px-2 text-sm text-slate-900 focus:border-[color:var(--brand-primary)]" value={filters.serviceLine} onChange={(e) => onFilter('serviceLine', e.target.value)}>
            <option value="All">Service: All</option>
            <option>Dredging</option>
            <option>Dewatering</option>
            <option>SoilImprovement</option>
          </select>
          <select className="h-10 w-full appearance-none rounded-xl border bg-white px-2 text-sm text-slate-900 focus:border-[color:var(--brand-primary)]" value={filters.status} onChange={(e) => onFilter('status', e.target.value)}>
            <option value="All">Status: All</option>
            <option>Working</option>
            <option>Mobilizing</option>
            <option>Idle</option>
            <option>Maintenance</option>
            <option>Standby</option>
          </select>
          <select className="h-10 w-full appearance-none rounded-xl border bg-white px-2 text-sm text-slate-900 focus:border-[color:var(--brand-primary)]" value={filters.phase} onChange={(e) => onFilter('phase', e.target.value)}>
            <option value="All">Phase: All</option>
            <option>Mobilisasi</option>
            <option>Survey</option>
            <option>Lokasi</option>
            <option>Perakitan</option>
            <option>Operasi</option>
            <option>Disposal</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5 sm:grid sm:grid-cols-[1fr_auto] sm:items-center sm:gap-1.5">
          <div className="min-h-0">
            {selectedProjectName ? (
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-[rgba(20,131,138,0.18)] bg-[rgba(20,131,138,0.1)] text-[color:var(--brand-primary)]">
                  Selected project: {selectedProjectName}
                </Badge>
                {onClearSelection ? (
                  <button type="button" onClick={onClearSelection} className="text-xs text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline">
                    Clear selection
                  </button>
                ) : null}
              </div>
            ) : (
              <p className="text-[11px] leading-tight text-slate-500">Select a project marker to export its report.</p>
            )}
          </div>
          <Button className="w-full sm:h-8 sm:w-auto sm:px-3" variant="outline" onClick={onExport} disabled={exporting || exportDisabled} title="Export selected project report">
            <Download className="mr-2 h-4 w-4" />{exporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </div>
      <div className="mt-1 flex flex-col gap-1 px-1 leading-relaxed sm:mt-0">
        <p className="w-full min-w-0 break-words whitespace-normal text-[11px] text-slate-500">
          Region and service apply to both datasets. Status filters assets; phase filters projects. Showing <span className="font-semibold text-slate-700">{counts.assets}</span> assets and <span className="font-semibold text-slate-700">{counts.projects}</span> projects.
        </p>
      </div>
    </div>
  );
}
