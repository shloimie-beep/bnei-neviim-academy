# BNA Local Keyholder

The BNA keyholder is a local-only folder for updated API keys and project
tokens. It keeps secrets out of chat, screenshots, tracked repo files, task
titles, and logs.

Default folder:

```text
C:\Users\User\BNA-Keyholder
```

Files:

```text
openai-api-key.txt
buffer-api-key.txt
resend-api-key.txt
railway-token.txt
kimi-api-key.txt
README.txt
keyholder-log.jsonl
```

## Open Or Create It

From the BNA repo:

```powershell
npm run keyholder:open
```

For setup without opening Explorer:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/open-bna-keyholder.ps1 -NoOpen -CreateDesktopShortcut
```

The shortcut is named `BNA Keyholder` on the Windows desktop.

## Diagnostics

Run:

```powershell
npm run keyholder:diagnose
```

The diagnostics report:

- file exists
- raw length
- normalized length
- first 12 hex characters of a SHA-256 fingerprint
- newline, carriage return, quote, and BOM status
- last modified time
- whether the keyholder fingerprint matches the corresponding local
  `.secrets` file

It never prints a secret value.

Reports are written to `ops/qa-runs/` as Markdown and JSON.

## How To Update A Key

1. Open the keyholder.
2. Paste exactly one key into the matching file.
3. Save the file.
4. Tell Codex, for example: `I put the new OpenAI key in the keyholder.`
5. Codex should run diagnostics first and compare fingerprints only.
6. Codex may copy the normalized value into `.secrets` or Railway only after an
   explicit instruction such as `apply the OpenAI key locally` or `push the
   OpenAI key to Railway`.

Normalization removes a leading BOM, trims whitespace, and strips one pair of
surrounding single or double quotes. Diagnostics may say normalization would
change the value, but it still must not show the value.

## Safety Rules

- Keep this folder outside the repo.
- Do not paste keys into chat.
- Do not commit `.secrets`, `.env.local`, or a copied keyholder folder.
- Do not print key values in terminal output.
- Do not push Railway variables unless the operator explicitly asks for that
  exact key and target.
- Store only metadata and fingerprints in reports and logs.
