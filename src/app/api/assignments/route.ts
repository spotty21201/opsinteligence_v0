import { NextRequest, NextResponse } from 'next/server';
import { createAssignment, listAssignments } from '@/lib/repository';

export async function GET() {
  const items = await listAssignments();
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const row = await createAssignment({
    project_id: body.project_id,
    asset_id: body.asset_id,
    eta_estimate: body.eta_estimate,
    mobilization_checklist: body.mobilization_checklist ?? [],
    risk_notes: body.risk_notes ?? '',
    status: body.status ?? 'Planned',
    created_by: 'demo',
  });

  return NextResponse.json({ item: row });
}
