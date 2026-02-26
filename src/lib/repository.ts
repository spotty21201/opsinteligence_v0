import fs from 'node:fs/promises';
import path from 'node:path';
import { DEFAULT_SPEED_PROFILES } from '@/lib/constants';
import { seededAssets, seededAssignments, seededDailyLogs, seededProjects } from '@/lib/mock-data';
import { getSupabaseServerClient, hasSupabase } from '@/lib/supabase';
import { Asset, Assignment, DailyLog, Project, ReportMeta, RoiAssumptions, SpeedProfile } from '@/lib/types';

const mem = {
  assets: [...seededAssets],
  projects: [...seededProjects],
  assignments: [...seededAssignments],
  logs: [...seededDailyLogs],
  speedProfiles: [...DEFAULT_SPEED_PROFILES],
  roiAssumptions: {
    asset_sets: 8,
    idr_per_day: 115000000,
    idle_days_baseline: 35,
    mobilization_cost_per_job: 420000000,
    jobs_per_year: 14,
    gross_margin_per_project: 0.22,
  } as RoiAssumptions,
};

const reportMetaPath = path.join(process.cwd(), 'generated-reports', 'metadata.json');

async function safeReadReports(): Promise<ReportMeta[]> {
  try {
    const raw = await fs.readFile(reportMetaPath, 'utf8');
    return JSON.parse(raw) as ReportMeta[];
  } catch {
    return [];
  }
}

export async function listAssets() {
  if (!hasSupabase) return mem.assets;
  const sb = getSupabaseServerClient();
  const { data } = await sb!.from('assets').select('*').order('name');
  return (data as Asset[]) ?? [];
}

export async function listProjects() {
  if (!hasSupabase) return mem.projects;
  const sb = getSupabaseServerClient();
  const { data } = await sb!.from('projects').select('*').order('priority', { ascending: true });
  return (data as Project[]) ?? [];
}

export async function getProject(projectId: string) {
  const projects = await listProjects();
  return projects.find((p) => p.id === projectId) ?? null;
}

export async function listAssignments() {
  if (!hasSupabase) return mem.assignments;
  const sb = getSupabaseServerClient();
  const { data } = await sb!.from('assignments').select('*').order('created_at', { ascending: false });
  return (data as Assignment[]) ?? [];
}

export async function createAssignment(payload: Omit<Assignment, 'id' | 'created_at'>) {
  const assignment: Assignment = {
    ...payload,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };

  if (!hasSupabase) {
    mem.assignments.unshift(assignment);
    const asset = mem.assets.find((row) => row.id === assignment.asset_id);
    if (asset) {
      asset.status = assignment.status === 'Completed' ? 'Idle' : 'Mobilizing';
      asset.last_update_at = new Date().toISOString();
    }
    return assignment;
  }

  const sb = getSupabaseServerClient();
  const { data, error } = await sb!.from('assignments').insert(assignment).select('*').single();
  if (error) throw error;
  await sb!.from('assets').update({ status: assignment.status === 'Completed' ? 'Idle' : 'Mobilizing' }).eq('id', assignment.asset_id);
  return data as Assignment;
}

export async function updateAssignment(assignmentId: string, payload: Partial<Assignment>) {
  if (!hasSupabase) {
    const idx = mem.assignments.findIndex((row) => row.id === assignmentId);
    if (idx < 0) return null;
    mem.assignments[idx] = { ...mem.assignments[idx], ...payload };
    const updated = mem.assignments[idx];
    const asset = mem.assets.find((row) => row.id === updated.asset_id);
    if (asset) {
      asset.status = updated.status === 'Completed' ? 'Idle' : updated.status === 'Active' ? 'Working' : 'Mobilizing';
      asset.last_update_at = new Date().toISOString();
    }
    return updated;
  }

  const sb = getSupabaseServerClient();
  const { data, error } = await sb!.from('assignments').update(payload).eq('id', assignmentId).select('*').single();
  if (error) throw error;
  const updated = data as Assignment;
  await sb!
    .from('assets')
    .update({ status: updated.status === 'Completed' ? 'Idle' : updated.status === 'Active' ? 'Working' : 'Mobilizing' })
    .eq('id', updated.asset_id);
  return updated;
}

export async function listDailyLogs(projectId?: string) {
  if (!hasSupabase) {
    return mem.logs.filter((l) => (projectId ? l.project_id === projectId : true));
  }
  const sb = getSupabaseServerClient();
  let query = sb!.from('daily_logs').select('*').order('date', { ascending: false });
  if (projectId) query = query.eq('project_id', projectId);
  const { data } = await query;
  return (data as DailyLog[]) ?? [];
}

