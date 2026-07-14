# CODEX PROMPT - SPEC-20990101-005

Spec fingerprint: 64334cda9c9bb5d5cfcd138089871a8f8d902308bbaa3e6c9667cda580c944f0
Raw source: ops/intent-preservation/evals/generated/005-mobile-cta-invariant/RAW.md
Raw SHA-256: 1f41dd8b0d4fb4dbb734eb0993fc20ce5cc2eec4582962f2162073d30ec2eb71
Workspace/project: rabbi_sheller_provider / one_time_mishnah_class
Routes: /one-time

## Operating Order

VERBATIM RAW -> ATOMIC SPEC -> CHANGE RECEIPT -> AMBIGUITY RESOLUTION -> PQC -> GENERATED CODEX PACKET -> IMPLEMENTATION -> ASSERTIONS/EVIDENCE

Report implementation status and evidence per change ID. Do not implement changes outside these IDs.

## Scoped Files / Routes

- ops/action-registry.json
- public/one-time/index.html
- tests/one-time-focused-landing.test.js

## Included Changes

### CHG-20990101-005
- Classification: HARD_EXACT
- Target: /one-time > Mobile header and hero > primary CTA > a[href="/one-time/signup"]
- Operation: behavior
- Current state: Current state must be inspected before implementation.
- Required state: When the mobile landing page first loads, at least one primary Sign Up Now control must be fully visible without scrolling. Assert 360x640, 375x667, 390x844, and 430x932. The visible control is enabled, unobscured, and goes to /one-time/signup. Preserve the logo, mobile navigation control, and Member Login action.
- Exact payload: {}
- Placement: parent=; before=; after=; order=
- Style allowlist: (none)
- Style forbidden targets: (none)
- Must preserve: logo | mobile navigation control | Member Login action
- Must remove: (none)
- Dependencies: (none)
- Supersedes: (none)
- Source spans:
  - CHG-20990101-005:S01 [0, 315]: "When the mobile landing page first loads, at least one primary Sign Up Now control must be fully visible without scrolling. Assert 360x640, 375x667, 390x844, and 430x932. The visible control is enabled, unobscured, and goes to /one-time/signup. Preserve the logo, mobile navigation control, and Member Login action."
- Positive assertions:
  - CHG-20990101-005-POS-001: When the mobile landing page first loads, at least one primary Sign Up Now control must be fully visible without scrolling. Assert 360x640, 375x667, 390x844, and 430x932. The visible control is enabled, unobscured, and goes to /one-time/signup. Preserve the logo, mobile navigation control, and Member Login action.
logo
mobile navigation control
Member Login action
- Negative assertions:

## Forbidden

- Do not paraphrase exact payloads.
- Do not weaken HARD_EXACT constraints with SOFT_GOAL language.
- Do not implement unresolved ambiguous changes.
- Do not edit product code before PQC and downstream readiness gates when product/UI work is in scope.
