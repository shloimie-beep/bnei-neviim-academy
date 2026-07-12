# Lane 06 — Full App Capability And Button Parity

**Packet role:** implementation in sub-batches
**Owner:** Codex
**Depends on:** Lanes 02–05
**Scope:** all approved app reads/navigation/drafts/actions, profile-filtered

## Mission

Make natural language route to every intentionally assistant-enabled app behavior without browser clicking or fake parity.

## Sub-batches

1. App reads: tasks, decisions, students/parents, providers/leads/contacts, communications, calendar, content/library, integrations, agent status.
2. Secure navigation: canonical route/deep-link capability for internal buttons/pages.
3. Drafts: email, newsletter, social, content, automation, calendar, provider/studio assets.
4. Reversible internal writes through typed action runner.
5. Sensitive/internal/external previews and approval mappings; activation remains later where connector policy requires.
6. Helper-only tools: implement real contracts, alias to existing canonical handlers, or mark blocked/unavailable. Never leave packet-only wrappers advertised as execution.

## Rules

- Keep one source of truth and generated aliases.
- Every write targets one explicit workspace/project.
- No browser-click substitution.
- No unconditional task fallback.
- Hebrew and English intent/negative corpus for every business capability.
- “Every button” excludes channel-local UI mechanics but includes secure navigation for meaningful destinations.

## Acceptance

- 100% manifest/profile structural gate.
- Every enabled business capability runtime-tested.
- >=95% golden routing overall; high-risk/read/scope cases 100%; zero high-risk false positives.
- Current UI/action/route counts reconciled and generated report fresh.
- Public profiles still expose zero private capabilities.

## Handback

Return counts by business/deep-link/channel-local/disabled/external-blocked, routing score by language/domain/profile, exact exclusions, and remaining connector blockers.
