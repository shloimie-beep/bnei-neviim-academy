# Workspace Model Memory

- Active workspace categories are Super Admin, School, Service Provider, and
  Family.
- Platform-facing canonical taxonomy separates `platform_control`,
  `bna_school`, and the `one_time` external product connector. One Time's GHL
  communications exception does not change BNA School's first-party CRM
  architecture.
- Content, communications, tasks, prompts, helper context, and portal data must
  preserve workspace/project scope.
- BNA, One Time / Rabbi, provider, family, parent, and student data must not bleed
  across scopes.
- Platform patterns/components may be shared, but provider-specific classroom,
  content, community, contact, communication, payment/access, question, and
  progress records stay isolated by workspace/project unless an explicit
  cross-workspace link exists.
- Relevant standing goals: `GOAL-CORE-006` and `GOAL-CORE-009`.
