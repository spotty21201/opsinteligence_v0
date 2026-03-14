'use client';

import { useMemo, useRef } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { PROJECT_PHASES } from '@/lib/constants';
import { Assignment, Asset, DailyLog, Project } from '@/lib/types';
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
  assets = [],
  compact = false,
}: {
  project: Project;
  logs: DailyLog[];
  assignments?: Assignment[];
  assets?: Asset[];
  compact?: boolean;
}) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const assignmentsRef = useRef<HTMLDivElement | null>(null);
  const data = useMemo(() => logs.slice().sort((a, b) => a.date.localeCompare(b.date)).slice(-12), [logs]);
  const averageProduction = data.length ? data.reduce((sum, row) => sum + row.progress_value, 0) / data.length : 0;
  const latestLog = data.at(-1) ?? null;
  const previousWindow = data.slice(Math.max(0, data.length - 6), Math.max(0, data.length - 3));
  const currentWindow = data.slice(-3);
  const previousAverage = previousWindow.length
    ? previousWindow.reduce((sum, row) => sum + row.progress_value, 0) / previousWindow.length
    : 0;
  const currentAverage = currentWindow.length
    ? currentWindow.reduce((sum, row) => sum + row.progress_value, 0) / currentWindow.length
    : 0;
  const trendDelta = previousAverage > 0 ? ((currentAverage - previousAverage) / previousAverage) * 100 : 0;
  const trendLabel =
    previousWindow.length === 0
      ? 'Trend baseline unavailable'
      : trendDelta > 2
        ? 'Trending up'
        : trendDelta < -2
          ? 'Trending down'
          : 'Holding steady';
  const plannedEnd = new Date(project.planned_end);
  const today = new Date();
  const remainingPlannedDays = Math.ceil((plannedEnd.getTime() - today.getTime()) / 86400000);
  const assetNameById = useMemo(() => new Map(assets.map((asset) => [asset.id, asset.name])), [assets]);

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
          <div className="mt-2 min-w-0">
            <ResponsiveContainer width="100%" height={compact ? 176 : 224} minWidth={280}>
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
        <p className="text-sm font-medium">Recent production trend</p>
        <p className="text-sm text-slate-600">
          Average output is {averageProduction ? averageProduction.toFixed(1) : 'N/A'} {latestLog?.progress_unit ?? 'units/day'} across the last {data.length || 0} logs.
          {latestLog ? ` Latest log: ${latestLog.progress_value.toFixed(1)} ${latestLog.progress_unit} on ${latestLog.date}.` : ''}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {trendLabel}
          {previousWindow.length > 0 ? ` (${Math.abs(trendDelta).toFixed(0)}% vs prior 3-log window).` : '.'}
        </p>
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
                  <p className="font-medium">{assetNameById.get(row.asset_id) ?? row.asset_id}</p>
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
