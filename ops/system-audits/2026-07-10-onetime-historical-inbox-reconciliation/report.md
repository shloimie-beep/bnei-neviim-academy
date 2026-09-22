# One Time Historical Inbox / Contact Reconciliation

Generated: 2026-07-10T11:58:00+03:00

Requirement: `REQ-20260710-021`

Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

Status: `Needs operator decision`

## Scope

This audit reconciles the operator claim that roughly 2,600 historical
email/contact records were uploaded but are not visible in the complete Rabbi
inbox or Super Admin/Rabbi CRM views. It stores only source metadata, counts,
hash prefixes, route/API counts, and blocker decisions. It does not commit raw
email addresses, private message bodies, contact exports, Resend received-email
ids, subjects, provider credentials, or setup links.

## Source Candidates Found

| Source | Type | Rows | Columns / Shape | Last Modified | Hash Prefix | Notes |
|---|---:|---:|---|---|---|---|
| `C:/Users/User/Downloads/subscribed_email_audience_export_b12dfa345d.csv` | CSV | 1,311 | 31 columns | 2026-06-21 14:37 | `B1E7BB30E6464D4C...` | Subscribed audience export; contains email/contact/status/opt-in metadata columns. |
| `C:/Users/User/Downloads/unsubscribed_email_audience_export_b12dfa345d.csv` | CSV | 152 | 35 columns | 2026-06-21 14:37 | `4A5F84834B4E4F80...` | Unsubscribed audience export; should be treated as suppression/no-send unless owner approves a different retention policy. |
| `C:/Users/User/Downloads/cleaned_email_audience_export_b12dfa345d.csv` | CSV | 60 | 33 columns | 2026-06-21 14:37 | `B3093F6D3A7B4E9E...` | Cleaned/bounced audience export; should not become campaign-eligible contacts. |
| `C:/Users/User/Downloads/Rabbi Scheller Followers.xlsx` | XLSX | 812 non-empty rows | Sheet `ta-speaker_540_followers`, range `A1:B812` | 2026-06-21 14:37 | `E17BBB32C8B2E642...` | Follower workbook; two-column source requiring a separate field map before import. |
| `C:/Users/User/Downloads/subscribers.csv` | CSV | 88 | 5 columns | 2026-06-16 19:56 | `3732CB909F796920...` | Older small subscriber source already handled by the June 16 import lane. |
| `C:/Users/User/Downloads/subscribers_detailed.csv` | CSV | 86 | 8 columns | 2026-06-17 18:53 | `0E05CD969C15E732...` | Older detailed subscriber source; likely overlaps the 88-row source. |

The June 21 audience/follower source family accounts for 2,335 source rows
before dedupe, suppression policy, and field mapping. Including the older
88-row `subscribers.csv` source gives 2,423 source rows; including
`subscribers_detailed.csv` as an additional candidate gives 2,509 source rows.
No single local artifact named or inspected in this pass independently proves
exactly 2,600 rows, but the located corpus is close enough to be the likely
source family behind the operator's "roughly 2,600" description.

## Existing Import / Mailbox Evidence

| Evidence | Count | What It Proves | Why It Does Not Close REQ-20260710-021 |
|---|---:|---|---|
| `ops/imports/2026-06-16-one-time-email-contacts-import.md` | 88 imported contacts and 88 import notes | The older `subscribers.csv` file was imported into first-party One Time lead records with no-send tags at that time. | It covers only 88 rows and does not account for the June 21 audience/follower source family. |
| `ops/live-smokes/2026-07-06T15-03-36-636Z-one-time-mailbox-resend-backfill.md` | 9 Resend received emails backfilled | The mailbox MVP restored 9 received emails from 2026-06-29 to 2026-06-30 into first-party CRM communication rows. | It is a mailbox MVP backfill, not the complete historical audience/contact import. |
| Current live One Time Operations API readback | 4 parent leads, 0 email-import-tagged leads | The current `one-time-production / one-time-web` service does not show the older import in scoped parent leads. | The historical contact import is not visible in current live One Time CRM. |
| Current live CRM workbench API readback | 12 CRM cards, 0 filtered by `one-time-list:rabbi-email-contacts` | The CRM workbench is live but does not contain the historical email-list import tag. | The workbench proves CRM infrastructure, not historical import completion. |

Provider mailbox credentials stored in the local keyholder file returned 401
against the current live provider login during this reconciliation pass, so a
fresh Rabbi-provider mailbox count could not be taken in this pass. The latest
usable provider mailbox proof remains the July 6 report above, which is only
the 9-email Resend backfill.

## Current Live Visibility Readback

Authenticated Operations readback against `https://join.onetimeonetime.com`
using the One Time Railway auth fallback returned:

```json
{
  "parent_leads_count": 4,
  "parent_leads_email_import_tag_count": 0,
  "parent_leads_no_send_tag_count": 0,
  "parent_leads_campaign_staging_tag_count": 0,
  "crm_total": 12,
  "crm_filtered_total": 12,
  "crm_email_import_filtered_total": 0,
  "crm_email_import_cards_returned": 0,
  "crm_filter_tags_include_email_import": false,
  "no_send": true,
  "external_write_performed": false
}
```

This proves the historical import is not visible in the current live One Time
CRM through the scoped parent-leads API or the CRM workbench.

## Technical Gaps

- `scripts/import-one-time-subscribers.mjs` is scoped to the older
  `subscribers.csv` 5-column format. It does not normalize the June 21
  subscribed/unsubscribed/cleaned audience exports or the follower workbook.
- The CRM workbench API currently loads up to 500 parent-lead rows and up to
  500 contact rows internally. That is fine for the current visible CRM
  workbench but is not a complete-proof mechanism for a 2,300-2,600 record
  import.
- The June 21 source family mixes subscribed, unsubscribed, cleaned/bounced,
  and follower records. Those categories need different no-send/suppression
  policy treatment before any production import.

## Decision DEC-20260710-004

Missing information: which exact source files are canonical for the historical
One Time inbox/contact import, and how unsubscribed/cleaned/follower rows
should be retained, suppressed, or excluded.

Owner: Shloimie / One Time data owner.

Recommended option: approve a no-write dry-run normalizer for the four June 21
source files, producing only deduped counts, suppression counts, source-bucket
counts, field-map coverage, and proposed first-party no-send import actions.
After the dry-run is reviewed, approve a separate production import if desired.

Alternatives:

- Import only subscribed rows as no-send CRM contacts and keep unsubscribed /
  cleaned rows as suppression-only metadata.
- Keep all June 21 sources out of production until a campaign/compliance plan
  is approved.
- Provide a different canonical export if the local June 21 files are not the
  intended roughly 2,600-record upload.

Consequences: mailbox/CRM completion cannot be claimed while the current live
One Time service has 0 email-import-tagged records and only the 9-email Resend
backfill is proven.

Exact next action: run a redacted, no-write import dry-run over the approved
source package; do not write production contact rows until the canonical source
set and suppression policy are approved.

## Terminal Status For REQ-20260710-021

`REQ-20260710-021` should be marked `Needs operator decision`. The historical
source family has been located and counted, and live visibility has been
checked, but the source is not imported/visible in current One Time production.
The next executable Codex step is a no-write dry-run normalizer only after the
canonical source/suppression policy is accepted.
