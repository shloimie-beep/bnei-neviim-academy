# RAW-20260708-018 - OneTime local students current class-link resend

Source: Codex chat
Captured: 2026-07-08
Channel: codex_chat
Workspace/project: rabbi_sheller_provider / one_time_mishnah_class
Parse status: registered

## Raw Operator Input

> The two students I told you, I'm very upset at you. These students are chashiv, chashiv, very important students. And I told you they're waiting to learn Torah. They're ready to learn Torah. And the ones that are in the actual class that couldn't come, they're very upset because they didn't get the link. So those students that are in the class and tagged as students that are local students, that are local students, I need you to send them the most current link. Otherwise, you are over on Bitul Torah, and it's your fault, Mr. Robot.

## Parsed Requirement

- `REQ-20260708-074`: Urgently send the current OneTime Mishnah live-class link to the CRM contacts tagged as local students / local class attendees, only after verifying the exact scoped recipient segment, current class link, and configured send channel.

## Guardrails

- Send individual messages only; no shared-recipient blast.
- Use the OneTime/Rabbi scope only: `rabbi_sheller_provider` / `one_time_mishnah_class`.
- Do not use WhatsApp/WAPI unless the live service has scoped OneTime WAPI credentials and approval gates configured.
- Do not commit raw recipient emails or a raw Zoom password link to repo evidence.
- If the live local-student segment does not match the operator's "two students" instruction, block before sending and report the exact masked count.
