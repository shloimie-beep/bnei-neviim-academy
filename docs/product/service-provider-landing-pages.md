# Service Provider Landing Pages

Service provider landing pages are configured public review surfaces that share the BNA Express/static host while preserving provider branding and privacy scope.

## Current Shared Review

- Provider site key: `one_time`
- Config: `config/service-provider-sites/one-time.json`
- Brand config: `config/brands/one-time.json`
- Public route family: `/one-time`, `/one-time/mishnayos`, `/one-time/us`, `/one-time/uk`, `/one-time/israel`, `/one-time/interest`, `/one-time/member-login`
- Review data APIs: `/api/one-time-review*`

## Rules

- Public pages must not expose Operations, parent, student, provider, or private BNA data.
- Review pages may link to TEST-only review routes when clearly labeled.
- Live email, payment, access, Zoom, Vimeo, DNS, Railway, and external CRM writes require separate approval and evidence.
- Media assets must be committed under provider-scoped folders and must not include raw video or unapproved child/crowd imagery.
