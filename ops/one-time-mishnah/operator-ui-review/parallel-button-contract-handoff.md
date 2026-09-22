# Parallel Button Contract Handoff

Date: 2026-06-26

## Branch / Worktree

- Branch: `codex/parallel-onetime-button-contract-20260626`
- Worktree: `C:\Users\User\Documents\Codex\2026-06-26\parallel-onetime-button-contract`
- Lane: One Time Button State / Action Contract
- Scope honored: local-only; no push, no merge, no deploy, no production mutation, no external writes/sends/charges/Zoom/Vimeo/DNS/Railway/GHL/CRM writes.

## Files Added

- `src/platform/instances/one-time-action-state-contract.js`
- `tests/one-time-action-state-contract.test.js`
- `ops/watchdog-audits/2026-06-26T08-16-watchdog-action-audit.md` local watchdog evidence, zero findings.

## Contract Summary

The new pure module exports:

- `ONE_TIME_ACTION_STATES`
- `ONE_TIME_BUTTON_CONTRACTS`
- `getOneTimeButtonState(actionKey, context)`
- `isOneTimeExternalWriteAction(actionKey)`
- `getOneTimeBlockedReason(actionKey, context)`
- `getOneTimeActionDisplay(actionKey, context)`
- `assertOneTimeButtonContractCoverage(registryData?)`

All contracts include label, action key/id, UI state, click outcome, handler/API/helper route where known, `external_write_performed: false`, blocker message, blocker owner where applicable, workspace/project scope for first-party writes, and expected tests.

## Controls Covered / States Assigned

| Control | Action | State | External/app-visible write | Blocker owner |
| --- | --- | --- | --- | --- |
| Add Member / Invite User | `one_time.workspace_user.invite_no_send` | Ready | no | Shloimie |
| Assign Role | `one_time.workspace_user.assign_role` | Ready | no | Shloimie |
| Deactivate / Reactivate / Remove Membership | `one_time.workspace_user.lifecycle` | Ready | no | Shloimie |
| Add Task | `one_time.tasks.add` | Ready | no | - |
| Create Decision | `one_time.decisions.create` | Ready | no | - |
| Add Class | `one_time.class_package.create` | Ready | no | - |
| Add Session | `one_time.classroom.assignment.create` | Ready | no | - |
| Add Appointment setup | `one_time.appointment.setup_task` | Needs Shloimie setup | no | Shloimie |
| Save / Attach Vimeo Video | `one_time.class_package.attach_vimeo` | Ready | no | - |
| Preview Upload | `one_time.class_package.preview_upload` | Preview only | no | - |
| Approve | `one_time.member_library.approve` | Needs Rabbi decision | no | Rabbi Elie Scheller |
| Publish | `one_time.member_library.publish` | Needs Rabbi decision | yes, gated | Rabbi Elie Scheller |
| Unpublish / Restore Latest | `one_time.member_library.rollback` | Needs Rabbi decision | yes, gated | Rabbi Elie Scheller |
| Retry setup | `one_time.recording.retry_setup` | Internal support only | no | Shloimie |
| Post Rabbi Thread | `one_time.classroom.thread.create` | Ready | no | - |
| Approve / Feature / Parent Hold / Reject | `one_time.classroom.message.review` | Ready | no | Rabbi Elie Scheller |
| Configure Integration | `one_time.integrations.configure` | Needs Shloimie setup | no | Shloimie |
| Test Connection | `one_time.integrations.test_connection` | Blocked external setup | no | Shloimie |
| Create Draft | `one_time.communications.create_draft` | Ready | no | - |
| View Evidence | `one_time.agent_run.view_evidence` | Internal support only | no | - |
| Archive / Restore | `one_time.tasks.archive_restore` | Ready | no | Shloimie |
| Ask / Search | `ACTION-OPERATIONS-HELPER-OPEN` | Internal support only | no | - |
| View One Time as Rabbi | `ACTION-ONETIME-WORKSPACE-VIEW` | Ready | no | - |
| Create automation with helper | `ACTION-HELPER-CREATE-AUTOMATION` | Internal support only | no | Shloimie |
| Preview Drive Brief | `ACTION-ONETIME-DRIVE-BRIEF-PREVIEW` | Preview only | no | - |
| Package Preview | `preview_one_time_member_library_publish_package` | Preview only | no | - |
| Run Smoke | `ACTION-ONETIME-MEMBER-LIBRARY-SMOKE` | Internal support only | no | Shloimie |
| Preview Package | `ACTION-ONETIME-CLASS-PACKAGE-PREVIEW` | Preview only | no | - |
| Member Preview | `ACTION-ONETIME-MEMBER-LIBRARY-PREVIEW` | Preview only | no | - |
| Approve | `ACTION-ONETIME-MEMBER-LIBRARY-APPROVE` | Needs Rabbi decision | no | Rabbi Elie Scheller |
| Publish | `ACTION-ONETIME-MEMBER-LIBRARY-PUBLISH` | Needs Rabbi decision | yes, gated | Rabbi Elie Scheller |
| Rollback Latest | `ACTION-ONETIME-MEMBER-LIBRARY-ROLLBACK` | Needs Rabbi decision | yes, gated | Rabbi Elie Scheller |
| Dry-run send | `ACTION-ONETIME-LIVE-ZOOM-LINK-DRY-RUN` | Preview only | no | - |
| Send links | `ACTION-ONETIME-LIVE-ZOOM-LINK-SEND` | Needs Rabbi decision | yes, gated | Rabbi Elie Scheller |
| Generate Access Code | `ACTION-PARENT-ACCESS-CODE-GENERATE` | Needs Shloimie setup | no | Shloimie |
| Open Parent Portal | `ACTION-PARENT-ACCESS-LINK-OPEN` | Preview only | no | - |
| Email Login Link | `ACTION-PARENT-ACCESS-LINK-EMAIL` | Needs Shloimie setup | yes, gated | Shloimie |
| WhatsApp Login Link | `ACTION-PARENT-ACCESS-LINK-WHATSAPP` | Needs Shloimie setup | yes, gated | Shloimie |
| Preview Password Setup | `ACTION-PARENT-PASSWORD-SETUP-PREVIEW` | Preview only | no | - |
| Email Password Setup | `ACTION-PARENT-PASSWORD-SETUP-SEND` | Needs Shloimie setup | yes, gated | Shloimie |

