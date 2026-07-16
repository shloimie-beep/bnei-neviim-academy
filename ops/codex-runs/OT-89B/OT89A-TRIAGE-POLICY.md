# OT89 Safe Triage Policy

## 1. Purpose and trust model

This policy governs the BNA handling of signed One Time subscriber support events. A valid signature proves service origin and transport integrity; it does not make subscriber text or attachments safe. All ticket content remains untrusted data.

The permitted pipeline is:

1. authenticate the service request and verify the signed active-entitlement assertion;
2. redact and normalize ticket evidence into a typed triage input;
3. classify into one of five controlled classes with a bounded reason and confidence;
4. assign severity, SLA, and an existing BNA owner or queue;
5. create a `BUG_CANDIDATE` only when the reproducibility gate passes;
6. run only allowlisted read-only diagnostics in an isolated sandbox;
7. send concise operator options through the existing BNA decision protocol when judgment is needed.

Raw user text must never be interpolated into a shell command, command-line argument, SQL string, regular-expression command, repository search command, Codex prompt, migration, Telegram callback, URL, or file path.

## 2. Typed triage input

The triage worker receives a typed object produced in-process after contract validation and redaction. The allowed fields are:

- opaque `bna_ticket_ref`, `source_ticket_id`, account reference, event ID, and correlation ID;
- normalized category, title, message, reproduction steps, expected behavior, actual behavior, occurrence, first-observed time, normalized error code, provider enum, route template, app release, locale, and timezone;
- attachment metadata only: BNA attachment ID, media type, byte size, hash, normalization type, and transfer state;
- system-derived signals: duplicate status, affected-account count, known-incident match, class start proximity, and service health state.

The classifier output is a closed object:

```json
{
  "classification": "REPRODUCIBLE_BUG",
  "confidence": 0.91,
  "reason": "Repeatable failure with complete steps, expected result, actual result, and a stable error code.",
  "severity": "SEV2",
  "requires_operator_decision": false,
  "recommended_queue": "existing-product-support-queue"
}
```

`classification` is exactly one of `REPRODUCIBLE_BUG`, `ACCESS_PROVIDER_INCIDENT`, `FEATURE_REQUEST`, `COMPLAINT`, or `AMBIGUOUS`. Confidence is a number from `0.00` through `1.00`. Reason is sanitized plain text of at most 400 characters and must not repeat secrets, contact details, or long excerpts from the ticket. `recommended_queue` must resolve to an existing BNA queue or operator; OT89 must not invent a user account.

## 3. Normalization and redaction

Apply the following operations before classification, logging, alerting, or diagnostics:

1. Decode as UTF-8, normalize Unicode to NFKC, normalize line endings to LF, remove NUL, remove bidirectional override characters, and remove control characters other than tab and LF.
2. Enforce the field limits in `SUPPORT-EVENT-CONTRACT.json` after normalization. Reject rather than truncate any field whose pre-contract form exceeds its accepted limit.
3. Replace credentials and secrets with typed markers: passwords, one-time codes, cookies, session IDs, bearer tokens, JWTs, API keys, private keys, webhook secrets, connection strings, and payment authentication values become `[REDACTED_SECRET]`.
4. Replace direct contact and high-risk personal data with typed markers because BNA can reach the account through an opaque account reference: email addresses become `[REDACTED_EMAIL]`; phone numbers become `[REDACTED_PHONE]`; payment-card and bank identifiers become `[REDACTED_FINANCIAL]`; street addresses and government identifiers become `[REDACTED_PERSONAL]`.
5. Keep only a normalized route template. Remove schemes, hosts, query strings, fragments, user IDs, email addresses, and arbitrary URLs.
6. Normalize an error code only when it matches the contract's closed character set. Otherwise set it to null and preserve a redacted explanation in the message.
7. Sanitize filenames to a basename, remove path separators and controls, cap at 100 characters, force the extension to match the normalized media type, and never reuse the filename as a storage path.
8. Log counts and field names that were redacted, not the removed values.

Prompt-injection or command-like text remains ordinary inert content after normalization. Phrases such as “ignore instructions,” shell metacharacters, SQL syntax, Markdown code blocks, and repository paths do not gain execution privileges and must be covered by rejection tests.

## 4. Classification rules

### `REPRODUCIBLE_BUG`

Assign only when all of the following are true:

- the report describes behavior contrary to an existing product behavior rather than requesting a new behavior;
- there are at least two concrete reproduction steps;
- expected behavior and actual behavior are both present;
- occurrence is `always` or `intermittent`;
- the affected route template or provider is known;
- there is no stronger match to a provider incident;
- classifier confidence is at least `0.85`.

A high-confidence result may create one idempotent `BUG_CANDIDATE` linked to the ticket. It is not a confirmed defect, issue, code task, or authorization to change code.

### `ACCESS_PROVIDER_INCIDENT`

Assign when the primary failure is authentication, entitlement visibility, Zoom/class access, payments, or another external/provider boundary. Known provider health or multi-account correlation increases confidence. The triage worker may link an existing incident but must not create a public status statement or contact the provider without existing authorization.

### `FEATURE_REQUEST`

Assign when the requested outcome is a new capability, behavior, integration, policy, or protocol rather than a failure of documented behavior. Feature and protocol requests remain `pending_operator` and require a concise decision.

### `COMPLAINT`

Assign when dissatisfaction, service quality, billing treatment, communication, or conduct is the primary concern and a reproducible software failure is not the main issue. Complaints require human ownership and must not be auto-closed.

