# Test Results

Carried-forward evidence from PRs:

- PR #2 reported: PASS `node --test tests/ops-ui-audit-harness.test.js` 7/7.
- PR #2 reported: PASS `npm test` 771/771 in the implementation worktree before clean cherry-pick.
- PR #3 reported: PASS `node --test tests/bna-execution-run.test.js` 7/7.
- PR #3 reported: PASS `npm test` 778/778.

Recovery-branch tests run after this repair will be appended below.

Recovery branch after ledger repair (2026-06-18T18:58:00+03:00):

- PASS `npm run bna:run:status` (72 requirements; work remains).
- PASS `npm run bna:run:validate`.
- PASS `node --test tests/bna-execution-run.test.js` 8/8.

PWA identity/cache guardrail batch (2026-06-18T19:12:00+03:00):

- PASS `node --test tests/pwa-identity.test.js` 5/5.
- PASS `node --check server.js`.
- PASS `node --check public/public-sw.js`.
- PASS `node --check public/operations-sw.js`.

Full local Node suite after PWA batch (2026-06-18T19:18:00+03:00):

- PASS `npm test` 57/57.

Public homepage PWA cleanup (2026-06-18T19:28:00+03:00):

- PASS `node --test tests/pwa-identity.test.js` 6/6.
- PASS `npm run bna:run:validate`.

Workspace taxonomy/auth foundation (2026-06-18T19:42:00+03:00):

- PASS `node --test tests/workspace-scope.test.js` 5/5.
- PASS `node --check server.js`.
- PASS `node --check src/lib/bna/workspace-scope.js`.
- PASS `npm test` 63/63.
- PASS `npm run bna:run:validate`.

Workspace workspace_id scoping foundation (2026-06-18T19:49:34+03:00):

- PASS `node --check server.js`.
- PASS `node --check tests/workspace-schema.test.js`.
- PASS `node --test tests/workspace-scope.test.js tests/workspace-schema.test.js` 10/10.
- PASS `npm test` 68/68.
- PASS `npm run bna:run:validate` before run-file update.

Workspace authorization negative guard tests (2026-06-18T19:54:44+03:00):

- PASS `node --check src/lib/bna/workspace-auth.js`.
- PASS `node --check server.js`.
- PASS `node --test tests/workspace-scope.test.js tests/workspace-schema.test.js tests/workspace-auth.test.js` 16/16.
- PASS `npm test` 74/74.

HTTP workspace isolation coverage (2026-06-18T20:02:08+03:00):

- PASS `node --check server.js`.
- PASS `node --check src/lib/bna/workspace-auth.js`.
- PASS `node --check tests/workspace-http-isolation.test.js`.
- PASS `node --test tests/workspace-auth.test.js tests/workspace-http-isolation.test.js` 9/9.
- PASS `npm test` 77/77.

Operations workspace selector scoping (2026-06-18T20:14:02+03:00):

- PASS `node --check server.js`.
- PASS `node --check tests/operations-workspace-selector.test.js`.
- PASS Operations HTML script parse via `vm.Script` (2 script blocks).
- PASS `node --test tests/operations-workspace-selector.test.js tests/workspace-auth.test.js tests/workspace-http-isolation.test.js` 13/13.
- PASS `npm test` 81/81.

Workspace switch stale-context cleanup (2026-06-18T20:18:55+03:00):

- PASS `node --check tests/operations-workspace-selector.test.js`.
- PASS Operations HTML script parse via `vm.Script` (2 script blocks).
- PASS `node --test tests/operations-workspace-selector.test.js` 5/5.
- PASS `npm test` 82/82.

Operations module toolbar/sidebar simplification (2026-06-18T20:24:59+03:00):

- PASS `node --check tests/operations-module-toolbar.test.js`.
- PASS Operations HTML script parse via `vm.Script` (2 script blocks).
- PASS `node --test tests/operations-module-toolbar.test.js tests/operations-workspace-selector.test.js` 8/8.
- PASS `npm test` 85/85.

Operations shell layout stability (2026-06-18T20:28:55+03:00):

- PASS `node --check tests/operations-layout-stability.test.js`.
- PASS Operations HTML script parse via `vm.Script` (2 script blocks).
- PASS `node --test tests/operations-layout-stability.test.js tests/operations-module-toolbar.test.js tests/operations-workspace-selector.test.js` 11/11.
- PASS `npm test` 88/88.

Operations identity/header alignment (2026-06-18T20:33:30+03:00):

- PASS `node --check tests/operations-identity-header.test.js`.
- PASS Operations, Operations Login, and Student Portal script parse via `vm.Script`.
- PASS `node --test tests/operations-identity-header.test.js tests/pwa-identity.test.js` 10/10.
- PASS `npm test` 92/92.

Operations design primitives (2026-06-18T20:37:34+03:00):

- PASS `node --check tests/operations-design-system.test.js`.
- PASS Operations HTML script parse via `vm.Script` (2 script blocks).
- PASS `node --test tests/operations-design-system.test.js tests/operations-layout-stability.test.js tests/operations-module-toolbar.test.js` 10/10.
- PASS `npm test` 96/96.
