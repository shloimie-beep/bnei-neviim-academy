# One Time Public Landing Production Rebuild - 2026-07-10

## Raw intake

Raw source is preserved at
`raw-input/RAW-20260710-007-onetime-public-landing-production-rebuild.md`.
Asset/source architecture addendum is preserved at
`raw-input/RAW-20260710-008-onetime-public-landing-asset-architecture-addendum.md`.
The attached prompt requests an implementation, not an audit-only pass:
rebuild the OneTimeOneTime Mishnayos public landing page, integrate real
available assets, connect every `Sign Up Now` control to the same real lead
flow, verify desktop/mobile behavior, and return screenshot evidence.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260710-007 |
| Addendum raw ID | RAW-20260710-008 |
| Source | codex_chat pasted attachment |
| Parse status | locally_verified_pending_deploy |
| Requirement register | tasks-pending/2026-07-10-onetime-public-landing-production-rebuild.md |
| Product quality packet | tasks-pending/2026-07-10-onetime-public-landing-production-rebuild.product-quality.json |
| Packet lane | ops/prompt-packets/2026-07-10-onetime-public-landing-rebuild/ |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes - broad GPT-style execution packet says to implement, verify, and not stop with a plan |
| Active goal objective | Complete the OneTimeOneTime Mishnayos public landing page rebuild for Rabbi Eli Scheller through protocol intake, current-state audit, scoped implementation, verification evidence, and terminal requirement statuses or precise blockers. |
| Goal tool used | yes |
| Execution directive | Register first, validate the Product Quality packet, capture current-state evidence, then work the executable requirements in batches. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes - the enclosing owner-experience closure prompt explicitly authorizes deploying safe app-visible One Time fixes to the existing Railway service |
| Next requirement IDs to work | REQ-20260710-037 through REQ-20260710-046 |

## Router output

