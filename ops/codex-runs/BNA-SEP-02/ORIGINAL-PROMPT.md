# RUN ONLY AFTER DEFINITION-OF-READY PASSES

# CODEX-02 — Standalone BNA School Extraction Foundation

## Mission

Create the authorized standalone BNA School repository and deliver a small but real first extraction slice:

- School-local authentication and session boundary;
- cream/navy/teal School shell;
- School administrator dashboard;
- families/households/guardians and learners;
- classes/occurrences required by the workflow;
- one complete attendance/progress workflow;
- guardian and learner visibility where approved;
- standalone PostgreSQL migrations;
- signed/idempotent School outbox boundary to Control Plane;
- local performance, test, deployment, backup/restore and import/reconciliation foundations.

Reuse or transform proven School logic. Do **not** copy the legacy repository or its global runtime.

This prompt is directly executable once the gate passes. Do not return to the director for ordinary technical choices. When an external permission or nonessential provider credential is missing, continue all safe local/staging work, commit/push useful work where possible, and checkpoint the blocked mutation.

## Hard gate

Do not create a remote repository, deployment, database, DNS record, account, credential, provider object or production data mutation until all required Definition-of-Ready evidence passes.

Required gate artifacts:

- a machine-readable `BNA-SEP-02-DOR` result with `overall_status: PASS` and current evidence;
- an approved decisions file that authorizes the exact target repository and records the domain, first slice, account migration method and payment ownership;
- current remote branch/SHA resolution performed in this run;
- current production schema/aggregate ownership readback or an approved safe source sufficient for the first slice;
- accepted current School performance budgets;
- explicit source/data/auth/event/worker/secret ownership;
- a staging, backup/restore and privacy-safe test-account plan.

Accept the decision file from exactly one of these sources:

1. `ops/codex-runs/BNA-SEP-02/APPROVED-DECISIONS.json` in the current verified legacy remote branch; or
2. a local file path supplied through `BNA_SEP_02_APPROVED_DECISIONS_FILE`.

Copy the selected file into the run directory and record its SHA-256 fingerprint. Never overwrite it or infer authorization from this audit’s recommendation.

The decision file must contain, at minimum:

- schema version `bna-sep-02-decisions-v1`;
- a valid `target_repository` GitHub slug;
- `authorize_repository_creation: true` when remote creation is authorized;
- a selected School production domain;
- an approved first-slice identifier covering auth, School shell, dashboard, families/learners and attendance/progress;
- an account-migration choice;
- a payment-ownership choice;
- a non-empty approver identity and approval timestamp.

The recommended values are `shloimie-beep/bna-school`, `school.bneineviimacademy.org`, activation/reset account migration and School-owned billing behind a provider-neutral port. Recommendations are not authorization.

When the gate does not pass:

- create the run artifacts;
- perform safe current-source and gate verification;
- prepare local non-remote architecture/import/test scaffolding only when it does not imply authorization;
- do not create or push the target repository;
- set terminal status `BLOCKED_DEFINITION_OF_READY` or `BLOCKED_REPOSITORY_CREATION_AUTHORIZATION`;
- record exact missing evidence and continuation commands;
- do not ask the director inside the run.

## Non-negotiable target boundaries

- Separate repositories, deployments, databases, session/CSRF keys, cookie names/domains, secrets and workers.
- Shloimie’s super-admin login opens only Control Plane. School administration uses a real School administrator account.
- No impersonation, “View as,” iframe, shared browser cookie, shared frontend bundle, shared session resolver, cross-app database join or School request-time Control Plane call.
- A Control Plane outage cannot break School login, dashboard, classes, attendance, parent portal, student portal or local School operations.
- School emits signed, versioned, idempotent asynchronous events through a local transactional outbox.
- Control Plane may call only a small protected read-only School diagnostic API; School does not depend on that call.
- Do not include super-admin, provider marketplace/Studio, One Time, global agents/prompts/decisions/deployment control, global integration readiness, BNA memory, run ledgers or historical `ops/` evidence in the product runtime.
- Do not copy production data, passwords, sessions, reset/access tokens, secrets, private rows or message bodies into Git or run evidence.
- Do not use a SHA copied from the audit. Resolve all named remote branches at runtime and record them.

## Persistent run artifacts

In a clean legacy worktree create before implementation:

```text
ops/codex-runs/BNA-SEP-02/ORIGINAL-PROMPT.md
ops/codex-runs/BNA-SEP-02/INPUTS.json
ops/codex-runs/BNA-SEP-02/STATE.json
ops/codex-runs/BNA-SEP-02/RESUME.md
ops/codex-runs/BNA-SEP-02/FINAL-REPORT.md
ops/codex-runs/BNA-SEP-02/DEFINITION-OF-READY-RESULT.json
ops/codex-runs/BNA-SEP-02/APPROVED-DECISIONS.json
```

Add during the run:

```text
ops/codex-runs/BNA-SEP-02/SOURCE-PROVENANCE.csv
ops/codex-runs/BNA-SEP-02/FILE-OWNERSHIP.csv
ops/codex-runs/BNA-SEP-02/COLLISION-HOTSPOTS.md
ops/codex-runs/BNA-SEP-02/DATA-MAPPING.csv
ops/codex-runs/BNA-SEP-02/MIGRATIONS.md
ops/codex-runs/BNA-SEP-02/IMPORT-RECONCILIATION.md
ops/codex-runs/BNA-SEP-02/PERFORMANCE.md
ops/codex-runs/BNA-SEP-02/TEST-RESULTS.md
ops/codex-runs/BNA-SEP-02/EXTERNAL-MUTATIONS.md
ops/codex-runs/BNA-SEP-02/DEPLOYMENT-AND-ROLLBACK.md
```

`ORIGINAL-PROMPT.md` contains this prompt verbatim. `STATE.json` is machine-readable and updated after every phase and before stopping.

When the target repository exists, add a product-safe provenance document there referencing the resolved legacy commit and selected source functions/files. Do not copy Control Plane run ledgers into product runtime/build artifacts.

## Phase 0 — Locate and resolve the current legacy repository

Locate `shloimie-beep/bnei-neviim-academy` from any starting folder by validating the normalized `origin` URL. Search bounded common roots; clone into an external work area only when no valid checkout exists. Never reset, clean, stage or stash an existing checkout.

Resolve and cross-check current remote `master`:

```bash
set -euo pipefail
LEGACY_REMOTE_BRANCH="master"
git -C "$LEGACY_REPO_DIR" fetch --prune origin "$LEGACY_REMOTE_BRANCH"
LEGACY_REMOTE_SHA="$(git -C "$LEGACY_REPO_DIR" rev-parse "refs/remotes/origin/$LEGACY_REMOTE_BRANCH")"
LEGACY_LS_REMOTE_SHA="$(git -C "$LEGACY_REPO_DIR" ls-remote origin "refs/heads/$LEGACY_REMOTE_BRANCH" | awk '{print $1}')"
test -n "$LEGACY_REMOTE_SHA"
test "$LEGACY_REMOTE_SHA" = "$LEGACY_LS_REMOTE_SHA"
```

Record current local status/worktrees/stashes without changing them.

Create the runtime timestamp and a clean external legacy worktree/branch from the resolved SHA:

```bash
RUN_STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
LEGACY_BRANCH="codex/bna-sep-02-extraction-foundation-${RUN_STAMP}"
```

Use `$LEGACY_BRANCH` for the external worktree. Verify the original checkout is unchanged.

## Phase 1 — Re-evaluate Definition of Ready against current truth

Do not trust a stale PASS file by itself. Re-evaluate every required item against the resolved current legacy commit and available approved environments.

At minimum verify:

- approved decisions fingerprint and exact target slug;
- current route/API/action/worker inventory for the first slice;
- canonical/generated source ownership;
- production or approved-source schema/catalog/index/constraint metadata;
- aggregate School ownership counts and exact positive scope predicates;
- identity/household/guardian/learner/staff/class/occurrence/enrollment/attendance/progress mappings;
- duplicate/orphan/relationship review policy;
- consent/suppression/retention policy;
- accepted Wave 0 performance baseline/budgets;
- account activation/recovery/role matrix;
- event and diagnostics contracts;
- worker/secret ownership;
- independent staging, backup and restore-drill plan;
- privacy-safe administrator/guardian/learner test accounts or synthetic fixtures.

Write a fresh `DEFINITION-OF-READY-RESULT.json` with each requirement’s status/evidence/blocker. Only `overall_status: PASS` permits target repository creation or product implementation.

