import { DashboardCockpit } from '@/components/dashboard-cockpit';
import { Asset, Assignment, DailyLog, Project, SpeedProfile } from '@/lib/types';

export function DashboardRoute(props: {
  assets: Asset[];
  projects: Project[];
  logs: DailyLog[];
  assignments: Assignment[];
  speedProfiles: SpeedProfile[];
}) {
  return <DashboardCockpit {...props} />;
}
