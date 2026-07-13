# Next Session

Next unblocked batch: `5-one-time-channel-activation`
Open requirement: `REQ-20260713-902`

Latest One Time form runtime SHA: `881f892523eb9a20137377882e2452e45cd581ca`

Current proof:

- `3712308731910a6e77fb9a18ce18b57ae35f22dd` is pushed to `origin/master`.
- BNA production `https://bneineviimacademy.org/api/deploy-info` returns that SHA.
- One Time production was advanced for the P0 signup-form repair; `https://join.onetimeonetime.com/api/deploy-info` returned `881f892523eb9a20137377882e2452e45cd581ca`.
- One Time signup Family/School behavior has live no-write browser proof and API dry-run proof.
- `REQ-20260712-305` passed live transaction-rollback identity-isolation proof and is terminal Done.
- `REQ-20260712-302` has a deployed partial shared CRM service/module slice: canonical contact service wrapper, shared browser CRM modules, Operations shared CRM markers, customer-facing empty states/actions, action registry coverage, and One Time Operations CRM workbench live smoke with 12 scoped cards and read-only timeline.
- The first deployed shared-CRM slice exposed a live row-loader adapter bug; hotfix `bf0ec619b5ed10b2c057d5cf4f1553362d6614f4` fixed it by passing `pool` into `operationsCrmContactRows`.
- CRM URL-state slice is also deployed: `crm_contact`, `crm_search`, `crm_type`, `crm_status`, `crm_source`, `crm_tag`, `crm_sort`, and `crm_scroll` are wired locally and deployed through `f818822bb3969dca5d27f7c5a70d4dbf0baa8744`.
- Local update/no-auto-task slice is deployed: selected contact workspace exposes a local first-party update form and the server creates CRM follow-up tasks only when `create_follow_up_task` is explicitly true. Deployed through `224bc077919c624f115c264d35e35092ed4144da`.
- Explicit Create task action is deployed through `ded53274e31f91abff7944c094bdcdfaa9c55c5e`; the action creates a task only after an explicit click with `create_follow_up_task=true`.
- CRM workspace tabs are deployed through `1c4880418954d984c08683ba0955a32549eb33aa`; Overview, Activity, Conversations, Tasks, and Access render customer-facing panels and the One Time CRM workbench live smoke passed with 12 scoped cards and read-only selected timeline.
- Shared CRM contract/geometry is deployed under `REQ-20260712-302` through `909cb26d9a21a1e505ee30835ff31646b7c1c9cd`: the shared module owns `shared-crm-v1`, Operations emits shared component order/pane/breakpoint/back-control data attributes, BNA deployment `d5771dd9-f35a-4610-b382-e15afe4a885e` and One Time deployment `279b82a0-a726-4493-a4f6-23ed409b487d` reached `SUCCESS`, and the One Time live CRM workbench smoke passed.
- Identity/Family workspace tabs are deployed under `REQ-20260712-302` through `d1c0d3a596ad420876941445faad9f1e60c7ce48`: the shared tab registry exposes enabled `Identity` and `Family` tabs, BNA deployment `32cd90dd-38cf-4398-93db-6af86939deeb` and One Time deployment `00290796-3917-4269-b573-981cf0ff7206` reached `SUCCESS`, and the One Time live CRM workbench smoke passed.
- Add Contact is deployed under `REQ-20260712-303` through `de48d8aef8b4764b5144a89edef9e269c102c25f`: the form is registered as `ACTION-CRM-ADD-CONTACT`, POST `/api/bna/crm/contacts` is workspace-scoped, identities are workspace-scoped, no external send/access/import/task creation runs, and the One Time live CRM workbench smoke passed after deploy.
- Archive Contact is deployed under `REQ-20260712-303` through `3293d3528ace28938d5f13d8b65b485448c9ebc9`: the action is registered as `ACTION-CRM-ARCHIVE-CONTACT`, uses the scoped CRM PATCH path with `status=archived`, `create_follow_up_task=false`, and no external-write flags, BNA deployment `d454d665-4e81-43d7-868e-8c02888c0080` and One Time deployment `e4883410-13ce-4ad8-8d59-db5fc50effd4` reached `SUCCESS`, and the One Time live CRM workbench smoke passed.
- Complete/Reopen task is deployed under `REQ-20260712-303` through `ec1e893848f12242a30fd1fc59c236442997f30e`: the Tasks tab exposes `ACTION-CRM-COMPLETE-TASK` and `ACTION-CRM-REOPEN-TASK` for linked follow-up tasks, uses scoped `PATCH /api/bna/tasks/:id`, BNA deployment `3b43615c-3fde-4fad-bb1c-326baed500aa` and One Time deployment `8f022587-8b8e-474e-8c59-886b68e18faa` reached `SUCCESS`, the One Time live CRM workbench smoke passed, and deployed JS/CSS marker checks confirmed the controls.
- Link member is deployed under `REQ-20260712-303` through `8ea9b798fe9187fbb5f311fbd6073b49f1befcf3`: Access/Family tabs expose `ACTION-CRM-LINK-MEMBER`, the explicit click creates only a disabled first-party member shell (`access_status=paused`, `access_enabled=false`) with no portal link, class link, library access, send, payment, import, or external CRM write, direct contact aggregate email fallback rollups are now project-scoped by workspace before showing communications, support, tasks, or membership, BNA deployment `91234f89-084d-4dc0-bc8b-4de7fbd33325` and One Time deployment `dc45500e-960c-4adf-8e78-dcb92a2a725c` reached `SUCCESS`, and the One Time live CRM workbench smoke passed.
- One Time bot/landing polish v2 is deployed under `REQ-20260712-310` through `3712308731910a6e77fb9a18ce18b57ae35f22dd`: the WhatsApp bot profile version `2026-07-13-v2` explicitly says "We are not giving portal access yet," the public landing/signup header and yellow CTA polish is live, BNA deployment `77191e2f-0aaf-4fde-ae2c-cf69ce299af8` and One Time deployment `38d75556-5a94-42d3-b8b3-65a5a3290fe7` reached `SUCCESS`, both deploy-info endpoints returned the SHA, and One Time route/landing smokes plus deployed marker checks passed.
- One Time signup-form P0 is deployed under `REQ-20260713-901` through `881f892523eb9a20137377882e2452e45cd581ca`: Family/School are real `audience_type` radios, reminders have no default, phone/consent validation is conditional, No reminders no longer requires consent or phone, server-side validation matches the form, canonical One Time CRM contact capture is wired, and zero automatic CRM tasks are created. One Time Railway deployment `35633776-51a0-4185-9bd0-61d73c187d45` reached `SUCCESS`; exact-SHA route smoke, browser no-write/intercept submit, and direct API dry-run passed.
- Cleanup note: one attempted synthetic live-write DB-readback created `bna_contacts:37` and `bna_parent_leads:22` and both were archived through the production CRM API with `no_send=true` and `external_write_performed=false`. Local DB-level outbox cancellation/readback is blocked because the usable One Time Railway database URL is internal-only from this machine, while the stale local Supabase URL still fails DNS.

Continue by inspecting and repairing:

- Wave 2 public One Time WhatsApp lead agent (`REQ-20260713-902`), using the deployed form as the signup/contact-capture baseline;
- continue remaining dedicated CRM workspace/actions and component parity under `REQ-20260712-302` / `REQ-20260712-303`, especially family/student linking;
- canonical CRM contact aggregate service boundaries;
- list, aggregate, timeline, conversations, and tasks DTOs;
- server-side reconciliation of contacts, parent leads, signups, students, members, access, attendance, lifecycle, communications, notes, tasks, tickets, and suppression/opt-out records;
- stable `contact_key` API/URL identity;
- tests proving browser code is not unioning independent datasets.

Do not start broad CRM UI edits until the current-state/PQC requirements for UI surfaces are recorded and validated.

Full production readiness remains blocked only by external Stripe/campaign setup fields listed in `ops/production-readiness/latest-production-unblocker.md`.
