# BNA-SEP-P1-CONTROL-PLANE — Fresh-Window Codex Execution Prompt

## Mission

Create the first additive, independently bounded BNA Control Plane service scaffold, strict minimized event/command contracts, synthetic fixtures and tests in `shloimie-beep/bnei-neviim-academy`. Work from dynamically resolved remote truth in a clean external worktree. Produce code, tests, run artifacts, a commit, a pushed feature branch and a draft PR only.

## Absolute safety boundary

This run MUST NOT:

- deploy, redeploy, promote, merge or release;
- use Railway, production/staging services, DNS, certificates or live webhooks;
- connect to or mutate any live database;
- read `.secrets`, production environment variables, password stores or provider credentials;
- send Telegram, email, WhatsApp, SMS or customer/provider messages;
- call Stripe, Resend, Zoom, Vimeo, Buffer, Google, WAPI or any provider API;
- create, rotate or copy real credentials or signing keys;
- change product users, access, billing, tickets, support status, attachments or provider records;
- execute product actions from Telegram;
- run arbitrary shell/code/deploy actions from the new service;
- modify GitHub except pushing the scoped feature branch and opening/updating one draft PR;
- force-push, rewrite history, delete refs or modify unrelated branches;
- edit or wire root `server.js`, product pages or product auth/session code.

If a command would cross this boundary, do not run it. Record it in `EXTERNAL-MUTATIONS.md` as blocked with the exact reason and continue all safe work.

## Binding architecture

The new service:

- is named `bna-control-plane`;
- lives initially at `services/bna-control-plane/` for this review-only PR;
- is independently buildable and intended for later extraction to `shloimie-beep/bna-control-plane` before deployment;
- has its own package, migrations, configuration, auth interfaces and database schema;
- imports no product modules, product repositories, provider SDKs, product session/auth helpers, shell/process execution, Codex, GitHub write or Railway/deployment code;
- serves no product pages and does not proxy or iframe them;
- never accepts product cookies or impersonation/view-as tokens;
- stores only the redacted case-index allowlist;
- communicates with `one_time` and `bna_school` only through minimized signed asynchronous events and signed asynchronous commands;
- has no synchronous product read/status dependency;
- treats Telegram as link-only alert transport with no mutation capability.

## Mandatory dynamic truth resolution

The launcher should already have created a clean worktree. Re-verify it before editing:

```bash
git status --short --branch
git remote -v
git fetch origin --prune
git ls-remote origin refs/heads/master
git ls-remote --heads origin
git log -1 --format=%H origin/master
gh pr list --repo shloimie-beep/bnei-neviim-academy --state open --limit 100 --json number,title,isDraft,baseRefName,headRefName,headRefOid,updatedAt
```

Set `SOURCE_MASTER_SHA` to the exact 40-character SHA returned for `origin/master`. Confirm `HEAD` equals that SHA before the feature branch was created. If the launcher branch is not based on current `origin/master`, stop editing, record `blocked_stale_worktree` in `STATE.json`, and rebuild the external worktree from the current SHA.

Do not assume the audit-time SHA is still current.

## Required read order

Read these exact paths when present at current master:

1. `BNA-START-HERE.md`
2. `AGENTS.md`
3. `docs/BNA-RAMBLE-TO-DONE.md`
4. `ops/execution-runs/latest.json` and the pointed run
5. `docs/architecture/telegram-control-plane.md`
6. `src/platform/assistant/control-plane.js`
7. `src/platform/instances/one-time-separate-deployment.js`
8. `src/lib/bna/telegram-notifications.js`
9. `src/lib/bna/telegram-runtime-status.js`
10. `scripts/telegram-kimi-bridge.mjs`
11. `ops/route-registry.json`
12. `ops/action-registry.json`
13. `package.json`

Inspect exact open-PR heads without merging them:

```bash
gh pr view 134 --repo shloimie-beep/bnei-neviim-academy --json number,title,state,isDraft,baseRefOid,headRefName,headRefOid,files
gh pr view 135 --repo shloimie-beep/bnei-neviim-academy --json number,title,state,isDraft,baseRefOid,headRefName,headRefOid,files
gh pr view 136 --repo shloimie-beep/bnei-neviim-academy --json number,title,state,isDraft,baseRefOid,headRefName,headRefOid,files
gh pr view 137 --repo shloimie-beep/bnei-neviim-academy --json number,title,state,isDraft,baseRefOid,headRefName,headRefOid,files
```

Fetch the PR refs for read-only inspection if needed. Do not merge, rebase or cherry-pick them wholesale. The only approved reuse is a clean reimplementation of pure signing, replay, idempotency, lease/retry/dead-letter and synthetic-test patterns.

Rejected PR #136/#137 elements:

- full or sanitized support narrative in CP;
- actor/account/entitlement/contact identifiers;
- attachment filename/hash/locator/bytes/private-copy metadata;
- BNA duplicate support ticket/history authority;
- synchronous support-status endpoint;
- product ticket page inside the shared Operations app;
- Telegram decision tokens or state-changing callbacks.

