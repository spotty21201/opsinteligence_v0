import { NextRequest, NextResponse } from 'next/server';
import { seededProjects } from '@/lib/mock-data';
import { listProjects, upsertProject } from '@/lib/repository';

export async function GET() {
  return NextResponse.json({ items: await listProjects() });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body?.id || !body?.name || String(body.name).trim().length < 3) {
    return NextResponse.json({ error: 'Invalid project payload' }, { status: 400 });
  }
  const seed = seededProjects[0];
  const item = await upsertProject({ ...seed, ...body, last_update_at: new Date().toISOString() });
  return NextResponse.json({ item });
}
