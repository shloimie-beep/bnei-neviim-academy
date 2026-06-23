# Service Provider Studio Prompt Engine

The prompt engine lives in `src/lib/bna/service-provider-studio.js` and is exposed through `/api/bna/studio/projects/:id/prompt-compile`.

## Layer Model

Compiled prompts are ordered layers:

- `system_policy`: BNA Studio policy, tenant scope, no invented approvals, no send/publish.
- `workspace_defaults`: current workspace, project key, audience, and output format.
- `project_brief`: goal, tone, visual style, and target audience.
- `character_bible`: provider/class/persona facts if supplied.
- `source_context`: source text inside `UNTRUSTED_SOURCE_BEGIN` and `UNTRUSTED_SOURCE_END`.
- `scene_instruction`: one scene or all-scenes instruction.
- `correction_patch`: reversible operator patch layers.
- `output_contract`: structured JSON contract and no-send rule.
- `renderer_contract`: mock-render contract until a live adapter is explicitly approved.

## Injection Defense

Source text is never treated as instructions. It is normalized, hashed, stored as source provenance, then inserted only inside an untrusted source layer. Tests assert that the compiled prompt includes the delimiter boundary and the system policy warning.

## Persistence

Prompt layers are stored in `bna_studio_prompt_layers` with type, key, content, version, lock flag, hash, metadata, creator, and timestamps. Compiled prompt strings are returned to the UI for operator review; the persisted layers are the canonical reusable record.
