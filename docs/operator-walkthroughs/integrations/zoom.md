# Zoom Walkthrough

Purpose: live class meeting previews, Server-to-Server OAuth, registrants,
attendance webhooks, recordings, transcripts, and future live meeting creation.

1. Open `/integration-setup.html#zoom`.
2. Open https://marketplace.zoom.us/develop/create.
3. Create or confirm a Server-to-Server OAuth internal app.
4. Use these variable names:
   - `ZOOM_ACCOUNT_ID`
   - `ZOOM_CLIENT_ID`
   - `ZOOM_CLIENT_SECRET`
   - `ZOOM_WEBHOOK_SECRET`
   - `ZOOM_ACCOUNT_OWNER`
   - `ZOOM_HOST_USER`
   - `ZOOM_SCOPES`
5. Confirm required meeting/user/report scopes in the Zoom dashboard.
6. Confirm host user and license state.
7. Run `node --test tests/one-time-zoom-automation.test.js tests/integrations/w4-onetime-readiness.test.js`.
8. Expected success: preview and local readiness pass without meeting creation.
9. External effects: local tests perform no Zoom write. Token readback is
   read-only. Meeting creation is separate.
10. Live acceptance requires owner/admin app install, scope readback, host
    proof, live meeting smoke, webhook signature proof, and no exposure of
    host start URLs to students.
