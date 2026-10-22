# CODEX-01 — Immediate BNA School Speed Stabilization

## Mission

Make the existing BNA School administrator, parent and student experience materially faster and usable **before repository extraction**, using the smallest source-backed changes that isolate School boot/runtime work from Control Plane, provider and One Time work.

This prompt is directly executable. Do not return to the director for ordinary engineering decisions. Continue every safe inspection, implementation, test and evidence step when a nonessential credential, deployment permission or provider account is unavailable. Stop only the dependent external mutation and leave a durable checkpoint.

## Non-negotiable boundaries

- Canonical repository: `shloimie-beep/bnei-neviim-academy`.
- Canonical remote branch: `master`.
- Resolve the current remote head at execution time. **Do not use a SHA copied from this audit or from a task/report.**
- Use a new clean external worktree and branch. Never reset, clean, stage, stash, amend or otherwise mutate the user’s existing checkout or its dirty files.
- Do not create the standalone School repository in this run.
- Do not broadly rewrite business logic, replace the framework, change production data, run destructive migrations, or deploy from a dirty tree.
- Do not break Control Plane, provider, One Time, public, parent or student behavior.
- Do not treat `TASKS.md`, `SYSTEM-STATE.md`, an execution run, route/action registry, test count, PR description or final report as stronger than the verified remote commit and executable source.
- Never fabricate browser, PostgreSQL, deployment, Railway or production evidence.
- Never commit secrets, cookies, credentials, private student/parent rows, message bodies, raw recipient identifiers, HAR authorization headers or unredacted database samples.
- Production deployment requires an existing explicit release authorization for the exact commit. Otherwise finish at staging/canary readiness.

## Required persistent run artifacts

Before any implementation edit, create and populate:

```text
ops/codex-runs/BNA-SEP-01/ORIGINAL-PROMPT.md
ops/codex-runs/BNA-SEP-01/INPUTS.json
ops/codex-runs/BNA-SEP-01/STATE.json
ops/codex-runs/BNA-SEP-01/RESUME.md
ops/codex-runs/BNA-SEP-01/FINAL-REPORT.md
```

Also create as the run proceeds:

```text
ops/codex-runs/BNA-SEP-01/FILE-OWNERSHIP.csv
ops/codex-runs/BNA-SEP-01/COLLISION-HOTSPOTS.md
ops/codex-runs/BNA-SEP-01/ROUTE-MATRIX.json
ops/codex-runs/BNA-SEP-01/BASELINE/
ops/codex-runs/BNA-SEP-01/AFTER/
ops/codex-runs/BNA-SEP-01/TEST-RESULTS.md
ops/codex-runs/BNA-SEP-01/DEPLOYMENT.md
```

`ORIGINAL-PROMPT.md` must contain this prompt verbatim. Create these files before product code changes and make an early checkpoint commit.

`STATE.json` must be machine-readable and include:

- run ID `BNA-SEP-01`;
- phase and status;
- repository remote URL, resolved branch and resolved SHA;
- original checkout path and dirty-status summary without changing it;
- external worktree path and branch;
- baseline/after evidence status per journey/viewport;
- files owned, collision files and current lock/owner where known;
- migrations/indexes proposed/applied and target environment;
- tests and results;
- external mutations attempted/completed/blocked;
- blockers with owner and next safe action;
- commit, push, PR, staging/canary and deployment state;
- exact next branch/command for a fresh session.

Update `STATE.json` and `RESUME.md` after every major phase and before any stop.

## Phase 0 — Locate the correct repository and establish immutable input truth

Codex may start in any folder. Locate the repository safely.

1. Search, without modifying candidates, under the current directory, `$HOME`, `$HOME/src`, `$HOME/projects`, `$HOME/Documents`, `/workspace`, `/workspaces`, `/repo`, `/repos` and `/mnt/data`, to a bounded depth.
2. A candidate is valid only when `git -C "$CANDIDATE" remote get-url origin` normalizes to `shloimie-beep/bnei-neviim-academy` over SSH or HTTPS.
3. When no valid checkout exists, create a new local clone in an external work area. Cloning is allowed; creating a new remote repository is not.
4. Record every candidate considered and the selected path in `INPUTS.json`. Do not print embedded credentials in remote URLs.

