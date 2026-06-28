# Two-Week Class Intake Audit Run Note

Generated: 2026-06-28T06:34:10.006Z

## Inputs

- Start date: 2026-06-12
- End date: 2026-06-26
- Include private text: no
- DB readback: attempted read-only
- Drive readback: attempted read-only

## Environment Files

- not found path_hash=01d81f2dadd4e4ff keys=0
- not found path_hash=c72f2198e0a82877 keys=0
- loaded path_hash=b92fd46cd5e4b175 keys=38
- not found path_hash=3193bb71fef9c22b keys=0

## Secret Files

- railway-database-url.txt: loaded 1 key(s)
- railway-google-env.txt: loaded 8 key(s)
- railway-google-env-pending.txt: loaded 10 key(s)
- google-oauth-client.json: loaded 2 key(s)
- google-refresh-token.txt: loaded 1 key(s)
- google-drive-pipeline.json: loaded 21 key(s)

## No-Write Guardrail

- This script opens the database transaction as `BEGIN READ ONLY` and rolls back.
- This script uses Google Drive read-only scopes.
- This script does not move Drive files, mutate DB rows, send messages, retranscribe files, or apply backfill.
