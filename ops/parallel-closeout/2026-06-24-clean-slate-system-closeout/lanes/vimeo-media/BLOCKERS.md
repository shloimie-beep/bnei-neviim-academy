# vimeo-media Blockers

Known blockers:

- `LANE-BLOCKER-VIMEO-001`: approved Vimeo test account/token/folder and a
  generated non-sensitive synthetic asset are required before any real private
  synthetic API upload.
- `LANE-BLOCKER-VIMEO-002`: real provider media fetch, upload,
  publish/unpublish/delete, member visibility changes, watch-progress writes,
  and notifications are not approved in this lane.
- `LANE-BLOCKER-VIMEO-003`: live member playback and member-library visibility
  require a deployed release candidate plus entitlement-scoped live smoke.

Manual Vimeo URL attachment remains the credential-free path. No real Vimeo API
write, public publish, member visibility change, production mutation, deploy, or
secret exposure was performed.