Resolve remote truth:

```bash
set -euo pipefail
EXPECTED_REPO="shloimie-beep/bnei-neviim-academy"
REMOTE_BRANCH="master"

git -C "$REPO_DIR" fetch --prune origin "$REMOTE_BRANCH"
REMOTE_SHA="$(git -C "$REPO_DIR" rev-parse "refs/remotes/origin/$REMOTE_BRANCH")"
LS_REMOTE_SHA="$(git -C "$REPO_DIR" ls-remote origin "refs/heads/$REMOTE_BRANCH" | awk '{print $1}')"
test -n "$REMOTE_SHA"
test "$REMOTE_SHA" = "$LS_REMOTE_SHA"
```

Record both resolution methods and timestamp. Abort only this run when they disagree; do not guess or use a remembered SHA.

Capture, but do not alter, the selected existing checkout:

```bash
git -C "$REPO_DIR" status --porcelain=v2 --branch
git -C "$REPO_DIR" worktree list --porcelain
git -C "$REPO_DIR" branch --show-current
git -C "$REPO_DIR" stash list
```

Treat output as local evidence only. Do not stage/reset/clean/stash it.

## Phase 1 — Create the clean external worktree and branch

Use an external root such as `$CODEX_WORKTREE_ROOT` when set, otherwise `$HOME/.codex-worktrees`; fall back to `/tmp/codex-worktrees` only when necessary. Use a UTC timestamp in the branch/path so the run does not collide.

Required pattern:

```bash
RUN_STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BRANCH="codex/bna-sep-01-speed-stabilization-$RUN_STAMP"
WORKTREE_ROOT="${CODEX_WORKTREE_ROOT:-$HOME/.codex-worktrees}"
WORKTREE="$WORKTREE_ROOT/bna-sep-01-$RUN_STAMP"
mkdir -p "$WORKTREE_ROOT"
git -C "$REPO_DIR" worktree add -b "$BRANCH" "$WORKTREE" "$REMOTE_SHA"
```

Verify:

- `git -C "$WORKTREE" status --porcelain` is empty;
- `git -C "$WORKTREE" rev-parse HEAD` equals the resolved remote SHA;
- the original checkout status is byte-for-byte unchanged from the captured status;
- no branch or worktree path is reused from an older run.

All subsequent edits occur only in `$WORKTREE`.

## Phase 2 — Read canonical operating sources, then verify source

Read at minimum, from the resolved remote worktree:

- `BNA-START-HERE.md`;
- `AGENTS.md`;
- `docs/BNA-RAMBLE-TO-DONE.md`;
- `SYSTEM-STATE.md`;
- `TASKS.md`;
- `MEMORY.md`;
- `PROJECT-NOTES.md`;
- `ops/execution-runs/latest.json` and the referenced run;
- `ops/route-registry.json`;
- `ops/action-registry.json` and every path under `ops/action-registry/`;
- `src/lib/actions/registry.js`, `src/lib/actions/types.js` and action implementation paths;
- `server.js`, `package.json`, `scripts/railway-start.mjs` and deployment descriptors;
- Operations, School, parent, student and login pages, generated shell assets and split/deferred renderers;
- current auth/session/portal tests and policies;
- current performance audits and browser harnesses.

Then search the full repository for every route, API call, script import, database query, timer/poller and worker involved in the priority School journeys. A registry label is an index, not implementation proof.

Create `FILE-OWNERSHIP.csv` with:

```text
path,canonical_or_generated,primary_surface,current_consumers,planned_change,run_owner,collision_risk,coordination_required
```

Create `COLLISION-HOTSPOTS.md` covering at least:

- `server.js`;
- `public/operations.html` and generated Operations files;
- `public/js/operations-shell.js` and deferred renderers;
- parent/student pages and shared styles/widgets;
- route/action registries;
- package/deployment commands;
- database migrations/index definitions;
- auth/session helpers;
- any file touched by an open remote PR or another active worktree.

