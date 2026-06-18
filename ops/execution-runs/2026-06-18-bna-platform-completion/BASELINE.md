# Baseline

Recovery baseline repaired on 2026-06-18T18:45:00+03:00.

- Recovery branch: `codex/2026-06-18-bna-platform-completion`.
- Base: local `master` at `484563b`.
- PR #2 audit harness was cherry-picked as `31fada4`.
- PR #3 protocol/run setup was cherry-picked as `9ab3f06`.
- Related branches inspected: `codex/operations-ui-audit-harness-clean`, `codex/ramble-to-done-protocol`, `codex/operations-ui-audit-harness`, `codex/2026-06-18-mobile-workspace-audit`, and historical cleanup/release branches listed by `git branch --all`. The dirty original worktree was preserved and not merged.

Canonical runtime finding: Express/static `/operations` serves `public/operations.html` from `server.js`; the public homepage is `public/index.html`.

Audit dependency correction: the old run incorrectly blocked every workstream on audit output. This repaired baseline blocks only authenticated audit package generation and final post-fix audit comparison.

| ID | Current verdict | Evidence | Required delta / blocker |
|---|---|---|---|
| REQ-20260618-112 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-113 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-114 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-115 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-116 | already_satisfied | Commit 31fada4 cherry-picks PR #2 b8baede<br>docs/OPERATIONS-UI-AUDIT.md<br>tests/ops-ui-audit-harness.test.js<br>tools/ops-ui-audit/ | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-117 | blocked | No .runtime/auth/operations-storage-state.json in recovery worktree<br>No ops/ui-audits output folder in recovery worktree | Waiting for user to upload agent-review-package.zip or audit output path |
| REQ-20260618-118 | blocked | Current code/evidence inspection required before closure. | Requires completed local fix batches and authenticated audit package before comparison. |
| REQ-20260618-119 | conflicting | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-120 | conflicting | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-121 | conflicting | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-122 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-123 | missing | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-124 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-125 | missing | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-126 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-127 | missing | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-128 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-129 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-130 | unknown | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-131 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-132 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-133 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-134 | unknown | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-135 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-136 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-137 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-138 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-139 | missing | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-140 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-141 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-142 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-143 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-144 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-145 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-146 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-147 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-148 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-149 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-150 | missing | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-151 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-152 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-153 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-154 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-155 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-156 | blocked | Current code/evidence inspection required before closure. | Production/student data merge requires operator approval after local migration script and dry-run evidence. |
| REQ-20260618-157 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-158 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-159 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-160 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-161 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-162 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-163 | unknown | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-164 | unknown | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-165 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-166 | partial | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-167 | unknown | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-168 | missing | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-169 | missing | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-170 | missing | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-171 | missing | Current code/evidence inspection required before closure. | Implement or verify acceptance criteria in dependency order. |
| REQ-20260618-172 | blocked | Current code/evidence inspection required before closure. | Final gate depends on completing non-blocked local implementation and explicit operator release approval. |
