# Raw Input Queue Fallback

The live database table `bna_raw_intake` is canonical for Telegram, website bot,
Codex chat, website helper, Operations helper, Operations UI, Drive, class
recordings, email, WhatsApp/WAPI, uploads, and other runtime intake.

Repo files under `raw-input/` are allowed for Codex/manual sessions or migration
fallback when the live database path is unavailable. These files preserve raw
operator words and source metadata before parsing succeeds.

Broad correction rambles should still create a dated requirement register under
`tasks-pending/`, usually from `tasks-pending/_template-ramble-intake.md`.
If Shloimie or a GPT-generated prompt asks for goal mode, build everything, or
to work through the whole correction output, the register must include the
goal-mode execution section and should follow
`tasks-pending/_template-goal-mode-correction-output.md`.

Do not delete raw input only because it was parsed. Keep it as provenance and
link it to created requirement, task, decision, open-question, memory, content,
goal-candidate, student question, student observation, class, research,
communication, alert, contact, service-provider, integration, or accounting
records.

Allowed live source channels are:

- `telegram`
- `website_bot`
- `codex_chat`
- `operations_ui`
- `drive`
- `class_recording`
- `website_helper`
- `operations_helper`
- `email`
- `whatsapp`
- `wapi`
- `manual`
- `other`