Inspect current remote PRs/branches when GitHub access exists. Do not merge, close or modify unrelated PRs.

## Phase 3 — Resolve the exact priority journey URLs and useful-action markers

Do not assume query strings from memory. Discover the current canonical route/deep-link from source, route registry and actual navigation. Record exact URL, role, data fixture/account, required API groups and useful-action marker in `ROUTE-MATRIX.json`.

Required journeys:

1. School/Operations login;
2. BNA School administrator dashboard/overview;
3. students;
4. families/households/guardians;
5. classes/schedules;
6. attendance;
7. progress/goals;
8. parent portal;
9. student portal.

Define a deterministic useful-action marker for each:

- **login:** form rendered, input accepts focus/typing and submit handler is attached;
- **dashboard:** School navigation is actionable and critical School summary is visible;
- **students/families:** first bounded result page is visible and search/filter/open action works;
- **classes:** current class/schedule result is visible and open-class action works;
- **attendance:** occurrence roster is visible and first attendance control is actionable;
- **progress:** learner summary is visible and the permitted update/open action is actionable;
- **parent:** authorized learner summary/selector is visible and a primary navigation action works;
- **student:** own goal/progress/assignment panel is visible and the primary action works.

Instrument explicit `performance.mark`/`performance.measure` events or equivalent test-visible markers. Do not use `load` or DOMContentLoaded alone as “usable.”

## Phase 4 — Build a reproducible measurement harness and collect baseline

Use the existing Playwright/browser/performance harness where reliable; extend or create one focused harness when needed. Do not rely on screenshots alone.

### Viewports

- `360x800` mobile;
- `390x844` mobile;
- `768x1024` tablet;
- `1440x900` desktop.

### Sample count

For every journey/viewport combination collect:

- **30 cold samples**: new isolated browser context, empty HTTP cache/storage/service-worker state as applicable, fresh navigation and authenticated state created safely;
- **30 warm-return samples**: same valid authenticated context after one completed visit, navigate away and return using the actual product path.

Never mix failed samples into a latency percentile. Failed samples count toward error rate and must be listed. Keep raw sample JSON/CSV and a summarized report.

### Throttling and reproducibility

- Mobile: a recorded Fast-4G-style network profile and 4× CPU slowdown through CDP or the harness’s equivalent.
- Tablet: recorded network profile and 2× CPU slowdown.
- Desktop: recorded unthrottled or controlled-local profile.
- Record browser version, machine/runtime, server mode, database/fixture mode, build commit, network/CPU profile and whether service workers are enabled.
- Use the same environment/profile before and after.

### Required browser measures

For each sample capture:

- navigation start to useful-action marker;
- TTFB and response status for document and critical APIs;
- request count before useful action and total request count;
- request URL classification: School, Control Plane, provider, One Time, static, third-party;
- transfer and decoded bytes for HTML, CSS, JavaScript, fonts, images and JSON;
- initial route-specific JavaScript and CSS compressed/uncompressed sizes;
- long tasks, main-thread scripting/rendering, DOM node count at useful action and after full settle;
- console errors, page errors, failed requests, retry loops and unhandled rejections;
- duplicate request signatures and canceled/stale requests;
- polling/timer activity during the first 30 seconds;
- overlay/tap/keyboard/action availability;
- warm-return behavior;
- axe or equivalent accessibility results plus targeted keyboard/touch checks.

Strip cookies, authorization headers, private query values, response bodies and private DOM text from committed evidence.

### Required server/database measures

Add privacy-safe instrumentation when absent:

- request/trace ID;
- route group and status;
- total server duration and `Server-Timing` phases;
- authentication/session lookup count and duration;
- database query count, aggregate query time, slowest query fingerprint/duration and returned row count;
- response serialized bytes;
- external/provider call count/duration;
- cache hit/miss/stale state;
- event-loop delay and process memory at aggregate level;
- cold-start/module-initialization timing in a controlled run.

