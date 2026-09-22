# Google Public OAuth Verification Packet

Date: 2026-06-15

Status: local readiness packet only. This file does not submit a Google
verification request, change OAuth consent settings, start OAuth, connect an
account, request scopes, write Google data, write Drive/Classroom/Calendar/
Business Profile data, send messages, or change production behavior.

## Purpose

Phase 2 Mode C needs a concrete packet for public production OAuth. BNA can
continue using no-OAuth/manual features and test-user OAuth. Public Google
verification should wait until the exact scopes, user-facing behavior,
privacy/deletion language, demo evidence, and owner approval are ready.

## Official Sources Checked

Check these again at submission time because Google requirements can change:

- OAuth App Verification:
  https://support.google.com/cloud/answer/13463073
- Google API Services User Data Policy:
  https://developers.google.com/terms/api-services-user-data-policy
- Sensitive scope verification:
  https://developers.google.com/identity/protocols/oauth2/production-readiness/sensitive-scope-verification
- Restricted scope verification:
  https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification
- Demo video guidance:
  https://support.google.com/cloud/answer/13804565

Current source-derived rules for this packet:

- Sensitive or restricted scopes generally require OAuth app verification before
  public use.
- Restricted scopes can require additional review and possibly an annual
  third-party security assessment when server-side access is involved.
- Testing mode is for named test users; it is not public production approval.
- Privacy disclosures must clearly explain identity, requested data, purpose,
  storage, sharing, deletion, and user control.
- Requested permissions must be the minimum needed for the user-facing feature.
- Demo evidence should show the submitted app, OAuth consent flow, requested
  scopes, and app functionality that uses each requested scope.

## Approval Phrase

Use this exact phrase before Codex prepares or submits the production OAuth
verification packet:

`APPROVE_GOOGLE_PUBLIC_OAUTH_VERIFICATION_PACKET`

This is not approval for a live Google write. Live adapter writes still need
`APPROVE_GOOGLE_LIVE_ADAPTER_TEST` and the per-action target, scope, payload,
rollback, and readback details.

## Required Fields

A valid approval must include:

- Google Cloud project id/name.
- OAuth app name and branding owner.
- Production domain and authorized domains.
- Support email and monitored contact.
- Homepage URL.
- Privacy policy URL.
- Terms/support URL.
- Data deletion/disconnect URL or exact in-app disconnect path.
- Final requested scope list copied from the Cloud Console Data Access page.
- Cloud Console category for each scope at time of submission.
- Feature justification for each scope.
- Whether each scope is no-OAuth, test-user only, sensitive, restricted, or
  deferred.
- Test-user smoke evidence paths for each feature.
- Demo video URL or recording owner and script.
- Screenshots or live route list used in the demo.
- Whether any restricted scope would require a security assessment.
- Rollback plan if Google rejects, delays, or narrows approval.
- Owner who will receive and answer Google verification emails.

## Scope Submission Matrix

| Feature | Current BNA path | Public verification recommendation | Evidence needed |
|---|---|---|---|
| Calendar availability | Internal BNA calendar and manual links work now. | Request only if public users truly need Google free/busy. | Demo showing availability read and user-facing value. |
| Calendar event creation | Internal events and dry-run previews exist. | Prefer app-created/owned event scopes over broad calendar scopes when possible. | Test-user smoke showing preview, approval, create, readback, and delete. |
| Classroom courses/materials | Assignment and topic/material previews exist. | Keep Classroom test-user first; avoid rosters, guardians, and grades. | Demo showing selected course/topic, material payload, and no student leakage. |
| Drive file search/list | Public/imported files and owner pipeline work now. | Do not request broad Drive access until a narrow known-folder or app-created policy is approved. | Scope audit proving least privilege and no raw child/private leakage. |
| Drive/Docs create or move | Preview-only actions exist. | Split read/list/create/move needs; request only the minimum scopes for the approved workflow. | Demo showing one approved document/folder action and rollback. |
| Google Business Profile | Manual provider profile URL and Place ID are active. | Keep manual/preview mode until provider opt-in, ownership, API access, and `business.manage` policy are approved. | Provider opt-in, location readback, no fake reviews, honest review-request policy. |
| Gmail/email | BNA uses Resend/app email paths. | Do not request Gmail scopes for current BNA workflows. | None; keep out of production OAuth packet. |

## Privacy And Deletion Checklist

Before submission, publish or update policy language that covers:

- Which Google data BNA accesses for Calendar, Classroom, Drive, Docs, or
  Business Profile.
- Why each data type is needed for a visible BNA feature.
- Where data is stored: first-party BNA database, local logs, imported files,
  or not stored.
- Who can view the data: scoped Operations users only, with role/workspace
  boundaries.
- How users disconnect Google from Operations.
- How users request deletion of stored Google-derived data.
- Limited-use commitments: no sale or transfer to ads/data brokers, no hidden
  secondary use, no broad AI/model training, no human review except approved
  support/security/legal/internal-operations cases.
- Child/student privacy boundaries and why Google sign-in is optional for
  mixed-audience public pages.

## Demo Video Script

The demo should show the same BNA app and OAuth client submitted for
verification.

Recommended script:

1. Open the public BNA site and show the app name/branding.
2. Sign in to Operations as the approved test admin.
3. Open Operations > Integrations > Google.
4. Show no-OAuth/manual mode and the warning that natural language does not
   bypass scopes.
5. Start OAuth for the approved test role.
6. Show the full OAuth consent screen in English with the exact requested
   scopes.
7. Complete consent as a named test user.
8. Show account/scopes/readiness in Operations.
9. Run one dry-run preview for each requested scope family.
10. For any approved write-scope demo, perform one narrow test write, show
    readback, then show rollback/delete.
11. Disconnect the Google account from Operations.
12. Show the privacy/deletion page or in-app deletion instructions.

## Submission Gate

Do not submit public OAuth verification until:

- Test-user OAuth is working for the exact scopes.
- A full dry-run and readback exists for every requested feature.
- Any live write demo has a rollback/delete path and uses test records only.
- Public and portal privacy smokes are still green.
- The demo video is recorded, accessible, and matches the submitted app.
- Privacy/deletion/support URLs are live.
- Scope categories were checked in the Cloud Console the same day as
  submission.
- Shloimie approves the final packet with
  `APPROVE_GOOGLE_PUBLIC_OAUTH_VERIFICATION_PACKET`.

## Guardrail

Do not add Gmail, broad Drive, rosters, guardians, grades, Google Business
Profile, review, or provider-owned scopes just because the app may need them
later. Do not submit hidden scopes. Do not claim public verification is
complete from a local checklist. Do not use production user data in demo
evidence. Keep no-OAuth/manual and test-user modes available even after a
public submission.
