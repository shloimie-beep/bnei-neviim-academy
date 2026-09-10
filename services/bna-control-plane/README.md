# BNA Control Plane

This service is the first additive review scaffold for an isolated internal
`bna-control-plane`. It is intentionally not wired into the BNA product
runtime.

## Boundary

- Own runtime, auth/session policy, contracts, migrations, and storage
  interfaces.
- No product pages, product cookies, product sessions, root `server.js`,
  provider SDKs, shell execution, Codex, Railway, GitHub write, or deployment
  hooks.
- Products own detailed support records. The control plane stores only a
  redacted case index and asynchronous command/result state.
- Telegram is link-only alert transport. It cannot create commands or mutate
  product/support state.

## Local Checks

```bash
node --check services/bna-control-plane/src/app.js
node --test services/bna-control-plane/test/*.test.js
```

Non-test startup fails closed unless independent control-plane auth, database,
session, and signing configuration is present. Tests use generated synthetic
keys and in-memory storage only.
