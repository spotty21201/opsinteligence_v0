import { notFound } from 'next/navigation';
import { ProjectSnapshot } from '@/components/projects/project-snapshot';
import { listDailyLogs, listProjects } from '@/lib/repository';

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projects = await listProjects();
  const project = projects.find((p) => p.id === id);
  if (!project) return notFound();
  const logs = await listDailyLogs(id);

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">{project.name}</h1>
      <ProjectSnapshot project={project} logs={logs} />
    </div>
  );
}
