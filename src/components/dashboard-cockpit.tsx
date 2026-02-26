'use client';

import { useMemo, useState } from 'react';
import { Map } from '@/components/Map';
import { TopBar } from '@/components/top-bar';
import { RightDrawer } from '@/components/drawers/right-drawer';
import { DispatchModal } from '@/components/dispatch/dispatch-modal';
import { useUiStore } from '@/store/ui-store';
import { Asset, Assignment, DailyLog, Project, SpeedProfile } from '@/lib/types';
import { useToast } from '@/components/ui/toast-provider';

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
  const [filters, setFilters] = useState({ region: 'All', serviceLine: 'All', status: 'All', phase: 'All' });
  const [liveLogs, setLiveLogs] = useState(logs);
  const [liveAssignments, setLiveAssignments] = useState(assignments);
  const [exporting, setExporting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filteredAssets = assets.filter((asset) => {
      if (filters.region !== 'All' && regionFor(asset.lat, asset.lng) !== filters.region) return false;
      if (filters.serviceLine !== 'All' && asset.service_line !== filters.serviceLine) return false;
      if (filters.status !== 'All' && asset.status !== filters.status) return false;
      if (q && !asset.name.toLowerCase().includes(q)) return false;
      return true;
    });
    const filteredProjects = projects.filter((project) => {
      if (filters.region !== 'All' && regionFor(project.lat, project.lng) !== filters.region) return false;
      if (filters.serviceLine !== 'All' && project.service_line !== filters.serviceLine) return false;
      if (filters.phase !== 'All' && project.phase !== filters.phase) return false;
      if (q && !project.name.toLowerCase().includes(q)) return false;
      return true;
    });
    return { assets: filteredAssets, projects: filteredProjects };
  }, [assets, projects, filters, search]);

  async function refreshAssignmentsAndLogs() {
    const [assignmentRes, logRes] = await Promise.all([
      fetch('/api/assignments').then((r) => r.json()),
      fetch('/api/daily-logs').then((r) => r.json()),
    ]);
    setLiveAssignments(assignmentRes.items ?? []);
    setLiveLogs(logRes.items ?? []);
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

      <div className="h-full w-full pr-[430px]">
        <Map
          assets={filtered.assets}
          projects={filtered.projects}
          onSelectAsset={(id) => setDrawer({ mode: 'asset', selectedId: id })}
          onSelectProject={(id) => setDrawer({ mode: 'project', selectedId: id })}
        />
      </div>

      <RightDrawer
        assets={assets}
        projects={projects}
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
        assets={assets}
        projects={projects}
        prefill={dispatchPrefill}
        onCreated={refreshAssignmentsAndLogs}
      />
    </div>
  );
}