export async function createDailyLog(payload: Omit<DailyLog, 'id'>) {
  const row: DailyLog = { ...payload, id: crypto.randomUUID() };
  if (!hasSupabase) {
    mem.logs.unshift(row);
    return row;
  }
  const sb = getSupabaseServerClient();
  const { data, error } = await sb!.from('daily_logs').insert(row).select('*').single();
  if (error) throw error;
  return data as DailyLog;
}

export async function listSpeedProfiles(): Promise<SpeedProfile[]> {
  if (!hasSupabase) return mem.speedProfiles;
  const sb = getSupabaseServerClient();
  const { data } = await sb!.from('speed_profiles').select('*').order('type');
  return (data as SpeedProfile[]) ?? DEFAULT_SPEED_PROFILES;
}

export async function upsertSpeedProfile(profile: SpeedProfile) {
  if (!hasSupabase) {
    const idx = mem.speedProfiles.findIndex((p) => p.type === profile.type);
    if (idx >= 0) mem.speedProfiles[idx] = profile;
    else mem.speedProfiles.push(profile);
    return profile;
  }
  const sb = getSupabaseServerClient();
  const { data, error } = await sb!
    .from('speed_profiles')
    .upsert(profile, { onConflict: 'type' })
    .select('*')
    .single();
  if (error) throw error;
  return data as SpeedProfile;
}

export async function upsertAsset(row: Asset) {
  if (!hasSupabase) {
    const idx = mem.assets.findIndex((a) => a.id === row.id);
    if (idx >= 0) mem.assets[idx] = row;
    else mem.assets.push(row);
    return row;
  }
  const sb = getSupabaseServerClient();
  const { data, error } = await sb!.from('assets').upsert(row).select('*').single();
  if (error) throw error;
  return data as Asset;
}

export async function upsertProject(row: Project) {
  if (!hasSupabase) {
    const idx = mem.projects.findIndex((p) => p.id === row.id);
    if (idx >= 0) mem.projects[idx] = row;
    else mem.projects.push(row);
    return row;
  }
  const sb = getSupabaseServerClient();
  const { data, error } = await sb!.from('projects').upsert(row).select('*').single();
  if (error) throw error;
  return data as Project;
}

export async function listReportMeta() {
  if (hasSupabase) {
    const sb = getSupabaseServerClient();
    try {
      const { data, error } = await sb!.from('reports').select('*').order('created_at', { ascending: false });
      if (!error && data) return data as ReportMeta[];
    } catch {
      // Fall through to file-backed metadata for demo resilience.
    }
  }
  return safeReadReports();
}

export async function addReportMeta(meta: ReportMeta) {
  if (hasSupabase) {
    const sb = getSupabaseServerClient();
    try {
      const { error } = await sb!.from('reports').insert(meta);
      if (!error) return;
    } catch {
      // Fall through to file-backed metadata for demo resilience.
    }
  }
  const all = await safeReadReports();
  all.unshift(meta);
  await fs.mkdir(path.dirname(reportMetaPath), { recursive: true });
  await fs.writeFile(reportMetaPath, JSON.stringify(all, null, 2));
}

export async function resetSeedData() {
  mem.assets = [...seededAssets];
  mem.projects = [...seededProjects];
  mem.assignments = [...seededAssignments];
  mem.logs = [...seededDailyLogs];
  mem.speedProfiles = [...DEFAULT_SPEED_PROFILES];
}

export async function getRoiAssumptions() {
  if (!hasSupabase) return mem.roiAssumptions;
  const sb = getSupabaseServerClient();
  try {
    const { data } = await sb!.from('demo_settings').select('value').eq('key', 'roi_assumptions').single();
    return ((data?.value ?? mem.roiAssumptions) as RoiAssumptions);
  } catch {
    return mem.roiAssumptions;
  }
}

export async function saveRoiAssumptions(payload: RoiAssumptions) {
  mem.roiAssumptions = payload;
  if (!hasSupabase) return mem.roiAssumptions;
  const sb = getSupabaseServerClient();
  try {
    await sb!.from('demo_settings').upsert({ key: 'roi_assumptions', value: payload }, { onConflict: 'key' });
  } catch {
    // Fall back to in-memory persistence for demo mode when table is unavailable.
  }
  return mem.roiAssumptions;
}