## Phase 2 — Inspect the full source and select exact extraction units

Read the current canonical operating sources and search the full repository. Inspect at minimum:

- School routes/APIs and database consumers in `server.js` and domain modules;
- `public/operations.html`, generated bootstrap/main/deferred assets and split generator;
- parent/student/login pages and scripts/styles;
- current auth/session policies/tests;
- people/household/student/class/attendance/goal/progress/assignment/content/communication/ticket/payment schemas and scripts;
- `src/lib/bna/identity-linking.js`;
- `src/lib/bna/goal-board.js`;
- `src/lib/bna/torah-learning.js`;
- `src/lib/bna/class-drive-intake-reconcile.js`;
- `src/lib/bna/device-control.js` only to determine current first-slice exclusion or dependency;
- `src/lib/bna/green-invoice.js` only for future billing-port design unless billing is in the approved slice;
- current CRM/communication modules only to prove exclusion/ownership;
- `src/platform/*`, action/helper registries, One Time modules and deployment/worker files to build a denylist.

Populate `SOURCE-PROVENANCE.csv`:

```text
source_commit,source_path,symbol_or_behavior,evidence_status,selected_disposition,target_path_or_contract,dependencies_removed,tests,privacy_review
```

Allowed dispositions: `copy_pure`, `transform`, `rewrite`, `package_contract`, `leave_control_plane`, `retire_after_proof`.

Do not copy `server.js`, Operations shell files, `ops/`, `memory*`, task ledgers, One Time directories, provider marketplace/Studio, global helper/agents, Railway audit output, database dumps or broad public asset trees.

## Phase 3 — Create or validate the target repository only after authorization

Read `target_repository` from the approved decisions file. Validate the slug and authorization.

1. Use GitHub read access to determine whether the target repository already exists.
2. When it exists, validate owner/name, visibility, default branch, current remote head and access. Never overwrite unrelated content.
3. When it does not exist and authorization is true, create it **private by default** using GitHub CLI/API. Do not create it public unless the decision file explicitly authorizes public visibility.
4. When GitHub write access is unavailable, create the local target worktree/scaffold in an external directory, commit locally, and checkpoint `BLOCKED_TARGET_REPOSITORY_MUTATION`; do not abandon work.

For a newly created empty repository:

- create a minimal protected baseline on `main` containing only repository policy/readme/gitignore/security/ownership foundations needed to support a feature branch;
- push that baseline only after authorization;
- resolve the actual remote default branch after push and record its SHA;
- create a clean external target feature worktree/branch named with the runtime timestamp, for example `codex/bna-sep-02-school-foundation-${RUN_STAMP}`.

For an existing repository:

- resolve the remote default branch dynamically via GitHub and Git;
- fetch and cross-check `git rev-parse "refs/remotes/origin/$SCHOOL_DEFAULT_BRANCH"` with `git ls-remote`;
- create the feature worktree from that resolved SHA;
- never use a copied or placeholder SHA.

## Phase 4 — Establish the standalone School foundation

Use Node.js LTS, TypeScript and PostgreSQL unless current approved target constraints prove another choice is safer. Select the smallest HTTP/frontend tooling compatible with route-specific builds and current team/runtime support; record the decision and tradeoffs without asking the director.

Required repository boundaries:

```text
src/domain/                 pure School domain types/rules
src/application/            use cases and authorization orchestration
src/infrastructure/db/      School repositories and migrations
src/infrastructure/auth/    School password/session/CSRF implementation
src/infrastructure/events/  outbox, signing and event transport
src/infrastructure/providers/ optional product-scoped adapters
src/web/                    School-only routes/pages/components/assets
src/workers/                explicit School worker entrypoints
migrations/                 standalone ordered School migrations
scripts/import/             read-only legacy import/reconciliation harness
scripts/ops/                backup/restore/diagnostic operations, no global brain
contracts/                  product-local and pinned shared schemas
 tests/                     unit/contract/integration/browser/performance/security
```

A different small layout is acceptable when documented, but product/runtime ownership must remain explicit.

Required foundations:

- deterministic build and locked dependencies;
- `.env.example` with names only and no secret values;
- secret scanning and dependency audit;
- structured privacy-safe logging and request IDs;
- health/readiness endpoints that do not expose private data;
- database migration command and disposable-database verification;
- independent web and worker process commands;
- Docker/deployment descriptor suitable for staging; a Railway descriptor may be included when consistent with current hosting, but no provider lock is required for domain logic;
- CI for install/build/test/migration/dependency-denylist/performance budget checks;
- README and runbooks for local/staging operation, backup/restore and rollback.

## Phase 5 — Build the School database and migration ledger

For the first slice create normalized, School-owned schema. Exact table naming is an engineering choice, but the model must cover:

- School/configuration;
- accounts, roles, sessions, auth attempts and account events;
- households, guardians, learners and explicit guardian-learner relationships;
- staff accounts/assignments required by the workflow;
- classes, occurrences and enrollments;
- attendance records and append-only correction/audit events;
- goals/progress events required by the approved workflow;
- outbox events and delivery attempts/dead letters;
- local audit events;
- legacy ID mapping, import runs, high-water marks, rejections and reconciliation summaries.

Requirements:

- immutable opaque local IDs;
- no foreign key or connection to the Control Plane database;
- explicit lifecycle states and timestamps;
- unique constraints for relationships, enrollment, attendance action and idempotency;
- indexes supported by target queries and verified with safe plans;
- migration is additive and tested on disposable databases;
- no destructive production migration;
- rollback is restore/forward-correction aware and documented;
- row-level private data never appears in committed migration evidence.

Record every migration, affected object, lock/size risk, test, rollback and environment in `MIGRATIONS.md`.

## Phase 6 — Implement independent School authentication and authorization

Implement School-local login/logout/session/recovery/activation foundations for approved roles.

Mandatory behavior:

- host-only School cookie with a School-specific name; no parent-domain cookie;
- separate session/CSRF/signing keys and secret store;
- high-entropy opaque session token with only a keyed hash stored server-side;
- password hashing and rotation policy; activation/reset is the default migration path;
- rate limiting and generic login errors;
- session rotation at login/role/password changes;
- independent logout/revocation;
- exact School role and relationship authorization;
- explicit guardian-to-learner and staff-to-class/school edges;
- no generic destination chooser, Operations/provider lookup, shared logout, view-as or impersonation;
- no acceptance of legacy sessions, generic workspace role or Control Plane bearer token.

Create negative tests for cross-cookie, cross-role, cross-household, cross-learner, disabled relationship, unassigned class, guessed ID, unsafe return path, stale session and Control Plane outage.

Use synthetic/test accounts until account migration is authorized. Do not import production password hashes/sessions/tokens.

## Phase 7 — Build the real first vertical slice

Required routes may use conventional product-local paths such as `/login`, `/admin`, `/admin/families`, `/admin/learners`, `/admin/classes`, `/admin/attendance`, `/admin/progress`, `/parent` and `/student`. Choose stable paths, document them and do not recreate `/operations` global semantics.

### School shell

- cream/navy/teal BNA School design tokens;
- responsive, accessible, RTL-capable where current behavior requires it;
- route-specific assets and lazy secondary content;
- no provider, One Time, global agent, deployment, global workspace or integration-readiness navigation;
- no shared frontend runtime/session with Control Plane.

### Administrator dashboard

- critical School operational summary only;
- bounded queries and usable-first rendering;
- navigation to families/learners and attendance/progress;
- local degraded/empty/error states.

### Families and learners

- bounded cursor list/search/filter;
- household, guardian and learner detail using explicit relationships;
- lifecycle/status display;
- no cross-workspace/global directory enumeration;
- audit and authorization around changes.

### Attendance/progress workflow

Implement one complete flow:

1. administrator selects a class occurrence and bounded roster;
2. records or corrects attendance/progress with idempotency/concurrency controls;
3. local state and audit event commit transactionally;
4. outbox event commits in the same transaction;
5. guardian/learner sees only approved data according to explicit relationships and role;
6. asynchronous test Control Plane consumer receives a minimized signed event;
7. duplicate delivery does not duplicate projection/action;
8. Control Plane unavailable leaves the School flow successful and queues delivery.

Do not include device control, rewards, full content generation, provider marketplace, global CRM, One Time or broad billing unless the approved first-slice decision explicitly includes it.

## Phase 8 — Event outbox and diagnostic boundary

Implement a local transactional outbox with:

