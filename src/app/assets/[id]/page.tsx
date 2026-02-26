import { notFound } from 'next/navigation';
import { listAssets, listAssignments, listProjects } from '@/lib/repository';
import { AssetDetail } from '@/components/routes/assets/asset-detail';

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [assets, assignments, projects] = await Promise.all([listAssets(), listAssignments(), listProjects()]);
  const asset = assets.find((row) => row.id === id);
  if (!asset) return notFound();
  const related = assignments.filter((row) => row.asset_id === id);

  return <AssetDetail asset={asset} assignments={related} projects={projects} />;
}
