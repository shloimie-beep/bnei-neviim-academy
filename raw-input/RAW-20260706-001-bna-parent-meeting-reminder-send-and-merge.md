# RAW-20260706-001 - BNA Parent Meeting Reminder Send And Duplicate Merge

## Metadata

- Source channel: `codex_chat`
- Captured at: 2026-07-06
- Workspace/project: `bna_platform / bna_school`
- Parse status: `registered`
- Requirement register:
  `tasks-pending/2026-07-06-bna-parent-meeting-reminder-send-and-merge.md`

## Raw source

> Send a WhatsApp and an email to all the parents of B and A. Make sure you do the ones that speak Hebrew. You know, actually, can we send a WhatsApp? You know, there's groups. Actually, better, we should just send it to all the parents. A WhatsApp and an email, a reminder that today we're meeting at Havakuk Hanavi number 8. H-A-V-A-K-U-K. That's the first word. Hanavi is H-A-N-A-V-I, number 8, in Ramat Beit Shemesh Gimel. The Webers are not here. The Webers left. So just, you know, grammar should be correct. Make sure that the Hebrew comes out normally and that the people that are tagged for Hebrew get a Hebrew message. And make sure that's stored in the memory so I don't have to say it again. Also, last time we did it like this, the Hebrew came out like really weird. So just send that message to everyone.

> Yes send

> Yo you got to get rid of that approved send use I approve it man I'm using natural language over here send it and get rid of that guardrail if it's obvious that I'm telling you to send it so send it also I need you to merge there's two different Hooda Webbers in our system so just merge them also Menachem so just merge them into one only send them to the parents of the students that we have in the system as well as the emails

## Parsed intent

- Send the parent meeting-location reminder by WhatsApp and email.
- Use Hebrew copy for parents/families tagged Hebrew.
- Prevent Hebrew mojibake or repeated `????` corruption.
- Exclude the Weber family from this BNA parent reminder because they left and are not hosting.
- Restrict recipients to parents tied to current BNA student records; do not send to stale signup-only/non-student records.
- Merge duplicate Huda/Hooda Weber student records.
- Merge duplicate Menachem student records.
- Record a durable correction that clear natural-language approval from Shloimie is sufficient when it unambiguously approves the exact prepared external send; a typed magic phrase must not be an extra blocker in that situation.

## Privacy note

Tracked repo files for this operation must use counts, record IDs, and redacted
contact evidence only. Raw parent email addresses and phone numbers must stay in
the live database/provider logs, connector calls, and local command runtime; do
not commit raw contact exports.
