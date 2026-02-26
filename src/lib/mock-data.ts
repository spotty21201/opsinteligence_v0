import { Asset, Assignment, DailyLog, Project } from '@/lib/types';

const now = new Date('2026-02-26T08:00:00.000Z').toISOString();

export const seededAssets: Asset[] = [
  { id: 'a1', name: 'CSD Barito 1', type: 'CSD', service_line: 'Dredging', lat: -6.104, lng: 106.81, status: 'Working', availability_date: '2026-03-10', capability_profile: { constraints: ['Draft > 2m'], production_range: '1000-1500 m3/day' }, last_update_at: now },
  { id: 'a2', name: 'CSD Mahakam 2', type: 'CSD', service_line: 'Dredging', lat: -1.24, lng: 116.85, status: 'Maintenance', availability_date: '2026-03-22', capability_profile: { constraints: ['Draft > 2.5m'], production_range: '1200-1800 m3/day' }, last_update_at: now },
  { id: 'a3', name: 'Pontoon Alpha', type: 'Pontoon Excavator', service_line: 'Dredging', lat: -3.99, lng: 122.51, status: 'Idle', availability_date: '2026-02-26', capability_profile: { constraints: ['Shallow water'], production_range: '600-900 m3/day' }, last_update_at: now },
  { id: 'a4', name: 'Pump Set Dewater X', type: 'Pump Set', service_line: 'Dewatering', lat: -7.25, lng: 112.75, status: 'Mobilizing', availability_date: '2026-03-02', capability_profile: { constraints: ['Power supply'], production_range: '1800-2100 m3/hr' }, last_update_at: now },
  { id: 'a5', name: 'PVD Rig Sumatra', type: 'PVD Rig', service_line: 'SoilImprovement', lat: 3.59, lng: 98.67, status: 'Working', availability_date: '2026-04-02', capability_profile: { constraints: ['Ground access'], production_range: '3000 m/day' }, last_update_at: now },
  { id: 'a6', name: 'Acetube Delta', type: 'Acetube System', service_line: 'Dewatering', lat: -0.88, lng: 131.25, status: 'Standby', availability_date: '2026-02-26', capability_profile: { constraints: ['Wide area'], production_range: 'Site dependent' }, last_update_at: now },
  { id: 'a7', name: 'Support Tug Bima', type: 'Support Tug', service_line: 'Dredging', lat: -5.14, lng: 119.42, status: 'Working', availability_date: '2026-03-12', capability_profile: { constraints: [], production_range: 'Support operations' }, last_update_at: now },
  { id: 'a8', name: 'Pump Set Y', type: 'Pump Set', service_line: 'Dewatering', lat: -2.99, lng: 104.75, status: 'Idle', availability_date: '2026-02-26', capability_profile: { constraints: ['Power supply'], production_range: '1600 m3/hr' }, last_update_at: now },
  { id: 'a9', name: 'PVD Rig Java', type: 'PVD Rig', service_line: 'SoilImprovement', lat: -6.23, lng: 107.9, status: 'Working', availability_date: '2026-04-09', capability_profile: { constraints: ['Ground access'], production_range: '2800-3400 m/day' }, last_update_at: now },
];

