# Owner Approval Unblocker Pack

Date: 2026-06-15

Purpose: collect the exact owner decisions that would unlock the remaining
Google, One Time, Buffer/social, billing, and Rabbi live-app work from the
2026-06-14 goal-mode follow-up. This is a local planning artifact only. It
does not approve, send, publish, bill, create checkout/access, write Google or
Drive, write Buffer/social, write WhatsApp/email, write an external CRM, change
member visibility, or touch Rabbi Scheller's live site.

## How To Use

Each section below is a copy-paste decision template. A valid approval must
include the approval phrase plus the required fields in that section. If the
phrase is present but the required fields are missing, Codex should treat the
request as incomplete and ask for the missing details or prepare a dry-run
preview only.

## 1. Google Live Adapter Test

Approval phrase:

`APPROVE_GOOGLE_LIVE_ADAPTER_TEST`

Use this only for a narrow test-user live adapter smoke, not broad Google
automation.

Required fields:

- Google account or test user.
- Connection type: Calendar, Classroom, Drive, or Google Business Profile.
- Exact target ID or URL, such as calendar ID, class/course ID, Drive folder,
  or business profile/location.
- Requested operation, such as create one internal calendar event, preview one
  Classroom material, read one Drive folder, or read one Business Profile field.
- OAuth scopes already approved for that test.
- Test payload or sample item.
- Rollback/delete plan if the smoke creates anything.
- Maximum number of records allowed.
- Readback evidence required before marking done.

Copy-paste template:

```text
APPROVE_GOOGLE_LIVE_ADAPTER_TEST
Test user:
Connection type:
Target ID/URL:
Operation:
Approved scopes:
Sample item/payload:
Max records:
Rollback/delete plan:
Required readback evidence:
```

Guardrail: no production-wide sync, no parent/student/member send, no bulk
Drive write, no Classroom roster change, and no Google Business edit without a
separate approval.

## 2. One Time Member-Library Publishing Smoke

Approval phrase:

`APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING`

Use this only for one exact item or one exact smoke package.

Required fields:

- Destination app/site/admin URL.
- Destination workspace/library/collection.
- Item title and source record/job ID.
- Hosted media URL or confirmed upload path.
- Visibility: private admin review, Rabbi-only, member-only, public, or test
  hidden item.
- Audience and access tier.
- Notification policy: no notification, draft only, or exact approved message.
- Rollback/revoke path.
- Smoke account to use for readback.
- Success evidence required before marking done.

Copy-paste template:

```text
APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING
Destination URL:
Library/collection:
Source record/job ID:
Item title:
Hosted media URL/upload path:
Visibility:
Audience/access tier:
Notification policy:
Rollback/revoke path:
Smoke account/readback:
Required success evidence:
```

Guardrail: no member-library publish, public/member visibility, media-host
write, notification, access grant, or external CRM write unless the exact
fields above are approved.

## 3. One Time Question Digest / Public Q&A Surface

Approval phrase:

`APPROVE_ONE_TIME_QUESTION_PUBLIC_SURFACE`

Use this only after reviewing the private One Time question digest. This
approval is for one exact question/review item and one exact answer/surface
policy, not for opening a general forum.

Required fields:

- Source review ID or digest item.
- Target surface: private admin, Rabbi-only, member-only, public Q&A, or forum
  thread.
- Answer visibility and wording policy.
- Rabbi/admin reviewer.
- Student identity policy: omit, anonymous, pseudonymized, or explicitly
  approved attribution.
- Reward/badge policy, or explicit no rewards.
- Leaderboard policy, or explicit no leaderboard.
- Notification channels and recipients, or explicit no notification.
- Safety/moderation escalation owner.
- Rollback/unpublish path.
- Smoke account/readback evidence.

Copy-paste template:

```text
APPROVE_ONE_TIME_QUESTION_PUBLIC_SURFACE
Source review ID/digest item:
Target surface:
Answer visibility/wording policy:
Rabbi/admin reviewer:
Student identity policy:
Reward/badge policy:
Leaderboard policy:
Notification channels/recipients:
Safety escalation owner:
Rollback/unpublish path:
Smoke account/readback:
Required success evidence:
```

