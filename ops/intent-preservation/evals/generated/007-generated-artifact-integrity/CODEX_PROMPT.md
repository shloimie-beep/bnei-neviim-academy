# CODEX PROMPT - SPEC-20990101-007

Spec fingerprint: 75365e5029804882c4fb06675bccab4cad715ee67da8d223119f6de7abdfb31b
Raw source: ops/intent-preservation/evals/generated/007-generated-artifact-integrity/RAW.md
Raw SHA-256: 9962807e711f6d46f0c4c204abecba1fb582209f3ef1450fe5fc037a790dd503
Workspace/project: rabbi_sheller_provider / one_time_mishnah_class
Routes: /one-time

## Operating Order

VERBATIM RAW -> ATOMIC SPEC -> CHANGE RECEIPT -> AMBIGUITY RESOLUTION -> PQC -> GENERATED CODEX PACKET -> IMPLEMENTATION -> ASSERTIONS/EVIDENCE

Report implementation status and evidence per change ID. Do not implement changes outside these IDs.

## Scoped Files / Routes

- public/one-time/index.html
- tests/one-time-focused-landing.test.js

## Included Changes

### CHG-20990101-007
- Classification: HARD_EXACT
- Target: /one-time > One Time public landing > Landing section
- Operation: replace
- Current state: Current state must be inspected before implementation.
- Required state: Replace "old line" with "new line" exactly.
- Exact payload: {"old_text":"old line","new_text":"new line"}
- Placement: parent=; before=; after=; order=
- Style allowlist: (none)
- Style forbidden targets: (none)
- Must preserve: (none)
- Must remove: (none)
- Dependencies: (none)
- Supersedes: (none)
- Source spans:
  - CHG-20990101-007:S01 [0, 43]: "Replace \"old line\" with \"new line\" exactly."
- Positive assertions:
  - CHG-20990101-007-POS-001: Replace "old line" with "new line" exactly.
- Negative assertions:

## Forbidden

- Do not paraphrase exact payloads.
- Do not weaken HARD_EXACT constraints with SOFT_GOAL language.
- Do not implement unresolved ambiguous changes.
- Do not edit product code before PQC and downstream readiness gates when product/UI work is in scope.
