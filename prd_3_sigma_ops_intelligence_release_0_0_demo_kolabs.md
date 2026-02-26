# PRD — 3Sigma Ops Intelligence
## Release 0.0 Demo — A map-first operations cockpit for PT Trisigma Indonusa (3Sigma)

**Prepared by:** Kolabs.Design x AIM+HDA Collective  
**Client focus:** PT Trisigma Indonusa (3Sigma)  
**Document intent:** concise, build-ready PRD for a coding/architecture agent and implementation (Codex).

---

## 1) Working name options (choose 1)
**Recommended:** **3Sigma Ops Intelligence**  
Alternatives:
1) **3Sigma Fleet & Field Ops**
2) **Bluewater Ops — 3Sigma Edition**
3) **Archipelago Dispatch**

**Tagline (demo):** *“See the fleet. Plan mobilization. Forecast delivery. Report with confidence.”*

---

## 2) Product statement
3Sigma operates multi-service field execution across Indonesia (dredging, dewatering, soil improvement). Margin leakage often occurs in the gaps: mobilization/perakitan uncertainty, idle time opacity, inconsistent reporting, and tender response speed.

**3Sigma Ops Intelligence** is a **map-first operations cockpit** that provides a single operational truth:
- Where are our assets?
- What phase is each project in?
- Which asset can serve which job next, with what ETA and mobilization plan?
- How is production tracking versus plan?
- Can we export a clean snapshot for clients and internal leadership?

---

## 3) Release 0.0 Demo goal
A visually strong, believable demo that convinces 3Sigma leadership:
1) We understand their operating reality (Mobilisasi → Survey → Lokasi → Perakitan → Operasi → Disposal)
2) We can implement it quickly with clean UX
3) It produces decision clarity and report-ready outputs

**Release 0.0 is a demo**: data can be seeded / mocked / manually updated, with clear hooks for AIS and other integrations later.

---

## 4) Target users (personas)
1) **Operations Director / Owner**
   - Needs national overview, utilization, confidence in commitments, fewer surprises.
2) **Dispatcher / Ops Coordinator**
   - Needs “who is available, where, and can they reach Site X?” in minutes.
3) **Project Manager (Site-level)**
   - Needs daily logging, issues, and a simple planned vs actual view.
4) **Client-facing Manager**
   - Needs clean snapshots and weekly reports to reduce disputes and increase trust.

---

## 5) Primary use-cases (Release 0.0)
### UC1 — National Ops Map (default screen)
- View assets (vessels + field systems) pinned on Indonesia map
- View projects as points/polygons with phase + priority
- Filters by region, service line (Dredging/Dewatering/Soil Improvement), status

### UC2 — Asset detail drawer
- Capability card (type, constraints, expected production range)
- Current status (Working / Mobilizing / Idle / Maintenance / Standby)
- Last update timestamp + notes
- “Recommend jobs” button

### UC3 — Project snapshot
- Phase timeline (Mobilisasi → Survey → Lokasi → Perakitan → Operasi → Disposal)
- Planned vs actual production (simple chart)
- Completion forecast (days-to-complete)
- Exportable snapshot (PDF)

### UC4 — Dispatch planner
- Assign an asset set to a project
- Capture ETA (estimated), mobilization checklist, and risks
- Lock-in “commitment note” for internal use

### UC5 — Daily log (lightweight)
- Date, hours worked, estimated volume (or progress unit), downtime tags, notes
- Attachments (optional): photo, scan, PDF

### UC6 — Report export
- One-page “Investor/Client style” PDF: map + progress + phase + key metrics

---

## 6) Non-goals (explicitly out of scope for Release 0.0)
- Full environmental compliance workflows
- High-precision hydrographic/bathymetry pipelines
- Full accounting / ERP replacement
- Complex multi-party approvals

---

## 7) Value model (to support the demo story)
The app should optionally show a “Business Impact” card (demo mode), based on editable assumptions.

