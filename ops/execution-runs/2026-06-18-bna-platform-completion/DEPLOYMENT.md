# Deployment

2026-06-19 approved release deployment:

- Operator approval was given for production env propagation, deployment,
  focused live smoke, and release closeout for the already implemented recovery
  work.
- Deployed commit:
  `22fcff0d9665cb9638e4835a20cd8a962d79a4a8`.
- Railway service/environment:
  `skillful-motivation` / `production`.
- First deployment:
  `43e590dd-934d-4ba1-98aa-02845b15b6bf`.
  Result: `CRASHED`. Root cause: clean deploy omitted the previously untracked
  runtime helper `src/lib/bna/telegram-runtime-status.js`, while `server.js`
  required it at startup.
- Fix commit:
  `22fcff0d Include Telegram runtime status helper in release`.
- Successful deployment:
  `f9921a2d-d614-44df-88c0-392d810ddebd`.
  Result: Railway `SUCCESS`; `scripts/railway-doctor.ps1` passed.
- Production env propagation completed before deploy for existing local
  keyholder secrets only: `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`,
  `ZOOM_CLIENT_SECRET`, `VIMEO_CLIENT_ID`, and `VIMEO_CLIENT_SECRET`.
  Propagation used secret-redacted output and Railway `--skip-deploys`.
- Not propagated or still blocked:
  Resend API key/from/domain/DNS values and Vimeo user-level upload/library
  access token or approved manual upload policy.
- No DNS change, email send, Zoom meeting creation, Vimeo upload, production
  DB mutation, broad crawl, watch loop, or agent-fleet loop was performed in
  this closeout.

Earlier deployment note:

2026-06-19 Agent Control Center note:

- Local implementation was added for Agent Control Center schema/API/UI/tests.
- This is not deployed.
- Do not deploy, run production migrations, or mutate production data until
  local DB/API/browser acceptance passes and Shloimie explicitly approves
  release/deployment.
- Because several Agent Control Center requirements are app-visible and marked
  `live_required`, they remain `needs_verification` or open rather than closed.
