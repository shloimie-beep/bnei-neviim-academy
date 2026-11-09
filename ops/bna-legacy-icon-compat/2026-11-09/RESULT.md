# Legacy mobile icon compatibility — prepared, locally verified

Source: RAW-20261109-001. Requirements: REQ-20261109-001 / 002. Existing BNA gateway owner; isolated branch `codex/bna-icon-compat-20261109` based on `c0c5b4391184b166943ea1c7d84e2004364c9453`. Separate from the paused full-backend work.

## Implemented

Fifteen added lines in `server.js` register three exact legacy public SVG URLs before static serving. Each returns a temporary, `no-store`, relative redirect to an existing PNG: generic/512 SVG to 512 PNG, 192 SVG to 192 PNG. The existing One Time PNG routing remains the brand resolver. Three route-registry entries document anonymous access, targets, scope and verification. No UI controls were added.

No source image, manifest, service worker, page, form, lead capture, email, schema, payment, archive, credential, runtime flag or existing One Time handler changed. The original root worktree stays at `c0c5b439` with its four pre-existing untracked watchdog files; the isolated worktree reuses existing dependencies through a local ignored junction.

## Local verification

- `node --test tests/public-legacy-icon-compat.test.cjs`: **10 passed, 0 failed, 0 skipped**, actual full-server BNA and One Time runtime fixtures. Credential-stripped child environments, fake loopback database URL and existing no-DB boot flag; only anonymous HTTP reads.
- All three aliases: GET and HEAD return 302 with exact relative Location and `Cache-Control: no-store`; query-string requests work; stale SVG ETag/Last-Modified requests return the redirect rather than 304. Following each redirect returns HTTP 200, `image/png`, and exact bytes from that runtime's existing PNG file. Direct PNG routes are unchanged.
- Existing parent/Operations SVG icons and manifest retain exact source bytes. Unknown icon request remains 404. Fixtures terminate their own child servers.
- `node scripts/watchdog-action-audit.mjs`: zero findings, 202 root actions / 87 detailed rows scanned. Generated at 2026-11-09T14:37:59.760Z.
- `node scripts/watchdog-product-quality-drift.mjs`: zero findings, 698 files scanned. Generated at 2026-11-09T14:38:00.143Z. Full generated reports remain private under the isolated worktree's ignored `.runtime/bna-icon-compat-20261109/`.
- `git diff --check` passed. No changes under `public/`, `src/`, `config/`, migrations or package/dependency files. Original BNA 192px PNG visually inspected; no new design or raster editing.

## Current production baseline, separately observed

Read at 2026-11-09T14:32:23.726Z. Railway SUCCESS `b28f5f0c-d94b-4edd-9af2-8aca98469517` and public `/api/deploy-info` agree on **`6c1e4261c78896e0273a4c553880343d9ecd6f25`**. All three old SVG URLs still return HTTP 200 `image/svg+xml`, cacheable for one day with stale-while-revalidate. They still contain the obsolete checkmark; the compatibility fix is **not live**.

Current manifest points to PNGs, which already return the BNA emblem. Fresh live PNG hashes match unchanged local source:

| Path | SHA-256 |
|---|---|
| `/icons/icon-192.png` | `f300de0406396292608d3c9d4e3626de0c216b58683958174b5d64fbcd176903` |
| `/icons/icon-512.png` | `636db9a99e9b6fd7214e6f9b9c176c2d2584ecdba842939f4cdc5417f51bb452` |

Before release, production stage readback reports no staged changes. Earlier owner-alert release approvals cover only their named pin. The new icon candidate needs the accepted protected release gate. Expected target remains existing BNA project `bd5b6d78-5e83-4e83-89b2-cd5f52ed7889`, service `4079db35-5f4a-44ef-a767-3406c74f6005`, production environment `3ce30933-49c7-4b90-8c36-a5afd67df329`; exact candidate commit/branch will be presented with the narrow PR. No production settings were changed.

After an accepted release, verify provider candidate identity and live deploy-info, then all three anonymous redirects, final PNG MIME and bytes, cache headers, HEAD and stale validators. Do not submit another inquiry or send another email for this asset change.

HTTP compatibility proof does not establish a physical handset or installed OS icon update. Previously stored browser/OS icons may require refresh. Origin chat retains the separate scrolling/loading fix.
