# app.onetimeonetime.com Domain Handoff

Date: 2026-06-21
Requirement: REQ-20260619-313

## Status

Blocked before domain attachment. The Railway token available locally is
project-scoped to `skillful-motivation`, and account-level project/service/domain
commands are unauthorized. The prompt forbids adding One Time services or domain
bindings to `skillful-motivation`.

## Intended Binding

- Domain: `app.onetimeonetime.com`
- Railway target project: `one-time-production`
- Railway target service: `one-time-web`
- Do not attach the domain to Postgres.
- Do not change the root `onetimeonetime.com` domain.
- Do not change unrelated BNA DNS.

## DNS Records

No CNAME or TXT verification values have been generated yet. Do not reuse any
old Railway verification value from another service.

After account-level Railway access exists, attach the custom domain to
`one-time-web` and capture the exact values Railway returns:

| Type | Host/Name | Target/Value | Source |
| --- | --- | --- | --- |
| CNAME | pending Railway domain attachment | pending Railway domain attachment | one-time-web |
| TXT | pending Railway domain attachment | pending Railway domain attachment | one-time-web |

## Exact External Action

Authenticate Railway with account-level project/domain permission or provide a
separate One Time project token after the project and service are created. Then
attach `app.onetimeonetime.com` to `one-time-web`, copy the generated CNAME/TXT
records into this file, and only then apply DNS if an authenticated DNS tool is
available and scoped to this subdomain.
