# RAW-20260712-014 - Shared CRM And Communication Agents Addendum

Source channel: codex_chat
Captured at: 2026-07-12T23:12:00+03:00
Operator: Shloimie
Active goal: Shared BNA / One Time CRM, communication-agent, inbound pipeline, and deployment addendum

## Raw Source Summary

The operator supplied a `BNA_GOAL_MODE_EXECUTION_PACKET` titled:

> Unify the BNA and One Time CRM platform, eliminate cross-workspace contamination, consolidate inbound messaging, and build channel-assigned communication agents

The packet is an architectural addendum to the existing One Time CRM Contacts/Inbox completion packet. It says not to replace the existing CRM geometry, readability, contact-workspace, Inbox, performance, testing, or deployment requirements. It changes four contracts:

1. BNA and One Time use one shared CRM implementation.
2. Contact records remain strictly workspace-isolated.
3. WhatsApp and email use one inbound-contact/conversation pipeline.
4. Communication-agent instructions and knowledge are assigned to channels instead of hard-coded inside a WhatsApp-only bot.

The packet includes phase/workstream requirements for:

- current-work collision check;
- one shared CRM product;
- dedicated contact workspace;
- removal of internal/dead-end UI copy;
- workspace-scoped contact identity model;
- canonical contact aggregate service;
- one inbound communication pipeline;
- WhatsApp contact creation without ordinary automatic task creation;
- communication-agent data model separate from build/QA agents;
- one One Time parent information agent assigned to WhatsApp and email;
- reconciled One Time knowledge bundle;
- OpenAI response layer with deterministic policy gates;
- Communication Agents UI;
- safe One Time WhatsApp activation;
- required data-isolation, CRM parity, inbound convergence, task-policy, agent-behavior, and UX tests;
- bounded commits, push, deploy, Railway doctor, canonical Operations browser tests, screenshots, redacted WAPI/Resend receipts, zero-automatic-task proof, ledger/changelog updates, and final report.

## Operator Follow-Ups

Exact follow-up correction:

> Before you start this whole new job the telegram is configured with the rabbi he is getting telegram messages so whatever you have to do you can test that

Exact follow-up correction:

> In terms of the agent mode prompts so do whatever you can without me running them whatever type of verifications you could run just do that instead

## Intake Notes

- Current Codex chat contains the full packet body and is the raw source of record for the complete workstream text.
- Repo register: `tasks-pending/2026-07-12-shared-crm-communication-agents-addendum.md`.
- Execution run: `ops/execution-runs/2026-07-12-shared-crm-communication-agents-addendum`.
- Direct Agent Mode replacement proof was run by Codex per operator instruction:
  `ops/agent-review-proof-readiness/latest-rabbi-agent-review-proof-readiness-live.md`.
