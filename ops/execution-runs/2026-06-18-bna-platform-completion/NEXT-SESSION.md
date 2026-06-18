# Next Session

Updated: 2026-06-19T02:30:30+03:00

Resume the active execution run. Do not restart, re-plan, run a baseline UI crawl, run watch loops, or deploy.

Current branch: `codex/2026-06-18-bna-platform-completion`.

Latest completed local batches:

- REQ-20260618-164: Homepage provider CTA now says Advertise your program for free and explains free community listing expectations.
- REQ-20260618-165: Signup pages, signup thank-you, and parent manifest now use direct parent signup/self-governance messaging and consistently say parent app access is six months free.
- REQ-20260618-166: Portal header identity coverage now spans public/provider, parent signup launch, Student Portal, Operations shell, and Operations login while preserving manifest separation.

Exact next requirement:

- REQ-20260618-167 / BNA-PUBLIC-005: Public/blog/FAQ/signup/portal route and CTA integrity.

Blocked requirement intentionally skipped:

- REQ-20260618-156 / BNA-STUDENT-002 remains `needs_operator_decision` because duplicate Menachem cleanup requires production/student data merge approval after safe local dry-run evidence. Do not mutate production data without explicit operator approval.

Exact next command:

```powershell
npm run bna:run:status
rg -n "href=|signup|blog|faq|student|portal|cta|manifest|canonical|sitemap|thank-you|operations" public tests server.js
```

Then inspect public/blog/FAQ/signup/student/manifest route and CTA behavior, fix any broken or private route leakage, and add focused regression coverage.

Still open after this batch:

- REQ-20260618-124 remains `in_progress` until broader workspace-owned entity API filtering, release approval, deploy, and live smoke are complete.
- REQ-20260618-125 through REQ-20260618-155 and REQ-20260618-157 through REQ-20260618-166 remain `needs_verification` until final acceptance sweep, release approval, deploy, and live smoke where applicable.
- REQ-20260618-156 remains `needs_operator_decision` for duplicate-student cleanup approval.
- REQ-20260618-167 through REQ-20260618-169 remain open for public route/CTA and acceptance-test coverage.
- Audit-output-only items remain blocked only where screenshot/audit output is genuinely required.

No deployment or production-data mutation is approved.
