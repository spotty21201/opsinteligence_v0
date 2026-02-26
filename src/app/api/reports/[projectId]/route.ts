import fs from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { chromium } from 'playwright';
import { addReportMeta, getProject } from '@/lib/repository';

async function generate({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await getProject(projectId);
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/report/${projectId}?print=1`;
  await page.goto(url, { waitUntil: 'networkidle' });
  const pdf = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();

  const id = crypto.randomUUID();
  const filename = `${projectId}-${Date.now()}.pdf`;
  const dir = path.join(process.cwd(), 'generated-reports');
  await fs.mkdir(dir, { recursive: true });
  const fullPath = path.join(dir, filename);
  await fs.writeFile(fullPath, pdf);

  await addReportMeta({
    id,
    project_id: projectId,
    project_name: project.name,
    created_at: new Date().toISOString(),
    filename,
  });

  return new NextResponse(pdf, {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="${filename}"`,
    },
  });
}

export async function GET(_: Request, context: { params: Promise<{ projectId: string }> }) {
  return generate(context);
}

export async function POST(_: Request, context: { params: Promise<{ projectId: string }> }) {
  return generate(context);
}
