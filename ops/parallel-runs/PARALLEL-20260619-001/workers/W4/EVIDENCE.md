# W4 Evidence

Implemented local contracts:

- `src/platform/brands/index.js`
- `src/platform/instances/one-time.js`
- `src/platform/integrations/readiness.js`
- `config/brands/one-time.json`
- `docs/architecture/onetime-single-tenant-split.md`
- `docs/integrations/onetime-vimeo-zoom-resend-readiness.md`
- `tests/instances/w4-onetime-instance.test.js`
- `tests/integrations/w4-onetime-readiness.test.js`

Proof required at final gate:

- W4 focused Node tests pass.
- Server route returns preview-only payload locally.
- No secret values or external writes are included.
