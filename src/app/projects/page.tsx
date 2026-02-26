import Link from 'next/link';
import { listProjects } from '@/lib/repository';
import { Badge } from '@/components/ui/badge';
import { statusTagClasses } from '@/styles/tokens';

export default async function ProjectsPage() {
  const projects = await listProjects();
  return (
    <div className="rounded-2xl border bg-white p-4">
      <h1 className="mb-4 text-xl font-semibold">Projects</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="pb-2">Project</th><th>Service Line</th><th>Phase</th><th>Priority</th><th>Snapshot</th><th>PDF</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-t">
                <td className="py-2">{project.name}</td>
                <td>{project.service_line}</td>
                <td><Badge className={statusTagClasses[project.phase]}>{project.phase}</Badge></td>
                <td>{project.priority}</td>
                <td><Link className="text-orange-600" href={`/projects/${project.id}`}>Open</Link></td>
                <td><a className="text-orange-600" href={`/api/reports/${project.id}`}>Generate</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
