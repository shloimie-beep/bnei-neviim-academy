# Platform UI Design System

## Scope

This document describes the W2 platform UI package under:

- `public/platform-ui/`
- `public/js/platform-ui/`
- `public/css/platform-ui/`

The package is an isolated, mountable SaaS operations shell for Prompt 05 to
wire into `public/operations.html` or another shared entrypoint. It does not
create a new framework and does not define backend routes.

## Foundations

Tokens live in `public/css/platform-ui/platform-ui.css`.

- Color: ink, muted text, warm paper, white surface, dark operational shell,
  gold accent, teal accent, coral warning, green ready, blue watch.
- Spacing: 8px-based gaps with 10px and 12px internal control padding where
  density is needed.
- Radius: 8px maximum for app controls, cards, dialogs, tables, and rails.
- Type: Inter with system fallback. Font sizes are fixed and do not scale with
  viewport width.
- Shadow: one restrained surface shadow for repeated cards, rails, dialogs, and
  data tables.
- Motion: no required animation. Reduced-motion media query disables incidental
  transition or scroll behavior.

## Components

- App shell: sticky topbar, workspace switcher, left module rail, main view, and
  recent event rail.
- Workspace switcher: BNA and One Time fixture states share the same shell and
  apply brand overrides.
- Navigation: grouped by Overview, People, Engagement, Operations, and System.
- Buttons: primary, secondary, icon/count, link-style table action.
- Inputs: search, text, email, number, select, and textarea.
- Tables: desktop grid rows convert to stacked cards below 640px.
- Cards: only used for repeated modules, metrics, integration/provider/course
  rows, event rows, and empty states.
- Dialogs: accessible modal role, labeled title, validation errors, and bounded
  mobile height.
- Toast: status feedback for local mock actions.
- Badges: readiness/status pills with distinct ready, blocked, policy-pending,
  and neutral styles.
- Toggles: disabled module visibility preview in Settings.
- Progress: fixed-height progress bar for student/work progress.

## Brand Overrides

The shell consumes the `InstanceShellViewModel.brand` object:

```js
brand = {
  name,
  product_name,
  accent,
  accent_2,
  shell,
  surface,
  logo_label
}
```

BNA and One Time use the same component tree. One Time hides school-only modules
through `activeWorkspace.module_visibility`, not by forking stylesheets.

## Responsive Rules

Tested viewports:

- 360 x 800
- 390 x 844
- 768 x 1024
- 1440 x 900

The browser smoke checks no horizontal overflow, stable active module framing,
and interactive modal/action flows. Screenshots are saved under
`ops/parallel-runs/PARALLEL-20260619-001/workers/W2/screenshots/`.

## Accessibility

- Semantic landmarks: `header`, `aside`, `main`, `section`, `nav`-like module
  rail, table roles, and dialog role.
- Dialogs use `aria-modal` and a labeled title.
- Search has a screen-reader label.
- Buttons have visible labels or `aria-label` when the visible control is a
  count.
- Focus states are visible on navigation, workspace controls, search, and
  action buttons.
- Status feedback uses a `role="status"` toast.

## Integration Contract

The browser module exports:

- `EVENT_NAMES`
- `INTEGRATION_ENDPOINTS`
- `createInitialState`
- `visibleModuleDefinitions`
- `deriveModuleCards`
- validation helpers
- local submit/test flows
- `renderApp`
- `init`

Prompt 05 should bind real API adapters to the exported event names and view
model shapes instead of rewriting the UI components.
