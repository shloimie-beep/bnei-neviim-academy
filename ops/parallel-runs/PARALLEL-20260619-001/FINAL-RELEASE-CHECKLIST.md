# Final Release Checklist

Local complete:

- Worker branches merged in required order.
- Shared files wired.
- W4 completed locally.
- Full local test suite passed.
- Secret audit passed.
- Watchdog audit passed.
- Final evidence files written.

Before release:

- Operator approves release scope.
- Commit is pushed and PR/review path is approved.
- Railway deploy is approved.
- Production DB migration is approved and backed up.
- Railway doctor passes.
- Live public smoke passes.
- Live Operations authenticated smoke passes.
- One Time owner/admin smoke passes.
- BNA vs One Time data-isolation smoke passes.
- Vimeo/Zoom/Resend live checks are approved separately.

Explicitly not performed in Prompt 05:

- Push.
- PR.
- Deploy.
- Railway mutation.
- DNS mutation.
- Production DB mutation.
- Live email.
- Vimeo upload.
- Zoom meeting mutation.
- Secret copy or rotation.
