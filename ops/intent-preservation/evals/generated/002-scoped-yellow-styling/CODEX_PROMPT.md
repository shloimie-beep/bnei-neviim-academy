# CODEX PROMPT - SPEC-20990101-002

Spec fingerprint: 4377bc9c02f3b26e9a868222c300b059363314b8ffe84f51ec8ee549fb520d4e
Raw source: ops/intent-preservation/evals/generated/002-scoped-yellow-styling/RAW.md
Raw SHA-256: fdc5c728288d05628eea03ea7616cc5b97f095011d660ec143375294f1f46b13
Workspace/project: rabbi_sheller_provider / one_time_mishnah_class
Routes: /one-time

## Operating Order

VERBATIM RAW -> ATOMIC SPEC -> CHANGE RECEIPT -> AMBIGUITY RESOLUTION -> PQC -> GENERATED CODEX PACKET -> IMPLEMENTATION -> ASSERTIONS/EVIDENCE

Report implementation status and evidence per change ID. Do not implement changes outside these IDs.

## Scoped Files / Routes

- public/one-time/index.html
- tests/one-time-focused-landing.test.js

## Included Changes

### CHG-20990101-002
- Classification: HARD_EXACT
- Target: /one-time > Landing labels > labels > .feature-label
- Operation: style
- Current state: Current state must be inspected before implementation.
- Required state: Make only "Live daily Mishnayos", "Review support", and "Family and school signup" labels yellow. Keep body copy unchanged.
- Exact payload: {}
- Placement: parent=; before=; after=; order=
- Style allowlist: Live daily Mishnayos, Review support, Family and school signup
- Style forbidden targets: body copy, section wrapper, all labels
- Must preserve: body copy unchanged
- Must remove: (none)
- Dependencies: (none)
- Supersedes: (none)
- Source spans:
  - CHG-20990101-002:S01 [0, 123]: "Make only \"Live daily Mishnayos\", \"Review support\", and \"Family and school signup\" labels yellow. Keep body copy unchanged."
- Positive assertions:
  - CHG-20990101-002-POS-001: Make only "Live daily Mishnayos", "Review support", and "Family and school signup" labels yellow. Keep body copy unchanged.
body copy unchanged
- Negative assertions:

## Forbidden

- Do not paraphrase exact payloads.
- Do not weaken HARD_EXACT constraints with SOFT_GOAL language.
- Do not implement unresolved ambiguous changes.
- Do not edit product code before PQC and downstream readiness gates when product/UI work is in scope.
