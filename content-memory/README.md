# BNA Content Memory

This folder is the repo mirror of the Google Drive content memory system.

Drive is useful for phone/browser access. This repo folder is useful because the
Telegram bridge and coding agents can read it directly before generating drafts.
The long-term flow is:

1. Raw media lands in Telegram or Drive.
2. The system transcribes and parses it.
3. Draft generation reads:
   - `brand-kit/`
   - `content-memory/platform-prompts/`
   - `content-memory/*/examples.md`
   - recent approved outputs from the app database
4. Approved drafts become examples for future drafts.
5. Brand-kit suggestions are reviewed before being promoted into stable voice.

The folders are not meant to be random storage. They are prompt context.

