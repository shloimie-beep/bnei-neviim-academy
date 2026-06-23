# Student Portal Auth Policy Live Smoke - 2026-06-21T17:35:16.906Z

App: https://bneineviimacademy.org
Result: passed

## Checks
- PASS invalid code returns generic 401 without echoing raw code
- PASS invalid username/password returns generic 401 without echoing raw credentials
- PASS persistent access-code audit row stores hashes and sanitized route only
- PASS persistent password audit row stores hashes and sanitized route only

## Access-Code Audit Readback

- outcome: failure
- route: /api/student-portal
- reason: invalid_or_expired_code
- raw code stored in route/metadata: false
- student id on invalid attempt: null

## Password Audit Readback

- outcome: failure
- route: /api/student-portal/login
- reason: invalid_username_or_password
- raw username/password stored in route/metadata: false
- student id on invalid attempt: null
