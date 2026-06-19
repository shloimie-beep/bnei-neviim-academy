# One Time Single-Tenant Split

The One Time Mishnah Class can run inside the BNA platform as a scoped partner
workspace today and can later be exported as a partner-owned single-tenant
instance.

Local package boundaries:

- Canonical codebase: `bna-platform`
- Scoped workspace key: `one_time_mishnah_class`
- Partner owner: Rabbi Elie Scheller
- Operator admin: Shloimie
- Brand config: `config/brands/one-time.json`
- Instance contract: `src/platform/instances/one-time.js`

Single-tenant release gates:

- Operator approval for the split
- Separate Railway service or deployment environment
- Separate production database URL and migration pass
- Separate domain and DNS records
- Separate Vimeo or video-hosting authorization
- Separate Zoom authorization
- Separate Resend verified domain
- Live smoke after deploy

No live deploy, DNS, provider mutation, production database write, or secret copy
is part of the local integration package.
