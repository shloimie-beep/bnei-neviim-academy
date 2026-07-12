# Test Results

- PASS `node --check server.js`
- PASS `node --check src/lib/integrations/resend-inbound-crm.js`
- PASS `node --test tests/resend-inbound-crm.test.js tests/assistant-portal-communications-contract.test.js tests/whapi-log-sync-contract.test.js` (19/19)
- PASS `node --test tests/rabbi-telegram-notifications.test.js tests/agent-review-hub.test.js tests/bna-helper-tools.test.js tests/production-readiness-gate.test.js tests/production-unblocker.test.js` (54/54)
- PASS `npm run app:smoke:rabbi-agent-review-direct-proof`
- BLOCKED `npm run production:readiness:gate -- --json --allow-dirty` only on external Stripe/campaign setup fields after Agent Mode proof was cleared.
- PASS `git push origin master`
- PASS `npm run railway:doctor` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=1` for BNA.
- PASS `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=1` for BNA.
- PASS BNA live readback: `/api/health`, `/api/deploy-info`, and `/operations-login.html`; deploy-info SHA `966ded41b517433533f24370949426cfd1200213`.
- PASS `npm run railway:doctor` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=1` and `BNA_RAILWAY_TARGET_PROFILE=one-time`.
- PASS `npm run railway:redeploy` with `BNA_RAILWAY_USE_ACCOUNT_AUTH=1` and `BNA_RAILWAY_TARGET_PROFILE=one-time`.
- PASS `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 966ded41b517433533f24370949426cfd1200213`
- PASS One Time signup no-write Playwright proof: Family and School clicks set the hidden value and intercepted payload classification correctly.
- PASS One Time signup API dry-run proof: Family and School normalize to the expected signup type.
- BLOCKED `npm run production:readiness:gate -- --json` only on full-launch external Stripe/campaign setup fields.
