# RAW-20260710-003 - Codex Follow-Up One Time Owner Experience Closure

- Source channel: codex_goal_objective_download
- Source file: C:\Users\User\Downloads\codex-followup-one-time-owner-experience-closure (1).md
- Captured at: 2026-07-10T13:57:04+03:00
- Workspace/project: rabbi_sheller_provider / one_time_mishnah_class
- Privacy: repo-safe prompt packet; no secrets preserved by Codex
- Parse status: active_closeout_in_progress

## Parsed Scope

- `REQ-20260710-008`: normalize visible One Time / One Time Mishnayos brand
  labels across public, member, classroom, parent, student, provider,
  Operations, helper, email/WAPI/readiness, prompt, and test surfaces.
- `REQ-20260710-010`: repair stale evidence guardrails, including the
  shared-review smoke selector and the PQC validator false-positive on
  non-PQC prompt JSON.
- `REQ-20260710-011`: review authenticated One Time Operations content with
  safe redaction; current local route proof passes, but readable screenshot
  proof remains review-limited.
- `REQ-20260710-012`: keep Agent Mode proof blocked until an Agent Mode runner
  actually saves `AGR-*` PASS/FAIL/BLOCKED results for the two required prompt
  URLs.

## Raw Source

# Codex Goal-Mode Follow-Up â€” One Time Whole-Interface Owner Experience and Ramble Closure

Repository: `shloimie-beep/bnei-neviim-academy`

Canonical production: `https://join.onetimeonetime.com`

Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

## Mission

Determine, from source through live production, whether every One Time / Rabbi Scheller ramble and UI complaint has reached a truthful terminal state. Then implement every safe, unblocked gap, deploy the result, and run one complete owner/role experience of the live interface.

Do not stop with another audit, prompt packet, scorecard, or list of things to do. Audit first, implement the safe gaps in the same run, deploy, rerun the complete journey, and close every atomized source statement as exactly one of:

- `Done â€” deployed and live-verified`
- `Already satisfied â€” current live proof attached`
- `Blocked â€” external dependency, owner, and one exact next action`
- `Needs operator decision â€” choices and recommended choice stated`
- `Failed â€” failure evidence and repair task created`

Prompt-created, test-created, locally-passed, merged, deployed, and live-verified are different states. Never substitute one for another.

## Current audited baseline â€” verify again before acting

The cloud audit that generated this prompt found `master` at `159c75c767142cca701fae8fcac6d88a0dfb6b21`. Re-fetch current `origin/master` and use newer evidence if the branch has advanced.

Do not redo proven work:

- `REQ-20260710-007` / `UIGAP-20260710-001`, mobile navigation containment, is genuinely Done: commit `0017b458`, One Time Railway deployment `90990bd3-676f-433f-8a97-dfa6fa4723b7`, live 390/430 proof.
- `REQ-20260710-009` / `UIGAP-20260710-003`, provider long-text containment, is genuinely Done: commit `f3368cfe`, deployment `f338b59b-a545-40ab-b952-13b4111ecd2a`, tracked 390/430/1440 proof.
- The newer launch-priority lane added the real public landing media/copy, Robot Scheller, public interest-to-first-party-CRM flow, CRM list/detail/timeline, blocked transactional follow-up ledger, and normal Rabbi backend cleanup. Relevant commits include `f240b031`, `1d1a84b2`, `353a0f33`, `fc399bab`, `cb0bbe32`, `692eac50`, and closeout `159c75c7`. Verify them from current source and production; do not assume their broad closeout language proves unrelated gaps.

The same audit found the following still open or contradictory:

