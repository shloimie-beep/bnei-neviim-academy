# Buffer Social Scheduler Walkthrough

Purpose: approved social draft/post scheduling for Facebook, LinkedIn, and
YouTube text outputs.

1. Open `/integration-setup.html#buffer-social`.
2. Open https://buffer.com/publish.
3. Confirm the organization.
4. Confirm each channel ID.
5. Use these variable names:
   - `BUFFER_API_KEY`
   - `BUFFER_API_BASE`
   - `BUFFER_ORGANIZATION_ID`
   - `BUFFER_DEFAULT_CHANNEL_IDS`
   - `BUFFER_FACEBOOK_CHANNEL_ID`
   - `BUFFER_LINKEDIN_CHANNEL_ID`
   - `BUFFER_YOUTUBE_CHANNEL_ID`
6. Store the key only in approved secret storage.
7. Run `node --test tests/communications-integrations-contract.test.js`.
8. Expected success: health/channel paths are present and secret fields stay
   hidden.
9. External effects: channel listing is read-only; draft/schedule calls create
   Buffer objects only after explicit approval.
10. Live acceptance requires channel readback, approved draft creation, and no
    accidental publish.
