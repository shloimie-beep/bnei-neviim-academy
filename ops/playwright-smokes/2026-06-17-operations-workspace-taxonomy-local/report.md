# Operations Workspace Taxonomy Local Browser Smoke - 2026-06-17T09:39:34+03:00

- Target: `http://127.0.0.1:18125/operations?workspace=platform&view=admin&section=workspaces`
- Tooling: Codex in-app Browser against a temporary local `node server.js` process.
- Result: PASS.

## Checks

- Logged into the local Operations shell and reached `/operations?workspace=platform&view=admin&section=workspaces`.
- Confirmed the workspace type selector shows: `All`, `Super Admin`, `School`, `Service Provider`, `Family`.
- Confirmed workspace options are deduped by key in the selector sample:
  - `All Operations`
  - `BNA`
  - `One Time Mishnah Class`
  - `Dratler Family`
  - `Family Directory`
- Confirmed the selector exposes `Workspace type` and `Specific workspace` steps.
- Confirmed the rendered Operations shell did not expose `Family App / Home Accountability` or `Family Accountability`.
- Temporary local server was stopped after verification.