- `REQ-20260710-008`: One Time visible brand/copy normalization is Open. Live source still mixes `OneTimeOneTime`, `One Time Mishnayos`, and other labels across landing, provider, member, parent, and student surfaces.
- `REQ-20260710-010`: source/screenshot evidence guardrail and stale-audit mapping are Open. Existing screenshots were reported as zero by source coverage, and canonical JSON/Markdown matrices are stale after later fixes.
- `REQ-20260710-011`: authenticated Operations content-level manual review is Open/review-limited.
- `REQ-20260710-012`: two Agent Mode proof prompts remain Blocked/not started; generating their prompts is not proof that they ran.
- `scripts/smoke-one-time-shared-review-live.mjs` still requires stale selector `.hero-media-placeholder`, while the current landing uses `.hero-media`.
- Some launch-priority closeout reports cite final live proof files that are absent from current `master`; rerun and commit the authoritative tracked evidence instead of relying on prose.
- The existing â€œall ramblesâ€ matrix contains only 20 high-level statements sourced mainly through `RAW-20260710-001`; it did not atomize the historical One Time RAW inputs that the audit was supposed to reconcile.
- Current provider source may still show raw workspace/project keys or review/setup language in ordinary signed-provider states. Do not accept `REQ-20260710-023` as terminal without route-state browser proof.
- The public/member/provider experience is materially implemented, but the rich parent UI is still preview-oriented, student is partly a generic BNA portal with a One Time specialization, and `provider-participant` contains prototype/hardcoded/disabled behavior. Empty library/classroom content and unconfigured actions must not be mistaken for a finished customer experience.
- The last committed production-readiness snapshot says `not_production_complete` and predates current master. It must be regenerated after this work.

## Authorization and boundaries

Authorized in this run:

- read the entire repo and relevant GitHub history;
- read existing redacted live data through approved authenticated APIs/UI;
- use secure browser takeover when login is required;
- edit application/UI/test/audit files needed for these scoped gaps;
- run tests, screenshots, smokes, watchdogs, and privacy/security checks;
- commit and push intentional scoped changes;
- deploy app-visible fixes to the existing One Time Railway production service;
- run live no-send/no-charge/no-publish verification;
- update the canonical requirements, task ledger, changelog, gap register, source matrix, and proof indexes.

Not authorized:

- real email, WhatsApp/WAPI, Telegram, SMS, or campaign sends;
- charges, checkout, subscriptions, refunds, or access grants;
- production contact import or historical mailbox backfill;
- Vimeo/Zoom/Drive/provider-account writes;
- DNS, credential, secret, payment, pricing, or legal-policy changes;
- deletion of branches, records, apps, contacts, media, or audit evidence;
- GHL or LeadConnector runtime;
- exposure of credentials, raw private emails, message bodies, student data, tokens, cookies, or private screenshots.

External blockers must not stop unrelated UI and proof work.

## Phase 0 â€” establish one trusted current state

1. Read `BNA-START-HERE.md`, `AGENTS.md`, `QUALITY-GOALS.md`, `GOAL-MODE.md`, `MEMORY.md`, `SYSTEM-STATE.md`, `TASKS.md`, the newest relevant `tasks-pending/*.md`, and current route/action registries.
2. Inspect `git status`, local-only commits, current branch, `origin/master`, open PRs, and active agent/release lanes. Preserve unrelated or unpushed work; use a clean worktree if needed.
3. Start from the newest safe master. Record starting SHA and live Railway deployment SHA/ID.
4. Refresh, do not trust, these source-of-truth files:
   - `tasks-pending/2026-07-10-onetime-ramble-to-terminal-ui-gap-audit.md`
   - `ops/ui-audits/2026-07-10-onetime-ui-gap-register/report.md`
   - `ops/ui-audits/2026-07-10-onetime-ui-gap-register/report.json`
   - `ops/system-audits/2026-07-10-onetime-ramble-to-terminal-gap-audit/source-statement-matrix.json`
   - `ops/system-audits/2026-07-10-onetime-ramble-to-terminal-gap-audit/lifecycle-gap-matrix.json`
   - `ops/system-audits/2026-07-10-onetime-ramble-to-terminal-gap-audit/stale-status-reconciliation.md`
   - `ops/production-readiness/latest-production-readiness-snapshot.*`
   - `ops/production-readiness/latest-production-unblocker.*`
5. Fix the stale shared-review smoke selector immediately, then make the holistic smoke pass against current landing structure. A test that checks removed placeholder markup is not product proof.

## Phase 1 â€” perform the missing source-complete ramble reconciliation

Do not merely reread `RAW-20260710-001`.

