# Evidence

| ID | Status | Commit | Tests | Evidence | Deployment/live |
|---|---|---|---|---|---|
| REQ-20260618-101 | in_progress | - | - | - | - |
| REQ-20260618-102 | in_progress | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-103 | in_progress | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-104 | in_progress | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-105 | in_progress | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-106 | in_progress | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-107 | in_progress | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-108 | in_progress | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-109 | in_progress | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-110 | in_progress | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-111 | in_progress | - | - | - | - |
| REQ-20260618-112 | done | current batch commit: chore: repair BNA recovery execution run | npm run bna:run:validate PASS after full source/ledger repair | docs/BNA-RAMBLE-TO-DONE.md contains the complete Appendix B protocol<br>BNA-START-HERE.md exists and points to the active run | - |
| REQ-20260618-113 | done | current batch commit: chore: repair BNA recovery execution run | node --test tests/bna-execution-run.test.js PASS 8/8<br>npm run bna:run:validate PASS | scripts/bna-execution-run.mjs validates closed IDs for acceptance criteria<br>ops/execution-runs/requirements.schema.json accepts parent/child metadata<br>tests/bna-execution-run.test.js covers missing acceptance criteria | - |
| REQ-20260618-114 | in_progress | - | - | - | - |
| REQ-20260618-115 | done | current batch commit: chore: repair BNA recovery execution run | npm run bna:run:validate PASS | templates/BNA-CODEX-VERIFICATION-PROMPT.md exists from PR #3<br>EVIDENCE.md and NEXT-SESSION.md regenerated with verifier/resume evidence expectations | - |
| REQ-20260618-116 | already_satisfied | 31fada4 | PR #2 reported node --test tests/ops-ui-audit-harness.test.js PASS 7/7<br>PR #2 reported npm test PASS 771/771 before clean cherry-pick | Commit 31fada4 cherry-picks PR #2 b8baede<br>docs/OPERATIONS-UI-AUDIT.md<br>tests/ops-ui-audit-harness.test.js<br>tools/ops-ui-audit/ | - |
| REQ-20260618-117 | blocked | - | - | No .runtime/auth/operations-storage-state.json in recovery worktree<br>No ops/ui-audits output folder in recovery worktree | - |
| REQ-20260618-118 | blocked | - | - | - | - |
| REQ-20260618-119 | in_progress | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-120 | in_progress | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-121 | in_progress | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-122 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-123 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-124 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-125 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-126 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-127 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-128 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-129 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-130 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-131 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-132 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-133 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-134 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-135 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-136 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-137 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-138 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-139 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-140 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-141 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-142 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-143 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-144 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-145 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-146 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-147 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-148 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-149 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-150 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-151 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-152 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-153 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-154 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-155 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-156 | needs_operator_decision | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-157 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-158 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-159 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-160 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-161 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-162 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-163 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-164 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-165 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-166 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-167 | not_started | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-168 | not_started | - | - | - | - |
| REQ-20260618-169 | not_started | - | - | - | - |
| REQ-20260618-170 | not_started | - | - | - | - |
| REQ-20260618-171 | not_started | - | - | - | - |
| REQ-20260618-172 | blocked | - | - | - | - |

Ledger repair evidence:

- Complete authoritative source imported into `SOURCE.md`.
- Broad blanket audit blocker removed from non-audit child requirements.
- PR #2 and PR #3 clean commits incorporated into one recovery branch.
