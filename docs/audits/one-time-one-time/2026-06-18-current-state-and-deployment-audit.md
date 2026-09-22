# One Time One Time Current-State And Deployment Audit

Date: 2026-06-18

Scope: read-only architecture and product audit for One Time One Time / Rabbi Ellie Scheller inside the current BNA workspace. The repository evidence mostly spells the provider as "Rabbi Elie Scheller" and sometimes "Rabbi Sheller/Scheller"; this audit preserves that repository reality and treats those as aliases unless noted.

Method: local file/code inspection, Git inspection, read-only Railway CLI metadata using the existing project token workflow, official Railway pricing documentation, and one attempted read-only database metadata transaction. No implementation, migration, deploy, DNS, Zoom, Vimeo, billing, credential, or Git remote changes were made.

## 1. Executive Summary

Confirmed fact: One Time One Time is present in this workspace, but not as an independent application repository. It is currently represented as a project/workspace/provider implementation inside the BNA Express/Postgres/Railway app:

- Project key: `one_time_mishnah_class`.
- Workspace key: `rabbi_sheller_provider`.
- Provider/person references: Rabbi Elie Scheller / Rabbi Sheller / Rabbi Scheller.
- Public/preview surfaces: `/rabbi`, `/one-time-preview`, `/one-time`, `/member-library`, `/one-time-classroom`.
- Admin/provider surfaces: `/operations` with scoped One Time access, `/provider`, and `/api/bna/one-time/*`.

Evidence:

- `server.js:331` defines `ONE_TIME_PROJECT_KEY = 'one_time_mishnah_class'`.
- `railway-migration-2026-06-05-one-time-projects.sql:93` seeds the One Time project.
- `README.md:115` names "Rabbi Sheller / One Time" as the first external provider workspace.
- `server.js:64768` through `server.js:65974` implement One Time admin/member/classroom APIs.
- `server.js:68191` implements the public Rabbi checkout endpoint.
- `server.js:73567` through `server.js:73589` serve the public One Time preview/Rabbi/member-library pages.

Recommendation: Option B - shared codebase, separate client deployment. Keep One Time in the BNA/My Academy codebase for reuse, but move the client production runtime toward a separate Railway project/service and separate production database/storage boundary before treating it as production-safe for children, billing, Zoom/Vimeo, and client-owned handoff.

Why not Option A now: the code is partially multi-tenant and has many project/workspace guards, but there is no verified database row-level security audit, no confirmed host-to-tenant resolver, and the current production service is shared with BNA school/child data. Shared production can become viable only after tenant isolation is proven end-to-end.

Why not Option C now: a separate repo would maximize ownership isolation, but it would duplicate a large amount of still-moving platform code and increase divergence risk before the product is stable.

Largest unresolved blockers:

1. Which party owns the One Time production assets: Rabbi, My Academy/BNA, or agency-operated client infrastructure?
2. Is the current Railway service/database the intended production target for One Time, or only the BNA platform production target?
3. What exact One Time domain/subdomain, sender domain, Zoom account, Vimeo account, and payment processor account will be used?
4. Can all One Time reads/writes be proven tenant-scoped at the database and background-job level, not only the UI level?
5. What is the live Railway billing/resource baseline and the incremental cost tolerance for a separate client deployment?

## 2. Repository And Workspace Identification

Confirmed repository root inspected: `C:\Users\User\BNA v2.0`.

Current working directory: `C:\Users\User\BNA v2.0`.

Repository identity:

- Folder name: `BNA v2.0`.
- Package name: `bna-website` (`package.json:2`).
- Package description: `Bnei Nevi'im Academy Website` (`package.json:4`).
- Main entry: `server.js` (`package.json:5`).
- Git remote: `origin https://github.com/shloimie-beep/bnei-neviim-academy.git`.

Current branch: `codex/operations-ui-audit-harness`.

Relevant branch evidence:

- Current branch head: `efdfa5d docs: add BNA ramble execution protocol`.
- Local `master`: `484563b`, ahead of remote in the inspected workspace.
- Remote `origin/master`: `05d8288 WIP: Codex changes - AI mode toggle, OpenAI/Codex buttons, natural responses, Rabbi Elie setup`.
- Remote One Time related branch found: `origin/codex/one-time-integrations-access-audit-2026-06-16`.
- Other work branches include `codex/operations-ui-audit-harness-clean`, `codex/ramble-to-done-protocol`, and release/cleanup branches.

Worktrees:

- `C:/Users/User/BNA v2.0` on `codex/operations-ui-audit-harness`.
- `C:/Users/User/BNA-ops-audit-publish` on `codex/operations-ui-audit-harness-clean`.
- `C:/Users/User/BNA-protocol-pr-worktree` on `codex/ramble-to-done-protocol`.
- `C:/Users/User/bna-release-clean` on `release/operations-parent-student-action-registry-2026-06-11`.

Uncommitted/untracked state:

- Confirmed large mixed dirty worktree with many modified tracked files and many untracked generated/audit/task/deploy artifacts.
- Important inference: the local workspace contains code and documentation that may not be pushed. Do not assume `origin/master` equals the current local application.
- Evidence command: `git status --short --branch --untracked-files=all`.

Nested repositories:

- No nested `.git` directories were found under the inspected root.

Sibling applications/directories:

- Nearby BNA-related directories include `BNA-Keyholder`, `bna-ops-audit-checkout`, `BNA-ops-audit-publish`, `BNA-protocol-pr-worktree`, and `bna-release-clean`.
- No nearby independent One Time application repository was found during local inspection.

Monorepo/package layout:

- No active `turbo.json`, `pnpm-workspace.yaml`, `src/app` app, or Next.js app appears to be the live app.
- The live app is a single Node/Express/static app (`server.js`, `public/*`, `src/lib/*`).
- The old React/Next/Supabase app is archived under `docs/archive/` and is not the live Operations app per `README.md:69` and repository operating instructions.

Environment variable names:

- `.env.example` declares app, auth, Railway, Google, Stripe, Resend, Buffer, Zoom, Vimeo, and One Time/Rabbi variables (`.env.example:5-254`).
- Local `.env.local` contains names including `DATABASE_URL`, `OPS_USERNAME`, `OPS_PASSWORD`, `ONE_TIME_OPS_USERNAME`, `ONE_TIME_OPS_PASSWORD`, `OPENAI_API_KEY`, `KIMI_API_KEY`, `RESEND_API_KEY`, Telegram variables, and legacy Supabase variable names. Values were not printed.

