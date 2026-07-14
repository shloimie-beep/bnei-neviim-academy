---
raw_id: RAW-20260714-001
source_channel: codex_chat
parse_status: registered
workspace_key: bna_platform
project_key: protocol_tooling
requirement_register: tasks-pending/2026-07-14-intent-preservation-gate.md
created_at: 2026-07-14T04:22:10+03:00
privacy_classification: protocol_tooling_no_private_payloads
---

# Intent Preservation Gate v1 Execution Packet

Operator message:

```text
CODEX EXECUTION PACKET: Intent Preservation Gate v1
Repository: shloimie-beep/bnei-neviim-academy
Outcome
Implement a lossless specification layer between an operator ramble and the existing Product Quality Compiler (PQC). After this work, a structurally valid but semantically wrong packet must fail before product code is edited.
This packet changes protocol tooling only. Do not repair the One Time landing page or performance in this packet. Use the landing-page failure as a regression fixture.
Start here
Read, in order:
AGENTS.md
BNA-START-HERE.md
docs/BNA-RAMBLE-TO-DONE.md
docs/PRODUCT-QUALITY-COMPILER.md
src/platform/ingestion/operator-ramble-service.js
src/lib/bna/ramble-protocol.js
ops/product-quality-compiler.schema.json
scripts/validate-product-quality-packets.mjs
scripts/chatgpt-packet-prompt-splitter.mjs
scripts/chatgpt-dropoff-ingestor.mjs
ops/chatgpt-ramble-dropoff/templates/packet.json
Existing PQC eval runner, fixtures, and latest report
raw-input/RAW-20260713-007-onetime-landing-text-crop-followup.md
tasks-pending/2026-07-13-onetime-landing-image-addendum.md
tests/one-time-focused-landing.test.js
Before editing, verify the current branch, working tree, open overlapping work, and current implementations. Preserve unrelated work.
Defects this implementation must correct
Treat these as observed defects to verify against current code:
RAW-* can contain rewritten summaries instead of immutable verbatim input.
Ramble splitting is largely punctuation-based.
One generated requirement can contain several unrelated UI changes.
The existing no-lost-sentence gate mainly compares row counts and IDs.
Source excerpts can be truncated before specification work.
PQC validates structure and evidence fields but not fidelity to the original source.
The prompt splitter uses generic lanes instead of atomic change ownership.
Exact copy, containment, order, style scope, removals, preservation rules, and supersession can disappear while validation still passes.
Tests can then certify the mistranslated requirement.
Root AGENTS.md is currently about 45,000 characters. Codex's normal combined project-instruction limit is 32 KiB, so later instructions may not be loaded.
Do not solve this by adding more prose to the end of AGENTS.md or by creating another generic mega-prompt.
Required operating model
Insert this order before implementation:
VERBATIM RAW -> ATOMIC SPEC -> CHANGE RECEIPT -> AMBIGUITY RESOLUTION -> PQC -> GENERATED CODEX PACKET -> IMPLEMENTATION -> ASSERTIONS/EVIDENCE
PQC remains in place. The new layer owns intent fidelity; PQC continues to own product completeness, safety, states, visual evidence, deployment, and closeout.
Classification rules
Every actionable source span must be classified as exactly one of:
HARD_EXACT: exact text, names, numbers, filenames, assets, colors, counts, order, placement, containment, additions, removals, preservation rules, exceptions, or words such as only/inside/above/below/keep/remove.
SOFT_GOAL: subjective intent such as clean, professional, consistent, faster, or easier. Expand it into measurable technical requirements without replacing any hard constraint.
AMBIGUOUS: more than one materially different implementation remains after inspecting source history, code, assets, and screenshots.
NON_ACTIONABLE: context, emotion, repetition, or explanation that does not request a change.
A SOFT_GOAL may add detail but may never weaken or override HARD_EXACT. An unresolved AMBIGUOUS atom blocks only itself and dependent atoms, not unrelated work.
Required durable artifacts
Choose final paths that fit repo conventions, but implement all of these concepts:
docs/INTENT-PRESERVATION-GATE.md
A strict JSON schema for an atomic specification, for example ops/intent-preservation.schema.json
A reusable module for raw hashing, source-span verification, constraint extraction, coverage calculation, and readiness calculation
A CLI validator, for example scripts/validate-intent-spec.mjs
A deterministic change-receipt generator
A deterministic Codex-prompt generator that consumes the validated spec
Drop-off ingestion integration requiring the spec for new implementation packets
Ramble ingestion integration that creates a draft spec instead of pretending vague fragments are implementation-ready
Package scripts for validation, receipt generation, prompt generation, and evals
End-to-end evals and mutation tests using real failure patterns
A concise, early AGENTS.md rule that directs Codex to this gate
An instruction-size solution so critical repository guidance is actually loaded
Do not add a production dependency unless it is necessary and justified. Prefer the repo's current Node and validation approach.
Atomic specification contract
The schema must set additionalProperties: false on fidelity-critical objects and require, at minimum:
{
  "spec_version": "intent-preservation-v1",
  "spec_id": "SPEC-...",
  "raw": {
    "raw_id": "RAW-...",
    "path": "raw-input/...",
    "capture_mode": "verbatim",
    "sha256": "...",
    "character_count": 0
  },
  "scope": {
    "workspace": "...",
    "project": "...",
    "routes": []
  },
  "global_invariants": [],
  "changes": [],
  "source_coverage": [],
  "readiness": {
    "status": "draft|needs_clarification|ready_for_pqc|ready_for_implementation",
    "blocking_change_ids": []
  },
  "fingerprint": "..."
}
Each changes[] item must require:
stable change_id;
one or more exact source spans with start/end offsets and verbatim quotes;
classification and provenance (USER_STATED or AGENT_INFERRED);
confidence and ambiguity status;
route/screen;
target section/component plus selector, accessible-name, or current-text anchor;
exactly one primary operation such as add, replace, remove, move, style, preserve, or behavioral constraint;
current state and required state;
exact payload where the user supplied copy or data;
containment/parent, sibling relationship, and order where layout is involved;
style scope including explicitly permitted and forbidden targets;
required viewport behavior;
must_preserve and must_remove constraints;
conflicts and supersedes IDs;
deterministic positive and negative acceptance assertions;
dependencies;
resolution question and 2-3 choices when ambiguous.
Support global_invariants for constraints that future changes may not silently break. They need the same source provenance, scope, acceptance assertions, and supersession rules as atomic changes.
Verbatim-source and coverage gates
Implement mechanical checks, not prose promises:
Hash the raw file and store the digest in the spec.
Verify every recorded quote exactly matches the raw content at its offsets.
Reject a packet that claims capture_mode: verbatim when it identifies itself as a summary, normalized prompt, or compiled correction.
Preserve full raw input. Do not use a 320-character or 12,000-character excerpt as the authority.
Extract and require coverage for hard signals including:
quoted/exact strings;
filenames and asset paths;
numbers, times, counts, and dimensions;
named colors;
negation/removal/preservation terms;
positional and containment words;
named sections/components/actions.
Every actionable source span must map exactly once to an atomic change, or be explicitly marked ambiguous/non-actionable with a reason.
Reject broad atoms that combine independently testable operations or unrelated targets.
Reject readiness when a hard literal, removal, preservation rule, or positional relationship is not represented in acceptance assertions.
Reject readiness when a newer conflict lacks explicit field-level supersession.
Reject readiness when an unresolved reference such as "the text I mentioned before" cannot be resolved to an attached earlier source.
Do not claim this static validator understands all natural language. It should detect mechanical losses and force the agent-produced specification to expose unresolved meaning.
Change receipt and clarification behavior
Generate a short operator-facing receipt from the spec, not from a second summary. Each line must include change ID, exact target, operation, and required result.
When an ambiguity is material:
inspect repo history, current DOM, prior raw files, assets, and screenshots first;
if still unresolved, generate one focused question for that atom;
offer 2-3 concrete choices and mark a recommendation with its tradeoff;
do not generate an implementation-ready Codex packet for that atom;
continue compiling unrelated unambiguous atoms.
The operator should review the receipt, not a multi-thousand-word implementation prompt.
Prompt generation
CODEX_PROMPT.md must be generated deterministically from the validated spec.
It must include:
spec ID and fingerprint;
every included change ID;
exact payloads without paraphrase;
targets, operations, placement, invariants, forbidden changes, and assertions;
dependencies and supersession;
scoped files/routes inferred from the spec and current repo;
instruction to report status and evidence per change ID.
Generation must fail if the spec is not ready. Do not maintain a separately written prose prompt that can drift from SPEC.json.
Drop-off and packet integration
For new implementation_bundle, UI, product, correction, or prompt packets:
require RAW.md and SPEC.json;
require the raw hash and spec fingerprint in the manifest/status record;
require the generated receipt and generated Codex prompt;
block ready_for_codex_audit and ready_for_codex_pickup when fidelity validation fails;
queue the spec path and fingerprint, not only a truncated prompt excerpt.
Preserve backward compatibility for historical packets. Historical packets may validate in legacy mode with an explicit warning; new packets must not silently fall back.
AGENTS.md instruction-loading repair
Do not append another large section.
Measure UTF-8 byte size, not only character count.
Keep a concise non-negotiable instruction chain below the default limit with margin; target no more than 24 KiB for root guidance.
Put the Intent Preservation Gate trigger near the beginning.
Move explanatory material into linked canonical docs while preserving every existing rule. Produce a section migration map proving nothing was silently deleted.
If project configuration is used to raise project_doc_max_bytes, treat that only as defense in depth; still keep root guidance concise.
Add a test/watchdog that fails when critical trigger text is absent or root guidance exceeds the chosen budget.
Mandatory regression cases
The eval runner must invoke the real draft/compiler/validator/generator path. Do not load only a hand-authored expected packet and call that a compiler evaluation.
Include these cases and mutation failures:
Containment versus repetition
Input meaning: add several exact bullets inside the same Live Daily Mishnayos bubble, with the icon above the bubble and the title below the icon.
PASS: one parent bubble contains title and ordered bullets; icon is the specified sibling above it.
FAIL: bullets become separate cards/bubbles.
FAIL: icon is moved inside the list or below the bubble.
Scoped yellow styling
Input meaning: make only specifically named labels yellow.
PASS: allowlist contains only the named labels and body copy remains unchanged.
FAIL: yellow becomes a global brand rule or is applied to the whole section.
Unconditional removal
Input meaning: remove Monitored online platform and Questions with Rabbi Scheller.
PASS: exact absence assertions exist.
FAIL: operation becomes conditional, such as "remove where redundant."
Preserve versus stale instruction
Input meaning: preserve the currently approved Accomplishment image; an older Toronto-image instruction exists.
PASS: the old asset instruction is explicitly superseded and the current asset is invariant.
FAIL: the older asset silently wins.
Mobile CTA invariant
Input meaning: when the mobile landing page first loads, at least one primary Sign Up Now control must be fully visible without scrolling. Future header/hero changes may not break that.
Require viewport assertions at 360x640, 375x667, 390x844, and 430x932.
Assert the visible control is enabled, unobscured, and has the correct signup destination.
Preserve the logo, mobile navigation control, and Member Login action.
Treat "Member Login must be visibly written in the compact top bar" versus "Member Login may be in the opened menu" as an ambiguity unless the source explicitly chooses one.
Exact-copy survival
PASS: every user-provided bullet remains byte-for-byte identical and ordered.
FAIL: one bullet is omitted, corrected stylistically, or merged with another.
Generated artifact integrity
The generated prompt contains every included change ID and the spec fingerprint.
Editing SPEC.json invalidates the fingerprint and stale prompt.
An ambiguous/blocking change cannot appear in an implementation-ready prompt.
Use the July 13 landing mistranslation as a documented real-world regression: broad "fix the text" could not resolve an earlier source, an inferred removal became REQ-20260713-929, and tests later asserted the inference. The new flow must stop at clarification instead.
Verification
At minimum:
schema valid and invalid fixtures;
unit tests for hashes, exact spans, classification, coverage, supersession, and fingerprints;
mutation tests for lost literal, globalized style, wrong containment, conditional removal, stale precedence, and omitted invariant;
end-to-end test: RAW.md -> draft SPEC -> completed SPEC -> validate -> receipt -> generated prompt;
drop-off tests proving new implementation packets cannot become ready without a valid spec;
legacy packet compatibility test;
instruction-size watchdog test;
existing ramble, PQC, drop-off, and watchdog suites remain passing.
Run the relevant existing package scripts discovered in the repo. Add clearly named scripts such as intent:validate, intent:receipt, intent:prompt, and intent:eval if they fit existing conventions.
Definition of done
This packet is done only when:
New implementation packets cannot reach ready status without valid verbatim provenance and an atomic spec.
Every atomic change has exact source evidence and deterministic assertions.
Unresolved contextual references produce a focused clarification instead of an invented requirement.
Codex prompts are generated from the spec and cannot drift independently.
All mandatory regression mutations fail for the intended reason.
Root project guidance is actually within its instruction budget, with all prior rules preserved in the documented migration.
Existing protocol/PQC/drop-off behavior remains compatible or has an explicit migration.
Changes are committed, pushed, and proposed through the repository's normal review path when credentials allow.
The final report lists files changed, commands/tests, before/after behavior, unresolved risks, commit SHA, and PR/deployment status. This protocol-only packet does not require a product deployment unless repository runtime tooling was changed and the normal release rules require it.
Do not mark this complete because documentation exists or fixtures are structurally valid. Demonstrate that each deliberately mistranslated mutation is rejected.
```
