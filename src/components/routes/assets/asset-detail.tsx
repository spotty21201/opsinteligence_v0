import { Asset, Assignment, Project } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { statusTagClasses } from '@/styles/tokens';

export function AssetDetail({ asset, assignments, projects }: { asset: Asset; assignments: Assignment[]; projects: Project[] }) {
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border bg-white p-4">
        <h1 className="text-xl font-semibold">{asset.name}</h1>
        <p className="text-sm text-slate-500">{asset.type} • {asset.service_line}</p>
        <div className="mt-3 flex items-center gap-2">
          <Badge className={statusTagClasses[asset.status]}>{asset.status}</Badge>
          <span className="text-xs text-slate-500">Available {asset.availability_date}</span>
        </div>
        <div className="mt-3 grid gap-2 text-sm">
          <p>Capability: {asset.capability_profile.production_range}</p>
          <p>Location: {asset.lat.toFixed(3)}, {asset.lng.toFixed(3)}</p>
          <p>Constraints: {asset.capability_profile.constraints.join(', ') || 'None'}</p>
          <p>Notes: {asset.capability_profile.notes || '-'}</p>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-4">
        <h2 className="text-base font-semibold">Assignments</h2>
        <div className="mt-2 space-y-2">
          {assignments.length === 0 && <p className="text-sm text-slate-500">No assignments yet.</p>}
          {assignments.map((row) => (
            <div key={row.id} className="rounded-xl border bg-slate-50 p-3 text-sm">
              <p className="font-medium">{projects.find((project) => project.id === row.project_id)?.name ?? row.project_id}</p>
              <p className="text-xs text-slate-500">ETA {row.eta_estimate} • {row.status}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
