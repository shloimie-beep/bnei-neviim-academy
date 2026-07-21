# Intent Change Receipt - SPEC-20260721-002

Fingerprint: 6f2d3038434fa41bb8d756544e74a05481ffa3e398cef0e21f483bc0677477b9

- CHG-20260721-010 | invariant | Durable architecture record > One Time and BNA separation invariant | preserve | Preserve One Time as an external product connector and preserve BNA School as a separate first-party workspace.
- CHG-20260721-001 | Durable architecture record > Lane prerequisite | behavior | Proceed only after the urgent lane is stable; stability is evidenced by a clean worktree and CLEAN draft PR state.
- CHG-20260721-002 | Durable architecture record > Branch and PR contract | behavior | Base codex/one-time-communications-architecture-v1 from current origin/master and open a draft PR against master.
- CHG-20260721-003 | Durable architecture record > One Time communication ownership | behavior | For the One Time external connector only: GHL owns customer communication truth; the One Time app owns product/account truth; Telegram is the Rabbi interface for assigned Torah questions/content; Resend sends security-token email only.
- CHG-20260721-004 | Durable architecture record > BNA School preservation | preserve | Preserve BNA School first-party school operations and forbid applying the One Time GHL exception globally.
- CHG-20260721-005 | Durable architecture record > Human routing | behavior | Default all One Time inbound ownership to Shloimie; route to Rabbi Eli only the enumerated Torah/content/warm-enrollment classes and never the enumerated login/billing/support/scheduling/parent-admin/unknown classes.
- CHG-20260721-006 | Durable architecture record > Durable records | preserve | Create dated raw intake, decision/register evidence, durable memory, architecture ADR, workspace role mapping, Super Admin connector contract, and Agent Action schemas.
- CHG-20260721-007 | Durable architecture record > Ticket ownership taxonomy | behavior | Keep live_class_question, business_conversation, and technical_ticket distinct with owners One Time, GHL, and Super Admin respectively; technical_ticket requires source workspace.
- CHG-20260721-008 | Durable architecture record > Rabbi Telegram contract | behavior | Telegram is a non-canonical Rabbi interface. Every One Time send/draft/status change is represented in GHL, and AI may never originate Torah answers in Rabbi Eli's name.
- CHG-20260721-009 | Durable architecture record > No external mutation | behavior | This lane performs zero email, Telegram, GHL, DNS, or production-deployment mutations.
- CHG-20260721-011 | Durable architecture record > Final response contract | preserve | The final response begins with the exact six-line status block and then reports branch, head, PR, and durable paths.
