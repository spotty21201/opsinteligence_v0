'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { TopBar } from '@/components/top-bar';
import { RightDrawer } from '@/components/drawers/right-drawer';
import { DispatchModal } from '@/components/dispatch/dispatch-modal';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Spinner } from '@/components/ui/spinner';
import { useUiStore } from '@/store/ui-store';
import { Asset, Assignment, DailyLog, Project, SpeedProfile } from '@/lib/types';
import { useToast } from '@/components/ui/toast-provider';

const MapClient = dynamic(() => import('@/components/Map').then((mod) => mod.Map), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[620px] w-full items-center justify-center rounded-2xl border bg-slate-50">
      <span className="inline-flex items-center gap-2 text-sm text-slate-600"><Spinner />Loading map...</span>
    </div>
  ),
});

function regionFor(lat: number, lng: number) {
  if (lat > 1) return 'Sumatra';
  if (lng > 114 && lat < 2 && lat > -4) return 'Kalimantan';
  if (lng > 119 && lat < 3) return 'Sulawesi';
  if (lng > 126) return 'Papua';
  return 'Java';
}

export function DashboardCockpit({
  assets,
  projects,
  logs,
  assignments,
  speedProfiles,
}: {
  assets: Asset[];
  projects: Project[];
  logs: DailyLog[];
  assignments: Assignment[];
  speedProfiles: SpeedProfile[];
}) {
  const { dispatchPrefill, setDispatchPrefill, drawer, setDrawer } = useUiStore();
  const toast = useToast();
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({ region: 'All', serviceLine: 'All', status: 'All', phase: 'All' });
  const [liveAssets, setLiveAssets] = useState(assets);
  const [liveProjects, setLiveProjects] = useState(projects);
  const [liveLogs, setLiveLogs] = useState(logs);
  const [liveAssignments, setLiveAssignments] = useState(assignments);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const handleRefresh = async () => {
      const [assetRes, projectRes] = await Promise.all([fetch('/api/assets').then((r) => r.json()), fetch('/api/projects').then((r) => r.json())]);
      setLiveAssets(assetRes.items ?? []);
      setLiveProjects(projectRes.items ?? []);
    };
    window.addEventListener('ops-data-refresh', handleRefresh);
    return () => window.removeEventListener('ops-data-refresh', handleRefresh);
  }, []);

  const filtered = useMemo(() => {
    const filteredAssets = liveAssets.filter((asset) => {
      if (filters.region !== 'All' && regionFor(asset.lat, asset.lng) !== filters.region) return false;
      if (filters.serviceLine !== 'All' && asset.service_line !== filters.serviceLine) return false;
      if (filters.status !== 'All' && asset.status !== filters.status) return false;
      if (debouncedSearch && !asset.name.toLowerCase().includes(debouncedSearch)) return false;
      return true;
    });
    const filteredProjects = liveProjects.filter((project) => {
      if (filters.region !== 'All' && regionFor(project.lat, project.lng) !== filters.region) return false;
      if (filters.serviceLine !== 'All' && project.service_line !== filters.serviceLine) return false;
      if (filters.phase !== 'All' && project.phase !== filters.phase) return false;
      if (debouncedSearch && !project.name.toLowerCase().includes(debouncedSearch)) return false;
      return true;
    });
    return { assets: filteredAssets, projects: filteredProjects };
  }, [liveAssets, liveProjects, filters, debouncedSearch]);

  async function refreshAssignmentsAndLogs() {
    const [assignmentRes, logRes, assetRes, projectRes] = await Promise.all([
      fetch('/api/assignments').then((r) => r.json()),
      fetch('/api/daily-logs').then((r) => r.json()),
      fetch('/api/assets').then((r) => r.json()),
      fetch('/api/projects').then((r) => r.json()),
    ]);
    setLiveAssignments(assignmentRes.items ?? []);
    setLiveLogs(logRes.items ?? []);
    setLiveAssets(assetRes.items ?? []);
    setLiveProjects(projectRes.items ?? []);
  }

  async function exportSelectedProject() {
    const selectedProjectId = drawer.mode === 'project' ? drawer.selectedId : filtered.projects[0]?.id;
    if (!selectedProjectId) {
      toast('Select a project marker first', 'error');
      return;
    }

    setExporting(true);
    try {
      const response = await fetch(`/api/reports/${selectedProjectId}`);
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedProjectId}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      window.open(`/report/${selectedProjectId}?print=1`, '_blank');
      toast('PDF exported', 'success');
    } catch {
      toast('PDF export failed', 'error');
    } finally {
      setExporting(false);
    }
  }

  const noResults = filtered.assets.length === 0 && filtered.projects.length === 0;
  const kpis = [
    { label: 'Active Assets', value: liveAssets.filter((row) => row.status === 'Working').length },
    { label: 'Idle / Standby', value: liveAssets.filter((row) => row.status === 'Idle' || row.status === 'Standby').length },
    { label: 'Projects in Operasi', value: liveProjects.filter((row) => row.phase === 'Operasi').length },
    { label: 'Assignments Planned', value: liveAssignments.filter((row) => row.status === 'Planned').length },
  ];

  return (
    <div className="relative h-[calc(100vh-2rem)] overflow-hidden rounded-2xl border bg-white">
      <div className="absolute left-4 right-[450px] top-4 z-20">
        <TopBar
          filters={filters}
          search={search}
          onSearch={setSearch}
          onFilter={(key, value) => setFilters((curr) => ({ ...curr, [key]: value }))}
          onExport={exportSelectedProject}
          exporting={exporting}
          counts={{ assets: filtered.assets.length, projects: filtered.projects.length }}
        />
      </div>
      <div className="absolute left-4 right-[450px] top-[98px] z-20 grid grid-cols-2 gap-2 lg:grid-cols-4">
        {kpis.map((item) => (
          <div key={item.label} className="rounded-xl border bg-white px-3 py-2 shadow-soft">
            <p className="text-[11px] text-slate-500">{item.label}</p>
            <p className="text-xl font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="h-full w-full pr-[430px]">
        <ErrorBoundary fallbackTitle="Dashboard map unavailable" fallbackDescription="Map rendering failed. You can still use tables and reports.">
          <MapClient
            assets={filtered.assets}
            projects={filtered.projects}
            onSelectAsset={(id) => setDrawer({ mode: 'asset', selectedId: id })}
            onSelectProject={(id) => setDrawer({ mode: 'project', selectedId: id })}
          />
        </ErrorBoundary>
      </div>

      {noResults && (
        <div className="absolute inset-x-8 top-[186px] z-20 rounded-xl border bg-white/95 p-3 text-sm text-slate-600 shadow-soft">
          No map results found for current search and filters.
        </div>
      )}

      <RightDrawer
        assets={liveAssets}
        projects={liveProjects}
        logs={liveLogs}
        assignments={liveAssignments}
        speedProfiles={speedProfiles}
        onLogSaved={refreshAssignmentsAndLogs}
        onAssign={(prefill) => {
          setDispatchPrefill(prefill);
          setDispatchOpen(true);
        }}
      />

      <DispatchModal
        open={dispatchOpen}
        onOpenChange={setDispatchOpen}
        assets={liveAssets}
        projects={liveProjects}
        prefill={dispatchPrefill}
        onCreated={refreshAssignmentsAndLogs}
      />
    </div>
  );
}
