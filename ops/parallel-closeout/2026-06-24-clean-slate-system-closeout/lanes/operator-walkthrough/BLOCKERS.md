# operator-walkthrough Blockers

Known blockers:

- `LANE-BLOCKER-OPERATOR-WALKTHROUGH-001`: live walkthrough requires a
  deployed release candidate and explicit live-smoke approval.
- `LANE-BLOCKER-OPERATOR-WALKTHROUGH-002`: GitHub workflow-scope permission
  remains unavailable for adding/changing workflow files. A repo admin or
  workflow-scoped token is needed for attached CI workflow changes.
- `LANE-BLOCKER-OPERATOR-WALKTHROUGH-003`: real sends, charges, uploads, DNS
  changes, credential rotations, deployment, and production mutations are not
  approved in this lane.

No local setup-center blocker remains for merge. The setup center is safe static
UI plus docs unless the final integrator applies the protected Operations wiring
from `docs/operator-walkthroughs/SHARED-PATCH.diff`.
