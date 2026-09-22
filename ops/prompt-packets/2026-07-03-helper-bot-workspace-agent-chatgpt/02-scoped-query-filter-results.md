# ChatGPT Window 2 - Scoped Query, Filter, Results, And Deep Links

You are ChatGPT preparing one slice of a repo-ready implementation package for
Codex. Work only on this slice. Do not solve the whole helper bot.

Parent: `RAW-20260703-003`.

## Your Slice

Design and code-prep the helper's deterministic read/query/filter/result layer.

Primary proof workflow:

> User asks: "How many parents owe me money?"

The helper must:

1. resolve actor/workspace/project/role server-side;
2. identify allowed accounting/parent/payment data sources;
3. query only scoped data;
4. set or return visible filter state;
5. return count, total outstanding balance, rows, and deep links;
6. suggest safe next actions;
7. avoid sends or payment/access mutation.

## Required Tool Families

Prepare concrete contracts and implementation guidance for:

- `helper.query.parents_with_balance`
- `helper.query.accounting_summary`
- `helper.query.contacts`
- `helper.query.tasks`
- `helper.query.communications`
- `helper.query.content_library`
- `helper.query.provider_members`
- `helper.filter.set_view_filter`
- `helper.navigation.open_deep_link`
- `helper.results.render_metric_table_links`

## Required Result Shape

Every query result should return:

```json
{
  "summary": "12 parents have an outstanding balance.",
  "metrics": [{ "label": "Total outstanding", "value": "$3,420" }],
  "rows": [],
  "record_links": [],
  "filter_state": {},
  "deep_link": "/operations?view=accounting&filter=parents_owing",
  "actions_available": [],
  "privacy_scope": {
    "workspace_key": "bna_school",
    "project_key": null,
    "role": "super_admin"
  },
  "external_write_performed": false
}
```

## Code-Prep Requirements

Produce patch-ready guidance for:

- helper query module location under `src/lib/bna/helper/`;
- server route changes under `/api/bna/helper/message` or a new query route;
- integration with existing helper planner;
- Operations UI behavior for setting visible filters;
- deep-link format;
- tests for BNA admin, Rabbi/provider, parent, student, and public denial.

## Handoff Package

Return files for:

`ops/chatgpt-ramble-dropoff/incoming/helper-bot-workspace-agent-02-query-filter-results/`

Use exact `packet_id`: `helper-bot-workspace-agent-02-query-filter-results`.
The folder name, `packet.json`, `status.json`, and `MANIFEST.json` must all
use this same ID.

If GitHub repo-file creation fails with `403 Resource not accessible by
integration`, post one GitHub issue/PR comment marked
`BNA_CHATGPT_DROPOFF_PACKET` with complete fenced `### File: ...` blocks for
every required file. Do not return only a local ZIP/download link.

Required:

- `packet.json`
- `RAW.md`
- `CODEX_PROMPT.md`
- `MANIFEST.json`
- `status.json`
- `PATCHES.md`

## Guardrails

No cross-workspace reads. No external writes. No guessed financial data. If data
is unavailable, return an exact blocker and the route/table needed.
