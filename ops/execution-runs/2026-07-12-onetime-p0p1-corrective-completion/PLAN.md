# Plan

1. `REQ-20260712-001` through `REQ-20260712-004` are locally verified.
2. Finish urgent addendum `REQ-20260712-013` through `REQ-20260712-015`:
   canonical direct `/one-time/signup`, structured city/timezone/consent
   capture, and atomic CRM/outbox storage.
3. Finish `REQ-20260712-016` through `REQ-20260712-020`: immediate
   confirmation email, dedicated reminder dispatcher, WhatsApp gates, Rabbi
   Telegram alert, and no-portal/no-payment/no-access negative tests.
4. Finish `REQ-20260712-021`: exact-three local-class preview and activation
   gate, without activating the segment before the operator personal test.
5. Finish `REQ-20260712-023`: required signup/reminder test matrix,
   screenshots, no-send proof, CI, watchdogs, and run/PR evidence.
6. Resume older open work `REQ-20260712-005` through `REQ-20260712-010` only
   after the urgent signup/reminder slice is implemented or precisely blocked.
7. Keep `REQ-20260712-011` and `REQ-20260712-022` blocked until explicit
   release authorization and the operator's personal deployed test.

Do not deploy, send, charge, import, grant access, mutate DNS/accounts, or
write external providers during local implementation.
