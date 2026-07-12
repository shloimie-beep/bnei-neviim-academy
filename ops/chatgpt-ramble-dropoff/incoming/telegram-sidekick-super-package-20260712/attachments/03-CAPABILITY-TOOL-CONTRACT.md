# 03 — Capability, Routing, And Tool Contract

## Canonical capability record

Every assistant-accessible behavior is one versioned record validated by `contracts/capability.schema.json`.

```json
{
  "capability_id": "app.questions.list",
  "version": 1,
  "kind": "query",
  "title": "List questions",
  "description": "List actor-visible questions in a scoped date range.",
  "domains": ["questions"],
  "aliases": {
    "typed_action_ids": [],
    "helper_tools": [],
    "ui_action_ids": [],
    "route_keys": []
  },
  "intent_examples": {"en": [], "he": []},
  "negative_examples": {"en": [], "he": []},
  "input_schema": {},
  "output_schema": {},
  "effect": {
    "class": "read_only",
    "reversibility": "none_needed",
    "preview": "none",
    "approval": "none"
  },
  "authorization": {
    "roles": ["super_admin", "provider_owner", "provider_admin"],
    "scope_modes": ["all", "workspace", "project"],
    "workspaces": ["*"],
    "projects": ["*"],
    "channels": ["telegram", "operations_helper", "provider_portal_assistant"],
    "data_classes": ["internal", "confidential"],
    "public_allowed": false
  },
  "connector": {
    "name": null,
    "required": false,
    "readiness_probe": null,
    "unavailable_behavior": "not_applicable"
  },
  "execution": {
    "handler": "questions.list",
    "timeout_ms": 15000,
    "idempotent": true,
    "idempotency_scope": "actor+capability+normalized_args",
    "transactional": false
  },
  "presentation": {
    "telegram_renderer": "question_list",
    "deep_link_route_key": null
  },
  "audit_event": "assistant_questions_read",
  "tests": {
    "contract": "tests/assistant-question-query.test.js",
    "routing_corpus_key": "app.questions.list"
  }
}
```

Effect, authorization, and execution properties are explicit. Release code must never infer them from a name or regular expression.

## Capability kinds

| Kind | Meaning | Execution |
|---|---|---|
| `answer` | Model explanation from already permitted context | No domain handler |
| `query` | Fresh app/source-of-truth read | Scoped read handler |
| `navigation` | Secure same-origin deep link | Route resolver, no browser clicking |
| `draft` | Versioned proposed content/change | Draft store, no external effect |
| `command` | Typed internal or external action | Action runner plus gates |
| `external_tool` | Public web or configured connector | Connector adapter plus egress/readiness policy |

UI-only controls such as closing a modal or moving a local carousel are classified `channel_local` and intentionally excluded from business parity. Disabled controls and blocked external setup states remain visible in the generated report but are not falsely advertised as executable.

## Turn plan contract

The structured planner proposes:

```json
{
  "plan_id": "plan_...",
  "request_id": "req_...",
  "mode": "read",
  "planner_version": "sidekick-v2.1",
  "resolved_scope": {
    "workspace_keys": ["bna"],
    "project_keys": ["bna"],
    "source": "profile_default",
    "timezone": "Asia/Jerusalem"
  },
  "resolved_time_range": {
    "from": "2026-06-28T21:00:00.000Z",
    "to": "2026-07-12T20:59:59.999Z",
    "timezone": "Asia/Jerusalem",
    "interpretation": "rolling_14_calendar_days_inclusive",
    "original_text": "last two weeks"
  },
  "intent": {"summary": "List recent questions", "confidence": 0.99},
  "calls": [{
    "call_id": "call_...",
    "capability_id": "app.questions.list",
    "args": {},
    "resource_refs": [],
    "effect_class": "read_only",
    "preview_required": false,
    "approval_required": false,
    "idempotency_key": "...",
    "status": "planned"
  }],
  "clarification_questions": [],
  "response_language": "en"
}
```

The planner sees only capabilities already filtered for the immutable `ScopeContext`. Its output is schema-validated; unknown IDs, extra properties, unsafe args, conflicting scope, and mismatched effect classes fail. Permissions are checked again in the handler.

An unmatched or ambiguous turn returns clarification/no match. Remove the current unconditional Helper fallback that creates a task.

## Result contract

Every call returns a `CapabilityResult`:

```json
{
  "call_id": "call_...",
  "capability_id": "app.questions.list",
  "status": "succeeded",
  "executed": true,
  "dry_run": false,
  "scope": {"workspace_keys": ["bna"], "project_keys": ["bna"]},
  "data": {},
  "pagination": {"next_cursor": null, "total_returned": 12},
  "provenance": [],
  "citations": [],
  "preview": null,
  "approval": null,
  "audit_event_id": "audit_...",
  "idempotency_key": "...",
  "warnings": [],
  "connector_status": null,
  "undo": {"available": false, "capability_id": null, "expires_at": null}
}
```