**Value levers:**
1) Utilization uplift → more billable days
2) Mobilization/perakitan savings → fewer standby/mistakes
3) Tender speed → win-rate or margin uplift
4) Reporting clarity → fewer disputes + faster approvals

**Simple calculator inputs (admin-editable):**
- # primary asset sets
- IDR/day equivalent
- idle days per year (baseline)
- mobilization cost/job + jobs/year
- gross margin per project

---

## 8) Information architecture (screens)
1) **/dashboard** — National Ops Map (default)
2) **/assets** — Table list (search/filter) + link to asset detail
3) **/projects** — Table list + link to project snapshot
4) **/dispatch** — Assignments board (simple)
5) **/reports** — Export history + templates
6) **/admin** — Manage assets/projects/users, demo assumptions

Release 0.0 can keep 1–3 as primary; 4–6 can be lightweight.

---

## 9) UX flows (mechanism-level detail)
### Flow A — “Client calls, can we take the job?” (2 minutes)
1) Open **National Ops Map**
2) Search project location (or select project pin)
3) Right panel shows: phase, constraints, desired start date
4) System proposes **Recommended Asset Sets**:
   - Score by distance/ETA + availability date + capability fit
5) Dispatcher selects one → opens **Dispatch Planner**
6) Save assignment with ETA + mobilization checklist
7) Optional export: one-page snapshot

### Flow B — “Project drifting behind plan”
1) Open **Project Snapshot**
2) See planned vs actual trend
3) Downtime tags reveal root causes
4) Update phase status and risks
5) Export weekly snapshot

### Flow C — “Where is leakage?” (exec view)
1) Open dashboard
2) Utilization widget: producing vs idle vs maintenance
3) Click category → map highlights
4) Identify underutilized assets and re-plan

---

## 10) UI/UX principles (clean, attractive, credible)
- **Map is the main canvas.** Everything else lives in drawers/panels.
- **Thin lines, calm typography, high legibility.**
- **Status tags are the primary color usage** (avoid noisy UI).
- **Export-ready design**: every view can become a PDF without re-layout.
- **Fast scanning**: Where / What / When / Risk always visible.

### Interaction patterns
- Left: navigation (icons + short labels)
- Center: map canvas
- Right: contextual drawer (asset/project)
- Top bar: global search + filters + export

---

## 11) Visual design system (suggested)
### Typography
- Primary: **Inter** (UI)
- Optional accent for hero tagline: **Source Serif 4** (italic)

### Color palette (Kolabs.Design clean + ops-grade)
- Background: **#FFFFFF**
- Surface: **#F6F7F9**
- Border: **#E5E7EB**
- Text primary: **#111827**
- Text secondary: **#6B7280**

**Status colors (use as tags, not large blocks):**
- Working / Producing: **#16A34A**
- Mobilizing / In Transit: **#2563EB**
- Idle / Standby: **#F59E0B**
- Maintenance / Downtime: **#DC2626**
- Survey / Pre-work: **#7C3AED**

**Accent (Kolabs.Design):**
- Accent Orange: **#F97316**

### Components
- Shadcn UI style: soft shadow, 12–16px radius, thin borders
- Tables: compact, no heavy gridlines, zebra optional (very light)

---

## 12) Data model (Release 0.0)
### Core entities
**Asset** (represents vessel or field system)
- id, name, type (CSD, Pontoon Excavator, Pump Set, PVD Rig, Acetube System, Support Tug)
- service_line (Dredging/Dewatering/SoilImprovement)
- home_base (lat/lng + label)
- last_known_location (lat/lng)
- status (Working/Mobilizing/Idle/Maintenance/Standby)
- availability_date
- capability_profile (JSON: constraints, production range, notes)
- last_update_at, last_update_by

**Project**
- id, name, client_type (Port/Municipality/Mining/Industrial)
- location (lat/lng or polygon)
- service_line
- phase (Mobilisasi/Survey/Lokasi/Perakitan/Operasi/Disposal)
- planned_start, planned_end
- priority (1–5)
- notes, risks

