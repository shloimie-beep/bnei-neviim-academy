# Parent Weekly Update Approval Live Smoke

Date: 2026-06-15
Target: https://bneineviimacademy.org/operations?view=communications&section=announcements

## Result

PASS. Authenticated Operations loaded the Communications > Announcements panel, rendered the parent portal approval form, loaded a candidate draft with image/video URLs, and completed the Preview No-Write flow.

## Contract Checks

- PASS announcement panel exists
- PASS approval form helper exists
- PASS candidate helper exists
- PASS form marker exists
- PASS preview handler exists
- PASS approval handler exists
- PASS media URL fields exist
- PASS dry-run payload is wired
- PASS typed approval phrase is required
- PASS old native prompt flow is absent

## Browser Checks

- INFO parent-announcements GET was intercepted with fixture data before page seeding: 1 hit(s).
- PASS no-write preview POST was intercepted with `dry_run: true`: 1 hit(s).
- PASS non-dry-run write attempts were blocked and none occurred: 0.
- PASS desktop metrics: {"title":"This week at BNA","body":"This week, students focused on steady review, clear questions, and practical next steps for the coming learning cycle.","imageUrl":"https://cdn.example.com/bna-weekly-update.jpg","videoUrl":"https://video.example.com/bna-weekly-update","status":"Preview ready. No record was saved, and no email, WhatsApp, or social post will be sent.","noSendCopy":true,"candidateCopy":true,"noHorizontalOverflow":true,"formWidth":1122,"formHeight":504}
- PASS mobile metrics: {"viewport":{"width":390,"height":900},"formWidth":344,"noHorizontalOverflow":true,"fieldsPresent":true,"previewButtonVisible":true}
- PASS preview payload carried selected copy/media: {"workspace":"platform","title":"This week at BNA","body":"This week, students focused on steady review, clear questions, and practical next steps for the coming learning cycle.","summary":"This week, students focused on steady review, clear questions, and practical next steps for the coming learning cycle.","image_url":"https://cdn.example.com/bna-weekly-update.jpg","video_url":"https://video.example.com/bna-weekly-update","dry_run":true}

## Screenshots

- desktop.png
- mobile.png

## Guardrails

No email, WhatsApp, social post, Buffer action, external CRM write, or selected weekly-update write was triggered. The only parent-announcements POST in this smoke used `dry_run: true` and returned `local_write_performed: false`.
