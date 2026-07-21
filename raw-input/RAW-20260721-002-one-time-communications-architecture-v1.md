Run this after the urgent event lane is stable.

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
