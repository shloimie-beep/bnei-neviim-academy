# Ramble Intake - 2026-06-23 - Operator Laptop Bootstrap Package

## Raw intake

> I need a program for my laptop that I could just download and get my whole ENV connected to the whole repo and just so anything I do on my laptop will sync to the GitHub and sync to this desktop machine. Develop whatever piece of code that is that I could just install it in my laptop. Tell Codex right now in a prompt that he should just email it to me at SDRATLR, something that I could just download and just run like one time, and it will just download the entire GitHub repo, all the folders, the one-time folders, you know, everything in the CLI, install like everything that we have installed on our machine to run the software that I'm running on my desktop machine. I need to put onto my laptop. So he should just make this prompt for Codex to make me this full package, and he should email it to me so I could just, you know, click one thing, download it, and install it on my laptop.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260623-002 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-06-23-operator-laptop-bootstrap-package.md |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | no |
| Active goal objective | n/a |
| Goal tool used | no |
| Execution directive | Operator approved implementation and email delivery to `SDRATLER@gmail.com`; build and send safe no-secret package. |
| Terminal statuses required | Done / Blocked / Needs operator decision |
| Deploy/live-smoke required for app-visible work | yes, if Operations UI/routes change |
| Next requirement IDs to work | None for safe no-secret package delivery. Secret-bearing env export remains a separate encrypted approval-gated workflow. |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260623-005 | Reconcile the existing laptop/bootstrap paths before building anything new. | RAW-20260623-002 | BNA / operator setup | Codex | Baseline/audit | High | 1 | none | Current secure Operator Setup, older email installer, local setup docs, importer, and live smoke proof are inspected and summarized. | `docs/local-setup.md`, `docs/install-package/README.md`, `tasks-pending/2026-06-15-secure-operator-bootstrap.md`, `scripts/build-laptop-install-package.ps1`, `scripts/import-operator-bootstrap.mjs` | No | Done |
| REQ-20260623-006 | Build a current one-click Windows laptop installer or wrapper that uses the secure Operator Setup model. | RAW-20260623-002 | BNA / operator setup | Codex | Tooling | High | 2 | REQ-20260623-005 | Package can install Git/Node/npm if needed, clone or update the GitHub repo, run `npm install`, create `.env.local` from safe bootstrap/import flow, create Start/Doctor/Sync scripts, and run local doctor/smoke without exposing secrets. | `scripts/build-operator-laptop-installer.ps1`, `scripts/Sync-BNA.ps1`, `tests/operator-laptop-installer.test.js`, package scripts/docs | No | Done |
| REQ-20260623-007 | Add safe GitHub sync helpers for laptop-to-GitHub-to-desktop workflow. | RAW-20260623-002 | BNA / GitHub workflow | Codex | Tooling/safety | High | 2 | REQ-20260623-006 | Sync helper checks branch/remote, blocks dirty secret files, runs secret audit before push, uses explicit commit messages, pulls with safe conflict handling, and explains that desktop sync happens by Git pull, not direct machine-to-machine writes. | `scripts/Sync-BNA.ps1`, `tests/operator-laptop-installer.test.js` | No | Done |
| REQ-20260623-008 | Prepare a delivery path for the installer without unsafe email or secret exposure. | RAW-20260623-002 | BNA / operator setup | Shloimie + Codex | Delivery/security | High | 3 | REQ-20260623-006, DEC-20260623-003 | Package is available through Operations Super Admin one-time download or email only after exact recipient and approval. Secret-bearing bundle uses encrypted export and passphrase via separate channel. | Gmail send path, safe generated package | No app deploy; Gmail send approved | Done |

