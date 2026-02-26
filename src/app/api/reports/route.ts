import { NextResponse } from 'next/server';
import { listReportMeta } from '@/lib/repository';

export async function GET() {
  const items = await listReportMeta();
  return NextResponse.json({ items });
}