## Persisted run artifacts

Use exactly:

`ops/codex-runs/BNA-SEP-P1-CONTROL-PLANE/`

The launcher creates initial files. Maintain these throughout the run:

- `ORIGINAL-PROMPT.md` — exact prompt supplied to this run; never rewrite its meaning.
- `SOURCE-PINS.json` — current master SHA, every remote head, open PR metadata, inspected file blob SHAs and audit package SHA.
- `STATE.json` — phase, status, branch, worktree, current master SHA, last commit, tests, blockers, external effects and next action.
- `LOG.jsonl` — append-only timestamped actions/results; never secrets or private data.
- `DECISIONS.md` — architecture choices and any divergence with reason.
- `TEST-RESULTS.md` — exact commands, exit codes, counts and failures.
- `EXTERNAL-MUTATIONS.md` — must enumerate branch push/draft PR and state `none` for deploy, databases, bots, messages, providers, DNS and credentials.
- `RESUME.md` — exact current state and next safe command after every meaningful checkpoint.
- `FINAL-REPORT.md` — terminal summary, diff scope, tests, blockers, PR and explicit no-deploy statement.

Update `STATE.json` and `RESUME.md` after discovery, scaffold, contracts, storage, auth, Telegram policy, tests, commit and draft-PR phases. If interrupted, the next window must be able to continue from these files without relying on chat history.

## Implementation scope

Create this bounded tree:

```text
services/bna-control-plane/
  package.json
  README.md
  contracts/
    support-case-event-v1.schema.json
    support-case-command-v1.schema.json
    command-result-event-v1.schema.json
  fixtures/
    valid-one-time-case-created.json
    valid-school-status-changed.json
    valid-assign-queue-command.json
    valid-command-result.json
    forbidden-pii-cases.json
  migrations/
    001-control-plane-v1.sql
  src/
    app.js
    config.js
    contracts.js
    security/signature.js
    security/replay.js
    security/dlp.js
    auth/principal.js
    auth/session-policy.js
    auth/csrf.js
    events/ingest.js
    cases/projector.js
    commands/outbox.js
    commands/authorization.js
    telegram/alert-renderer.js
    telegram/fake-transport.js
    storage/interfaces.js
    storage/memory.js
  test/
    signature.test.js
    replay-idempotency.test.js
    contracts.test.js
    data-minimization.test.js
    case-projector.test.js
    command-authorization.test.js
    command-outbox.test.js
    auth-boundaries.test.js
    telegram-alert-only.test.js
    import-boundary.test.js
    sql-boundary.test.js
```

Use Node.js built-ins wherever practical. Tests must run without network, database, Telegram token, OIDC secret or provider credentials. Generate Ed25519 test keys in memory. Use a fake clock and memory storage adapter. Production adapters may be interfaces/stubs that fail closed when unconfigured.

Do not add a root start/deploy hook. A focused root test script is allowed only if it invokes the new service tests and does not change runtime behavior.

## Exact contract requirements

Implement the semantics in the audit package `SIGNED-EVENT-COMMAND-CONTRACT.md`:

- Ed25519 exact-byte signatures with key ID, timestamp, 24-byte nonce and SHA-256 body digest.
- Five-minute skew, 24-hour nonce retention, stable event/command IDs and immutable collision fingerprints.
- Strict schemas with `additionalProperties=false` at every object.
- Event types: case created/status/routing/SLA/deleted and command result.
- Products: `one_time`, `bna_school`.
- Only categorical case fields, optional 160-character deterministic-DLP summary and allowlisted tokenless product deep link.
- Commands: assign queue, set severity, request information by template code, close and reopen.
- No free-text command note.
- Browser-session principal plus RBAC is required to enqueue a command.
- Telegram principal is always denied.
- Product expected-version is mandatory and product remains authoritative.
- No raw request-body persistence or logging.

## SQL boundary

`001-control-plane-v1.sql` may define only:

- `cp_product_keys`
- `cp_event_nonces`
- `cp_event_inbox`
- `cp_cases`
- `cp_case_projection_events`
- `cp_command_outbox`
- `cp_command_results`
- `cp_operators`
- `cp_sessions`
- `cp_audit_events`
- `cp_telegram_alert_outbox`

Do not use product tables, foreign data wrappers, cross-database links or catch-all payload columns. JSON may be used only for a tightly validated low-risk metadata object when a scalar schema is demonstrably insufficient; default is scalar columns. The SQL boundary test must reject forbidden table/column names and broad raw-body/payload storage.

Do not apply the migration anywhere.

## Auth boundary

Implement policy and unit-testable interfaces for:

