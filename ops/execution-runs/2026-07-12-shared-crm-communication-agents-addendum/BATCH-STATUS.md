# Batch Status

Record each batch, requirement ID, status, and next action.

| Batch | Requirement | Status | Evidence | Next Action |
| --- | --- | --- | --- | --- |
| 0-collision-proof | REQ-20260712-301 | Done | Commit/push `966ded41b`; BNA and One Time deploy-info readbacks; Rabbi Telegram live smoke; direct Agent Mode proof | Continue the active implementation batches. |
| 1-identity-isolation | REQ-20260712-305 | Done | Workspace-scoped identity code/tests deployed to BNA and One Time; live transaction-rollback proof passed with same email and same phone across `bna` and `rabbi_sheller_provider` | Continue `REQ-20260712-306` canonical contact aggregate service. |
| 2-shared-crm | REQ-20260712-302 | In progress | Shared CRM service/module slice pushed and deployed through hotfix SHA `bf0ec619b`; URL-state slice deployed through `f818822bb`; local update/no-auto-task slice deployed through `224bc077`; explicit Create task action slice deployed through `ded53274`; enabled workspace tabs local slice verified with focused tests `35/35`, tab-clicking local smoke, action watchdog, protocol drift, secret audit, and run validation | Commit/push/deploy the enabled workspace tabs slice, then continue remaining dedicated workspace/actions and deeper parity batches. |
| 4-agent-model-runtime | REQ-20260712-310 | In progress | Bot-knowledge/access-claim slice and public landing header/button/mobile CTA polish deployed at `301b408b`; BNA deployment `640fc22a` and One Time deployment `2c2c7631` reached `SUCCESS`; BNA/One Time deploy-info match; One Time live route and landing smokes passed | Continue full shared WhatsApp/email communication-agent model, knowledge bundle, and channel bindings. |
| 7-release-proof | REQ-20260712-314 | In progress | BNA/One Time Railway doctors, deploys, One Time smoke, signup no-write browser proof, API dry-run proof | Complete remaining matrix, screenshots, receipts, and final report after implementation batches. |
