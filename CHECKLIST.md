# CHECKLIST — Release 0.0 Demo QA

- [ ] Dashboard loads <2s (not benchmarked in this run)
- [x] Map interactions are smooth in implementation (lazy map load, memoized layers)
- [x] Drawer state is stable and persistent until explicit close
- [x] Recommendation list deterministic and explainable with 3 subscores
- [x] Dispatch planner creates assignment and persists via API repository
- [x] Snapshot renders phase flow + chart + forecast estimate disclaimer
- [x] PDF export route implemented end-to-end (`/api/reports/[projectId]` -> Playwright -> file + metadata)
- [ ] No console errors (needs runtime verification)
- [ ] Mobile layout basic responsive checks pending live QA
