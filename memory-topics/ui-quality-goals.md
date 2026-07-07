# UI Quality Goals

- BNA UI should feel polished, calm, operator-grade, and mobile-safe.
- Visible controls must work, be registered, or be disabled/coming soon with a
  reason.
- Mobile pages must avoid horizontal overflow.
- Operations pages should favor compact, scannable work surfaces over giant
  unexplained cards.
- Top toolbars/top sections should not waste first-viewport space. Filters,
  subcategories, and primary actions should sit close to the content they
  control and collapse cleanly on 430/390 mobile.
- Broad UI audit prompt packets should be parallel-friendly when possible:
  independent Agent Mode sessions can audit separate surfaces at the same time,
  with a later synthesis/join packet after at least two reports exist.
- Parallel Agent Mode UI audits should save their findings into the BNA
  Operations Agent Review task/drop-off flow first. GitHub packets or marked
  comments are fallback handoffs, not the primary path, because Agent Mode
  sessions may not have GitHub write access.
- Relevant standing goals: `GOAL-CORE-001` through `GOAL-CORE-005` and
  `GOAL-CORE-015`.
