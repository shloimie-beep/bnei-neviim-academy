# Provider Pipelines Memory

- BNA Academy has its own classroom/content/video pipeline.
- Rabbi / One Time has a separate provider-specific classroom/content/community
  pipeline scoped to `rabbi_sheller_provider` / `one_time_mishnah_class`.
- Future service providers need separate scoped pipelines.
- Shared code, platform primitives, UI patterns, helper contracts, registry
  requirements, audit harnesses, and visual quality standards are allowed.
- Shared classroom/content/community records are not allowed unless an explicit
  cross-workspace enrollment/link exists.

## Decision

- `DEC-20260701-ONETIME-SEPARATE-PROVIDER-PIPELINE`
- Owner: Shloimie.
- Decision: One Time uses shared BNA platform primitives and operating
  standards, but not shared BNA classroom/content/community data records.
- Shared layer: code primitives, UI patterns, action/route registry, helper
  contracts, visual quality standards, audit harness.
- Separated layer: classroom records, content records, videos, questions,
  student responses, access/progress, contacts, communications, payment/access
  records.
- Consequence: Rabbi UI cleanup can become platform-standard fixes, but Rabbi
  content/classroom data does not become BNA data.