Guardrail: the private digest is review-only. No public forum post,
member-visible answer, reward, badge, leaderboard, notification, student
identity exposure, email, WhatsApp, SMS, Telegram, portal send, Google,
Buffer/social, billing, member-library, WAPI, external CRM, or other connector
write is approved by the digest itself.

## 4. One Time Billing Provider And Refund Policy

Choose exactly one provider approval:

- `APPROVE_ONE_TIME_BILLING_PROVIDER_GREEN_INVOICE`
- `APPROVE_ONE_TIME_BILLING_PROVIDER_STRIPE`
- `APPROVE_ONE_TIME_BILLING_MANUAL_BRIDGE`

Choose exactly one refund policy approval:

- `APPROVE_ONE_TIME_REFUND_POLICY_R1_NO_REFUNDS`
- `APPROVE_ONE_TIME_REFUND_POLICY_R2_SEVEN_DAY_FIRST_PAYMENT`
- `APPROVE_ONE_TIME_REFUND_POLICY_R3_TRIAL_THEN_NO_REFUNDS`

Required fields:

- Provider of record.
- Plan name.
- Price and currency for each active market.
- Tax/VAT/invoice wording.
- First-cycle rule: charge now, prorate now, trial, or wait for first of month.
- Subscription anchor: first of month, signup anniversary, or manual renewal.
- Access-start rule.
- Failed-payment retry and grace period.
- Cancellation handling.
- Refund handling.
- Support owner and contact channel.
- Rollback/revoke owner.
- Test buyer/session before real traffic.

Copy-paste template:

```text
[provider approval phrase]
[refund policy approval phrase]
Provider of record:
Plan name:
Price/currency:
Tax/VAT/invoice wording:
First-cycle rule:
Subscription anchor:
Access-start rule:
Failed-payment retry/grace:
Cancellation handling:
Refund handling:
Support owner/channel:
Rollback/revoke owner:
Test buyer/session:
```

Guardrail: no payment links, checkout session, subscription, invoice, refund,
cancellation, member access, receipt, billing email, or access revoke until the
provider and refund policy are both approved with the required fields.

## 5. Buffer Social Draft Or Publish

Approval phrase:

`APPROVE_BUFFER_SOCIAL_DRAFT`

Use this first for a draft. A direct publish still needs the exact post text,
account/channel, schedule time, and rollback/no-post policy.

Required fields:

- Source record/job ID or source material.
- Channel/account: Facebook, LinkedIn, YouTube, or another configured Buffer
  target.
- Draft or publish.
- Exact copy.
- Media URL if media is included.
- Schedule window/time zone or immediate-draft instruction.
- No-post/rollback policy.
- Owner who reviews the Buffer queue.
- Success evidence required.

Copy-paste template:

```text
APPROVE_BUFFER_SOCIAL_DRAFT
Source record/job ID:
Channel/account:
Draft or publish:
Exact copy:
Media URL:
Schedule window/time zone:
No-post/rollback policy:
Buffer queue reviewer:
Required success evidence:
```

Guardrail: no Buffer draft, publish, media attach, ad spend, or public post
without the approved source, destination, copy, schedule, media, and rollback
details.

## 6. Rabbi Live App Access And Reset

There is no standing approval phrase for this because access work touches a
Rabbi-owned app. Treat it as a target-confirmation request before any write.

Required fields:

- Live app URL.
- Deployment target or Replit/project identifier.
- Whether the audited source matches live.
- Shloimie/admin email or username.
- Rabbi/member test account.
- Approved reset/login path.
- Where secrets will be exchanged outside this repo.
- Database/media/email/billing provider names only, no secret values.
- Read-only smoke checklist.
- Write permissions explicitly allowed, if any.
- Rollback/revoke owner.

Copy-paste template:

```text
RABBI_LIVE_APP_ACCESS_CONFIRMATION
Live app URL:
Deployment target:
Source/ref parity:
Admin username/email:
Rabbi/member test account:
Approved reset/login path:
Secret exchange location:
Provider source names:
Read-only smoke checklist:
Allowed write actions:
Rollback/revoke owner:
```

Guardrail: do not invent credentials, use old setup/debug secrets, reset admin
access from BNA, change member access, send notifications, publish content, or
change billing until the target and secret-handling path are approved.

## 7. External Access Persistence Workflow

