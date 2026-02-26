'use client';

import { useRouter } from 'next/navigation';
import { Asset } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { statusTagClasses } from '@/styles/tokens';

const statusHelp: Record<string, string> = {
  Working: 'Actively producing on site',
  Mobilizing: 'In transit or setup',
  Idle: 'Available but not assigned',
  Maintenance: 'Under maintenance or downtime',
  Standby: 'Ready and waiting',
};

export function AssetsTable({ assets }: { assets: Asset[] }) {
  const router = useRouter();

  return (
    <div className="rounded-2xl border bg-white p-4">
      <h1 className="mb-4 text-xl font-semibold">Assets</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr><th className="pb-2">Name</th><th>Type</th><th>Service Line</th><th>Status</th><th>Availability</th></tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id} className="cursor-pointer border-t transition-colors hover:bg-slate-50" onClick={() => router.push(`/assets/${asset.id}`)}>
                <td className="py-2 font-medium text-orange-600">{asset.name}</td>
                <td>{asset.type}</td>
                <td>{asset.service_line}</td>
                <td><Badge title={statusHelp[asset.status]} className={statusTagClasses[asset.status]}>{asset.status}</Badge></td>
                <td>{asset.availability_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