**Assignment**
- id, project_id, asset_id
- eta_estimate
- mobilization_checklist (JSON)
- status (Planned/Active/Completed)
- created_at, created_by

**DailyLog**
- id, project_id, asset_id
- date
- hours_worked
- progress_value (number) + unit (m3/day or %)
- downtime_tags (array)
- notes
- attachments (array)

**User / Role**
- roles: Admin, Ops, PM, ClientView (demo)

---

## 13) Recommendation engine (Release 0.0 logic)
Keep it simple and explainable.

**Score(asset, project) =**
- Availability (soonest availability date) weight 40%
- Distance/ETA (Haversine distance + assumed speed bands) weight 40%
- Capability fit (type match + constraints) weight 20%

**Distance/ETA assumptions (demo):**
- Use simple speed profiles per asset type (editable in admin)
- Show ETA as “estimate” with disclaimer

Later upgrades:
- AIS live positions
- Weather window risk
- Port access constraints library

---

## 14) Tech stack (recommended for fast build + credibility)
### Frontend
- **Next.js (App Router)**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** components
- State: **Zustand** (local UI) + **TanStack Query** (server state)

### Map
- **MapLibre GL JS** (cost-effective, OSM-based)
- Optional upgrade: Mapbox (if client prefers)
- Geospatial helpers: **Turf.js** (distance, bounding, simple geo ops)

### Backend / Data
- **Supabase Postgres** (tables + auth optional)
- Storage: Supabase Storage for attachments
- Row-level security (RLS) for roles

### Auth
- Demo: Supabase Auth
- Optional: Clerk (if you want polished org/user management)

### PDF export
- **Server-side PDF** (best quality): Playwright to render “/report/[id]?print=1” and export PDF
- Alternative: @react-pdf/renderer (faster but less WYSIWYG)

### Deployment
- Vercel

---

## 15) Release 0.0 Demo scope (minimum build list)
**Must-have (demo):**
- National Ops Map with seeded assets/projects
- Asset drawer + project drawer
- Recommendation list + scoring
- Dispatch planner (save assignment)
- Project snapshot with phase + simple chart
- PDF export (one template)

**Nice-to-have:**
- Daily log form
- Reports library page
- Admin page for seed editing

**Demo dataset (seed):**
- 8–12 assets
- 6–10 projects across Indonesia
- 15–30 daily log entries for realism

---

## 16) Acceptance criteria (demo readiness)
- Dashboard loads in < 2 seconds on decent Wi-Fi
- Clicking pins feels immediate; drawers never jitter
- Recommendation scores are explainable (show why)
- PDF export looks like an investor/client document
- UI is calm, professional, and consistent

---

## 17) Narrative for the dinner demo (3 minutes)
1) “This is 3Sigma’s national operations picture.” (Map)
2) Click asset: “Here’s status, next availability, and capability.”
3) Click project: “Here are recommended assets with ETA + readiness.”
4) Open snapshot: “Phase-based control + forecast + reporting.”
5) Export PDF: “This reduces disputes and increases trust.”

---

## 18) Roadmap (post-demo, optional)
**0.1 Pilot**
- Manual location updates + improved logs
- Role-based client portal view

**0.2 Integrations**
- AIS feed for real vessel position
- Weather risk flags

**0.3 Ops analytics**
- Utilization + downtime root cause dashboards
- Tender module

---

## 19) Branding placement
- Top-left: **3Sigma Ops Intelligence**
- Footer (small): **Built by Kolabs.Design x AIM+HDA Collective**
- Export PDFs: include both brands and date/time stamp

---

## 20) Demo disclaimers (keep it honest, still impressive)
- “ETA is an estimate using configurable assumptions.”
- “Locations are demo inputs; AIS integration is available in next release.”
- “This is Release 0.0 to validate workflows and reporting format.”

