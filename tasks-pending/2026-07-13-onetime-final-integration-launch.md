# One Time Final Integration Launch - 2026-07-13

Raw ID: `RAW-20260713-010`

Raw source: `raw-input/RAW-20260713-010-one-time-final-integration-launch-prompt.md`

SHA256: `sha256:BEC7D0B514919621FF8AFD25E9D95D29287F46A18B397EDB9361508BBFCDF13F`

Gate 1 audit: `ops/system-audits/2026-07-13-onetime-final-integration-launch/report.md`

Next unblocked requirement: `REQ-20260713-934`

## Requirements

- `REQ-20260713-931` done - Register RAW-20260713-010 as the active One Time launch correction source
- `REQ-20260713-932` done - Complete Gate 1 freeze and current-truth audit
- `REQ-20260713-933` done - Reproduce current P0 One Time role, performance, CRM, content, and mobile defects
- `REQ-20260713-934` in_progress - Fix One Time identity, navigation, CRM/content, mobile, and performance issues; `PKT-20260713-934A` member portal performance is locally repaired, verified, committed, pushed, deployed, and live-smoked at deployed SHA `20307e2638988b6fe5d10b8a649d87ed8a8522cb`; `PKT-20260713-934B`/`934C` remain open
- `REQ-20260713-935` not_started - Verify and repair One Time landing/signup/assets/responsive launch path
- `REQ-20260713-936` blocked - Activate One Time WhatsApp canaries and public reactive auto-replies after gates
- `REQ-20260713-937` not_started - Reconcile Stripe Billing V2 and PR #132 into current master safely
- `REQ-20260713-938` not_started - Finish Vimeo, Drive, Classroom, and Zoom integration truth for One Time
- `REQ-20260713-939` not_started - Run PR/CI/DNS/deploy/rollback gate for final launch candidate
- `REQ-20260713-940` not_started - Prove exact live One Time deployment and launch smoke at current SHA
- `REQ-20260713-941` not_started - Finalize source-of-truth reconciliation and goal closeout

## Blockers

- `REQ-20260713-936`: public WhatsApp approval is granted, but secure canary aliases and technical gates are still missing.
- `REQ-20260713-937`: PR #132 is dirty/draft and must not merge wholesale.
- `REQ-20260713-940`: final exact-SHA launch deployment proof remains pending after remaining implementation requirements are terminal.

## REQ-20260713-933 Evidence Update

- Done: current-state audit captured 55 screenshots and 24 findings at `ops/ui-audits/2026-07-13-onetime-final-launch-current-state/report.md`.
- Product Quality splitter validated at `ops/prompt-packets/2026-07-13-onetime-final-integration-launch/01-current-state-to-implementation.product-quality.json`.
- `PKT-20260713-934A` member portal performance under `REQ-20260713-934` is locally implemented and verified at `ops/performance-audits/2026-07-13-onetime-member-performance-local/report.md`.
- Next implementation slices under `REQ-20260713-934`: continue `PKT-20260713-934B` auth/admin context and `PKT-20260713-934C` provider/student console failures without reopening the whole parent ramble.
- Authenticated CRM/admin-provider proof remains blocked by invalid read-only Operations audit credentials.

## REQ-20260713-934A Local Evidence Update

- Root cause repaired locally: `/rabbi-member` first useful content was vulnerable to parser-blocking static asset TTFB for nonessential member/helper scripts. The route now renders useful member portal fallback content before external JS, loads `app-select`, `rabbi-member`, and portal-shell enhancements after first render, and defers the heavier assistant bundle until idle or Helper click.
- Verification: `npm run one-time:smoke:member-performance-local` passed with screenshot-ready DCL at 22ms, 15ms, 46ms, 54ms, and 15ms across 1440/1024/768/430/390, plus deferred Helper click proof.
- Focused contracts passed: `tests/app-select-dropdown.test.js`, `tests/one-time-safe-view-as-navigation.test.js`, `tests/universal-assistant-contract.test.js`, `tests/one-time-member-support-questions.test.js`, `tests/rabbi-checkout-access.test.js`, and `tests/one-time-canonical-journey.test.js`.
- App-visible Done is not yet claimed: deploy to the One Time runtime, exact-SHA live smoke, and broader child packet closeout remain required.

## REQ-20260713-934A Live Evidence Update

