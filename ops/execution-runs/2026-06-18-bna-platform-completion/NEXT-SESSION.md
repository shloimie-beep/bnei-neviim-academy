# Next Session

Updated: 2026-06-19T09:45:30+03:00

Resume the active execution run. Do not restart, re-plan, run a baseline UI crawl, run watch loops, or deploy.

Current branch: `codex/2026-06-18-bna-platform-completion`.

Latest completed local batches:

- REQ-20260618-165: Signup pages, signup thank-you, and parent manifest now use direct parent signup/self-governance messaging and consistently say parent app access is six months free.
- REQ-20260618-166: Portal header identity coverage now spans public/provider, parent signup launch, Student Portal, Operations shell, and Operations login while preserving manifest separation.
- REQ-20260618-167: Public/blog/FAQ/signup/student routes and CTAs now use clean public aliases and stay out of the private Operations shell.
- REQ-20260618-168: Guarded TEST-BNA-SEED plan/seed/cleanup commands now cover the required isolated fixture lanes with safety rails and tests.
- REQ-20260618-169: Focused Playwright acceptance coverage now exercises Operations route/history, responsive overflow, workspace selector scoping, Assistant context, student detail routing, and Student Portal Hebrew RTL.
- REQ-20260618-170: Backend/API/RBAC negative tests are locally terminal with route guard, real HTTP middleware, users, and accounting scope coverage.
- REQ-20260618-114: Source-of-truth files now describe the active recovery run, audit-only blockers, first-party Operations runtime direction, release gate, and exact resume path.
- REQ-20260618-124: Workspace-owned entity scoping is locally implemented through schema/backfill/create-path foundations plus hardened content job, bundle, output, prompt-example, mixed-recording, and Operations content write-path project checks.
- REQ-20260618-111: Safe test data and complete acceptance coverage parent rollup is locally closed because REQ-168, REQ-169, REQ-170, and REQ-171 are terminal with evidence and the combined acceptance set passed.
- REQ-20260618-101: Audit harness/audit package parent is terminally blocked on authenticated audit package/output only; its non-audit/protocol children are closed and this blocker does not pause unrelated local work.
- REQ-20260618-126: Operations workspace selector behavior has refreshed browser proof for a scoped One Time ordinary user: locked workspace context, no global selector, One Time task/calendar API calls, and mobile overflow safety. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-127: Workspace switching has refreshed static and browser proof for stale module/filter/student/content/helper reset. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-128: Operations module toolbar now has static and browser DOM proof for full super-admin order, scoped allowedViews filtering, and responsive overflow safety. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-129: Operations sidebar/workspace navigation now has static and browser DOM proof that the sidebar is workspace context only, module navigation is not duplicated, and scoped users do not see global workspace directory UI. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-130: Operations shell stability now has static and browser proof that the shell/view frame stay non-collapsed after viewport, module, history, workspace switch, and refresh changes. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-131: Portal/header identity now has static and browser DOM proof for Operations private manifest/logo/identity/language and Student Portal logo/identity/language controls. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-132: Operations shared design primitives now have static and browser DOM proof for high-contrast surfaces, shared type/spacing/radius, button/control primitives, focus-visible styling, mobile touch target overrides, and non-negative app-shell letter spacing. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-133: Operations mobile controls now have static and browser DOM proof for scroll-capable rails, 44px touch targets, nowrap task-row actions, sticky stacked modal footer actions, and touch-safe modal close behavior. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-134: Operations desktop grids now have static and browser DOM proof for balanced task overview and student profile tracks/cards with collapsed auto-fit tracks excluded from the balance check. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-135: Operations accessibility now has static and browser DOM proof for keyboard task-row activation, modal semantics, accessible labels/descriptions, focus placement, Escape close, focus restoration, pressed/current state, and preserved modal focus after async task-comment re-render. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-136: Canonical task states now have static/backend and browser DOM proof for legacy needs_decision alias normalization, Status: Decision rendering, decision_required modal normalization, checked Decision Required state, and the six canonical stage options. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-137: Task metadata/provenance separation now has static/API and browser DOM proof for labeled owner/status/urgency/due/blocker/source badges, concise titles without raw ramble text, blocker modal editing, and separate Source/Raw ID provenance metadata. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-138: Intake routing now has static/API and browser DOM/action proof that low-confidence intake lives in Decisions, shows File as my task / Send to System Work / Archive choices, exposes no Review Queue or Intake Review lane, and applies option-specific updates. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-139: Internal Calendar now has static/API and browser DOM proof for scoped task, class, check-in, student event, and group-goal items, with no external sync controls. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-140: Main task UI diagnostics cleanup now has static and browser DOM proof that stale worker/proof-gap/queue-health concepts are absent while Changelog remains a normal activity lane. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-141: Live scoped counts/blocker explanations now have static and browser DOM proof that task overview counts come from scoped buckets and blocked metrics link to visible blocked records with blocker notes. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-142: Idempotent parser routing has refreshed focused parser/backend evidence that deterministic parser item keys, scoped student matching, and idempotent task/accountability/group/timer routing prevent duplicates. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-143: Workspace-scoped communities now have static/API and browser DOM proof that Contacts requests the selected workspace and shows workspace labels for scoped community records. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-144: Content boundary now has static/backend and browser DOM proof that reusable teaching/research material renders in the selected workspace Content card while task, accountability, progress, timer, and parser-review phrases are filtered out. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-145: Content metadata/provenance now has static/API and browser DOM proof that expanded Content cards show selected workspace, Drive/source, transcript/parse, output, approval, date, Drive ID, Telegram source, media URL, and local capture metadata. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-146: Workspace-specific Drive routing now has static/API and browser DOM proof that One Time content jobs/bundles use the selected workspace project, show One Time Drive folder/file provenance, and exclude the BNA Drive folder. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-147: Workspace-scoped live classes now have static/API and browser DOM proof that One Time Calendar uses the selected workspace project, shows the One Time class-session item with workspace label, and excludes a BNA-only class fixture. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-148: Scoped Automations now has static/API and browser DOM proof that selected One Time workspace status rows show owner, status, last run, next run, failure reason, detail counts, and workspace labels while excluding BNA automation rows. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-149: Scoped Integrations now has static/API and browser DOM proof that selected One Time workspace rows show Buffer Connected/Not connected/Error states, account identity, last check, needed action, failure reason, and workspace labels without active GHL social-runtime copy. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-150: Workspace-scoped Users now has static/API and browser DOM proof that selected One Time rows show users, roles/access levels, login usernames, invitation records, and no mutation/send controls while excluding BNA rows. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-151: Workspace-scoped Accounting now has static/API and browser DOM proof that selected One Time rows show payments, payment intake, reminders, Green Invoice webhook audit rows, summary counts, methods/statuses/emails/amounts, and no payment/send/reprocess mutations while excluding BNA rows. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-152: Student detail isolation now has static/API and browser DOM proof that selected One Time rows request and render only One Time student/detail/goal/device data, clear the stale BNA profile route after workspace switch, and exclude BNA student detail text. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-153: Goal Board control language now has static and browser DOM proof that selected One Time Goal Board and Tablet Access controls use plain product labels and exclude old internal/mock/provider wording. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-154: Goal Board lane separation now has static and browser DOM proof that selected One Time renders separate Current Goals, Progress / Check-ins, Approvals, and History lanes with counts/empty states and pending review isolated in Approvals. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-155: Hebrew/RTL now has static and browser DOM proof that Student Portal HE mode renders RTL layout, Hebrew dynamic labels/actions/details, LTR access-code entry, no English fallback labels, and no mobile horizontal overflow. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-157: Assistant shell now has static/API and browser DOM proof that Operations renders exactly one BNA Assistant shell with connected AI readiness, scoped memory/action registry context, and no duplicate Codex/Kimi/helper persona labels. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-158: Assistant memory scoping now has static/API and browser DOM proof that selected One Time scope requests and renders project/session/role/subject context without exposing raw user keys or usernames. It remains needs_verification only for release approval, deploy, and live smoke.
- REQ-20260618-159: Assistant action registry now has static/API and browser DOM proof that permitted ready/gated rows render risk, confirmation, and audit metadata without execution controls. It remains needs_verification only for release approval, deploy, and live smoke.