### `AMBIGUOUS`

Assign when evidence is incomplete, classifications conflict, confidence is below the applicable threshold, or the report cannot be safely distinguished. Ambiguous items remain `pending_operator` or `waiting_customer` after an authorized decision.

## 5. Severity and SLA

BNA computes severity; a subscriber cannot select it. Existing BNA policy takes precedence when it is stricter. Otherwise OT89 uses this default:

| Severity | Criteria | Owner assignment target | Initial subscriber-visible response target | Update target |
|---|---|---:|---:|---:|
| `SEV0` | Active security incident, confirmed data loss/corruption, or all active subscribers unable to use a paid critical path | 15 minutes | 30 minutes | Every 30 minutes while active |
| `SEV1` | Multiple subscribers blocked; an active subscriber blocked from a paid live class starting within 4 hours; or major authentication/payment/provider degradation | 30 minutes | 1 hour | Every 2 hours while active |
| `SEV2` | Single-account access failure, reproducible product bug without broad outage, billing/content issue, or complaint requiring investigation | 4 business hours | 1 business day | Each business day while active |
| `SEV3` | Feature request, low-impact issue, informational request, or other non-urgent item | 1 business day | 2 business days | On material state change |

For this policy, business hours are Sunday through Thursday, 09:00–18:00 in `Asia/Jerusalem`, excluding holidays already configured in BNA. SLA clocks pause only in an explicit `waiting_customer` state. Alert transport failure, internal assignment delay, and BNA worker backlog do not pause the clock.

## 6. Ownership and state

The allowed ticket states are:

`new` → `triage` → `pending_operator` or `in_progress` → `waiting_customer`, `resolved`, or `rejected` → `closed`.

Rules:

- ingestion creates `new` plus immutable history;
- triage writes classification, confidence, reason, severity, SLA deadlines, and an existing queue/owner, then moves to `triage` or `pending_operator`;
- `waiting_customer` requires an authorized operator decision and a subscriber-visible request for information through an existing reply channel;
- `resolved`, `rejected`, and `closed` require an authorized BNA transition with a sanitized public summary;
- every state change increments `status_version`, appends history, and updates the One Time status projection asynchronously;
- Telegram message state never substitutes for BNA state.

## 7. Read-only diagnostic lane

Only an idempotent `BUG_CANDIDATE` with classification confidence at least `0.85` may enter the diagnostic lane. The sandbox is disposable, has read-only source and log access, has no production write credentials, has bounded egress, and receives typed parameters rather than raw text.

Allowed operations are exactly:

| Operation code | Typed parameters | Hard limits | Permitted result |
|---|---|---|---|
| `READ_BUILD_METADATA` | environment enum, app release, source commit | One environment and one release | Version, commit, build time, deployment state |
| `READ_HEALTH_STATUS` | service enum from existing registry | Five endpoints, 10-second timeout each | Status code, latency, sanitized health fields |
| `QUERY_STRUCTURED_LOGS_BY_CORRELATION_ID` | correlation ID, environment, start and end timestamps | Two-hour window, 500 records, structured query API only | Redacted structured events; no arbitrary grep |
| `READ_FEATURE_FLAG_STATE` | allowlisted flag key, environment | Ten keys | Flag state and config version; never secret values |
| `READ_PROVIDER_STATUS_CACHE` | provider enum, time window | Twenty-four-hour window | Existing cached provider incident data |
| `RUN_EXISTING_READ_ONLY_TEST` | test ID from a committed allowlist, source commit | One isolated run, no package installation, no external mutation | Exit status and sanitized test output |

Forbidden operations include arbitrary shell, free-form SQL, package installation, repository modification, branch creation, issue creation, deployment, feature-flag mutation, production database write, secret retrieval, network scanning, and passing ticket text to Codex or a CLI.

Diagnostic output is sanitized, size-capped, stored as BNA evidence, and linked to the ticket history. A diagnostic result may increase or decrease confidence but cannot authorize a code change.

## 8. Operator decisions

When judgment is required, the Academy bot provides two or three semantic options mapped onto the existing BNA decision protocol. It must not create a parallel callback or approval framework.

- Bug candidate: `Authorize read-only diagnostics`, `Request more information`, `Mark not reproducible`.
- Access/provider incident: `Assign access investigation`, `Link or open provider incident`, `Request more information`.
- Feature request or protocol change: `Accept to existing backlog`, `Request clarification`, `Close with explanation`.
- Complaint: `Assign human response`, `Request clarification`, `Close after documented response`.
- Ambiguous: `Request more information`, `Assign manual triage`, `Close with explanation`.

Only options valid for the current BNA state and the configured Shloimie identity are shown. Every decision uses an expiring opaque token, an idempotency key, and an immutable history row.

## 9. Approval gates

Read-only diagnostics do not authorize remediation. Code changes, dependency changes, migrations beyond the OT89 implementation, protocol changes, production configuration changes, deployments, destructive actions, customer-wide notifications, refunds, and provider contact require the existing approval policy. OT89 must not invent a low-risk auto-fix lane. It may reuse one only when the repository already documents it and the run record cites the exact policy and tests its boundaries.

## 10. Audit and privacy

Audit records include opaque identifiers, actor/service identity, action code, prior and new state, policy version, timestamps, result, and redaction counts. They exclude secrets, raw signing headers, raw attachments, direct contact details, and unbounded user text. Security rejection logs are rate-limited and use body digests rather than bodies.