Database metadata:

- The app uses `pg` (`package.json:120`) and many PostgreSQL migrations at repository root.
- A read-only metadata connection attempt using local `DATABASE_URL` failed due DNS resolution. Therefore live database rows/counts are not verified in this audit.
- Do not treat `.env.local` legacy Supabase variable names as current app architecture without a fresh database/deployment verification.

## 3. Evidence This Is The Correct My Academy/BNA Implementation

Confirmed facts:

- The current app identifies itself as BNA, not a separate One Time repo (`package.json:2-5`, `README.md:1-5`).
- The README describes BNA v2.0 as the live Express/Postgres/Railway operating system for Bnei Neviim Academy (`README.md:1-5`).
- The README explicitly names "Rabbi Sheller / One Time" as the first external provider workspace, separated from BNA Academy parents/students unless a person is enrolled in both scopes (`README.md:105-117`).
- The canonical One Time database work is identified as `railway-migration-2026-06-05-one-time-projects.sql` (`README.md:119-122`).
- The route/API implementation has many One Time-specific constants, schema objects, and routes (`server.js:331`, `server.js:64768-65974`, `server.js:68191-68424`).

Strong inference:

- "BNA" is the repository and current internal application/deployment identity.
- "My Academy" may be an intended public platform/agency brand, but the active code inspected here does not establish "My Academy" as the deployed application name. This remains an operator/client naming decision.

Unknown:

- The external GitHub repository `sdratler/OneTimeOneTime` was not used as source of truth because no evidence in this workspace points to it as the active implementation.

## 4. How One Time One Time Currently Exists In The System

Current representation:

- Project/tenant-like record: `one_time_mishnah_class`.
- Workspace/provider scope: `rabbi_sheller_provider`.
- Provider directory seed: Rabbi Elie Scheller as revenue-share/service-provider-style workspace.
- Public/preview pages and APIs: One Time landing, product funnel, member library, classroom, interest/onboarding.
- Admin/provider APIs: class/session management, library approval/publish, classroom assignments, message review, product system, checkout/access admin.
- Imported historical app reference: `docs/imports/2026-06-12-onetimeonetime-streaming-app-export.md` contains an Expo/React Native export that targeted `https://onetimeonetime.com`, but it is documentation/import material, not the live BNA Express app (`docs/imports/2026-06-12-onetimeonetime-streaming-app-export.md:1-45`).

Evidence:

- One Time project seeded with aliases and preferred Sefaria lookup (`railway-migration-2026-06-05-one-time-projects.sql:93-98`).
- One Time project members include Shloimie and Rabbi Elie Scheller (`railway-migration-2026-06-05-one-time-projects.sql:118-128`).
- One Time public landing seeded at `/rabbi` with preview status and public replacement blocked (`railway-migration-2026-06-15-rabbi-checkout-access.sql:437-470`).
- One Time product system seeds draft funnels `/one-time`, `/one-time/us`, `/one-time/uk`, `/one-time/israel` (`railway-migration-2026-06-16-one-time-product-system.sql:285-311`).
- Public page routes include `/preview/one-time-mishnah`, `/one-time-preview`, `/rabbi`, and `/member-library` (`server.js:73567-73589`).

Classification:

- Active production logic: `server.js`, `public/rabbi.html`, `public/js/rabbi-launch.js`, `public/member-library.html`, `public/provider.html`, `public/operations.html`, One Time migrations.
- Configuration/seed data: One Time project, workspace, tiers, funnels, provider profile, readiness maps.
- Test/audit/history: `ops/audits/*`, `tasks-pending/*`, `docs/imports/*`, `docs/archive/*`.
- Separate One Time branch/directory: no active separate app directory found.

## 5. Current Technology Stack

Confirmed:

- Runtime: Node.js / Express (`package.json:116-121`, `server.js`).
- Frontend: static HTML/JS/CSS under `public/*`.
- Database: PostgreSQL through `pg` and SQL migrations (`package.json:120`, root `railway-migration-*.sql`).
- Deployment: Railway CLI/local upload workflow targeting project/service `skillful-motivation`.
- Integrations present in code: Google APIs, Stripe, Resend, Buffer, Zoom, video/Vimeo-style hosting, Telegram bridge, Remotion video tooling.
- Testing/QA: Node test runner, Playwright, Lighthouse, many smoke/watchdog scripts (`package.json:7-114`).

Deployment files:

- `railway.json:1-5` declares Railway schema and Nixpacks builder.
- `Dockerfile:1-7` also exists and starts `node scripts/railway-start.mjs`.
- `scripts/railway-start.mjs:13-22` selects web, academy Telegram, or Rabbi Telegram process by `BNA_RAILWAY_PROCESS`.
- `scripts/railway-redeploy.ps1:77-228` builds `.deploy-railway` and uploads via `railway up`.

Conflict/unknown:

- README says Railway starts `node server.js` (`README.md:3-5`), while `package.json:7` and `Dockerfile:7` point to `scripts/railway-start.mjs`, which then starts `node server.js` for the web process (`scripts/railway-start.mjs:13-15`). Functionally compatible, but documentation should be tightened later.
- Actual Railway builder/source config cannot be fully proven without dashboard metadata. Local config shows Nixpacks and Dockerfile both present.

## 6. Current Tenancy Model

Classification: partially multi-tenant, provider-scoped, project-scoped, and workspace-scoped. It is not yet proven safe as a fully isolated multi-tenant SaaS for children and client billing.

Confirmed tenancy mechanisms:

- Project keys: `bna`, `one_time_mishnah_class`, and compatibility project/workspace functions (`server.js:331`, `server.js:32152-32158`).
- Scoped Operations users: One Time owner/manager credentials map to `scope: { type: 'project', projectKey: ONE_TIME_PROJECT_KEY }` (`server.js:8219-8284`).
- Scoped path allowlist restricts project-scoped Operations identities to selected routes (`server.js:8290-8335`).
- Project/workspace scoped tables include `bna_projects`, `bna_project_branding`, `bna_workspace_settings`, `bna_connector_settings`, `bna_automations`, `bna_classes`, `bna_class_sessions`, `bna_live_class_sessions`, `bna_curriculum_units`, `bna_community_threads/messages`, `bna_members`, and One Time library/question review tables (`server.js:9843-10529`, `server.js:12543-14795`).
- One Time class/library admin routes call One Time access checks and project filters (`server.js:64768-65268`).

