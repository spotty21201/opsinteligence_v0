# STATUS — Release 0.0 Demo

## Implemented Routes vs PRD
- `/dashboard`: Implemented (map-first cockpit with filters, map pins/polygons, right drawer, dispatch prefill)
- `/assets`: Implemented (asset table with status/service line)
- `/projects`: Implemented (project table + snapshot link + PDF generate)
- `/dispatch`: Implemented (assignment planner + persisted create via API)
- `/reports`: Implemented (generated PDF metadata listing)
- `/admin`: Implemented (minimal asset/project create, speed assumptions, seed reset)

## Done
- Next.js App Router migration with TypeScript
- Tailwind + shadcn-style component primitives
- Design tokens in `src/styles/tokens.ts` and global CSS variables
- MapLibre map with memoized asset/project GeoJSON layers and filters
- Shared right drawer (closed/asset/project states) with tabs and assign action
- Recommendation engine with weighted explainable subscores
- Dispatch planner workflow and assignment API persistence
- Project snapshot timeline/chart/forecast estimate disclaimer
- Daily log API + form (downtime tag list + custom Other)
- Print route and Playwright PDF export endpoint
- Supabase schema with required entities and requested indexes
- Seed script (`npm run seed`) and docs update

## In Progress
- Full Supabase Auth role wiring (demo simplified)
- ROI assumptions card in Admin (hook present, not fully modeled)

## Missing / Known Gaps
- No dedicated `/reports/[id]` viewer page; uses API file endpoint
- Mobile UX is basic responsive, not fully optimized polish
- Playwright export requires local browser install/runtime support
