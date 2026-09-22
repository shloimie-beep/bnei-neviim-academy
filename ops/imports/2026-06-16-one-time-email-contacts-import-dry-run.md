# One Time Subscribers Import - 2026-06-16

- Mode: dry-run
- Batch: `one-time-email-contacts-2026-06-16`
- Source file: `subscribers.csv`
- Target project: `one_time_mishnah_class`
- Target workspace: `rabbi_sheller_provider`
- Project id: (dry-run)
- Started: 2026-06-16T17:04:02.370Z
- Completed: 2026-06-16T17:04:02.372Z

## Counts

- Source rows: 88
- Valid unique email contacts: 88
- Skipped invalid rows: 0
- Duplicate rows skipped: 0
- Inserted leads: 0
- Updated leads: 0
- Import communications inserted: 0
- Existing import communications reused: 0

## Source Status Counts

- active: 31
- cancelled: 55
- trial: 2

## Source Plan Counts

- plus: 4
- standard: 84

## Safety

- Imported only into first-party One Time `bna_parent_leads` rows plus internal `bna_contact_communications` notes.
- No campaign, email, SMS, WhatsApp, Telegram, Buffer, payment, or external CRM action was sent or triggered.
- Every imported row carries no-send/campaign-approval metadata and the `one-time-no-send-until-approved` tag.
