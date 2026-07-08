# RAW-20260708-010 - OneTime resend, WAPI, Rabbi login, CRM, and agent loop

Source: `codex_chat`

Captured: `2026-07-08`

Privacy note: the operator provided a personal phone number and asked to paste
Rabbi WAPI credential material later. The phone number is redacted in this repo
record. WAPI credentials must not be committed.

## Raw intake

Shloimie asked to resend the complete OneTime parent email flow so he can see
it personally, and to start the experience again cleanly. He also said he will
paste the folder with Rabbi WAPI/WhatsApp information and wants the OneTime
Mishnah Class WhatsApp path connected to CRM. He wants a concise Rabbi-branded
welcome/class-link WhatsApp message that thanks people for patience with the
Zoom/volume setup, says the class is free while the technology is being set up,
and frames the work as building a large, high-quality Mishnah class using
modern technology for kiddush Hashem without sounding fluffy.

He asked to send a WhatsApp test link to his redacted phone number from the
Rabbi / OneTime Mishnah Class account. He wants the WhatsApp bot to respond
right away, capture the phone number/contact, ask whether they are interested
in the class, send the current class link, and log the interaction into CRM.

He also asked to be able to log in as Rabbi Scheller himself, not as super
admin, reset or set Rabbi Scheller's password, and inspect exactly what the
Rabbi sees. The Rabbi account should be OneTime-branded, clean, no pictures,
no BNA branding except backend internals, and no random diagnostic/configured
or not-configured information unless it is tied to a clear button/action. The
Rabbi-side navigation layout, side panels, filters, buttons, and interaction
patterns should stay consistent with the super-admin structure while using the
Rabbi/OneTime brand.

He asked Codex to double-check that the Agent Mode autonomous loop is ready:
agents must be able to start, navigate, audit, report failures/blockers in the
drop-off, and support parallel work. He wants agent-mode prompts focused on
CRM, WAPI, Rabbi login/view, and UI readiness.

## Immediate safety notes

- Do not resend the parent email with old test/walkthrough student labels.
- Do not commit WAPI credentials or full phone numbers.
- Do not set a weak shared password for Rabbi Scheller in repo-visible text.
- Do not send WhatsApp until WAPI sender/account, recipient, message copy,
  and current class link are verified and approval is clear.

