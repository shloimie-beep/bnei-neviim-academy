# BNA v2.0

BNA v2.0 is the shared operating brain and live Express/static app for Bnei
Neviim Academy, a Whole Child Torah Learning Community in Beit Shemesh. The
repo holds durable memory, active tasks, public website code, parent/student/
provider portals, Operations/admin surfaces, Telegram bridge code, and release
verification records.

## Active App Surfaces

- Public website: `/`, `/he`, `/blog`, `/faq`
- Signup: `/signup`, `/signup.html`, `/signup-he`, `/signup-he.html`
- Parent portal: `/parent/login`, `/parent`
- Student portal: `/student/login`, `/student`
- Provider directory and signup: `/service-providers`, `/providers/join`
- Provider workspace: `/provider/login`, `/provider`
- Operations/admin: `/operations`
- Bot/prompt/action center: Operations assistant, prompt/action registry, and
  role-aware portal assistant widgets

The active app entrypoint is `server.js`; public UI files live in `public/`.

## No-GHL Policy

BNA no longer uses GHL, GoHighLevel, LeadConnector, or LeadConnectorHQ as an
active runtime dependency.

All contacts, parents, students, service providers, learning communities,
provider listings, provider requests, parent/provider messages, newsletters,
workspace records, bot actions, tasks, tickets, and decisions are first-party
BNA records.

Buffer may be used for social scheduling if configured. Whapi/WAPI may be used
for WhatsApp if configured. Gmail/Google APIs may be used for office email,
Drive, Classroom, Calendar, and Docs if configured. External services are
connectors only and never the source of truth unless explicitly approved later.

Legacy GHL files are archived under `docs/archive/legacy-ghl/` only for
historical reference. Do not add new GHL code, env vars, tests, docs, routes,
prompts, MCP tools, smoke checks, or workflows.

## Workspace Model

- Platform / Super Admin: Shloimie's control layer for all workspaces, deploy
  state, tasks, tickets, decisions, prompts, and system routing.
- BNA Academy / School: the live school workspace for parents, students,
  rabbi/rebbe/admin, classes, assignments, newsletters, learning communities,
  approved provider links, and parent/student portals.
- Service Provider: provider listing/workspace scope with provider admins and
  managers, public free listing, external CTA, provider updates, and scoped
  parent/provider request records.
- Rabbi Sheller / One Time: the first external provider workspace, separated
  from BNA Academy parents/students unless a person is explicitly enrolled in
  both scopes.

## Workspace Task Workflow

Operations task work is organized around three primary human-facing buckets:

- `Decisions`: real human choices with an owner, question, options, impact, and
  next action.
- `Pending`: only human or external blockers such as missing Rabbi access,
  account approval, DNS/payment/email credentials, or legal/accounting input.
- `Tasks`: actionable work for Shloimie, Rabbi/workspace owners, providers,
  managers, or Codex/internal agents.

Codex/system work must never sit in human-facing Pending. Executable agent work
uses `agent_status` and `bna_agent_jobs` (`queued`, `running`, `completed`,
`failed`, or `blocked_needs_human_decision`). Failures become a clear Decision
or human/external Pending blocker. Raw Telegram rambles are provenance only;
visible task titles must be concise and actionable. Task comments are shared
internal workspace dialogue, not private author-only notes unless an explicit
visibility value says otherwise.

Detailed maps live in:

- `docs/architecture/no-ghl-policy.md`
- `docs/architecture/workspace-community-provider-role-map.md`
- `docs/architecture/community-dialogue-map.md`
- `docs/architecture/bot-context-and-ticket-routing.md`

## Provider Funnel

Public provider signup is free-listing-only. The public UI must not advertise
paid plans, checkout, paid placement, or approval guarantees. Provider booking
stays external through the provider's website, phone, WhatsApp, email, or
custom CTA. BNA stores first-party review/request records and publishes only
approved listings.

## AI Provider Mode

OpenAI is the normal preferred hosted AI provider. Kimi is the temporary
primary provider when `BNA_AI_PRIMARY_PROVIDER=kimi`; this keeps chat/content AI
working while OpenAI credentials are unhealthy. Codex remains the development
agent and task owner either way.

Provider variables:

```powershell
BNA_AI_PRIMARY_PROVIDER=openai   # set to kimi for the temporary Kimi-primary mode
KIMI_API_KEY=
KIMI_BASE_URL=https://api.moonshot.ai/v1
KIMI_MODEL=kimi-k2.6
```

The historical `npm run openai:smoke` script now smokes the selected hosted AI
provider. When `BNA_AI_PRIMARY_PROVIDER=kimi`, it uses Kimi chat completions and
records the provider in the smoke report. `npm run openai:diagnose` remains a
specific OpenAI-key diagnostic and may still fail while Kimi-primary mode is in
use.

## OpenAI Key Loading

Local OpenAI diagnostics use `npm run openai:diagnose`. The script checks only
safe metadata and never prints keys. It compares:

- `process.env.OPENAI_API_KEY`
- `.secrets/openai-api-key.txt`
- `.env.local` entry metadata
- Railway variable metadata when the Railway CLI/token is available

It reports source, length, SHA-256 fingerprint prefix, quote/newline/CR/BOM
normalization, base URL presence, org/project variable presence, `/v1/models`
status, and a minimal Responses API smoke.

Expected variables:

```powershell
OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4.1-mini
OPENAI_PROJECT=
OPENAI_ORG=
```

## Local Run

```powershell
npm install
node --check server.js
npm test
npm start
```

The normal app runs on the port provided by `PORT` or the app default.

## Connectors

- Railway/Postgres: production hosting and current operations database
- Buffer: social scheduler connector for Facebook, LinkedIn, and YouTube
- Whapi/WAPI: WhatsApp connector
- Gmail/Google APIs: office email, Drive, Classroom, Calendar, Docs/Sheets
- Green Invoice/payment links: payment reconciliation connector
- Provider-owned systems: external delivery/booking CTAs unless explicitly
  integrated

## PWA Manifests

- Public website: `/manifest.json`
- Parent portal: `/parent-manifest.json`
- Operations/admin: `/operations-manifest.json`

Public and parent installs must not launch private Operations.

## Release Checklist

Run before deploy unless the operator explicitly approves a narrower check:

```powershell
node --check server.js
npm test
npm run openai:diagnose
npm run openai:smoke
npm run railway:doctor
npm run app:smoke
```

After deploy, rerun Railway doctor and live smoke. Do not mark app-visible work
Done after local verification only.

## Source Of Truth

- `AGENTS.md`: agent operating rules and workflow behavior
- `MEMORY.md`: durable BNA facts, requirements, preferences, and definitions
- `TASKS.md`: current work queue and visible next actions
- `SYSTEM-STATE.md`: verified live system state and deployment notes
- `PROJECT-NOTES.md`: local migration notes and technical caveats
- `ops/agent-changelog.md`: completed agent work and verification trail
- `ops/agent-task-ledger.jsonl`: append-only task trail
- `tasks-pending/*.md`: internal Codex handoff briefs
