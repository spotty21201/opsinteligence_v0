import { NextRequest, NextResponse } from 'next/server';
import { createDailyLog, listDailyLogs } from '@/lib/repository';

export async function GET(request: NextRequest) {
  const projectId = request.nextUrl.searchParams.get('project_id') ?? undefined;
  const items = await listDailyLogs(projectId);
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const item = await createDailyLog({
    project_id: body.project_id,
    asset_id: body.asset_id,
    date: body.date,
    hours_worked: Number(body.hours_worked),
    progress_value: Number(body.progress_value),
    progress_unit: body.progress_unit,
    downtime_tags: body.downtime_tags ?? [],
    notes: body.notes ?? '',
    attachments: body.attachments ?? [],
  });

  return NextResponse.json({ item });
}
