# Intent Preservation Eval Report

Generated: 2026-07-14T04:43:57.165Z
Passed: 8/8
Mutation failures caught: 11/11

## PASS 001-containment-versus-repetition
Several exact bullets must stay inside one Live Daily Mishnayos bubble with icon/title order.
Draft valid: yes
Completed spec valid: yes
Mutations caught: 2/2
Generated SPEC: `ops/intent-preservation/evals/generated/001-containment-versus-repetition/SPEC.json`
- PASS FAIL-separate-cards: expected IPG_CONTAINMENT_MISMATCH; actual IPG_CONTAINMENT_MISMATCH
- PASS FAIL-icon-below-list: expected IPG_CONTAINMENT_MISMATCH; actual IPG_CONTAINMENT_MISMATCH

## PASS 002-scoped-yellow-styling
Only named labels may become yellow; body copy remains unchanged.
Draft valid: yes
Completed spec valid: yes
Mutations caught: 1/1
Generated SPEC: `ops/intent-preservation/evals/generated/002-scoped-yellow-styling/SPEC.json`
- PASS FAIL-global-yellow: expected IPG_STYLE_SCOPE_GLOBALIZED; actual IPG_STYLE_SCOPE_GLOBALIZED

## PASS 003-unconditional-removal
Exact removal instructions must remain unconditional.
Draft valid: yes
Completed spec valid: yes
Mutations caught: 1/1
Generated SPEC: `ops/intent-preservation/evals/generated/003-unconditional-removal/SPEC.json`
- PASS FAIL-conditional-removal: expected IPG_REMOVAL_CONDITIONALIZED; actual IPG_REMOVAL_CONDITIONALIZED

## PASS 004-preserve-versus-stale-instruction
Current Accomplishment image supersedes older Toronto instruction.
Draft valid: yes
Completed spec valid: yes
Mutations caught: 1/1
Generated SPEC: `ops/intent-preservation/evals/generated/004-preserve-versus-stale-instruction/SPEC.json`
- PASS FAIL-stale-asset-wins: expected IPG_READY_ASSERTION_MISSING_HARD_SIGNAL; actual IPG_READY_ASSERTION_MISSING_HARD_SIGNAL

## PASS 005-mobile-cta-invariant
Mobile first load must show an enabled unobscured Sign Up Now control and preserve header actions.
Draft valid: yes
Completed spec valid: yes
Mutations caught: 2/2
Generated SPEC: `ops/intent-preservation/evals/generated/005-mobile-cta-invariant/SPEC.json`
- PASS FAIL-missing-mobile-viewport: expected IPG_MOBILE_CTA_VIEWPORT_MISSING; actual IPG_MOBILE_CTA_VIEWPORT_MISSING
- PASS FAIL-member-login-ambiguity-ready: expected IPG_UNRESOLVED_CONTEXT_REFERENCE; actual IPG_UNRESOLVED_CONTEXT_REFERENCE

## PASS 006-exact-copy-survival
Every user-provided bullet remains byte-for-byte identical and ordered.
Draft valid: yes
Completed spec valid: yes
Mutations caught: 1/1
Generated SPEC: `ops/intent-preservation/evals/generated/006-exact-copy-survival/SPEC.json`
- PASS FAIL-omitted-bullet: expected IPG_EXACT_COPY_ASSERTION_MISSING, IPG_EXACT_COPY_ORDER_MISSING; actual IPG_EXACT_COPY_ASSERTION_MISSING, IPG_EXACT_COPY_ORDER_MISSING

## PASS 007-generated-artifact-integrity
Prompt must contain every change ID and the spec fingerprint; stale specs fail.
Draft valid: yes
Completed spec valid: yes
Mutations caught: 2/2
Generated SPEC: `ops/intent-preservation/evals/generated/007-generated-artifact-integrity/SPEC.json`
- PASS FAIL-stale-fingerprint: expected IPG_FINGERPRINT_MISMATCH; actual IPG_FINGERPRINT_MISMATCH
- PASS FAIL-ambiguous-change-in-prompt: expected IPG_PROMPT_NOT_READY; actual (none)

## PASS 008-july-13-landing-mistranslation
The July 13 broad fix-the-text source must stop at clarification instead of inventing a removal requirement.
Draft valid: yes
Completed spec valid: yes
Pass failure codes: IPG_RAW_IDENTIFIES_AS_SUMMARY
Mutations caught: 1/1
- PASS FAIL-inferred-removal-ready: expected IPG_RAW_IDENTIFIES_AS_SUMMARY, IPG_UNRESOLVED_CONTEXT_REFERENCE; actual IPG_RAW_IDENTIFIES_AS_SUMMARY, IPG_HARD_SIGNAL_UNCOVERED, IPG_READY_ASSERTION_MISSING_HARD_SIGNAL, IPG_UNRESOLVED_CONTEXT_REFERENCE
