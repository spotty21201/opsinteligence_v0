'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, CircleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminRouteShell } from '@/components/routes/admin/admin-route';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/toast-provider';
import { DEFAULT_SPEED_PROFILES } from '@/lib/constants';
import { Asset, Project, RoiAssumptions } from '@/lib/types';

const defaultRoi: RoiAssumptions = {
  asset_sets: 8,
  idr_per_day: 115000000,
  idle_days_baseline: 35,
  mobilization_cost_per_job: 420000000,
  jobs_per_year: 14,
  gross_margin_per_project: 0.22,
};

export default function AdminPage() {
  const toast = useToast();
  const [speeds, setSpeeds] = useState(DEFAULT_SPEED_PROFILES);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [roi, setRoi] = useState<RoiAssumptions>(defaultRoi);
  const [assetName, setAssetName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [busy, setBusy] = useState(false);

  const canResetSeed = process.env.NODE_ENV === 'development';

  const roiImpact = useMemo(() => {
    const utilizationRecovery = roi.asset_sets * roi.idr_per_day * roi.idle_days_baseline;
    const mobilizationRecovery = roi.jobs_per_year * roi.mobilization_cost_per_job;
    return utilizationRecovery + mobilizationRecovery;
  }, [roi]);

  async function load() {
    const [speedRes, assetRes, projectRes, roiRes] = await Promise.all([
      fetch('/api/admin/reset?peek=speeds').then((r) => r.json()),
      fetch('/api/assets').then((r) => r.json()),
      fetch('/api/projects').then((r) => r.json()),
      fetch('/api/admin/reset?peek=roi').then((r) => r.json()),
    ]);
    if (speedRes.items) setSpeeds(speedRes.items);
    setAssets(assetRes.items ?? []);
    setProjects(projectRes.items ?? []);
    setRoi(roiRes.item ?? defaultRoi);
  }

  useEffect(() => {
    void load();
  }, []);

  function notifyDataRefresh() {
    window.dispatchEvent(new Event('ops-data-refresh'));
  }

  async function saveSpeed(type: string, speed: number) {
    if (!Number.isFinite(speed) || speed <= 0) {
      toast('Speed must be greater than 0', 'error');
      return;
    }
    await fetch('/api/admin/reset', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode: 'speed', payload: { type, speed_km_per_day: speed } }),
    });
    toast('Speed profile saved', 'success');
  }

  async function saveRoi() {
    if (roi.asset_sets <= 0 || roi.idr_per_day <= 0 || roi.jobs_per_year <= 0) {
      toast('ROI assumptions must be positive values', 'error');
      return;
    }
    const response = await fetch('/api/admin/reset', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode: 'roi', payload: roi }),
    });
    if (!response.ok) {
      toast('Failed to save ROI assumptions', 'error');
      return;
    }
    toast('ROI assumptions saved', 'success');
  }

  async function createAsset(e: FormEvent) {
    e.preventDefault();
    if (assetName.trim().length < 3) {
      toast('Asset name must be at least 3 characters', 'error');
      return;
    }
    setBusy(true);
    const response = await fetch('/api/assets', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: `asset-${Date.now()}`, name: assetName.trim() }),
    });
    setBusy(false);
    if (!response.ok) return toast('Failed to create asset', 'error');
    setAssetName('');
    await load();
    notifyDataRefresh();
    toast('Asset created', 'success');
  }

  async function createProject(e: FormEvent) {
    e.preventDefault();
    if (projectName.trim().length < 3) {
      toast('Project name must be at least 3 characters', 'error');
      return;
    }
    setBusy(true);
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: `project-${Date.now()}`, name: projectName.trim() }),
    });
    setBusy(false);
    if (!response.ok) return toast('Failed to create project', 'error');
    setProjectName('');
    await load();
    notifyDataRefresh();
    toast('Project created', 'success');
  }

  async function resetSeed() {
    if (!canResetSeed) {
      toast('Seed reset is development-only', 'error');
      return;
    }
    const confirmed = window.confirm('Reset seed data? This will replace current demo records.');
    if (!confirmed) return;
    const response = await fetch('/api/admin/reset', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode: 'reset' }),
    });
    if (!response.ok) {
      toast('Seed reset failed', 'error');
      return;
    }
    await load();
    notifyDataRefresh();
    toast('Seed reset complete', 'success');
  }

  return (
    <AdminRouteShell>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border bg-white p-4">
          <h1 className="text-lg font-semibold">Admin Controls</h1>
          <p className="text-xs text-slate-500">Persisted speed assumptions and lightweight CRUD for demo controls.</p>
          <div className="mt-4 space-y-2">
            {speeds.map((row) => (
              <div className="flex items-center gap-2" key={row.type}>
                <span className="w-40 text-sm">{row.type}</span>
                <input
                  type="number"
                  className="h-9 w-28 rounded-xl border bg-white px-2"
                  value={row.speed_km_per_day}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setSpeeds((curr) => curr.map((item) => (item.type === row.type ? { ...item, speed_km_per_day: next } : item)));
                  }}
                  onBlur={(e) => void saveSpeed(row.type, Number(e.target.value))}
                />
                <span className="text-xs text-slate-500">km/day</span>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border bg-slate-50 p-3 text-xs text-slate-700">
            <p className="font-medium">ROI assumptions</p>
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              <label className="grid gap-1">Asset sets<input className="h-9 rounded-lg border bg-white px-2" type="number" value={roi.asset_sets} onChange={(e) => setRoi((curr) => ({ ...curr, asset_sets: Number(e.target.value) }))} /></label>
              <label className="grid gap-1">IDR/day<input className="h-9 rounded-lg border bg-white px-2" type="number" value={roi.idr_per_day} onChange={(e) => setRoi((curr) => ({ ...curr, idr_per_day: Number(e.target.value) }))} /></label>
              <label className="grid gap-1">Idle days/year<input className="h-9 rounded-lg border bg-white px-2" type="number" value={roi.idle_days_baseline} onChange={(e) => setRoi((curr) => ({ ...curr, idle_days_baseline: Number(e.target.value) }))} /></label>
              <label className="grid gap-1">Mobilization cost/job<input className="h-9 rounded-lg border bg-white px-2" type="number" value={roi.mobilization_cost_per_job} onChange={(e) => setRoi((curr) => ({ ...curr, mobilization_cost_per_job: Number(e.target.value) }))} /></label>
              <label className="grid gap-1">Jobs/year<input className="h-9 rounded-lg border bg-white px-2" type="number" value={roi.jobs_per_year} onChange={(e) => setRoi((curr) => ({ ...curr, jobs_per_year: Number(e.target.value) }))} /></label>
              <label className="grid gap-1">Gross margin/project<input className="h-9 rounded-lg border bg-white px-2" type="number" step="0.01" value={roi.gross_margin_per_project} onChange={(e) => setRoi((curr) => ({ ...curr, gross_margin_per_project: Number(e.target.value) }))} /></label>
            </div>
            <p className="mt-2 text-xs">Estimated impact: IDR {Math.round(roiImpact).toLocaleString('id-ID')}</p>
            <Button className="mt-2" size="sm" variant="outline" onClick={saveRoi}>Save ROI Assumptions</Button>
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-4">
          <h2 className="text-base font-semibold">Minimal CRUD</h2>
          <form className="mt-3 space-y-2" onSubmit={createAsset}>
            <label className="text-sm">New asset name</label>
            <input className="h-10 w-full rounded-xl border bg-white px-2" value={assetName} onChange={(e) => setAssetName(e.target.value)} />
            <Button type="submit" disabled={busy}>{busy ? <Spinner /> : null}Create Asset</Button>
          </form>
          <form className="mt-4 space-y-2" onSubmit={createProject}>
            <label className="text-sm">New project name</label>
            <input className="h-10 w-full rounded-xl border bg-white px-2" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
            <Button type="submit" disabled={busy}>{busy ? <Spinner /> : null}Create Project</Button>
          </form>
          <Button className="mt-4" variant="outline" onClick={resetSeed} disabled={!canResetSeed}>Seed Reset (dev-only)</Button>

          <div className="mt-4 grid gap-3 text-xs lg:grid-cols-2">
            <div className="rounded-xl border p-3">
              <p className="mb-1 font-medium">Assets ({assets.length})</p>
              {assets.slice(0, 6).map((asset) => <p key={asset.id} className="truncate text-slate-600">{asset.name}</p>)}
            </div>
            <div className="rounded-xl border p-3">
              <p className="mb-1 font-medium">Projects ({projects.length})</p>
              {projects.slice(0, 6).map((project) => <p key={project.id} className="truncate text-slate-600">{project.name}</p>)}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500"><CheckCircle2 className="h-4 w-4 text-emerald-600" />Data updates are persisted through API layer.</div>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500"><CircleAlert className="h-4 w-4 text-amber-600" />Supabase Auth roles remain simplified for Release 0.0.</div>
        </section>
      </div>
    </AdminRouteShell>
  );
}
