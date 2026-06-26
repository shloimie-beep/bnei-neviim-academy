# Parallel Brand CSS Handoff

Date: 2026-06-26

## Lane

- Branch: `codex/parallel-onetime-brand-css-20260626`
- Worktree: `C:\Users\User\Documents\Codex\2026-06-26\parallel-onetime-brand-css`
- Base: `codex/onetime-rabbi-ui-preflight-20260626` at `ab6741bd5ca3d7d9457e292f8a58165d58a65f67`
- Push/deploy: not pushed, not merged, not deployed
- Production mutation: none
- Route/action registry edits: none

## Files Changed

- Added `public/css/one-time-operations.css`
- Added `tests/one-time-operations-brand-css.test.js`
- Added this handoff file

## CSS Scope

The new stylesheet is intentionally inactive until Operations integration adds
a One Time scope hook. All selectors are scoped under at least one of:

- `body.one-time-operations-active`
- `[data-one-time-rabbi-dashboard]`
- `[data-one-time-rabbi-module]`

The file has no global `body { ... }` override and no `:root` token override.

## Visual Tokens

Defined tokens include:

- `--ot-ops-background: #080910`
- `--ot-ops-panel: #10131a`
- `--ot-ops-card: #081323`
- `--ot-ops-card-strong: #102634`
- `--ot-ops-border`
- `--ot-ops-muted-text: #aeb9c6`
- `--ot-ops-accent: #0b9fc9`
- `--ot-ops-accent-deep: #08779c`
- `--ot-ops-warning-gated: #ede518`
- `--ot-ops-success-ready: #08779c`
- `--ot-ops-preview-no-write: #faf9f4`
- `--ot-ops-logo: url("/images/one-time/brand/onetimelogo.webp")`
- `--ot-ops-hero-portrait: url("/images/one-time/brand/onetime-hero-vertical.webp")`

## Component Selectors

Reusable selectors are ready for the final integration pass:

- Dashboard hero: `.one-time-ops-dashboard-hero`
- Package status: `.one-time-ops-package-status`, `.one-time-approval-packet`
- Module grid: `.one-time-ops-module-grid`, `.one-time-lane-grid`, `.one-time-output-grid`
- Setup blockers: `.one-time-ops-setup-blockers`, `.one-time-blocker-list`, `.one-time-blocker-chip`
- Content cards: `.one-time-ops-content-card`, `.one-time-report-card`, `.one-time-lane-card`, `.one-time-output-state`
- Button state chips: `.one-time-ops-chip[data-state="gated"]`, `[data-state="ready"]`, `[data-state="preview"]`, `[data-state="blocked"]`
- Mobile button rows: `.one-time-ops-mobile-button-row`
- Existing no-write preview hook: `[data-one-time-drive-brief-preview] .example-chip`

Responsive safety is included at `640px` and `390px`, with single-column grids
and wrapping button/chip rows.

## Intended Operations Integration

Add the stylesheet link to `public/operations.html` after the existing app
icons/fonts and before the inline app stylesheet:

```html
<link rel="stylesheet" href="/css/one-time-operations.css">
```

Then activate it only for the Rabbi Sheller / One Time Operations context, for
example:

```js
document.body.classList.toggle('one-time-operations-active', currentWorkspaceIsOneTime());
```

Wrap One Time dashboard/module panels during final integration with:

```html
<section data-one-time-rabbi-dashboard>...</section>
<section data-one-time-rabbi-module>...</section>
```

No final public website redesign was done in this lane.

## Verification

Passed:

```text
node --test tests/one-time-shared-review-branding.test.js
```

Result: 5 tests passed.

Passed:

```text
node --test tests/one-time-operations-brand-css.test.js
```

Result: 3 tests passed.

## No-Push Confirmation

This lane stopped local-only. No push, merge, deploy, registry edit, external
write, or production mutation was performed.
