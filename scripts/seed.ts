import { createClient } from '@supabase/supabase-js';
import { DEFAULT_SPEED_PROFILES } from '../src/lib/constants';
import { seededAssets, seededAssignments, seededDailyLogs, seededProjects } from '../src/lib/mock-data';

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  await supabase.from('assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('daily_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('projects').delete().neq('id', '__none__');
  await supabase.from('assets').delete().neq('id', '__none__');
  await supabase.from('speed_profiles').delete().neq('type', '__none__');

  const { error: assetsError } = await supabase.from('assets').insert(seededAssets);
  if (assetsError) throw assetsError;

  const { error: projectsError } = await supabase.from('projects').insert(seededProjects);
  if (projectsError) throw projectsError;

  const { error: assignmentsError } = await supabase.from('assignments').insert(seededAssignments);
  if (assignmentsError) throw assignmentsError;

  const { error: logsError } = await supabase.from('daily_logs').insert(seededDailyLogs);
  if (logsError) throw logsError;

  const { error: speedError } = await supabase.from('speed_profiles').insert(DEFAULT_SPEED_PROFILES);
  if (speedError) throw speedError;

  console.log('Seed completed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
