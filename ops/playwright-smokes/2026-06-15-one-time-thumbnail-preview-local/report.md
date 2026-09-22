# One Time Thumbnail Preview Local Smoke

Date: 2026-06-15
Target: http://localhost:8080/operations?workspace=rabbi_sheller_provider&view=content&section=one-time-library

## Result

PASS. Authenticated Operations loaded, the One Time library thumbnail preview contract is present in `public/operations.html`, and `renderOneTimeLibraryCard` rendered the new thumbnail preview card correctly at desktop and mobile sizes.

## Contract Checks

- PASS oneTimeThumbnailPreviewData helper exists
- PASS renderOneTimeThumbnailPreview helper exists
- PASS thumbnail_brief metadata is consulted
- PASS metadata.thumbnail_url is accepted
- PASS metadata.thumbnailUrl is accepted
- PASS parsed thumbnail URL fallback is accepted
- PASS job thumbnail/image URL fallback is accepted
- PASS URL is limited to HTTP(S)
- PASS thumbnail preview card is rendered in One Time library card
- PASS Open Thumbnail link is rendered when URL exists
- PASS missing state is rendered when URL is absent
- PASS thumbnail CSS frame exists

## Browser Checks

- PASS login form accepted the smoke Operations credentials and redirected to authenticated Operations.
- PASS Operations page title was `BNA Operations`.
- PASS One Time Library navigation text was visible.
- PASS thumbnail CSS was present in the loaded Operations page.
- PASS helper globals were callable in the authenticated page: {"oneTimeThumbnailPreviewData":"function","renderOneTimeThumbnailPreview":"function","renderOneTimeLibraryCard":"function"}.
- PASS actual `renderOneTimeLibraryCard` output produced `#one-time-library-item-999001` with `Thumbnail Preview`, loaded mock thumbnail image, and `Open Thumbnail` link.
- PASS actual `renderOneTimeThumbnailPreview` missing-state output rendered `Thumbnail reference missing`.
- PASS desktop rendered-card metrics: {"viewport":{"width":1440,"height":980},"frame":{"width":485,"height":273},"image":{"width":483,"height":271,"naturalWidth":640,"naturalHeight":360,"complete":true,"currentSrc":"https://cdn.example.com/mishnah-aleph-thumb.jpg","alt":"Thumbnail preview for Mishnah Aleph Uploaded Video"},"linkText":"Open Thumbnail","linkHref":"https://cdn.example.com/mishnah-aleph-thumb.jpg","missingText":"Thumbnail reference missing","noHorizontalOverflow":true,"linkBelowFrame":true,"renderedThroughLibraryCard":true,"fixtureTextPresent":true}
- PASS mobile rendered-card metrics: {"viewport":{"width":390,"height":900},"frame":{"width":298,"height":168},"image":{"width":296,"height":166,"naturalWidth":640,"naturalHeight":360,"complete":true,"currentSrc":"https://cdn.example.com/mishnah-aleph-thumb.jpg","alt":"Thumbnail preview for Mishnah Aleph Uploaded Video"},"linkText":"Open Thumbnail","linkHref":"https://cdn.example.com/mishnah-aleph-thumb.jpg","missingText":"Thumbnail reference missing","noHorizontalOverflow":true,"linkBelowFrame":true,"renderedThroughLibraryCard":true,"fixtureTextPresent":true}
- INFO routed mock thumbnail hits during smoke: 2

## Screenshots

- desktop.png
- mobile.png

## Guardrails

No email, WhatsApp, social post, checkout/access change, Drive/video-host write, external CRM write, member-library publish, or Buffer action was triggered. The smoke injected a local fake content job into the already-loaded Operations DOM only for visual verification.

## Console

- No page console errors captured during smoke.
