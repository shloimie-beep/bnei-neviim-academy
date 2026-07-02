# GoDaddy Instructions - `join.onetimeonetime.com`

Source: `RAW-20260702-003`
Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

## Scope

Configure only the temporary One Time launch subdomain:

- `join.onetimeonetime.com`

Do not change:

- `onetimeonetime.com`
- `www.onetimeonetime.com`
- nameservers
- apex/root forwarding
- any BNA domain

## Required Railway Step First

In the separate One Time Railway service, add a custom domain for:

```text
join.onetimeonetime.com
```

Railway will show the required DNS target. Use that provider-generated value;
do not guess it.

## GoDaddy DNS Step

In GoDaddy DNS for `onetimeonetime.com`, create or update only the `join`
record:

| Field | Value |
| --- | --- |
| Type | `CNAME` unless Railway gives a different exact type |
| Name/Host | `join` |
| Value/Points to | Railway-provided target for the One Time service |
| TTL | Default or 600 seconds if available |

If GoDaddy already has a `join` record, update only that record after verifying
it is not used for another active service.

## Confirmation To Give Codex

After the DNS record is saved, provide only:

- Railway project label;
- Railway service label;
- Railway environment label;
- the DNS record type for `join`;
- whether Railway shows the domain as attached/validating/active;
- confirmation that apex/root `onetimeonetime.com` was not changed.

Do not send secrets, API tokens, private database URLs, or screenshots that show
secret values.

## Codex Verification After DNS

Codex should run:

```bash
npm run one-time:setup:check
npm run one-time:railway-target:guard
```

When the checker reports the join domain and Railway target are ready, Codex can
run the post-setup deploy/live-smoke packet:

```text
ops/prompt-packets/2026-07-02-one-time-post-setup-live-closeout/00-railway-db-join-domain-deploy-live-smoke.md
```

## Safety

This handoff does not approve apex/root DNS mutation, real campaign send, live
Stripe payment, WhatsApp broadcast, hard delete, or external CRM/GHL runtime.
