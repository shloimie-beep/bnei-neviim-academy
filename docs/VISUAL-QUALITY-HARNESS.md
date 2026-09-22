# Visual Quality Harness Contract

This is the BNA contract for executable visual and accessibility evidence. It
does not require brittle screenshot baselines for every route. It requires
capture, inspection, and evidence before any UI cleanup packet can claim Done.

## Required Capabilities

1. Playwright screenshot capture for route and viewport matrices.
2. Screenshot comparison for stable key routes where a baseline exists.
3. Screenshot-required assertion for UI-cleanup requirements.
4. ARIA snapshot or accessibility-tree capture for semantic structure.
5. Axe accessibility scan for WCAG A/AA where feasible.
6. DOM/text leak scan for forbidden content:
   - raw JSON;
   - raw provider payload;
   - raw transcript body;
   - API key/env var names;
   - unrelated workspace data;
   - GHL/LeadConnector runtime references in active first-party UI;
   - internal support text in Rabbi/member views.
7. State-matrix smoke runner.
8. Evidence report writer.

## Required Harness Layers

The v3 visual harness contract has these layers:

1. Screenshot capture.
2. Screenshot comparison where stable.
3. ARIA snapshot.
4. Axe accessibility scan where available.
5. State matrix smoke.
6. Console error scan.
7. Network error scan.
8. Forbidden text/data leak scan.
9. Role/scope leakage scan.
10. Action/button state scan.
11. Mobile drawer/back-action scan.
12. Route/action registry coverage scan.

## CLI Contract

When implemented, the runner should accept:

```bash
node scripts/audit-product-quality-ui.mjs --packet ops/prompt-packets/.../packet.json --out ops/ui-audits/YYYY-MM-DD-slug
```

Required output:

- `report.md`
- `report.json`
- `screenshots/`
- `aria/`
- `accessibility/`
- `state-matrix/`
- `console-errors.json`
- `network-errors.json`
- `forbidden-content-scan.json`
- `registry-coverage.json`

Use strict screenshot comparison only for stable baselines. For broad cleanup,
prefer capture plus required-evidence checks first.

The harness implementation may be added incrementally. The non-negotiable v3
contract is that UI cleanup packets must declare the harness outputs they need
and cannot claim Done without screenshot/mobile/state/accessibility evidence or
an exact blocker.

## Accessibility Baseline

User-facing UI must check:

- contrast minimum for text and non-text controls;
- visible focus state;
- focus not obscured by sticky headers/drawers;
- keyboard path for critical actions;
- labels/instructions for fields;
- name/role/value for controls;
- target size minimum for mobile/touch;
- no action conveyed by color alone;
- error identification;
- reflow/no horizontal scrolling at mobile viewport unless intentionally
  scrollable table handling is documented;
- modal/drawer close path;
- no trapped focus;
- readable mobile typography;
- touch targets not crowded.

Automated WCAG checks supplement human/agent visual inspection. They do not
replace screenshot review against `ops/visual-quality-rubric.md`.

## Done Rule

A UI cleanup packet cannot be Done if it introduces new P0/P1 accessibility
defects. Missing axe/ARIA/screenshot evidence is either a blocker or a failing
Definition of Done gate.
