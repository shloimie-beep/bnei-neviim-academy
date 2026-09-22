# Operations Release Cleanup - 2026-06-11

## Summary

This cleanup pass classified the dirty workspace, protected unrelated work from accidental deployment, fixed the remaining P1 parent/student dock overlap issues, generated release screenshots, created a clean release worktree, applied the curated patch, and ran the requested verification commands from that clean branch.

No deployment was performed.

## Clean Release Worktree

- Worktree: `C:\Users\User\bna-release-clean`
- Branch: `release/operations-parent-student-action-registry-2026-06-11`
- Base commit: `484563b`
- Curated patch: `ops/release/2026-06-11-operations-release-cleanup/release-relevant-files.patch`
- Clean local server used for smoke: `http://127.0.0.1:18080`
- Clean local server status: stopped after verification
- Temporary Google smoke secrets: copied for OpenAI/Drive smoke only, then removed from the clean worktree

## Dirty Workspace Classification

- Git status entries classified: 353
- Individual tracked/untracked files classified: 1957
- Individual untracked files: 1774
- Curated patch files: 62
- Relevant release entries (A+B): 62
- Generated artifacts excluded from release patch (C): 732
- Unrelated/unknown/unsafe entries (D+E+F): 1163
- Unsafe tracked deletions (F): 100
- Unknown/manual-review entries (E): 842

### Status Entry Counts

| Class | Count |
| --- | ---: |
| A - current release-critical | 22 |
| B - current release support/docs/tests | 13 |
| C - generated artifacts | 2 |
| D - unrelated existing work | 79 |
| E - unknown/manual review | 137 |
| F - unsafe deletion/rename | 100 |

### Individual File Counts

| Class | Count |
| --- | ---: |
| A - current release-critical | 32 |
| B - current release support/docs/tests | 30 |
| C - generated artifacts | 732 |
| D - unrelated existing work | 221 |
| E - unknown/manual review | 842 |
| F - unsafe deletion/rename | 100 |

## Clean-Branch Fixes Made While Running Commands

The first clean test/smoke pass proved the original curated patch was too narrow. The patch was widened from 51 to 62 files to include the missing provider pages, Operations login shell, env example, runtime Telegram/student matching modules, and the updated live smoke script. After that, the clean branch test and smoke suite passed.

## P1 Fixes Completed

- Parent help assistant and WhatsApp controls no longer use fixed overlay positioning that covers calendar/content on mobile.
- Parent bottom action controls now render in normal document flow at the bottom of the portal content, with compact mobile spacing and RTL-safe alignment.
- Student helper control no longer overlays calendar connector text or event cards on mobile.
- Student helper action bar now renders in normal document flow at the bottom of the workspace content.
- Re-audited parent/student mobile calendar screenshots for no horizontal overflow and no bottom-dock overlap.
- Re-audited English and Hebrew parent/student screenshots for UI-chrome localization and RTL/LTR layout behavior.
- Re-audited provider participant screenshots for separation from BNA school accountability features.

## Files Changed In This Pass

- `public/parent.html`
- `public/student.html`
- `ops/release/2026-06-11-operations-release-cleanup/**`

Clean-branch patch widening also included release-required files already present in the dirty workspace, including `.env.example`, `public/operations-login.html`, `public/provider.html`, `public/providers-join.html`, `scripts/smoke-live-app.mjs`, and runtime `src/lib/bna/*` Telegram/student helper modules.

## Curated Release Patch

- Patch file: `ops/release/2026-06-11-operations-release-cleanup/release-relevant-files.patch`
- Patch file list: `ops/release/2026-06-11-operations-release-cleanup/release-patch-files.txt`
- Curated files in patch: 62
- Full dirty backup patch: `ops/release/2026-06-11-operations-release-cleanup/full-dirty-diff.patch`

The curated patch intentionally excludes screenshot PNGs, raw git dumps, generated smoke output, tmp/cache files, unrelated docs/content, unsafe tracked deletions, and broad memory/task ledger churn that should not be deployed accidentally.

## Screenshots

- Screenshot folder: `ops/release/2026-06-11-operations-release-cleanup/screenshots/`
- Screenshot index: `ops/release/2026-06-11-operations-release-cleanup/screenshot-index.md`
- Screenshots generated: 22
- Automated horizontal overflow issues: 0

Coverage includes parent desktop/mobile, parent calendar and detail drawer, parent help assistant open, parent Hebrew RTL, student desktop/mobile, student calendar and detail drawer, student helper open, student Hebrew RTL, and provider participant desktop/mobile schedule/worksheets/questions/payment views.

## Verification

| Command | Result |
| --- | --- |
| `git worktree add ..\bna-release-clean 484563b` | PASS |
| `git checkout -b release/operations-parent-student-action-registry-2026-06-11` | PASS |
| `git apply --index release-relevant-files.patch` | PASS after widening curated patch to required 62 files |
| `npm ci` | PASS: 483 packages installed, 0 vulnerabilities |
| `node --check server.js` | PASS |
| `node --check scripts\telegram-kimi-bridge.mjs` | PASS |
| `npm test` | PASS: 110/110 tests passed in clean branch |
| `npm run screenshot` | PASS: no horizontal scroll at 360, 390, 430, 768, 1440 viewports |
| `npm run app:smoke` | PASS against clean server http://127.0.0.1:18080; report ops/live-smokes/2026-06-11T14-10-33-550Z-live-app-smoke.md |
| `npm run openai:smoke` | PASS with temporary local OpenAI/Google smoke secrets; report ops/openai-smokes/2026-06-11T14-14-30-961Z-openai-sidekick-smoke.md |
| `npm run railway:doctor` | PASS |
| `npx lighthouse http://127.0.0.1:18080` | PARTIAL: report generated, command exited 1 on Windows Chrome temp cleanup EPERM; scores performance 67, accessibility 84, best practices 96, SEO 100 |
| `git apply --cached --check release-relevant-files.patch` | PASS after final rebuild |

## Readiness

- Parent portal: ready for clean-branch review/pilot from the curated patch.
- Student workspace: ready for clean-branch review/pilot from the curated patch.
- Provider participant portal: ready for clean-branch review/pilot from the curated patch and remains separate from BNA school accountability pages.
- Calendar: ready for clean-branch review/pilot; mobile defaults to readable list/agenda screenshots and internal/disconnected states render.
- Action registry/Telegram/UI bot work: included in the curated patch for review, with tests passing.
- Deployment from the current dirty workspace: blocked.
- Deployment from the clean branch: technically ready for review after committing the staged 62-file patch, but no deploy was performed.

## Remaining Blockers

- Current original workspace is still heavily dirty and must not be deployed directly.
- 100 unsafe tracked deletions/renames require manual review before any broad commit/deploy.
- 842 unknown/manual-review entries require classification by the operator before a full cleanup branch can be merged.
- 732 generated artifacts are present and should remain excluded from the release patch unless deliberately archived.
- Lighthouse performance remains weak (performance 67, LCP 103.4 s); this is a follow-up performance task, not a blocker for the requested P0/P1 UI cleanup.

## Recommended Next Command

The clean worktree already exists and the patch is applied/staged. Review and commit there:

```powershell
Set-Location C:\Users\User\bna-release-clean
git status --short
git commit -m "Release operations parent student provider action registry"
# deploy only after you approve this clean branch
```
