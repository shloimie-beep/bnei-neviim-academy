# Plan

## Batch Order

1. `BATCH-00-INTAKE` / `REQ-20260712-101`: validate raw/register/run/PQC artifacts.
2. `BATCH-02-IDENTITY` / `REQ-20260712-103`: implement focused server-side identity/view-as scope hardening.
3. `BATCH-03-CRM-ISOLATION` / `REQ-20260712-104`: implement explicit CRM tenant ownership and source-label cleanup.
4. `BATCH-04-CRM-API` / `REQ-20260712-105`: implement paginated list/detail API and DB performance proof.
5. `BATCH-01-AUDIT` / `REQ-20260712-102`: done by regenerated authenticated/current-state audit evidence; original source PNGs remain unavailable but are no longer the only evidence.
6. `BATCH-05-CRM-FRONTEND` / `REQ-20260712-106`: done locally; release/live-smoke remains under `REQ-20260712-112`, and shell byte-budget work remains under `REQ-20260712-111`.
7. `BATCH-06-CRM-INBOX` / `REQ-20260712-107`: done locally; release/live-smoke remains under `REQ-20260712-112`, and shell byte-budget work remains under `REQ-20260712-111`.
8. `BATCH-07-PORTALS` / `REQ-20260712-108`: done locally; release/live-smoke remains under `REQ-20260712-112`, and bundle/performance work remains under `REQ-20260712-111`.
9. `BATCH-08-LANDING-WHATSAPP` / `REQ-20260712-109`: done locally; release/live-smoke remains under `REQ-20260712-112`.
10. `REQ-20260712-110`: done locally; WhatsApp assistant natural-language behavior is covered by deterministic safety tests and no live send was performed.
11. `REQ-20260712-111`: done locally; performance, split delivery, cache policy, and Vimeo lazy-load proof are complete.
12. `REQ-20260712-112`: blocked / needs release decision. Clean scoped release branch and pushed commit now exist; production deploy/live verification still requires explicit release-gate confirmation and approved Railway/Drive readback completion or deferral.

## Guardrails

- No GHL/LeadConnector runtime.
- No external sends, payments, DNS/provider writes, uploads, access grants, or production hard deletes without separate exact approval.
- No screenshot-dependent UI implementation without a focused packet that maps to the regenerated `REQ-20260712-102` audit evidence and passes Definition of Ready.
- No signed tokens, secrets, raw private contact exports, or private message bodies in evidence.
