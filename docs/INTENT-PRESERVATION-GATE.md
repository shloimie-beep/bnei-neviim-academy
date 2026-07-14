# Intent Preservation Gate

The Intent Preservation Gate is the fidelity layer before the Product Quality
Compiler.

Required order:

`VERBATIM RAW -> ATOMIC SPEC -> CHANGE RECEIPT -> AMBIGUITY RESOLUTION -> PQC -> GENERATED CODEX PACKET -> IMPLEMENTATION -> ASSERTIONS/EVIDENCE`

PQC still owns product completeness, states, screenshots, accessibility,
safety, deployment, and closeout. This gate owns whether the generated work
faithfully preserves the operator source.

## Contract

Every new implementation, UI, product, correction, or prompt packet must carry:

- `RAW.md` or a repo raw source file used as full authority;
- `SPEC.json` that validates against `ops/intent-preservation.schema.json`;
- `RECEIPT.md` generated from `SPEC.json`;
- `CODEX_PROMPT.md` generated from `SPEC.json`;
- manifest/status records with raw SHA-256, spec path, and spec fingerprint.

Historical ChatGPT packets without `SPEC.json` stay readable in legacy mode, but
new packets cannot become `ready_for_codex_audit` or `ready_for_codex_pickup`
without passing the gate.

## Classifications

Each actionable source span is exactly one of:

- `HARD_EXACT`: exact copy, names, numbers, files, assets, colors, counts,
  placement, containment, order, additions, removals, preservation rules, and
  words such as `only`, `inside`, `above`, `below`, `keep`, or `remove`.
- `SOFT_GOAL`: subjective goals such as clean, professional, faster, easier,
  consistent, or polished. These may add measurable requirements but may not
  weaken `HARD_EXACT`.
- `AMBIGUOUS`: more than one materially different implementation remains after
  inspecting source history, current code/DOM, assets, and screenshots.
- `NON_ACTIONABLE`: context, emotion, repetition, or explanation that does not
  request a change.

Unresolved `AMBIGUOUS` atoms block only themselves and dependent atoms.

## Mechanical Gates

The validator checks:

- raw file SHA-256 and character count;
- exact quote/start/end source spans;
- hard-signal coverage for exact strings, files/assets, numbers, colors,
  removal/preservation terms, positional language, and named components/actions;
- one atomic operation per change;
- required positive and negative acceptance assertions;
- scoped styling allowlists and forbidden targets;
- containment/order requirements;
- unconditional removals;
- preservation and field-level supersession;
- mobile CTA viewport assertions where the source requires them;
- exact-copy survival;
- stale fingerprints and stale generated prompts.

The validator is intentionally static. It does not claim full natural-language
understanding; it forces the agent-produced spec to expose hard losses and
unresolved meaning before product code is edited.

## Commands

```bash
npm run intent:validate -- path/to/SPEC.json
npm run intent:validate:fixtures
npm run intent:receipt -- path/to/SPEC.json --out RECEIPT.md
npm run intent:prompt -- path/to/SPEC.json --out CODEX_PROMPT.md
npm run intent:eval
```

Use `npm run pqc:validate` only after the intent spec is valid or the unresolved
atoms are blocked for clarification.

## Real Regression

`raw-input/RAW-20260713-007-onetime-landing-text-crop-followup.md` is the
documented failure pattern. A broad "fix the text" source referenced earlier
text changes that were not attached, a later requirement inferred removals, and
tests certified that inference. The new flow must stop at clarification until
the earlier exact source is attached or the operator restates the exact changes.
