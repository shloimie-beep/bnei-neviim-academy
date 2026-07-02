# BNA Helper Control Plane Integration

This bundle is designed for the current BNA repo conventions:

- CommonJS modules.
- Existing helper modules under `src/lib/bna/helper`.
- Existing canonical registries at `ops/route-registry.json` and `ops/action-registry.json`.
- Existing destination resolver at `src/lib/bna/helper/destination-resolver.js`.
- Existing helper tool registry at `src/lib/bna/helper/tool-registry.js`.
- Existing Agent Review Hub at `src/lib/bna/agent-review-hub.js`.
- Existing tests use `node:test`.

## Files to add

Copy these files into the repo:

```txt
src/lib/bna/helper/control-plane/runtime-context.js
src/lib/bna/helper/control-plane/evidence.js
src/lib/bna/helper/control-plane/audit-ledger.js
src/lib/bna/helper/control-plane/route-control.js
src/lib/bna/helper/control-plane/action-control.js
src/lib/bna/helper/control-plane/data-broker.js
src/lib/bna/helper/control-plane/policy.js
src/lib/bna/helper/control-plane/response-safety.js
src/lib/bna/helper/control-plane/conversation.js
src/lib/bna/helper/control-plane/usage-meter.js
src/lib/bna/helper/control-plane/agent-review-emitter.js
src/lib/bna/helper/control-plane/index.js
tests/helper-control-plane.test.js
tests/helper-control-plane-matrix.test.js
ops/helper-control-plane-evaluation-matrix.json
```

## Server integration

In the existing `/api/bna/helper/message` and `/api/bna/helper/chat` handlers, wrap the current planning/execution path:

```js
const { runHelperControlPlaneTurn } = require('./src/lib/bna/helper/control-plane');

app.post('/api/bna/helper/message', requireAdminOrScopedHelper, async (req, res) => {
  const result = await runHelperControlPlaneTurn({
    req,
    db: pool,
    deps: helperDeps,
    message: req.body.message || req.body.prompt || '',
    identity: req.opsIdentity || req.helperIdentity || req.user || {},
    pageContext: req.body.page_context || req.body.pageContext || {},
    conversationId: req.body.conversation_id || null,
    sessionId: req.sessionID || null,
  });
  res.json(result);
});
```

For non-Operations helpers, pass the portal identity instead of `req.opsIdentity`.

## Existing modules this wraps

The control plane uses:

```js
require('../planner').deterministicPlan
require('../tool-registry').buildToolRegistry
require('../destination-resolver').resolveHelperDestination
require('../permissions').helperPermissionForTool
require('../context').sanitizeHelperPageContext
require('../../agent-review-hub').buildAgentReviewRepairItem
```

It does not duplicate route/action registries.

## Critical behavior added

1. Generic `Mishnah/Mishna/Mishnayos` wording is denied as ambiguous unless runtime context supports One Time.
2. Every route is represented by a `route_resolution` evidence record.
3. Every helper tool execution creates an audit and result envelope.
4. The renderer rejects unbacked internal links.
5. The renderer rejects “done”-style claims unless there is a committed action result.
6. Parent/student/provider/One Time scope checks are centralized.
7. Agent Review Hub items can be emitted from failed/denied helper turns.
8. API usage can be recorded per helper turn.

## Test commands

```bash
npm test -- tests/helper-control-plane.test.js
npm test -- tests/helper-control-plane-matrix.test.js
```

If the project uses plain `npm test`, these tests will run under the existing `node --test` script.
