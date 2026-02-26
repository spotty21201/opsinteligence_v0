import Link from 'next/link';
import { listReportMeta } from '@/lib/repository';

export default async function ReportsPage() {
  const reports = await listReportMeta();

  return (
    <div className="rounded-2xl border bg-white p-4">
      <h1 className="mb-4 text-xl font-semibold">Reports</h1>
      <div className="space-y-2">
        {reports.length === 0 && <p className="text-sm text-slate-500">No generated reports yet.</p>}
        {reports.map((report) => (
          <div key={report.id} className="flex items-center justify-between rounded-xl border p-3 text-sm">
            <div>
              <p className="font-medium">{report.project_name}</p>
              <p className="text-xs text-slate-500">Generated {new Date(report.created_at).toLocaleString()}</p>
            </div>
            <Link className="text-orange-600" href={`/api/reports/file?name=${encodeURIComponent(report.filename)}`}>Open PDF</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
