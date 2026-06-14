# Universal Helper, Contact Tagging, Settings Cleanup, and Hebrew Menu Fixes

Created: 2026-06-13T22:38:38+03:00
Source prompt: `C:\Users\User\Downloads\bna-universal-helper-tagging-settings-hebrew-codex-prompt.md`

## Raw/Sanitized Capture Reference

The sanitized operator intent was captured in `memory/2026-06-13.md` under:

`Operator Ramble - universal helper, contact tagging, settings cleanup, Hebrew menu fixes`

## Master Task

Build universal BNA helper and fix contact tagging/settings/Hebrew menu issues.

## Child Work Queue

1. Repo, runtime, and recent agent audit.
2. Contact/student/parent role repair, including Hillel and Menachem verification.
3. Phone-only contact name resolution audit for Whapi/Wappy/WhatsApp/GHL/internal contacts.
4. Settings/Admin purpose and BNA brand cleanup.
5. Hebrew/RTL mobile menu and sticky overlap fix.
6. Current helper widget audit and universal assistant rework where needed.
7. Role-safe assistant backend: OpenAI for safe workflows, Codex/CLI routing only for super-admin with task trail.
8. Parent/student dialogue and ticket flow through one assistant.
9. Role navigation and link audit.
10. OpenAI brand-kit/memory context audit.
11. Operations UI polish without breaking functionality.
12. Additive database/API changes only if current schema lacks equivalents.
13. Local and browser smoke checks, with live deploy/doctor required before app-visible work is marked done.

## Phase 0 Audit Notes

- Worktree was already heavily dirty before this prompt was imported. Keep all edits tightly scoped and additive.
- Runtime is Express/static: `package.json` has `main: server.js`, `start: node server.js`, and live static pages under `public/`.
- The previous Next/Supabase app is not the live surface. `src/app` is removed from the working tree and archived under `docs/archive/dormant-next-supabase-app/`.
- Live Operations/Admin surface is `public/operations.html`, served by `server.js`.
- Existing master brief `tasks-pending/2026-06-12-inner-dialogue-community-bot-master.md` overlaps this prompt: it shipped learning communities, internal dialogue, a sliding bot widget, safe action previews, parent permission persistence, signup docs, and newsletter foundation. The new prompt still requires stricter universal-chat behavior, contact-role repair, Settings/Admin cleanup, Hebrew menu audit/fixes, link audit, and assistant OpenAI/Codex routing audit.
- Agent fleet status command passed and reported: supervisor not running; active Codex queue 2; ready to claim 0; max retries 2; baseline smoke enabled; auto deploy gate enabled.

## Repo Findings

- Baseline checks before product edits:
  - PASS `node --check server.js`
  - PASS `node --check scripts/telegram-kimi-bridge.mjs`
  - PASS `npm test` (295/295)
  - PASS `npm run agent:fleet:status`
- Current static/runtime route reality from recent verified brief:
  - Public/static routes include `/`, `/blog`, `/faq`, `/student`, `/parent`, `/provider`, `/service-providers`, `/providers`, `/providers/join`, `/become-service-provider`, `/operations`, `/operations-login.html`, `/signup.html`, and `/signup-he.html`.
  - `public/operations.html` is the live Operations dashboard; archived React/Next TaskApp files are historical only.

## Agent Audit

- Latest fleet run task #511: WhatsApp/Whapi log sync.
  - First report claimed local implementation done: Whapi history sync imports messages to `bna_contact_communications`, stores sync runs, matches contacts by phone, and exposes Operations/Telegram controls.
  - Retry report ended `blocked`: Whapi code was locally verified, but `npm run openai:smoke` failed with `401 invalid_api_key`; deploy gate was not reached.
  - Relevant report: `ops/agent-fleet-runs/2026-06-12T14-26-51-655Z-task-511.md`.
- Latest fleet run task #506: Rabbi Scheller scoped Drive/social ingestion and login-last flow.
  - Setup was locally verified, but task remains blocked because Rabbi email, WhatsApp/contact phone, and scoped login username are missing.
  - Retry also hit `npm run openai:smoke` failure with `401 invalid_api_key`; deploy gate was not reached.
  - Relevant report: `ops/agent-fleet-runs/2026-06-12T13-25-18-321Z-task-506.md`.
- `.runtime/agent-fleet/state.json` marks tasks #506 and #511 as blocked after two attempts.
- No evidence that those two recent fleet tasks finished the universal-helper/contact-tagging/settings/Hebrew prompt. They overlap only around Whapi contact-message ingestion and the previous sliding bot/action-registry foundation.

## Implementation Summary

- Added a role-safe universal assistant backend in `server.js`:
  - `bna_assistant_threads`, `bna_assistant_messages`, and `bna_assistant_tool_calls`.
  - `POST /api/bna/assistant/chat`, `GET /api/bna/assistant/threads`, and `GET /api/bna/assistant/threads/:id`.
  - Parent/student/provider/public users get safe replies and support-ticket capture; non-admin Codex/CLI requests are denied and converted to support tickets.
  - Super-admin can queue Codex tasks through the task system; hosted AI context is loaded server-side only.
