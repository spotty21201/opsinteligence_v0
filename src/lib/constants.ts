import { ProjectPhase, ServiceLine, SpeedProfile } from '@/lib/types';

export const SERVICE_LINES: ServiceLine[] = ['Dredging', 'Dewatering', 'SoilImprovement'];
export const PROJECT_PHASES: ProjectPhase[] = ['Mobilisasi', 'Survey', 'Lokasi', 'Perakitan', 'Operasi', 'Disposal'];
export const DOWNTIME_TAGS = ['Weather', 'Mechanical', 'Permit', 'Crew', 'Fuel Delay', 'Other'];

export const DEFAULT_SPEED_PROFILES: SpeedProfile[] = [
  { type: 'CSD', speed_km_per_day: 95 },
  { type: 'Pontoon Excavator', speed_km_per_day: 80 },
  { type: 'Pump Set', speed_km_per_day: 260 },
  { type: 'PVD Rig', speed_km_per_day: 120 },
  { type: 'Acetube System', speed_km_per_day: 220 },
  { type: 'Support Tug', speed_km_per_day: 180 },
];
