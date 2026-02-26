import { listDailyLogs, listProjects } from '@/lib/repository';
import { PrintRouteShell } from '@/components/routes/report/print-route';

export default async function PrintReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ print?: string }>;
}) {
  const { projectId } = await params;
  const { print } = await searchParams;
  const projects = await listProjects();
  const project = projects.find((p) => p.id === projectId);
  if (!project) return <div className="p-8">Project not found</div>;
  const logs = await listDailyLogs(projectId);

  const avg = logs.length ? logs.reduce((sum, log) => sum + log.progress_value, 0) / logs.length : 0;

  return (
    <PrintRouteShell>
    <div className="mx-auto max-w-[900px] bg-white p-8 text-slate-900 print:max-w-none print:p-6">
      <header className="border-b pb-4">
        <h1 className="text-2xl font-semibold">3Sigma Ops Intelligence — {project.name}</h1>
        <p className="text-xs text-slate-500">Generated {new Date().toLocaleString()}</p>
      </header>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <article className="rounded-xl border bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Map thumbnail</p>
          <div className="mt-2 rounded-xl border bg-white p-4 text-sm">
            Indonesia mini-map placeholder
            <p className="text-xs text-slate-500">Lat/Lng {project.lat}, {project.lng}</p>
          </div>
        </article>
        <article className="rounded-xl border p-4 text-sm">
          <p>Phase: {project.phase}</p>
          <p>Service line: {project.service_line}</p>
          <p>Planned: {project.planned_start} to {project.planned_end}</p>
          <p>Average progress from logs: {avg.toFixed(2)} m3/day</p>
          <p className="mt-2 text-xs text-slate-500">Forecast is an estimate.</p>
        </article>
      </section>

      <section className="mt-6 rounded-xl border p-4">
        <p className="mb-2 text-sm font-medium">Planned vs actual + forecast</p>
        <table className="w-full text-xs">
          <thead><tr className="text-left text-slate-500"><th>Date</th><th>Hours</th><th>Progress</th><th>Downtime Tags</th></tr></thead>
          <tbody>
            {logs.slice(0, 12).map((log) => (
              <tr key={log.id} className="border-t"><td className="py-1">{log.date}</td><td>{log.hours_worked}</td><td>{log.progress_value} {log.progress_unit}</td><td>{log.downtime_tags.join(', ') || '-'}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="mt-8 border-t pt-4 text-center text-xs text-slate-500">
        Built by Kolabs.Design x AIM+HDA Collective • {new Date().toLocaleString()}
      </footer>

      {print === '1' && <style>{`@page { size: A4; margin: 12mm; }`}</style>}
    </div>
    </PrintRouteShell>
  );
}
