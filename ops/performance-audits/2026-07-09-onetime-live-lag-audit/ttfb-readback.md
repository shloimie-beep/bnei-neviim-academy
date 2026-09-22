# OneTime Live TTFB Readback

Generated: 2026-07-09T21:50:00+03:00
Base URL: https://join.onetimeonetime.com
External write performed: false
Production data mutation performed: false

## Route Timing Sample

Direct `curl.exe` timing showed multi-second first-byte responses on the same
live surfaces sampled by the Playwright lag audit.

| Path | Status | TTFB | Total | Bytes |
|---|---:|---:|---:|---:|
| `/one-time` | 301 | 3.334s | 3.334s | 158 |
| `/one-time/mishnayos` | 200 | 4.801s | 4.992s | 32476 |
| `/rabbi-member` | 200 | 2.798s | 3.741s | 12312 |
| `/member-library` | 200 | 3.829s | 3.829s | 37574 |
| `/one-time-classroom` | 200 | 2.814s | 3.046s | 55456 |
| `/provider.html?review=one-time` | 200 | 10.062s | 17.367s | 187917 |
| `/student.html?review=one-time` | 200 | 4.868s | 10.083s | 217103 |
| `/parent.html?review=one-time` | 200 | 4.835s | 14.340s | 283845 |

## Asset Timing Sample

Static app assets also showed slow and variable first-byte timing, so the
runtime path should be inspected before blaming only page-specific JavaScript.

| Path | Status | TTFB | Total | Bytes |
|---|---:|---:|---:|---:|
| `/js/bna-bot-widget.js` | 200 | 8.367s | 12.498s | 74611 |
| `/js/bna-helper-knowledge.js` | 200 | 5.524s | 5.694s | 25321 |
| `/js/app-select.js` | 200 | 4.082s | 5.003s | 19463 |
| `/js/rabbi-member.js` | 200 | 3.563s | 5.501s | 14963 |
| `/css/one-time-shared-review.css` | 200 | 4.196s | 6.324s | 34797 |
| `/images/one-time/brand/onetimelogo.webp` | 200 | 1.047s | 2.045s | 27472 |

## API And Repeat Sample

Small endpoints and repeated requests were variable. One config request reset
after 64.513s, while later config requests completed near 2.1s to 2.45s.

| Path | Result |
|---|---|
| `/api/health` one-shot | 200, TTFB 4.260s, total 4.260s |
| `/api/one-time/instance-config` one-shot | 200, TTFB 7.799s, total 7.799s |
| `/api/member-library` one-shot | 401, TTFB 2.102s, total 2.102s |
| `/api/one-time-classroom?review=one-time` one-shot | 200, TTFB 0.938s, total 0.939s |
| `/api/health` repeat | 6.177s, 16.013s, 2.940s TTFB |
| `/api/one-time/instance-config` repeat | run 1 reset after 64.513s; runs 2-3 were 2.096s and 2.450s TTFB |
| `/js/bna-bot-widget.js` repeat | 1.243s, 1.933s, 14.946s TTFB |
| `/one-time/` repeat | 2.409s, 0.708s, 2.610s TTFB |

## Header Readback

- `/one-time` returns `301` with `location: /one-time/`.
- `/one-time/`, `/rabbi-member`, and `/provider.html?review=one-time`
  return `Cache-Control: no-store` for HTML.
- `/images/one-time/brand/onetimelogo.webp` returns
  `Cache-Control: public, max-age=0`.
- The sampled deployment responses came through `server: railway-hikari` and
  `x-railway-edge: ams1`.

## Interpretation

- The lag complaint is not explained by DOM weight alone. The Playwright audit
  found low long-task totals, no console errors, no failed requests, and
  modest DOM sizes.
- The slowest symptom is first-byte and initial document delivery. It appears
  on HTML, small APIs, and static JS/CSS assets.
- First fix target: runtime/hosting response variability and cache/static
  delivery policy. UI polish should continue as a separate visual packet after
  active app-visible lanes clear.

## Guardrails

- Read-only `GET`/`HEAD` requests only.
- No forms submitted.
- No private Operations session, helper action, external send, payment,
  checkout, access grant, DNS, Drive, Vimeo, Zoom, provider-account,
  credential, or production-data mutation.