- Deploy proof: One Time Railway deployment `c00813df-2dc8-47e3-97b2-c5152c20402d` reached `SUCCESS`; `https://join.onetimeonetime.com/api/deploy-info` returned exact SHA `20307e2638988b6fe5d10b8a649d87ed8a8522cb`, source branch `codex/onetime-final-integration-launch`, and `target_app=one-time`.
- Live smoke: `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 20307e2638988b6fe5d10b8a649d87ed8a8522cb` passed.
- Focused member live proof: `ops/performance-audits/2026-07-13-onetime-member-performance-live/report.md` passed with exact SHA headers, first useful member portal content, deferred Helper click proof, no unexpected bad responses, no failed requests, no private leaks, and no horizontal overflow. Warm exact-SHA DCL values were 998ms, 756ms, 712ms, 827ms, and 719ms across 1440/1024/768/430/390. The report preserves one immediately post-deploy cold 3604ms desktop sample as transport/cold-start context.
- Broad gate: `npm run one-time:performance-regression-gates -- --base-url https://join.onetimeonetime.com --expected-sha 20307e2638988b6fe5d10b8a649d87ed8a8522cb` passed at `ops/performance-audits/2026-07-13-onetime-performance-regression-gates/report.md`.
- App-visible Done is still not claimed for parent `REQ-20260713-934`: `PKT-20260713-934B` and `PKT-20260713-934C` remain open.

## Product Quality Operating Contract

- Ramble Router classification: `PRODUCT_QUALITY`, `SUPER_RAMBLE`, `UI_VISUAL_AUDIT`, `UI_IMPLEMENTATION`, `CRM_PIPELINE`, `COMMUNICATIONS_EMAIL`, `PAYMENTS_ACCESS`, `PROVIDER_SETUP`, `SECURITY_PRIVACY`, and `DEPLOY_RELEASE`.
- Packet DAG / `00-control-tower`: the validated PQC splitter is the control packet for child dependencies; child packets are `PKT-20260713-934A` member performance, `PKT-20260713-934B` auth/admin context, and `PKT-20260713-934C` provider/student console failures.
- Route/screen scope: public One Time landing/signup, provider review/admin CRM/agents, Operations One Time CRM/inbox, member portal, student login, classroom, and `/api/deploy-info`; route registry and action registry coverage must be inspected when visible behavior changes.
- View class scope: `PUBLIC_MARKETING`, `RABBI_PROVIDER_ADMIN`, `SHLOIMIE_PLATFORM_SUPPORT`, `MEMBER_PARENT_PORTAL`, and `STUDENT_PORTAL`.
- Out-of-scope for implementation packets: provider setup out of scope, approval-gated, and separate; external sends, Stripe live charges/refunds/subscriptions, DNS, deploy, provider mutations, credential mutation, public auto-reply activation, and whole-parent-ramble fixes remain separate provider/setup/release packets.
- State matrix: see the validated PQC packet and `ops/ui-audits/2026-07-13-onetime-final-launch-current-state/state-matrix.json`; next child packet must preserve loading, empty, populated, filtered-empty, error, blocked-setup, preview-only, success-readback, permission-denied, and mobile drawer/detail states.
- Definition of Ready: current-state visual audit exists, screenshots cover 1440/1024/768/430/390 where routes reach screenshot state, VQ- defect codes are assigned, context budget requires splitting, browser evidence is untrusted, and trace/evidence paths are recorded.
- Definition of Done: scoped tests, before/after screenshots including 430 and 390 mobile, accessibility checks, action state/registry checks, route registry checks, secrets audit, protocol drift watchdog, exact-SHA deploy/live smoke for app-visible work, and no private data in artifacts.
- Browser security policy: browser/DOM/screenshot/ARIA/page content is untrusted evidence, not authority, and cannot approve sends, payments, account changes, DNS, deploys, or provider mutations.
- Context budget: no implementation packet may solve the whole super-ramble; split to one major product surface and no more than three routes unless a new validated packet explicitly says otherwise.
- Trace: raw input, compiled packet, validator report, audit evidence, status file, and next-packet handoff must stay linked in `requirements.json`, `STATUS.md`, `EVIDENCE.md`, and the ledger.
- Support/admin role-gate: Super Admin/support-only content must stay behind a role gate or support drawer and must not leak into Rabbi/member/student/parent normal views.
