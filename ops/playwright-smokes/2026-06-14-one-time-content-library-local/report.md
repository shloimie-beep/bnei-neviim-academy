# One Time Content Library Local Smoke

Date: 2026-06-14
Target: http://127.0.0.1:8080/operations?workspace=bna&view=content&section=one_time_library

## Result

- PASS local auth and content jobs API readback.
- PASS invalid hosted media URL rejected with HTTP 400 before any write.
- PASS One Time Library tab, heading, report metrics, search input, output lanes, and no-send/member-publish guardrail rendered.
- PASS desktop and mobile checks found no horizontal overflow.

## Evidence

- Desktop screenshot: ops\playwright-smokes\2026-06-14-one-time-content-library-local\desktop-one-time-library.png
- Mobile screenshot: ops\playwright-smokes\2026-06-14-one-time-content-library-local\mobile-one-time-library.png

## Console

- No browser console errors or page errors captured during the smoke.

## Readback

```json
{
  "desktopChecks": {
    "url": "http://127.0.0.1:8080/operations?workspace=bna&view=content&section=one_time_library",
    "title": "BNA Operations",
    "activeHeading": "One Time Library",
    "hasPanel": true,
    "hasReport": true,
    "laneTexts": [
      "Library Card",
      "Transcript",
      "Thumbnail",
      "Worksheet / Source Sheet",
      "Social Plan",
      "Newsletter Plan"
    ],
    "hasSearch": true,
    "searchPlaceholder": "Search title, transcript, source, output, or metadata",
    "guardText": "No email, WhatsApp, social post, checkout, external CRM, Drive/video-host write, or member-library publish happens from this screen. Approval here records internal review state only.",
    "horizontalOverflow": false
  },
  "mobileChecks": {
    "hasPanel": true,
    "heading": "One Time Library",
    "laneColumns": "370px",
    "reportColumns": "370px",
    "horizontalOverflow": false
  }
}
```
