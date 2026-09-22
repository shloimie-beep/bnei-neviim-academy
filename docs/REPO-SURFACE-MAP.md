# Repo Surface Map

Before product-quality implementation, the agent must produce or update a
surface map for affected areas. Implementation packets consume the surface map
instead of rediscovering everything from scratch.

Suggested output paths:

- `ops/surface-maps/YYYY-MM-DD-<slug>-surface-map.md`
- `ops/surface-maps/YYYY-MM-DD-<slug>-surface-map.json`

## Required Surface Map Fields

- routes;
- query params;
- view classes;
- workspace/project;
- visible nav items;
- subnav/filter rails;
- major render functions/components;
- server/API endpoints;
- database/readback sources;
- action registry entries;
- route registry entries;
- smoke/test files;
- screenshot/audit scripts;
- support-only diagnostics;
- external-provider setup points.

## Rabbi / One Time Surface Map

For Rabbi Sheller / One Time UI work, the surface map must include:

- Operations route variants for `rabbi_sheller_provider` /
  `one_time_mishnah_class`;
- CRM, pipeline, contacts/members, classes, community/questions,
  communications, payments/access, tasks/decisions, settings, and support
  drawer surfaces;
- public/member/student/parent portal routes when the packet affects portal
  work;
- action registry coverage for visible controls;
- route registry coverage for every affected route;
- screenshot/audit scripts and required viewports;
- support/admin diagnostics and where they are role-gated;
- provider setup points for email, Stripe/payment, DNS, Zoom, Vimeo, Drive,
  WhatsApp/Telegram, and access grants, explicitly separated from UI cleanup.

## Consumption Rule

Implementation packets must name the surface map they consume. If the surface
map is missing or stale, create an audit/surface-map packet before code.
