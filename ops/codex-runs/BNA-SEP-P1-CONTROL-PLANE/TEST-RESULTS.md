# Test Results

Captured 2026-07-17T12:05:00Z from clean external worktree
`C:\Users\User\.codex-worktrees\BNA-SEP-P1-CONTROL-PLANE-20260717-114636\worktree`.

## Passed

- `node --check services/bna-control-plane/src/app.js`
- `node --check services/bna-control-plane/src/security/signature.js`
- `node -e "for (const f of require('fs').readdirSync('services/bna-control-plane/contracts')) JSON.parse(require('fs').readFileSync('services/bna-control-plane/contracts/'+f,'utf8')); console.log('contract-json-ok')"` -> `contract-json-ok`
- `node --test services/bna-control-plane/test/*.test.js` -> 37 tests, 37 pass, 0 fail
- `npm run secrets:audit` -> tracked secret audit passed; 9617 tracked paths checked; 0 tracked secret-risk files found
- `git diff --check`

## Boundary Scan

Command:

```bash
rg -n -i "railway|deploy|child_process|TELEGRAM_BOT_TOKEN|DATABASE_URL|STRIPE|RESEND|ZOOM|VIMEO|BUFFER|WAPI" services/bna-control-plane ops/codex-runs/BNA-SEP-P1-CONTROL-PLANE
```

Result: expected matches only. Categories were:

- Packet/run prohibition text and source prompt text.
- Contract schema fields named `deployment_id`.
- Fail-closed provider credential denylist literals in `src/config.js`.
- Test fixture strings used to prove provider credentials are rejected.
- `Buffer` usage for JSON body handling, Ed25519 signing verification, CSRF comparison, and tests.

No product module imports, product route wiring, provider SDK calls, shell execution, deployment hooks, live database access, Telegram sends, or external product mutations were introduced.
