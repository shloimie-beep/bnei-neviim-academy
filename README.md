# BNA v2.0

BNA v2.0 is the live Express/Postgres/Railway operating system for Bnei
Neviim Academy. The production entrypoint is `server.js`, Railway starts it
with `node server.js`, and Railway health checks `/api/health`.

The repo also holds the durable operating brain for BNA: memory, tasks,
Telegram bridge code, Operations tooling, verification records, and internal
Codex handoffs.

## Quick Local Setup

```powershell
git clone https://github.com/shloimie-beep/bnei-neviim-academy.git
cd bnei-neviim-academy
npm install
npm run setup:local
notepad .env.local
npm run doctor
npm run smoke:local -- --skip-tests
npm run dev
```

Fill these required local values before starting or smoking the app:

- `DATABASE_URL`: Railway/Postgres connection string.
- `OPS_USERNAME`: Operations login username.
- `OPS_PASSWORD`: Operations login password.
- `OPS_LOGIN_ALIASES`: optional comma-separated super-admin Operations login
  aliases, such as the operator email, that map to `OPS_USERNAME`.

`server.js` loads `.env.local` for local development only when a variable is
not already set in the shell or hosting environment. Real secrets must stay in
`.env.local`, `.secrets/`, Railway variables, or the BNA keyholder.

## Local Verification

```powershell
node --check server.js
node --check scripts/telegram-kimi-bridge.mjs
node --check scripts/agent-fleet-supervisor.mjs
npm test
npm run doctor
npm run smoke:local
```

`npm run smoke:local` is read-oriented by default. It verifies key files,
package scripts, syntax checks, `npm test`, app startup, login, Operations
routes, project/task reads, student page, and signup pages. It writes a
redacted report to `.runtime/smoke-local-latest.json`.

Use `npm run smoke:local -- --skip-tests` when the full test suite already ran.
Use `npm run smoke:local -- --base-url https://your-app.example` to smoke an
already running app. Use `--write` only when it is acceptable to create and
delete a temporary smoke task.

## Active App Surfaces

- Public website: `/`, `/he`, `/blog`, `/faq`
- Signup: `/signup`, `/signup.html`, `/signup-he`, `/signup-he.html`
- Parent portal: `/parent/login`, `/parent`
- Student portal: `/student/login`, `/student`, `/student.html`
- Provider directory and signup: `/service-providers`, `/providers/join`
- Provider workspace: `/provider/login`, `/provider`
- Operations/admin: `/operations`
- Operations login API: `/api/operations/login`
- Operations app APIs: `/api/bna/*`

Public UI files live under `public/`. The Operations dashboard is the
Express/static `public/operations.html` surface, not the archived React
prototype under `docs/archive/`.

## Rabbi Demo Path

Rabbi Elie Scheller does not need a local install package now. Shloimie's
laptop setup is developer/operator-only.

The preferred Rabbi path is hosted portal/PWA access plus scoped One Time task
access and optional bot/ticket intake. Demo-safe URLs:

- `/operations`
- `/operations?view=tasks`
- `/student.html`
- `/signup.html`
- `/signup-he.html`

See `docs/demo-rabbi-meeting.md` for the meeting flow and
`docs/rabbi-use-path.md` for the access decision, PWA install instructions, and
remaining inputs Shloimie must provide.

## Lightweight Install Package

This pass intentionally does not build a native desktop app. The install/demo
package is:

- `.env.example`
- `scripts/local-setup.mjs`
- `scripts/doctor.mjs`
- `scripts/smoke-local.mjs`
- `docs/local-setup.md`
- `docs/demo-rabbi-meeting.md`
- `docs/rabbi-use-path.md`
- `docs/install-package/README.md`

## Workspace Model

- Platform / Super Admin: Shloimie's control layer for workspaces, deploy
  state, tasks, tickets, decisions, prompts, and routing.
- BNA Academy / School: the live school workspace for parents, students,
  rabbi/rebbe/admin, classes, assignments, newsletters, learning communities,
  approved provider links, and parent/student portals.
- Service Provider: provider listing/workspace scope with provider admins and
  managers, public free listing, external CTA, provider updates, and scoped
  parent/provider request records.
- Rabbi Sheller / One Time: the first external provider workspace, separated
  from BNA Academy parents/students unless a person is explicitly enrolled in
  both scopes.

The canonical One Time database work is
`railway-migration-2026-06-05-one-time-projects.sql`. Do not create a second
database, duplicate the Mishnah project, or add new production tables for local
install/demo readiness.

## PWA Manifests

- Public website: `/manifest.json`
- Parent portal: `/parent-manifest.json`
- Operations/admin: `/operations-manifest.json`

Public and parent installs must not launch private Operations. Operations uses
`/operations-manifest.json` with start URL `/operations?source=ops-pwa`.

## Connectors

- Railway/Postgres: production hosting and current Operations database.
- Buffer: social scheduler connector for Facebook, LinkedIn, and YouTube.
- Whapi/WAPI: WhatsApp connector.
- Gmail/Google APIs: office email, Drive, Classroom, Calendar, and Docs/Sheets.
- Green Invoice/payment links: payment reconciliation connector.
- Provider-owned systems: external delivery/booking CTAs unless explicitly
  integrated later.

OpenAI is the preferred hosted AI provider when healthy. Kimi can be the
temporary hosted chat/content provider through `BNA_AI_PRIMARY_PROVIDER=kimi`.
Codex remains the development and task owner either way.

## No-GHL Policy

BNA does not use GHL, GoHighLevel, LeadConnector, or LeadConnectorHQ as active
runtime. Do not add new GHL code, env vars, tests, docs, routes, prompts, MCP
tools, smoke checks, or workflows. Historical GHL material belongs only under
`docs/archive/legacy-ghl/`.

## Source Of Truth

- `AGENTS.md`: agent operating rules and workflow behavior
- `MEMORY.md`: durable BNA facts, requirements, preferences, and definitions
- `TASKS.md`: current work queue and visible next actions
- `SYSTEM-STATE.md`: verified live system state and deployment notes
- `PROJECT-NOTES.md`: local migration notes and technical caveats
- `ops/agent-changelog.md`: completed agent work and verification trail
- `ops/agent-task-ledger.jsonl`: append-only task trail
- `tasks-pending/*.md`: internal Codex handoff briefs

Legacy household-app setup material from the pre-BNA era is historical only
unless it is explicitly labeled as an archive and revived in a new task.
