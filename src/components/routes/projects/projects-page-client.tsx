'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/toast-provider';
import { Project } from '@/lib/types';
import { statusTagClasses } from '@/styles/tokens';

export function ProjectsPageClient({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const toast = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const phaseHelp: Record<string, string> = {
    Mobilisasi: 'Mobilization and movement to site',
    Survey: 'Survey and validation stage',
    Lokasi: 'Site setup and readiness',
    Perakitan: 'Assembly and installation',
    Operasi: 'Active operation / production',
    Disposal: 'Disposal and close-out activities',
  };

  async function generate(projectId: string) {
    setLoadingId(projectId);
    try {
      const response = await fetch(`/api/reports/${projectId}`);
      if (!response.ok) throw new Error('export failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectId}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      window.dispatchEvent(new Event('ops-report-generated'));
      toast('Project report generated', 'success');
    } catch {
      toast('Failed to generate report', 'error');
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-4">
      <h1 className="mb-4 text-xl font-semibold">Projects</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr><th className="pb-2">Project</th><th>Service Line</th><th>Phase</th><th>Priority</th><th>Snapshot</th><th>PDF</th></tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="group cursor-pointer border-t transition-colors hover:bg-slate-50" onClick={() => router.push(`/projects/${project.id}`)}>
                <td className="py-1.5">
                  <Link className="inline-flex items-center gap-1 text-slate-800" href={`/projects/${project.id}`} onClick={(e) => e.stopPropagation()}>
                    {project.name}
                    <ChevronRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-70" />
                  </Link>
                </td>
                <td>{project.service_line}</td>
                <td><Badge title={phaseHelp[project.phase]} className={statusTagClasses[project.phase]}>{project.phase}</Badge></td>
                <td>{project.priority}</td>
                <td><Link className="text-slate-700 underline-offset-2 hover:underline" href={`/projects/${project.id}`} onClick={(e) => e.stopPropagation()}>View</Link></td>
                <td>
                  <button type="button" onClick={(e) => { e.stopPropagation(); void generate(project.id); }} className="inline-flex items-center gap-2 text-slate-700 underline-offset-2 hover:underline">
                    {loadingId === project.id ? <Spinner /> : null}
                    Export
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
