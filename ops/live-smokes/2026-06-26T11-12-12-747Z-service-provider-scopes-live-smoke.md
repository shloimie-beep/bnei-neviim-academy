# Service Provider Scopes Live Smoke - 2026-06-26T11:12:12.747Z

App: https://bneineviimacademy.org
Deployment: 112ef3b5-0ce7-45e3-9c55-368f783ccd1d
Commit: 5bea5891853d7e22eff2ce8f72aeac33a151ec1f
Result: passed

## Steps
- PASS public health endpoint (587ms)
- PASS operations login session (1889ms)
- PASS account scope summary returns Rabbi service-provider Plus scope (234ms)
- PASS first-party CRM contacts endpoint is scoped and no-send (698ms)
- PASS assistant scope plan blocks Codex CLI live (240ms)
- PASS provider portal scope APIs reject anonymous access (665ms)
- PASS provider portal bundle contains scope package surfaces (663ms)

No external sends, charges, DNS changes, credential writes, provider account writes, or third-party CRM/GHL actions were performed.
