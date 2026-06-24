# vimeo-media Tests

## Passed

- `node --test tests/vimeo-media-integration-readiness.test.js`
- `node --test tests/provider-integrations-secret-storage.test.js`
- `node --test tests/one-time-media-local-pipeline.test.js`
- `node --test tests/one-time-recording-vimeo-pipeline.test.js`
- `node scripts/vimeo-private-smoke.mjs --json`
  - Result: `preview_only`
  - `external_write_performed=false`
  - `public_publish_performed=false`
- `git diff --check`
- `npm run secrets:audit`

## Prior Full Suite Note

The lane previously ran `node --test` and recorded 1137 passing, 2 failing in
`MEDIA-PIPELINE-MATRIX.md`. The failing checks were action-registry artifact
hash mismatches outside the Vimeo lane. Final integrator should use the
release-wide gate after all lanes are merged.
