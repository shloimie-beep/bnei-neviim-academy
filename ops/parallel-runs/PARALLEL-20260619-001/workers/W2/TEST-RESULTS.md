# W2 Test Results

Date: 2026-06-19

## Commands

```text
node --test tests\platform-ui\platform-ui-contract.test.js
```

Result: passed.

```text
node --test tests\platform-ui\platform-ui-playwright-smoke.mjs
```

Result: passed.

```text
git diff --check
```

Result: superseded by staged whitespace check before commit:

```text
git diff --cached --check
```

Result: passed.

## Covered

- Frozen shell view-model contract shape.
- BNA module visibility.
- One Time module visibility and school-only module hiding.
- ModuleCardViewModel-derived cards.
- Member/student validation and local submit state.
- Community creation event.
- Course creation event.
- Lesson video attachment event.
- Reward assignment state.
- Integration readiness check with secret redaction.
- Rendered surface coverage for required modules.
- Adapter event and endpoint manifest coverage.
- Responsive browser smoke at 360 x 800, 390 x 844, 768 x 1024, and
  1440 x 900.
- Browser checks for no horizontal overflow and bounded dialogs.
- Final staged whitespace check.

## Screenshots

The PNG files are generated local evidence and ignored by the repo
`screenshots/` rule. The committed manifest is `SCREENSHOTS.md`.

- `ops/parallel-runs/PARALLEL-20260619-001/workers/W2/screenshots/mobile-360.png`
- `ops/parallel-runs/PARALLEL-20260619-001/workers/W2/screenshots/mobile-390-onetime.png`
- `ops/parallel-runs/PARALLEL-20260619-001/workers/W2/screenshots/tablet-768.png`
- `ops/parallel-runs/PARALLEL-20260619-001/workers/W2/screenshots/desktop-1440.png`

## Known Environment Note

The W2 worktree did not have its own `node_modules/playwright`. The Playwright
smoke resolves Playwright from the local worktree first, then from
`BNA_PLAYWRIGHT_NODE_MODULES`, `NODE_PATH`, or the sibling main checkout
`node_modules`. No dependency install or lockfile edit was performed.
