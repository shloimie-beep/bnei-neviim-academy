# W4 Integration Notes

Status: complete_local

W4 had no worker branch delta. Prompt 05 completed the missing local One Time
instance package on the integration branch.

Shared-file changes requested by W4:

- `src/platform/index.js`: export `brands`, `instances`, and `integrations`.
- `server.js`: mount a preview-only One Time integration readiness route at
  `/api/bna/one-time/integrations/readiness`.
- `public/operations.html`: expose the mounted Platform Suite view so One Time
  and BNA scoped operators can inspect canonical modules from Operations.

No external release action, secret copy, live email, Zoom mutation, Vimeo upload,
Railway change, DNS change, or production database write was performed.
