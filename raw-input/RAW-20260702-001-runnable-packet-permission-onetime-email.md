# RAW-20260702-001 - Runnable Packet Permission + One Time Sender Confirmation

Source: Codex chat
Captured at: 2026-07-02T08:44:43+03:00
Scope: BNA agent protocol; Rabbi / One Time email setup

## Raw Operator Input

> Okay, so, first of all, you always have permission to run packets. Just remember that. Did you check what's missing? Uh, yeah, confirm also that info at one time is the email we're using. Um, I confirm that. Yeah, so go for it. Do, do whatever you need to do, and just tell me what other information is missing. Like, exactly what I should do.

## Parsed Durable Decisions

- Runnable packets are pre-authorized by default when they are within the current packet scope and do not require a separate money, access, privacy, legal, DNS, external-account, or live-provider-write decision.
- If a packet is runnable and unblocked, Codex should run it instead of stopping at packet creation.
- If a packet cannot run, Codex must report the exact blocker, owner, and next action.
- `info@onetimeonetime.com` is confirmed as the One Time / Rabbi Sheller sender and reply-to address.

## Safety Boundary

This standing permission does not authorize unsafe or live external actions by itself. Live campaign sends, payments, refunds, access grants/revocations, DNS/provider mutations, GHL/LeadConnector runtime, production data hard deletes, and privacy-sensitive exports still require an exact packet with approval, evidence, and rollback/readback policy.