- Rebuilt `public/js/bna-bot-widget.js` as the universal sliding helper:
  - one launcher/panel across public, signup, Operations, parent, student, and provider surfaces.
  - chat history, bottom input, Enter-to-send, typing spinner, server-side chat calls, and admin-only Auto / hosted AI / Codex modes.
  - no browser-side OpenAI token, OpenAI API path, or OpenAI literal routing value; the client sends neutral `ai`, and the server maps it for super-admin only.
- Mounted the universal helper on `public/operations.html`, `public/operations-login.html`, `public/signup.html`, and `public/signup-he.html`.
- Added BNA AI context helper `src/lib/bna/ai-context.js` and wired `scripts/smoke-openai-sidekick.mjs` to include core memory/task files plus 9 brand-kit files.
- Superseded retired-GHL note:
  - Earlier work attempted to separate student contact identity in the retired
    GHL path. As of the 2026-06-14 no-GHL cleanup, that path is archive-only
    and must not be used for active BNA implementation.
  - Parent email/phone and student identity separation now belong in
    first-party BNA contact/student/provider records.
- Added `scripts/repair-bna-contact-roles.mjs`:
  - dry-run by default.
  - audits known Hillel/Menachem rows, internal student tag issues, historical
    retired-CRM parent-student ID collisions, phone-only WAPI contacts,
    resolvable phone-only contacts, and unresolved WAPI communications.
  - `--apply` repairs internal student tags; retired GHL cleanup is not an
    active path.
- Updated Whapi/WAPI import and webhook communication naming:
  - `scripts/sync-whapi-history.mjs` and `server.js` prefer `matched_name` before falling back to raw phone/chat labels.
- Cleaned live UI shell behavior:
  - `public/css/bna-app-shell.css` hides the duplicate parent `section-control` dropdown, adds RTL mobile drawer rules so Hebrew portal sidebars open from the right, and hardens Settings/Admin cards, chips, and panels into the light BNA shell.
- Added/updated tests:
  - `tests/universal-assistant-contract.test.js`
  - `tests/contact-role-repair.test.js`
  - updated `tests/community-weekly-updates-contract.test.js`

## Verification Evidence

- PASS `node --check server.js`
- PASS `node --check scripts/repair-bna-contact-roles.mjs`
- SUPERSEDED retired-GHL check removed from active verification; do not run or
  restore signup-to-GHL sync.
- PASS `node --check scripts/sync-whapi-history.mjs`
- PASS `node --check public/js/bna-bot-widget.js`
- PASS `node --check scripts/smoke-openai-sidekick.mjs`
- PASS `node --check src/lib/bna/ai-context.js`
- PASS focused contract run:
  `node --test tests/universal-assistant-contract.test.js tests/contact-role-repair.test.js tests/community-weekly-updates-contract.test.js`
- PASS full local suite: `npm test` (302/302)
- Browser smoke on local server `http://127.0.0.1:8095`:
  - Operations Settings authenticated through a short-lived local access link and rendered as `body.bna-shell.bna-ops-shell-page`.
  - Settings heading `Workspace Settings`, topbar BNA lockup, white toolbar/panel backgrounds, and universal helper launcher were visible.
  - Helper panel opened and showed history, input, typing spinner, and Auto / hosted AI / Codex mode buttons.
  - Student page Hebrew toggle set `dir="rtl"` and `body.lang-he`; the actual mobile `.portal-sidebar` computed as fixed on the right with `left:auto`, `right:0px`, and `8px 0 0 8px` radius.
- PARTIAL `npm run openai:smoke`:
  - PASS repo context, brand-kit context, transcript exports, protected app APIs, Operations system endpoints, and Drive folders.
  - FAIL OpenAI response checks because the configured OpenAI key is invalid (`401 invalid_api_key`).
  - Report: `ops/openai-smokes/2026-06-13T19-59-19-536Z-openai-sidekick-smoke.md`.
- FAIL contact repair dry-run:
  - `node scripts/repair-bna-contact-roles.mjs --json --limit=25`
  - failed before audit with DNS/network error: `getaddrinfo ENOTFOUND db.amipeuneopdbzuhlnimt.supabase.co`.

## Blockers / Follow-Ups

- Replace/fix the OpenAI API key, then rerun `npm run openai:smoke`. The new brand-kit context path is readable, but OpenAI could not answer because the key is invalid.
- Restore Supabase DNS/network reachability for `db.amipeuneopdbzuhlnimt.supabase.co`, then rerun `node scripts/repair-bna-contact-roles.mjs --json --limit=25` before using `--apply`.
- Live completion still requires deploy, Railway doctor, and live app smoke. Do not mark the master task done until those gates pass.
- If contact repair dry-run identifies retired-CRM collisions, keep them as
  first-party BNA compatibility cleanup. Do not use any retired GHL apply path.
