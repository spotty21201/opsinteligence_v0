import { NextRequest, NextResponse } from 'next/server';
import { seededAssets, seededProjects } from '@/lib/mock-data';
import { listAssets, listProjects, listSpeedProfiles, resetSeedData, upsertAsset, upsertProject, upsertSpeedProfile } from '@/lib/repository';

export async function GET(request: NextRequest) {
  const peek = request.nextUrl.searchParams.get('peek');
  if (peek === 'assets') return NextResponse.json({ items: await listAssets() });
  if (peek === 'projects') return NextResponse.json({ items: await listProjects() });
  if (peek === 'speeds') return NextResponse.json({ items: await listSpeedProfiles() });
  return NextResponse.json({ ok: true });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (body.mode === 'reset') {
    await resetSeedData();
    return NextResponse.json({ ok: true });
  }

  if (body.mode === 'speed') {
    const item = await upsertSpeedProfile(body.payload);
    return NextResponse.json({ item });
  }

  if (body.mode === 'asset') {
    const seed = seededAssets[0];
    const item = await upsertAsset({ ...seed, id: body.payload.id, name: body.payload.name, last_update_at: new Date().toISOString() });
    return NextResponse.json({ item });
  }

  if (body.mode === 'project') {
    const seed = seededProjects[0];
    const item = await upsertProject({ ...seed, id: body.payload.id, name: body.payload.name, last_update_at: new Date().toISOString() });
    return NextResponse.json({ item });
  }

  return NextResponse.json({ ok: false }, { status: 400 });
}
