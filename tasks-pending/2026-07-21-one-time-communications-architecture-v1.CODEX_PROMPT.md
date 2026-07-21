# CODEX PROMPT - SPEC-20260721-002

Spec fingerprint: 6f2d3038434fa41bb8d756544e74a05481ffa3e398cef0e21f483bc0677477b9
Raw source: raw-input/RAW-20260721-002-one-time-communications-architecture-v1.md
Raw SHA-256: bb4e8cb591248ba404414d13d7b816c3dfdd6ef21566029bd9c4307c13d4aa48
Workspace/project: platform_control / one_time_mishnayos
Routes: (none declared)

## Operating Order

VERBATIM RAW -> ATOMIC SPEC -> CHANGE RECEIPT -> AMBIGUITY RESOLUTION -> PQC -> GENERATED CODEX PACKET -> IMPLEMENTATION -> ASSERTIONS/EVIDENCE

Report implementation status and evidence per change ID. Do not implement changes outside these IDs.

## Scoped Files / Routes

- Inferred files unavailable; inspect only the routes and targets listed below.

## Included Changes

### CHG-20260721-010 (global invariant)
- Classification: HARD_EXACT
- Target: Durable architecture record > One Time and BNA separation invariant
- Operation: preserve
- Current state: One Time and BNA are already scope-separated, but global no-GHL wording obscures the new connector-only decision.
- Required state: Preserve One Time as an external product connector and preserve BNA School as a separate first-party workspace.
- Exact payload: {}
- Placement: parent=; before=; after=; order=
- Style allowlist: (none)
- Style forbidden targets: (none)
- Must preserve: One Time is not BNA.
- Must remove: (none)
- Dependencies: (none)
- Supersedes: (none)
- Source spans:
  - RAW-20260721-002:S010 [490, 510]: "One Time is not BNA."
- Positive assertions:
  - A-POS-010: Run this after the urgent event lane is stable.

## Repository

```text
shloimie-beep/bnei-neviim-academy
```

Base from current master.

Create:

```text
codex/one-time-communications-architecture-v1
```

Open a draft PR against master.

## Mission

Record the One Time-specific GHL communications decision without changing BNA School's own CRM architecture.

The platform model is:

```text
Super Admin / Platform Control
  BNA school workspace
  One Time external product connector
```

One Time is not BNA.

## One Time communication ownership

For the One Time connector only:

```text
GHL:
customer communication source of truth

One Time app:
product/account source of truth

Telegram:
Rabbi interface for assigned Torah questions/content

Resend:
security-token email only
```

BNA School keeps its own accepted first-party school operations architecture.

Do not apply the One Time GHL exception globally to BNA.

## Human routing

Default One Time inbound owner:

```text
Shloimie
```

Rabbi Eli receives only:

- assigned substantive Torah/Mishnah/halachic questions;
- Rabbi-authored newsletter/content drafts;
- approved warm enrollment drafts.

Rabbi does not receive:

- login;
- billing;
- support;
- scheduling;
- parent administration;
- unknown/general messages.

## Update durable memory

Create or update the appropriate:

```text
MEMORY.md
memory-topics/
docs/architecture/
workspace role map
Super Admin connector contracts
Agent Action job schemas
```

Preserve raw operator direction in a dated intake/decision record.

## Ticket types

Separate:

```text
live_class_question
business_conversation
technical_ticket
```

A live class question is owned by One Time.

A business conversation is owned by GHL.

A technical ticket is owned by Super Admin and includes source workspace.

Do not route all of these into one BNA ticket queue.

## Rabbi Telegram contract

Telegram is not the canonical transcript.

Every send/draft/status change writes to GHL.

Do not allow AI to originate Torah answers in Rabbi's name.

## No external mutation

No email sends, Telegram sends, GHL mutations, DNS changes or production deployment in this lane.

## Final response

Begin exactly:

```text
ONE_TIME_GHL_EXCEPTION: RECORDED | BLOCKED(<one action>)
BNA_SCHOOL_ARCHITECTURE: PRESERVED
SHLOIMIE_DEFAULT_OWNER: YES
RABBI_TORAH_ONLY: YES
RESEND_SECURITY_ONLY: YES
EXTERNAL_MUTATIONS: 0
```

Then include branch/head/PR and durable paths.

- Negative assertions:
  - A-NEG-010: No contract makes One Time records, GHL conversations, or One Time technical tickets into BNA School records by default.

