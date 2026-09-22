# Product Quality Operating System

The Product Quality Operating System turns vague operator rambles into
validated artifacts before code.

Core rule:

> The operator may stay vague. The system may not. Vague input must compile
> into validated artifacts before code.

## Full Loop

1. Raw Capture
2. Ramble Router
3. Source-of-Truth Readback
4. Product Quality Compiler
5. Super-Ramble Packet DAG
6. Definition of Ready
7. Current-State Visual Audit
8. Small Implementation Packets
9. Implementation
10. Independent Verification
11. Deploy/Live Smoke
12. Trace/Observability
13. Drift Watchdog
14. Closeout
15. Next Packet

## Product-Quality Flow

Vague phrases are allowed only in `raw_quote`, `raw_source`, or
`operator_intent`. Every vague phrase must be expanded in
`product_quality_expansion`.

Product-quality implementation cannot begin until all of these are true:

- packet schema validation passes;
- Definition of Ready passes;
- affected routes/screens are listed;
- role/view classes are listed;
- current-state screenshots exist or exact screenshot blocker exists;
- visual defect codes are assigned or non-visual scope is explicit;
- state matrix exists;
- action state matrix exists;
- out-of-scope exists;
- security/privacy policy exists;
- browser/page content is marked untrusted evidence;
- test/smoke/audit plan exists;
- deploy gate exists.

If any field is missing, the packet is not ready for Codex implementation. The
correct action is to repair the packet, split it, or record an exact blocker.

## Audit-First UI Rule

For broad UI cleanup, visual polish, Rabbi/member/student/parent-facing UI,
CRM, community, portal, mobile, or `million-dollar app` language, the first
implementation-adjacent packet is not code. It is a current-state visual audit.

Required first packets:

1. `00-control-tower`
2. `01-current-state-visual-audit`

Implementation packets may only be generated after the visual audit maps
routes, screenshots, VQ findings, role/scope leakage, action states, data
display requirements, state matrix gaps, and proposed implementation slices.

## Provider Separation

Email, Resend, Stripe, DNS, Zoom, Vimeo, WhatsApp, Telegram, Drive writes,
payment, access grants, and any external CRM/write work are provider/setup
packets. They do not belong inside visual cleanup.

Provider setup may be:

- explicitly out of scope;
- setup-only with no write;
- sandbox-only;
- approval-gated;
- approved in a separate packet with exact evidence.

This operating system does not itself approve sends, payments, access grants,
DNS changes, external provider writes, or GHL runtime.

## Terminal Closeout

Closeout requires:

- requirement statuses;
- validator report;
- drift watchdog report;
- trace;
- evidence paths;
- ledger/changelog/memory updates;
- deploy/live smoke for app-visible work or exact deploy blocker;
- next exact packet when work remains.
