# BNA Operations UI Audit Harness

This harness performs a production-safe, read-only Playwright audit of the
authenticated BNA Operations frontend. It is for audit evidence only. It does
not redesign the UI, change product data, send messages, publish content,
charge payments, sync integrations, or deploy.

## Canonical Operations Frontend

The production Operations app is served by Express:

- `GET /operations` in `server.js`
- protected by `requireAdmin`
- serving `public/operations.html`
- login shell: `public/operations-login.html`

This checkout has no active `src/app/operations/` or `src/app/api/bna/`
directory. Those paths should not be treated as the current Operations UI.

## One-Time Login

Run:

```bash
npm run ops:audit:auth
```

A headed Chromium browser opens at the configured Operations URL. Log in
manually in the browser. Do not paste or type the password into the terminal.
When the authenticated Operations shell is visible, return to the terminal and
press Enter.

The storage state is saved locally to:

```text
.runtime/auth/operations-storage-state.json
```

That file is gitignored and must not be shared.

## Run The Audit

Run:

```bash
npm run ops:audit
```

For a headed run:

```bash
npm run ops:audit:headed
```

If the saved session is expired, the command exits cleanly and asks you to run
`npm run ops:audit:auth` again.

## Output

Each run creates:

```text
ops/ui-audits/runs/YYYY-MM-DD-HHmmss-operations-ui/
```

Important files:

- `AUDIT.md`
- `EXECUTIVE-SUMMARY.md`
- `SCREENSHOT-INDEX.md`
- `GALLERY.html`
- `route-map.json`
- `state-map.json`
- `issues.json`
- `links.json`
- `controls.json`
- `console-errors.json`
- `network-errors.json`
- `accessibility.json`
- `run-metadata.json`
- `screenshots/`
- `contact-sheets/`
- `agent-review-package.zip`

The latest run pointer is written to:

```text
ops/ui-audits/latest.json
```

Generated screenshots, contact sheets, ZIPs, latest pointers, and auth state
are gitignored by default.

## Privacy Safeguards

Default privacy mode is:

```text
OPS_AUDIT_PRIVACY_MODE=redact
```

The harness masks inputs, textareas, access-code/token-looking text, emails,
phones, long identifiers, and known private containers for student, parent,
family, provider-contact, message, payment, and transcript details. Raw
screenshots are never written before redaction.

Automated redaction is best-effort. Review `GALLERY.html`, contact sheets, and
the ZIP before sharing outside the operator/Codex/Agent Mode workflow.

## Upload To ChatGPT Agent Mode

Upload:

```text
agent-review-package.zip
```

The ZIP includes reports, JSON artifacts, gallery, redacted screenshots, and
contact sheets. It excludes storage state, cookies, tokens, environment files,
raw screenshots, and secret-like filenames.

To rebuild the ZIP for an existing run:

```bash
npm run ops:audit -- package ops/ui-audits/runs/YYYY-MM-DD-HHmmss-operations-ui
```

## Configuration

All settings have safe defaults:

```text
OPS_AUDIT_BASE_URL=https://bneineviimacademy.org
OPS_AUDIT_START_PATH=/operations
OPS_AUDIT_STORAGE_STATE=.runtime/auth/operations-storage-state.json
OPS_AUDIT_OUTPUT_ROOT=ops/ui-audits/runs
OPS_AUDIT_PRIVACY_MODE=redact
OPS_AUDIT_MAX_STATES=250
OPS_AUDIT_MAX_ACTIONS_PER_STATE=80
OPS_AUDIT_HEADLESS=true
OPS_AUDIT_TIMEOUT_MS=30000
```

## Safe Interaction Policy

The crawler allows read-only actions such as internal Operations navigation,
tabs, filters, sorting, menus, drawers, and detail views. It skips controls
whose label, accessible name, title, data attributes, form context, or endpoint
suggests mutation or external effects.

Examples of blocked concepts:

```text
send, publish, approve, delete, save, submit, create, invite, charge, sync,
reprocess, deploy, confirm, reset, whatsapp, email, upload, edit, merge
```

Unexpected first-party `POST`, `PUT`, `PATCH`, and `DELETE` requests are
blocked and recorded.

## Troubleshooting

- Expired session: rerun `npm run ops:audit:auth`.
- Browser missing: run `npx playwright install chromium`.
- Need to inspect without credentials: run `npm run ops:audit -- smoke-login`
  to verify an unauthenticated browser reaches the Operations login page.
- Audit too large: lower `OPS_AUDIT_MAX_STATES` or
  `OPS_AUDIT_MAX_ACTIONS_PER_STATE`.

## Known Limitations

- Screenshots cannot prove backend authorization by themselves.
- Some client-side states that do not change URL may not be perfectly
  restorable after a page reload.
- Accessibility checks use built-in lightweight checks unless
  `@axe-core/playwright` is installed.
- Reports are evidence for human review, not automatic product fixes.

## Rerun After UI Fixes

1. Deploy or run the target environment you want to inspect.
2. Refresh auth with `npm run ops:audit:auth` if needed.
3. Run `npm run ops:audit`.
4. Compare `issues.json`, `route-map.json`, and contact sheets between runs.
