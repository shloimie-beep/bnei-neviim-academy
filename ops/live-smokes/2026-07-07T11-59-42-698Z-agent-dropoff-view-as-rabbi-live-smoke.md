# Agent Dropoff + View-as Rabbi Live Smoke

Generated at 2026-07-07T11:59:42.698Z.

Base URL: https://bneineviimacademy.org

Result: PASS

## Steps

- PASS operations login - {"cookie":{"name":"bna_ops_session","value":"[redacted]"},"source":"env","user":"SHLOIMIE","role":"super_admin"}
- PASS operations has read-only View-as Rabbi action - {"label":true,"wrapper":true}
- PASS dropoff has autosave and keyboard save - {"autosave":true,"keyboard_submit":true}
- PASS view-as Rabbi endpoint returns read-only scoped session - {"view_url_sample":"/provider.html?review=one-time&view_as_rabbi=[redacted]","read_only":true,"writes_disabled":true,"external_sends_disabled":true,"charges_disabled":true,"secrets_included":false,"no_password_included":true}
