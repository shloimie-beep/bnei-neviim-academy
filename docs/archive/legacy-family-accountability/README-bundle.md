# Family Accountability App — Build Bundle

Hand this folder to Claude Code. It contains everything needed to build the app in one session.

## What this is

A family accountability tracker for Menachem and Esther.

- **Kids' side:** Each kid logs in on their own tablet (one Android, one iPad), sees the goals set at the latest family meeting, checks them off, and adds proof (note or photo).
- **Parents' side:** Shloimie and Ahuva see everything via a web dashboard and a shared Telegram bot. Daily 10pm email summary to Ahuva.
- **Hebrew/English toggle** on the kid side.
- Runs on Shloimie's existing Railway + Supabase setup. New Railway project, new Supabase project — fully isolated from WebCraft Media infra.

## Files in this folder (read in order)

1. **`CLAUDE_CODE_PROMPT.md`** — The actual prompt. Paste this into Claude Code at the start of the session.
2. **`SPEC.md`** — Full functional spec. The contract for what to build.
3. **`ARCHITECTURE.md`** — System design, data flow, all the technical decisions.
4. **`DESIGN.md`** — Aesthetic direction so the UI looks intentional and beautiful, not generic.
5. **`SETUP.md`** — Step-by-step setup: Ahuva's Telegram walkthrough, env vars, Railway deploy, Supabase setup.
6. **`supabase-schema.sql`** — Run this in the Supabase SQL editor on day one.
7. **`package.json`** — Locked dependency list.
8. **`.env.example`** — Required environment variables.

## Workflow for Shloimie

1. Drop this folder into Google Drive.
2. On your Windows machine, open Claude Code in the folder.
3. Open `CLAUDE_CODE_PROMPT.md`, copy the contents, paste into Claude Code.
4. Claude Code will build the project. Follow `SETUP.md` for Supabase, Railway, Telegram bot, email service.
5. Send Ahuva the relevant section of `SETUP.md` for her tablet install.

## Project name

`family-accountability` (used for Railway project name and Supabase project name).