Answers to tenancy questions:

| Question | Current answer |
|---|---|
| Can a new client be created without changing application code? | Partially. There are project/workspace/provider tables, but One Time still has many hard-coded constants and routes. |
| Can each client have distinct branding? | Partially. `bna_project_branding` exists (`server.js:9743-9757`) and One Time has branded pages, but host-based branded shell is not proven. |
| Can each client use its own domain? | Not proven. No active host-header tenant resolver was found. |
| Can each client have separate users/classes/videos/billing/integrations? | Partially. Tables and connector settings are scoped, but separate runtime/database/credential isolation is not proven. |
| Are all database queries tenant-scoped? | Unknown/no. Many new routes apply project filters, but a full query-by-query audit and DB RLS audit was not performed. |
| Can one provider ever see another provider's data? | Unknown. App-layer guards reduce risk, but no database-enforced isolation was verified. |
| Are scheduled jobs/webhooks tenant-aware? | Partially. Some jobs include `project_key`; webhook and background behavior need a dedicated audit. |
| Are file-storage paths tenant-aware? | Partially. One Time Drive/social maps exist, but storage provider/domain ownership is unresolved. |
| Are AI/search indexes tenant-aware? | Not proven. Helper retrieval exists, but no vector/embedding tenant boundary was found. |
| Is the model safe for children and parent information? | Not yet production-proven. It has privacy gates, but requires tenant, portal, recording, transcript, and access-code hardening before broad production use. |

Missing/implicit isolation:

- No confirmed database row-level security policies were found in the inspected code/migrations.
- Some frontend and Operations modules historically used selected workspace filters; recent task notes say many were repaired locally but deploy/live proof is blocked by dirty-worktree concerns (`tasks-pending/2026-06-18-mobile-operations-workspace-audit.md:155-159`).
- Public member/library access relies on access codes and token flows; this may be acceptable for preview but should be hardened before child/member production.
- Host/domain-to-tenant mapping is not implemented as a central resolver.

## 7. Existing Feature Inventory

| Feature | Status | Evidence |
|---|---|---|
| Core Express app | Production app exists | `package.json:7`, `server.js`, `README.md:57-71` |
| Operations/admin auth | Implemented but scoped/basic | `server.js:8219-8335`, `server.js:9528-9594` |
| One Time owner/manager login | Implemented in env-configured form | `server.js:2415-2416`, `server.js:8240-8284`, `.env.example:34-53` |
| Parent portal | Implemented broad BNA portal, One Time specificity incomplete | `server.js:47661-50478` |
| Student portal | Implemented broad BNA/student portal with One Time question hooks | `server.js:46856-47553`, `server.js:47480` |
| Provider/Rabbi portal | Implemented provider portal and class-media workflow, incomplete external integrations | `public/provider.html:691-1315`, `server.js:41288-43296` |
| Client/project branding | Implemented schema and One Time page preview; host-branded auth not proven | `server.js:9743-9757`, `railway-migration-2026-06-15-rabbi-checkout-access.sql:437-470` |
| Classes/curriculum | Implemented schema plus One Time seed; live product schedule is draft/admin-only | `server.js:12543-14795`, `railway-migration-2026-06-16-one-time-product-system.sql:348-403` |
| Member library | Implemented but should be considered guarded/preview until access policy is finalized | `server.js:65867-65875`, `server.js:68360-68401`, `public/member-library.html` |
| Classroom/community | Implemented with moderation/review controls | `server.js:65646-65974`, `server.js:10429-10498` |
| Billing/checkout | Implemented but incomplete/guarded | `railway-migration-2026-06-15-rabbi-checkout-access.sql:1-120`, `server.js:68191-68282` |
| Stripe webhook | Implemented route exists; full production idempotency not verified | `server.js:9621` |
| Zoom | Readiness/preview implemented; live meeting creation blocked | `server.js:39166-39192` |
| Vimeo/video hosting | Readiness/upload preview implemented; live uploads blocked | `server.js:39194-39245` |
| Attendance | Tables exist; Zoom join/leave tracking not verified | `server.js:12543-12584`, `server.js:13986-14036` |
| Badges/gamification | Tables exist | `server.js:14296-14585` |
| Recording/transcript pipeline | Content/class transcript schemas and parsers exist; publishing workflow incomplete | `server.js:13555-13623`, `server.js:53080-53224` |
| Sefaria/source lookup | Implemented helper functions, but review/publication workflow is guarded | `server.js:5795-6086`, `server.js:18950-18965` |
| AI helper/provider | Implemented provider selection; OpenAI/Kimi variables | `.env.example:82-104`, `server.js:2585-2631` |
| Vector embeddings | Missing/not found as production implementation | Search found future/planned references, not a deployed vector DB |

## 8. Existing Class Structure

The owner statement that the class structure exists is supported. Current model:

- `bna_projects` holds the One Time project.
- `bna_classes`, `bna_class_members`, `bna_class_attendance` provide class/member/attendance foundations (`server.js:12543-12584`).
- `bna_class_sessions` stores class session media/transcript/summary fields (`server.js:13606-13623`).
- `bna_live_class_series`, `bna_live_class_sessions`, and `bna_live_class_attendance` handle live-class scheduling, Zoom fields, recording fields, and attendance (`server.js:13834-14036`).
- `bna_curriculum_units` adds curriculum hierarchy for curriculum/seder/masechta/perek/lesson/unit and links assignments, schedule items, community threads, and question reviews (`server.js:14658-14795`).
- Six Sedarim are seeded for One Time under workspace `rabbi_sheller_provider` / project `one_time_mishnah_class` (`server.js:14768-14795`).
- Product schedule seed creates a draft 7:00 PM Israel Mishnayos class (`railway-migration-2026-06-16-one-time-product-system.sql:348-403`).

Status:

- Class/session/curriculum schema: implemented.
- Recurring class/live schedule: implemented as draft/admin-only.
- Masechtos/Perakim/Mishnayos detail: partial. Hierarchy supports it, but the inspected seed only proves six Sedarim and draft schedule, not a complete loaded Mishnayos curriculum.
- Enrollment/capacity: partial. Provider service seed includes capacity 12 and age range, but live enrolled membership counts were not verified (`server.js:23712-23865`).
- Progress/chazarah: partial through courses, assignments, worksheets, gamification, and student progress tables (`server.js:14296-14585`).
- Time zones: implemented in live/session schemas and One Time product schedule (`server.js:13952`, `railway-migration-2026-06-16-one-time-product-system.sql:358-365`).