### CHG-20260721-001
- Classification: HARD_EXACT
- Target: Durable architecture record > Lane prerequisite
- Operation: behavior
- Current state: Current master has a global no-GHL rule and first-party BNA communication assumptions without this scoped One Time exception contract.
- Required state: Proceed only after the urgent lane is stable; stability is evidenced by a clean worktree and CLEAN draft PR state.
- Exact payload: {}
- Placement: parent=; before=; after=; order=
- Style allowlist: (none)
- Style forbidden targets: (none)
- Must preserve: (none)
- Must remove: (none)
- Dependencies: (none)
- Supersedes: (none)
- Source spans:
  - RAW-20260721-002:S001 [0, 47]: "Run this after the urgent event lane is stable."
- Positive assertions:
  - A-POS-001: Run this after the urgent event lane is stable.
- Negative assertions:

### CHG-20260721-002
- Classification: HARD_EXACT
- Target: Durable architecture record > Branch and PR contract
- Operation: behavior
- Current state: Current master has a global no-GHL rule and first-party BNA communication assumptions without this scoped One Time exception contract.
- Required state: Base codex/one-time-communications-architecture-v1 from current origin/master and open a draft PR against master.
- Exact payload: {}
- Placement: parent=; before=; after=; order=
- Style allowlist: (none)
- Style forbidden targets: (none)
- Must preserve: (none)
- Must remove: (none)
- Dependencies: (none)
- Supersedes: (none)
- Source spans:
  - RAW-20260721-002:S002 [111, 237]: "Base from current master.\n\nCreate:\n\n```text\ncodex/one-time-communications-architecture-v1\n```\n\nOpen a draft PR against master."
- Positive assertions:
  - A-POS-002: Base from current master.

Create:

```text
codex/one-time-communications-architecture-v1
```

Open a draft PR against master.
  - A-POS-002-1: Branch is exactly codex/one-time-communications-architecture-v1 and base branch is master.
- Negative assertions:

### CHG-20260721-003
- Classification: HARD_EXACT
- Target: Durable architecture record > One Time communication ownership
- Operation: behavior
- Current state: Current master has a global no-GHL rule and first-party BNA communication assumptions without this scoped One Time exception contract.
- Required state: For the One Time external connector only: GHL owns customer communication truth; the One Time app owns product/account truth; Telegram is the Rabbi interface for assigned Torah questions/content; Resend sends security-token email only.
- Exact payload: {}
- Placement: parent=; before=; after=; order=
- Style allowlist: (none)
- Style forbidden targets: (none)
- Must preserve: (none)
- Must remove: (none)
- Dependencies: (none)
- Supersedes: (none)
- Source spans:
  - RAW-20260721-002:S003 [549, 780]: "For the One Time connector only:\n\n```text\nGHL:\ncustomer communication source of truth\n\nOne Time app:\nproduct/account source of truth\n\nTelegram:\nRabbi interface for assigned Torah questions/content\n\nResend:\nsecurity-token email only"
- Positive assertions:
  - A-POS-003: For the One Time connector only:

