# Public Route Privacy Smoke - 2026-06-25T17:03:52.477Z

App: https://bneineviimacademy.org
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
- /providers/join
- /become-service-provider
- /rabbi-member
- /member
- /member-portal
- /one-time/member-login
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
- PASS public route /providers/join returns anonymous shell (200)
- PASS public route /become-service-provider returns anonymous shell (200)
- PASS public route /rabbi-member returns anonymous shell (200)
- PASS public alias /member redirects to canonical member home (302 -> /rabbi-member)
- PASS public alias /member-portal redirects to canonical member home (302 -> /rabbi-member)
- PASS public alias /one-time/member-login redirects to canonical member home (302 -> /rabbi-member)
- PASS protected route /operations rejects anonymous access (302 -> /operations-login.html?returnTo=%2Foperations)
- PASS protected route /api/parent-portal rejects anonymous access (401)
- PASS protected route /api/parent-portal/session rejects anonymous access (400)
- PASS protected route /api/parent/me rejects anonymous access (401)
- PASS protected route /api/student-portal rejects anonymous access (401)
- PASS protected route /api/student-portal/session rejects anonymous access (401)
- PASS protected route /api/provider-portal/session rejects anonymous access (401)
- PASS protected route /api/member-portal rejects anonymous access (400)
- PASS protected route /api/rabbi/member/session rejects anonymous access (401)
