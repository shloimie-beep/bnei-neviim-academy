# Lane Handoff - assistant-ramble-usage

| Field | Value |
|---|---|
| Branch | `codex/closeout-assistant-ramble-usage-20260624` |
| Base | `codex/clean-slate-integration-20260624` after control PR publication |
| Owner | Codex lane worker |
| Scope | Website/Operations assistant runtime, Telegram/ramble intake behavior, provider-neutral hosted assistant usage, raw-first parsing, usage/readiness proof. |
| Forbidden central files | See `../../CONTROL.md`; do not edit central run, task, memory, ledger, changelog, or control files. |

## Objective

Close assistant and ramble usage from the reconciled base, proving raw-first intake, provider-neutral chat behavior, and no accidental Codex/background-queue language for ordinary conversation.

## Approved Effects

Local runtime tests, local no-send Telegram/parser smokes, and read-only configured diagnostics are approved. No real Telegram/email/WhatsApp send, production DB mutation, credential change, or deployment is approved in this lane.

## Required Closeout

Record raw-intake/parser evidence and any hosted-provider readiness blockers. If a test would send a real message, replace it with no-send proof or block it.

## Closeout Summary

Implemented additive, no-send assistant closeout work:

- assistant runtime matrix proof across public, Operations, provider, parent, student, One Time/member, and Telegram surfaces
- provider API usage persistence interface plus migration proposal
- exact model credential readiness states and disabled reasons
- pure ramble-to-done routing package with dedupe, supersession, no-lost-sentence mapping, and Decision re-evaluation
- focused tests for usage, model readiness, ramble routing, and shared control-plane coverage

Production migration, deploy, live provider call, and real Telegram/email/WhatsApp sends remain blocked by lane scope and explicit approval requirements. See `BLOCKERS.md`.