1. Enumerate every One Time/Rabbi-linked raw input, memory entry, requirement register, relevant GitHub issue/PR closeout, Agent Review result, screenshot audit, and current product decision.
2. Traverse the historical RAW IDs and source links referenced by the control-tower files. Atomize each concrete complaint or desired behavior. Preserve safe provenance; never commit private raw content.
3. Build one canonical matrix with at least:
   - raw/source ID and date;
   - concise original intent;
   - expected visible behavior;
   - workspace/project;
   - role and route;
   - viewport/state;
   - current implementation files;
   - test/evidence paths;
   - current live observation;
   - exact terminal status;
   - requirement/gap/decision ID;
   - exact next action and owner when not Done.
4. Detect and reconcile duplicates, superseded requests, contradictory old docs, and broad â€œDoneâ€ claims whose evidence proves only a smaller slice.
5. Every complaint must have a direct path to current code and current live proof or a precise blocker. A prompt packet, task title, audit paragraph, or status checkbox alone is not evidence.
6. Update existing canonical records instead of creating another disconnected register.

## Phase 2 â€” close the currently known UI/process gaps

Execute the substance of the existing WINDOW-03 through WINDOW-06 packets directly if they are still unimplemented. Do not create another layer of prompts unless a genuinely new independent blocker is discovered.

### A. Brand and copy normalization â€” REQ-20260710-008

- Define and apply one visible product-name contract. Use `One Time` / `One Time Mishnayos` consistently as the user-facing product name. Keep `onetimeonetime.com` and email/domain values unchanged where they are real technical identifiers.
- Remove visible `OneTimeOneTime` branding from ordinary public, member, parent, student, provider, classroom, login, email-review, title, nav, footer, and helper surfaces unless an explicitly approved brand config says otherwise.
- Preserve the exact helper identity `Robot Scheller` and descriptive copy `Rabbi Scheller's digital assistant`.
- Keep the public headline `Your Child Can Love Learning Mishnayos`, the free-class CTA, black/white/yellow brand, real Rabbi hero/teaching images, and first-party CRM path.
- Remove literal placeholder brands such as `Naki`, broken asset stand-ins, review/TODO/test/protocol language, and the stray landing CSS brace if still present.
- Centralize the contract so tests and smoke scripts do not reintroduce old naming.

### B. Shared chrome and million-dollar UI consistency

Inspect the implementation, not only screenshots. Where safe and reasonably scoped, converge public landing, member, classroom, parent, student, and provider One Time surfaces on shared header/footer/nav/helper primitives or a shared data contract rather than copied divergent markup.

Durable rules:

- One Time uses black + yellow; BNA cream/navy/teal/cyan must not bleed into normal One Time surfaces.
- Desktop logo target 56â€“64px; mobile 44â€“52px where current design permits.
- Active nav: yellow background with black text.
- Main backend categories belong in the left sidebar; top row contains only the selected category's subcategories.
- Do not restore duplicate horizontal navigation, oversized top control panels, â€œAll operations,â€ random ask/search/date/task clusters, or workspace-switch plumbing inside the ordinary Rabbi view.
- Filters occupy a predictable consistent row across contacts, content, communications, tasks, payments/access, and studio.
- Buttons have consistent height/radius/active/disabled states; mobile tap targets are at least 44px.
- No horizontal page overflow, clipped nav, helper overlap, or awkward email/status wrapping at 390, 430, 768, 1024, or 1440.
- Normal Rabbi/provider views must not expose raw workspace/project keys, Super Admin diagnostics, Codex Queue, watchdog/test labels, implementation jargon, or â€œnot scopedâ€ language.
- A visible action must work, navigate, or clearly state a genuine blocker. Hide internal-only actions from customer/provider roles. Do not present dead prototypes as product features.

### C. Parent, student, participant, content, and classroom truth

Do not award production credit to fixture-only, preview-only, hardcoded, or disabled screens.

