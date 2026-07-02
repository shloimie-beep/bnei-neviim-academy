# RAW-20260701-004 - Namecheap .com renewal risk audit

- source_channel: codex_chat
- parse_status: raw
- created_at: 2026-07-01
- operator: Shloimie
- scope: BNA domain, email, Railway/Replit, One Time domain/email setup

## Raw wording

Figure out whether the repeated Namecheap auto-renew failures for `bneineviimacademy.com` actually endanger anything in this project or if they can be safely ignored. Trace every live dependency on `.com` versus `bneineviimacademy.org`, Railway, Replit, and One Time email/domain setup, then give me an exact renew-or-migrate recommendation with the specific repo evidence behind it. Yeah, I just clicked on this little thing in the bottom. It's in my email. Um, aren't we going through Google or something? What do I have to do over here?

## Parsed items

- REQ-20260701-004: Audit live repo/config/DNS dependencies for `bneineviimacademy.com` versus `bneineviimacademy.org`, Railway, Replit, and One Time email/domain setup.
- DEC-20260701-004: Operator needs an exact renew-or-migrate recommendation for the failed Namecheap auto-renew notice, including whether any immediate account action is required.

## Follow-up wording

> Yeah, I realized that the website wasn't working. So, um, the .com, I want the .com to forward to the .org. I don't know if that's actually happening now. But, um, I think I just had to pay for that .org.

> How long does it take till it starts working again? Because right now it's not working.

## Audit result

- External fetch from Codex web tooling loaded `https://bneineviimacademy.org/` successfully on 2026-07-01.
- Public DNS resolvers `1.1.1.1`, `8.8.8.8`, and `9.9.9.9` returned `bneineviimacademy.org A 66.33.22.227` and `bneineviimacademy.org MX smtp.google.com`.
- Public DNS resolvers returned `bneineviimacademy.com A 162.255.119.233` and `www.bneineviimacademy.com A 162.255.119.233`.
- HTTP checks showed `http://bneineviimacademy.com` and `http://www.bneineviimacademy.com` returning a Namecheap `301` redirect to `https://bneineviimacademy.org`.
- HTTPS checks for `.com` timed out locally, consistent with basic registrar forwarding not providing a reliable HTTPS redirect.
- Recommendation: keep `.org` renewed as canonical live site, keep `.com` renewed as a protective/redirect domain, and move `.com` forwarding to an SSL-capable redirect path if `https://bneineviimacademy.com` must work reliably.
