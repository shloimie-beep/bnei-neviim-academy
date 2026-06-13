# Prompt Patch Libraries

This folder holds reusable prompt patches for content systems that need more
structure than a single platform prompt.

Use these files when a prompt should be improved in repeatable modules, for
example camera direction, aspect ratio, theme, platform, audience, privacy, or
project scope. The patches are prompt context, not random notes.

## Current Libraries

- `rabbi-video-content/`: One Time Mishnah Class and Rabbi Elie Scheller video
  generation patches for camera coverage, platform ratios, Mishnayos/Jewish
  visuals, source-sheet hooks, ad-candidate clips, and guardrails.

## Use Rules

1. Start from the relevant library `README.md`.
2. Choose a named stack when possible.
3. Add only the patches that match the output target.
4. Keep project scoping patches before style/camera patches.
5. Keep factuality, privacy, and Torah-source guardrails in every stack.
6. If an operator correction becomes durable, add it as a new patch or revise
   the existing patch, then note the change in the changelog.
