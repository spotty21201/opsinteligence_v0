import { DashboardRoute } from '@/components/routes/dashboard/dashboard-route';
import { listAssets, listAssignments, listDailyLogs, listProjects, listSpeedProfiles } from '@/lib/repository';

export default async function DashboardPage() {
  const [assets, projects, logs, assignments, speedProfiles] = await Promise.all([
    listAssets(),
    listProjects(),
    listDailyLogs(),
    listAssignments(),
    listSpeedProfiles(),
  ]);

  return <DashboardRoute assets={assets} projects={projects} logs={logs} assignments={assignments} speedProfiles={speedProfiles} />;
}
