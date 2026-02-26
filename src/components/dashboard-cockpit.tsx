'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { BriefcaseBusiness, Factory, ShipWheel, Timer } from 'lucide-react';
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({ region: 'All', serviceLine: 'All', status: 'All', phase: 'All' });
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [liveAssets, setLiveAssets] = useState(assets);
  const [liveProjects, setLiveProjects] = useState(projects);
  const [liveLogs, setLiveLogs] = useState(logs);
  const [liveAssignments, setLiveAssignments] = useState(assignments);
  const [exporting, setExporting] = useState(false);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    const region = searchParams.get('region') ?? 'All';
    const serviceLine = searchParams.get('serviceLine') ?? 'All';
    const status = searchParams.get('status') ?? 'All';
    const phase = searchParams.get('phase') ?? 'All';
    const project = searchParams.get('project');

    setSearch(q);
    setFilters({ region, serviceLine, status, phase });
    setSelectedProjectId(project);
    if (project) {
      setDrawer({ mode: 'project', selectedId: project });
    }
    // Initialize from query string once on hydration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const setParam = (key: string, value: string) => {
      if (!value || value === 'All') params.delete(key);
      else params.set(key, value);
    };

    setParam('q', search.trim());
    setParam('region', filters.region);
    setParam('serviceLine', filters.serviceLine);
    setParam('status', filters.status);
    setParam('phase', filters.phase);
    if (selectedProjectId) params.set('project', selectedProjectId);
    else params.delete('project');
    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [search, filters, selectedProjectId, router, pathname]);

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
    if (!selectedProjectId) {
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
      window.dispatchEvent(new Event('ops-report-generated'));
      toast('PDF exported', 'success');
    } catch {
      toast('PDF export failed', 'error');
    } finally {
      setExporting(false);
    }
  }

  const noResults = filtered.assets.length === 0 && filtered.projects.length === 0;
  const filteredAssetIds = new Set(filtered.assets.map((row) => row.id));
  const filteredProjectIds = new Set(filtered.projects.map((row) => row.id));
  const kpis = [
    { label: 'Active Assets', value: filtered.assets.filter((row) => row.status === 'Working').length, icon: ShipWheel },
    { label: 'Idle / Standby', value: filtered.assets.filter((row) => row.status === 'Idle' || row.status === 'Standby').length, icon: Factory },
    { label: 'Projects in Operasi', value: filtered.projects.filter((row) => row.phase === 'Operasi').length, icon: BriefcaseBusiness },
    {
      label: 'Assignments Planned',
      value: liveAssignments.filter((row) => row.status === 'Planned' && filteredProjectIds.has(row.project_id) && filteredAssetIds.has(row.asset_id)).length,
      icon: Timer,
    },
  ];

  return (
    <div className="relative h-[calc(100vh-2rem)] overflow-hidden rounded-2xl border bg-white">
      <div className="absolute left-4 right-[450px] top-3 z-20">
        <h1 className="text-base font-semibold text-slate-800">National Operations Map</h1>
        <p className="text-xs text-slate-500">Assets and projects across Indonesia.</p>
      </div>
      <div className="absolute left-4 right-[450px] top-[52px] z-20">
        <TopBar
          filters={filters}
          search={search}
          onSearch={setSearch}
          onFilter={(key, value) => setFilters((curr) => ({ ...curr, [key]: value }))}
          onExport={exportSelectedProject}
          exporting={exporting}
          exportDisabled={!selectedProjectId}
          counts={{ assets: filtered.assets.length, projects: filtered.projects.length }}
        />
      </div>
      <div className="absolute left-4 right-[450px] top-[140px] z-20">
        <p className="mb-2 px-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">Today&apos;s snapshot</p>
      </div>
      <div className="absolute left-4 right-[450px] top-[164px] z-20 grid grid-cols-2 gap-2 lg:grid-cols-4">
        {kpis.map((item) => (
          <div key={item.label} className="rounded-xl border bg-[color:var(--brand-soft)]/70 px-3 py-2 shadow-soft transition-colors hover:bg-[color:var(--brand-soft)]">
            <div className="flex items-start justify-between">
              <p className="text-[12px] text-slate-500">{item.label}</p>
              <item.icon className="h-4 w-4 text-[color:var(--brand-primary)]" />
            </div>
            <p className="text-3xl font-semibold leading-tight text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="h-full w-full pr-[430px] shadow-[inset_0_0_0_1px_rgba(29,73,139,0.06),inset_0_12px_28px_rgba(2,6,23,0.06)]">
        <ErrorBoundary fallbackTitle="Map not supported in this environment" fallbackDescription="Map view is unavailable on this browser/device. You can still use tables and reports.">
          <MapClient
            assets={filtered.assets}
            projects={filtered.projects}
            onSelectAsset={(id) => setDrawer({ mode: 'asset', selectedId: id })}
            onSelectProject={(id) => {
              setSelectedProjectId(id);
              setDrawer({ mode: 'project', selectedId: id });
            }}
          />
        </ErrorBoundary>
      </div>

      {noResults && (
        <div className="absolute inset-x-8 top-[254px] z-20 rounded-xl border bg-white/95 p-3 text-sm text-slate-600 shadow-soft">
          No map results found for current search and filters.
        </div>
      )}
      {showHint ? (
        <div className="absolute bottom-4 left-4 z-20 rounded-xl border bg-white/95 px-3 py-2 text-xs text-slate-600 shadow-soft backdrop-blur">
          <div className="flex items-center gap-2">
            <span>Tip: Click a marker to open details.</span>
            <button type="button" className="rounded px-1 text-slate-500 hover:bg-slate-100" onClick={() => setShowHint(false)}>Dismiss</button>
          </div>
        </div>
      ) : null}

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
