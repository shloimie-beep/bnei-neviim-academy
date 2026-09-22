# RAW-20260705-009 - One Time Canonical Target Routing Correction

Source: codex_chat attachment
Source file: `C:\Users\User\.codex\attachments\de5a81ea-b939-4fc0-86b0-4a40f496c900\pasted-text.txt`
Captured at: 2026-07-05T17:47:00+03:00
Parse status: registered

## Raw text

URGENT: Stop normal implementation. We need to correct a target-routing mistake
and install a target-aware workflow so future rambles do not land on the wrong
app.

User-discovered issue:
I asked for the OneTimeOneTime Mishnayos public landing page to be updated.
The updated/new funnel appears on:

- https://bneineviimacademy.org/one-time/#watch

But the canonical public landing page that must receive the correction is:

- https://join.onetimeonetime.com/one-time/
- and likely also https://join.onetimeonetime.com/ if that is intended as the
  root funnel

The current join.onetimeonetime.com page still shows the older "Learn
Mishnayos Live with Rabbi Eli Scheller" hero/video layout, while the BNA-hosted
`/one-time` route shows the newer "Your Child Can Love Learning Mishnayos"
page. That means the work was applied to the wrong live target or the two
routes are using divergent landing-page sources.

Mission:
Create a target-aware audit and then fix the routing/source-of-truth mistake.
Do not call this done until the canonical `join.onetimeonetime.com` target is
live-verified.

Hard rules:

- Do not delete either Postgres service.
- Do not mutate production data.
- Do not perform email/WhatsApp/SMS/Telegram sends.
- Do not create charges, payment links, access grants, DNS changes, Drive
  writes, credential changes, or provider-account mutations.
- Do not broad-merge stale draft PRs.
- Do not say "goal complete" unless `join.onetimeonetime.com` is verified, not
  only `bneineviimacademy.org`.

The packet requires:

1. A target map report at
   `ops/ui-audits/2026-07-05-onetime-canonical-target-routing/REPORT.md`.
2. Identification of why BNA `/one-time` and join `/one-time/` diverged.
3. A smallest safe fix so canonical One Time production at
   `https://join.onetimeonetime.com/one-time/` uses the intended public funnel.
4. Target-aware release guardrails so One Time public work cannot be marked done
   from BNA production proof alone.
5. Shared-platform versus provider-specific architecture notes.
6. Sidebar/navigation audit findings for One Time Operations.
7. Visual QA findings with screenshots/browser evidence for One Time Operations
   views.
8. Stale PR cleanup recommendations for PR #62, PR #63, and PR #51.
9. Required baseline commands:
   `git fetch --all --prune`, `git status -sb`, `git branch --show-current`,
   `git log -1 --oneline`, `gh pr status`, `npm run release:captain`,
   `npm run bna:run:validate`, and `npm run bna:run:next`.
10. After code changes, focused tests, direct
    `join.onetimeonetime.com/one-time/` smoke, secrets audit, `git diff --check`,
    and the release/target guard.

Done criteria:

1. The target map report exists.
2. The repo identifies why BNA `/one-time` and join `/one-time/` diverged.
3. `join.onetimeonetime.com/one-time/` shows the intended updated One Time
   public funnel.
4. `bneineviimacademy.org/one-time` is either intentionally synced, redirected,
   or documented as a preview.
5. A target-aware guard exists or is clearly blocked with the exact reason.
6. The One Time production target is live-smoked directly.
7. The report ends with the required status block:
   Release state; BNA production; BNA-hosted One Time preview; One Time
   production; Local-only work; PR-open work; Merged-not-deployed work;
   Deployed-not-smoked work; Live-verified work; Blockers; Single safest next
   action.
