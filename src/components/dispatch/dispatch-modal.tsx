'use client';

import { useEffect, useState } from 'react';
import { Asset, Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast-provider';

export function DispatchModal({
  open,
  onOpenChange,
  assets,
  projects,
  prefill,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  assets: Asset[];
  projects: Project[];
  prefill?: { projectId?: string; assetId?: string } | null;
  onCreated?: () => Promise<void> | void;
}) {
  const toast = useToast();
  const [projectId, setProjectId] = useState(prefill?.projectId ?? projects[0]?.id ?? '');
  const [assetId, setAssetId] = useState(prefill?.assetId ?? assets[0]?.id ?? '');
  const [eta, setEta] = useState('');
  const [checklist, setChecklist] = useState('[{"item":"Crew manifest","done":false}]');
  const [riskNotes, setRiskNotes] = useState('');

  useEffect(() => {
    if (prefill?.projectId) setProjectId(prefill.projectId);
    if (prefill?.assetId) setAssetId(prefill.assetId);
  }, [prefill]);

  async function submit() {
    if (!projectId || !assetId || !eta) {
      toast('Project, asset, and ETA are required', 'error');
      return;
    }
    let parsedChecklist: Array<{ item: string; done: boolean }> = [];
    try {
      parsedChecklist = JSON.parse(checklist || '[]');
    } catch {
      toast('Checklist JSON is invalid', 'error');
      return;
    }
    const response = await fetch('/api/assignments', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        project_id: projectId,
        asset_id: assetId,
        eta_estimate: eta,
        mobilization_checklist: parsedChecklist,
        risk_notes: riskNotes,
        status: 'Planned',
      }),
    });
    if (!response.ok) {
      toast('Failed to create assignment', 'error');
      return;
    }
    toast('Assignment created', 'success');
    await onCreated?.();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="text-base font-semibold">Create Assignment</DialogTitle>
        <div className="mt-4 grid gap-3">
          <label className="grid gap-1 text-sm">Project
            <select className="h-10 rounded-xl border px-2" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm">Asset
            <select className="h-10 rounded-xl border px-2" value={assetId} onChange={(e) => setAssetId(e.target.value)}>
              {assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm">ETA estimate
            <Input type="date" value={eta} onChange={(e) => setEta(e.target.value)} />
          </label>
          <label className="grid gap-1 text-sm">Checklist JSON
            <textarea className="min-h-20 rounded-xl border p-2 text-sm" value={checklist} onChange={(e) => setChecklist(e.target.value)} />
          </label>
          <label className="grid gap-1 text-sm">Risk notes
            <textarea className="min-h-20 rounded-xl border p-2 text-sm" value={riskNotes} onChange={(e) => setRiskNotes(e.target.value)} />
          </label>
          <Button onClick={submit}>Save Assignment</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
