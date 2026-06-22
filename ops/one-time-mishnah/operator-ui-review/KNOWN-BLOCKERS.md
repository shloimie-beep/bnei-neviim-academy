# Shared One Time Review Known Blockers

## Not Part Of This Review Run

- No Railway project/service/database creation.
- No `skillful-motivation` service changes.
- No DNS hookup for `app.onetimeonetime.com`.
- No PR merge.
- No live email, live charge, real WhatsApp, real Zoom meeting, or real Vimeo upload.

## External Blockers

| Area | Current State | Exact Future Action |
| --- | --- | --- |
| Resend sending | Template preview exists; sending is disabled. | Approve sender/from/reply-to/domain policy and complete DNS/domain readiness. |
| Stripe live billing | Test/readiness language exists; no live charge. | Approve final billing/pricing/entitlement decisions before enabling live checkout. |
| Zoom meeting creation | Join/readiness model is reviewable; no real class meeting created. | Run the operator-gated Zoom integration smoke when real meeting creation is approved. |
| Vimeo automated upload | Manual/sample Vimeo reference is reviewable. | Approve/install a user-level Vimeo token and upload policy. |
| Hosted transcription | `REQ-20260621-902` remains blocked by prior `401 invalid_credential`. | Provide/rotate the hosted transcription credential, then reprocess content job #78. |
| Separate One Time instance | Provisioning is paused by operator instruction. | Resume `REQ-20260619-313` only after this shared UI review pass. |

## Known Review Limitations

- Parent, student, provider and email review data is synthetic `TEST-` data.
- Parent/student review links do not create real authenticated accounts or passwords.
- Parent/student/classroom submit buttons in review mode record local preview feedback only; they do not write to the database.
- Admin/Rabbi Operations review still requires existing private Operations credentials.
- The shared live default instance can still report BNA runtime flags; use the `?review=one-time` routes to inspect the isolated One Time review payload.
- This packet is not the final visual QA pass; it exists so Shloimie can collect UI/workflow corrections.

## Known UI Issues To Watch Closely

- Provider/Rabbi review mode is a compact review surface, not the final polished provider portal.
- Mobile 390px should be checked for card density, long-label wrapping, and button alignment.
- The Operations admin route may still feel dense because it is shared with broader BNA tooling.
- Email preview copy is realistic but still needs Shloimie's content/tone review.
- Trial/payment copy uses review-safe example wording and may need final policy language.
