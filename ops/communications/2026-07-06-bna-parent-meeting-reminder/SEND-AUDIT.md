# BNA Parent Meeting Reminder Send Audit - 2026-07-06

## Source

- Raw ID: `RAW-20260706-001`
- Register:
  `tasks-pending/2026-07-06-bna-parent-meeting-reminder-send-and-merge.md`
- Approval: Shloimie's clear natural-language approval in Codex chat:
  "I approve it ... send it".

## Approved Copy

Correction note: the initial copy below was followed by an addendum because
Shloimie clarified that the Webers are just away/on vacation and are not hosting
today. Do not treat the initial wording as a durable statement that they
permanently left or stopped hosting.

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
- Treat the July 6 Weber note as a same-day location clarification only: the
  Webers are away/on vacation and not hosting today, not permanently gone.
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
  - Weber/Huda records, because they were not in the rebuilt current-student
    parent reminder recipient set after duplicate repair. The later addendum
    corrected the wording about the Webers: they are just away/on vacation and
    not hosting today.
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

Initial attempt was blocked by the configured WAPI/Whapi provider channel.

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

### WhatsApp Retry

Shloimie then approved retrying: "Okay, try again."

Retry result: sent 8 WhatsApps total, 4 Hebrew and 4 English.

| Communication IDs | Count | Language | Provider readback |
|---|---:|---|---|
| `#2397`, `#2399`, `#2401`, `#2404` | 4 | Hebrew | sent/delivered/read; no follow-up required |
| `#2398`, `#2400`, `#2402`, `#2403` | 4 | English | sent/delivered; no follow-up required |

Masked phone endings in retry readback:

- Hebrew: `***2874`, `***2140`, `***2873`, `***2631`
- English: `***8912`, `***1232`, `***8938`, `***7660`

### Correction Addendum

Shloimie corrected the Weber wording after the first send. Codex sent a
separate addendum by WhatsApp and email to the same audited parent recipient
set.

English addendum:

```text
Hi,

Sorry, that wording did not come out clearly. The Webers are just away/on vacation, so they are not hosting us today.

We are meeting today at 8 Havakuk Hanavi, Ramat Beit Shemesh Gimel.

Thank you,
Bnei Neviim Academy
```

Hebrew addendum:

```text
שלום,

סליחה, הניסוח הקודם לא היה ברור. משפחת ובר רק בחופשה, ולכן הם לא מארחים אותנו היום.

נפגשים היום ברחוב חבקוק הנביא 8, רמת בית שמש גימל.

תודה,
בני נביאים
```

WhatsApp addendum result: sent 8 WhatsApps total, 4 Hebrew and 4 English.

| Communication IDs | Count | Language | Provider readback |
|---|---:|---|---|
| `#2406`, `#2408`, `#2411`, `#2414` | 4 | Hebrew | sent/read outcomes; no follow-up required |
| `#2407`, `#2410`, `#2412`, `#2413` | 4 | English | sent; no follow-up required |

Provider log note: record `#2409` appeared as a WAPI status/log artifact and is
not counted as one of the eight explicit addendum sends.

Email addendum result: sent 5 individual Gmail messages total, 3 Hebrew and 2
English.

| Language | Count | Gmail sent message IDs |
|---|---:|---|
| Hebrew | 3 | `19f35d4d35db6610`, `19f35d4fc5d7afe7`, `19f35d52d2b458e1` |
| English | 2 | `19f35d4e42d14eb7`, `19f35d519ea047aa` |

No raw phone numbers or email addresses are stored in this audit.
