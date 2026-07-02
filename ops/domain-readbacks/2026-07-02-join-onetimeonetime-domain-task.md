# join.onetimeonetime.com Domain Readback

Generated: 2026-07-02T15:37:42.626Z

Railway custom domain attachment succeeded for `join.onetimeonetime.com` on the separate One Time service `one-time-web`.

No DNS mutation was performed. Do not touch apex/root `onetimeonetime.com`.

## GoDaddy Records Verified

These records now resolve for `onetimeonetime.com`:

| Type | Host | Value | Purpose |
| --- | --- | --- | --- |
| CNAME | `join` | `awaz36ln.up.railway.app` | Traffic route |
| TXT | `_railway-verify.join` | `railway-verify=73e92e55cb07e5a0abdb0a72f204d437d915c3134e844af12f419407632a97d6` | Railway ownership verification |

## Next Check

Run setup check and deploy/live smoke only after the separate One Time service is deployed and remaining provider setup blockers are handled:

```powershell
npm run one-time:setup:check -- --write-report
```
