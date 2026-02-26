import { listAssets } from '@/lib/repository';
import { Badge } from '@/components/ui/badge';
import { statusTagClasses } from '@/styles/tokens';

export default async function AssetsPage() {
  const assets = await listAssets();
  return (
    <div className="rounded-2xl border bg-white p-4">
      <h1 className="mb-4 text-xl font-semibold">Assets</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="pb-2">Name</th><th>Type</th><th>Service Line</th><th>Status</th><th>Availability</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id} className="border-t">
                <td className="py-2">{asset.name}</td>
                <td>{asset.type}</td>
                <td>{asset.service_line}</td>
                <td><Badge className={statusTagClasses[asset.status]}>{asset.status}</Badge></td>
                <td>{asset.availability_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
