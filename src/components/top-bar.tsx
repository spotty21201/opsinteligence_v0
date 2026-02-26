'use client';

import { Download, Search } from 'lucide-react';
import { useUiStore } from '@/store/ui-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function TopBar({ onExport }: { onExport?: () => void }) {
  const { search, setSearch, filters, setFilter } = useUiStore();

  return (
    <div className="flex items-center gap-2 rounded-2xl border bg-white/95 p-2 shadow-soft">
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search assets or projects" className="pl-9" />
      </div>
      <select className="h-10 rounded-xl border px-2 text-sm" value={filters.region} onChange={(e) => setFilter('region', e.target.value)}>
        <option>All</option>
        <option>Java</option>
        <option>Sumatra</option>
        <option>Kalimantan</option>
        <option>Sulawesi</option>
        <option>Papua</option>
      </select>
      <select className="h-10 rounded-xl border px-2 text-sm" value={filters.serviceLine} onChange={(e) => setFilter('serviceLine', e.target.value)}>
        <option>All</option>
        <option>Dredging</option>
        <option>Dewatering</option>
        <option>SoilImprovement</option>
      </select>
      <select className="h-10 rounded-xl border px-2 text-sm" value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
        <option>All</option>
        <option>Working</option>
        <option>Mobilizing</option>
        <option>Idle</option>
        <option>Maintenance</option>
        <option>Standby</option>
      </select>
      <select className="h-10 rounded-xl border px-2 text-sm" value={filters.phase} onChange={(e) => setFilter('phase', e.target.value)}>
        <option>All</option>
        <option>Mobilisasi</option>
        <option>Survey</option>
        <option>Lokasi</option>
        <option>Perakitan</option>
        <option>Operasi</option>
        <option>Disposal</option>
      </select>
      <Button variant="outline" onClick={onExport}><Download className="mr-2 h-4 w-4" />Export</Button>
    </div>
  );
}
