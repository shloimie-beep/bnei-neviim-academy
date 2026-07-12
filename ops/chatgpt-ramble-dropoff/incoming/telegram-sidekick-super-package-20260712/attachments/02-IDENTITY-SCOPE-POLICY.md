# 02 — Identity, Scope, And Surface Policy

## Role hierarchy

Do not preserve the current “any admin-like role satisfies any admin action” shortcut. Use an explicit inheritance graph and deny by default.

```text
super_admin
  -> platform_manager
  -> support_admin
  -> technical_agent

provider_owner
  -> provider_admin
  -> provider_manager
  -> provider_staff

parent and student have relationship scopes, not admin inheritance.
public is never an internal role.
```

The exact graph should reuse current role constants but must be explicit per capability. `operator` cannot satisfy an action merely because some other admin role is allowed.

## Four fixed surface profiles

| Profile | Authority | Data | Memory | External tools |
|---|---|---|---|---|
| Shloimie Telegram | Verified `super_admin`; platform/all | All authorized workspaces; results grouped/labeled | Shloimie identity-private plus authorized operational namespaces | Public web reads; scoped connectors; consequential effects approval-gated |
| Rabbi Telegram | Verified provider owner/admin; fixed One Time scope | Only `rabbi_sheller_provider / one_time_mishnah_class` | Rabbi identity-private plus One Time operational namespaces | Public web reads with egress redaction; One Time connectors only |
| BNA public lead | Anonymous public | Curated BNA public knowledge and lead/support endpoints | Current public session only; short retention | No private connectors or internal tools |
| Robot Scheller public lead | Anonymous One Time public | Curated One Time public knowledge and lead/support endpoints | Current public session only; short retention | No private connectors or internal tools |

## Super-admin semantics

- Shloimie is not hardcoded as BNA `operator`.
- An unscoped broad read may use all authorized workspaces, but the response must group and label each workspace and project.
- A remembered active workspace may narrow ordinary requests when the conversation clearly established it. The assistant must state the scope when ambiguity matters.
- Every mutation names exactly one target workspace/project. Cross-workspace writes show “Acting on: …” in preview and audit.
- Super-admin operational access does not automatically expose another human's identity-private preferences. Shloimie may see One Time workspace operational memory, not Rabbi's private tone/preferences unless Rabbi shared them into workspace memory.

## Rabbi semantics

- The channel profile maximum scope is immutable: workspace `rabbi_sheller_provider`, project `one_time_mishnah_class`.
- The verified identity membership must also grant that provider role. Profile and membership are intersected.
- Any tool argument, prompt, URL, memory, or model plan naming BNA/platform scope is rejected; it is not silently ignored.
- Scope denial happens before retrieval, counts, embeddings/ranking, or LLM context construction, so even row counts/names cannot leak.
- Connector identities must belong to the One Time workspace. A platform/BNA mailbox, Drive root, calendar, or WAPI account cannot be selected.
- Rabbi can create tracked development/support work inside his workspace, but cannot run raw Codex CLI, deployment, migrations, secrets, or infrastructure commands.

## Public-agent isolation

- Public profiles receive a separately generated public capability manifest. Internal tools are absent, not merely denied after planning.
- They have no private route resolver output, internal object references, assistant memories, Codex/agent delegation, internal question lists, student/parent/contact history, billing, or integrations.
- A public session is not linked to an internal identity by matching a name, email, or phone. Linking requires authenticated opt-in and promotes only reviewed CRM facts, never the public transcript as private memory.
- The existing One Time lead-bot state machine and protected class-link policy remain canonical. Shared assistant infrastructure cannot weaken it.

## Identity linking

Internal Telegram binding is established only from an authenticated Operations/provider screen:

1. Create a random 256-bit one-time link token; store only its hash, intended identity, intended channel instance, creator, and ten-minute expiry.
2. The user sends `/link CODE` in a private chat to the intended bot.
3. In one transaction, verify token, expected bot/channel instance, private chat, and unused/unexpired state.
4. HMAC Telegram `from.id` and `chat.id` for lookup; field-encrypt the chat ID required for outbound delivery.
5. Create a verified binding and atomically mark the token used.
6. Resolve future turns from binding -> assistant identity -> current platform role/workspace memberships.

Never bind by Telegram username, display name, email guess, or a chat ID stored in prompt files. Environment allowlists are an additional bootstrap deny control, not the authorization database.

## Worker/service authentication

Replace human Basic-auth bridge credentials with a channel-instance service identity. Sign request body, timestamp, and nonce with a per-instance secret. Enforce a short clock window and one-use nonce. That service may ingest envelopes, claim delivery, report status, and acknowledge send/failure. It cannot submit a role, workspace, project, identity, approval, or domain action.

## Agent delegation

Internal agents do not inherit blanket super-admin rights. A planner creates a short-lived delegation binding:

- principal identity;
- delegate service identity;
- conversation/plan/run;
- workspace/project;
- allowed capability IDs;
- allowed memory namespaces;
- expiry/revocation;
- whether memory proposals are allowed.

Agents may propose memory but cannot self-grant scope or activate sensitive/workspace memory. Public service identities can never receive an internal delegation.

## Required negative tests

- Unknown, revoked, wrong-bot, group-chat, wrong-chat, and unverified identities are denied before planning.
- Request/body/prompt `actor_role=super_admin` or `workspace=bna` cannot alter scope.
- Rabbi asks for BNA students/questions/tasks: 403/denied with zero query rows and no leaked counts.
- Public prompt injection requests private tools/memory: public boundary response and no private capability exposure.
- Two people with the same name/email display text never share identity or memory.
- A changed membership or revoked binding is honored immediately, independent of cached conversations.
