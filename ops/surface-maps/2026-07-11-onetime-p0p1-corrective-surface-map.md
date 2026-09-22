# Surface Map - One Time P0/P1 Corrective

Raw ID: `RAW-20260711-001`
Workspace: `rabbi_sheller_provider`
Project: `one_time_mishnah_class`

## Routes

- `/operations`
- `/operations/agents/runs/:runKey`
- `/operations.html`
- `/provider.html?review=one-time`
- `/one-time`
- `/one-time/mishnayos`
- `/one-time/interest`
- `/one-time-preview`
- `/one-time-onboarding`
- `/api/one-time/interest`
- `/api/one-time/mishnah/onboarding`
- `/api/bna/crm/contacts`
- `/api/bna/crm/contacts/:contactId`

## Query Params

- Operations: `workspace`, `project`, `view`, `section`, `readonly`, `view_as`.
- Landing/onboarding: `audience`, `source`, `lead_hint`, `product_lead_id`, `crm_lead_id`, UTM params.
- Provider review: `review=one-time`, `admin_provider=one-time`, `section`.

## View Classes

- `PUBLIC_MARKETING`
- `RABBI_PROVIDER_ADMIN`
- `SHLOIMIE_PLATFORM_SUPPORT`
- `MEMBER_PARENT_PORTAL`
- `STUDENT_PORTAL`
- `INTERNAL_AGENT_SUPPORT`

## Visible Nav And Rails

- Operations owner shell: shared left sidebar, One Time module rail, subsection rail, contacts/CRM, communications, content, live class, calendar, tasks, settings.
- Public landing: compact header, Rabbi Eli, What He'll Gain, What You Receive, How It Works, Who It's For, Sign Up Now, Member Login.
- Onboarding: family branch, school branch, no checkout/access/send promise.

## Major Renderers And Files

- `public/operations.html`: source artifact for generated Operations shell.
- `scripts/split-operations-shell.mjs`: generated bootstrap/CSS/JS/deferred JS extraction.
- `public/operations-bootstrap.html`: canonical `/operations` HTML.
- `public/js/operations-shell.js`: main generated shell.
- `public/js/operations-deferred-renderers.js`: deferred generated shell renderers.
- `public/css/operations-shell.css`: generated shell CSS.
- `public/js/bna-bot-widget.js`: universal assistant/Robot Scheller launcher.
- `public/one-time/index.html`: public landing and signup modal.
- `public/one-time-preview.html`: existing continuation page to convert to real onboarding.
- `config/service-provider-sites/one-time.json`: public site contract.
- `src/platform/instances/one-time-rabbi-dashboard-ia.js`: One Time IA source.
- `src/lib/bna/crm-contact-model.js`: canonical CRM contact DTO/filter/timeline helpers.

## Server And API Endpoints

- `sendOperationsShell` in `server.js` sends `public/operations-bootstrap.html`.
- `requireAdmin` gates `/operations`.
- `/api/one-time/interest` creates product/CRM lead and must suppress external notifications in this corrective path.
- `/api/one-time/mishnah/onboarding` stores local review/onboarding records and must remain no-send/no-checkout/no-access.
- `/api/bna/crm/contacts` and contact timeline endpoints power first-party CRM.

## Registry And Smoke Targets

- `ops/route-registry.json`
- `ops/action-registry.json`
- `scripts/smoke-onetime-operations-crm-workbench-local.mjs`
- `scripts/smoke-onetime-provider-crm-layout-local.mjs`
- new Operations generated artifact drift check.

## Support/Admin Diagnostics

Super Admin-only surfaces include Watchdog, Agents, Intake/raw keys, TEST review, platform diagnostics, assistant control center, and release/deploy tooling. Normal Rabbi owner mode must hide or block these unless explicitly in Shloimie/platform support view.

## External Provider Setup Points

Email, Stripe/payment, DNS, Zoom, Vimeo, Drive, WhatsApp/WAPI, Telegram, access grants, historical imports, and production deploy are blocked unless separately approved and audited. This corrective packet can create local no-send records and blocked action states only.
