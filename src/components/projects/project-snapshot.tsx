'use client';

import { useMemo } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { PROJECT_PHASES } from '@/lib/constants';
import { Assignment, DailyLog, Project } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { statusTagClasses } from '@/styles/tokens';
const phaseHelp: Record<string, string> = {
  Mobilisasi: 'Mobilization and movement to site',
  Survey: 'Survey and validation stage',
  Lokasi: 'Site setup and readiness',
  Perakitan: 'Assembly and installation stage',
  Operasi: 'Active operation and production',
  Disposal: 'Disposal and close-out stage',
};

export function ProjectSnapshot({
  project,
  logs,
  assignments = [],
  compact = false,
}: {
  project: Project;
  logs: DailyLog[];
  assignments?: Assignment[];
  compact?: boolean;
}) {
  const data = useMemo(() => logs.slice().sort((a, b) => a.date.localeCompare(b.date)).slice(-12), [logs]);
  const avg = data.length ? data.reduce((sum, row) => sum + row.progress_value, 0) / data.length : 0;
  const remaining = Math.max(0, 100 - (data.at(-1)?.progress_value ?? 0));
  const forecastDays = avg > 0 ? Math.ceil(remaining / avg) : 0;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <p className="text-xs text-slate-500">Phase timeline</p>
        <div className="mt-3 grid grid-cols-3 gap-2 lg:grid-cols-6">
          {PROJECT_PHASES.map((phase) => (
            <div key={phase} className="rounded-xl border bg-slate-50 p-2 text-xs">
              <Badge title={phaseHelp[phase]} className={statusTagClasses[phase]}>{phase}</Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <p className="text-xs text-slate-500">Planned vs actual</p>
        <div className={compact ? 'mt-2 h-44' : 'mt-2 h-56'}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line dataKey="progress_value" stroke="#f97316" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4">
        <p className="text-sm font-medium">Completion forecast</p>
        <p className="text-sm text-slate-600">Estimated {forecastDays || 'N/A'} days to complete based on last {data.length} logs average. This is an estimate.</p>
        <p className="mt-1 text-xs text-slate-500">Current phase: {project.phase}</p>
      </Card>
      {!compact && (
        <Card className="p-4">
          <p className="text-xs text-slate-500">Assignments</p>
          <div className="mt-2 space-y-2">
            {assignments.length === 0 && <p className="text-sm text-slate-500">No assignments yet.</p>}
            {assignments.map((row) => (
              <div key={row.id} className="rounded-xl border bg-slate-50 p-3 text-sm">
                <p className="font-medium">{row.asset_id}</p>
                <p className="text-xs text-slate-500">ETA {row.eta_estimate} • {row.status}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
