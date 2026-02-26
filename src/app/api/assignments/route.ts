import { NextRequest, NextResponse } from 'next/server';
import { createAssignment, listAssignments, updateAssignment } from '@/lib/repository';

export async function GET() {
  const items = await listAssignments();
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
  if (!body?.project_id || !body?.asset_id || !body?.eta_estimate) {
    return NextResponse.json({ error: 'project_id, asset_id, eta_estimate are required' }, { status: 400 });
  }
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

export async function PATCH(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
  if (!body.id) {
    return NextResponse.json({ error: 'Missing assignment id' }, { status: 400 });
  }
  const item = await updateAssignment(body.id, {
    eta_estimate: body.eta_estimate,
    status: body.status,
    mobilization_checklist: body.mobilization_checklist,
    risk_notes: body.risk_notes,
  });
  if (!item) {
    return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
  }
  return NextResponse.json({ item });
}
