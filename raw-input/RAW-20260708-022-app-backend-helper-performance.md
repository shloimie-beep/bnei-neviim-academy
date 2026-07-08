# RAW-20260708-022 - App backend and helper performance

Source: Codex chat
Captured: 2026-07-08
Channel: codex_chat
Workspace/project: bna_platform / one_time_mishnah_class
Parse status: registered

## Raw Operator Input

> Another thing I don't know if you figure this out at this point but the whole app is so slow it takes so long when you're clicking around to navigate to any page it's just like ridiculously slow so I really need you to look into that as to why it's slow and just fix it also the bot when the bot thinks like thinks forever is there a way to make it faster without losing reliability or brain power for sure the website should be faster and like navigating the app and the back end to the back end is really slow but in terms of the bot you know only if there's a way to make it smart and fast but not if he really has to think

## Parsed Requirements

- `REQ-20260708-078`: Diagnose and reduce app/backend navigation latency across
  Operations and OneTime role surfaces, with measured evidence before and after
  any code fix.
- `REQ-20260708-079`: Diagnose helper/bot response latency and make the fast
  path faster where possible without reducing answer quality, reliability,
  workspace scope, or safety gates.
- `REQ-20260708-080`: Create current-state latency audit evidence first:
  route/API/helper timings, browser click timings, console/network errors, and
  first-fix recommendation.

## Guardrails

- Do not remove safety/auth/scope checks to make the app feel faster.
- Do not downgrade the helper model or skip needed reasoning merely to reduce
  wait time.
- Prefer deterministic fast paths, caching, lazy loading, and observability
  before changing AI quality.
- No external sends, payments, access grants, WAPI/WhatsApp sends, Drive/Vimeo
  uploads, or production data mutations are authorized by this performance
  report.