- cookie name `__Host-bna_cp_session`;
- `Secure`, `HttpOnly`, `SameSite=Strict`, `Path=/`, no Domain;
- 30-minute idle and 12-hour absolute timeout;
- roles `cp_viewer`, `cp_triage`, `cp_admin`, `cp_auditor`;
- CSRF requirement on state-changing browser requests;
- product cookies/credentials never authenticate to CP;
- fixture principals available only under `NODE_ENV=test`;
- missing production auth configuration fails closed.

Do not integrate a live identity provider.

## Telegram boundary

Implement only a pure alert renderer and fake transport. The renderer accepts an exact allowlisted object containing CP case ref, product, severity, queue, status, opened time and CP URL. It rejects extra fields and renders one `Open case` URL button. No callback data, command creation, ticket mutation, Codex, shell, deploy or provider action exists.

Do not read Telegram environment variables and do not send a message.

## Import and dependency boundary

The import-boundary test scans the new service and fails if it imports or references:

- root `server.js`;
- `src/lib/bna` product/CRM/student/parent/provider modules;
- `src/lib/integrations`;
- product public pages or Operations product shell;
- `child_process`, shell execution, Codex, Railway, deploy/release scripts;
- product session/auth helpers;
- product database table names outside synthetic forbidden-test strings.

The service package must not depend on provider SDKs.

## Safe behavior around missing dependencies and secrets

- Never inspect `.env`, `.env.local`, `.secrets` or host credential stores.
- Use only committed example configuration names and generated synthetic test values.
- If package installation requires network and dependencies are unavailable, continue with Node built-ins and record the constraint; do not weaken tests.
- Missing production database/OIDC/Telegram/signing configuration must not block contract, fixture, memory-adapter or unit-test work.
- Non-test startup fails closed with a concise configuration error.
- No test may make a network request; install a test guard that fails on `fetch`, `http`, `https`, socket or child-process use from service tests.

## Verification

Run and record exact output/exit codes:

```bash
node --check services/bna-control-plane/src/app.js
node --check services/bna-control-plane/src/security/signature.js
node --test services/bna-control-plane/test/*.test.js
node -e "for (const f of require('fs').readdirSync('services/bna-control-plane/contracts')) JSON.parse(require('fs').readFileSync('services/bna-control-plane/contracts/'+f,'utf8')); console.log('contract-json-ok')"
npm run secrets:audit
git diff --check
git status --short
```

Run focused existing tests only when they do not require secrets/network and are relevant to shared policy drift. Do not treat unrelated pre-existing failures as success; record them precisely. Do not run live smoke, provider smoke, Railway commands or bot readiness commands.

Review the final diff for accidental product/runtime wiring:

```bash
git diff --name-status origin/master...HEAD
git diff --stat origin/master...HEAD
git grep -n -E "railway|deploy|child_process|TELEGRAM_BOT_TOKEN|DATABASE_URL|STRIPE|RESEND|ZOOM|VIMEO|BUFFER|WAPI" -- services/bna-control-plane ops/codex-runs/BNA-SEP-P1-CONTROL-PLANE
```

Expected matches are policy text, denylist tests or fail-closed configuration names only. Explain each match in `FINAL-REPORT.md`.

## Commit and draft PR

Before commit:

- confirm only `services/bna-control-plane/`, the scoped run directory and an optional focused package script changed;
- remove generated dependencies, coverage, temporary keys and runtime files;
- run all verification again;
- update `STATE.json`, `RESUME.md`, `TEST-RESULTS.md`, `EXTERNAL-MUTATIONS.md` and `FINAL-REPORT.md`.

Commit message:

`feat(control-plane): add isolated v1 contracts and tests`

Push the feature branch normally. Open one draft PR against the dynamically resolved `master` with title:

`BNA-SEP-P1: scaffold isolated control-plane contracts and tests`

The PR body must include:

- exact base and head SHAs;
- architecture boundary;
- files changed;
- focused test results;
- statement that PR #136/#137 crypto/outbox patterns were reimplemented without their detailed-ticket/status/Telegram-decision design;
- statement that no product routes, root `server.js` wiring, deployment, live database, migration apply, Telegram send, message, provider mutation, DNS or credential change occurred;
- remaining steps requiring separate approval.

Do not mark ready for review, merge, deploy or run a live canary.

## Terminal status

Use one terminal state in `STATE.json`:

- `DRAFT_PR_OPEN_SAFE_SCOPE_COMPLETE`
- `SAFE_SCOPE_COMPLETE_PR_BLOCKED`
- `BLOCKED_STALE_SOURCE`
- `BLOCKED_UNSAFE_BOUNDARY`
- `FAILED_TESTS`

A missing optional secret is not a terminal blocker for this scoped run. Continue contract, fixture, memory-adapter and test work. Stop only for stale source, unsafe boundary, irreducible test failure or inability to create the scoped branch/draft PR.

At completion, print the exact worktree, branch, base SHA, head SHA, draft PR URL, terminal state, test summary and the sentence:

`No deployment, live database access, migration apply, Telegram send, provider mutation, DNS change, credential change or PR merge was performed.`
