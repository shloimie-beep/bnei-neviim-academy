# RAW-20260706-966 - One Time Vimeo and Stripe scoping correction

- raw_id: `RAW-20260706-966`
- source_channel: `codex_chat`
- parse_status: `parsed`
- created_at: `2026-07-06T16:47:00+03:00`
- workspace_key: `rabbi_sheller_provider`
- project_key: `one_time_mishnah_class`
- privacy: `no_secret_values`

## Raw Source

> Just make sure they're scoped specifically to the one-time Rabbi Scheller, you know, Mishnah class. That's the place that they need to go to.

## Parsed Lanes

- `MEM-20260706-966`: Vimeo and Stripe setup discussed in
  `RAW-20260706-965` must be scoped to Rabbi Scheller / One Time Mishnah class:
  `workspace_key=rabbi_sheller_provider`,
  `project_key=one_time_mishnah_class`.
- The setup must not be treated as global BNA, generic Stripe, generic Vimeo,
  another service provider, or BNA Academy classroom/video/billing setup.
- This message does not approve any credential copy, provider write, video
  upload, billing action, checkout, live payment, access grant, send, or deploy.
