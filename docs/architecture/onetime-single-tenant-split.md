# One Time Single-Tenant Split

The One Time Mishnah Class can run inside the BNA platform as a scoped partner
workspace today and can later be exported as a partner-owned single-tenant
instance.

Local package boundaries:

- Canonical codebase: `bna-platform`
- Scoped workspace key: `rabbi_sheller_provider`
- Scoped project key: `one_time_mishnah_class`
- Partner owner: Rabbi Elie Scheller
- Operator admin: Shloimie
- Brand config: `config/brands/one-time.json`
- Instance contract: `src/platform/instances/one-time.js`
- Canonical public production target: `https://join.onetimeonetime.com/`
- Canonical public funnel route: `https://join.onetimeonetime.com/one-time/`
- BNA-hosted preview/shared-platform route: `https://bneineviimacademy.org/one-time/`

Target-routing rule:

- App-visible One Time public landing work is not complete when only the
  BNA-hosted preview is updated. Closeout proof must name and verify the target
  being shipped.
- For One Time public production, `join.onetimeonetime.com` must serve the
  focused launch funnel with the headline `Your Child Can Love Learning
  Mishnayos` at both `/` and `/one-time/`.
- In One Time single-tenant runtime (`APP_INSTANCE=onetime` /
  `APP_MODE=single_tenant`), the root route `/` serves
  `public/one-time/index.html`. In normal BNA runtime, `/` remains the BNA
  public homepage.
- The shared BNA codebase may provide components, UI patterns, server routes,
  registries, and release tooling. Classroom/content/community/member records
  remain provider-specific unless an explicit cross-workspace link is approved.
- Target-aware closeout should run
  `npm run release:captain:one-time-public`,
  `npm run one-time:target:guard`, and
  `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com`
  before saying the One Time public funnel is live.

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
