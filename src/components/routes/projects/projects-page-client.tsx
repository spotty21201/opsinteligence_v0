'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
              <tr key={project.id} className="cursor-pointer border-t transition-colors hover:bg-slate-50" onClick={() => router.push(`/projects/${project.id}`)}>
                <td className="py-2"><Link className="text-orange-600" href={`/projects/${project.id}`} onClick={(e) => e.stopPropagation()}>{project.name}</Link></td>
                <td>{project.service_line}</td>
                <td><Badge title={phaseHelp[project.phase]} className={statusTagClasses[project.phase]}>{project.phase}</Badge></td>
                <td>{project.priority}</td>
                <td><Link className="text-orange-600" href={`/projects/${project.id}`} onClick={(e) => e.stopPropagation()}>Open</Link></td>
                <td>
                  <button type="button" onClick={(e) => { e.stopPropagation(); void generate(project.id); }} className="inline-flex items-center gap-2 text-orange-600">
                    {loadingId === project.id ? <Spinner /> : null}
                    Generate
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