Do not log SQL parameter values or private rows. Query fingerprints must normalize literals.

Use a safe local/test database or approved read-only clone for `EXPLAIN (ANALYZE, BUFFERS)`. Never run an expensive analyzed query against production without explicit approval.

### Baseline evidence files

At minimum:

```text
BASELINE/environment.json
BASELINE/routes.json
BASELINE/samples.csv
BASELINE/summary.json
BASELINE/summary.md
BASELINE/resources.csv
BASELINE/requests.csv
BASELINE/server-timing.csv
BASELINE/query-fingerprints.csv
BASELINE/errors.md
BASELINE/accessibility.md
```

When a route cannot be authenticated or a database/query plan cannot be accessed, record the exact blocker and continue source analysis, harness creation and every route that can be measured. Do not invent or substitute old p75 values.

## Phase 5 — Derive explicit release budgets

For each route/viewport/metric calculate baseline p50, p75 and p95 from the 30 successful samples and error rate from all 30 attempts.

For useful-action and TTFB p75:

- when `baseline_p75 > professional_ceiling`, set `budget = max(professional_ceiling, 0.80 × baseline_p75)`;
- when `baseline_p75 <= professional_ceiling`, set `budget = 1.05 × baseline_p75`;
- round to a documented whole-millisecond rule;
- require post-change p95 to be no more than 10% worse than baseline p95;
- require zero functional failures in the 30 post-change samples.

Professional target ceilings:

| Metric | 360/390 mobile | Tablet | Desktop |
|---|---:|---:|---:|
| cold useful-action p75 | 3500 ms | 3000 ms | 2500 ms |
| warm-return useful-action p75 | 1500 ms | 1200 ms | 1000 ms |
| warm API TTFB p75 | 400 ms | 400 ms | 350 ms |
| cold API TTFB p75 | 800 ms | 750 ms | 700 ms |
| initial compressed JS — School admin | 250 KB | 250 KB | 250 KB |
| initial compressed JS — parent/student portal | 150 KB | 150 KB | 150 KB |
| requests before useful action — School admin | 12 | 12 | 12 |
| requests before useful action — portal | 8 | 8 | 8 |
| individual DB query p95 | 100 ms | 100 ms | 100 ms |

For request count, bytes and query count:

- when baseline exceeds the ceiling, require at least a 15% reduction and no result above the ceiling unless the source-backed route contract demonstrates a necessary dependency and the report records it;
- when baseline is at/below the ceiling, allow no more than one additional request/query and no more than 5% byte growth;
- no Control Plane, provider-marketplace, One Time, global-agent, deployment or integration-readiness request may occur before an ordinary School route’s useful-action marker.

Additional absolute gates:

- error rate `0/30` after change for every accepted combination;
- zero unhandled page/console errors and zero infinite/retry loops;
- zero dead or unclickable primary actions;
- zero critical or serious accessibility findings;
- private responses remain `no-store` and do not enter shared caches;
- no cross-role/private response leakage.

Persist formulas, baseline values and resulting budgets in `BASELINE/budgets.json`. Never silently relax a failed budget.

## Phase 6 — Implement the smallest evidence-backed stabilization set

Choose changes from measured/source-backed contribution. Do not perform broad cleanup unrelated to priority journeys.

### A. School-specific boot and route composition

- Create a dedicated School administration bootstrap/entry path or route mode that loads only School navigation, School design foundations and the active School view.
- Do not load CRM provider pipelines, provider marketplace/Studio, One Time assets, global agents/prompts/deployment/integration readiness, or Control Plane-only renderers for School routes.
- Preserve current Control Plane `/operations` behavior. Use an explicit compatibility route or feature flag when needed; do not silently break bookmarks.
- Prefer true module/asset boundaries over hiding global DOM after loading.
- Ensure parent/student ordinary boot does not load One Time review styles/scripts/data attributes or global helper code. Keep test/review fixtures isolated from production paths.
- Identify canonical source versus generated output and make generation deterministic. Do not hand-edit an artifact that will be overwritten.

