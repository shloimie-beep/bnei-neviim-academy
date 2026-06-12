# Legacy Backup Plan

Before changing or importing anything:

1. Identify the current production app/source.
2. Export or clone code if access allows it.
3. Export database/member records if an export exists.
4. Export lesson/video metadata.
5. Export question/comment/thread records if available.
6. Export payment/access status if available.
7. Save redacted screenshots of admin settings.
8. Record app URLs and login/access flows.

Backup destinations:

- Audit/import repo if approved: `sdratler/OneTimeOneTime`
- Non-secret files: approved Drive folder
- Secrets: password manager or one-time secret link only

Do not overwrite live production state during backup.
