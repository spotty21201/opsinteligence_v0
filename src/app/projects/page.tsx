import { listProjects } from '@/lib/repository';
import { ProjectsPageClient } from '@/components/routes/projects/projects-page-client';

export default async function ProjectsPage() {
  const projects = await listProjects();
  return <ProjectsPageClient projects={projects} />;
}
