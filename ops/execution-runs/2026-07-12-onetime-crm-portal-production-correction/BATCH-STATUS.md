# Batch Status

| Batch | Requirement IDs | Status | Next action |
|---|---|---|---|
| BATCH-00-INTAKE | REQ-20260712-101 | Done | Continue `REQ-20260712-103`. |
| BATCH-01-AUDIT | REQ-20260712-102 | Done | Use regenerated audit findings as input to focused UI packets. |
| BATCH-02-IDENTITY | REQ-20260712-103 | Done locally | Release/live-smoke remains under `REQ-20260712-112`. |
| BATCH-03-CRM-ISOLATION | REQ-20260712-104 | Done locally | Release/live-smoke remains under `REQ-20260712-112`. |
| BATCH-04-CRM-API | REQ-20260712-105 | Done locally | Release DB EXPLAIN/live-smoke remains under `REQ-20260712-112`. |
| BATCH-05-CRM-FRONTEND | REQ-20260712-106 | Done locally | Local smoke proves scoped CRM requests, 50-card cap, no app-root rerender on selection, debounced search, and lazy legacy table construction. Release/live-smoke remains under `REQ-20260712-112`; shell byte-budget debt remains under `REQ-20260712-111`. |
| BATCH-06-CRM-INBOX | REQ-20260712-107 | Done locally | Local smoke proves three-pane CRM, mobile Back flow, locked reply/note/task actions, scoped One Time Inbox context, action registry coverage, and no external writes. Release/live-smoke remains under `REQ-20260712-112`; shell byte-budget debt remains under `REQ-20260712-111`. |
| BATCH-07-PORTALS | REQ-20260712-108 | Done locally | Local smoke proves shared portal shell, Family Portal/account setup labels, TEST preview banner, preserved review links, accessible mobile menu, desktop/tablet/mobile screenshots, no console/HTTP errors, and no external writes. Release/live-smoke remains under `REQ-20260712-112`; bundle/performance debt remains under `REQ-20260712-111`. |
| BATCH-08-LANDING-WHATSAPP | REQ-20260712-109 | Done locally | Local smoke proves one accessible same-origin WhatsApp launcher, no public helper scripts/Robot Scheller chrome, no hard-coded `wa.me`, runtime readiness redaction, desktop/tablet/mobile screenshots, and no external writes. Release/live-smoke remains under `REQ-20260712-112`. |
| BATCH-09-WHATSAPP-ASSISTANT | REQ-20260712-110 | Done locally | Release/WAPI readback remains under `REQ-20260712-112`. |
| BATCH-10-PERFORMANCE | REQ-20260712-111 | Done locally | Local proof covers split shell under 1.2 MB, CRM first-page metrics, cache policy contract, and Vimeo lazy-load. Production compression/cache/header readback remains under `REQ-20260712-112`. |
| BATCH-11-VERIFY-DEPLOY | REQ-20260712-112 | Blocked / needs release decision | Clean release branch is pushed and release-gate dry-run is ready. Production deploy/live verification still requires explicit gate confirmation and Railway/Drive readback completion or approved deferral. |
