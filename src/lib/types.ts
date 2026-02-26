export type AssetStatus = 'Working' | 'Mobilizing' | 'Idle' | 'Maintenance' | 'Standby';
export type ServiceLine = 'Dredging' | 'Dewatering' | 'SoilImprovement';
export type ProjectPhase = 'Mobilisasi' | 'Survey' | 'Lokasi' | 'Perakitan' | 'Operasi' | 'Disposal';
export type AssignmentStatus = 'Planned' | 'Active' | 'Completed';

export interface Asset {
  id: string;
  name: string;
  type: string;
  service_line: ServiceLine;
  home_base_label?: string | null;
  home_base_lat?: number | null;
  home_base_lng?: number | null;
  lat: number;
  lng: number;
  status: AssetStatus;
  availability_date: string;
  capability_profile: {
    constraints: string[];
    production_range: string;
    notes?: string;
    optional_constraints?: Record<string, string | number | boolean>;
  };
  last_update_at: string;
  last_update_by?: string | null;
}

export interface Project {
  id: string;
  name: string;
  client_type: string;
  service_line: ServiceLine;
  phase: ProjectPhase;
  planned_start: string;
  planned_end: string;
  priority: number;
  lat: number;
  lng: number;
  polygon_geojson?: GeoJSON.Polygon | null;
  notes?: string | null;
  risks?: string | null;
  last_update_at: string;
}

export interface Assignment {
  id: string;
  project_id: string;
  asset_id: string;
  eta_estimate: string;
  mobilization_checklist: Array<{ item: string; done: boolean }>;
  risk_notes: string;
  status: AssignmentStatus;
  created_at: string;
  created_by?: string | null;
}

export interface DailyLog {
  id: string;
  project_id: string;
  asset_id: string;
  date: string;
  hours_worked: number;
  progress_value: number;
  progress_unit: string;
  downtime_tags: string[];
  notes: string;
  attachments: string[];
}

export interface SpeedProfile {
  type: string;
  speed_km_per_day: number;
}

export interface RecommendationBreakdown {
  availability: number;
  eta: number;
  capability: number;
}

export interface RecommendationResult {
  asset: Asset;
  score: number;
  distance_km: number;
  eta_days: number;
  why: RecommendationBreakdown;
  explanation: string;
}

export interface ReportMeta {
  id: string;
  project_id: string;
  project_name: string;
  created_at: string;
  filename: string;
}

export interface RoiAssumptions {
  asset_sets: number;
  idr_per_day: number;
  idle_days_baseline: number;
  mobilization_cost_per_job: number;
  jobs_per_year: number;
  gross_margin_per_project: number;
}