## 9. Existing Parent Portal

Confirmed:

- Parent portal login/session/routes exist (`server.js:47661-50478`).
- Parent portal exposes student progress, activity, worksheets, questions, shoutouts, help, provider messages, student login/account/access code management, meeting recordings, chat, and notification/question responses.
- Parent help route requires a parent session and validates the student belongs to the parent before creating support/comms artifacts (`server.js:48954-49187`).

One Time status:

- Broad parent portal foundation is implemented.
- One Time-specific parent experience, billing visibility, invoices, payment management, consultation booking, and branded domain/auth were not proven production-ready.
- Parent/provider messages exist, but exact Rabbi-specific parent workflow needs live smoke and policy review.

Classification: implemented but incomplete for One Time production.

## 10. Existing Student Portal

Confirmed:

- Student login/session/routes exist (`server.js:46856-47553`).
- Student portal supports goals, checkoffs, messages to parent/Rabbi, assistant messages, questions, course-question answers, and worksheet submissions.
- Student question/course question flow references One Time project in relevant query (`server.js:47480`).
- Student portal UI contains calendar, Mishnah community, assignment/video/doc and Hebrew label surfaces (`public/student.html` references from local inspection).

One Time status:

- Next class/calendar/Zoom/current Masechta/video library/assignments/review/badges/community/private Rabbi feedback are partially represented through shared tables and One Time hooks.
- Live Zoom access, personalized join links, video entitlement checks, and child-safe transcript/video publication are not production-proven.

Classification: implemented but incomplete.

## 11. Existing Provider Portal

Confirmed:

- Provider workspace route `/provider` is served (`server.js:73554`).
- Provider portal includes entitlements and class media UI (`public/provider.html:691-1315`).
- Class media workflow explicitly creates internal One Time review lanes only and avoids upload/publish/send/checkout/access/Drive/video-host/social writes (`public/provider.html:1315`).
- Provider profile/service/class APIs exist and are provider-scoped (`server.js:41288-43296`).
- One Time provider workspace maps to `rabbi_sheller_provider` (`server.js:43295`).

Status:

- Provider/Rabbi class management: implemented but external integrations are not live.
- Attendance/curriculum/recordings/weekly updates/parent communication/student feedback/community moderation: partial across Operations/provider APIs.
- Availability/appointments: not production-ready.

Classification: implemented but incomplete.

## 12. Existing Admin Portal

Confirmed:

- Operations/admin route `/operations` requires admin auth (`server.js:73623`).
- Active Operations dashboard is `public/operations.html`, not archived Next/Supabase (`README.md:69-71`).
- Operations API surface includes tasks, decisions, workspace settings, provider setup, integrations, content jobs, class sessions, One Time classes/library, product system, checkouts, access grants, members, live sessions, question moderation, automations, communications, and settings.
- One Time admin routes include readiness, class CRUD, asset/package/member preview, approval, publish, rollback, classroom, assignments, threads, message review, product system, checkout admin, members, grants, live sessions, and question moderation (`server.js:64768-69595`).

Status:

- Admin portal is the most complete surface.
- Some controls are intentionally guarded, preview-only, dry-run, or require approval.
- Broad Operations module scoping has local-verified repairs but deploy/live proof is blocked by dirty-worktree/scope-safe deploy concerns (`tasks-pending/2026-06-18-mobile-operations-workspace-audit.md:155-159`).

Classification: implemented but not fully hardened.

## 13. Existing Automations

Confirmed:

- `bna_automations` and `bna_automation_runs` exist with scope fields (`server.js:9874-10012`).
- Automation center migration seeds One Time automation-related rows (`railway-migration-2026-06-15-automation-center.sql:245-256`).
- Package scripts include agent fleet, watchdogs, smokes, queue audit, task reconcile, and live smoke commands (`package.json:69-96`).

Status:

- Automation framework exists.
- One Time automation posture is guarded; many live sends, external writes, billing, Zoom/Vimeo, and social posting actions require approval/configuration.

Classification: implemented but incomplete/guarded.

## 14. Existing Billing

Confirmed:

- `bna_product_tiers`, `bna_payment_provider_settings`, `bna_checkout_records`, `bna_members`, and access grant structures exist (`railway-migration-2026-06-15-rabbi-checkout-access.sql:1-120`).
- Seeded active launch tiers include Video Library at 6700 cents/month and Live + Library at 14900 cents/month (`railway-migration-2026-06-15-rabbi-checkout-access.sql:321-359`).
- Draft planning tiers include candidate prices such as 50, 67, 100, 149, 150, and 300+ with `checkout_enabled:false` metadata (`railway-migration-2026-06-15-rabbi-checkout-access.sql:361-408`).
- Payment provider settings for Stripe and Green Invoice are seeded disabled/secret-not-configured (`railway-migration-2026-06-15-rabbi-checkout-access.sql:410-435`).
- Public Rabbi checkout endpoint exists and blocks if provider configuration is missing; it can create Stripe sessions or return payment links when configured (`server.js:68191-68282`).
- Manual admin checkout override can create a member, checkout, payment event, and access grant (`server.js:67550-67631`).

Gaps:

- $67 membership is present as a planning candidate/preferred candidate, not the proven production public price.
- Stripe/Green Invoice live credentials and payment links are unresolved.
- Failed payments, grace periods, cancellations, refunds, entitlement revocation, and webhook idempotency need focused audit/proof.
- Billing ownership and account owner are not decided.

Classification: implemented but incomplete/guarded.

## 15. Existing Vimeo Integration

Confirmed:

- Vimeo/video metadata fields exist on class sessions and member library items (`server.js:13667-13731`, `server.js:13760-13790`).
- Member library can expose Vimeo-backed class items (`public/member-library.html`, `server.js:68360-68401`).
- Video hosting readiness and upload-preview endpoints exist; upload is blocked/preview-only (`server.js:39194-39245`).
- Environment names include `VIMEO_ACCESS_TOKEN` and `VIMEO_PLAN` (`.env.example:253-254`).

Unknown/gaps:

- Account owner, token validity, upload permissions, private/domain embed settings, folders, deletion, webhooks, and current owner of existing uploaded videos were not verified.
- No live Vimeo upload or domain whitelist change was performed.

Classification: implemented but incomplete/blocked pending provider account access.

## 16. Existing Zoom Integration

Confirmed:

