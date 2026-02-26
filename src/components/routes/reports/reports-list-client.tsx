'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Download, FileText, Plus } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { ReportMeta } from '@/lib/types';

export function ReportsListClient({ initialReports }: { initialReports: ReportMeta[] }) {
  const [reports, setReports] = useState<ReportMeta[]>(initialReports);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reports', { cache: 'no-store' });
      const payload = await response.json();
      setReports(payload.items ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const onGenerated = () => {
      void refresh();
    };
    window.addEventListener('ops-report-generated', onGenerated);
    return () => window.removeEventListener('ops-report-generated', onGenerated);
  }, [refresh]);

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Reports</h1>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">
            <Plus className="h-3.5 w-3.5" />
            Generate from Dashboard
          </Link>
          <button type="button" onClick={() => void refresh()} className="rounded-lg border px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">
            Refresh
          </button>
        </div>
      </div>
      {loading ? <div className="mb-3 flex items-center gap-2 text-sm text-slate-500"><Spinner />Refreshing reports...</div> : null}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr><th className="pb-2">File</th><th>Project</th><th>Generated On</th><th>Download</th></tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr className="border-t">
                <td className="py-3 text-slate-500" colSpan={4}>No generated reports yet.</td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.id} className="border-t">
                  <td className="py-2.5">
                    <span className="inline-flex items-center gap-2 rounded-lg border bg-[color:var(--brand-soft)] px-2 py-1 text-xs text-[color:var(--brand-primary)]">
                      <FileText className="h-3.5 w-3.5" />
                      PDF
                    </span>
                  </td>
                  <td className="font-medium">{report.project_name}</td>
                  <td>{new Date(report.created_at).toLocaleString()}</td>
                  <td>
                    <Link className="inline-flex items-center gap-1 text-[color:var(--brand-primary)] underline-offset-2 hover:underline" href={`/api/reports/file?name=${encodeURIComponent(report.filename)}`}>
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
