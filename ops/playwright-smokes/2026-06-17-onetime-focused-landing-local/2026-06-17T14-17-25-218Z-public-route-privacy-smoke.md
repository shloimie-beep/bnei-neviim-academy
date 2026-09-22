# Public Route Privacy Smoke - 2026-06-17T14:17:25.219Z

App: http://localhost:8080
Result: passed

## Routes
- /
- /parent
- /parent.html
- /parent/login
- /student
- /student.html
- /student/login
- /signup
- /signup.html
- /signup-he
- /providers
- /provider
- /provider/login
- /service-providers
- /become-service-provider
- /member
- /member-portal
- /rabbi-member
- /operations
- /api/parent-portal
- /api/parent-portal/session
- /api/parent/me
- /api/student-portal
- /api/student-portal/session
- /api/provider-portal/session
- /api/member-portal
- /api/rabbi/member/session

## Checks
- PASS public route / returns anonymous shell (200)
- PASS public route /parent returns anonymous shell (200)
- PASS public route /parent.html returns anonymous shell (200)
- PASS public route /parent/login returns anonymous shell (200)
- PASS public route /student returns anonymous shell (200)
- PASS public route /student.html returns anonymous shell (200)
- PASS public route /student/login returns anonymous shell (200)
- PASS public route /signup returns anonymous shell (200)
- PASS public route /signup.html returns anonymous shell (200)
- PASS public route /signup-he returns anonymous shell (200)
- PASS public route /providers returns anonymous shell (200)
- PASS public route /provider returns anonymous shell (200)
- PASS public route /provider/login returns anonymous shell (200)
- PASS public route /service-providers returns anonymous shell (200)
- PASS public route /become-service-provider returns anonymous shell (200)
- PASS public route /member returns anonymous shell (200)
- PASS public route /member-portal returns anonymous shell (200)
- PASS public route /rabbi-member returns anonymous shell (200)
- PASS protected route /operations rejects anonymous access (302 -> /operations-login.html?returnTo=%2Foperations)
- PASS protected route /api/parent-portal rejects anonymous access (401)
- PASS protected route /api/parent-portal/session rejects anonymous access (400)
- PASS protected route /api/parent/me rejects anonymous access (401)
- PASS protected route /api/student-portal rejects anonymous access (401)
- PASS protected route /api/student-portal/session rejects anonymous access (401)
- PASS protected route /api/provider-portal/session rejects anonymous access (401)
- PASS protected route /api/member-portal rejects anonymous access (400)
- PASS protected route /api/rabbi/member/session rejects anonymous access (401)
