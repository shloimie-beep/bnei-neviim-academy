# RAW-20260708-027 - Rabbi WAPI token save

## Metadata

- Source channel: codex_chat
- Captured at: 2026-07-08T22:02:00+03:00
- Parse status: registered
- Requirement IDs: `REQ-20260708-089`
- Privacy classification: secret

## Raw Intake

> What I sent you before is the token, the rabbi token. Save it in a very good
> place.

## Parsed Requirement

- `REQ-20260708-089`: Store the provided Rabbi/OneTime WAPI token in local
  gitignored secret storage using the app's scoped secret filenames, verify by
  redacted fingerprint/readiness only, and do not commit or print the token.

## Result

- Stored in `.secrets/one-time-wapi-api-token.txt`.
- Stored in `.secrets/rabbi-sheller-wapi-api-token.txt`.
- Token length: `32`.
- Redacted fingerprint: `1bf76f7c0a3a`.
- Both paths are ignored by git.

## Guardrails

- The token value was not committed to tracked files.
- Repo evidence uses only length/fingerprint/source labels.
- No Railway/environment mutation was performed by this save step.
