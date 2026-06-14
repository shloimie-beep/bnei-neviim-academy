# Signup Credit Payment-Link Email Live Deploy

Created: 2026-06-13T23:55:00+03:00
Source: chat request that a parent chose credit after signup but did not receive the payment link by email.

## Intent

Ship the locally verified signup email fix so future credit signups receive the configured credit-card payment link by email at every parent email supplied on the form.

## Production Action Already Done

- Inspected latest signup #12 in the live database.
- Found `payment_method = green_invoice`, Parent 2 email present in signup notes, and only one previous `signup_confirmation` email recipient.
- Manually sent the credit payment link to both recorded parent emails for signup #12.
- Sent a second readable English resend after the first Hebrew-script one-off logged with a garbled subject through PowerShell encoding.
- Readback confirmed two `bna_email_log` rows with `email_type = credit_payment_link_resend_readable`, `status = sent`, readable subject `Bnei Neviim Academy credit payment link`, and zero failures.

## Local Code Changes

- `server.js`
  - Added `signupPaymentMethodKey()`.
  - Added `signupConfirmationRecipients()` to collect Parent 1, submitted Parent 2, and saved `Parent 2 Email:` notes fallback.
  - Updated `signupConfirmationEmail()` so credit emails include `PAYMENT_LINK` when configured and explain when no confirmed automatic link exists.
  - Updated `sendSignupConfirmationEmail()` to send/log each recipient separately and track `payment_link_status` metadata.
  - Passed `paymentLink` and `extraRecipients: [parent2_email]` from `/api/submit`.
  - Added `confirmationEmailRecipientCount` to signup responses.
- `tests/parent-student-portal-contract.test.js`
  - Added a contract test that credit signup confirmation sends the configured payment link to every parent email.

## Verification

- PASS `node --check server.js`
- PASS `node --test tests/parent-student-portal-contract.test.js`
- PASS `node --test tests/signup-permissions-mobile-homepage.test.js`
- PASS encoding readback: `signupConfirmationEmail` contains real Hebrew codepoints, no BOM, one trailing newline.
- BLOCKED latest `npm test`: unrelated staged legacy-GHL archive removed `src/lib/ghl/bna.ts` while `tests/contact-role-repair.test.js` still reads it. Do not treat this as a signup email failure.

## Live Blocker

Do not deploy from the current checkout without an explicit decision: the worktree contains a very large set of unrelated uncommitted changes and deleted/archived files. A Railway deploy from this checkout would likely ship unrelated local work.

The same dirty-worktree issue currently blocks a clean full-suite result: `src/lib/ghl/bna.ts` is staged as renamed into `docs/archive/legacy-ghl/src-lib-ghl/bna.ts`, but `tests/contact-role-repair.test.js` still reads the old path.

## Next Step

Use a clean deploy scope or get explicit approval to deploy the full dirty worktree, then run:

- Railway redeploy
- `npm run railway:doctor`
- `npm run app:smoke`
- A live credit signup/email-log smoke proving Parent 1 and Parent 2 both receive the payment-link email