- Determine the intended production parent/member journey. If the rich parent interface remains preview-only while `/one-time-parent` is only invite/password setup, either complete the safe production journey or record a product decision with exact missing data/actions. Do not call it a finished parent portal.
- Prove a dedicated, properly scoped One Time student experience. If it is a server specialization of generic BNA `student.html`, prove the normal production route, copy, navigation, privacy, and logout/back pathâ€”not just `?review=one-time` fixtures.
- Audit `provider-participant`. Remove/hide hardcoded pricing and misleading disabled feature cards from launch surfaces, or implement the approved first-party behavior. Do not expose $67/$149 or other prices unless the canonical pricing decision says so.
- Prove member library and classroom behavior with real safe scoped data or an honest empty state. â€œNo visible video,â€ no assignments, no curriculum, or manual sample Vimeo references must appear as precise operational blockers, not as a completed content experience.
- Prove provider content/class manager, CRM, mailbox, tasks, automations, calendar, payments/access, and studio sections. Separate working first-party behavior from preview, disabled, and external-setup states.
- No One Time classroom/content data may bleed into BNA school or another provider workspace.

### D. Evidence guardrail and stale audit repair â€” REQ-20260710-010

- Make screenshot/source coverage detect the screenshots that actually exist.
- Require route, role, viewport, auth state, source statement, before/after, commit, deployment, and live URL metadata for app-visible UI closeout.
- Reconcile or archive stale One Time UI audit mappings. Update stale JSON and Markdown together.
- Repair contradictory statuses for gaps already completed and reopen any over-closed item whose required proof is missing.
- Rerun audit governance and protocol-drift watchdogs. Zero findings must mean the source matrix actually reaches terminal evidence.

### E. Authenticated Operations manual review â€” REQ-20260710-011

- Use stored approved authentication or pause for browser takeover. Never ask for credentials in chat.
- Capture trusted, safely redacted screenshots that preserve enough UI text to judge information architecture and content quality.
- Review the normal One Time Operations experienceâ€”not a blurred image that proves only boxes exist.
- Verify categories, subcategories, filters, buttons, first useful content, role/scope banner, blocked states, and return paths.
- If security policy requires redaction, redact private values while retaining labels, hierarchy, and action state.

### F. Agent Mode proof â€” REQ-20260710-012

These two prompts must actually reach terminal saved Operations results:

- `rabbi-telegram-helper-ticket-smoke`
- `rabbi-helper-tool-scope-map`

If this Codex environment cannot run Agent Mode itself, do not mark the requirement Done. Verify prompt and drop-off URLs are live, prepare one exact operator action for each, and keep status `Blocked â€” needs Agent Mode runner` until an `AGR-*` PASS/FAIL/BLOCKED result is saved and read back.

## Phase 3 â€” run the complete live owner experience

After implementing the known gaps, experience the interface as a real product. Use browser automation plus manual visual judgment. Run desktop/tablet/mobile at 1440, 1024, 768, 430, and 390 where relevant.

### Public visitor and lead journey

1. Open `https://join.onetimeonetime.com/one-time/`.
2. Verify hero, real images, copy, header/footer, Robot Scheller, WhatsApp icon/readiness behavior, CTA hierarchy, mobile navigation, member login, privacy/terms, and no BNA/internal language.
3. Exercise the free-class form with the existing TEST/dry-run/reversible smoke path.
4. Prove the lead appears once in the first-party One Time CRM with correct source, timeline, no-send follow-up status, and cleanup/rollback where the smoke contract requires it.

### Super Admin and role navigation

1. Log in once as Super Admin.
2. Navigate to the scoped One Time workspace.
3. Prove the role, workspace, project, live-versus-preview state, and return-to-Super-Admin path are obvious.
4. Exercise the safe audited `view as Rabbi/provider`, `view as member/parent`, and `view as student` paths if implemented.
5. Prove wrong-role and wrong-workspace access is rejected and private data does not leak.

### Rabbi/provider experience

Experience overview, CRM list/detail/timeline, mailbox, participants/users, content/classes/library, calendar/schedule, tasks/decisions, automations, payments/access status, settings, and studio. Verify:

- one clear information architecture;
- no duplicate toolbars;
- no Super Admin plumbing in normal provider view;
- real actions versus blocked actions are unmistakable;
- no raw scope keys/review/test language;
- long text and emails fit;
- useful empty states and next actions;
- browser back/forward and mobile back/drawer paths work.

### Member/parent/student/classroom experience

Prove the actual normal production routes and auth model, not only review fixtures:

- member home and library;
- parent invite/login/home/child view;
- student login/home/class/library/worksheet/Rabbi-question path;
- classroom video/material/update/community states;
- logout, expired/invalid link, wrong-role, and empty states.

Record missing functionality honestly. If a feature depends on Stripe, Vimeo, WAPI, Zoom, pricing, content population, or another external decision, keep it visible only when the blocker is useful and phrased for the user; otherwise hide it from the normal experience.

### Interaction proof

For every visible primary/secondary action on audited routes, record:

- label and selector/action key;
- intended behavior;
- actual behavior;
- API/handler;
- role/scope;
- working, preview, disabled, blocked, or hidden state;
- mobile behavior;
- test/evidence.

No console errors, uncaught page errors, broken images, failed required requests, overflow, inaccessible controls, or dead-end buttons may remain on launch-critical routes.

## Phase 4 â€” fix what the live journey finds, then rerun it

Do not merely report obvious safe defects. Fix them in the same run, add regression coverage, deploy through the existing One Time Railway path, and rerun the affected journey plus the complete critical smoke.

For product decisions or external systems, create/reuse one canonical Decision, show the recommended option and consequence, and keep the related UI honest. Do not let an external blocker obscure or postpone unrelated UI repairs.

## Phase 5 â€” refresh production readiness and issue a layered verdict

Regenerate current production readiness on the final audited master/deployment. The prior committed snapshot is stale.

At minimum run current equivalents of:

- shared-review holistic live smoke;
- One Time separate-instance smoke;
- public landing/lead dry-run and CRM E2E smoke;
- provider/Operations CRM smoke;
- parent/member/student/classroom route and auth smokes;
- route-role/view-as, privacy, workspace isolation, security, action registry, secrets, audit governance, and protocol-drift checks;
- production readiness snapshot, unblocker, and gate.

Report three separate verdicts:

1. `PUBLIC_FREE_CLASS_LANE`: ready / conditional / not ready.
2. `OWNER_AND_ROLE_INTERFACE`: ready for owner acceptance / conditional / not ready.
3. `FULL_COMMERCIAL_AUTOMATION`: ready / blocked, with exact Stripe/WAPI/campaign/Vimeo/Zoom/content/import/Telegram decisions from fresh readback only.

Do not call the whole product production-ready merely because the immediate lead-capture lane is live. Conversely, external payment/campaign blockers must not cause already-proven public/UI work to be called broken.

Final production-ready requires:

- all historical One Time UI source statements terminal;
- `REQ-20260710-008`, `010`, `011`, and `012` terminal or precisely blocked where external runner proof is genuinely required;
- no stale selector or contradictory gap/status matrices;
- a fresh authenticated role journey after the final deployment;
- latest audited commit equals deployed commit;
- production readiness gate is green for the declared launch scope;
- owner-facing blocker/decision list contains no vague â€œnot configuredâ€ entries.

## Required evidence and closeout

Create/update one authoritative closeout package, using existing repo conventions, containing:

- executive `report.md` and machine-readable `report.json`;
- historical RAW-to-atomic-complaint matrix;
- route/role/state/action matrix;
- before/after screenshot index at 1440/1024/768/430/390;
- implementation and test matrix;
- current deployment/live-smoke matrix;
- terminal requirement/gap/decision table;
- exact owner experience walkthrough with direct URLs;
- layered production-readiness verdict;
- rollback/resume notes.

Update the original UI gap register, source/lifecycle matrices, `TASKS.md`, `ops/agent-task-ledger.jsonl`, `ops/agent-changelog.md`, audit governance, and relevant drop-off status. Do not create a new completion claim while leaving the old canonical records stale.

Final chat response must begin with the truth, not activity:

`ONE_TIME_VERDICT: <ready | conditional | not_ready>`

Then provide:

- latest audited/deployed commit and deployment ID;
- Done / open / blocked counts from the historical source matrix;
- the three layered readiness verdicts;
- direct owner-tour URLs in order;
- remaining operator decisions with one exact action each;
- commits, tests, screenshots, live smokes, and authoritative report paths.

Do not say â€œall rambles are doneâ€ unless every atomized historical source statement has terminal proof.
