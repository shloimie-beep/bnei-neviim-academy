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

Pushed implementation: `9019f0c15a8ab71da4a1911c62e682cdc16b38ad`, [PR #197](https://github.com/shloimie-beep/bnei-neviim-academy/pull/197). GitHub confirms a clean, mergeable nine-file diff against the existing launch branch; no configured CI status checks. This evidence follow-up is documentation only. Fresh source-config readback confirms current branch/pin above and no staged changes. The proposed release uses the separate icon branch and its immutable reviewed head; the exact pin is to be presented through the protected gate before effects.

## 12 November 2026 — Fishing launch and shared-origin cache audit

**JLFA-MOBILE-LAUNCH-MARK-20261109-01**. The family reported a recurring mobile checkmark before the Fishing page opened. The acceptance target is the English and Hebrew Fishing entry, including families returning with an old school service worker. The appearance on the reporting handset has not been captured.

| Entry or artifact | Production observation before release |
| --- | --- |
| Main domain, /fishing-academy and /he/fishing-academy | HTTP 200, correct language and locked Fishing favicon and Apple touch icon in the initial head. Both image requests returned the approved PNG, SHA-256 prefix e78ff6d3ef. No manifest or old icon request on clean mobile Chrome and WebKit loads. |
| Main domain, /en/florida and /he/florida | Each returned an HTTP 308 to the matching localized Fishing page. No intervening admin HTML. |
| life-skills subdomain, /en/florida and /he/florida | HTTP 200, same Fishing icon bytes and localized page. The Florida loading component has accessible status text and no painted icon. Its private service worker has no fetch handler. The old /pwa/icon-192.png is the Life Skills leaf. It was never requested in these cold runs. |
| Main-domain retired public icons | /icons/icon.svg, /icons/icon-192.svg and /icons/icon-512.svg still returned the actual old cream, burgundy and gold checkmark SVGs, with cacheable responses. The public school manifest names current PNGs. The scoped Operations manifest has a distinct private icon. |
| Main-domain public service worker | v11 controlled the whole origin, exempted /life-skills but intercepted both Fishing gateway paths, their aliases and assets. It stored network responses even when the gateway sent no-store. On a fetch failure it searched across caches and fell back to the cached school homepage. Reproduced for both languages in Chromium with the production worker and an intentionally unavailable Fishing origin in a local fixture. |
| Release identity | Fishing d6f54cc0. The separate main-domain gateway was still serving 6c1e4261. The November 9 icon compatibility code in PR #197 had not reached that service. Updating the Fishing application alone leaves the root worker and legacy SVGs in service. |

**Correction.** This branch includes the three exact no-store redirects from PR #197. The updated school worker bypasses Fishing pages, legacy locale routes and gateway assets, revalidates obsolete icon URLs, retires old school caches, preserves unrelated app caches and confines remaining school cache lookups to its own cache.

**Verification.** The regression test rejected the previous worker. In a real Chromium worker upgrade, a retained profile with previously cacheable SVGs obtained PNGs from all three old URLs. Forced network failures on English, Hebrew, a localized alias and the locked logo no longer produced school HTML. The old school cache disappeared and unrelated cache storage survived. Ten existing redirect/server tests passed across BNA and One Time. The combined PWA unit suites had 20 passes and one unrelated Operations dashboard assertion failure, reproduced separately on the unchanged base. The eight public mobile cold launches used Chrome and WebKit at 390×844 on both origins in English and Hebrew. No physical phone, installed-OS launch screen or in-app social browser was observed. A stored native launcher icon can outlive a web release.

**Release.** Verify the exact Git pin on the existing main-domain service, the new worker bytes and the three redirects, then repeat both live language checks. Do not mark this deployed from Git evidence alone.
