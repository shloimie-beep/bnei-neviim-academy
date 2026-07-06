# RAW-20260706-970 - Clean Deploy All Pending Work

Source: codex_chat
Captured: 2026-07-06
Parse status: registered
Requirement register: `tasks-pending/2026-07-06-clean-deploy-all-pending.md`

## Raw intake

> I need you to debug clean and deploy everything that wasn't already deployed clean the boat and launched there's a lot of rambles that I made and I just want you to go through and clean everything up and make sure everything is live and then tell me briefly where we're holding and like bullet points and like idiot language explain it to me clearly what the next steps are

## Initial interpretation

The operator is asking for a broad goal-mode cleanup pass across recent
ramble-derived BNA / One Time work:

- inventory what is already live, what is local-only, what is pushed but not
  deployed, and what is blocked;
- debug and verify safe pending work;
- deploy only scoped work that passes the release gate;
- do not perform unsafe external writes such as sends, payments, access grants,
  DNS, credential mutations, provider-account changes, Drive writes, or
  production-data mutations without the existing explicit approval gates;
- report current status and next steps in concise plain language.
