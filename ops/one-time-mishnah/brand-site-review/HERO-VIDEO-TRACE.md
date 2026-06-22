# OneTimeOneTime Hero And Vimeo Trace

Captured: 2026-06-22

The downloaded legacy home page at
`C:\Users\User\Downloads\OneTimeOneTime - Rabbi Eli Scheller.html` used a
Vimeo background iframe for the first viewport:

- Saved player file: `OneTimeOneTime - Rabbi Eli Scheller_files/1158542993.html`
- Vimeo player URL: `https://player.vimeo.com/video/1158542993?h=daa31d3417`
- Title from saved metadata: `Promo website`
- Duration: `PT32S`
- Thumbnail URL from saved metadata:
  `https://i.vimeocdn.com/video/2112619188-6d84294b785b612b0844acce90da6c8a83783ab6772107d87953ec8facb0d00d-d?f=webp`

Local raw video source:

- `C:\Users\User\Downloads\OneTimeOneTime - Rabbi Eli Scheller_files\promo_website_v1 (1080p) (1).mp4`
- Size: 23,311,331 bytes
- Media: 1920x1080 H.264 MP4, 32.13 seconds
- SHA-256: `04c15e40cd30fcc2447740279af2f7e124be6bc94c44f009596656ad83db0c67`
- Commit decision: not committed. The file is large raw source media and is
  already traceable through Vimeo ID `1158542993`.

## Legacy Vimeo Items Found

| Saved file | Vimeo ID | Hash | Title | Duration | Review use |
| --- | --- | --- | --- | --- | --- |
| `1138747998.html` | `1138747998` | `456811057a` | Epic Birthday Prank! | `PT328S` | traced only |
| `1158542993.html` | `1158542993` | `daa31d3417` | Promo website | `PT32S` | hero/promo source trace |
| `1158589767.html` | `1158589767` | `598ba5e5ba` | Batting cages 2 | `PT105S` | traced only |
| `1158803771.html` | `1158803771` | `188d9a4d33` | navi perek gimel - shoftim | `PT1077S` | traced only |
| `1174681253.html` | `1174681253` | `f1589236ec` | An interview with kids in RBS Israel | `PT790S` | traced only |
| `1178363755.html` | `1178363755` | `282ea2577c` | Pesachim perek 10 | `PT2380S` | manual member-library review sample |

## Implementation Decision

- The shared review landing uses the lightweight static hero image
  `public/images/one-time/onetime-hero-vertical.webp`, not the 23 MB raw MP4.
- The review classroom/member-library fixture uses the traced manual Vimeo
  reference `https://vimeo.com/1178363755/282ea2577c`.
- Automated Vimeo upload remains disabled until the user-level Vimeo token and
  upload policy are approved.
