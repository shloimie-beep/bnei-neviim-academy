# Batch Status

Record each batch, requirement ID, status, and next action.

| Batch | Requirement | Status | Evidence | Next Action |
| --- | --- | --- | --- | --- |
| 0-collision-proof | REQ-20260712-301 | Done | Commit/push `966ded41b`; BNA and One Time deploy-info readbacks; Rabbi Telegram live smoke; direct Agent Mode proof | Continue the active implementation batches. |
| 1-identity-isolation | REQ-20260712-305 | Done | Workspace-scoped identity code/tests deployed to BNA and One Time; live transaction-rollback proof passed with same email and same phone across `bna` and `rabbi_sheller_provider` | Continue `REQ-20260712-306` canonical contact aggregate service. |
| 2-shared-crm | REQ-20260712-302 | In progress | Shared CRM service/module slice pushed and deployed through hotfix SHA `bf0ec619b`; BNA/One Time deploy-info match; One Time route smoke passed; Operations CRM workbench live smoke passed with 12 scoped cards and read-only timeline | Continue dedicated contact workspace/actions and deeper parity batches. |
| 7-release-proof | REQ-20260712-314 | In progress | BNA/One Time Railway doctors, deploys, One Time smoke, signup no-write browser proof, API dry-run proof | Complete remaining matrix, screenshots, receipts, and final report after implementation batches. |
