import fs from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { chromium } from 'playwright';
import { addReportMeta, getProject } from '@/lib/repository';

async function generate({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await getProject(projectId);
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const url = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/report/${projectId}?print=1`;
    await page.goto(url, { waitUntil: 'networkidle' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true });

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

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown export error';
    if (message.includes("Executable doesn't exist")) {
      return NextResponse.json(
        {
          error: 'report_export_unavailable',
          message: 'PDF export is unavailable until Playwright Chromium is installed. Run `npx playwright install chromium`.',
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        error: 'report_export_failed',
        message: 'PDF export failed while rendering the report.',
      },
      { status: 500 },
    );
  } finally {
    await browser?.close();
  }
}

export async function GET(_: Request, context: { params: Promise<{ projectId: string }> }) {
  return generate(context);
}

export async function POST(_: Request, context: { params: Promise<{ projectId: string }> }) {
  return generate(context);
}
