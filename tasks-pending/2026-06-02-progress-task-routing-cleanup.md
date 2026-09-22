# Progress Task Routing Cleanup - 2026-06-02

## Why This Exists

The operator told the Telegram bot on 2026-06-01 to update the public website goal progress from 2 pages to 3 pages. That instruction was buried in natural-language ramble context and did not become a clean visible task/changelog item.

## Completed

- Updated public homepage learning progress:
  - `3/30` pages
  - 10 percent progress
  - English note: `Latest report: 3 pages learned...`
  - Hebrew note updated to 3 pages
- Filed clean Changelog task #33:
  - title: `Update homepage learning progress to 3 of 30 pages`
  - assigned to `Kimi`
  - marked `done`
  - marked verified after live smoke
- Tightened Operations Tasks routing:
  - Active Work = decisions and actionable personal/current work
  - Changelog = read-only completed Kimi/Codex/system work
  - Done = Shloimie's completed personal tasks only
  - Changelog cards have no action buttons
- Removed stale state text that said the goal was still 2/30.

## Verification

- Local Playwright smoke:
  - homepage shows 3/30
  - old `2 pages learned` copy is gone
  - Tasks view has no Kimi/test workflow buttons
- Live Railway deployment `e9d7ee05-02e8-4bec-b85f-ae49f6025b5c` succeeded.
- Live Playwright smoke:
  - `/api/health` OK
  - homepage shows 3/30
  - old `2 pages learned` copy is gone
  - Tasks view has Changelog and no confusing Kimi/test buttons
- Changelog task #33 verified visible under the Changelog focus.

## Rule Going Forward

If Telegram captures a clear machine task, it should become a clean task/changelog item with a rephrased title and explanatory note. The original ramble should not be the visible task title.