Approval phrase:

`APPROVE_EXTERNAL_ACCESS_PERSISTENCE_WORKFLOW`

Use this only after reviewing
`ops/access/external-access-persistence-workflow.md`. This approval is for a
BNA Operations external-user create/edit endpoint, not for parent portal
accounts, provider portal passwords, Rabbi-owned app credentials, billing,
member-library access, or messages.

Required fields:

- Target person preferred/display name.
- Contact email/phone, or explicit reason to store no contact value.
- Workspace/project key.
- Account classification.
- Role and access level.
- Scoped Operations username, or approval for no login username.
- Allowed workspace views if different from defaults.
- Whether to create a short-lived Operations access link now.
- Delivery policy, defaulting to no send.
- Access reason and review date.
- Rollback/revoke owner and steps.
- Required readback evidence.

Copy-paste template:

```text
APPROVE_EXTERNAL_ACCESS_PERSISTENCE_WORKFLOW
Target person:
Contact email/phone:
Workspace/project key:
Account classification:
Role:
Access level:
Scoped Operations username:
Allowed workspace views:
Create access link now:
Delivery policy:
Access reason:
Review date:
Rollback/revoke owner:
Required readback evidence:
```

Guardrail: no parent/student portal account, provider portal password,
Rabbi-owned app credential, billing/access grant, member-library visibility,
email, WhatsApp, SMS, Telegram, Google/Drive, Buffer/social, WAPI, or external
CRM write is approved by this phrase.

## 8. Google Public OAuth Verification Packet

Approval phrase:

`APPROVE_GOOGLE_PUBLIC_OAUTH_VERIFICATION_PACKET`

Use this only for preparing or submitting the public Google OAuth verification
packet described in
`ops/google-integrations/google-public-oauth-verification-packet.md`. This is
not approval for a live Google write, sync, import, Calendar event, Classroom
post, Drive file action, or Google Business Profile action.

Required fields:

- Google Cloud project id/name.
- OAuth app name and branding owner.
- Production domain and authorized domains.
- Support email and monitored contact.
- Homepage, privacy policy, terms/support, and deletion/disconnect URLs.
- Final scope list from the Cloud Console Data Access page.
- Cloud Console category for each scope on the submission day.
- Feature justification and demo path for each scope.
- Test-user smoke evidence paths.
- Demo video URL or recording owner/script.
- Restricted-scope security assessment decision, if applicable.
- Google verification email owner.
- Rollback plan if Google rejects, delays, or narrows approval.

Copy-paste template:

```text
APPROVE_GOOGLE_PUBLIC_OAUTH_VERIFICATION_PACKET
Google Cloud project:
OAuth app name:
Branding owner:
Production domain:
Authorized domains:
Support email:
Homepage URL:
Privacy policy URL:
Terms/support URL:
Deletion/disconnect URL:
Final scopes and Cloud Console categories:
Feature justification by scope:
Test-user smoke evidence:
Demo video URL/script owner:
Restricted-scope security assessment decision:
Verification email owner:
Rollback plan:
```

Guardrail: this phrase does not approve `APPROVE_GOOGLE_LIVE_ADAPTER_TEST`,
does not approve new scopes beyond the listed final scope set, and does not
approve any Google read/write, Drive import/write, Calendar event, Classroom
coursework/material, Google Business Profile action, send, external CRM write,
or production data demo.

## Current Best Next Approval

If the operator wants one narrow live smoke next, the least broad approvals are:

1. Google: approve one test-user live adapter smoke with one target and a
   rollback plan.
2. One Time publishing: approve one hidden/test member-library item with one
   smoke account and rollback.
3. One Time questions: approve one private digest item for one exact
   public/member answer surface, or keep it private with no notification.
4. Buffer: approve one draft-only social item with exact copy and no publish.
5. External access: approve one dry-run-first scoped Operations external user
   workflow if Shloimie wants the Admin Users read-only panel to become a
   controlled create/edit surface.
6. Google public OAuth: approve the verification packet only after the official
   requirements, final Cloud Console scope categories, privacy/deletion URLs,
   demo video, and test-user smoke evidence are ready.

Billing and Rabbi live access should wait until the provider/access decisions
are complete enough to avoid accidental production changes.