## Parsed tasks

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|---|
| TASK-20260623-002 | operator-laptop-bootstrap-package | Build and deliver current BNA laptop bootstrap package. | Codex | BNA / operator setup | RAW-20260623-002 | REQ-20260623-006, REQ-20260623-007, REQ-20260623-008 | Safe no-secret installer emailed to `SDRATLER@gmail.com`. Use encrypted Operator Setup export later for real secrets if needed. | Done / Activity | Done |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|---|
| DEC-20260623-003 | Confirm installer delivery address and send approval. | `SDRATLR` is not a complete email address. Operator confirmed `SDRATLER@gmail.com` and said to send it/do everything. | Shloimie | Send the safe no-secret installer ZIP to `SDRATLER@gmail.com`; keep secret export separate. | Operations one-time link or Drive link later if attachment is inconvenient. | Safe email sends installer only; no secrets exposed. | Completed Gmail send; message ID `19ef46765f76b97f`. | REQ-20260623-008 | Decided / Done |
| DEC-20260623-004 | Decide whether the laptop package should include encrypted secrets or be safe/no-secret only. | Whether Shloimie wants full local env/secrets imported automatically on the laptop, and what passphrase/separate channel will be used. | Shloimie | Start with safe no-secret installer plus Operations encrypted bootstrap only if needed; keep raw secrets in keyholder/Railway and never email password with package. | Manually fill `.env.local`; create encrypted one-time export later; local keyholder transfer. | Full env setup is faster but has higher risk; no-secret setup is safer and was safe to email immediately. | Safe no-secret package was sent. Encrypted real-secret export remains future approval-gated work. | Secret-bearing package only | Decided for this package / Future decision for secrets |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260623-002 | Is the laptop definitely Windows, and should the installer support Windows only for this first package? | The existing one-click installer is PowerShell/Windows-first. | Blocks non-Windows support only | Answered by implementation: Windows-first package. |
| Q-20260623-003 | Should Telegram bot polling and the agent fleet run from the laptop, or should the laptop be local app/repo work only? | Running these on multiple machines can cause polling/job-claim conflicts. | Blocks auto-start services only | Answered by implementation: not auto-started. |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260623-002 | Operator wants a downloadable one-click laptop setup package that connects the BNA repo/dev environment and syncs work through GitHub. | no | Already covered by existing Operator Setup memory and secure bootstrap rule. |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260623-005 | Existing docs/scripts/tests/changelog | Inspect and register baseline. | File inspection completed. | none | none | Not required |
| REQ-20260623-006 | Installer builder/importer/local setup/docs/tests | Added safe installer builder that wraps current secure Operator Setup and avoids plaintext secrets. | `node --test tests/operator-laptop-installer.test.js`; `npm run operator:laptop:package`; ZIP inspection; PowerShell parse. | none | none | Not required |
| REQ-20260623-007 | Sync scripts/docs/tests | Added explicit `Sync-BNA` helper with clean-worktree, secret-audit, pull/push, conflict instructions, and no silent commit. | Static regression test and PowerShell parse passed. | none | none | Not required |
| REQ-20260623-008 | Gmail send | Generated safe local package and emailed after exact recipient approval. | Gmail send message ID `19ef46765f76b97f`; evidence file recorded. | none | none | Not required |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260623-005 | Done | This register plus inspected baseline files listed above. | `raw-input/RAW-20260623-002-operator-laptop-bootstrap-package.md`, this file, daily memory, ledger/changelog | `npm run bna:run:status` and `npm run bna:run:next` passed before registration; baseline files inspected. | None. |
| REQ-20260623-006 | Done | `scripts/build-operator-laptop-installer.ps1`; `install-packages/BNA-Operator-Laptop-Safe-20260623-151349.zip`; `ops/operator-setup/2026-06-23-laptop-installer-email.md` | `scripts/build-operator-laptop-installer.ps1`, `scripts/Sync-BNA.ps1`, `tests/operator-laptop-installer.test.js`, `package.json`, docs | Focused test 4/4, package build, ZIP inspection, PowerShell parse, secret audit passed. | Real secrets intentionally not included. |
| REQ-20260623-007 | Done | `scripts/Sync-BNA.ps1`; `tests/operator-laptop-installer.test.js` | `scripts/Sync-BNA.ps1` | Static test and PowerShell parse passed. | None for safe helper. |
| REQ-20260623-008 | Done | Gmail message ID `19ef46765f76b97f`; Drive file `https://drive.google.com/file/d/1qTR-bfus2O7kDnn0QleQdRji_msmw2w0/view?usp=drivesdk`; Drive-link Gmail message ID `19ef4b152d98adbc`; `ops/operator-setup/2026-06-23-laptop-installer-email.md` | no app-visible route changes | Email sent with safe no-secret ZIP attached; Drive upload/readback/share passed; Drive link emailed. | Secret-bearing env export remains a separate encrypted approval-gated workflow. |

## Copy-ready Codex prompt

