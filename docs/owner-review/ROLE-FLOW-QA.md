# Role Flow QA

Generated: 2026-06-24T15:25:39.104Z
Release candidate SHA: 03454ea4a9152946d21452141ed427277705fab1
Local base URL: http://127.0.0.1:58379
Result: PASS

Guardrail: this run used a local server plus Playwright route mocks for `/api/*`. It did not use external credentials, read production state, mutate a production database, deploy, send email or Telegram messages, publish, upload, charge, alter DNS, or request secret values.

## Primary Role Journeys

| Journey | Audience | Viewport | Status | Assistant | Surface | Deep link | Refresh | Back nav | Workspace switch | Overflow px | Broken images | Console errors | Screenshot |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Anonymous public visitor | Public | desktop | passed | website-assistant | public | yes | yes | yes | n/a | 0 | 0 | 0 | ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/desktop-public-visitor.png |
| Parent with one linked child | Parent | desktop | passed | website-assistant | parent_portal | yes | yes | yes | n/a | 0 | 0 | 0 | ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/desktop-parent-one-child.png |
| Parent with multiple children | Parent | desktop | passed | website-assistant | parent_portal | yes | yes | yes | n/a | 0 | 0 | 0 | ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/desktop-parent-multiple-children.png |
| Student | Student | desktop | passed | website-assistant | student_portal | yes | yes | yes | n/a | 0 | 0 | 0 | ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/desktop-student.png |
| Provider administrator | Provider admin | desktop | passed | website-assistant | provider_workspace | yes | yes | yes | n/a | 0 | 0 | 0 | ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/desktop-provider-admin.png |
| Provider participant/member | Provider participant | desktop | passed | website-assistant | one_time_member | yes | yes | yes | n/a | 0 | 0 | 0 | ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/desktop-provider-participant.png |
| One Time member | One Time member | desktop | passed | website-assistant | one_time_member | yes | yes | yes | n/a | 0 | 0 | 0 | ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/desktop-one-time-member.png |
| Platform super-admin | Super admin | desktop | passed | operations-helper | operations | yes | yes | n/a | rabbi_sheller_provider | 0 | 0 | 0 | ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/desktop-super-admin.png |
| Anonymous public visitor | Public | mobile | passed | website-assistant | public | yes | yes | yes | n/a | 0 | 0 | 0 | ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/mobile-public-visitor.png |
| Parent with one linked child | Parent | mobile | passed | website-assistant | parent_portal | yes | yes | yes | n/a | 0 | 0 | 0 | ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/mobile-parent-one-child.png |
| Parent with multiple children | Parent | mobile | passed | website-assistant | parent_portal | yes | yes | yes | n/a | 0 | 0 | 0 | ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/mobile-parent-multiple-children.png |
| Student | Student | mobile | passed | website-assistant | student_portal | yes | yes | yes | n/a | 0 | 0 | 0 | ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/mobile-student.png |
| Provider administrator | Provider admin | mobile | passed | website-assistant | provider_workspace | yes | yes | yes | n/a | 0 | 0 | 0 | ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/mobile-provider-admin.png |
| Provider participant/member | Provider participant | mobile | passed | website-assistant | one_time_member | yes | yes | yes | n/a | 0 | 0 | 0 | ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/mobile-provider-participant.png |
| One Time member | One Time member | mobile | passed | website-assistant | one_time_member | yes | yes | yes | n/a | 0 | 0 | 0 | ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/mobile-one-time-member.png |
| Platform super-admin | Super admin | mobile | passed | operations-helper | operations | yes | yes | n/a | rabbi_sheller_provider | 0 | 0 | 0 | ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/mobile-super-admin.png |

## Logged-Out And Wrong-Role Access

| Journey | Viewport | Status | Checked destinations | Screenshot |
| --- | --- | --- | --- | --- |
| Wrong-role and logged-out access | desktop | passed | /operations -> /operations-login.html?returnTo=%2Foperations; /parent/login -> /parent/login; /student/login -> /student/login; /provider/login -> /provider/login | ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/desktop-wrong-role-logged-out.png |
| Wrong-role and logged-out access | mobile | passed | /operations -> /operations-login.html?returnTo=%2Foperations; /parent/login -> /parent/login; /student/login -> /student/login; /provider/login -> /provider/login | ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/mobile-wrong-role-logged-out.png |

## Failure State

| Journey | Viewport | Status | Screenshot |
| --- | --- | --- | --- |
| Synthetic API failure state | desktop | passed | ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/desktop-api-failure-state.png |
| Synthetic API failure state | mobile | passed | ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/mobile-api-failure-state.png |

## Screenshots

- desktop / Anonymous public visitor: ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/desktop-public-visitor.png
- desktop / Parent with one linked child: ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/desktop-parent-one-child.png
- desktop / Parent with multiple children: ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/desktop-parent-multiple-children.png
- desktop / Student: ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/desktop-student.png
- desktop / Provider administrator: ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/desktop-provider-admin.png
- desktop / Provider participant/member: ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/desktop-provider-participant.png
- desktop / One Time member: ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/desktop-one-time-member.png
- desktop / Platform super-admin: ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/desktop-super-admin.png
- mobile / Anonymous public visitor: ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/mobile-public-visitor.png
- mobile / Parent with one linked child: ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/mobile-parent-one-child.png
- mobile / Parent with multiple children: ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/mobile-parent-multiple-children.png
- mobile / Student: ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/mobile-student.png
- mobile / Provider administrator: ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/mobile-provider-admin.png
- mobile / Provider participant/member: ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/mobile-provider-participant.png
- mobile / One Time member: ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/mobile-one-time-member.png
- mobile / Platform super-admin: ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/mobile-super-admin.png
- desktop / Wrong-role and logged-out access: ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/desktop-wrong-role-logged-out.png
- mobile / Wrong-role and logged-out access: ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/mobile-wrong-role-logged-out.png
- desktop / Synthetic API failure state: ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/desktop-api-failure-state.png
- mobile / Synthetic API failure state: ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/mobile-api-failure-state.png

## Remaining QA Notes

- No small mobile tap targets were detected in the checked primary role surfaces.
- No browser console errors were detected outside the favicon/404 allowlist.
- No failed browser requests were detected outside the favicon allowlist.
- Header/navigation internal links returned expected local statuses.
- No broken visible images were detected on the checked surfaces.
- Super-admin workspace switching into the One Time provider workspace passed where applicable.
