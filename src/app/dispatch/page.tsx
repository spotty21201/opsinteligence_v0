'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { statusTagClasses } from '@/styles/tokens';
import { Assignment, Asset, Project } from '@/lib/types';

export default function DispatchPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [form, setForm] = useState({ project_id: '', asset_id: '', eta_estimate: '', mobilization_checklist: '[{"item":"Safety briefing","done":false}]', risk_notes: '' });

  useEffect(() => {
    Promise.all([
      fetch('/api/assets').then((r) => r.json()),
      fetch('/api/projects').then((r) => r.json()),
      fetch('/api/assignments').then((r) => r.json()),
    ]).then(([a, p, as]) => {
      setAssets(a.items || []);
      setProjects(p.items || []);
      setAssignments(as.items || []);
      setForm((prev) => ({ ...prev, project_id: p.items?.[0]?.id ?? '', asset_id: a.items?.[0]?.id ?? '' }));
    });
  }, []);

  async function createAssignment() {
    await fetch('/api/assignments', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ...form,
        mobilization_checklist: JSON.parse(form.mobilization_checklist || '[]'),
        status: 'Planned',
      }),
    });
    const refreshed = await fetch('/api/assignments').then((r) => r.json());
    setAssignments(refreshed.items || []);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-2xl border bg-white p-4 lg:col-span-1">
        <h1 className="text-lg font-semibold">Dispatch Planner</h1>
        <div className="mt-3 space-y-2 text-sm">
          <label className="grid gap-1">Project
            <select className="h-10 rounded-xl border px-2" value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })}>
              {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
          </label>
          <label className="grid gap-1">Asset
            <select className="h-10 rounded-xl border px-2" value={form.asset_id} onChange={(e) => setForm({ ...form, asset_id: e.target.value })}>
              {assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
            </select>
          </label>
          <label className="grid gap-1">ETA estimate<input className="h-10 rounded-xl border px-2" type="date" value={form.eta_estimate} onChange={(e) => setForm({ ...form, eta_estimate: e.target.value })} /></label>
          <label className="grid gap-1">Checklist JSON<textarea className="rounded-xl border p-2" value={form.mobilization_checklist} onChange={(e) => setForm({ ...form, mobilization_checklist: e.target.value })} /></label>
          <label className="grid gap-1">Risk notes<textarea className="rounded-xl border p-2" value={form.risk_notes} onChange={(e) => setForm({ ...form, risk_notes: e.target.value })} /></label>
          <Button onClick={createAssignment}>Create Assignment</Button>
        </div>
      </div>
      <div className="rounded-2xl border bg-white p-4 lg:col-span-2">
        <h2 className="mb-3 text-base font-semibold">Assignments</h2>
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500"><tr><th>Project</th><th>Asset</th><th>ETA</th><th>Status</th></tr></thead>
          <tbody>
            {assignments.map((row) => (
              <tr className="border-t" key={row.id}>
                <td className="py-2">{projects.find((p) => p.id === row.project_id)?.name ?? row.project_id}</td>
                <td>{assets.find((a) => a.id === row.asset_id)?.name ?? row.asset_id}</td>
                <td>{row.eta_estimate}</td>
                <td><Badge className={statusTagClasses[row.status]}>{row.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
