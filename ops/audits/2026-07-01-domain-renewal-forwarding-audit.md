# Domain Renewal / Forwarding Audit - 2026-07-01

Source: `RAW-20260701-004`

## Question

Namecheap auto-renew failed for `bneineviimacademy.com`; operator also reported
the website not working and clarified that `.com` should forward to `.org`.

## Current Repo Evidence

- Canonical live domain is recorded in `MEMORY.md` as
  `bneineviimacademy.org`.
- App defaults and hardcoded production links in `server.js` point to
  `https://bneineviimacademy.org`, including Google OAuth callback,
  assignment/Operations URLs, registration links, Telegram dashboard links, and
  One Time Resend webhook target.
- Public site metadata and SEO files under `public/` use
  `https://bneineviimacademy.org`.
- One Time sender setup uses `onetimeonetime.com` /
  `info@onetimeonetime.com`, not the BNA `.com`.
- `PROJECT-NOTES.md` states Railway is the canonical current runtime and Rabbi
  Scheller Replit/current app is a source to audit/migrate from, not canonical
  BNA runtime.

## Current DNS / Web Evidence

Checked on 2026-07-01:

- External web fetch loaded `https://bneineviimacademy.org/` and returned the
  Bnei Nevi'im Academy homepage.
- Public resolvers `1.1.1.1`, `8.8.8.8`, and `9.9.9.9` returned:
  - `bneineviimacademy.org A 66.33.22.227`
  - `bneineviimacademy.org MX smtp.google.com`
  - `bneineviimacademy.com A 162.255.119.233`
  - `www.bneineviimacademy.com A 162.255.119.233`
- HTTP checks showed:
  - `http://bneineviimacademy.com` -> `301 Location:
    https://bneineviimacademy.org` served by `namecheap-nginx`
  - `http://www.bneineviimacademy.com` -> `301 Location:
    https://bneineviimacademy.org` served by `namecheap-nginx`
- Local HTTPS checks for `.com` timed out. Treat this as evidence that the
  current `.com` redirect is not reliable for modern HTTPS-first browser
  traffic.

## Recommendation

1. Keep `bneineviimacademy.org` renewed. It is the canonical app, Railway,
   webhook, SEO, and Operations domain.
2. Keep `bneineviimacademy.com` renewed as a protective/redirect domain. It is
   not the canonical runtime, but losing it could break old links and create
   brand/account confusion.
3. Do not migrate the app to `.com`.
4. Leave `.org` as canonical and make `.com` forward to `.org`.
5. If `https://bneineviimacademy.com` must work reliably, do not rely only on
   basic Namecheap URL forwarding. Use an SSL-capable redirect path, such as
   Cloudflare forwarding/redirect rules or adding `.com` as a Railway custom
   domain and redirecting it at the app edge.

## Operator Answer

If the `.org` renewal had expired, restoration can take minutes to a few hours
for many users and up to 24-72 hours for full DNS/global propagation. As of the
audit, `.org` is reachable from external web tooling. If it is still down on
the operator's device, likely causes are local DNS cache, browser HTTPS/HSTS
cache, ISP resolver lag, or testing the `.com` HTTPS redirect instead of the
canonical `.org`.
