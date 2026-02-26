-- Release 0.0 Demo schema for 3Sigma Ops Intelligence
create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text not null check (role in ('Admin', 'Ops', 'PM', 'ClientView')),
  created_at timestamptz not null default now()
);

create table if not exists assets (
  id text primary key,
  name text not null,
  type text not null,
  service_line text not null check (service_line in ('Dredging', 'Dewatering', 'SoilImprovement')),
  home_base_label text,
  home_base_lat double precision,
  home_base_lng double precision,
  lat double precision not null,
  lng double precision not null,
  status text not null check (status in ('Working', 'Mobilizing', 'Idle', 'Maintenance', 'Standby')),
  availability_date date not null,
  capability_profile jsonb not null default '{}'::jsonb,
  last_update_at timestamptz not null default now(),
  last_update_by text
);

create table if not exists projects (
  id text primary key,
  name text not null,
  client_type text not null,
  service_line text not null check (service_line in ('Dredging', 'Dewatering', 'SoilImprovement')),
  phase text not null check (phase in ('Mobilisasi', 'Survey', 'Lokasi', 'Perakitan', 'Operasi', 'Disposal')),
  planned_start date not null,
  planned_end date not null,
  priority int not null,
  lat double precision not null,
  lng double precision not null,
  polygon_geojson jsonb,
  notes text,
  risks text,
  last_update_at timestamptz not null default now()
);

create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  project_id text not null references projects(id) on delete cascade,
  asset_id text not null references assets(id) on delete cascade,
  eta_estimate date not null,
  mobilization_checklist jsonb not null default '[]'::jsonb,
  risk_notes text not null default '',
  status text not null check (status in ('Planned', 'Active', 'Completed')),
  created_at timestamptz not null default now(),
  created_by text
);

create table if not exists daily_logs (
  id uuid primary key default gen_random_uuid(),
  project_id text not null references projects(id) on delete cascade,
  asset_id text not null references assets(id) on delete cascade,
  date date not null,
  hours_worked numeric(5,2) not null,
  progress_value numeric(10,2) not null,
  progress_unit text not null,
  downtime_tags text[] not null default '{}',
  notes text not null default '',
  attachments jsonb not null default '[]'::jsonb
);

create table if not exists speed_profiles (
  type text primary key,
  speed_km_per_day numeric(8,2) not null
);

create table if not exists reports (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  project_name text not null,
  created_at timestamptz not null default now(),
  filename text not null
);

create index if not exists idx_assets_status on assets(status);
create index if not exists idx_assets_service_line on assets(service_line);
create index if not exists idx_projects_phase on projects(phase);
create index if not exists idx_projects_service_line on projects(service_line);
create index if not exists idx_assignments_project_id on assignments(project_id);
create index if not exists idx_assignments_asset_id on assignments(asset_id);
create index if not exists idx_daily_logs_project_id on daily_logs(project_id);
create index if not exists idx_reports_project_id on reports(project_id);
