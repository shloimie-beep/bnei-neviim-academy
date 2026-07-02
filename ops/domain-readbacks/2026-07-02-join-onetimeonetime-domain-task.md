# join.onetimeonetime.com Domain Task

Generated: 2026-07-02T12:59:26.840Z

Railway custom domain attachment succeeded for `join.onetimeonetime.com` on the separate One Time service `one-time-web`.

No DNS mutation was performed. Do not touch apex/root `onetimeonetime.com`.

## GoDaddy Records To Add

Add these records in GoDaddy DNS for `onetimeonetime.com`:

| Type | Host | Value | Purpose |
| --- | --- | --- | --- |
| CNAME | `join` | `awaz36ln.up.railway.app` | Traffic route |
| TXT | `_railway-verify.join` | `railway-verify=73e92e55cb07e5a0abdb0a72f204d437d915c3134e844af12f419407632a97d6` | Railway ownership verification |

## After DNS Is Added

Run:

```powershell
npm run one-time:setup:check -- --write-report
```

Then run the post-setup deploy/live-smoke packet only after required secrets/provider setup are present.
