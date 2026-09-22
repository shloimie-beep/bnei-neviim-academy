# Vimeo Walkthrough

Purpose: private video hosting, manual URL attachment, synthetic upload test,
folder selection, private playback, and member-library acceptance.

1. Open `/integration-setup.html#vimeo`.
2. Open https://developer.vimeo.com/apps.
3. Create or confirm the Vimeo app.
4. Confirm the token owner and account owner.
5. Use these variable names:
   - `VIMEO_CLIENT_ID`
   - `VIMEO_CLIENT_SECRET`
   - `VIMEO_ACCESS_TOKEN`
   - `VIMEO_WEBHOOK_SECRET`
   - `VIMEO_ACCOUNT_ID`
   - `VIMEO_PLAN`
   - `VIMEO_FOLDER`
   - `VIMEO_ALLOWED_EMBED_DOMAINS`
   - `BNA_VIDEO_HOST_PROVIDER`
   - `BNA_VIDEO_HOST_ACCOUNT_OWNER`
6. Required scopes: token must support private video readback and upload only
   if an upload smoke is approved.
7. Select a test folder before any upload.
8. Prepare a synthetic non-sensitive asset.
9. Run `npm run owner-review:external-readiness` first.
10. Expected credential-free success: manual URL attach and upload-intent
    preview pass without provider upload.
11. After approval, run token auth, folder list, private upload, and playback
    test.
12. External effects: the approved upload test creates one private synthetic
    Vimeo asset and may consume account quota.
13. Playback test must verify the intended embed/playback state, not just that
    upload returned an ID.
14. Live acceptance requires token/app owner proof, scope proof, folder proof,
    private upload proof, playback proof, member-library approval gate, and
    rollback/unpublish proof.
