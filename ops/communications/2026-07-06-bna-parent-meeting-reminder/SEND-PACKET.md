# BNA Parent Meeting Reminder Send Packet

Date: 2026-07-06
Raw source: `RAW-20260706-001`
Requirement register: `tasks-pending/2026-07-06-bna-parent-meeting-location-reminder.md`

## Requested Action

Send a same-day WhatsApp and email reminder to all BNA parents.

## Audience Audit

Read-only database audit performed from `bna_students` and `signups`.

| Check | Result |
|---|---:|
| Active/non-archived student records considered | 8 |
| Student records after Weber exclusion | 6 |
| Active/non-archived signup records considered | 7 |
| Signup records after Weber exclusion | 5 |
| Distinct email recipients after dedupe | 5 |
| Distinct WhatsApp phone recipients after dedupe | 8 |
| Hebrew email recipients | 3 |
| English email recipients | 2 |
| Hebrew WhatsApp recipients | 4 |
| English WhatsApp recipients | 4 |

Explicit exclusion:

- Weber records found in current source data but excluded from this send:
  Huda Weber / Huda records in `bna_students` and `signups`.

Privacy note:

- No raw email addresses or phone numbers are stored in this packet.
- External-accountability student records are not used as standalone recipients.

## English Copy

Subject:

```text
Reminder: Meeting today at 8 Havakuk Hanavi
```

Body:

```text
Hi,

Reminder: Today, Monday, we are meeting at 8 Havakuk Hanavi, Ramat Beit Shemesh Gimel.

Please do not go to the Webers; they are no longer hosting us.

Thank you,
Bnei Neviim Academy
```

## Hebrew Copy

Subject:

```text
תזכורת: נפגשים היום ברחוב חבקוק הנביא 8
```

Body:

```text
שלום,

תזכורת: היום, יום שני, נפגשים ברחוב חבקוק הנביא 8, רמת בית שמש גימל.

נא לא להגיע למשפחת ובר; הם כבר לא מארחים אותנו.

תודה,
בני נביאים
```

## Hebrew Readability Check

Manual/static check:

- Hebrew body contains normal Hebrew characters.
- Hebrew body contains no repeated `????` corruption.
- Address is rendered in Hebrew as `חבקוק הנביא 8, רמת בית שמש גימל`.
- The copy uses full `גימל` instead of punctuation/geresh to reduce rendering risk.
- Hebrew recipients must receive this Hebrew copy, not the English copy.

Node UTF-8 check against the outbound Hebrew subject/body blocks passed:

- Hebrew subject characters: 31.
- Hebrew body characters: 103.
- No repeated question-mark corruption in outbound blocks.
- Hebrew subject/body contain `חבקוק הנביא 8`.
- Hebrew body contains `רמת בית שמש גימל` and `משפחת ובר`.

## Send Gate

Status: `Needs operator decision`

Reasons:

- This is a real outbound WhatsApp and email send to parents.
- Existing BNA protocol requires exact recipient/copy/sender approval before live sends.
- The repo Resend readiness currently points to `info@onetimeonetime.com`, which is not a BNA parent-reminder sender unless explicitly approved.
- Gmail is available as a one-off email send path after approval.
- WhatsApp send path is individual WAPI/Whapi sends, not a broadcast, and must be run against the verified per-recipient list.

Approval phrase for this exact packet:

```text
APPROVE_BNA_PARENT_REMINDER_SEND
```

If approved, send scope is:

- Email: 5 distinct recipients.
- WhatsApp: 8 distinct phone recipients.
- Language routing: Hebrew copy to Hebrew-tagged recipients, English copy to others.
- Exclusion: no Weber/Huda Weber records.
