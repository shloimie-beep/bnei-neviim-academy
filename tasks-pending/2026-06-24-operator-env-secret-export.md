# Ramble Intake - 2026-06-24 - Operator Env Secret Export

## Raw intake

Raw source is preserved in:

`raw-input/RAW-20260624-006-operator-env-secret-export.md`

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260624-006 |
| Source | codex_chat |
| Parse status | parsed |
| Requirement register | tasks-pending/2026-06-24-operator-env-secret-export.md |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260624-032 | Deliver a real env bootstrap to the operator laptop using the secure encrypted Operator Setup workflow. | RAW-20260624-006 | BNA / operator setup | Shloimie + Codex | Credential handoff | High | 1 | DEC-20260623-004 | An encrypted one-time Operator Setup package is generated behind Super Admin access, protected by `APPROVE_OPERATOR_ENV_SECRET_EXPORT` and a strong passphrase, and the download link is delivered only after exact email/body approval. No plaintext env values or passphrase are placed in chat, tracked files, logs, screenshots, or the same email as the link. | Existing Operator Setup: `server.js`, `public/operations.html`, `scripts/import-operator-bootstrap.mjs` | No new deploy required unless the workflow is changed | Blocked |

## Parsed tasks

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|---|
| TASK-20260624-006 | operator-env-secret-export | Create encrypted Operator Setup env export for the laptop. | Shloimie + Codex | BNA / operator setup | RAW-20260624-006 | REQ-20260624-032 | Shloimie must provide the exact approval phrase and a 20+ character passphrase through an approved separate secure channel or the Operations UI. Then Codex can generate/send the one-time link with exact email approval. | Pending | Blocked |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|---|
| DEC-20260623-004 | Reused existing laptop env secret-export decision. | The operator now wants the secret-bearing export, but the workflow still needs the exact approval phrase and a 20+ character passphrase that is not sent in the same email/link. | Shloimie | Use Operations Super Admin > Team/Admin > Operator Setup, enter `APPROVE_OPERATOR_ENV_SECRET_EXPORT`, choose a strong passphrase, download once on the laptop, then communicate the passphrase outside the package/email. | Manually fill `.env.local` from keyholder/Railway; rotate keys and install through keyholder on the laptop. | Without the passphrase, Codex cannot safely generate an encrypted secret package. Emailing plaintext env values would violate the repo's credential-handling rules. | Provide/pass the passphrase through the approved flow, or explicitly choose the manual keyholder setup path. | REQ-20260624-032 | Needs operator action |

## Final audit

| ID | Status | Evidence | Verification | Remaining issue |
|---|---|---|---|---|
| REQ-20260624-032 | Blocked | Existing Operator Setup code inspected: encrypted secret export requires `APPROVE_OPERATOR_ENV_SECRET_EXPORT` and passphrase length >= 20. | Inspected `server.js`, `public/operations.html`, `scripts/import-operator-bootstrap.mjs`, and `tasks-pending/2026-06-15-secure-operator-bootstrap.md`. | Missing passphrase and exact safe send approval for the email body/link delivery. |

## Continuation

Next safe step: Shloimie should open Operations as Super Admin and use
Team/Admin > Operator Setup to create the encrypted package, or provide an
approved passphrase through a separate secure channel. Codex may then email the
one-time link to the confirmed recipient, but must not include the passphrase
in the same email.
