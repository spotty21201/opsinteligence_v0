'use client';

import { FormEvent, useEffect, useState } from 'react';
import { CheckCircle2, CircleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminRouteShell } from '@/components/routes/admin/admin-route';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/toast-provider';
import { DEFAULT_SPEED_PROFILES } from '@/lib/constants';
import { Asset, Project } from '@/lib/types';

export default function AdminPage() {
  const toast = useToast();
  const [speeds, setSpeeds] = useState(DEFAULT_SPEED_PROFILES);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [assetName, setAssetName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const [speedRes, assetRes, projectRes] = await Promise.all([
      fetch('/api/admin/reset?peek=speeds').then((r) => r.json()),
      fetch('/api/assets').then((r) => r.json()),
      fetch('/api/projects').then((r) => r.json()),
    ]);
    if (speedRes.items) setSpeeds(speedRes.items);
    setAssets(assetRes.items ?? []);
    setProjects(projectRes.items ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

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
    toast('Project created', 'success');
  }

  async function resetSeed() {
    await fetch('/api/admin/reset', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode: 'reset' }),
    });
    await load();
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
                className="h-9 w-28 rounded-xl border px-2"
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
        <div className="mt-4 rounded-xl border bg-slate-50 p-3 text-xs text-slate-600">
          <p className="font-medium">ROI assumptions</p>
          <p className="mt-1">Hook available for editable utilization and mobilization assumptions.</p>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-4">
        <h2 className="text-base font-semibold">Minimal CRUD</h2>
        <form className="mt-3 space-y-2" onSubmit={createAsset}>
          <label className="text-sm">New asset name</label>
          <input className="h-10 w-full rounded-xl border px-2" value={assetName} onChange={(e) => setAssetName(e.target.value)} />
          <Button type="submit" disabled={busy}>{busy ? <Spinner /> : null}Create Asset</Button>
        </form>
        <form className="mt-4 space-y-2" onSubmit={createProject}>
          <label className="text-sm">New project name</label>
          <input className="h-10 w-full rounded-xl border px-2" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
          <Button type="submit" disabled={busy}>{busy ? <Spinner /> : null}Create Project</Button>
        </form>
        <Button className="mt-4" variant="outline" onClick={resetSeed}>Seed Reset (dev-only)</Button>

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