## Guardrails Encoded

- Preview-only controls explicitly state no production write.
- Approval-gated controls name the exact gate/confirmation.
- External/app-visible write controls are not `Ready`, have `approval_gated: true`, and keep `external_write_performed: false`.
- Internal support controls set `hide_from_rabbi_owner_view: true`; `getOneTimeActionDisplay(..., { viewer_role: 'rabbi_owner' })` returns `hidden: true`.
- First-party scoped writes include `workspace_key: rabbi_sheller_provider` and `project_key: one_time_mishnah_class`.
- No contract enables direct sends, charges, Zoom mutations, or Vimeo mutations.

## Registry Gaps

The isolated branch was created from tracked HEAD. The requested read-only coverage files existed only as untracked files in the source checkout, not in this new worktree:

- `ops/action-registry/one-time-action-coverage.md`
- `ops/action-registry/one-time-action-coverage.json`

Those coverage files show all 40 controls covered as of 2026-06-23, but the tracked registry files in this worktree currently include only these requested hook IDs:

- `ACTION-OPERATIONS-HELPER-OPEN`
- `ACTION-HELPER-CREATE-AUTOMATION`
- `ACTION-ONETIME-DRIVE-BRIEF-PREVIEW`
- `preview_one_time_member_library_publish_package`

Tracked registry rows still missing in this lane:

- `ACTION-ONETIME-WORKSPACE-VIEW`
- `ACTION-ONETIME-MEMBER-LIBRARY-SMOKE`
- `ACTION-ONETIME-CLASS-PACKAGE-PREVIEW`
- `ACTION-ONETIME-MEMBER-LIBRARY-PREVIEW`
- `ACTION-ONETIME-MEMBER-LIBRARY-APPROVE`
- `ACTION-ONETIME-MEMBER-LIBRARY-PUBLISH`
- `ACTION-ONETIME-MEMBER-LIBRARY-ROLLBACK`
- `ACTION-ONETIME-LIVE-ZOOM-LINK-DRY-RUN`
- `ACTION-ONETIME-LIVE-ZOOM-LINK-SEND`
- `ACTION-PARENT-ACCESS-CODE-GENERATE`
- `ACTION-PARENT-ACCESS-LINK-OPEN`
- `ACTION-PARENT-ACCESS-LINK-EMAIL`
- `ACTION-PARENT-ACCESS-LINK-WHATSAPP`
- `ACTION-PARENT-PASSWORD-SETUP-PREVIEW`
- `ACTION-PARENT-PASSWORD-SETUP-SEND`

No registry edits were made in this lane to avoid conflicting with parallel registry work.

Additional existing One Time registry rows outside the requested hook list that should be considered during final integration:

- `ACTION-ONETIME-JOIN-SHIR-CTA`
- `ACTION-ONETIME-INTEREST-FORM`
- `ACTION-ONETIME-MEMBER-LOGIN-LINK`
- `ACTION-ONETIME-SCOPED-AGENT-STATUS`
- `create_one_time_video_library_item`

## Tests Run

- `node --test tests/one-time-action-state-contract.test.js` PASS, 6/6.
- `npm run watchdog:actions` PASS, zero findings. Evidence: `ops/watchdog-audits/2026-06-26T08-16-watchdog-action-audit.md`.
- `node --test tests/watchdog-action-registry.test.js` PASS, 2/2.

Note: `tests/watchdog-action-registry.test.js` intentionally creates a missing-action fixture; the real watchdog was rerun afterward so the saved local report shows zero findings.

## Final Integration Instructions

1. Import `getOneTimeActionDisplay()` into the Operations UI integration layer and render state labels, disabled reasons, and no-write text next to One Time/Rabbi scoped controls.
2. Hide controls where `display.hidden === true` for Rabbi owner view; keep them available only to internal support/admin roles.
3. Use `isOneTimeExternalWriteAction()` to force external/app-visible writes through explicit confirmation flow only. Do not make these direct click actions.
4. Add or import the missing registry hook rows in the integration lane, then run `assertOneTimeButtonContractCoverage({ rootRegistry, detailedRegistry })` inside the action watchdog or a registry contract test.
5. Re-run the One Time UI smoke/member-library/live-class/parent-login tests after UI integration. Deploy/live smoke belongs to the final integration lane, not this local-only lane.

## No-Push Confirmation

No push, merge, deploy, Railway action, production mutation, external write, send, charge, Zoom/Vimeo action, DNS change, or GHL/CRM write was performed.
