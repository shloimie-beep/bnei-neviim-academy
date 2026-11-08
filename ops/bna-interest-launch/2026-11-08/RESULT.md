# BNA public inquiry flow — verified8November2026

The requested landing/public webpage, shared interest form, durable inquiry information, existing EN/HE parent acknowledgement and minimal owner Gmail alert are live. Exact application `6c1e4261c78896e0273a4c553880343d9ecd6f25`, Railway deployment `b28f5f0c-d94b-4edd-9af2-8aca98469517` SUCCESS, matches live `/api/deploy-info`. PR196 is open; production is pinned to the reviewed application.

## Implementation

The form retains Learning pod / Academy2027–28 / Both, required email, conditional phone, parents’ area/preferences and out-of-area interest. Existing storage dedupe/recovery and approved parent templates are preserved. New independent owner-alert intent uses the same durable outbox with a recipient-bound approved template, atomic send claim, safe failure/unknown states and no automatic duplicate resend. No full CRM, offer/enrollment, billing/payment or parent portal was added. The Hebrew form year range has presentation-only direction isolation; approved wording/assets remain unchanged.

## Live verification

- Exact reviewed release and provider/runtime identity match. A configuration-triggered attempt built later documentation-only66596fe7 with identical application files; an explicit-commit deployment corrected it before the test.
- One labeled owner-only synthetic email was accepted by Gmail (`1a1bbd1304182cb9`) and independently read in the verified owner Inbox (`1a1bbd13521e21a9`). Sender, reply address, subject and full body match the saved preview. Gmail replaced the supplied RFC Message-ID; receipt matching used actual sender/subject/body/time. No second test was sent.
- Owner release activated only after recipient readback. Separate production readback confirms owner alerts active, approved recipient binding, unchanged active EN/HE parent templates and one test row/one send attempt.
- The affected Hebrew form passed actual live390/1440 viewport checks and screenshot inspection. Prior public28Chrome states/60internal links/47sitemap/12original asset-hash evidence remains separate and valid for unchanged surfaces.

## Local proof and limits

17 focused real-SQL store/owner-alert tests and8exact operator-script guard checks passed.9public tests were rerun after the year-direction fix; the previous23public/source/privacy tests remain recorded. Failure/unknown retention, duplicate/replay/concurrent claim, scope/recipient/template denial and crash parking are disposable-SQL proof. No new live inquiry was submitted and no parent test email was sent under this approval. Existing November5 durable inquiry, ordinary-owner readback, parent receipt and fixed-cutoff reversible archive proof are retained in the previous result. No migration, legacy/backfill send, archive reapply, payment or administrator-access change occurred. No physical-device or CI claim.

## Scope and continuity

RAW-20261108-005 resolved the exact new notification/release approval. Full backend/CRM/offers/billing/parent portal and original two-lane acceptance remain explicitly deferred by RAW-20261108-004; their original requirement IDs/journeys stay as history, not implementation claims. Backend15-minute timer deleted; frontend registration retained/PAUSED on verified current public completion. The broader original goal is not marked fully implemented. Existing worktree, leads/history/admin access, approved graphics, other businesses, global July pointer and four older untracked watchdog files are preserved.

Canonical proof: OWNER-ALERT-LIVE-VERIFICATION.json, OWNER-ALERT-RECIPIENT-PROOF.json, FORM-YEAR-LIVE-VERIFICATION.json and FINAL-SOURCE-READBACK.json. Guarded Website/log/Delivery/Continuation closeout readback preserved every prior paragraph and the transition tab.

The already-applied approved source/recipient staging patch was finalized with skipDeploys; independent provider readback shows no remaining staged changes. No additional deployment or test send was triggered.
