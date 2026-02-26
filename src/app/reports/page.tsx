import Link from 'next/link';
import { FileText, Download } from 'lucide-react';
import { ReportsRouteShell } from '@/components/routes/reports/reports-route';
import { listReportMeta } from '@/lib/repository';

export default async function ReportsPage() {
  const reports = await listReportMeta();

  return (
    <ReportsRouteShell>
    <div className="rounded-2xl border bg-white p-4">
      <h1 className="mb-4 text-xl font-semibold">Reports</h1>
      <div className="space-y-2">
        {reports.length === 0 && <p className="text-sm text-slate-500">No generated reports yet.</p>}
        {reports.map((report) => (
          <div key={report.id} className="flex items-center justify-between rounded-xl border p-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg border bg-slate-50 p-2"><FileText className="h-4 w-4 text-orange-600" /></div>
              <div>
                <p className="font-medium">{report.project_name}</p>
                <p className="text-xs text-slate-500">Generated {new Date(report.created_at).toLocaleString()}</p>
                <p className="text-xs text-slate-400">{report.filename}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link className="text-orange-600" href={`/api/reports/file?name=${encodeURIComponent(report.filename)}`}>Open</Link>
              <Link className="inline-flex items-center gap-1 text-orange-600" href={`/api/reports/file?name=${encodeURIComponent(report.filename)}`}><Download className="h-3.5 w-3.5" />Download</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
    </ReportsRouteShell>
  );
}