Exact next requirement:

- REQ-20260618-160 / BNA-HELPER-004: Confirmation tiers and action audit trail.

Blocked requirement intentionally skipped:

- REQ-20260618-156 / BNA-STUDENT-002 remains `needs_operator_decision` because duplicate Menachem cleanup requires production/student data merge approval after safe local dry-run evidence. Do not mutate production data without explicit operator approval.
- REQ-20260618-101 / audit parent remains `blocked` until the authenticated audit ZIP/output path is available. Do not start a new baseline crawl.

Exact next command:

```powershell
npm run bna:run:status
node --test tests/assistant-actions.test.js tests/assistant-shell.test.js tests/browser-acceptance.test.js
```

Then inspect whether `REQ-20260618-160` needs refreshed browser/API evidence beyond the existing Assistant action tests so confirmation tiers, audit rows, and no unconfirmed helper mutations are proven. Do not close live-required task items as `done` without release approval, deployment, and live-smoke evidence.

Still open after this batch:

- REQ-20260618-124 through REQ-20260618-155 and REQ-20260618-157 through REQ-20260618-159 remain `needs_verification` because local implementation and tests pass, but release approval, deployment, and live smoke are still pending.
- REQ-20260618-160 through REQ-20260618-167 remain `needs_verification` until final acceptance sweep, release approval, deploy, and live smoke where applicable.
- REQ-20260618-156 remains `needs_operator_decision` for duplicate-student cleanup approval.
- Audit-output-only items remain blocked only where screenshot/audit output is genuinely required.

No deployment or production-data mutation is approved.
