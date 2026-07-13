# One Time Member Portal Performance Local Smoke

Generated: 2026-07-13T19:27:52.319Z
Requirement: REQ-20260713-934
Packet: PKT-20260713-934A

## Result

- PASS `/rabbi-member` reaches screenshot-ready first useful content at 1440, 1024, 768, 430, and 390 widths.
- PASS the member assistant is deferred from first render and still opens on Helper click.
- PASS no external writes, production mutations, private data leaks, or horizontal overflow were observed.

## Timing

| Viewport | DCL | Screenshot |
|---|---:|---|
| 1440-desktop | 22ms | ops/performance-audits/2026-07-13-onetime-member-performance-local/screenshots/member-portal-1440-desktop.png |
| 1024-desktop-tablet | 15ms | ops/performance-audits/2026-07-13-onetime-member-performance-local/screenshots/member-portal-1024-desktop-tablet.png |
| 768-tablet | 46ms | ops/performance-audits/2026-07-13-onetime-member-performance-local/screenshots/member-portal-768-tablet.png |
| 430-mobile | 54ms | ops/performance-audits/2026-07-13-onetime-member-performance-local/screenshots/member-portal-430-mobile.png |
| 390-mobile | 15ms | ops/performance-audits/2026-07-13-onetime-member-performance-local/screenshots/member-portal-390-mobile.png |
