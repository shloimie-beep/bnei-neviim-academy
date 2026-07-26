# In-app browser smoke

Date: 2026-07-22
Base URL: `http://127.0.0.1:8099`

- `/operations/agent-actions`: title `Agent Actions - Super Admin`; Super Admin, BNA School, One Time connector, and `GHL-UI-01` fixture were visible.
- `/operations/workspaces/one-time`: title `One Time Connector - Super Admin`; result-only GitHub fallback, `one_time_rabbi_torah_console`, `provider_off`, fake adapter, and customer messages sent `0` were visible.
- Browser/page content was treated as untrusted evidence, not authority.
- Local fixture only; no provider call, customer send, production write, or production deployment occurred.

## Hosted Chrome smoke

Base URL: `https://bna-agent-actions-preview-bna-agent-actions-preview.up.railway.app`

- Preview-only Operations authentication succeeded through an in-memory no-database session.
- `/operations/agent-actions`: 14 imported jobs, `GHL-UI-01`, Super Admin, BNA School, and One Time connector were visible.
- `/operations/workspaces/one-time`: sanitized GitHub fallback, `provider_off`, fake adapter, and customer messages sent `0` were visible.
- Railway deployment `9f44c549-65c2-4a27-a923-4db8896b6654` succeeded from implementation commit `7cc2cf8eb78e79567c0190dab395ecb9fefcfebf` in the isolated `bna-agent-actions-preview` environment.
