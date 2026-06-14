# Operations Parent-to-Student Links Live Smoke

Generated: 2026-06-14T15:20:01.699Z
Base URL: https://bneineviimacademy.org

## Result

- PASS operations login via session cookie.
- PASS live data has a linked parent/student pair: signup #12 -> student #79458 (Signup ID).
- PASS Contacts > Parents resolves the linked student in the deployed UI.
- PASS parent Overview renders Student linked and Open linked student.
- PASS Linked Records renders Student Record, match source value, and Open linked student.
- PASS Open linked student opens the matching student profile route.
- PASS no console/page errors and no horizontal overflow at 1280px desktop.

## Privacy Note

This report intentionally records only internal record IDs and match source; no parent/student names, emails, phones, or screenshots are written.

## Details

- Parent Overview route after opening parent: https://bneineviimacademy.org/operations?workspace=bna&view=contacts&section=parents
- Student detail route includes expected student id: true
- Scroll width / viewport: overview 1280/1280, linked 1280/1280, student 1280/1280
