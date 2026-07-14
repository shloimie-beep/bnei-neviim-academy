# CODEX PROMPT - SPEC-20990101-001

Spec fingerprint: 7db763387bf590013edd4cb4a2ed33234e940de9e3f8dc0327602c411cfa0e10
Raw source: ops/intent-preservation/evals/generated/001-containment-versus-repetition/RAW.md
Raw SHA-256: 1e3a28a9e66a4305d0b02c339a1fbc935c063347897925dbf79acf5c2f3f0b7a
Workspace/project: rabbi_sheller_provider / one_time_mishnah_class
Routes: /one-time

## Operating Order

VERBATIM RAW -> ATOMIC SPEC -> CHANGE RECEIPT -> AMBIGUITY RESOLUTION -> PQC -> GENERATED CODEX PACKET -> IMPLEMENTATION -> ASSERTIONS/EVIDENCE

Report implementation status and evidence per change ID. Do not implement changes outside these IDs.

## Scoped Files / Routes

- public/one-time/index.html
- tests/one-time-focused-landing.test.js

## Included Changes

### CHG-20990101-001
- Classification: HARD_EXACT
- Target: /one-time > Live Daily Mishnayos > bubble > [data-live-daily-mishnayos]
- Operation: add
- Current state: Current state must be inspected before implementation.
- Required state: Add these exact bullets inside the same Live Daily Mishnayos bubble in order: "Daily class link", "7:00 p.m. live class", "Review sheets". Put the icon above the bubble and the title below the icon.
- Exact payload: {"items":["Daily class link","7:00 p.m. live class","Review sheets"]}
- Placement: parent=Live Daily Mishnayos bubble; before=icon; after=; order=icon > title > bubble > Daily class link > 7:00 p.m. live class > Review sheets
- Style allowlist: (none)
- Style forbidden targets: (none)
- Must preserve: (none)
- Must remove: (none)
- Dependencies: (none)
- Supersedes: (none)
- Source spans:
  - CHG-20990101-001:S01 [0, 198]: "Add these exact bullets inside the same Live Daily Mishnayos bubble in order: \"Daily class link\", \"7:00 p.m. live class\", \"Review sheets\". Put the icon above the bubble and the title below the icon."
- Positive assertions:
  - CHG-20990101-001-POS-001: Add these exact bullets inside the same Live Daily Mishnayos bubble in order: "Daily class link", "7:00 p.m. live class", "Review sheets". Put the icon above the bubble and the title below the icon.
Daily class link
7:00 p.m. live class
Review sheets
- Negative assertions:

## Forbidden

- Do not paraphrase exact payloads.
- Do not weaken HARD_EXACT constraints with SOFT_GOAL language.
- Do not implement unresolved ambiguous changes.
- Do not edit product code before PQC and downstream readiness gates when product/UI work is in scope.
