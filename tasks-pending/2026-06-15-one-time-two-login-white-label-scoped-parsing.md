# One Time Two-Login + White-Label + Scoped Parsing

**Created:** 2026-06-15 by Kimi
**Source:** `kimi-one-time-rabbi-whatsapp-workspace-handoff.md`
**Status:** Local Complete — Deploy Pending Clean Window

## Goal
Implement the Kimi handoff for the One Time Rabbi Workspace:
1. Two-login architecture (owner Rabbi + manager Shloimie)
2. WhatsApp ownership table
3. White-label branding table
4. Contact identity accuracy
5. Scoped meeting-note parsing

## Implementation Checklist

### Phase 1: Database Tables — DONE
- [x] `bna_workspace_integrations` — WhatsApp ownership, sync status
- [x] `bna_project_branding` — colors, logo, workspace name override
- [x] `bna_contact_identity_audit` — name resolution audit trail
- [x] `bna_workspace_notes` + `bna_workspace_note_items` — scoped meeting notes

### Phase 2: Auth (server.js) — DONE
- [x] Add `ONE_TIME_OWNER_USERNAME` / `ONE_TIME_OWNER_PASSWORD` env vars
- [x] Add `ONE_TIME_MANAGER_USERNAME` / `ONE_TIME_MANAGER_PASSWORD` env vars
- [x] Backward compatibility: old `ONE_TIME_OPS_USERNAME` → manager role
- [x] `identifyOpsUser()` returns `role: 'project_owner'` for Rabbi
- [x] `identifyOpsUser()` returns `role: 'project_manager'` for Shloimie
- [x] Privacy boundary: owner/manager both scoped to `one_time_mishnah_class`
- [x] `isScopedOpsPathAllowed()` restricts manager from owner-only paths

### Phase 3: Contact Identity — DONE
- [x] `actualContactNameFromSources()` helper
- [x] Precedence: explicit signup > verified local > GHL real name > WhatsApp real > payment real > fallback
- [x] Never use tags/source/stage/pipeline as display name
- [x] `looksLikePlaceholderName()` rejects "school interest", "new lead", etc.

### Phase 4: Parser Scoping — DONE
- [x] `generateMixedRecordingParse()` system prompt updated with workspace scoping
- [x] `inferProjectKeyFromTranscript()` defaults project to `one_time_mishnah_class` when Rabbi/Sheller/One Time/Mishnah mentioned
- [x] `inferParticipantsFromTranscript()` for Shloimie+Rabbi meetings
- [x] Tasks auto-assigned guidance in parser prompt
- [x] Do NOT route to BNA Students/Accounting unless explicitly admin content

### Phase 5: White-Label — DONE
- [x] `public/operations.html` fetches branding from `/api/bna/workspace-settings/:key/branding`
- [x] Header shows workspace name + current user + role
- [x] Scoped login does not look like BNA global admin
- [x] Placeholder theme structure with TODOs for exact assets
- [x] `currentWorkspaceRoleLabel()` shows "Workspace Owner" / "Workspace Manager"

### Phase 6: Tracking — DONE
- [x] Append `ops/agent-task-ledger.jsonl`
- [x] Update `ops/agent-changelog.md`
- [x] Update `SYSTEM-STATE.md`
- [x] Update `TASKS.md`

## Decisions Needed
- Exact hex colors for One Time brand (placeholder: `#1E3A5F` primary, `#F5A623` accent)
- Logo image URL (placeholder: none, falls back to workspace name)
- Rabbi's confirmed WhatsApp phone number for `bna_workspace_integrations`
- Whether manager should have `settings` access (currently: no)

## Risks
- Dirty worktree: broad `npm test` blocked by unrelated drift. Test individual changed files only.
- No deploy run yet. Schema readback and live smoke pending clean window.
- Kimi is implementer; Codex remains visible task/deploy owner per AGENTS.md.

## Files Changed
- `server.js` — auth, tables, helpers, API endpoint, parser prompt
- `public/operations.html` — branding fetch, white-label header rendering
- `.env.example` — new env vars documented
- `ops/agent-task-ledger.jsonl` — task progress logged
- `ops/agent-changelog.md` — changelog entry
- `SYSTEM-STATE.md` — state entry
- `TASKS.md` — task queue entry
