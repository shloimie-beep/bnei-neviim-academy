# Natural Language Parsing Improvement Ideas

1. Add a transcript lane classifier that emits separate lanes for questions,
   tasks, UI updates, classes, scores, content, contacts, accounting, and
   private review in one pass.
2. Use a confidence ladder for each extracted item: auto-route, dry-run review,
   private review, or blocked.
3. Require source section hashes on every parsed item so reprocessing can be
   idempotent and auditable.
4. Add per-lane idempotency keys for tasks, questions, Drive docs, and
   score/progress candidates.
5. Split parser output into public-safe, private-internal, and student-sensitive
   sections before summary or newsletter generation.
6. Add a class/session resolver that matches date, upload folder, filename,
   provider, and transcript clues before routing any class data.
7. Add a student alias resolver with conflict detection and explicit
   unmatched/ambiguous class-question fallback.
8. Add a score/progress extractor that never applies directly and always emits
   row-level before/after dry-run rows first.
9. Add a task compiler that rewrites raw transcript wording into clean task
   titles, owner, priority, dependency, and privacy-safe notes.
10. Add a UI/product-quality compiler that turns vague phrases into exact
    route/view/state/test requirements before implementation.
11. Add a newsletter-safety classifier that excludes private, student,
    accounting, support, and unreviewed sections by default.
12. Add parser regression fixtures for real mixed recordings: class plus tasks,
    UI correction plus questions, and score/progress plus private notes.
13. Add parser drift watchdogs that fail when a lane disappears from output or
    raw provenance is missing.
14. Add structured parser error classes: no transcript, no parser output,
    ambiguous student, unsupported media, provider auth, and apply blocked.
15. Add a parser replay command that can re-run one job, one date range, or one
    lane without duplicating downstream rows.
16. Add Drive doc visibility checks that compare app DB transcript status with
    private Drive Transcript Library docs.
17. Add a review UI for parser candidates with side-by-side raw excerpt hash,
    lane, confidence, proposed action, and approval gate.
18. Add provider/workspace policy checks before writes so BNA, One Time, and
    future providers cannot bleed records across workspaces.
19. Add automatic dry-run packets for external or risky mutations instead of
    letting parser output stop at a generic blocker.
20. Add per-job closeout reports that show raw captured, transcript generated,
    parsed lanes, routed items, blocked items, verification, and next action.
