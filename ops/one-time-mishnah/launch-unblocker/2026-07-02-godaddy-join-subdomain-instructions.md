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

## Railway Step Completed

Codex attached the custom domain `join.onetimeonetime.com` to the separate
One Time Railway service `one-time-web`.

## GoDaddy DNS Step

In GoDaddy DNS for `onetimeonetime.com`, create/update only these records:

| Field | Value |
| --- | --- |
| Type | `CNAME` |
| Name/Host | `join` |
| Value/Points to | `awaz36ln.up.railway.app` |
| TTL | Default |

| Field | Value |
| --- | --- |
| Type | `TXT` |
| Name/Host | `_railway-verify.join` |
| Value | `railway-verify=73e92e55cb07e5a0abdb0a72f204d437d915c3134e844af12f419407632a97d6` |
| TTL | Default |

If GoDaddy already has a `join` record, update only that record after verifying
it is not used for another active service.

## Confirmation To Give Codex

After the DNS record is saved, provide only:

- Railway project label;
- Railway service label;
- Railway environment label;
- whether GoDaddy has saved the `join` CNAME and `_railway-verify.join` TXT records;
- whether Railway shows the domain as validating/active;
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
