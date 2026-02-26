import { ReportsRouteShell } from '@/components/routes/reports/reports-route';
import { ReportsListClient } from '@/components/routes/reports/reports-list-client';
import { listReportMeta } from '@/lib/repository';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const reports = await listReportMeta();

  return (
    <ReportsRouteShell>
      <ReportsListClient initialReports={reports} />
    </ReportsRouteShell>
  );
}