- Zoom integration module is required (`server.js:89`).
- Zoom readiness/status, meeting-preview, and meetings endpoints exist (`server.js:39166-39192`).
- Environment names include `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`, `ZOOM_ACCOUNT_OWNER`, `ZOOM_HOST_USER`, and `ZOOM_SCOPES` (`.env.example:245-250`).
- Live session schema stores Zoom meeting URL/id and link state (`server.js:13930-13957`).

Unknown/gaps:

- OAuth/server-to-server app, account ownership, meeting creation, recurring meetings, registration, personalized join links, passcodes, waiting rooms, attendance import, participant webhooks, recordings, transcripts, summaries, webhook verification, retry handling, and host permissions were not production-verified.

Classification: implemented but incomplete/blocked pending Zoom access and approval.

## 17. Existing Attendance And Badges

Confirmed:

- Class attendance table exists with present/late/absent/excused/unknown style attendance status (`server.js:12543-12584`).
- Live class attendance table exists (`server.js:13986-14036`).
- Gamification tables include courses, enrollments, lessons, worksheets, submissions, badges, gamification events, student badges, references, and parent/student links (`server.js:14296-14585`).

Gaps:

- Zoom join/leave tracking, reconnect handling, lateness calculation, manual correction workflow, excused absence workflow, badge award policy, streaks, and parent-facing explanations require focused QA.
- Idempotency for attendance/gamification events is not proven in this pass.

Classification: schema implemented, product workflows incomplete.

## 18. Existing Community Functionality

Confirmed:

- Learning community, community member, thread, and message tables exist (`server.js:10429-10498`).
- One Time classroom/admin APIs support classroom data, assignment creation, threads, and message review (`server.js:65646-65858`).
- Public/member classroom routes expose member-safe data via access code and hide internal fields (`server.js:65867-65888`).
- Member responses insert hidden/moderated community messages and route through screening/moderation (`server.js:65894-65958`).
- Classroom bot endpoint is disabled pending approval (`server.js:65967-65974`).

Status:

- Announcements/public threads/cohort discussions/private questions/moderation/anonymized publication are partially implemented.
- Edit history/deletion history and student-to-student messaging were not proven.

Classification: implemented but incomplete/guarded.

## 19. Existing Recording/Transcript Pipeline

Confirmed:

- Content jobs store source media, transcript text/json, status, and metadata (`server.js:13555-13575`).
- Class sessions store transcript and summary fields (`server.js:13606-13623`).
- Recording-intake parsing route exists and requires transcript text (`server.js:53080-53140`).
- One Time class media/assets, package preview, member preview, approval, and publish routes exist (`server.js:64854-65268`).
- Workflow documentation in `server.js` describes recording and source-sheet approval gates and explicitly blocks automatic public/member posting without approval (`server.js:1195-1394`).

Gaps:

- Zoom recording ingestion, automatic transcription, speaker mapping, privacy classification, Vimeo transfer, Rabbi approval, searchable transcript publication, embedding/vector storage, and per-audience knowledge boundaries are not production-complete.

Classification: implemented foundations, incomplete production pipeline.

## 20. Existing AI And Sefaria Functionality

Confirmed:

- AI provider selection supports OpenAI/Kimi variables (`.env.example:82-104`, `server.js:2585-2631`).
- Public helper retrieval module is required (`server.js:94`).
- Sefaria source search helpers exist: Sefaria URL builder, text search, and question enrichment (`server.js:5795-6086`).
- Torah research/source sheet prompt guidance references official Sefaria links and source-sheet style output (`server.js:18950-18965`).

Not found:

- No production vector database, embeddings table, or tenant-aware embedding index was confirmed.
- No approved automatic psak/halacha answer publication path was found; source suggestions are marked for review.

Classification: AI/Sefaria foundations implemented; vector/retrieval production layer missing or unproven.

## 21. Railway Topology

Confirmed via read-only CLI and repo config:

- Railway CLI version: `4.33.0`.
- Railway project visible through project token: `skillful-motivation`.
- Railway environment: `production`.
- Target service status: service `skillful-motivation`, deployment `ca0075c2-5ce1-4a70-b6c8-e8d2c116adae`, status `SUCCESS`.
- Recent deployments show one successful deployment on 2026-06-17 21:28:52 +03:00 and several removed earlier deployments.
- `railway status` shows `Service: None` for the local link, while deploy scripts explicitly target `--service skillful-motivation --environment production` (`scripts/railway-redeploy.ps1:65-72`, CLI output).
- No buckets found in environment `production` via `railway bucket list --environment production`.
- Project-wide `railway project list` was unauthorized with the project token, so workspace-level project list, billing, and all services cannot be audited from CLI.

Repo deployment flow:

- `package.json:19-20` exposes `railway:doctor` and `railway:redeploy`.
- `scripts/railway-doctor.ps1:66-77` defaults service to `skillful-motivation` and environment to `production`.
- `scripts/railway-redeploy.ps1:77-228` builds a local `.deploy-railway` bundle and uploads it via `railway up -d --service skillful-motivation --environment production`.

Unknown:

- Railway workspace owner/name.
- Whether GitHub auto-deploy is configured.
- Exact source repo/branch in Railway dashboard.
- Custom domains and Railway-provided domain.
- Health checks/restart policies/regions/replicas/cron/workers/databases/Redis/volumes/resource usage.
- Variable names in Railway. Variable values were intentionally not inspected.

Classification: currently one confirmed Railway project/service deployment for BNA/One Time combined; broader topology unclear.

## 22. Current Domains And Deployment Flow

Confirmed:

- Current BNA public domain appears in docs/smokes as `bneineviimacademy.org` (`README.md`, `ops/system-audits/2026-06-08-full-system-audit.md:56`, `ops/agent-task-ledger.jsonl` entries).
- One Time imported app export targeted `https://onetimeonetime.com` (`docs/imports/2026-06-12-onetimeonetime-streaming-app-export.md:5`, `docs/imports/2026-06-12-onetimeonetime-streaming-app-export.md:433`).
- Current BNA app serves One Time preview routes under the BNA app path rather than a verified One Time custom domain (`server.js:73567-73589`).

Not proven:

- Host-header based tenant resolution.
- Domain-to-project mapping table.
- Client-specific cookie/CORS/OAuth/Stripe/Zoom/Vimeo callback routing.
- Railway custom-domain status.
- One Time SSL/DNS ownership.

Deployment flow:

1. Local repo/worktree is bundled into `.deploy-railway`.
2. Deploy script copies `server.js`, `public`, `src`, `scripts`, selected `ops`, `tasks-pending`, migrations, docs, package files, Dockerfile, and Railway config.
3. Deploy script uploads current local code to Railway service `skillful-motivation`.
4. This means the dirty local workspace matters materially; deploys may contain local uncommitted changes.

Evidence: `scripts/railway-redeploy.ps1:77-228`.

## 23. Railway Cost Model

Pricing source reviewed on 2026-06-18:

- Official Railway pricing: https://railway.com/pricing
- Railway pricing FAQ: https://docs.railway.com/pricing/faqs
- Railway cost control docs: https://docs.railway.com/pricing/cost-control

Confirmed current official pricing facts:

- Railway bills by plan subscription/minimum plus resource usage.
- Hobby shows `$5 minimum usage`; Pro shows `$20 minimum usage`; Free has trial/free limits. Exact account bill depends on usage.
- Resource usage includes memory, CPU, storage, and egress.
- Railway FAQ says exact app cost cannot be quoted without running and checking estimated usage.
- Cost controls include usage limits, resource limits, private networking, and serverless/auto-sleeping controls where applicable.

Account-specific values:

- Current account plan: UNKNOWN - REQUIRED FOR FINAL COST.
- Current monthly usage: UNKNOWN - REQUIRED FOR FINAL COST.
- Database/service/bucket/volume usage: UNKNOWN - REQUIRED FOR FINAL COST.
- Existing shared baseline cost: UNKNOWN - REQUIRED FOR FINAL COST.

Option cost model:

| Cost item | Option A shared production | Option B shared codebase, separate deployment | Option C independent app |
|---|---|---|---|
| Web service | Incremental usage only; same service | New/separate service usage | New/separate service usage |
| API service | Same as web in current app | Same as separate web unless split | Separate app/API |
| Background worker | Shared current worker risk | Prefer separate One Time worker if Telegram/jobs live | Separate worker |
| Cron service | Shared unless tenant-aware | Separate or scoped worker/cron | Separate |
| PostgreSQL | Shared DB incremental rows | Prefer separate DB or at minimum separate schema | Separate DB |
| Redis/queue | Not confirmed | Needed only if jobs require it | Needed if architecture uses it |
| Persistent volumes | Unknown current use | Separate if uploads/storage local | Separate |
| Storage buckets | No Railway buckets found; external Drive/Vimeo likely | Separate bucket/storage if used | Separate |
| Backups | Shared backup/restores affect all tenants | Separate client DB backup recommended | Separate |
| CPU/memory | Shared app incremental | New service baseline plus usage | New service baseline plus usage |
| Network egress | Shared | Separate measurable egress | Separate |
| Build usage | Shared deploys | Additional deployment/builds | Additional deployment/builds |
| Staging/preview | Shared staging risk | Separate staging recommended | Separate staging |
| Observability/logs | Shared logs | Separate logs | Separate logs |
| Incremental isolation cost | Lowest | Moderate | Highest |

Non-Railway costs still unknown:

- Domain registration/DNS.
- Vimeo plan/storage/private embed/domain allowlist.
- Zoom plan/cloud recording.
- Transcription.
- AI inference.
- Vector database if introduced.
- Stripe/Green Invoice fees.
- Email provider/Resend.
- SMS/WhatsApp/WAPI.
- Drive/file storage.
- Monitoring/backups.

Cost conclusion:

- Do not choose Option A solely to save cost until child/privacy isolation is proven.
- Option B has moderate incremental infrastructure cost but makes billing, observability, and client isolation much easier to reason about.
- Final cost estimate requires one week of Railway usage telemetry or current workspace Usage data, plus target traffic/video/storage assumptions.

## 24. Domain And DNS Readiness

Current support:

- Client-specific homepage content: partial via `/rabbi` and `/one-time` drafts.
- Client logo/colors/typography/navigation: partial via One Time pages and project branding schema.
- Legal pages: not proven One Time-specific.
- SEO/social metadata: partial/noindex preview posture; production canonical not proven.
- Email sender identity: variables and connector settings exist, but Resend/domain ownership unresolved.
- Branded auth/parent/student portal: not proven.
- Canonical URLs/sitemap/robots: not proven for One Time domain.
- Analytics separation: not proven.

DNS and launch checklist:

1. Confirm domain owner and registrar.
2. Confirm DNS host and account recovery owner.
3. Choose root domain, `www`, app subdomain, and staging subdomain strategy.
4. Add Railway custom domain only after architecture choice; do not use Railway environments as tenant isolation.
5. Collect required Railway DNS records from dashboard when ready; do not invent TXT/CNAME values.
6. Verify SSL provisioning.
7. Decide redirect policy: root vs `www`, legacy `onetimeonetime.com`, BNA-hosted preview fallback.
8. Configure email DNS: SPF, DKIM, DMARC for chosen sender.
9. Update OAuth callback URLs for Google/Zoom if used.
10. Update Stripe/Green Invoice success/cancel/webhook URLs.
11. Update Zoom webhook URLs.
12. Update Vimeo allowed embed domains.
13. Review cookie domain and CORS policy.
14. Review CSP and iframe/media policy.
15. Create staging domain and rollback domain/path.
16. Set TTLs low before launch and restore after cutover.

Classification: not domain-ready for production custom-domain launch.

## 25. Asset Ownership

| Asset | Current owner | Recommended owner | Agency access | Client access | Offboarding/export risk |
|---|---|---|---|---|---|
| BNA/My Academy codebase | BNA/Shloimie workspace | Platform owner | Admin/developer | None unless contract grants | Shared IP and child data risk |
| One Time domain | Unknown | Rabbi/client owned | DNS delegate access | Full owner/recovery | High if agency owns domain |
| DNS | Unknown | Client owned, agency delegated | Limited DNS role | Full owner/recovery | High if no recovery path |
| GitHub repo | Current BNA repo | Platform owner for shared code | Developer access | Client gets export or deploy docs if contracted | Separate repo only after handoff decision |
| Railway project/service | Current project `skillful-motivation` | Option B: separate client project/service, agency operated or client owned | Deploy/admin | Billing/view/admin per agreement | Shared service risks data/deploy coupling |
| Production database | Current DB not verified | Option B: separate One Time DB or at least hard-isolated schema | Admin/DBA | Export rights | Highest privacy risk |
| Stripe/Green Invoice | Unknown | Client/Rabbi legal entity | Developer/webhook limited | Full owner | High for taxes/refunds/payouts |
| Vimeo | Unknown | Client/Rabbi or contractually agency-operated | Upload/API as needed | Owner/view/export | Video ownership/transfer risk |
| Zoom | Unknown | Rabbi/client or agency if hosting classes | API/OAuth app access | Host/admin | Meeting/recording ownership risk |
| Email/Resend | Unknown | Separate One Time sender/domain | API/domain config | Owner/admin | Deliverability/reputation risk |
| SMS/WhatsApp | Unknown | Client-owned number/provider | API/template access | Owner/admin | Consent/export risk |
| AI provider | Current BNA app supports OpenAI/Kimi | Platform-owned unless client-specific billing required | Developer | No secret access | Cost/privacy logging risk |
| Monitoring/backups | Unknown | Same owner as production runtime | Admin | Read/export as agreed | Restore ownership risk |