export const seededProjects: Project[] = [
  {
    id: 'p1',
    name: 'Pelabuhan Patimban Ext',
    client_type: 'Port',
    service_line: 'Dredging',
    phase: 'Operasi',
    planned_start: '2026-01-12',
    planned_end: '2026-09-10',
    priority: 1,
    lat: -6.24,
    lng: 107.9,
    polygon_geojson: {
      type: 'Polygon',
      coordinates: [[[107.84, -6.28], [107.95, -6.28], [107.95, -6.2], [107.84, -6.2], [107.84, -6.28]]],
    },
    risks: 'Weather window shifts',
    last_update_at: now,
  },
  { id: 'p2', name: 'IKN Bay Bypass', client_type: 'Municipality', service_line: 'SoilImprovement', phase: 'Survey', planned_start: '2026-03-28', planned_end: '2026-12-20', priority: 2, lat: -1.19, lng: 116.86, risks: 'Permit pacing', last_update_at: now },
  { id: 'p3', name: 'KPC Pit Dewatering', client_type: 'Mining', service_line: 'Dewatering', phase: 'Perakitan', planned_start: '2026-02-01', planned_end: '2026-05-25', priority: 1, lat: 0.44, lng: 117.54, risks: 'High rainfall', last_update_at: now },
  { id: 'p4', name: 'Belawan Deepening', client_type: 'Port', service_line: 'Dredging', phase: 'Mobilisasi', planned_start: '2026-03-08', planned_end: '2026-10-10', priority: 3, lat: 3.78, lng: 98.69, risks: 'Traffic congestion', last_update_at: now },
  { id: 'p5', name: 'Gresik Smelter Prep', client_type: 'Industrial', service_line: 'SoilImprovement', phase: 'Lokasi', planned_start: '2026-03-15', planned_end: '2026-11-30', priority: 2, lat: -7.16, lng: 112.65, risks: 'Tight baseline', last_update_at: now },
  { id: 'p6', name: 'Sorong Port Rehab', client_type: 'Port', service_line: 'Dredging', phase: 'Disposal', planned_start: '2025-10-01', planned_end: '2026-03-20', priority: 4, lat: -0.87, lng: 131.24, risks: 'Remote logistics', last_update_at: now },
  { id: 'p7', name: 'Batam Industrial Dewater', client_type: 'Industrial', service_line: 'Dewatering', phase: 'Survey', planned_start: '2026-04-04', planned_end: '2026-08-30', priority: 2, lat: 1.08, lng: 104.03, risks: 'Utility relocation', last_update_at: now },
];

export const seededAssignments: Assignment[] = [
  { id: 'as1', project_id: 'p1', asset_id: 'a1', eta_estimate: '2026-03-03', mobilization_checklist: [{ item: 'Crew manifest', done: true }], risk_notes: 'Night shift permit pending', status: 'Active', created_at: now },
  { id: 'as2', project_id: 'p3', asset_id: 'a4', eta_estimate: '2026-02-28', mobilization_checklist: [{ item: 'Power genset', done: false }], risk_notes: 'Road condition wet', status: 'Planned', created_at: now },
];

const logRows = [
  ['2026-02-10', 8, 4.2, [], 'Normal output'],
  ['2026-02-11', 7, 4.0, ['Weather'], 'Rain interruption'],
  ['2026-02-12', 9, 4.8, [], 'Stable shift'],
  ['2026-02-13', 8, 4.1, ['Mechanical'], 'Pump belt replaced'],
  ['2026-02-14', 9, 5.0, [], 'Recovered'],
  ['2026-02-15', 8, 4.6, ['Permit'], 'Client inspection'],
  ['2026-02-16', 10, 5.2, [], 'High tide support'],
  ['2026-02-17', 8, 4.7, [], 'In line'],
  ['2026-02-18', 6, 3.2, ['Fuel Delay'], 'Barge delayed'],
  ['2026-02-19', 9, 5.1, [], 'Recovered'],
  ['2026-02-20', 8, 4.4, [], 'Normal'],
  ['2026-02-21', 8, 4.3, ['Crew'], 'Shift gap'],
  ['2026-02-22', 10, 5.3, [], 'Weekend ops'],
  ['2026-02-23', 9, 5.0, [], 'Steady'],
  ['2026-02-24', 8, 4.6, ['Other'], 'Minor inspection delay'],
  ['2026-02-25', 9, 5.2, [], 'On pace'],
];

export const seededDailyLogs: DailyLog[] = logRows.map((row, idx) => ({
  id: `log-${idx + 1}`,
  project_id: idx % 2 ? 'p3' : 'p1',
  asset_id: idx % 3 ? 'a1' : 'a4',
  date: row[0] as string,
  hours_worked: row[1] as number,
  progress_value: row[2] as number,
  progress_unit: 'm3/day',
  downtime_tags: row[3] as string[],
  notes: row[4] as string,
  attachments: [],
}));
