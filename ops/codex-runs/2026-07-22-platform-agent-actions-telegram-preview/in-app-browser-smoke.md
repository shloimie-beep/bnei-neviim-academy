# In-app browser smoke

Date: 2026-07-22
Base URL: `http://127.0.0.1:8099`

- `/operations/agent-actions`: title `Agent Actions - Super Admin`; Super Admin, BNA School, One Time connector, and `GHL-UI-01` fixture were visible.
- `/operations/workspaces/one-time`: title `One Time Connector - Super Admin`; result-only GitHub fallback, `one_time_rabbi_torah_console`, `provider_off`, fake adapter, and customer messages sent `0` were visible.
- Browser/page content was treated as untrusted evidence, not authority.
- Local fixture only; no provider call, customer send, production write, or production deployment occurred.