## 26. Security Findings

Critical confirmed vulnerabilities:

- None confirmed in this read-only audit. No exploit testing was performed.

High-risk architectural issues:

1. Tenant isolation is app-layer and partially hard-coded; database RLS/policy isolation was not verified. Evidence: many project checks in `server.js`, no confirmed RLS migration.
2. One Time currently lives in the same codebase/runtime/deploy path as BNA child/parent Operations data. Evidence: one Railway service `skillful-motivation`; shared `server.js`.
3. Host-domain tenant resolution is missing/unproven, so custom domain launch could accidentally serve the wrong workspace.
4. Public member/classroom access-code flows need production hardening before child/member content is exposed. Evidence: `/api/member-library` and `/api/one-time-classroom` access-code routes (`server.js:65867-65888`).
5. Public member login request appears to have a dry-run/preview token mode; this must be reviewed before production. Evidence: member request-login route (`server.js:68284-68328`).
6. External integration ownership and secrets are unresolved for Stripe, Zoom, Vimeo, Resend, and domain/DNS. Evidence: `.env.example:181-254`, numerous task blockers.
7. Dirty local worktree plus Railway local-upload deploy flow means uncommitted code can reach production. Evidence: `scripts/railway-redeploy.ps1:77-228` and dirty Git status.

Medium-risk gaps:

- Stripe webhook route exists, but idempotency/replay handling was not audited end-to-end.
- Recording/transcript privacy and retention are not fully specified.
- Zoom join links, recordings, and attendance webhooks are not production-proven.
- Vimeo privacy/domain restrictions not verified.
- Parent/student/Rabbi portal scoping needs live smoke under One Time user roles.
- Old archived docs and imports could mislead future implementation if treated as current source.

Low-risk improvements:

- Normalize spelling: Ellie/Elie, Scheller/Sheller.
- Clarify README Railway start-command wording.
- Create a central architecture decision record after this audit.

Unknowns requiring manual verification:

- Live database schema/rows/policies.
- Railway domains/variables/resource usage.
- Current actual One Time production domain and legacy app ownership.
- Client legal/billing owner.

## 27. Missing Features

Missing or not production-proven:

- Final client architecture decision.
- Central host/domain-to-tenant resolver.
- Separate One Time production Railway/DB/storage boundary.
- Full tenant-isolation test suite, including negative tests across BNA/One Time.
- One Time branded parent/student/provider login shells on the final domain.
- Production billing setup, webhook idempotency, refunds/cancellations/grace period/revocation.
- Appointment booking with Rabbi availability, buffers, reminders, Zoom creation, private notes.
- Zoom meeting creation/attendance/recording/transcript webhooks.
- Vimeo upload/privacy/domain whitelist/deletion/webhooks.
- Recording approval and member-library publication workflow with rollback.
- Vector/embedding/retrieval layer with tenant boundary.
- Retention/deletion/backups policy for children, recordings, transcripts, questions, and billing.
- One Time legal pages, privacy/terms, consent, and parent-facing recording policy.
- Exact cost model from Railway usage.

## 28. Duplicate Or Conflicting Implementations

Confirmed duplicates/conflicts:

- BNA vs My Academy naming: BNA is confirmed in repo; My Academy is not confirmed as active product name.
- Provider spelling varies: Ellie/Elie, Scheller/Sheller.
- One Time exists as current BNA implementation plus imported external app export (`docs/imports/2026-06-12-onetimeonetime-streaming-app-export.md`); do not confuse the import with live code.
- Archived Next/Supabase family app exists under `docs/archive/`; not current live app.
- `.env.local` contains legacy Supabase variable names, while current app uses Express/Postgres/Railway.
- GHL/legacy CRM references appear in historical docs/old artifacts; current BNA operating instructions say GHL is not active runtime.
- README Railway start wording is simplified compared with `scripts/railway-start.mjs`.
- One Time public surfaces currently include several preview routes (`/rabbi`, `/one-time-preview`, `/one-time`, `/member-library`), not one canonical custom-domain entrypoint.

## 29. Option A/B/C Comparison

Scoring: 5 is best. For effort, cost, and maintenance burden, 5 means lower effort/cost/burden.

| Criterion | Option A shared production | Option B shared codebase, separate deployment | Option C independent app |
|---|---:|---:|---:|
| Implementation effort | 3 | 3 | 2 |
| Monthly infrastructure cost | 5 | 3 | 2 |
| Data isolation | 2 | 4 | 5 |
| Security | 2 | 4 | 4 |
| Deployment independence | 1 | 4 | 5 |
| Client customization | 3 | 4 | 5 |
| Maintenance burden | 4 | 4 | 2 |
| Risk of code divergence | 5 | 5 | 1 |
| Ability to reuse platform improvements | 5 | 5 | 2 |
| Client ownership and handoff | 2 | 4 | 5 |
| Failure isolation | 1 | 4 | 5 |
| Observability | 2 | 4 | 4 |
| Backup and restore | 2 | 4 | 5 |
| Scaling | 3 | 4 | 4 |
| Billing clarity | 2 | 4 | 5 |
| Total | 42 | 60 | 56 |

## 30. Recommended Architecture

Recommendation: Option B - shared codebase, separate client deployment.

Target shape:

- Same BNA/My Academy repository.
- One Time-specific runtime service(s) in Railway.
- Separate production variables.
- Separate custom domain.
- Separate production database or, if temporarily impossible, a strictly separated schema with migration path to a separate database.
- Separate client-owned integration credentials for Stripe/Green Invoice, Zoom, Vimeo, Resend, and domain/DNS.
- Shared platform code and tests remain in the repo; client-specific config lives in environment/project records.

