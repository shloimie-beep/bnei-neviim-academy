# Google Drive Walkthrough

Purpose: Drive source selection, read-only validation, class-intake recovery,
memory/content sync, and guarded backfill handoff.

1. Open `/integration-setup.html#google-drive`.
2. Open https://console.cloud.google.com/apis/credentials.
3. Choose the target before credentials:
   - Drive folder ID;
   - Drive file ID;
   - or approved content-job range.
4. Choose the auth path:
   - local OAuth refresh token for owner-run diagnostics;
   - Railway worker variables for deployed worker readback;
   - service account only if the folder is explicitly shared to that account.
5. Use the minimum approved scope. Start with identity/read-only where
   possible; use `drive.file` or metadata/read-only when enough.
6. Required variable names:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI`
   - `GOOGLE_REFRESH_TOKEN`
   - `GOOGLE_SCOPES`
   - `GOOGLE_DRIVE_PIPELINE_ROOT_NAME`
   - `GOOGLE_DRIVE_PIPELINE_FOLDER_ID`
   - `GOOGLE_DRIVE_PIPELINE_CONFIG`
7. The system chooses the canonical path in this order:
   - explicit `GOOGLE_DRIVE_PIPELINE_CONFIG`;
   - explicit `GOOGLE_DRIVE_PIPELINE_FOLDER_ID`;
   - approved folder/file ID provided in the diagnostic handoff;
   - no canonical path, status `Missing target`.
8. Run `npm run drive:audit`.
9. Run `npm run owner-review:external-readiness` for class-intake diagnostic.
10. Expected success: read-only folder/config status, granted scopes, and
    no-write class-intake routing evidence.
11. External effects: read-only Drive API calls only.
12. Shloimie should click the exact Drive folder/file, copy its ID, and decide
    whether Codex may read that target.
13. Codex verifies folder access, scope status, parser routing, and no-write
    behavior.
14. Guarded backfill is a separate handoff. It needs source IDs, expected rows,
    rollback plan, approval, and live smoke before any mutation.

Live acceptance requires read-only validation, approved target, scoped auth,
and a separate approved backfill if production records must change.
