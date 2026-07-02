# Provider Directory And Consent

Status: local beta contract
Run: `ops/execution-runs/2026-06-19-onetime-local-beta-hardening/`

## Provider Plans

The local model supports:

- free provider plan
- paid privacy plan

The free provider plan may include provider signup, a public searchable profile,
platform/community/course/automation access, and explicit terms/consent. The
paid privacy plan is modeled as a stricter option where data is used only to
deliver the provider service and meet legal/security obligations.

## Public Directory Fields

Allowed public directory data is limited to provider-supplied public business
profile information:

- display name/profile
- category
- age range
- location
- languages
- safe contact or lead action

Public directory indexes must not expose student records.

## Privacy Guardrails

Do not implement:

- sale of identifiable child or parent data
- advertising profiles of identifiable child or parent data
- public student records
- claims that the platform absolutely owns personal data

Allowed monetizable data for the free model is limited to provider-supplied
public business/profile information, contextual advertising, aggregated and
genuinely de-identified analytics, and uses covered by explicit consent and an
adult-reviewed privacy policy.

## Required Consent Records

- guardian consent
- provider consent
- data-use disclosure
- service email consent
- marketing consent
- consent version
- consent timestamp
- export/delete/request workflow
- retention configuration

Final commercial/privacy policy language remains an operator/legal decision
before public launch.

Code contract: `buildProviderDirectoryConsentContract()` in
`src/platform/instances/one-time.js`.

Local consent/privacy review:
`src/platform/domain/provider-directory-consent.js`.

## Local Acceptance

- `buildProviderDirectoryConsentReview()` creates a preview-only review of a
  provider directory candidate without database writes or external actions.
- Public listing preview is allowed only when provider status and all required
  consent records are present.
- Allowed public profile fields are restricted to provider-supplied business
  profile/contact fields; private admin notes, student records, parent records,
  and family details are not exposed.
- Prohibited uses block publication/commercial approval: sale of identifiable
  child or parent data, advertising profiles of identifiable child or parent
  data, and public student records.
- The paid privacy plan suppresses contextual advertising and analytics
  monetization beyond provider-service/legal/security use.
- `tests/one-time-provider-directory-consent.test.js` verifies allowed public
  profile review, missing-consent/prohibited-use blocking, and paid privacy
  plan behavior.