```text
GHL:
customer communication source of truth

One Time app:
product/account source of truth

Telegram:
Rabbi interface for assigned Torah questions/content

Resend:
security-token email only
  - A-POS-003-1: GHL: customer communication source of truth; One Time app: product/account source of truth; Telegram: Rabbi interface for assigned Torah questions/content; Resend: security-token email only.
- Negative assertions:
  - A-NEG-003-1: BNA School communication ownership is unchanged.

### CHG-20260721-004
- Classification: HARD_EXACT
- Target: Durable architecture record > BNA School preservation
- Operation: preserve
- Current state: Current master has a global no-GHL rule and first-party BNA communication assumptions without this scoped One Time exception contract.
- Required state: Preserve BNA School first-party school operations and forbid applying the One Time GHL exception globally.
- Exact payload: {}
- Placement: parent=; before=; after=; order=
- Style allowlist: (none)
- Style forbidden targets: (none)
- Must preserve: BNA School
- Must remove: (none)
- Dependencies: (none)
- Supersedes: (none)
- Source spans:
  - RAW-20260721-002:S004 [786, 921]: "BNA School keeps its own accepted first-party school operations architecture.\n\nDo not apply the One Time GHL exception globally to BNA."
- Positive assertions:
  - A-POS-004: BNA School keeps its own accepted first-party school operations architecture.

Do not apply the One Time GHL exception globally to BNA.
- Negative assertions:
  - A-NEG-004-1: The One Time GHL exception is absent from BNA School connector contracts.

### CHG-20260721-005
- Classification: HARD_EXACT
- Target: Durable architecture record > Human routing
- Operation: behavior
- Current state: Current master has a global no-GHL rule and first-party BNA communication assumptions without this scoped One Time exception contract.
- Required state: Default all One Time inbound ownership to Shloimie; route to Rabbi Eli only the enumerated Torah/content/warm-enrollment classes and never the enumerated login/billing/support/scheduling/parent-admin/unknown classes.
- Exact payload: {}
- Placement: parent=One Time inbound routing contract; before=; after=; order=default owner: Shloimie > Rabbi allowlist > Rabbi denylist including parent administration
- Style allowlist: (none)
- Style forbidden targets: (none)
- Must preserve: (none)
- Must remove: (none)
- Dependencies: (none)
- Supersedes: (none)
- Source spans:
  - RAW-20260721-002:S005 [941, 1281]: "Default One Time inbound owner:\n\n```text\nShloimie\n```\n\nRabbi Eli receives only:\n\n- assigned substantive Torah/Mishnah/halachic questions;\n- Rabbi-authored newsletter/content drafts;\n- approved warm enrollment drafts.\n\nRabbi does not receive:\n\n- login;\n- billing;\n- support;\n- scheduling;\n- parent administration;\n- unknown/general messages."
- Positive assertions:
  - A-POS-005: Default One Time inbound owner:

```text
Shloimie
```

Rabbi Eli receives only:

- assigned substantive Torah/Mishnah/halachic questions;
- Rabbi-authored newsletter/content drafts;
- approved warm enrollment drafts.

Rabbi does not receive:

- login;
- billing;
- support;
- scheduling;
- parent administration;
- unknown/general messages.
  - A-POS-005-1: Shloimie is the default One Time inbound owner. Rabbi Eli receives only assigned substantive Torah/Mishnah/halachic questions, Rabbi-authored newsletter/content drafts, and approved warm enrollment drafts. Rabbi does not receive login, billing, support, scheduling, parent administration, or unknown/general messages.
- Negative assertions:
  - A-NEG-005-1: No unknown/general One Time message defaults to Rabbi Eli.

### CHG-20260721-006
- Classification: HARD_EXACT
- Target: Durable architecture record > Durable records
- Operation: preserve
- Current state: Current master has a global no-GHL rule and first-party BNA communication assumptions without this scoped One Time exception contract.
- Required state: Create dated raw intake, decision/register evidence, durable memory, architecture ADR, workspace role mapping, Super Admin connector contract, and Agent Action schemas.
- Exact payload: {}
- Placement: parent=; before=; after=; order=
- Style allowlist: (none)
- Style forbidden targets: (none)
- Must preserve: Preserve raw operator direction in a dated intake/decision record.
- Must remove: (none)
- Dependencies: (none)
- Supersedes: (none)
- Source spans:
  - RAW-20260721-002:S006 [1309, 1543]: "Create or update the appropriate:\n\n```text\nMEMORY.md\nmemory-topics/\ndocs/architecture/\nworkspace role map\nSuper Admin connector contracts\nAgent Action job schemas\n```\n\nPreserve raw operator direction in a dated intake/decision record."
- Positive assertions:
  - A-POS-006: Create or update the appropriate:

```text
MEMORY.md
memory-topics/
docs/architecture/
workspace role map
Super Admin connector contracts
Agent Action job schemas
```

Preserve raw operator direction in a dated intake/decision record.
  - A-POS-006-1: Durable paths include MEMORY.md, memory-topics/, docs/architecture/, the workspace role map, Super Admin connector contracts, and Agent Action job schemas.
- Negative assertions:

### CHG-20260721-007
- Classification: HARD_EXACT
- Target: Durable architecture record > Ticket ownership taxonomy
- Operation: behavior
- Current state: Current master has a global no-GHL rule and first-party BNA communication assumptions without this scoped One Time exception contract.
- Required state: Keep live_class_question, business_conversation, and technical_ticket distinct with owners One Time, GHL, and Super Admin respectively; technical_ticket requires source workspace.
- Exact payload: {}
- Placement: parent=; before=; after=; order=
- Style allowlist: (none)
- Style forbidden targets: (none)
- Must preserve: (none)
- Must remove: (none)
- Dependencies: (none)
- Supersedes: (none)
- Source spans:
  - RAW-20260721-002:S007 [1562, 1859]: "Separate:\n\n```text\nlive_class_question\nbusiness_conversation\ntechnical_ticket\n```\n\nA live class question is owned by One Time.\n\nA business conversation is owned by GHL.\n\nA technical ticket is owned by Super Admin and includes source workspace.\n\nDo not route all of these into one BNA ticket queue."
- Positive assertions:
  - A-POS-007: Separate:

```text
live_class_question
business_conversation
technical_ticket
```

A live class question is owned by One Time.

A business conversation is owned by GHL.

A technical ticket is owned by Super Admin and includes source workspace.

Do not route all of these into one BNA ticket queue.
  - A-POS-007-1: live_class_question is One Time-owned; business_conversation is GHL-owned; technical_ticket is Super Admin-owned and includes source_workspace.
- Negative assertions:
  - A-NEG-007-1: The three record types do not share one BNA ticket queue.

### CHG-20260721-008
- Classification: HARD_EXACT
- Target: Durable architecture record > Rabbi Telegram contract
- Operation: behavior
- Current state: Current master has a global no-GHL rule and first-party BNA communication assumptions without this scoped One Time exception contract.
- Required state: Telegram is a non-canonical Rabbi interface. Every One Time send/draft/status change is represented in GHL, and AI may never originate Torah answers in Rabbi Eli's name.
- Exact payload: {}
- Placement: parent=; before=; after=; order=
- Style allowlist: (none)
- Style forbidden targets: (none)
- Must preserve: (none)
- Must remove: (none)
- Dependencies: (none)
- Supersedes: (none)
- Source spans:
  - RAW-20260721-002:S008 [1889, 2038]: "Telegram is not the canonical transcript.\n\nEvery send/draft/status change writes to GHL.\n\nDo not allow AI to originate Torah answers in Rabbi's name."
- Positive assertions:
  - A-POS-008: Telegram is not the canonical transcript.

Every send/draft/status change writes to GHL.

Do not allow AI to originate Torah answers in Rabbi's name.
  - A-POS-008-1: GHL is canonical for One Time communication transcripts and state changes.
- Negative assertions:
  - A-NEG-008-1: Telegram is not canonical and AI does not originate Torah answers in Rabbi Eli's name.

### CHG-20260721-009
- Classification: HARD_EXACT
- Target: Durable architecture record > No external mutation
- Operation: behavior
- Current state: Current master has a global no-GHL rule and first-party BNA communication assumptions without this scoped One Time exception contract.
- Required state: This lane performs zero email, Telegram, GHL, DNS, or production-deployment mutations.
- Exact payload: {}
- Placement: parent=; before=; after=; order=
- Style allowlist: (none)
- Style forbidden targets: (none)
- Must preserve: (none)
- Must remove: (none)
- Dependencies: (none)
- Supersedes: (none)
- Source spans:
  - RAW-20260721-002:S009 [2065, 2162]: "No email sends, Telegram sends, GHL mutations, DNS changes or production deployment in this lane."
- Positive assertions:
  - A-POS-009: No email sends, Telegram sends, GHL mutations, DNS changes or production deployment in this lane.
  - A-POS-009-1: EXTERNAL_MUTATIONS: 0
- Negative assertions:
  - A-NEG-009-1: No email send, Telegram send, GHL mutation, DNS change, or production deployment occurred.

### CHG-20260721-011
- Classification: HARD_EXACT
- Target: Durable architecture record > Final response contract
- Operation: preserve
- Current state: Current master has a global no-GHL rule and first-party BNA communication assumptions without this scoped One Time exception contract.
- Required state: The final response begins with the exact six-line status block and then reports branch, head, PR, and durable paths.
- Exact payload: {}
- Placement: parent=; before=; after=; order=
- Style allowlist: (none)
- Style forbidden targets: (none)
- Must preserve: Begin exactly:
- Must remove: (none)
- Dependencies: (none)
- Supersedes: (none)
- Source spans:
  - RAW-20260721-002:S011 [2183, 2448]: "Begin exactly:\n\n```text\nONE_TIME_GHL_EXCEPTION: RECORDED | BLOCKED(<one action>)\nBNA_SCHOOL_ARCHITECTURE: PRESERVED\nSHLOIMIE_DEFAULT_OWNER: YES\nRABBI_TORAH_ONLY: YES\nRESEND_SECURITY_ONLY: YES\nEXTERNAL_MUTATIONS: 0\n```\n\nThen include branch/head/PR and durable paths."
- Positive assertions:
  - A-POS-011: Begin exactly:

```text
ONE_TIME_GHL_EXCEPTION: RECORDED | BLOCKED(<one action>)
BNA_SCHOOL_ARCHITECTURE: PRESERVED
SHLOIMIE_DEFAULT_OWNER: YES
RABBI_TORAH_ONLY: YES
RESEND_SECURITY_ONLY: YES
EXTERNAL_MUTATIONS: 0
```

Then include branch/head/PR and durable paths.
  - A-POS-011-1: ONE_TIME_GHL_EXCEPTION: RECORDED | BLOCKED(<one action>)
BNA_SCHOOL_ARCHITECTURE: PRESERVED
SHLOIMIE_DEFAULT_OWNER: YES
RABBI_TORAH_ONLY: YES
RESEND_SECURITY_ONLY: YES
EXTERNAL_MUTATIONS: 0
- Negative assertions:

## Forbidden

- Do not paraphrase exact payloads.
- Do not weaken HARD_EXACT constraints with SOFT_GOAL language.
- Do not implement unresolved ambiguous changes.
- Do not edit product code before PQC and downstream readiness gates when product/UI work is in scope.