- unique event ID and idempotency key;
- versioned event type/schema;
- aggregate ID/sequence where ordering matters;
- privacy-classified allowlisted payload;
- canonical signing and rotatable key ID;
- retry/backoff/jitter, acknowledgement, dead-letter and replay controls;
- privacy-safe metrics and no user-request dependency on delivery.

Initial events for the slice:

- account activated/lifecycle changed;
- learner lifecycle changed with minimal metadata;
- class/occurrence changed;
- attendance recorded/corrected;
- progress updated;
- School ticket created when support entry is included;
- release/backup/connector health events.

Build a local contract consumer and tests. Integrate with a real Control Plane staging consumer only when endpoint/key authorization is available; missing access blocks only that external test.

Implement a protected read-only diagnostics endpoint restricted to release/schema/health/aggregate latency/error/outbox/backup/connector readiness data. Prove that private rows, messages, sessions, payments and arbitrary queries cannot be returned.

## Phase 9 — Import and reconciliation harness

Build read-only, idempotent, resumable import commands for the first slice.

Source access rules:

- production source requires an approved read-only role/clone;
- wrap readback in read-only transactions;
- never print connection strings or raw private rows;
- use exact positive School ownership predicates;
- unknown JSON keys/ambiguous records are rejected for review, not silently copied.

Import order:

1. School/configuration;
2. account eligibility and identity mapping;
3. households/guardians/learners and access relationships;
4. staff/roles required by the slice;
5. classes/occurrences/enrollments;
6. attendance/goals/progress.

Each importer supports:

- dry-run;
- apply to a disposable/staging target;
- rerun without duplication;
- high-water mark/resume;
- target-batch rollback before cutover;
- aggregate source/eligible/excluded/inserted/updated/rejected counts;
- relationship/orphan/duplicate candidate counts;
- deterministic canonical checksum with documented normalization;
- private-safe rejection reason codes;
- transform version and resolved source commit.

Do not write to legacy. Do not enable dual-write. Store restricted mapping rows only in the target migration ledger, not in public evidence.

Run at least two identical dry-run/apply cycles on synthetic or approved safe data and prove stable results. When current production read access is unavailable, finish the harness and synthetic proof, then checkpoint the exact readback blocker.

## Phase 10 — Performance and availability gates

Use accepted `CODEX-01` budgets as the maximum allowed regression. When no accepted baseline exists, the Definition of Ready must not have passed; do not invent one.

Measure 30 cold and 30 warm-return samples at:

- `360x800`;
- `390x844`;
- `768x1024`;
- `1440x900`.

Journeys:

- School login;
- administrator dashboard;
- families/learners list/detail;
- classes/attendance;
- progress;
- parent;
- student.

Capture useful-action p50/p75/p95, TTFB, requests, bytes by type, route-specific JS/CSS, server/query count/timing, DOM/long tasks, errors, accessibility, action availability and warm return.

Absolute target ceilings must be no looser than:

- cold useful-action p75: 3500 ms mobile, 3000 ms tablet, 2500 ms desktop;
- warm useful-action p75: 1500/1200/1000 ms;
- School admin initial compressed JS: 250 KB;
- parent/student initial compressed JS: 150 KB;
- requests before useful action: 12 admin, 8 portal;
- individual DB query p95: 100 ms;
- zero functional/console/page errors and zero critical/serious accessibility findings.

Also prove:

- zero requests to Control Plane, provider marketplace, One Time, global agents/deployment/integration readiness during ordinary School journeys;
- School login/attendance/portals work while Control Plane and event transport are unavailable;
- event backlog recovers idempotently after restoration.

## Phase 11 — Backups, restore and deployment foundation

Before any staging data acceptance:

- define School backup ownership, frequency, encryption, retention, RPO/RTO target and access;
- create an automated disposable restore drill;
- restore a current staging backup into a separate target;
- run schema, aggregate checksum and priority-journey verification against the restore;
- record duration and evidence without private rows.

Create independent staging deployment descriptors and rollback instructions. Deploy only when authorized access exists. A staging deployment must use separate School environment/secrets/database/session keys and must not mount the legacy database or invoke Control Plane on request paths.

Missing deployment/backup provider access blocks only external proof. Complete code, scripts, local disposable restore proof and draft PR.

## Phase 12 — Verification matrix

Required tests:

