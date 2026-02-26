'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/toast-provider';
import { DispatchRouteShell } from '@/components/routes/dispatch/dispatch-route';
import { statusTagClasses } from '@/styles/tokens';
import { recommendAssets } from '@/lib/recommendation';
import { Assignment, Asset, Project, SpeedProfile } from '@/lib/types';

export default function DispatchPage() {
  const toast = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [speedProfiles, setSpeedProfiles] = useState<SpeedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [form, setForm] = useState({
    project_id: '',
    asset_id: '',
    eta_estimate: '',
    mobilization_checklist: '[{"item":"Safety briefing","done":false}]',
    risk_notes: '',
  });
  const [editForm, setEditForm] = useState({
    eta_estimate: '',
    status: 'Planned',
    mobilization_checklist: '[]',
    risk_notes: '',
  });

  async function loadAll() {
    setLoading(true);
    const [a, p, as, speedRes] = await Promise.all([
      fetch('/api/assets').then((r) => r.json()),
      fetch('/api/projects').then((r) => r.json()),
      fetch('/api/assignments').then((r) => r.json()),
      fetch('/api/admin/reset?peek=speeds').then((r) => r.json()),
    ]);
    setAssets(a.items || []);
    setProjects(p.items || []);
    setAssignments(as.items || []);
    setSpeedProfiles(speedRes.items || []);
    setForm((prev) => ({ ...prev, project_id: p.items?.[0]?.id ?? '', asset_id: a.items?.[0]?.id ?? '' }));
    setLoading(false);
  }

  useEffect(() => {
    void loadAll();
  }, []);

  const assignmentRows = useMemo(() => assignments, [assignments]);
  const selectedProject = useMemo(() => projects.find((project) => project.id === form.project_id), [projects, form.project_id]);
  const recommendations = useMemo(() => {
    if (!selectedProject) return [];
    return recommendAssets(selectedProject, assets, speedProfiles);
  }, [selectedProject, assets, speedProfiles]);
  const selectedRecommendation = useMemo(
    () => recommendations.find((row) => row.asset.id === form.asset_id) ?? recommendations[0] ?? null,
    [recommendations, form.asset_id],
  );

  useEffect(() => {
    if (recommendations.length > 0) {
      setForm((curr) => ({ ...curr, asset_id: recommendations[0].asset.id }));
    }
  }, [recommendations]);

  async function createAssignment() {
    if (!form.project_id || !form.asset_id || !form.eta_estimate) {
      toast('Project, asset, and ETA are required', 'error');
      return;
    }
    setSaving(true);
    try {
      let checklist: Array<{ item: string; done: boolean }> = [];
      try {
        checklist = JSON.parse(form.mobilization_checklist || '[]');
      } catch {
        toast('Checklist JSON is invalid', 'error');
        setSaving(false);
        return;
      }
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...form,
          mobilization_checklist: checklist,
          status: 'Planned',
        }),
      });
      if (!response.ok) throw new Error('failed create');
      const payload = await response.json();
      if (payload.item) {
        setAssignments((curr) => [payload.item, ...curr]);
      }
      setForm((curr) => ({
        project_id: curr.project_id,
        asset_id: recommendations[0]?.asset.id ?? curr.asset_id,
        eta_estimate: '',
        mobilization_checklist: '[{\"item\":\"Safety briefing\",\"done\":false}]',
        risk_notes: '',
      }));
      toast('Assignment created', 'success');
    } catch {
      toast('Failed to create assignment', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit() {
    if (!editing) return;
    try {
      let checklist: Array<{ item: string; done: boolean }> = [];
      try {
        checklist = JSON.parse(editForm.mobilization_checklist || '[]');
      } catch {
        toast('Checklist JSON is invalid', 'error');
        return;
      }
      const response = await fetch('/api/assignments', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id: editing.id,
          eta_estimate: editForm.eta_estimate,
          status: editForm.status,
          mobilization_checklist: checklist,
          risk_notes: editForm.risk_notes,
        }),
      });
      if (!response.ok) throw new Error('failed save');
      setEditing(null);
      await loadAll();
      toast('Assignment updated', 'success');
    } catch {
      toast('Failed to update assignment', 'error');
    }
  }

  return (
    <DispatchRouteShell>
    <div className="grid gap-3 lg:grid-cols-3">
      <div className="rounded-2xl border bg-white p-4 lg:col-span-1">
        <h1 className="text-lg font-semibold">Dispatch Planner</h1>
        <div className="mt-3 space-y-2 text-sm">
          <label className="grid gap-1">Project
            <select className="h-10 rounded-xl border bg-white px-2 text-slate-900" value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })}>
              {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
          </label>
          <label className="grid gap-1">Asset
            <select className="h-10 rounded-xl border bg-white px-2 text-slate-900" value={form.asset_id} onChange={(e) => setForm({ ...form, asset_id: e.target.value })}>
              {(recommendations.length > 0 ? recommendations.map((rec) => rec.asset) : assets).map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name}
                </option>
              ))}
            </select>
          </label>
          {selectedRecommendation && (
            <div className="rounded-xl border bg-slate-50 p-2 text-xs text-slate-600">
              Recommended: {selectedRecommendation.asset.name} — {selectedRecommendation.explanation}
            </div>
          )}
          <label className="grid gap-1">ETA estimate
            <input className="h-10 rounded-xl border bg-white px-2 text-slate-900" type="date" value={form.eta_estimate} onChange={(e) => setForm({ ...form, eta_estimate: e.target.value })} />
          </label>
          <label className="grid gap-1">Checklist JSON
            <textarea className="min-h-20 max-h-36 rounded-xl border bg-white p-2 text-slate-900" value={form.mobilization_checklist} onChange={(e) => setForm({ ...form, mobilization_checklist: e.target.value })} />
          </label>
          <label className="grid gap-1">Risk notes
            <textarea className="min-h-20 rounded-xl border bg-white p-2 text-slate-900" value={form.risk_notes} onChange={(e) => setForm({ ...form, risk_notes: e.target.value })} />
          </label>
          <Button onClick={createAssignment} disabled={saving}>{saving ? <Spinner /> : null}Create Assignment</Button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 lg:col-span-2">
        <h2 className="mb-3 text-base font-semibold">Assignments</h2>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500"><Spinner />Loading assignments...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500"><tr><th>Project</th><th>Asset</th><th>ETA</th><th>Status</th></tr></thead>
            <tbody>
              {assignmentRows.map((row) => (
                <tr
                  className="cursor-pointer border-t transition-colors hover:bg-slate-50"
                  key={row.id}
                  onClick={() => {
                    setEditing(row);
                    setEditForm({
                      eta_estimate: row.eta_estimate,
                      status: row.status,
                      mobilization_checklist: JSON.stringify(row.mobilization_checklist, null, 2),
                      risk_notes: row.risk_notes,
                    });
                  }}
                >
                  <td className="py-1.5">{projects.find((p) => p.id === row.project_id)?.name ?? row.project_id}</td>
                  <td>{assets.find((a) => a.id === row.asset_id)?.name ?? row.asset_id}</td>
                  <td>{row.eta_estimate}</td>
                  <td><Badge className={statusTagClasses[row.status]}>{row.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogTitle>Edit Assignment</DialogTitle>
          <div className="mt-3 space-y-2 text-sm">
            <label className="grid gap-1">Status
              <select className="h-10 rounded-xl border bg-white px-2 text-slate-900" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                <option>Planned</option><option>Active</option><option>Completed</option>
              </select>
            </label>
            <label className="grid gap-1">ETA estimate
              <input className="h-10 rounded-xl border bg-white px-2 text-slate-900" type="date" value={editForm.eta_estimate} onChange={(e) => setEditForm({ ...editForm, eta_estimate: e.target.value })} />
            </label>
            <label className="grid gap-1">Checklist JSON
              <textarea className="min-h-20 max-h-36 rounded-xl border bg-white p-2 text-slate-900" value={editForm.mobilization_checklist} onChange={(e) => setEditForm({ ...editForm, mobilization_checklist: e.target.value })} />
            </label>
            <label className="grid gap-1">Risk notes
              <textarea className="min-h-20 rounded-xl border bg-white p-2 text-slate-900" value={editForm.risk_notes} onChange={(e) => setEditForm({ ...editForm, risk_notes: e.target.value })} />
            </label>
            <Button onClick={saveEdit}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </DispatchRouteShell>
  );
}
