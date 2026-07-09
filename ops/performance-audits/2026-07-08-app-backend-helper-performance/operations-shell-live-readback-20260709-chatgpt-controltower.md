# Operations Shell Live Readback - 2026-07-09

Purpose: answer the operator's slow-load question with a direct live readback
of the authenticated Operations shell served by BNA and OneTime production.

No secrets, cookies, private records, external writes, deploys, sends, payments,
access grants, DNS/account mutations, or production data mutations were
performed. The check logged in with existing Operations credentials and fetched
HTML only.

## Result

| Domain | Login | Route | HTML bytes | Split shell assets present | Inline legacy markers present | Conclusion |
|---|---:|---:|---:|---:|---:|---|
| `https://bneineviimacademy.org` | 200 | 200 | 2,316,039 | no | yes | BNA live is serving the older heavy inline Operations shell. |
| `https://join.onetimeonetime.com` | 200 | 200 | 1,688 | yes | no | OneTime live is serving the split bootstrap shell. |

## Marker Readback

### BNA

- `hasOperationsShellScript`: false
- `hasOperationsShellCss`: false
- `hasInlineApiClientMarker`: true
- `hasRenderDashboard`: true
- `cache-control`: `private, no-cache, max-age=0, must-revalidate`

### OneTime

- `hasOperationsShellScript`: true
- `hasOperationsShellCss`: true
- `hasInlineApiClientMarker`: false
- `hasRenderDashboard`: false
- `cache-control`: `private, no-cache, max-age=0, must-revalidate`

## Interpretation

The local repo already routes `/operations` through
`public/operations-bootstrap.html` in `server.js`. OneTime production confirms
that the split shell works live. BNA production does not currently serve that
split shell, which explains the slower first load without proving a database
capacity problem.

Recommended next fix: deploy the current split Operations shell to the BNA
Railway service only after the release guards show a clean scoped BNA deploy
lane. Do not upgrade the database as the first response unless a later profile
shows database query time, connection saturation, or server CPU as the actual
bottleneck.
