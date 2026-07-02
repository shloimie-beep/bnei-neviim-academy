# One Time Announcements-First Community

Status: local beta contract
Run: `ops/execution-runs/2026-06-19-onetime-local-beta-hardening/`

## Principle

The One Time community is not an open forum for local beta. Its first usable
shape is announcements-first:

- Rabbi/admin announcements
- class reminders
- approved resource links
- private participant replies for review

Participant replies do not become public, member-visible, or parent-visible
feed posts automatically. Replies are muted in the community feed and routed to
Rabbi/admin review.

## Local Behavior

Local draft builders may prepare:

- announcement drafts
- reminder drafts
- approved link/resource cards
- digest previews
- private reply review previews

Every local builder returns `preview_only: true`, `no_send: true`, and
`external_write_performed: false`. No email, WhatsApp, Telegram, portal
notification, Buffer/social post, Zoom, Vimeo, Drive, or production database
publish write is performed from this contract.

## Reply Policy

Replies are private by default:

- no student-to-student private chat
- no open member thread creation
- no automatic public/member feed
- no raw private reply text returned from the preview
- contact details and private identifiers trigger review flags

## Acceptance Checks

REQ-20260619-411 is satisfied locally only when tests show that:

- announcements, reminders, and links sort before reply review items
- delivery channels remain no-send without explicit approval
- participant replies route to a private review queue
- raw reply text is not returned from the preview
- student-to-student private chat stays disabled

Code contract: `src/platform/community/announcements-first.js`.
