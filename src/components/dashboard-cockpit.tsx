'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { Asset, DailyLog, Project, SpeedProfile } from '@/lib/types';
import { TopBar } from '@/components/top-bar';
import { RightDrawer } from '@/components/drawers/right-drawer';
import { DispatchModal } from '@/components/dispatch/dispatch-modal';
import { useUiStore } from '@/store/ui-store';

const LazyMap = dynamic(() => import('@/components/map/map-canvas').then((m) => m.MapCanvas), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-2xl border bg-slate-100" />,
});

export function DashboardCockpit({ assets, projects, logs, speedProfiles }: { assets: Asset[]; projects: Project[]; logs: DailyLog[]; speedProfiles: SpeedProfile[] }) {
  const { dispatchPrefill, setDispatchPrefill } = useUiStore();
  const [dispatchOpen, setDispatchOpen] = useState(false);

  const exportProjectId = useMemo(() => projects[0]?.id, [projects]);

  return (
    <div className="relative h-[calc(100vh-2rem)] overflow-hidden rounded-2xl border bg-white">
      <div className="absolute left-4 right-[440px] top-4 z-20">
        <TopBar onExport={() => exportProjectId && window.open(`/report/${exportProjectId}?print=1`, '_blank')} />
      </div>
      <div className="h-full w-full pr-[420px]">
        <LazyMap assets={assets} projects={projects} />
      </div>

      <RightDrawer
        assets={assets}
        projects={projects}
        logs={logs}
        speedProfiles={speedProfiles}
        onAssign={(prefill) => {
          setDispatchPrefill(prefill);
          setDispatchOpen(true);
        }}
      />

      <DispatchModal
        open={dispatchOpen}
        onOpenChange={setDispatchOpen}
        assets={assets}
        projects={projects}
        prefill={dispatchPrefill}
      />
    </div>
  );
}
