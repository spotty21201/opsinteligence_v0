import { listAssets } from '@/lib/repository';
import { AssetsTable } from '@/components/routes/assets/assets-table';

export default async function AssetsPage() {
  const assets = await listAssets();
  return <AssetsTable assets={assets} />;
}