| Field | Value |
|---|---|
| Classifications | PRODUCT_QUALITY, SUPER_RAMBLE, UI_VISUAL_AUDIT, UI_IMPLEMENTATION, COMMUNICATIONS_EMAIL, SECURITY_PRIVACY, PROVIDER_SETUP, DECISION_REQUIRED, VERIFIER_CLOSEOUT |
| Workspace/project | `rabbi_sheller_provider` / `one_time_mishnah_class` |
| View class | PUBLIC_MARKETING |
| Product Quality Compiler required | yes |
| Current-state visual audit before implementation | yes |
| Super-ramble packet split | yes, but current executable slice is one public marketing route plus its existing lead API path |
| External/provider blockers | final hero image, Robot Scheller image, public photo permissions/captions, verified address spelling/approval, verified social URLs, direct WhatsApp runtime number/readiness |
| Next exact packet | `01-current-state-visual-audit` for `/one-time` before product-code edits |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260710-037 | Register the raw prompt, Product Quality packet, control-tower notes, and current-state visual audit before code implementation. | RAW-20260710-007:S1-S10; RAW-20260710-008 | rabbi_sheller_provider / one_time_mishnah_class | Codex | protocol | P0 | B0 | none | Raw file, register, PQC packet, packet lane, and before evidence paths exist; `npm run pqc:validate` passes before implementation. | raw-input/*, tasks-pending/*, ops/prompt-packets/*, ops/ui-audits/* | no app deploy | Done - local verified |
| REQ-20260710-038 | Build a centralized One Time landing content and asset map using real repo/download assets only. | RAW-20260710-007:S11-S24; RAW-20260710-008 | rabbi_sheller_provider / one_time_mishnah_class | Codex | assets/content | P0 | B1 | REQ-20260710-037 | Logo, Rabbi book photo, media logos, teaching images, offer/schedule/address/social copy, missing assets, permission blockers, and captions are centrally configured; production code never references Downloads. | public/one-time/index.html, public/assets/one-time/* | app deploy pending | Done - local verified; external asset decisions recorded |
| REQ-20260710-039 | Replace the current header and hero with the requested compact sticky header, exact hero copy, single `Sign Up Now` CTA, no hero portrait, no hero chips, and no alternate CTA labels. | RAW-20260710-007:S25-S70 | rabbi_sheller_provider / one_time_mishnah_class | Codex | public_ui | P0 | B2 | REQ-20260710-037, REQ-20260710-038 | Header desktop/mobile behavior, focus-managed menu, skip link, one h1, exact hero wording, single CTA, intentional image-free media treatment, no horizontal overflow, and removed forbidden hero content. | public/one-time/index.html | app deploy pending | Done - local verified |
| REQ-20260710-040 | Convert all `Sign Up Now` triggers to one accessible quick-capture modal/sheet backed by the real `/api/one-time/interest` endpoint. | RAW-20260710-007:S71-S115 | rabbi_sheller_provider / one_time_mishnah_class | Codex | signup_flow | P0 | B3 | REQ-20260710-037 | Quick form collects parent/contact name and email as required, phone/WhatsApp optional, no student name, preserves attribution, has labels/autocomplete/errors/loading/network failure/duplicate-submit protection, and after successful lead capture continues to the existing full onboarding page with values preserved. | public/one-time/index.html | app deploy pending | Done - local no-send verified |
| REQ-20260710-041 | Add the next signup step support for `I'm signing up for:` with `My family` and `A school` without exposing internal follow-up details on the landing page. | RAW-20260710-007:S116-S133 | rabbi_sheller_provider / one_time_mishnah_class | Codex | signup_flow | P0 | B3 | REQ-20260710-040 | The post-capture continuation carries audience intent to the existing onboarding route or the smallest compatible extension; family can proceed toward student details and school can route organization/contact details for follow-up. | public/one-time/index.html, public/one-time-preview.html | app deploy pending | Done - local verified |
| REQ-20260710-042 | Rebuild the requested content sections in order: Meet Rabbi/As Seen, teaching carousel, What Your Son Will Gain, What You Receive, How It Works, Who It's For, and clean footer. | RAW-20260710-007:S134-S270 | rabbi_sheller_provider / one_time_mishnah_class | Codex | public_ui | P0 | B4 | REQ-20260710-038, REQ-20260710-039 | Required section order, exact headings/copy where specified, media-logo marquee, carousel controls/autoplay pause/reduced-motion behavior, equal cards, verified/non-fabricated claims, no FAQ, no bottom closing CTA, no generic bars, and footer with only verified links. | public/one-time/index.html, public/assets/one-time/* | app deploy pending | Done - local verified; social/address/photo blockers recorded |
| REQ-20260710-043 | Integrate Robot Scheller as a non-obstructing floating utility using the real existing assistant/WhatsApp integration and no fake clickable WhatsApp state. | RAW-20260710-007:S271-S292 | rabbi_sheller_provider / one_time_mishnah_class | Codex | assistant_ui | P1 | B5 | REQ-20260710-037 | Floating control is about 52-56px, accessible, includes automated-assistant disclosure in expanded UI, does not cover form/carousel/nav/footer, and only exposes direct WhatsApp if runtime readiness is functional. Missing generated Robot image is recorded. | public/js/bna-bot-widget.js, public/one-time/index.html | app deploy pending | Done - local verified; runtime WhatsApp readiness remains externally blocked |
| REQ-20260710-044 | Apply the requested premium black/yellow/ice-blue visual system, motion rules, responsive rules, accessibility, and performance constraints. | RAW-20260710-007:S293-S382 | rabbi_sheller_provider / one_time_mishnah_class | Codex | visual_quality | P0 | B6 | REQ-20260710-039, REQ-20260710-042, REQ-20260710-043 | No clipped/overlapped text, no horizontal scrolling at required widths, 44px touch targets, visible focus, reduced-motion compliance, responsive image dimensions/lazy-loading, body copy at least 16px, no fake media, and page works at 200% zoom where practical. | public/one-time/index.html, public/js/bna-bot-widget.js, public/one-time-preview.html | app deploy pending | Done - local verified |
| REQ-20260710-045 | Remove every explicitly forbidden legacy element and alternate CTA phrase. | RAW-20260710-007:S383-S421 | rabbi_sheller_provider / one_time_mishnah_class | Codex | cleanup | P0 | B7 | REQ-20260710-039, REQ-20260710-042 | Yellow inline form, student quick-capture field, required phone validation, Save My Spot, WhatsApp/See How It Works hero buttons, chips, FAQ, repeated bottom CTA, No charge bullet panel, generic bars, duplicate Member Login placements, bulky logo cards, current hero portrait, stock/improvised hero imagery, and inconsistent brand names are gone. | public/one-time/index.html | app deploy pending | Done - local verified |
| REQ-20260710-046 | Verify and close out with tests, screenshots, signup-flow results, asset map, missing/unverified items, action/route registry updates where needed, ledger, and changelog. | RAW-20260710-007:S422-S470 | rabbi_sheller_provider / one_time_mishnah_class | Codex | verification | P0 | B8 | REQ-20260710-038 through REQ-20260710-045 | Formatting/lint/typecheck/relevant tests/build or exact blockers; local desktop/mobile screenshots; Sign Up Now triggers tested; name/email required; phone optional; student absent; Family/School next step; Member Login destination; menu/carousel/reduced-motion/keyboard; console/network review; final diff review. | ops/ui-audits/*, ops/agent-task-ledger.jsonl, ops/agent-changelog.md | app deploy pending | In progress - local verified; commit/push/deploy/live smoke pending |

## Decisions and blockers

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260710-010 | Final hero image supply | The prompt says not to invent the final hero image and that it will be supplied later. | Shloimie | Leave the hero media area intentionally image-free with designed lighting until final asset arrives. | Use existing vertical hero image, but prompt explicitly forbids current hero portrait treatment. | Full final hero-photo completion remains blocked, but the page can still ship a polished image-free hero. | Provide final approved hero image and usage rights. | REQ-20260710-039, REQ-20260710-044 | Blocked |
| DEC-20260710-011 | Robot Scheller generated image | The attachment folder contains only pasted text; no generated Robot Scheller image is available. | Shloimie | Use the existing scoped Robot Scheller assistant styling and record missing image slot. | Generate a new image, but the prompt asked for the attached generated image. | Floating assistant can be functional, but exact image integration is blocked. | Attach or place the approved Robot Scheller image in repo/media handoff. | REQ-20260710-043 | Blocked |
| DEC-20260710-012 | Public photo permissions and location captions | Teaching photos and captions such as Baltimore/Flatbush/Hollywood/Orlando require verification and public marketing permission. | Shloimie / Rabbi Scheller | Use only assets with clear public-marketing permission and verified captions; otherwise use replacement-ready slots and report. | Publish unclear student/group photos without approval. | Cannot claim full carousel asset completion for unclear photos. | Confirm which specific photos may be public and the exact captions/locations. | REQ-20260710-038, REQ-20260710-042 | Needs operator decision |
| DEC-20260710-013 | Ramat Beit Shemesh Alef public address approval | Prompt says verify final public spelling and publishing approval for the address. | Shloimie / Rabbi Scheller | Keep the supplied address centralized and flag it for final approval in handoff. | Remove address until approval. | Publishing unapproved address may be wrong or sensitive. | Confirm exact public address spelling and permission. | REQ-20260710-042 | Needs operator decision |
| DEC-20260710-014 | Verified social URLs | Footer social icons may appear only for real verified URLs. | Shloimie | Omit social icons unless repo/runtime exposes verified URLs. | Use placeholder `#` links. | Placeholder links violate request and action registry. | Provide approved One Time social profile URLs. | REQ-20260710-042 | Blocked |
| DEC-20260710-015 | Deployment authorization | Prompt says do not deploy unless deployment is explicitly authorized by the enclosing task. | Shloimie | Treat `C:\Users\User\Downloads\codex-followup-one-time-owner-experience-closure (1).md` as the enclosing authorization because it says to deploy safe app-visible One Time fixes to the existing Railway production service. | Stop at local proof only. | Without deploy/live smoke, app-visible Done cannot be claimed. | Commit/push the scoped rebuild, deploy to One Time Railway, and run live smoke/readback. | REQ-20260710-046 | Resolved - enclosing goal authorizes deploy |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260710-037 | raw-input, tasks-pending, ops/prompt-packets, ops/ui-audits | Create intake, Product Quality packet, control tower, visual audit baseline. | PASS `npm run pqc:validate`; before screenshots and metrics captured. | pending | pending | no app deploy needed |
| REQ-20260710-038 | public/assets/one-time, public/one-time/index.html | Copy verified available assets into repo paths and centralize use. | PASS browser screenshots; PASS no Downloads refs in production code; asset addendum `RAW-20260710-008`. | pending | pending | pending |
| REQ-20260710-039 | public/one-time/index.html | Rebuild header/hero and CTA model. | PASS static tests; PASS Playwright after screenshots at 1440/1280/1024/768/430/390/375/360/320. | pending | pending | pending |
| REQ-20260710-040 | public/one-time/index.html, `/api/one-time/interest` | Modal/sheet quick capture using real endpoint path with intercepted no-send browser proof. | PASS `verify-after.mjs`: required parent/email, optional phone, no student field, one intercepted request. | pending | pending | pending |
| REQ-20260710-041 | public/one-time/index.html, `public/one-time-preview.html` | Continue after lead capture to existing onboarding with audience intent and no contact data in URL. | PASS `verify-after.mjs`: disabled until audience choice, `/one-time-preview` params are non-secret; mobile preview hero fixed. | pending | pending | pending |
| REQ-20260710-042 | public/one-time/index.html | Section rebuild, marquee, carousel, footer. | PASS browser screenshots; footer links corrected to `/one-time/privacy.html` and `/one-time/terms.html`; link watchdog passed. | pending | pending | pending |
| REQ-20260710-043 | public/js/bna-bot-widget.js, public/one-time/index.html | Floating Robot Scheller utility; direct WhatsApp only through guarded runtime redirect. | PASS helper isolation tests; PASS action registry watchdog; WAPI/direct number readiness remains externally blocked. | pending | pending | pending |
| REQ-20260710-044 | public/one-time/index.html, public/one-time-preview.html | Responsive/a11y/performance polish. | PASS 9-viewport verifier; no overflow, one h1, no console/page errors, helper bottom-corner placement. | pending | pending | pending |
| REQ-20260710-045 | public/one-time/index.html | Remove forbidden old elements and copy. | PASS static grep/tests and browser verifier: no inline form, FAQ, old CTA labels, required phone, or student quick-capture field. | pending | pending | pending |
| REQ-20260710-046 | registries, evidence, ledger, changelog | Record proof and blockers. | PASS focused tests, PQC, action/link watchdogs, protocol drift, diff check; deploy/live proof pending. | pending | pending | pending |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260710-037 | Done - local verified | `raw-input/RAW-20260710-007-onetime-public-landing-production-rebuild.md`; `raw-input/RAW-20260710-008-onetime-public-landing-asset-architecture-addendum.md`; PQC validation report; control tower; current-state audit. | raw-input, tasks-pending, ops/prompt-packets, ops/ui-audits | `npm run pqc:validate` PASS; `npm run watchdog:protocol-drift` PASS after control-tower repair. | None for protocol intake. |
| REQ-20260710-038 | Done - local verified | `public/assets/one-time/*`; `public/assets/one-time/one-time-asset-manifest.json`; after screenshots. | public/assets/one-time, public/one-time/index.html | Focused landing tests PASS; browser verifier PASS. | Final hero image, Robot image, public-photo permissions/captions remain operator/provider decisions. |
| REQ-20260710-039 | Done - local verified | `after-390.png`, `after-430.png`, `after-1440.png`; `after-metrics.json`. | public/one-time/index.html | Focused tests PASS; browser verifier PASS. | Deploy/live smoke pending. |
| REQ-20260710-040 | Done - local no-send verified | `after-metrics.json` modal payload keys and intercepted request. | public/one-time/index.html | Browser verifier PASS with intercepted `/api/one-time/interest`; no real send/charge/access. | Deploy/live dry-run pending. |
| REQ-20260710-041 | Done - local verified | `after-modal-success-390.png`; `/one-time-preview` route registry rows. | public/one-time/index.html, public/one-time-preview.html, ops/route-registry.json, tests/one-time-preview-page.test.js | Preview tests PASS; browser verifier PASS. | Deploy/live smoke pending. |
| REQ-20260710-042 | Done - local verified | after screenshots; link watchdog report `ops/watchdog-audits/2026-07-10T15-48-watchdog-link-audit.md`. | public/one-time/index.html, public/assets/one-time | `npm run watchdog:links` PASS. | Address/social/photo approvals remain external. |
| REQ-20260710-043 | Done - local verified | helper isolation tests; action watchdog report `ops/watchdog-audits/2026-07-10T15-48-watchdog-action-audit.md`. | public/js/bna-bot-widget.js, public/one-time/index.html, ops/action-registry.json | `npm run watchdog:actions` PASS; helper tests PASS. | Direct WhatsApp runtime number/readiness remains externally blocked. |
| REQ-20260710-044 | Done - local verified | `after-metrics.json`; 9 after screenshots; mobile preview continuation screenshot. | public/one-time/index.html, public/one-time-preview.html | Browser verifier PASS; no overflow/console/page errors. | Deploy/live smoke pending. |
| REQ-20260710-045 | Done - local verified | static tests and browser verifier old-phrase checks. | public/one-time/index.html | Focused tests PASS; `rg` removal checks passed through tests/verifier. | Deploy/live smoke pending. |
| REQ-20260710-046 | In progress - local verified | tests, screenshots, action/link/protocol reports, PQC report. | registries, tests, evidence | Local verification PASS; commit/push/deploy/live smoke still pending. | Commit/push/deploy/live smoke and final evidence commit remain. |
