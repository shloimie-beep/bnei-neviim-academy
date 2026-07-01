# Context Budget And Packet Splitting

Prompt size and implementation blast radius are first-class protocol concerns.

## Limits

- A Codex implementation packet may not touch more than one major product
  surface unless it is audit/spec only.
- A Codex implementation packet should not edit more than four high-risk files
  unless explicitly justified.
- A UI implementation packet should not contain more than twelve requirements.
- A prompt-generation packet that exceeds the size limit must split into child
  packets.
- Do not paste huge unstructured Markdown prompt dumps into Codex.
- Use a parent manifest and child packets.
- Include only files relevant to the packet.
- Use repo maps, route maps, action maps, and surface maps for broad context
  instead of dumping every file.
- If a packet needs more context, create a research/audit packet first.

## Required Context Budget Fields

Every Product Quality Compiler packet must declare:

- `estimated_prompt_size`;
- `source_files_to_read`;
- `files_allowed_to_edit`;
- `max_files_to_edit`;
- `max_routes_to_touch`;
- `max_major_surfaces`;
- `split_threshold_reason`;
- `split_if_exceeds`;
- `context_risk_level`.

## Split Triggers

Split the packet when any of these happen:

- more than one major product surface is implementation scope;
- more than twelve requirements are implementation scope;
- more than three routes need implementation in one pass;
- more than four high-risk files need edits;
- frontend and backend changes are both broad;
- provider setup appears inside UI cleanup;
- the packet needs audit, implementation, verifier, and deploy all at once;
- the packet cannot fit with relevant source files and evidence.

Splitting is a success state, not a failure. It preserves context quality and
keeps Codex execution packets independently runnable.