The response composer may say an action succeeded only when `executed=true` and an audit/result identifier exists. For a read it states exact scope/date/source counts.

## Effect and approval policy

| Effect class | Default behavior |
|---|---|
| `read_only`, `navigation` | Execute automatically when permitted |
| `draft_only` | Execute automatically into draft storage; send APIs physically unavailable |
| `internal_write` | Execute only for an unambiguous imperative and idempotent reversible handler; otherwise clarify/preview |
| `sensitive_internal_write` | Required preview plus one-tap approval |
| `external_write` | Required destination/audience/content preview plus one-tap approval |
| `financial`, `access_grant`, `destructive`, `deployment` | Required preview plus short-lived authenticated web step-up; normally not Telegram-enabled |

Approval binds approver identity, bot/channel instance, private chat, conversation, call, capability, normalized-input hash, scope hash, preview hash, destination/recipient hash, nonce, and expiry. Any changed input/scope/recipient invalidates it. Callback approval uses a one-use compare-and-swap. Expired, reused, cross-user, cross-chat, cross-bot, generic “yes,” and callback races fail.

## Manifest compiler and CI parity

The generator imports executable capability definitions, validates contracts, and ingests:

- `src/lib/actions/registry.js` (typed app actions);
- Helper tool definitions as compatibility aliases/candidates;
- `ops/action-registry.json` (visible controls);
- `ops/route-registry.json` (canonical destinations);
- HTML/JS hooks such as `data-action-id`, `data-watchdog-action`, `data-helper-action`, and the new `data-capability-id`.

It emits only generated artifacts:

```text
ops/assistant-capabilities/manifest.json
ops/assistant-capabilities/ui-action-map.json
ops/assistant-capabilities/route-map.json
ops/assistant-capabilities/profile-manifests/*.json
ops/assistant-capabilities/parity-report.json
ops/assistant-capabilities/parity-report.md
```

CI fails on:

- duplicate/orphan IDs;
- missing handler, strict schema, effect policy, audit event, renderer, or tests;
- mutation lacking idempotency;
- unsafe approval policy;
- enabled control lacking a capability/deep-link or explicit exclusion with reason;
- private route lacking navigation capability or `api_only` classification;
- stale generated source hash;
- missing English/Hebrew corpus;
- unavailable connector advertised as executable;
- profile scope invariant violation.

Parity denominators are separate: `business_semantic`, `secure_deep_link`, `channel_local`, `disabled`, and `external_blocked`. Coverage means routable and executable/readable in tests, not merely “has an example.”

## Natural-language routing

The pipeline is:

1. identity/profile;
2. conversation object references;
3. deterministic workspace/time resolution;
4. retrieve relevant allowed capabilities;
5. structured model plan;
6. strict validation;
7. permission/effect policy;
8. execute reads/drafts or create preview;
9. approved handler execution;
10. audit/result rendering.

Require at least two English and two Hebrew positives plus two near-neighbor negatives for every business capability. Disambiguation must cover list-versus-submit questions, list-versus-create calendar event, draft-versus-send email, contact history-versus-contact creation, task creation-versus-stage update, and navigation-versus-business action.

## External tools

External tools are dynamic capabilities filtered by profile and runtime readiness.

### Public web

- `web.search` and `web.open` are read-only.
- Return source URL, title, retrieval/publication time when available, and inline citations.
- Strip names, emails, phones, student/private text, internal URLs, credentials, and record content from the search query.
- Never blend private app records into a public search query.
- Web content is untrusted and ephemeral. It cannot approve actions or auto-create durable memories.
- If OpenAI is the configured provider, the current Responses API tool is `{ "type": "web_search" }`; preserve citations and available source lists. See [OpenAI web search documentation](https://developers.openai.com/api/docs/guides/tools-web-search).

### Files and Drive

- `files.search`/`files.get`: read-only, workspace OAuth scope.
- `files.create_draft`: draft-only.
- Create/move/share/delete: external/sensitive with preview and approval.
- Existing `google_drive_find_file_preview` is a plan preview, not proof of real search. Report it honestly until a scoped connector exists.

### Calendar

- Internal app calendar and connected Google calendar are different capabilities.
- list/get/freebusy are reads; event draft is draft-only; create/update/delete/sync are external writes.
- Preview exact calendar, timezone, start/end, attendees, recurrence, and conflict state.

### Email

- search/thread/get are mailbox-scoped reads;
- draft is draft-only;
- send/schedule/cancel are external effects with exact To/Cc/Bcc, recipient count, subject/body, consent/suppression, account, and readiness preview;
- never infer an ambiguous recipient silently;
- Rabbi can access only a One Time-owned mailbox connection.

### Unavailable connectors

Return `blocked:not_configured` with an exact safe setup/readiness action. Never fabricate a result, silently use a different connector, or create a ticket/task unless the user asked.