### B. Lazy and usable-first rendering

- Render School shell/navigation and critical route content first.
- Load only the active view’s API/module; defer secondary cards, charts, historical panels and non-critical widgets.
- Use stable loading/empty/error states with no full-page overlay blocking primary navigation.
- Keep RTL/localization and accessibility behavior.

### C. Remove unnecessary fanout

- Build an exact route-to-API dependency list.
- Stop unconditional global data loads and background overview requests for inactive views.
- Deduplicate identical in-flight requests.
- Abort stale requests on navigation and prevent stale responses from overwriting active state.
- Replace repeated independent reads with a bounded School-specific aggregate only when it lowers total cost without creating a giant payload.
- Pause polling when the document is hidden, during text entry where current behavior requires it, and when the active view does not consume the data.

### D. Bound APIs and rendering

- Add mandatory pagination/cursor/limit and deterministic sort to priority list endpoints.
- Set safe maximum limits and explicit field projections; never preserve an unbounded fallback.
- Return total counts only when efficient and necessary.
- Virtualize or incrementally render large lists only after API bounding; do not use virtualization to conceal unbounded downloads.
- Add API contract tests for maximum limits, invalid cursors, stable ordering and authorization.

### E. Query/index fixes

- Instrument before changing.
- Find N+1, repeated auth/session reads and broad `SELECT *` paths.
- Reduce selected fields and repeated queries.
- Add indexes only with current schema and safe query-plan evidence; make migrations additive, idempotent, lock-aware and reversible through restore/unused-index strategy.
- Do not run production migrations in this prompt without a separate explicit authorization. Prepare and test them on disposable/staging data.

### F. Safe cancellation, caching and session optimization

- Cache only non-sensitive reference/configuration data with explicit keys and invalidation.
- Never share-cache account, learner, guardian, attendance, progress, message or payment responses.
- Use request-local or short-lived safe session lookup caching only when revocation/role change semantics remain correct.
- Rotate/revoke behavior and cross-role authorization tests must pass.

### G. Startup/module initialization

- Measure import/startup cost.
- Lazy-load provider, AI, Google/Gmail, Telegram, One Time and Control Plane modules outside School request/startup paths where safe.
- A temporary School entrypoint must not require Control Plane-only credentials to start.
- Preserve existing web/worker process mappings and regression-test them.

### H. Instrumentation and regression gates

- Keep `Server-Timing`, request/query/response-size and browser useful-action instrumentation privacy-safe.
- Add a repeatable `npm` command for baseline/after measurement and a CI-safe budget checker using saved fixture/local evidence.
- Ensure normal tests write transient artifacts outside tracked historical evidence directories unless an explicit run output is being committed.

## Phase 7 — Verification

Run targeted tests first, then the complete relevant suite.

Required categories:

- syntax/type/lint/build checks supported by the repository;
- route/action/security/privacy registry/watchdog checks relevant to touched files;
- School admin route/deep-link/refresh/back/forward tests;
- parent and student auth/authorization/privacy tests;
- Control Plane login/dashboard/provider/One Time regression tests sufficient to prove no breakage;
- API pagination, authorization, cancellation/deduplication/cache tests;
- migration/index tests on a disposable database where applicable;
- accessibility/keyboard/touch/RTL tests;
- performance budget checker;
- full `npm test` from the exact final commit when feasible.

Do not reuse an old test count. Record exact command, start/end time, exit code, commit, environment and report path in `TEST-RESULTS.md`.

## Phase 8 — Collect the 30-sample post-change evidence

Run the identical harness/environment/profile used for baseline. Store raw and summarized results under `AFTER/` with the same file structure.

Produce a route/viewport comparison containing:

- baseline and after p50/p75/p95 useful-action;
- derived budget and pass/fail;
- cold/warm TTFB;
- requests before useful action and total requests;
- HTML/CSS/JS/JSON/image/font bytes;
- server time, auth/session lookups, query count/aggregate/p95;
- DOM/long-task values;
- errors/retries/failed requests;
- accessibility and action availability;
- warm return;
- unexpected Control Plane/provider/One Time/global requests;
- environment limitations and evidence confidence.

