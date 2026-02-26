'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarClock, ClipboardCheck, Clock3, X } from 'lucide-react';
import { Asset, Assignment, DailyLog, Project, SpeedProfile } from '@/lib/types';
import { useUiStore } from '@/store/ui-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn, formatDateTime } from '@/lib/utils';
import { recommendAssets } from '@/lib/recommendation';
import { statusTagClasses } from '@/styles/tokens';
import { DOWNTIME_TAGS } from '@/lib/constants';
import { useToast } from '@/components/ui/toast-provider';
import { ProjectSnapshot } from '@/components/projects/project-snapshot';

export function RightDrawer({
  assets,
  projects,
  logs,
  assignments,
  speedProfiles,
  onAssign,
  onLogSaved,
}: {
  assets: Asset[];
  projects: Project[];
  logs: DailyLog[];
  assignments: Assignment[];
  speedProfiles: SpeedProfile[];
  onAssign: (prefill: { projectId?: string; assetId?: string }) => void;
  onLogSaved?: () => Promise<void> | void;
}) {
  const { drawer, closeDrawer } = useUiStore();
  const toast = useToast();
  const [assetTab, setAssetTab] = useState('overview');
  const [projectTab, setProjectTab] = useState('snapshot');
  const [assetFilter, setAssetFilter] = useState('All');
  const [logForm, setLogForm] = useState({
    date: '',
    asset_id: '',
    hours_worked: 8,
    progress_value: 0,
    progress_unit: 'm3/day',
    downtime_tag: '',
    downtime_other: '',
    notes: '',
    attachments: '[]',
  });

  const asset = drawer.mode === 'asset' ? assets.find((row) => row.id === drawer.selectedId) : null;
  const project = drawer.mode === 'project' ? projects.find((row) => row.id === drawer.selectedId) : null;

  const projectLogs = useMemo(() => {
    return logs.filter((row) => {
      if (row.project_id !== project?.id) return false;
      if (assetFilter !== 'All' && row.asset_id !== assetFilter) return false;
      return true;
    });
  }, [logs, project?.id, assetFilter]);

  const recommendations = useMemo(() => (project ? recommendAssets(project, assets, speedProfiles).slice(0, 5) : []), [project, assets, speedProfiles]);
  const assetAssignments = useMemo(() => assignments.filter((row) => row.asset_id === asset?.id).slice(0, 8), [assignments, asset?.id]);
  const projectAssignments = useMemo(() => assignments.filter((row) => row.project_id === project?.id).slice(0, 8), [assignments, project?.id]);

  async function submitDailyLog(e: FormEvent) {
    e.preventDefault();
    if (!project) return;
    const response = await fetch('/api/daily-logs', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ...logForm,
        project_id: project.id,
        asset_id: logForm.asset_id || assets[0]?.id,
        downtime_tags:
          logForm.downtime_tag === 'Other' ? [logForm.downtime_other || 'Other'] : logForm.downtime_tag ? [logForm.downtime_tag] : [],
        attachments: JSON.parse(logForm.attachments || '[]'),
      }),
    });
    if (!response.ok) {
      toast('Failed to save daily log', 'error');
      return;
    }
    toast('Daily log saved', 'success');
    await onLogSaved?.();
  }

  return (
    <aside className={cn('absolute right-0 top-0 z-30 h-full w-[430px] border-l bg-white transition-transform duration-200', drawer.mode === 'closed' ? 'translate-x-full' : 'translate-x-0')}>
      <div className="flex items-center justify-between border-b p-4">
        <p className="text-sm font-semibold">Context Drawer</p>
        <button className="rounded-md p-1 text-slate-500 hover:bg-slate-100" onClick={closeDrawer}><X className="h-4 w-4" /></button>
      </div>

      {asset && (
        <div className="h-[calc(100%-57px)] overflow-y-auto p-4">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold">{asset.name}</h2>
              <p className="text-sm text-slate-500">{asset.type} • {asset.service_line}</p>
            </div>
            <Badge className={statusTagClasses[asset.status]}>{asset.status}</Badge>
          </div>
          <p className="mb-4 text-xs text-slate-500">Last updated {formatDateTime(asset.last_update_at)}</p>
          <Tabs value={assetTab} onValueChange={setAssetTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-3 space-y-3 text-sm">
              <div className="rounded-xl border bg-slate-50 p-3">Production: {asset.capability_profile.production_range}</div>
              <div className="rounded-xl border p-3">Capabilities: {asset.capability_profile.constraints.join(', ') || 'None'} • {asset.lat.toFixed(3)}, {asset.lng.toFixed(3)}</div>
            </TabsContent>
            <TabsContent value="assignments" className="mt-3 space-y-2 text-sm">
              {assetAssignments.length === 0 && <p className="rounded-xl border p-3 text-slate-600">No assignments yet.</p>}
              {assetAssignments.map((row) => (
                <div key={row.id} className="rounded-lg border bg-slate-50 p-2 text-xs">
                  <p className="font-medium">{projects.find((p) => p.id === row.project_id)?.name ?? row.project_id}</p>
                  <p>{row.eta_estimate} • <span className={cn('rounded px-1 py-0.5', statusTagClasses[row.status])}>{row.status}</span></p>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="notes" className="mt-3 text-sm">
              <p className="rounded-xl border p-3 text-slate-600">{asset.capability_profile.notes || 'No notes yet.'}</p>
            </TabsContent>
          </Tabs>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => onAssign({ assetId: asset.id })}>Assign</Button>
          </div>
        </div>
      )}

      {project && (
        <div className="h-[calc(100%-57px)] overflow-y-auto p-4">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold">{project.name}</h2>
              <p className="text-sm text-slate-500">{project.client_type} • {project.service_line}</p>
            </div>
            <Badge className={statusTagClasses[project.phase]}>{project.phase}</Badge>
          </div>
          <p className="mb-4 text-xs text-slate-500">Last updated {formatDateTime(project.last_update_at)}</p>

          <Tabs value={projectTab} onValueChange={setProjectTab}>
            <TabsList>
              <TabsTrigger value="snapshot">Snapshot</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>
            <TabsContent value="snapshot" className="mt-3 space-y-3">
              <ProjectSnapshot project={project} logs={projectLogs} assignments={projectAssignments} compact />
              <div className="rounded-xl border p-3 text-sm">
                <p className="font-medium">Recommended assets</p>
                <div className="mt-2 space-y-2">
                  {recommendations.map((item) => (
                    <div key={item.asset.id} className="rounded-lg border bg-slate-50 p-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.asset.name}</span>
                        <span>{item.score}/100</span>
                      </div>
                      <p className="mt-1 text-slate-600">Why recommended: {item.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="assignments" className="mt-3 space-y-2">
              {projectAssignments.length === 0 && <div className="rounded-xl border p-3 text-xs text-slate-600">No assignments yet.</div>}
              {projectAssignments.map((row) => (
                <div key={row.id} className="rounded-lg border bg-slate-50 p-2 text-xs">
                  <p className="font-medium">{assets.find((a) => a.id === row.asset_id)?.name ?? row.asset_id}</p>
                  <p>ETA {row.eta_estimate} • {row.status}</p>
                </div>
              ))}
              <Link className="text-xs font-medium text-[color:var(--brand-primary)] underline-offset-2 hover:underline" href={`/projects/${project.id}`}>Open full snapshot page</Link>
            </TabsContent>
            <TabsContent value="logs" className="mt-3 space-y-2">
              <form onSubmit={submitDailyLog} className="space-y-2 rounded-xl border p-3 text-xs">
                <p className="font-medium">Daily Log</p>
                <div className="grid grid-cols-2 gap-2">
                  <input required type="date" className="h-8 rounded-lg border px-2" value={logForm.date} onChange={(e) => setLogForm((curr) => ({ ...curr, date: e.target.value }))} />
                  <select className="h-8 rounded-lg border px-2" value={logForm.asset_id} onChange={(e) => setLogForm((curr) => ({ ...curr, asset_id: e.target.value }))}>
                    <option value="">Select asset</option>
                    {assets.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                  <input required min={0} type="number" className="h-8 rounded-lg border px-2" placeholder="Hours" value={logForm.hours_worked} onChange={(e) => setLogForm((curr) => ({ ...curr, hours_worked: Number(e.target.value) }))} />
                  <input required min={0} type="number" className="h-8 rounded-lg border px-2" placeholder="Progress" value={logForm.progress_value} onChange={(e) => setLogForm((curr) => ({ ...curr, progress_value: Number(e.target.value) }))} />
                </div>
                <select className="h-8 rounded-lg border px-2" value={logForm.downtime_tag} onChange={(e) => setLogForm((curr) => ({ ...curr, downtime_tag: e.target.value }))}>
                  <option value="">Downtime tag</option>
                  {DOWNTIME_TAGS.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
                </select>
                {logForm.downtime_tag === 'Other' && <input className="h-8 w-full rounded-lg border px-2" placeholder="Custom downtime tag" value={logForm.downtime_other} onChange={(e) => setLogForm((curr) => ({ ...curr, downtime_other: e.target.value }))} />}
                <textarea className="w-full rounded-lg border p-2" placeholder="Notes" value={logForm.notes} onChange={(e) => setLogForm((curr) => ({ ...curr, notes: e.target.value }))} />
                <Button size="sm" type="submit">Save log</Button>
              </form>
              <div className="rounded-lg border p-2 text-xs">
                <label className="mr-2">Filter by asset</label>
                <select className="h-7 rounded border px-2" value={assetFilter} onChange={(e) => setAssetFilter(e.target.value)}>
                  <option value="All">All</option>
                  {assets.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </div>
              {projectLogs.slice(0, 8).map((log) => (
                <div key={log.id} className="rounded-lg border bg-slate-50 p-2 text-xs">
                  <p className="font-medium">{log.date}</p>
                  <p>{log.progress_value} {log.progress_unit} • {log.hours_worked}h</p>
                  <p className="text-slate-500">Downtime: {log.downtime_tags.join(', ') || '-'}</p>
                </div>
              ))}
            </TabsContent>
          </Tabs>

          <div className="mt-4 rounded-xl border bg-slate-50 p-3 text-xs">
            <div className="flex items-center gap-2"><CalendarClock className="h-3.5 w-3.5" /> phase {project.phase}</div>
            <div className="flex items-center gap-2"><Clock3 className="h-3.5 w-3.5" /> planned {project.planned_start} to {project.planned_end}</div>
            <div className="flex items-center gap-2"><ClipboardCheck className="h-3.5 w-3.5" /> key actions available</div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={() => onAssign({ projectId: project.id })}>Assign</Button>
          </div>
        </div>
      )}
    </aside>
  );
}