- unit tests for copied pure logic and transformations;
- provenance/parity tests against synthetic fixtures;
- database migration/constraint/index tests;
- importer dry-run/apply/rerun/rollback/checksum tests;
- auth/session/CSRF/rate-limit/recovery/revocation tests;
- role/guardian/staff/learner negative authorization tests;
- event schema/signature/idempotency/retry/replay/dead-letter tests;
- diagnostics privacy/authorization/rate-limit tests;
- browser journeys, deep links, refresh/back/forward, mobile/RTL/accessibility;
- performance budgets;
- Control Plane outage and transport outage drills;
- dependency/file/resource denylist tests proving excluded legacy surfaces are absent;
- secret/private-data scans;
- build and deployment-descriptor validation;
- backup/restore drill.

Run from exact final commits and record commands, exit codes, environment and evidence paths. Do not reuse old legacy test counts.

## Phase 13 — Commit, push and draft PRs

### Legacy repository branch

Commit run artifacts, source provenance, any narrow compatibility/event-contract changes and migration tooling that legitimately belongs in Control Plane. Do not merge automatically.

### Target repository branch

Commit standalone product code, migrations, tests, import harness, deployment/backup foundations and product-safe provenance. Push and open a draft PR against the dynamically resolved target default branch.

Draft PR descriptions must include:

- resolved legacy and target base SHAs;
- exact first-slice routes and behaviors;
- source files/functions copied/transformed/rewritten/left behind;
- file ownership and collision hotspots;
- database migrations/indexes/import mapping;
- auth/session/cookie/role boundary;
- event/diagnostic contracts;
- performance and outage results;
- tests/accessibility/security/privacy scans;
- external mutations completed/blocked;
- staging/backup/rollback state;
- blockers, next bounded slice and next branch.

Do not merge or cut over production in this prompt.

## External mutation policy

A missing permission stops only its dependent mutation:

- no GitHub repo-create permission: keep local commits/scaffold and checkpoint;
- no push/PR permission: keep local commits and exact continuation path;
- no staging deploy permission: finish code/evidence and checkpoint `READY_FOR_SCHOOL_STAGING`;
- no read-only legacy database: finish importer/schema scripts and synthetic proof; checkpoint `BLOCKED_LEGACY_READBACK`;
- no Control Plane staging event key: finish local contract consumer; checkpoint `BLOCKED_EVENT_INTEGRATION_TEST`;
- no backup provider access: finish restore tooling and disposable proof; checkpoint `BLOCKED_MANAGED_BACKUP_PROOF`.

Never respond to a missing nonessential provider credential by abandoning the run.

## Required final report

`FINAL-REPORT.md` must state:

1. gate result and approved-decision fingerprint;
2. resolved legacy/target remotes, branches and base/final SHAs;
3. worktree paths and proof existing checkouts were not mutated;
4. remote repository creation/visibility/default-branch mutations, if any;
5. exact target architecture, routes, bundles, services and worker entrypoints;
6. source provenance and copy/transform/rewrite/package/leave/retire decisions;
7. file ownership and collision hotspots;
8. migrations, indexes, import mappings, counts/checksums and environments;
9. account/session/cookie/role/relationship behavior;
10. event/diagnostic contracts and outage tests;
11. performance 30-sample results and accepted budgets;
12. tests, accessibility, privacy/security and dependency denylist;
13. deployment, backup/restore and rollback evidence;
14. all external mutations and blocked mutations;
15. exact remaining domains, risks and next branch;
16. a fresh-window continuation prompt requiring no previous chat.

## Terminal statuses

Use exactly one:

- `FOUNDATION_AND_FIRST_SLICE_STAGED_AND_VERIFIED`;
- `READY_FOR_SCHOOL_STAGING`;
- `FOUNDATION_IMPLEMENTED_NEEDS_APPROVED_DATA_READBACK`;
- `BLOCKED_DEFINITION_OF_READY`;
- `BLOCKED_REPOSITORY_CREATION_AUTHORIZATION`;
- `BLOCKED_TARGET_REPOSITORY_MUTATION`;
- `BLOCKED_LEGACY_READBACK`;
- `BLOCKED_SECURITY_PRIVACY_OR_RECONCILIATION`.

No terminal status authorizes production cutover. `CODEX-03` remains separately gated.
