# One Time Pilot Product Model

Status: local beta contract
Run: `ops/execution-runs/2026-06-19-onetime-local-beta-hardening/`

## Product Goal

One Time Mishnah Class is the first service-provider pilot on the BNA platform.
The immediate product is excellent for Rabbi Elie Scheller while keeping the
same platform foundation reusable for BNA and future providers.

## Primary Offer

- Product: `One Time Mishnah Class`
- Offer key: `one_live_class_video_library_course`
- Price: `$67`
- Currency: `USD`
- Storage: product/pricing configuration, not hardcoded checkout logic
- Includes:
  - one live class
  - video library
  - course
  - announcement community
  - worksheets/resources
  - parent portal
  - student portal
  - attendance and completion
  - milestones and achievements
  - individual rewards

Code contract: `buildOneTimeProductConfig()` in
`src/platform/instances/one-time.js`.

## Future Cohort

The local model names the future cohort without overbuilding it:

- capacity: 20 students
- full-scholarship seats: 3
- scholarship criteria: transparent, recorded, and explainable
- final award: human-approved by an authorized admin
- black-box automatic scholarship awards: not allowed

## Local Beta Boundary

This contract is local-only. It does not create live Stripe products, checkout
sessions, Zoom meetings, Vimeo uploads, Resend sends, DNS edits, Railway
services, or production database rows.

## Acceptance Evidence

The focused contract test is
`tests/one-time-local-beta-product-contract.test.js`.
