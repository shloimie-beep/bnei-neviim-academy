# CODEX PROMPT - SPEC-20990101-004

Spec fingerprint: 4f9c2570766daa4193bab38fcf6ad551d0bfcda915f4e7429617af7b4ab78a7a
Raw source: ops/intent-preservation/evals/generated/004-preserve-versus-stale-instruction/RAW.md
Raw SHA-256: 938f105fd3d79047a77adf451fd7b8bc5dcad96c7e35dc01dd67164450f97bc6
Workspace/project: rabbi_sheller_provider / one_time_mishnah_class
Routes: /one-time

## Operating Order

VERBATIM RAW -> ATOMIC SPEC -> CHANGE RECEIPT -> AMBIGUITY RESOLUTION -> PQC -> GENERATED CODEX PACKET -> IMPLEMENTATION -> ASSERTIONS/EVIDENCE

Report implementation status and evidence per change ID. Do not implement changes outside these IDs.

## Scoped Files / Routes

- public/one-time/index.html
- tests/one-time-focused-landing.test.js

## Included Changes

### CHG-20990101-004 (global invariant)
- Classification: HARD_EXACT
- Target: /one-time > Gain cards > Accomplishment image > [data-outcome="accomplishment"]
- Operation: preserve
- Current state: Current state must be inspected before implementation.
- Required state: Preserve the currently approved Accomplishment image C:\Users\User\Downloads\Lakewood 3.jpg. Supersede the older Toronto-image instruction.
- Exact payload: {}
- Placement: parent=; before=; after=; order=
- Style allowlist: (none)
- Style forbidden targets: (none)
- Must preserve: C:\Users\User\Downloads\Lakewood 3.jpg
- Must remove: (none)
- Dependencies: (none)
- Supersedes: CHG-20260712-TORONTO
- Source spans:
  - CHG-20990101-004:S01 [0, 139]: "Preserve the currently approved Accomplishment image C:\\Users\\User\\Downloads\\Lakewood 3.jpg. Supersede the older Toronto-image instruction."
- Positive assertions:
  - CHG-20990101-004-POS-001: Preserve the currently approved Accomplishment image C:\Users\User\Downloads\Lakewood 3.jpg. Supersede the older Toronto-image instruction.
C:\Users\User\Downloads\Lakewood 3.jpg
- Negative assertions:

## Forbidden

- Do not paraphrase exact payloads.
- Do not weaken HARD_EXACT constraints with SOFT_GOAL language.
- Do not implement unresolved ambiguous changes.
- Do not edit product code before PQC and downstream readiness gates when product/UI work is in scope.
