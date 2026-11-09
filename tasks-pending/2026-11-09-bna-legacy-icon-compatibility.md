# Legacy mobile icon compatibility — 9 November 2026

Source: RAW-20261109-001. Owner: existing BNA gateway integrator. Workspace: BNA public asset gateway in `shloimie-beep/bnei-neviim-academy`. Isolated branch `codex/bna-icon-compat-20261109`, based on `c0c5b439` (application bytes match live `6c1e4261`). Root worktree and four pre-existing untracked watchdog files are preserved.

## Requirements and readiness

| ID | Result | Status | Next action / evidence |
|---|---|---|---|
| REQ-20261109-001 | Three exact legacy SVG URLs redirect without caching to current same-origin PNG icons; One Time runtime keeps its existing PNG assets. No image regeneration. | Needs verification (live) | Implemented; 10 actual-server local tests pass in both runtime modes. Live adoption depends on 002. |
| REQ-20261109-002 | Bounded pushed PR and protected production release with fresh provider, redirect, MIME and byte readback. | Needs operator decision | Prepared and locally verified; present exact pushed candidate for the accepted production release gate. No earlier approval is reused. |

Affected anonymous GET/HEAD routes only: `/icons/icon.svg` → `/icons/icon-512.png`; `/icons/icon-192.svg` → `/icons/icon-192.png`; `/icons/icon-512.svg` → `/icons/icon-512.png`. Existing One Time PNG handler remains the final brand resolver. Relative targets preserve the request origin. Temporary redirects with `Cache-Control: no-store` are reversible.

Definition of Ready: actual production `/api/deploy-info` and Railway SUCCESS deployment agree on `6c1e4261c78896e0273a4c553880343d9ecd6f25`; current three SVG URLs return the obsolete checkmark, while manifest points to existing branded PNGs. Live PNG hashes match local source; 192px BNA PNG visually inspected. Current source route, Website release clauses and Brand emblem rules were read on 9 November. New source-only Mission/Vision edits are outside this task.

Verification: actual full server with credential-stripped, no-DB local fixtures for BNA and One Time; GET/HEAD redirect status, relative Location, no-store, query and stale conditional requests; follow redirects and compare PNG MIME/bytes to each runtime's existing source files; preserve unrelated PNG, private icon and manifest routes. No inquiry, send, database connection, schema operation or external provider mutation is needed. Mobile/desktop use the same asset URL behavior; no page layout changes or physical handset verification is claimed.

Definition of Done: exact routes/bytes proven locally, narrow PR pushed, accepted production gate, provider and anonymous live reads prove the released candidate. Local tests alone do not close live adoption. Installed OS icons or previously cached responses may persist until the device refreshes them.

## Preservation and release limits

Do not solve the whole originating mobile request. Complete only the three legacy icon aliases. No manifest, service worker, PNG/SVG source bytes, copy, form, durable lead, email, owner access, archive, Fishing source or backend changes. Original full-backend goal remains paused. Do not move/resume the unrelated July execution-run pointer or create checkpoints.

Release owner: operator / accepted BNA release gate. Recommended action after PR review: release the exact prepared icon candidate to the existing BNA service, then verify anonymous icon reads. Alternative: retain a reviewed PR; old SVG requests continue serving the checkmark until deployment. Blocker applies only to REQ-20261109-002.

## Final audit

Implementation, 10 actual-server tests, source-byte comparison, preservation diff and both zero-finding watchdogs are recorded in `ops/bna-legacy-icon-compat/2026-11-09/RESULT.md`. Implementation commit `9019f0c15a8ab71da4a1911c62e682cdc16b38ad` is pushed in [PR #197](https://github.com/shloimie-beep/bnei-neviim-academy/pull/197), stacked on the existing launch branch to keep the diff narrow. GitHub reports mergeable/clean, with no configured status checks; local test evidence is not CI. This follow-up changes documentation only. Separate live adoption remains pending. Private HTTP baseline: existing owner's `.runtime/bna-icon-compat-20261109/baseline.json`, checked 2026-11-09T14:32:23.726Z. No production mutation, inquiry or email performed.

Fresh Railway source readback: repository `shloimie-beep/bnei-neviim-academy`, branch `codex/bna-interest-launch-20261105`, pin `6c1e4261c78896e0273a4c553880343d9ecd6f25`, no staged changes. Proposed release changes only source branch to `codex/bna-icon-compat-20261109` and pin to the exact reviewed PR head. Confirm that immutable head with the operator before changing production; use fresh staged/provider readback and explicit commit deployment. No shared-variable, sender, database, start/build-command, domain or other-service changes are included.