A source-level improvement without complete measured evidence is `IMPLEMENTED_NEEDS_MEASUREMENT`, not “performance fixed.”

## Phase 9 — Commit, push, draft PR and deployment checkpoint

Before committing:

- run secret/private-data scan on changed files and evidence;
- ensure no cookies, auth headers, database URLs, private rows, raw screenshots containing private data or message bodies are tracked;
- verify only owned files changed;
- verify generated artifacts are current and no unrelated historical evidence changed;
- update route/action registries only when actual current behavior changed, and do not use the registry update as proof.

Use intentional commits, for example:

1. run artifacts and baseline harness;
2. School boot/fanout/API/query changes in bounded commits;
3. tests/performance evidence and final documentation.

Push the branch and open a **draft PR** when GitHub write access exists. The PR body must include:

- dynamically resolved base SHA and final head SHA;
- exact School routes and files changed;
- measured before/after table and budgets;
- API/query/index changes and migration state;
- Control Plane regression evidence;
- external mutations performed or withheld;
- deployment/canary plan and rollback;
- blockers and next branch.

Do not merge the PR automatically.

### Deployment behavior

- When an authorized BNA staging/canary target is available, deploy only the clean final commit and record deployment ID, target, resolved commit and live/canary evidence.
- Do not deploy production based only on this prompt unless the repository’s current release gate explicitly authorizes the exact commit.
- When deployment access or authorization is unavailable, finish code, tests and evidence, push the draft PR, and set:

```text
READY_FOR_BNA_STAGING_OR_CANARY
```

in `STATE.json`, `RESUME.md`, `DEPLOYMENT.md` and `FINAL-REPORT.md`.

When push is unavailable, still create local commits, preserve the external worktree, record the commit SHA and exact continuation commands, and create a non-secret local bundle/patch outside the existing user checkout when safe. Do not discard work.

## Required final report

`FINAL-REPORT.md` must contain:

1. resolved repository, remote branch/base SHA, worktree, branch, final commit and PR;
2. current checkout status before/after proving it was not mutated;
3. exact priority route URLs and useful-action definitions;
4. root causes ranked by measured/source-backed contribution;
5. before/after 30-sample results and derived budgets;
6. exact files/modules/routes/APIs/queries/indexes changed;
7. canonical/generated ownership and collision hotspots;
8. migrations and target environments; no production-data claim without evidence;
9. tests, accessibility, privacy/security and Control Plane regressions;
10. external mutations, deployment/canary state and rollback;
11. blockers distinguished as essential or nonessential;
12. remaining structural causes reserved for extraction;
13. exact next branch/commands and a fresh-window prompt requiring no previous chat.

## Stop rules

Stop the dependent operation and checkpoint when:

- remote branch resolution disagrees;
- a change would require resetting/staging the existing checkout;
- production data or a destructive migration would be required;
- an authorization/privacy defect is found;
- the final branch contains secrets/private evidence;
- an unrelated active branch owns the same critical file and safe coordination is impossible;
- production deployment lacks explicit current authorization.

Do **not** stop the whole run for a missing nonessential provider credential, authenticated production session, Railway token, deployment permission or external account. Continue source repair, local/staging tests, harnesses, evidence and draft PR, then record the exact blocker.

## Terminal statuses

Use exactly one terminal status in `STATE.json` and `FINAL-REPORT.md`:

- `COMPLETED_AND_CANARY_VERIFIED`;
- `READY_FOR_BNA_STAGING_OR_CANARY`;
- `IMPLEMENTED_NEEDS_MEASUREMENT`;
- `BLOCKED_REMOTE_TRUTH_MISMATCH`;
- `BLOCKED_SECURITY_OR_PRIVACY`;
- `BLOCKED_SAFE_WORKTREE_OR_COLLISION`.

Never use `done` without the corresponding current evidence.
