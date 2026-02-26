import { NextRequest, NextResponse } from 'next/server';
import { seededAssets } from '@/lib/mock-data';
import { listAssets, upsertAsset } from '@/lib/repository';

export async function GET() {
  return NextResponse.json({ items: await listAssets() });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body?.id || !body?.name || String(body.name).trim().length < 3) {
    return NextResponse.json({ error: 'Invalid asset payload' }, { status: 400 });
  }
  const seed = seededAssets[0];
  const item = await upsertAsset({ ...seed, ...body, last_update_at: new Date().toISOString() });
  return NextResponse.json({ item });
}
