# Google Workspace Add-ons Walkthrough

Purpose: optional Calendar, Classroom, Business Profile, Maps, and Places
features surfaced in Operations.

1. Open `/integration-setup.html#google-workspace-addons`.
2. Open https://console.cloud.google.com/auth/scopes.
3. Decide the single Google feature being enabled.
4. Add only the scope required for that feature.
5. Use these variable names:
   - `GOOGLE_SCOPES`
   - `GOOGLE_MAPS_API_KEY`
   - `GOOGLE_PLACES_API_KEY`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REFRESH_TOKEN`
6. Run `npm run drive:audit`.
7. Expected success: scope status shows the requested feature and no unrelated
   broad Google access.
8. Expected missing permission: the card remains `Missing account permission`
   until scope and consent are complete.
9. External effects: read-only API calls only unless a separate write approval
   is recorded.
10. Live acceptance requires feature-specific readback and separate approval
    for calendar/classroom/profile writes.
