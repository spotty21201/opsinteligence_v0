'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DEFAULT_SPEED_PROFILES } from '@/lib/constants';

export default function AdminPage() {
  const [speeds, setSpeeds] = useState(DEFAULT_SPEED_PROFILES);
  const [assetName, setAssetName] = useState('');
  const [projectName, setProjectName] = useState('');

  useEffect(() => {
    fetch('/api/admin/reset?peek=speeds').then((r) => r.json()).then((data) => {
      if (data.items) setSpeeds(data.items);
    });
  }, []);

  async function saveSpeed(type: string, speed: number) {
    await fetch('/api/admin/reset', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode: 'speed', payload: { type, speed_km_per_day: speed } }),
    });
  }

  async function createAsset(e: FormEvent) {
    e.preventDefault();
    await fetch('/api/assets', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: `asset-${Date.now()}`, name: assetName }),
    });
    setAssetName('');
  }

  async function createProject(e: FormEvent) {
    e.preventDefault();
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: `project-${Date.now()}`, name: projectName }),
    });
    setProjectName('');
  }

  async function resetSeed() {
    await fetch('/api/admin/reset', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode: 'reset' }),
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-2xl border bg-white p-4">
        <h1 className="text-lg font-semibold">Admin Controls</h1>
        <p className="text-xs text-slate-500">Demo control for assets/projects and speed assumptions.</p>
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
                  void saveSpeed(row.type, next);
                }}
              />
              <span className="text-xs text-slate-500">km/day</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-4">
        <h2 className="text-base font-semibold">Minimal CRUD</h2>
        <form className="mt-3 space-y-2" onSubmit={createAsset}>
          <label className="text-sm">New asset name</label>
          <input className="h-10 w-full rounded-xl border px-2" value={assetName} onChange={(e) => setAssetName(e.target.value)} />
          <Button type="submit">Create Asset</Button>
        </form>
        <form className="mt-4 space-y-2" onSubmit={createProject}>
          <label className="text-sm">New project name</label>
          <input className="h-10 w-full rounded-xl border px-2" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
          <Button type="submit">Create Project</Button>
        </form>
        <div className="mt-4 rounded-xl border bg-slate-50 p-3 text-xs text-slate-600">
          Optional ROI assumptions card hook can be added here.
        </div>
        <Button className="mt-3" variant="outline" onClick={resetSeed}>Seed Reset (dev-only)</Button>
      </section>
    </div>
  );
}
