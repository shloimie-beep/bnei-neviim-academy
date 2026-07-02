# Current Local Version - One Time Local Beta

Generated: 2026-06-20T20:39:17+03:00
Build label: `onetime-local-beta-2026.06.19`

## Git Version

- Branch: `integration/20260619-platform-finish`
- HEAD: `4cb03da4f21c94933a06a729fcf757bd2259652b`
- Latest integration commit label: `integration: finish parallel platform local gate`
- Checkpoint commit: `b2fd5039990ee1cb370a49d4475a7763fb8548b7`
- Checkpoint tag: `checkpoint-parallel-20260619-001`

## Source And Run

- Active run: `ops/execution-runs/2026-06-19-onetime-local-beta-hardening/`
- Prior run: `ops/execution-runs/2026-06-19-parallel-platform-finish/`
- Raw prompt: `raw-input/RAW-20260620-001-onetime-local-beta-hardening-super-prompt.md`
- Raw prompt SHA256: `9509DF68F5A5EAE4513049EAF0CEBB8E84A8ABDE56B99B5A4C3310F6FBBA3628`
- Referenced but missing source file: `BNA-CODEX-IMPLEMENTATION-PROMPT.md`

## Prior Local Acceptance Baseline

The previous integration run reported local completion for the parallel platform
finish scope:

- `npm test`: 944/944 passing.
- Secret audit: 3360 tracked paths scanned.
- JSON/JSONL validation: 1275 lines.
- Watchdog and synthetic E2E evidence recorded in the previous run.
- Authenticated local Operations browser smoke was not completed because
  shell-visible Operations credentials were unavailable.

This report does not re-run those gates. It records the current local starting
point for the new hardening run.

## Current App Surface Snapshot

- Main app: Express/static application.
- Live Operations UI source: `public/operations.html`.
- Operations task IA already includes Decisions, Pending, Tasks, Codex Queue,
  Calendar, and Done / Activity concepts.
- Platform modules exist under `src/platform/`, including RBAC, domain,
  community, courses, rewards, ingestion, agent control, prompts, WhatsApp,
  brand/instance definitions, One Time instance config, and integration
  readiness.
- Current migration baseline includes
  `migrations/parallel-20260619-core-001-platform-core.sql`.
- Relevant scripts include `npm run platform:synthetic-e2e`,
  `npm run ops:audit-queue`, `npm run task:reconcile`,
  `npm run watchdog:audit`, and `npm run watchdog:actions`.

## Local-Only Release Rule

This hardening stage must not deploy, mutate DNS, change Railway, mutate a
production database, send live email, charge live payments, or mutate live
external provider state. Those steps belong to a later explicit release gate.

## Immediate Gaps

- The current-version artifact exists, but full local hardening has not yet
  run.
- The referenced `BNA-CODEX-IMPLEMENTATION-PROMPT.md` source is absent.
- Queue reconciliation has a no-live baseline only; live task confidence is
  low until authenticated live/API or database reads are available.
- Local Playwright acceptance and the full synthetic One Time pilot still need
  to run in this new hardening run.
