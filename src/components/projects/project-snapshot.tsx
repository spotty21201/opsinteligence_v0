'use client';

import { useMemo, useRef } from 'react';
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
  const chartRef = useRef<HTMLDivElement | null>(null);
  const assignmentsRef = useRef<HTMLDivElement | null>(null);
  const data = useMemo(() => logs.slice().sort((a, b) => a.date.localeCompare(b.date)).slice(-12), [logs]);
  const avg = data.length ? data.reduce((sum, row) => sum + row.progress_value, 0) / data.length : 0;
  const remaining = Math.max(0, 100 - (data.at(-1)?.progress_value ?? 0));
  const forecastDays = avg > 0 ? Math.ceil(remaining / avg) : 0;
  const plannedEnd = new Date(project.planned_end);
  const today = new Date();
  const remainingPlannedDays = Math.ceil((plannedEnd.getTime() - today.getTime()) / 86400000);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <p className="text-xs italic text-slate-600">Phase timeline</p>
        <div className="mt-3 grid grid-cols-3 gap-2 lg:grid-cols-6">
          {PROJECT_PHASES.map((phase) => (
            <button
              key={phase}
              type="button"
              title={phaseHelp[phase]}
              onClick={() => (phase === project.phase ? assignmentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) : chartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))}
              className={`rounded-xl border p-2 text-left text-xs transition-colors ${phase === project.phase ? 'border-[color:var(--brand-primary)] bg-[color:var(--brand-soft)]' : 'bg-slate-50 hover:bg-slate-100'}`}
            >
              <Badge className={statusTagClasses[phase]}>{phase}</Badge>
            </button>
          ))}
        </div>
      </Card>

      <div ref={chartRef}>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Planned vs actual</p>
          <div className={compact ? 'mt-2 h-44' : 'mt-2 h-56'}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line dataKey="progress_value" stroke="#1D498B" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <p className="text-sm font-medium">Completion forecast</p>
        <p className="text-sm text-slate-600">Estimated {forecastDays || 'N/A'} days to complete based on last {data.length} logs average. This is an estimate.</p>
        <p className="mt-1 text-xs text-slate-500">Current phase: {project.phase}. Planned end: {project.planned_end} ({remainingPlannedDays >= 0 ? `${remainingPlannedDays} days remaining` : `${Math.abs(remainingPlannedDays)} days past planned end`}).</p>
      </Card>
      {!compact && (
        <div ref={assignmentsRef}>
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
        </div>
      )}
    </div>
  );
}
