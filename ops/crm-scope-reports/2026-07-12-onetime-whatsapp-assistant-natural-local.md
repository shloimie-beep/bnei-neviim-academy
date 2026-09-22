# One Time WhatsApp Assistant Natural Reply Local Report

Date: 2026-07-12
Run: `2026-07-12-onetime-crm-portal-production-correction`
Requirement: `REQ-20260712-110`
Scope: `rabbi_sheller_provider` / `one_time_mishnah_class`

This is a local no-send evidence report. It contains no production WhatsApp
payloads, phone numbers, private message bodies, class links, API tokens, or
external-provider response bodies.

## Implemented

- Deterministic One Time provider lead-bot reply templates were made warmer and
  more natural for greeting, signup, technology support, Rabbi/Torah handoff,
  schedule/current-learning unknowns, class-link denial, and unknown intent.
- The safety model remains deterministic: the bot does not charge, grant access,
  impersonate Rabbi Scheller, release class links to non-members, or choose
  external sends by itself.
- The plan now marks `guardrails.deterministic_natural_reply: true` so tests can
  distinguish deterministic natural templates from hosted/free-form replies.

## Local Verification

- `node --check src/lib/bna/provider-lead-bot.js`
- `node --test tests/service-provider-lead-bot.test.js tests/one-time-wapi-scope-contract.test.js`

## Release Evidence Still Needed

- Scoped commit/push/deploy.
- Live/readback proof that WAPI remains approval-gated and no unapproved send was
  performed.
- Optional staged webhook smoke with redacted payload and no external send unless
  the exact live-send approval gate is satisfied.
