# CODEX PROMPT - SPEC-20990101-003

Spec fingerprint: dbbdc961b23edb818f633ee4ec61fbc6e92c7215d11c24a6b69f84ea7d57edd8
Raw source: ops/intent-preservation/evals/generated/003-unconditional-removal/RAW.md
Raw SHA-256: ee49e2ae797320ded1a3883bc5600e4e1d2af034045a0ae1773c6fc5d8a3b4c2
Workspace/project: rabbi_sheller_provider / one_time_mishnah_class
Routes: /one-time

## Operating Order

VERBATIM RAW -> ATOMIC SPEC -> CHANGE RECEIPT -> AMBIGUITY RESOLUTION -> PQC -> GENERATED CODEX PACKET -> IMPLEMENTATION -> ASSERTIONS/EVIDENCE

Report implementation status and evidence per change ID. Do not implement changes outside these IDs.

## Scoped Files / Routes

- public/one-time/index.html
- tests/one-time-focused-landing.test.js

## Included Changes

### CHG-20990101-003
- Classification: HARD_EXACT
- Target: /one-time > Landing copy > feature cards > Monitored online platform
- Operation: remove
- Current state: Current state must be inspected before implementation.
- Required state: Remove Monitored online platform and Questions with Rabbi Scheller.
- Exact payload: {}
- Placement: parent=; before=; after=; order=
- Style allowlist: (none)
- Style forbidden targets: (none)
- Must preserve: (none)
- Must remove: Monitored online platform | Questions with Rabbi Scheller
- Dependencies: (none)
- Supersedes: (none)
- Source spans:
  - CHG-20990101-003:S01 [0, 67]: "Remove Monitored online platform and Questions with Rabbi Scheller."
- Positive assertions:
  - CHG-20990101-003-POS-001: Remove Monitored online platform and Questions with Rabbi Scheller.
- Negative assertions:
  - CHG-20990101-003-NEG-001: Monitored online platform is absent. Questions with Rabbi Scheller is absent.

## Forbidden

- Do not paraphrase exact payloads.
- Do not weaken HARD_EXACT constraints with SOFT_GOAL language.
- Do not implement unresolved ambiguous changes.
- Do not edit product code before PQC and downstream readiness gates when product/UI work is in scope.
