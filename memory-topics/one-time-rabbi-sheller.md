# One Time / Rabbi Sheller Memory

- Workspace key: `rabbi_sheller_provider`.
- Project key: `one_time_mishnah_class`.
- View class for Rabbi admin work: `RABBI_PROVIDER_ADMIN`.
- Brand: black + yellow.
- GHL-like means first-party BNA CRM/product patterns only. Do not add GHL,
  LeadConnector, GHL env vars, GHL APIs, or external CRM writes.
- Classroom/content/community pipeline is provider-specific and separate from
  BNA Academy classroom/content/video records.
- The next UI cleanup work must start with `00-control-tower` and
  `01-current-state-visual-audit`, then split into focused implementation
  packets after audit and Definition of Ready.
- One Time email sender/reply-to is confirmed by Shloimie as
  `info@onetimeonetime.com`.
- Launch domain: `join.onetimeonetime.com` is the temporary campaign/launch
  domain. Do not mutate apex/root `onetimeonetime.com` until a later explicit
  migration packet.
- Deployment preference: same GitHub repo/codebase, but a separate One Time
  Railway project/service and separate One Time database are preferred.
- Launch offer: new users who sign up during the launch window receive 30 days
  free from signup.
- 30-day access includes live class, video library/replays, private questions
  to Rabbi, basic member/parent/student views, and attendance/progress basics.
- Attendance v1 is automatic class-link click tracking. Do not add manual
  attendance unless a later packet explicitly changes the model.
- Zoom link is member-gated, not public, click-tracked, and may be rotated per
  class/session later.
- Parent/student portal v1 stays simple: schedule, class link,
  clicked/attendance/progress, and questions. No chatbot and no public
  student-to-student posting.
- Existing paying users from Replit/old Stripe should be audited/migrated, not
  mass-canceled.
- WhatsApp direction is Whapi/WAPI. If Shloimie says "Wappy," map that to the
  existing Whapi/WAPI provider direction unless repo evidence proves a
  different provider.
- Rabbi needs his own WhatsApp provider account, phone number, API token,
  instance, and webhook before real or safe-test WhatsApp send packets.
- Vimeo belongs to Rabbi / One Time. Credentials belong in the BNA keyholder,
  not tracked files.
- Drive is intake/drop folder; Vimeo is hosting/player; OBS may save to a
  Google Drive synced folder for automatic ingestion.
- Failed media upload should create an internal task and alert Shloimie at
  `sdratler@gmail.com`.
- Send test/seed email to `sdratler@gmail.com` only when the final live link is
  ready.