```text
BNA_GOAL_MODE_EXECUTION_PACKET

You are Codex working in the BNA repo at C:\Users\User\BNA v2.0.

Raw source:
RAW-20260623-002. Shloimie wants a one-click laptop setup package that he can download/run once on his laptop. It should clone or update the full BNA GitHub repo, install the same local CLI/runtime dependencies needed to run BNA from the desktop workflow, prepare local app launch/doctor/smoke helpers, and create a safe GitHub sync workflow so laptop work can move through GitHub and then be pulled on the desktop machine.

Critical existing context:
- Read AGENTS.md, BNA-START-HERE.md, docs/BNA-RAMBLE-TO-DONE.md, MEMORY.md, TASKS.md.
- Inspect the current active run before starting: npm run bna:run:status and npm run bna:run:next.
- Do not change the active execution-run pointer unless explicitly instructed.
- Existing relevant files:
  - docs/local-setup.md
  - docs/install-package/README.md
  - tasks-pending/2026-06-15-secure-operator-bootstrap.md
  - scripts/build-laptop-install-package.ps1
  - scripts/local-setup.mjs
  - scripts/import-operator-bootstrap.mjs
  - scripts/smoke-operator-setup-live.mjs
  - tests/operator-setup-security.test.js
  - public/operations.html and server.js Operator Setup routes
- Existing secure workflow: Operations Team/Admin > Operator Setup can create a Super Admin-only short-lived one-time safe bootstrap package. Secret-bearing packages require explicit approval phrase APPROVE_OPERATOR_ENV_SECRET_EXPORT, strong passphrase, AES-256-GCM encryption, and one-time download. Preserve this design.

Requirements:
REQ-20260623-006: Build or update a current Windows one-click BNA laptop installer/wrapper. It should:
- install/check Git, Node.js LTS, npm, and any repo-required CLI tools using safe Windows/PowerShell flows;
- clone https://github.com/shloimie-beep/bnei-neviim-academy.git into a clear install folder if absent, or update it safely if present;
- run npm install;
- create/start local folders such as .runtime/logs as needed;
- create local launchers for BNA app, doctor, smoke, and Operations URL;
- import a safe bootstrap JSON through scripts/import-operator-bootstrap.mjs and never print secret values;
- leave sensitive env values blank unless an encrypted bootstrap package is explicitly provided and decrypted locally;
- produce a README-FIRST with exact run steps, troubleshooting, and Telegram/agent-fleet cautions.

REQ-20260623-007: Add safe GitHub sync helpers. Do not silently auto-commit or auto-push. Provide an explicit Sync-BNA script that:
- shows current branch/remote/status;
- blocks if .env, .env.local, .secrets, secret-looking files, or generated logs would be committed;
- runs the repo's secret audit before push if available;
- pulls with safe conflict handling;
- optionally creates a commit only after an explicit message is provided;
- pushes the current branch only after confirmation;
- explains that desktop sync happens by pulling from GitHub on the desktop, not by direct laptop-to-desktop file copying.

REQ-20260623-008: Delivery:
- Prefer an Operations Super Admin one-time download link or local package path.
- Do not send any email until Shloimie confirms the exact recipient email and approves the exact sender, recipient, subject, body, and attachment/link immediately before send.
- The text SDRATLR is not a complete email address. A prior package was sent to sdratler@gmail.com, but do not assume without confirmation.
- Never email plaintext .env.local, .env, .secrets, API keys, DB URLs, Railway tokens, cookies, or secret-bearing logs.
- If a secret-bearing installer is required, use the existing encrypted Operator Setup package and communicate the passphrase by a separate approved channel. Do not include the passphrase in the same email/package.

Suggested implementation approach:
1. Audit current installer and Operator Setup code; decide whether to update scripts/build-laptop-install-package.ps1 or create a safer new script such as scripts/build-operator-laptop-installer.ps1.
2. Keep install-packages/ ignored and ensure generated artifacts are not tracked.
3. Add docs and focused tests that verify:
   - no plaintext secret paths are included in safe package;
   - importer does not print secret values;
   - one-click script contains required steps and Telegram/fleet caution;
   - sync script blocks secret files and has dry-run/help behavior.
4. Run focused syntax/tests and secret audit. If app-visible Operator Setup UI/routes change, run local browser smoke and deployment/live smoke only after explicit deployment approval.
5. Update raw/register/ledger/changelog with evidence and blockers.

Blocked decisions:
DEC-20260623-003: exact delivery email and send approval.
DEC-20260623-004: whether to create encrypted secret export or safe/no-secret package only.
Q-20260623-003: whether Telegram bot polling/agent fleet should be enabled on the laptop or remain desktop/server-only.

Definition of done:
- Safe installer package is generated or the Operations one-time download flow is updated and verified.
- Laptop setup can clone/update repo, install dependencies, prepare local env template/import, and run doctor/smoke guidance.
- Sync helper is explicit, GitHub-based, and secret-safe.
- No secrets are printed, committed, emailed, or stored in tracked files.
- Final response gives Shloimie the exact download/package location or explains which decision blocks delivery.
```

## Continuation

Safe package delivery is complete. Next optional step, only if Shloimie wants
the laptop to receive real env values automatically, is to create an encrypted
one-time Operator Setup secret export with the required approval phrase and a
strong passphrase delivered outside the package email.

Drive delivery follow-up is complete: uploaded the ZIP to
`BNA V2 / Operator Setup Packages`, shared it with `SDRATLER@gmail.com`, and
emailed the Drive link as Gmail message `19ef4b152d98adbc`.
