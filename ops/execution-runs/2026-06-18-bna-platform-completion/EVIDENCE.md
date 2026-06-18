# Evidence

| ID | Status | Commit | Tests | Evidence | Deployment/live |
|---|---|---|---|---|---|
| REQ-20260618-101 | in_progress | - | - | - | - |
| REQ-20260618-102 | in_progress | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-103 | in_progress | - | - | - | Release approval/deploy pending; not closed. |
| REQ-20260618-104 | in_progress | current batch commit: feat: add operations workspace selector scoping<br>current batch commit: fix: clear workspace switch context | node --test tests/operations-workspace-selector.test.js PASS 5/5<br>npm test PASS 82/82 | Operations shell now includes an identity-aware workspace context control for super-admin selection versus ordinary scoped-user locked context.<br>Workspace changes now reset stale module subsection, student, content selection, prompt expansion, and task-modal context before reloading scoped data. | Release approval/deploy pending; not closed. |
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
| REQ-20260618-119 | needs_verification | - | node --test tests/pwa-identity.test.js PASS 5/5<br>node --check server.js PASS<br>node --check public/public-sw.js PASS<br>node --check public/operations-sw.js PASS<br>npm test PASS 57/57 | Local PWA guardrail implementation changed public/manifest.json, public/operations-manifest.json, public/parent-manifest.json, public/public-sw.js, public/operations-sw.js, public/icons/operations-icon.svg, public/icons/parent-icon.svg, public/index.html, public/operations.html, public/operations-login.html, public/signup.html, public/signup-he.html, server.js, tests/pwa-identity.test.js | Release approval/deploy pending; not closed. |
| REQ-20260618-120 | needs_verification | - | node --test tests/pwa-identity.test.js PASS 5/5<br>node --check server.js PASS<br>node --check public/public-sw.js PASS<br>node --check public/operations-sw.js PASS<br>npm test PASS 57/57 | Local PWA guardrail implementation changed public/manifest.json, public/operations-manifest.json, public/parent-manifest.json, public/public-sw.js, public/operations-sw.js, public/icons/operations-icon.svg, public/icons/parent-icon.svg, public/index.html, public/operations.html, public/operations-login.html, public/signup.html, public/signup-he.html, server.js, tests/pwa-identity.test.js | Release approval/deploy pending; not closed. |
| REQ-20260618-121 | needs_verification | - | node --test tests/pwa-identity.test.js PASS 5/5<br>node --check server.js PASS<br>node --check public/public-sw.js PASS<br>node --check public/operations-sw.js PASS<br>npm test PASS 57/57 | Local PWA guardrail implementation changed public/manifest.json, public/operations-manifest.json, public/parent-manifest.json, public/public-sw.js, public/operations-sw.js, public/icons/operations-icon.svg, public/icons/parent-icon.svg, public/index.html, public/operations.html, public/operations-login.html, public/signup.html, public/signup-he.html, server.js, tests/pwa-identity.test.js | Release approval/deploy pending; not closed. |
| REQ-20260618-122 | needs_verification | - | node --test tests/pwa-identity.test.js PASS 6/6<br>npm run bna:run:validate PASS | Public homepage standalone Operations redirect was removed in the prior PWA batch.<br>Homepage nav is sticky/in-flow and hero desktop/mobile margin-top is zero. | Release approval/deploy pending; not closed. |
| REQ-20260618-123 | needs_verification | - | node --test tests/workspace-scope.test.js PASS 5/5<br>node --check server.js PASS<br>node --check src/lib/bna/workspace-scope.js PASS<br>npm test PASS 63/63<br>npm run bna:run:validate PASS | Workspace taxonomy module defines exactly school, service_provider, family.<br>server.js uses super_admin global context and service_provider workspace context for One Time login compatibility. | Release approval/deploy pending; not closed. |
| REQ-20260618-124 | in_progress | current batch commit: feat: add workspace id scoping foundation<br>current batch commit: feat: add operations workspace selector scoping | node --check server.js PASS<br>node --check tests/workspace-schema.test.js PASS<br>node --test tests/workspace-scope.test.js tests/workspace-schema.test.js PASS 10/10<br>node --test tests/operations-workspace-selector.test.js tests/workspace-auth.test.js tests/workspace-http-isolation.test.js PASS 13/13<br>npm test PASS 82/82 | server.js defines bna_workspaces and nullable workspace_id foreign keys for workspace-owned runtime tables.<br>createWorkspaceScopeMigrationSQL adds safe idempotent workspace_id columns and indexes for existing installs.<br>ensureDefaultWorkspaces seeds BNA school and One Time service-provider workspaces without creating a super_admin workspace type.<br>backfillWorkspaceScope maps projects, tasks, comments, students, payments, devices, Torah learning, accountability, group goals, content jobs, class sessions, outputs, bundles, and prompt examples into workspace scope.<br>Primary create paths now write workspace_id immediately from project, signup, student, device, group goal, content job, output, or default BNA workspace.<br>Operations UI now carries the selected/scoped workspace into task API loading, visible task filter state, and task create/edit project selection. | Release approval/deploy pending; not closed. |
| REQ-20260618-125 | needs_verification | current batch commit: test: add HTTP workspace isolation coverage | node --check server.js PASS<br>node --check src/lib/bna/workspace-auth.js PASS<br>node --check tests/workspace-http-isolation.test.js PASS<br>node --test tests/workspace-auth.test.js tests/workspace-http-isolation.test.js PASS 9/9<br>npm test PASS 77/77 | src/lib/bna/workspace-auth.js centralizes scoped route allow/deny decisions and direct task-row access checks.<br>server.js requireAdmin now uses scopedRouteAllowed for scoped identities instead of local ad hoc route checks.<br>server.js assertTaskAccess now uses assertScopedTaskAccess before comments, updates, and deletes on direct task IDs.<br>Task comments now inherit workspace_id from their parent task/project on insert.<br>Scoped ordinary workspace users are denied internal pending-brief and agent-fleet routes.<br>tests/workspace-auth.test.js proves scoped ordinary users cannot enumerate students, signups, payment intake, payments, content jobs, class sessions, content bundles, pending briefs, or agent-fleet status and cannot access another project task row by changing ID.<br>tests/workspace-http-isolation.test.js starts the real Express app with mocked DB rows and proves scoped users are denied cross-module GET/POST/PATCH routes before DB access, denied BNA task comments by changed ID, and allowed One Time task comments. | Release approval/deploy pending; not closed. |
| REQ-20260618-126 | needs_verification | current batch commit: feat: add operations workspace selector scoping | node --check server.js PASS<br>node --check tests/operations-workspace-selector.test.js PASS<br>Operations HTML script parse via vm.Script PASS (2 script blocks)<br>node --test tests/operations-workspace-selector.test.js tests/workspace-auth.test.js tests/workspace-http-isolation.test.js PASS 13/13<br>npm test PASS 82/82 | public/operations.html renders an identity-aware workspace context control: super-admin/global scope sees a workspace selector, ordinary scoped users see a locked workspace context label.<br>Super-admin workspace choices include canonical workspace type labels from /api/bna/projects, with BNA as School and One Time Mishnah Class as Service provider.<br>selectedProjectFilter drives task API loading, URL/localStorage selector persistence, task project filter chips, and task create/edit project locking.<br>Scoped ordinary users no longer call the global-only agent-fleet status endpoint from loadData.<br>/api/bna/projects returns workspace_type, workspace_key, and workspace_name metadata while still narrowing scoped identities to their project. | Release approval/deploy pending; not closed. |
| REQ-20260618-127 | needs_verification | current batch commit: fix: clear workspace switch context | node --check tests/operations-workspace-selector.test.js PASS<br>Operations HTML script parse via vm.Script PASS (2 script blocks)<br>node --test tests/operations-workspace-selector.test.js PASS 5/5<br>npm test PASS 82/82 | resetWorkspaceScopedUiState clears module subsection state, task filters, content filters, selected contact, selected student, student filters, selected/expanded content jobs, expanded prompt context, open task modal state, and task comments.<br>setWorkspaceProject routes workspace changes through resetWorkspaceScopedUiState, resets the URL to tasks/overview, removes stale student query state, persists the selected workspace, and reloads scoped data. | Release approval/deploy pending; not closed. |
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
| REQ-20260618-170 | needs_verification | current batch commit: test: add HTTP workspace isolation coverage | node --test tests/workspace-auth.test.js tests/workspace-http-isolation.test.js PASS 9/9<br>npm test PASS 77/77 | tests/workspace-auth.test.js adds negative backend guard tests for ordinary workspace users on students, signups, accounting/payment, content, internal pending briefs, agent-fleet status, and direct task-ID access.<br>tests/workspace-http-isolation.test.js exercises the real Express middleware and direct task access with mocked cross-workspace rows.<br>HTTP tests prove denied scoped cross-module requests do not touch the database and changed task IDs cannot read another workspace comments. | - |
| REQ-20260618-171 | done | current batch commit: fix: separate public and operations PWA identities | node --test tests/pwa-identity.test.js PASS 5/5<br>npm test PASS 57/57<br>node --test tests/pwa-identity.test.js PASS 6/6 | tests/pwa-identity.test.js asserts manifest IDs, page manifest links, service-worker cache names, and no-store header coverage. | - |
| REQ-20260618-172 | blocked | - | - | - | - |

Ledger repair evidence:

- Complete authoritative source imported into `SOURCE.md`.
- Broad blanket audit blocker removed from non-audit child requirements.
- PR #2 and PR #3 clean commits incorporated into one recovery branch.
