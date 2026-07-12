# Lane 02 — Canonical Capability Contract And Compiler

**Packet role:** implementation
**Owner:** Codex
**Depends on:** Lane 01
**Primary files:** new `src/platform/assistant/capabilities/*`, generator, generated `ops/assistant-capabilities/*`; adapters to existing registries

## Mission

Create one executable capability catalog and a CI gate that makes “every button” measurable and honest.

## Implement

- Adapt `contracts/capability.schema.json` into repository validation code.
- Treat `src/lib/actions/registry.js` as canonical execution for mutations.
- Add alias mappings for typed action IDs, Helper names, UI `ACTION-*` IDs, and route keys.
- Ingest 80 typed actions, 169 Helper tools, 127 UI actions, current route registry, and UI data attributes.
- Classify each UI control as business semantic, secure deep link, channel-local, disabled, or external-blocked.
- Add explicit effect, reversibility, preview, approval, authorization, connector, handler, timeout, idempotency, audit, renderer, and test metadata.
- Generate profile manifests and parity reports; generated files carry source hash and fail `--check` when stale.
- Convert 69 Helper/typed overlaps into aliases; list the 100 Helper-only and 11 typed-without-Helper gaps rather than claiming parity.

## Do not

- Do not infer effect/risk from action names for release.
- Do not count intent examples/context tags as runtime coverage.
- Do not hand-edit generated parity artifacts.
- Do not migrate every handler in this lane.

## Acceptance

- Strict schema and unique alias validation pass.
- Every current UI action/route is mapped or explicitly excluded with reason.
- Every enabled capability names a real handler/test; mutations name idempotency/audit.
- Rabbi manifest has zero BNA/global/deploy/credential capability.
- Public manifests contain no private/internal capability.
- Drift/gap report reflects current counts, not stale 120/80 parity claims.

## Tests

Generator/manifest/profile/alias/handler import/schema/effect/approval/source-hash tests. Run existing action registry, Helper parity, route, universal control-plane, and One Time scope suites.

## Handback

Return exact mapped/gap/exclusion counts and generated paths. Structural parity is not runtime parity; leave capability migration for Lane 06.
