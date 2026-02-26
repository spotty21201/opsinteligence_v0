# 3Sigma Ops Intelligence (Release 0.0 Demo)

Map-first operations cockpit for PT Trisigma Indonusa, aligned to `prd_3_sigma_ops_intelligence_release_0_0_demo_kolabs.md`.

## Stack
- Next.js App Router + TypeScript
- Tailwind CSS + shadcn-style UI components
- MapLibre GL + Turf.js
- Supabase Postgres
- PDF export via Playwright rendering `/report/[projectId]?print=1`

## Routes
- `/dashboard`
- `/assets`
- `/projects`
- `/projects/[id]`
- `/dispatch`
- `/reports`
- `/admin`
- `/report/[projectId]?print=1`

## Setup
1. Install dependencies: `npm install`
2. Configure `.env.local` from `.env.example`
3. Apply schema in Supabase SQL editor: `supabase/schema.sql`
4. Seed data: `npm run seed`
5. Run app: `npm run dev`

## Seed dataset
- 8-12 assets across Indonesian islands
- 6-10 projects with phases
- 15-30 daily logs including downtime tags

## PDF export
- Open print layout: `/report/[projectId]?print=1`
- Generate report file + metadata: `GET /api/reports/[projectId]`
- Reports listing reads metadata from `generated-reports/metadata.json`

## Notes
- ETA/recommendations are explainable demo logic.
- AIS/weather/compliance are intentionally out-of-scope hooks for post-0.0.
