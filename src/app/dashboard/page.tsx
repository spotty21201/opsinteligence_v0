import { DashboardCockpit } from '@/components/dashboard-cockpit';
import { listAssets, listDailyLogs, listProjects, listSpeedProfiles } from '@/lib/repository';

export default async function DashboardPage() {
  const [assets, projects, logs, speedProfiles] = await Promise.all([
    listAssets(),
    listProjects(),
    listDailyLogs(),
    listSpeedProfiles(),
  ]);

  return <DashboardCockpit assets={assets} projects={projects} logs={logs} speedProfiles={speedProfiles} />;
}
