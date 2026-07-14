# CODEX PROMPT - SPEC-20990101-006

Spec fingerprint: 1eaf8442adde88b7353311106e313c71ae98b61cc73a3d2c228069e9222f2d15
Raw source: ops/intent-preservation/evals/generated/006-exact-copy-survival/RAW.md
Raw SHA-256: 0cc6f51b80cb32bded5b2974fac4a3e39ea893f2c1d4edd97bf4dc465316a8cd
Workspace/project: rabbi_sheller_provider / one_time_mishnah_class
Routes: /one-time

## Operating Order

VERBATIM RAW -> ATOMIC SPEC -> CHANGE RECEIPT -> AMBIGUITY RESOLUTION -> PQC -> GENERATED CODEX PACKET -> IMPLEMENTATION -> ASSERTIONS/EVIDENCE

Report implementation status and evidence per change ID. Do not implement changes outside these IDs.

## Scoped Files / Routes

- public/one-time/index.html
- tests/one-time-focused-landing.test.js

## Included Changes

### CHG-20990101-006
- Classification: HARD_EXACT
- Target: /one-time > One Time public landing > Landing section
- Operation: add
- Current state: Current state must be inspected before implementation.
- Required state: Use these exact bullets in order: "First exact bullet", "Second exact bullet", "Third exact bullet".
- Exact payload: {"items":["First exact bullet","Second exact bullet","Third exact bullet"]}
- Placement: parent=; before=; after=; order=
- Style allowlist: (none)
- Style forbidden targets: (none)
- Must preserve: (none)
- Must remove: (none)
- Dependencies: (none)
- Supersedes: (none)
- Source spans:
  - CHG-20990101-006:S01 [0, 100]: "Use these exact bullets in order: \"First exact bullet\", \"Second exact bullet\", \"Third exact bullet\"."
- Positive assertions:
  - CHG-20990101-006-POS-001: Use these exact bullets in order: "First exact bullet", "Second exact bullet", "Third exact bullet".
  - CHG-20990101-006-POS-002: First exact bullet
Second exact bullet
Third exact bullet
- Negative assertions:

## Forbidden

- Do not paraphrase exact payloads.
- Do not weaken HARD_EXACT constraints with SOFT_GOAL language.
- Do not implement unresolved ambiguous changes.
- Do not edit product code before PQC and downstream readiness gates when product/UI work is in scope.