Facts that would change this recommendation:

- Change toward Option A if a full isolation audit proves every query, webhook, job, file path, helper, AI retrieval path, and portal is tenant-scoped, plus a central domain resolver and DB-level safeguards exist.
- Change toward Option C if the client requires full source-code handoff, independent release team, separate IP ownership, or legal/compliance boundaries that cannot share the BNA codebase.
- Change toward a short-term Option A preview only if launch is no-payment/no-child-private-data/no-live-Zoom/no-member-library and clearly marked preview.

## 31. Recommended Repository Strategy

Use one shared repository for now:

- Keep `bnei-neviim-academy` / BNA as the source code repository.
- Do not create a new One Time repository yet.
- Add architecture boundaries and config conventions before any split.
- If a future split is required, extract from a stable platform module boundary after One Time production behavior is known.

Rationale:

- Current One Time work is deeply embedded in `server.js`, public static pages, migrations, Operations, provider portal, tests, smokes, and task ledgers.
- A premature repo split would duplicate unstable platform code and increase divergence.

## 32. Recommended Railway Strategy

Recommended:

- Keep current `skillful-motivation` as BNA/platform production unless the operator decides otherwise.
- Create a separate One Time Railway project/service only after the architecture decision and cost/ownership questions are answered.
- Use separate production variables and separate database credentials for One Time.
- Use a separate worker for One Time Telegram/recording/class jobs if those become live.
- Use Railway environments for staging/production stages, not per-client isolation.

Do not yet:

- Add domains.
- Create new services.
- Move variables.
- Redeploy.
- Change Railway config.

Evidence:

- Current project/service found: `skillful-motivation` / `production` / service `skillful-motivation`, deployment `ca0075c2-5ce1-4a70-b6c8-e8d2c116adae` SUCCESS.

## 33. Recommended Database-Isolation Strategy

Preferred:

1. Separate One Time production database for Option B.
2. Shared migrations/code, but database connection selected by deployment.
3. Explicit seed data for One Time only in the One Time DB.
4. Tenant/project keys remain in data model for future portability and internal filtering.
5. Backups/restore tested per client.

Temporary fallback:

- Separate schema in shared Postgres only if Railway/cost/access blocks a separate DB.
- Add DB-level constraints/RLS or equivalent guardrails before live child/member data.
- Write negative tests proving BNA cannot read One Time and One Time cannot read BNA across every portal/API/job.

Not recommended:

- Same production database with only frontend filtering.

## 34. Recommended Custom-Domain Strategy

Recommended:

- Treat `onetimeonetime.com` or the chosen One Time domain as a client-owned asset.
- Point the final domain to the separate One Time deployment.
- Add a central host-to-client resolver only if Option A/shared-domain multi-tenant mode is explicitly approved later.
- Keep BNA preview paths available only as internal preview/fallback until launch.
- Do not replace the BNA homepage with One Time content.

Before launch:

- Confirm domain owner, DNS delegate access, Railway custom-domain records, SSL, email DNS, OAuth callbacks, webhook URLs, Vimeo embed domains, cookie/CORS/CSP, canonical URLs, sitemap, robots, analytics.

## 35. Migration Risks

High risks:

- Dirty worktree deploys can mix unrelated changes into production.
- One Time data may already be interleaved with BNA app/runtime assumptions.
- Billing/access changes could grant members access before legal/accounting approval.
- Recording/transcript publication could expose child/private content if approval gates fail.
- Domain launch without resolver/auth review could leak BNA/Operations routes or wrong branding.
- Legacy imported One Time app expectations may conflict with the BNA platform implementation.

Mitigations:

- Freeze a clean deployment branch for architecture work.
- Create an architecture decision record.
- Run full tenant/privacy/security smoke suite before custom domain or billing.
- Keep checkout, Zoom, Vimeo, sends, and member publish behind explicit approval flags.
- Export/backup before any data migration.

## 36. Information Still Needed

1. Final brand name and spelling: One Time One Time, OneTimeOneTime, One Time Mishnayos, and Rabbi Ellie/Elie Scheller.
2. Who owns the domain and DNS?
3. Which domain/subdomain is primary?
4. Who owns Stripe/Green Invoice/legal billing?
5. Which monthly price is approved for launch, especially whether $67 is final?
6. Which Zoom account hosts classes?
7. Which Vimeo account owns uploaded videos and private embed settings?
8. Which Resend/email sender domain is approved?
9. Whether the current Railway project is BNA-only or shared platform/client production.
10. Current Railway plan, usage, and budget limit.
11. Live database schema/policy state.
12. Whether One Time should use a separate database immediately.
13. Whether existing external `onetimeonetime.com` app data/content must be imported.
14. Content/privacy policy for recordings, transcripts, student questions, and community posts.
15. Client handoff/offboarding terms.

## 37. Suggested Implementation Phases

Phase 0 - Decision and access:

- Approve Option B or document a different decision.
- Confirm ownership, domain, Railway billing, database boundary, Stripe/Zoom/Vimeo/Resend owner accounts.

Phase 1 - Isolation foundation:

- Create clean branch/deploy path.
- Add tenant/domain decision record.
- Add negative tenant-isolation tests.
- Prepare separate Railway project/service/database plan.

Phase 2 - Client deployment:

- Provision separate One Time Railway runtime and DB after approval.
- Seed One Time project/workspace/curriculum/product records.
- Configure no-send/no-checkout preview first.
- Smoke parent/student/provider/admin/member routes.

Phase 3 - Integrations:

- Configure Stripe/Green Invoice in test mode, then live after legal/accounting approval.
- Configure Zoom meeting/attendance/recording workflow.
- Configure Vimeo upload/private playback/domain restrictions.
- Configure email sender and DNS.

Phase 4 - Production launch:

- Add custom domain/DNS.
- Run live privacy/security/billing/video/classroom smokes.
- Enable checkout/access/member library in controlled rollout.
- Monitor logs, usage, billing, and support tickets.

## 38. Exact Next Action

Create a one-page architecture decision record that chooses Option B boundaries for One Time One Time:

- same BNA/My Academy codebase,
- separate One Time Railway project/service,
- separate One Time production database,
- client-owned domain/DNS/payment/video/Zoom/email assets with agency delegate access,
- no live checkout, Zoom meeting creation, Vimeo upload, email send, or member access grant until those owner/access decisions are confirmed.

Then use that decision to plan the first non-read-only implementation batch.
