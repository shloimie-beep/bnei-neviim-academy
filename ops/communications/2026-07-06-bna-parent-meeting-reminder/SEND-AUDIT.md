# BNA Parent Meeting Reminder Send Audit - 2026-07-06

## Source

- Raw ID: `RAW-20260706-001`
- Register:
  `tasks-pending/2026-07-06-bna-parent-meeting-reminder-send-and-merge.md`
- Approval: Shloimie's clear natural-language approval in Codex chat:
  "I approve it ... send it".

## Approved Copy

### English

Subject:

`Reminder: Meeting today at 8 Havakuk Hanavi`

Body:

```text
Hi,

Reminder: Today, Monday, we are meeting at 8 Havakuk Hanavi, Ramat Beit Shemesh Gimel.

Please do not go to the Webers; they are no longer hosting us.

Thank you,
Bnei Neviim Academy
```

### Hebrew

Subject:

`תזכורת: נפגשים היום ברחוב חבקוק הנביא 8`

Body:

```text
שלום,

תזכורת: היום, יום שני, נפגשים ברחוב חבקוק הנביא 8, רמת בית שמש גימל.

נא לא להגיע למשפחת ובר; הם כבר לא מארחים אותנו.

תודה,
בני נביאים
```

## Recipient Policy

- Include parents linked to current BNA student records.
- Exclude inactive/archived duplicate source records.
- Exclude Webers from this reminder unless Shloimie explicitly re-includes
  them.
- Exclude external/accountability-only students that are not current BNA school
  students.
- Do not commit raw phone numbers or email addresses.

## Execution Evidence

### Duplicate Merge Readback

- Huda/Hooda Weber:
  - Existing merge event `#1` already linked source student `#21982` to target
    student `#82261`.
  - The stale source row was still active, so Codex repaired it in one DB
    transaction.
  - Readback: student `#21982` is now `inactive`, `identity_review_status =
    merged`, `archived_duplicate_of = 82261`, and signup `#9` now has
    `canonical_student_id = 82261`.
- Menachem:
  - Merge endpoint merged source student `#79458` into target student `#2800`.
  - Readback: student `#79458` is now `inactive`, `identity_review_status =
    merged`, `archived_duplicate_of = 2800`, and signup `#12` now has
    `canonical_student_id = 2800`.
  - Merge event: `#2`.

### Recipient Rebuild

- Current active canonical BNA project student IDs considered:
  `#643`, `#2436`, `#2800`, `#21983`, `#53986`.
- Excluded from sends:
  - Weber/Huda records, because Shloimie said the Webers left / are not
    hosting.
  - Inactive duplicate source records.
  - Current student `#53986`, which had no parent email/phone recipient in the
    rebuilt list.
- Email recipients sent: 5 total, 3 Hebrew and 2 English.
- WhatsApp candidate recipients: 8 total, 4 Hebrew and 4 English.
- Raw phone numbers and email addresses are intentionally not stored here.

### Email Send

Sent as individual Gmail messages so recipients could not see each other's
addresses.

| Language | Count | Gmail sent message IDs |
|---|---:|---|
| Hebrew | 3 | `19f35b93476e96a8`, `19f35b9593e625d6`, `19f35b98899f43af` |
| English | 2 | `19f35b9461888098`, `19f35b96e24d6f0c` |

### WhatsApp Send

Blocked by the configured WAPI/Whapi provider channel.

- Production WAPI diagnostics before send: outbound configured = `true`.
- First send attempt:
  - Communication log: `bna_contact_communications #2396`
  - Masked recipient phone: `***2874`
  - Language: Hebrew
  - Result: failed
  - Provider status: `401`
  - Provider error: `need channel authorization for send message`
- Because the first provider send failed with channel authorization, the
  remaining WhatsApp sends were not attempted. Retrying requires WAPI/Whapi
  channel re-authorization or another explicitly approved WhatsApp sender path.
