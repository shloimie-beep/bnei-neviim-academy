# OneTimeOneTime Brand Asset Inventory

Captured: 2026-06-22

Source folder:

- `C:\Users\User\Downloads\OneTimeOneTime - Rabbi Eli Scheller_files\`
- `C:\Users\User\Downloads\OneTimeOneTime - Rabbi Eli Scheller.html`

## Committed Review Assets

| Source file | Type | Size | Dimensions | SHA-256 | Destination | Intended use | Approval / privacy status |
| --- | --- | ---: | --- | --- | --- | --- | --- |
| `onetimelogo.webp` | WebP image | 27,472 | 400x400 | `6b534dde8625b991cc9ef5e244190de950599718f35113825ab8c4c241edf441` | `public/images/one-time/brand/onetimelogo.webp` | Shared review logo, favicon, portal topbars | Legacy public site asset, safe for review |
| `onetime hero vertical.webp` | WebP image | 24,498 | 400x533 | `62f0a3eb8f4515647f33756b0e1724a331a3612888cc65311a53decae2d53a0d` | `public/images/one-time/brand/onetime-hero-vertical.webp` | Shared review landing/hero background | Legacy public site asset, safe for review |
| `rs=h_100,cg_true,m.png` | PNG image | 27,080 | 133x100 | `a424bb407e07a69c4dbfe7510231d2b353ffce7b07322fa3b0ea1d4ac3c74282` | `public/images/one-time/press/torahanytime-logo.png` | Logo inventory only | Legacy site reference; do not make new claims without approval |
| `rs=h_100,cg_true.png` | PNG image | 29,590 | 202x100 | `648eac401664fdcb64e7aca77c7c254c73c5db07b31b976c57778c8ce874e49c` | `public/images/one-time/press/twentyfour-six-logo.png` | Logo inventory only | Legacy site reference; do not make new claims without approval |
| `rs=h_100,cg_true (1).png` | PNG image | 8,584 | 131x100 | `7f7848f3e8de7722601fe3557eab3fb2cde55a17c0d503e7facaf51b37db2045` | `public/images/one-time/press/loop-logo.png` | Logo inventory only | Legacy site reference; do not make new claims without approval |
| `mishpacha.png` | WebP image stored with `.png` name | 6,976 | 338x100 | `68b9b6ea2082bddc88a42164803f2483047368fd81265143ee5db99a63749dff` | `public/images/one-time/press/mishpacha.webp` | Logo inventory only | Legacy site reference; do not make new claims without approval |
| `promo_website_v1 (1080p) (1).mp4` @ 00:00:05 | Derived WebP still | 5,892 | 960x376 | `96b7e861d070126bb9a8bd5929d72728929fc6ca55df46614168e3ee518901fc` | `public/images/one-time/teaching/promo-stage-still-01.webp` | Teaching gallery | Cropped stage-only to avoid child/crowd imagery |
| `promo_website_v1 (1080p) (1).mp4` @ 00:00:08 | Derived WebP still | 5,406 | 960x376 | `ec32539abab7bd28932cfa4371328d2604bfa6d3a94285f7f4dff0509777e051` | `public/images/one-time/teaching/promo-stage-still-02.webp` | Teaching gallery | Cropped stage-only to avoid child/crowd imagery |
| `promo_website_v1 (1080p) (1).mp4` @ 00:00:12 | Derived WebP still | 14,514 | 960x376 | `0488e32eac965f8287c2371cec04024f95d46ba65a31d0c27049bddd78a6bc4f` | `public/images/one-time/teaching/promo-stage-still-03.webp` | Teaching gallery | Cropped stage-only to avoid child/crowd imagery |

Compatibility copies remain at `public/images/one-time/` for older local review code, but current review pages use the organized `brand/`, `press/`, and `teaching/` paths.

## Traced But Not Committed

| Source file | Type | Size | Dimensions / duration | SHA-256 | Reason |
| --- | --- | ---: | --- | --- | --- |
| `promo_website_v1 (1080p) (1).mp4` | MP4 video | 23,311,331 | 1920x1080, 32.13s | `04c15e40cd30fcc2447740279af2f7e124be6bc94c44f009596656ad83db0c67` | Raw source video is too large and includes child/crowd imagery; Vimeo ID `1158542993` is traced but not embedded on the landing page |
| `b_w_captivated_crowd_photo-D4O3QBhB.png` | PNG image | 1,308,767 | 1408x768 | `b700ffb1bdf579829de47aff4f947d380d97b804534e3a1ccd127018cf5fb413` | Contains crowd/children context; keep out of review UI until image/privacy approval |
| `global_connections_world_map-CSE_2YOo.png` | PNG image | 1,386,897 | 1408x768 | `d53dad061e380d3da398c8b72f6a5141d4f3b421feaa69040f58e12b73d35ca8` | Useful legacy marketing image, but not needed for the focused shared review pass |
| `smilykid.png` | WebP image stored with `.png` name | 57,764 | 337x600 | `6e975c04acc3361fec19fcba82e06eb36ef4896047198cfb021b4daea1e150df` | Child image; not used without explicit approval |

## Not Found As Downloaded Standalone Files

- Naki Radio logo: the saved legacy HTML references a Naki Radio link, but no standalone Naki logo file was present in the inspected downloaded asset directory.
- Product cover images referenced by the legacy HTML were not present as standalone named files in the inspected directory.

## Current Use In This Branch

- `/one-time` uses the organized logo, hero portrait, press logos, and stage-only teaching stills.
- `/provider.html?review=one-time`, `/parent.html?review=one-time`,
  `/student.html?review=one-time`, `/one-time-classroom.html?review=one-time...`,
  and `/one-time-email-review.html` use the committed logo/brand CSS in review
  mode only.
- Partner/publication logos are surfaced only as review inventory with a no-endorsement note.
