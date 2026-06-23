# Implementation Backlog

## P0

- No items in this bucket.
## P1

### Parent assistant is missing or not obvious

Severity: P1
Affected screen IDs: PARENT__BNA__PORTAL__PARENT_PORTAL_LOGIN__LOAD__DESKTOP__012
Affected routes: /parent
Current behavior: The school parent/student experience should expose a scoped natural-language help panel, but the current captured state does not make it obvious.
Desired behavior: Scoped bot/help assistant is visible and safe for the current role.
Acceptance criteria: Add a bottom-right assistant on desktop and a sticky Ask/help bar or full-screen sheet on mobile, with explicit scope text.
Recommended file/component: public/parent.html

### Student assistant is missing or not obvious

Severity: P1
Affected screen IDs: STUDENT__BNA__PORTAL__STUDENT_WORKSPACE_LOGIN__LOAD__DESKTOP__013
Affected routes: /student
Current behavior: The school parent/student experience should expose a scoped natural-language help panel, but the current captured state does not make it obvious.
Desired behavior: Scoped bot/help assistant is visible and safe for the current role.
Acceptance criteria: Add a bottom-right assistant on desktop and a sticky Ask/help bar or full-screen sheet on mobile, with explicit scope text.
Recommended file/component: public/student.html

### Parent assistant is missing or not obvious

Severity: P1
Affected screen IDs: PARENT__BNA__PORTAL__HEBREW_STATE__SWITCH_HEBREW__DESKTOP__016
Affected routes: /parent
Current behavior: The school parent/student experience should expose a scoped natural-language help panel, but the current captured state does not make it obvious.
Desired behavior: Scoped bot/help assistant is visible and safe for the current role.
Acceptance criteria: Add a bottom-right assistant on desktop and a sticky Ask/help bar or full-screen sheet on mobile, with explicit scope text.
Recommended file/component: public/parent.html

### Parent assistant is missing or not obvious

Severity: P1
Affected screen IDs: PARENT__BNA__PORTAL__PASSWORD_RESET__OPEN_PASSWORD_RESET__DESKTOP__017
Affected routes: /parent
Current behavior: The school parent/student experience should expose a scoped natural-language help panel, but the current captured state does not make it obvious.
Desired behavior: Scoped bot/help assistant is visible and safe for the current role.
Acceptance criteria: Add a bottom-right assistant on desktop and a sticky Ask/help bar or full-screen sheet on mobile, with explicit scope text.
Recommended file/component: public/parent.html

### Student assistant is missing or not obvious

Severity: P1
Affected screen IDs: STUDENT__BNA__PORTAL__HEBREW_STATE__SWITCH_HEBREW__DESKTOP__018
Affected routes: /student
Current behavior: The school parent/student experience should expose a scoped natural-language help panel, but the current captured state does not make it obvious.
Desired behavior: Scoped bot/help assistant is visible and safe for the current role.
Acceptance criteria: Add a bottom-right assistant on desktop and a sticky Ask/help bar or full-screen sheet on mobile, with explicit scope text.
Recommended file/component: public/student.html

### Too much placeholder language

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__SERVICE_PROVIDERS__WORKSPACES__LOAD__DESKTOP__083
Affected routes: /operations?workspace=platform&view=service_providers&section=workspaces
Current behavior: The screen overuses not-configured/disabled/placeholder wording.
Desired behavior: Settings pages show real rows/fields with only missing controls disabled.
Acceptance criteria: Render real settings rows and disable only the missing controls with one-line helper text.
Recommended file/component: public/operations.html

### Too much placeholder language

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__SERVICE_PROVIDERS__SETTINGS__LOAD__DESKTOP__094
Affected routes: /operations?workspace=platform&view=service_providers&section=settings
Current behavior: The screen overuses not-configured/disabled/placeholder wording.
Desired behavior: Settings pages show real rows/fields with only missing controls disabled.
Acceptance criteria: Render real settings rows and disable only the missing controls with one-line helper text.
Recommended file/component: public/operations.html

### Too much placeholder language

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__SETTINGS__INTEGRATIONS__LOAD__DESKTOP__156
Affected routes: /operations?workspace=platform&view=settings&section=integrations
Current behavior: The screen overuses not-configured/disabled/placeholder wording.
Desired behavior: Settings pages show real rows/fields with only missing controls disabled.
Acceptance criteria: Render real settings rows and disable only the missing controls with one-line helper text.
Recommended file/component: public/operations.html

### Too much placeholder language

Severity: P1
Affected screen IDs: BNAADMIN__BNA__SERVICE_PROVIDERS__WORKSPACES__LOAD__DESKTOP__225
Affected routes: /operations?workspace=bna&view=service_providers&section=workspaces
Current behavior: The screen overuses not-configured/disabled/placeholder wording.
Desired behavior: Settings pages show real rows/fields with only missing controls disabled.
Acceptance criteria: Render real settings rows and disable only the missing controls with one-line helper text.
Recommended file/component: public/operations.html

### Too much placeholder language

Severity: P1
Affected screen IDs: BNAADMIN__BNA__SETTINGS__INTEGRATIONS__LOAD__DESKTOP__298
Affected routes: /operations?workspace=bna&view=settings&section=integrations
Current behavior: The screen overuses not-configured/disabled/placeholder wording.
Desired behavior: Settings pages show real rows/fields with only missing controls disabled.
Acceptance criteria: Render real settings rows and disable only the missing controls with one-line helper text.
Recommended file/component: public/operations.html

### Provider/admin surface may be mixed with BNA school concepts

Severity: P1
Affected screen IDs: PROVIDERADMIN__SHELLER__STUDENTS__OVERVIEW__LOAD__DESKTOP__323
Affected routes: /operations?workspace=rabbi_sheller_provider&view=students&section=overview
Current behavior: Provider workspace states should not look like BNA student accountability unless explicitly enabled.
Desired behavior: UI should be clear, wired, safe, and mapped to the correct route/workspace.
Acceptance criteria: Separate provider participants/members from BNA students and keep provider program pages simpler.
Recommended file/component: public/operations.html

### Provider/admin surface may be mixed with BNA school concepts

Severity: P1
Affected screen IDs: PROVIDERADMIN__SHELLER__STUDENTS__LIST__LOAD__DESKTOP__324
Affected routes: /operations?workspace=rabbi_sheller_provider&view=students&section=list
Current behavior: Provider workspace states should not look like BNA student accountability unless explicitly enabled.
Desired behavior: UI should be clear, wired, safe, and mapped to the correct route/workspace.
Acceptance criteria: Separate provider participants/members from BNA students and keep provider program pages simpler.
Recommended file/component: public/operations.html

### Provider/admin surface may be mixed with BNA school concepts

Severity: P1
Affected screen IDs: PROVIDERADMIN__SHELLER__STUDENTS__GROUP_GOAL__LOAD__DESKTOP__325
Affected routes: /operations?workspace=rabbi_sheller_provider&view=students&section=group_goal
Current behavior: Provider workspace states should not look like BNA student accountability unless explicitly enabled.
Desired behavior: UI should be clear, wired, safe, and mapped to the correct route/workspace.
Acceptance criteria: Separate provider participants/members from BNA students and keep provider program pages simpler.
Recommended file/component: public/operations.html

### Provider/admin surface may be mixed with BNA school concepts

Severity: P1
Affected screen IDs: PROVIDERADMIN__SHELLER__STUDENTS__GOAL_BOARD__LOAD__DESKTOP__326
Affected routes: /operations?workspace=rabbi_sheller_provider&view=students&section=goal_board
Current behavior: Provider workspace states should not look like BNA student accountability unless explicitly enabled.
Desired behavior: UI should be clear, wired, safe, and mapped to the correct route/workspace.
Acceptance criteria: Separate provider participants/members from BNA students and keep provider program pages simpler.
Recommended file/component: public/operations.html

### Provider/admin surface may be mixed with BNA school concepts

Severity: P1
Affected screen IDs: PROVIDERADMIN__SHELLER__STUDENTS__ASSIGNMENTS__LOAD__DESKTOP__327
Affected routes: /operations?workspace=rabbi_sheller_provider&view=students&section=assignments
Current behavior: Provider workspace states should not look like BNA student accountability unless explicitly enabled.
Desired behavior: UI should be clear, wired, safe, and mapped to the correct route/workspace.
Acceptance criteria: Separate provider participants/members from BNA students and keep provider program pages simpler.
Recommended file/component: public/operations.html

### Provider/admin surface may be mixed with BNA school concepts

Severity: P1
Affected screen IDs: PROVIDERADMIN__SHELLER__STUDENTS__QUESTIONS__LOAD__DESKTOP__328
Affected routes: /operations?workspace=rabbi_sheller_provider&view=students&section=questions
Current behavior: Provider workspace states should not look like BNA student accountability unless explicitly enabled.
Desired behavior: UI should be clear, wired, safe, and mapped to the correct route/workspace.
Acceptance criteria: Separate provider participants/members from BNA students and keep provider program pages simpler.
Recommended file/component: public/operations.html

### Provider/admin surface may be mixed with BNA school concepts

Severity: P1
Affected screen IDs: PROVIDERADMIN__SHELLER__STUDENTS__DOCUMENTS__LOAD__DESKTOP__329
Affected routes: /operations?workspace=rabbi_sheller_provider&view=students&section=documents
Current behavior: Provider workspace states should not look like BNA student accountability unless explicitly enabled.
Desired behavior: UI should be clear, wired, safe, and mapped to the correct route/workspace.
Acceptance criteria: Separate provider participants/members from BNA students and keep provider program pages simpler.
Recommended file/component: public/operations.html

### Provider/admin surface may be mixed with BNA school concepts

Severity: P1
Affected screen IDs: PROVIDERADMIN__SHELLER__STUDENTS__PORTAL_LINKS__LOAD__DESKTOP__330
Affected routes: /operations?workspace=rabbi_sheller_provider&view=students&section=portal_links
Current behavior: Provider workspace states should not look like BNA student accountability unless explicitly enabled.
Desired behavior: UI should be clear, wired, safe, and mapped to the correct route/workspace.
Acceptance criteria: Separate provider participants/members from BNA students and keep provider program pages simpler.
Recommended file/component: public/operations.html

### Provider/admin surface may be mixed with BNA school concepts

Severity: P1
Affected screen IDs: PROVIDERADMIN__SHELLER__STUDENTS__TABLET_ACCESS__LOAD__DESKTOP__331
Affected routes: /operations?workspace=rabbi_sheller_provider&view=students&section=tablet_access
Current behavior: Provider workspace states should not look like BNA student accountability unless explicitly enabled.
Desired behavior: UI should be clear, wired, safe, and mapped to the correct route/workspace.
Acceptance criteria: Separate provider participants/members from BNA students and keep provider program pages simpler.
Recommended file/component: public/operations.html

### Provider/admin surface may be mixed with BNA school concepts

Severity: P1
Affected screen IDs: PROVIDERADMIN__SHELLER__STUDENTS__PROFILE__LOAD__DESKTOP__332
Affected routes: /operations?workspace=rabbi_sheller_provider&view=students&section=profile
Current behavior: Provider workspace states should not look like BNA student accountability unless explicitly enabled.
Desired behavior: UI should be clear, wired, safe, and mapped to the correct route/workspace.
Acceptance criteria: Separate provider participants/members from BNA students and keep provider program pages simpler.
Recommended file/component: public/operations.html

### Provider/admin surface may be mixed with BNA school concepts

Severity: P1
Affected screen IDs: PROVIDERADMIN__SHELLER__STUDENTS__PARENT_FAMILY__LOAD__DESKTOP__333
Affected routes: /operations?workspace=rabbi_sheller_provider&view=students&section=parent_family
Current behavior: Provider workspace states should not look like BNA student accountability unless explicitly enabled.
Desired behavior: UI should be clear, wired, safe, and mapped to the correct route/workspace.
Acceptance criteria: Separate provider participants/members from BNA students and keep provider program pages simpler.
Recommended file/component: public/operations.html

### Provider/admin surface may be mixed with BNA school concepts

Severity: P1
Affected screen IDs: PROVIDERADMIN__SHELLER__STUDENTS__ANALYSIS__LOAD__DESKTOP__334
Affected routes: /operations?workspace=rabbi_sheller_provider&view=students&section=analysis
Current behavior: Provider workspace states should not look like BNA student accountability unless explicitly enabled.
Desired behavior: UI should be clear, wired, safe, and mapped to the correct route/workspace.
Acceptance criteria: Separate provider participants/members from BNA students and keep provider program pages simpler.
Recommended file/component: public/operations.html

### Provider/admin surface may be mixed with BNA school concepts

Severity: P1
Affected screen IDs: PROVIDERADMIN__SHELLER__STUDENTS__MEETINGS__LOAD__DESKTOP__335
Affected routes: /operations?workspace=rabbi_sheller_provider&view=students&section=meetings
Current behavior: Provider workspace states should not look like BNA student accountability unless explicitly enabled.
Desired behavior: UI should be clear, wired, safe, and mapped to the correct route/workspace.
Acceptance criteria: Separate provider participants/members from BNA students and keep provider program pages simpler.
Recommended file/component: public/operations.html

### Provider/admin surface may be mixed with BNA school concepts

Severity: P1
Affected screen IDs: PROVIDERADMIN__SHELLER__STUDENTS__BOT_SETTINGS__LOAD__DESKTOP__336
Affected routes: /operations?workspace=rabbi_sheller_provider&view=students&section=bot_settings
Current behavior: Provider workspace states should not look like BNA student accountability unless explicitly enabled.
Desired behavior: UI should be clear, wired, safe, and mapped to the correct route/workspace.
Acceptance criteria: Separate provider participants/members from BNA students and keep provider program pages simpler.
Recommended file/component: public/operations.html

### Provider/admin surface may be mixed with BNA school concepts

Severity: P1
Affected screen IDs: PROVIDERADMIN__SHELLER__STUDENTS__ACTIVITY__LOAD__DESKTOP__337
Affected routes: /operations?workspace=rabbi_sheller_provider&view=students&section=activity
Current behavior: Provider workspace states should not look like BNA student accountability unless explicitly enabled.
Desired behavior: UI should be clear, wired, safe, and mapped to the correct route/workspace.
Acceptance criteria: Separate provider participants/members from BNA students and keep provider program pages simpler.
Recommended file/component: public/operations.html

### Provider/admin surface may be mixed with BNA school concepts

Severity: P1
Affected screen IDs: PROVIDERADMIN__SHELLER__STUDENTS__NEXT_YEAR_LOGIN__LOAD__DESKTOP__338
Affected routes: /operations?workspace=rabbi_sheller_provider&view=students&section=next_year_login
Current behavior: Provider workspace states should not look like BNA student accountability unless explicitly enabled.
Desired behavior: UI should be clear, wired, safe, and mapped to the correct route/workspace.
Acceptance criteria: Separate provider participants/members from BNA students and keep provider program pages simpler.
Recommended file/component: public/operations.html

### Provider/admin surface may be mixed with BNA school concepts

Severity: P1
Affected screen IDs: PROVIDERADMIN__SHELLER__CONTACTS__STUDENTS__LOAD__DESKTOP__345
Affected routes: /operations?workspace=rabbi_sheller_provider&view=contacts&section=students
Current behavior: Provider workspace states should not look like BNA student accountability unless explicitly enabled.
Desired behavior: UI should be clear, wired, safe, and mapped to the correct route/workspace.
Acceptance criteria: Separate provider participants/members from BNA students and keep provider program pages simpler.
Recommended file/component: public/operations.html

### Provider/admin surface may be mixed with BNA school concepts

Severity: P1
Affected screen IDs: PROVIDERADMIN__SHELLER__CALENDAR__STUDENTS__LOAD__DESKTOP__361
Affected routes: /operations?workspace=rabbi_sheller_provider&view=calendar&section=students
Current behavior: Provider workspace states should not look like BNA student accountability unless explicitly enabled.
Desired behavior: UI should be clear, wired, safe, and mapped to the correct route/workspace.
Acceptance criteria: Separate provider participants/members from BNA students and keep provider program pages simpler.
Recommended file/component: public/operations.html

### Too much placeholder language

Severity: P1
Affected screen IDs: PROVIDERADMIN__SHELLER__SERVICE_PROVIDERS__WORKSPACES__LOAD__DESKTOP__367
Affected routes: /operations?workspace=rabbi_sheller_provider&view=service_providers&section=workspaces
Current behavior: The screen overuses not-configured/disabled/placeholder wording.
Desired behavior: Settings pages show real rows/fields with only missing controls disabled.
Acceptance criteria: Render real settings rows and disable only the missing controls with one-line helper text.
Recommended file/component: public/operations.html

### Provider/admin surface may be mixed with BNA school concepts

Severity: P1
Affected screen IDs: PROVIDERADMIN__SHELLER__COMMUNICATIONS__STUDENTS__LOAD__DESKTOP__381
Affected routes: /operations?workspace=rabbi_sheller_provider&view=communications&section=students
Current behavior: Provider workspace states should not look like BNA student accountability unless explicitly enabled.
Desired behavior: UI should be clear, wired, safe, and mapped to the correct route/workspace.
Acceptance criteria: Separate provider participants/members from BNA students and keep provider program pages simpler.
Recommended file/component: public/operations.html

### Provider/admin surface may be mixed with BNA school concepts

Severity: P1
Affected screen IDs: PROVIDERADMIN__SHELLER__API_USAGE__STUDENT__LOAD__DESKTOP__405
Affected routes: /operations?workspace=rabbi_sheller_provider&view=api_usage&section=student
Current behavior: Provider workspace states should not look like BNA student accountability unless explicitly enabled.
Desired behavior: UI should be clear, wired, safe, and mapped to the correct route/workspace.
Acceptance criteria: Separate provider participants/members from BNA students and keep provider program pages simpler.
Recommended file/component: public/operations.html

### Provider/admin surface may be mixed with BNA school concepts

Severity: P1
Affected screen IDs: PROVIDERADMIN__SHELLER__SETTINGS__STUDENT_PORTAL__LOAD__DESKTOP__430
Affected routes: /operations?workspace=rabbi_sheller_provider&view=settings&section=student_portal
Current behavior: Provider workspace states should not look like BNA student accountability unless explicitly enabled.
Desired behavior: UI should be clear, wired, safe, and mapped to the correct route/workspace.
Acceptance criteria: Separate provider participants/members from BNA students and keep provider program pages simpler.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: PUBLIC__WEBSITE__WEBSITE__PUBLIC_SITE_HOME__LOAD__MOBILE__446
Affected routes: /
Current behavior: 21 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/*.html and shared CSS

### Small mobile tap targets

Severity: P1
Affected screen IDs: PUBLIC__WEBSITE__WEBSITE__HEBREW_STATE__LOAD__MOBILE__447
Affected routes: /he
Current behavior: 9 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/*.html and shared CSS

### Small mobile tap targets

Severity: P1
Affected screen IDs: PUBLIC__WEBSITE__WEBSITE__BLOG__LOAD__MOBILE__448
Affected routes: /blog
Current behavior: 18 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/*.html and shared CSS

### Small mobile tap targets

Severity: P1
Affected screen IDs: PUBLIC__WEBSITE__WEBSITE__HEBREW_STATE__LOAD__MOBILE__449
Affected routes: /he/blog
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/*.html and shared CSS

### Small mobile tap targets

Severity: P1
Affected screen IDs: PUBLIC__WEBSITE__WEBSITE__PARENT_HANDBOOK__LOAD__MOBILE__455
Affected routes: /documents/parent-handbook.html
Current behavior: 1 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/*.html and shared CSS

### Parent assistant is missing or not obvious

Severity: P1
Affected screen IDs: PARENT__BNA__PORTAL__PARENT_PORTAL_LOGIN__LOAD__MOBILE__457
Affected routes: /parent
Current behavior: The school parent/student experience should expose a scoped natural-language help panel, but the current captured state does not make it obvious.
Desired behavior: Scoped bot/help assistant is visible and safe for the current role.
Acceptance criteria: Add a bottom-right assistant on desktop and a sticky Ask/help bar or full-screen sheet on mobile, with explicit scope text.
Recommended file/component: public/parent.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: STUDENT__BNA__PORTAL__STUDENT_WORKSPACE_LOGIN__LOAD__MOBILE__458
Affected routes: /student
Current behavior: 2 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/student.html

### Student assistant is missing or not obvious

Severity: P1
Affected screen IDs: STUDENT__BNA__PORTAL__STUDENT_WORKSPACE_LOGIN__LOAD__MOBILE__458
Affected routes: /student
Current behavior: The school parent/student experience should expose a scoped natural-language help panel, but the current captured state does not make it obvious.
Desired behavior: Scoped bot/help assistant is visible and safe for the current role.
Acceptance criteria: Add a bottom-right assistant on desktop and a sticky Ask/help bar or full-screen sheet on mobile, with explicit scope text.
Recommended file/component: public/student.html

### Parent assistant is missing or not obvious

Severity: P1
Affected screen IDs: PARENT__BNA__PORTAL__HEBREW_STATE__SWITCH_HEBREW__MOBILE__461
Affected routes: /parent
Current behavior: The school parent/student experience should expose a scoped natural-language help panel, but the current captured state does not make it obvious.
Desired behavior: Scoped bot/help assistant is visible and safe for the current role.
Acceptance criteria: Add a bottom-right assistant on desktop and a sticky Ask/help bar or full-screen sheet on mobile, with explicit scope text.
Recommended file/component: public/parent.html

### Parent assistant is missing or not obvious

Severity: P1
Affected screen IDs: PARENT__BNA__PORTAL__PASSWORD_RESET__OPEN_PASSWORD_RESET__MOBILE__462
Affected routes: /parent
Current behavior: The school parent/student experience should expose a scoped natural-language help panel, but the current captured state does not make it obvious.
Desired behavior: Scoped bot/help assistant is visible and safe for the current role.
Acceptance criteria: Add a bottom-right assistant on desktop and a sticky Ask/help bar or full-screen sheet on mobile, with explicit scope text.
Recommended file/component: public/parent.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: STUDENT__BNA__PORTAL__HEBREW_STATE__SWITCH_HEBREW__MOBILE__463
Affected routes: /student
Current behavior: 2 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/student.html

### Student assistant is missing or not obvious

Severity: P1
Affected screen IDs: STUDENT__BNA__PORTAL__HEBREW_STATE__SWITCH_HEBREW__MOBILE__463
Affected routes: /student
Current behavior: The school parent/student experience should expose a scoped natural-language help panel, but the current captured state does not make it obvious.
Desired behavior: Scoped bot/help assistant is visible and safe for the current role.
Acceptance criteria: Add a bottom-right assistant on desktop and a sticky Ask/help bar or full-screen sheet on mobile, with explicit scope text.
Recommended file/component: public/student.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__DASHBOARD__OVERVIEW__LOAD__MOBILE__465
Affected routes: /operations?workspace=platform&view=dashboard&section=overview
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__PIPELINES__PROVIDER_CLASS__LOAD__MOBILE__472
Affected routes: /operations?workspace=platform&view=pipelines&section=provider_class
Current behavior: 1 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__PIPELINES__PROVIDER_ONBOARDING__LOAD__MOBILE__473
Affected routes: /operations?workspace=platform&view=pipelines&section=provider_onboarding
Current behavior: 1 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__PIPELINES__PARTICIPANTS__LOAD__MOBILE__474
Affected routes: /operations?workspace=platform&view=pipelines&section=participants
Current behavior: 28 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__STUDENTS__OVERVIEW__LOAD__MOBILE__484
Affected routes: /operations?workspace=platform&view=students&section=overview
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__STUDENTS__LIST__LOAD__MOBILE__485
Affected routes: /operations?workspace=platform&view=students&section=list
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__STUDENTS__GROUP_GOAL__LOAD__MOBILE__486
Affected routes: /operations?workspace=platform&view=students&section=group_goal
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__STUDENTS__GOAL_BOARD__LOAD__MOBILE__487
Affected routes: /operations?workspace=platform&view=students&section=goal_board
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__STUDENTS__ASSIGNMENTS__LOAD__MOBILE__488
Affected routes: /operations?workspace=platform&view=students&section=assignments
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__STUDENTS__QUESTIONS__LOAD__MOBILE__489
Affected routes: /operations?workspace=platform&view=students&section=questions
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__STUDENTS__DOCUMENTS__LOAD__MOBILE__490
Affected routes: /operations?workspace=platform&view=students&section=documents
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__STUDENTS__PORTAL_LINKS__LOAD__MOBILE__491
Affected routes: /operations?workspace=platform&view=students&section=portal_links
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__STUDENTS__TABLET_ACCESS__LOAD__MOBILE__492
Affected routes: /operations?workspace=platform&view=students&section=tablet_access
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__STUDENTS__PROFILE__LOAD__MOBILE__493
Affected routes: /operations?workspace=platform&view=students&section=profile
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__STUDENTS__PARENT_FAMILY__LOAD__MOBILE__494
Affected routes: /operations?workspace=platform&view=students&section=parent_family
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__STUDENTS__ANALYSIS__LOAD__MOBILE__495
Affected routes: /operations?workspace=platform&view=students&section=analysis
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__STUDENTS__MEETINGS__LOAD__MOBILE__496
Affected routes: /operations?workspace=platform&view=students&section=meetings
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__STUDENTS__BOT_SETTINGS__LOAD__MOBILE__497
Affected routes: /operations?workspace=platform&view=students&section=bot_settings
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__STUDENTS__NEXT_YEAR_LOGIN__LOAD__MOBILE__499
Affected routes: /operations?workspace=platform&view=students&section=next_year_login
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__CONTACTS__OVERVIEW__LOAD__MOBILE__500
Affected routes: /operations?workspace=platform&view=contacts&section=overview
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__CONTACTS__INTERESTED_PARENTS__LOAD__MOBILE__501
Affected routes: /operations?workspace=platform&view=contacts&section=interested_parents
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__CONTACTS__PARENTS__LOAD__MOBILE__502
Affected routes: /operations?workspace=platform&view=contacts&section=parents
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__CONTACTS__PEOPLE__LOAD__MOBILE__503
Affected routes: /operations?workspace=platform&view=contacts&section=people
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__CONTACTS__CONTACTS__LOAD__MOBILE__504
Affected routes: /operations?workspace=platform&view=contacts&section=contacts
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__CONTACTS__NOTES__LOAD__MOBILE__505
Affected routes: /operations?workspace=platform&view=contacts&section=notes
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__CONTACTS__STUDENTS__LOAD__MOBILE__506
Affected routes: /operations?workspace=platform&view=contacts&section=students
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__CONTACTS__INTAKE__LOAD__MOBILE__507
Affected routes: /operations?workspace=platform&view=contacts&section=intake
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__CONTACTS__FOLLOW_UP__LOAD__MOBILE__508
Affected routes: /operations?workspace=platform&view=contacts&section=follow_up
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__CONTACTS__TAGS__LOAD__MOBILE__509
Affected routes: /operations?workspace=platform&view=contacts&section=tags
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__CONTENT__LIBRARY__LOAD__MOBILE__510
Affected routes: /operations?workspace=platform&view=content&section=library
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__CONTENT__MEETINGS__LOAD__MOBILE__511
Affected routes: /operations?workspace=platform&view=content&section=meetings
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__CONTENT__RESEARCH__LOAD__MOBILE__512
Affected routes: /operations?workspace=platform&view=content&section=research
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__CONTENT__SELECTED__LOAD__MOBILE__513
Affected routes: /operations?workspace=platform&view=content&section=selected
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__CONTENT__REPURPOSE__LOAD__MOBILE__514
Affected routes: /operations?workspace=platform&view=content&section=repurpose
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__CONTENT__NEWSLETTER__LOAD__MOBILE__515
Affected routes: /operations?workspace=platform&view=content&section=newsletter
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__CONTENT__PROMPTS__LOAD__MOBILE__516
Affected routes: /operations?workspace=platform&view=content&section=prompts
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__CONTENT__BUNDLES__LOAD__MOBILE__517
Affected routes: /operations?workspace=platform&view=content&section=bundles
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__SERVICE_PROVIDERS__DIRECTORY__LOAD__MOBILE__527
Affected routes: /operations?workspace=platform&view=service_providers&section=directory
Current behavior: 1 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__SERVICE_PROVIDERS__WORKSPACES__LOAD__MOBILE__528
Affected routes: /operations?workspace=platform&view=service_providers&section=workspaces
Current behavior: 1 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__SERVICE_PROVIDERS__COMMERCIAL__LOAD__MOBILE__529
Affected routes: /operations?workspace=platform&view=service_providers&section=commercial
Current behavior: 1 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__SERVICE_PROVIDERS__PLANS__LOAD__MOBILE__530
Affected routes: /operations?workspace=platform&view=service_providers&section=plans
Current behavior: 1 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__SERVICE_PROVIDERS__ONBOARDING__LOAD__MOBILE__531
Affected routes: /operations?workspace=platform&view=service_providers&section=onboarding
Current behavior: 1 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__SERVICE_PROVIDERS__ACCESS_CHECKLIST__LOAD__MOBILE__532
Affected routes: /operations?workspace=platform&view=service_providers&section=access_checklist
Current behavior: 1 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__SERVICE_PROVIDERS__INTEGRATION_AUDIT__LOAD__MOBILE__533
Affected routes: /operations?workspace=platform&view=service_providers&section=integration_audit
Current behavior: 1 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__SERVICE_PROVIDERS__COMMUNITIES__LOAD__MOBILE__534
Affected routes: /operations?workspace=platform&view=service_providers&section=communities
Current behavior: 2 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__SERVICE_PROVIDERS__CONTENT__LOAD__MOBILE__535
Affected routes: /operations?workspace=platform&view=service_providers&section=content
Current behavior: 1 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__SERVICE_PROVIDERS__MARKETING__LOAD__MOBILE__536
Affected routes: /operations?workspace=platform&view=service_providers&section=marketing
Current behavior: 2 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__SERVICE_PROVIDERS__LEADS__LOAD__MOBILE__537
Affected routes: /operations?workspace=platform&view=service_providers&section=leads
Current behavior: 1 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__SERVICE_PROVIDERS__COMMUNICATIONS__LOAD__MOBILE__538
Affected routes: /operations?workspace=platform&view=service_providers&section=communications
Current behavior: 1 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__COMMUNICATIONS__PARENTS__LOAD__MOBILE__541
Affected routes: /operations?workspace=platform&view=communications&section=parents
Current behavior: 1 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__COMMUNICATIONS__STUDENTS__LOAD__MOBILE__542
Affected routes: /operations?workspace=platform&view=communications&section=students
Current behavior: 1 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__COMMUNICATIONS__PROVIDERS__LOAD__MOBILE__543
Affected routes: /operations?workspace=platform&view=communications&section=providers
Current behavior: 1 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__COMMUNICATIONS__INTERNAL__LOAD__MOBILE__544
Affected routes: /operations?workspace=platform&view=communications&section=internal
Current behavior: 1 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__COMMUNICATIONS__WHATSAPP__LOAD__MOBILE__545
Affected routes: /operations?workspace=platform&view=communications&section=whatsapp
Current behavior: 1 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__COMMUNICATIONS__BOTS__LOAD__MOBILE__547
Affected routes: /operations?workspace=platform&view=communications&section=bots
Current behavior: 2 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__COMMUNICATIONS__TEMPLATES__LOAD__MOBILE__548
Affected routes: /operations?workspace=platform&view=communications&section=templates
Current behavior: 1 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__COMMUNICATIONS__SETTINGS__LOAD__MOBILE__549
Affected routes: /operations?workspace=platform&view=communications&section=settings
Current behavior: 1 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__INTERNAL_DIALOGUE__SHLOIMIE_RABBI__LOAD__MOBILE__551
Affected routes: /operations?workspace=platform&view=internal_dialogue&section=shloimie_rabbi
Current behavior: 1 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__INTERNAL_DIALOGUE__MEETING_NOTES__LOAD__MOBILE__552
Affected routes: /operations?workspace=platform&view=internal_dialogue&section=meeting_notes
Current behavior: 1 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__INTERNAL_DIALOGUE__UPLOADS__LOAD__MOBILE__553
Affected routes: /operations?workspace=platform&view=internal_dialogue&section=uploads
Current behavior: 1 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__INTERNAL_DIALOGUE__SUPPORT__LOAD__MOBILE__555
Affected routes: /operations?workspace=platform&view=internal_dialogue&section=support
Current behavior: 1 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__ACCOUNTING__OVERVIEW__LOAD__MOBILE__557
Affected routes: /operations?workspace=platform&view=accounting&section=overview
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__ACCOUNTING__PAYMENTS__LOAD__MOBILE__558
Affected routes: /operations?workspace=platform&view=accounting&section=payments
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__ACCOUNTING__OPEN__LOAD__MOBILE__559
Affected routes: /operations?workspace=platform&view=accounting&section=open
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__ACCOUNTING__PAID__LOAD__MOBILE__560
Affected routes: /operations?workspace=platform&view=accounting&section=paid
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__ACCOUNTING__NEEDS_SIGNUP__LOAD__MOBILE__561
Affected routes: /operations?workspace=platform&view=accounting&section=needs_signup
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__ACCOUNTING__EXCEPTIONS__LOAD__MOBILE__562
Affected routes: /operations?workspace=platform&view=accounting&section=exceptions
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__API_USAGE__WORKSPACE__LOAD__MOBILE__564
Affected routes: /operations?workspace=platform&view=api_usage&section=workspace
Current behavior: 1 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__API_USAGE__PARENT__LOAD__MOBILE__565
Affected routes: /operations?workspace=platform&view=api_usage&section=parent
Current behavior: 1 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__API_USAGE__STUDENT__LOAD__MOBILE__566
Affected routes: /operations?workspace=platform&view=api_usage&section=student
Current behavior: 1 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__API_USAGE__PROVIDER__LOAD__MOBILE__567
Affected routes: /operations?workspace=platform&view=api_usage&section=provider
Current behavior: 1 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__API_USAGE__BOT__LOAD__MOBILE__568
Affected routes: /operations?workspace=platform&view=api_usage&section=bot
Current behavior: 1 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__API_USAGE__BUDGETS__LOAD__MOBILE__570
Affected routes: /operations?workspace=platform&view=api_usage&section=budgets
Current behavior: 1 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__API_USAGE__SETTINGS__LOAD__MOBILE__571
Affected routes: /operations?workspace=platform&view=api_usage&section=settings
Current behavior: 1 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__ADMIN__OVERVIEW__LOAD__MOBILE__572
Affected routes: /operations?workspace=platform&view=admin&section=overview
Current behavior: 6 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

### Small mobile tap targets

Severity: P1
Affected screen IDs: SUPERADMIN__PLATFORM__ADMIN__ROLES__LOAD__MOBILE__574
Affected routes: /operations?workspace=platform&view=admin&section=roles
Current behavior: 1 visible controls appear smaller than comfortable tap targets.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Normalize buttons/links/inputs to at least 40px height on mobile.
Recommended file/component: public/operations.html

## P2

### Too many card/panel blocks

Severity: P2
Affected screen IDs: PUBLIC__WEBSITE__WEBSITE__PUBLIC_SITE_HOME__LOAD__DESKTOP__001
Affected routes: /
Current behavior: The screen has 74 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/*.html and shared CSS

### Too many card/panel blocks

Severity: P2
Affected screen IDs: PUBLIC__WEBSITE__WEBSITE__BLOG__LOAD__DESKTOP__003
Affected routes: /blog
Current behavior: The screen has 73 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/*.html and shared CSS

### Too many card/panel blocks

Severity: P2
Affected screen IDs: SUPERADMIN__PLATFORM__SERVICE_PROVIDERS__OVERVIEW__LOAD__DESKTOP__081
Affected routes: /operations?workspace=platform&view=service_providers&section=overview
Current behavior: The screen has 83 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: SUPERADMIN__PLATFORM__SERVICE_PROVIDERS__DIRECTORY__LOAD__DESKTOP__082
Affected routes: /operations?workspace=platform&view=service_providers&section=directory
Current behavior: The screen has 82 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: SUPERADMIN__PLATFORM__SERVICE_PROVIDERS__WORKSPACES__LOAD__DESKTOP__083
Affected routes: /operations?workspace=platform&view=service_providers&section=workspaces
Current behavior: The screen exposes 75 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: SUPERADMIN__PLATFORM__SERVICE_PROVIDERS__WORKSPACES__LOAD__DESKTOP__083
Affected routes: /operations?workspace=platform&view=service_providers&section=workspaces
Current behavior: The screen has 62 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: SUPERADMIN__PLATFORM__COMMUNICATIONS__OVERVIEW__LOAD__DESKTOP__095
Affected routes: /operations?workspace=platform&view=communications&section=overview
Current behavior: The screen has 203 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: SUPERADMIN__PLATFORM__COMMUNICATIONS__PARENTS__LOAD__DESKTOP__096
Affected routes: /operations?workspace=platform&view=communications&section=parents
Current behavior: The screen has 194 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: SUPERADMIN__PLATFORM__COMMUNICATIONS__EMAIL__LOAD__DESKTOP__101
Affected routes: /operations?workspace=platform&view=communications&section=email
Current behavior: The screen has 90 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: SUPERADMIN__PLATFORM__SETTINGS__INTEGRATIONS__LOAD__DESKTOP__156
Affected routes: /operations?workspace=platform&view=settings&section=integrations
Current behavior: The screen exposes 73 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: BNAADMIN__BNA__STUDENTS__ASSIGNMENTS__LOAD__DESKTOP__185
Affected routes: /operations?workspace=bna&view=students&section=assignments&student=643
Current behavior: The screen exposes 57 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__CONTACTS__PEOPLE__LOAD__DESKTOP__200
Affected routes: /operations?workspace=bna&view=contacts&section=people
Current behavior: The screen has 81 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: BNAADMIN__BNA__CONTENT__LIBRARY__LOAD__DESKTOP__207
Affected routes: /operations?workspace=bna&view=content&section=library
Current behavior: The screen exposes 75 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__CONTENT__LIBRARY__LOAD__DESKTOP__207
Affected routes: /operations?workspace=bna&view=content&section=library
Current behavior: The screen has 211 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: BNAADMIN__BNA__CONTENT__RESEARCH__LOAD__DESKTOP__209
Affected routes: /operations?workspace=bna&view=content&section=research
Current behavior: The screen exposes 110 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__CONTENT__RESEARCH__LOAD__DESKTOP__209
Affected routes: /operations?workspace=bna&view=content&section=research
Current behavior: The screen has 485 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: BNAADMIN__BNA__CONTENT__REPURPOSE__LOAD__DESKTOP__211
Affected routes: /operations?workspace=bna&view=content&section=repurpose
Current behavior: The screen exposes 75 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__CONTENT__REPURPOSE__LOAD__DESKTOP__211
Affected routes: /operations?workspace=bna&view=content&section=repurpose
Current behavior: The screen has 211 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__SERVICE_PROVIDERS__OVERVIEW__LOAD__DESKTOP__223
Affected routes: /operations?workspace=bna&view=service_providers&section=overview
Current behavior: The screen has 83 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__SERVICE_PROVIDERS__DIRECTORY__LOAD__DESKTOP__224
Affected routes: /operations?workspace=bna&view=service_providers&section=directory
Current behavior: The screen has 82 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: BNAADMIN__BNA__SERVICE_PROVIDERS__WORKSPACES__LOAD__DESKTOP__225
Affected routes: /operations?workspace=bna&view=service_providers&section=workspaces
Current behavior: The screen exposes 77 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__SERVICE_PROVIDERS__WORKSPACES__LOAD__DESKTOP__225
Affected routes: /operations?workspace=bna&view=service_providers&section=workspaces
Current behavior: The screen has 62 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__COMMUNICATIONS__OVERVIEW__LOAD__DESKTOP__237
Affected routes: /operations?workspace=bna&view=communications&section=overview
Current behavior: The screen has 203 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__COMMUNICATIONS__PARENTS__LOAD__DESKTOP__238
Affected routes: /operations?workspace=bna&view=communications&section=parents
Current behavior: The screen has 194 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__COMMUNICATIONS__EMAIL__LOAD__DESKTOP__243
Affected routes: /operations?workspace=bna&view=communications&section=email
Current behavior: The screen has 90 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: BNAADMIN__BNA__SETTINGS__INTEGRATIONS__LOAD__DESKTOP__298
Affected routes: /operations?workspace=bna&view=settings&section=integrations
Current behavior: The screen exposes 60 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: PROVIDERADMIN__SHELLER__CONTENT__LIBRARY__LOAD__DESKTOP__349
Affected routes: /operations?workspace=rabbi_sheller_provider&view=content&section=library
Current behavior: The screen exposes 73 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: PROVIDERADMIN__SHELLER__CONTENT__LIBRARY__LOAD__DESKTOP__349
Affected routes: /operations?workspace=rabbi_sheller_provider&view=content&section=library
Current behavior: The screen has 211 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: PROVIDERADMIN__SHELLER__CONTENT__RESEARCH__LOAD__DESKTOP__351
Affected routes: /operations?workspace=rabbi_sheller_provider&view=content&section=research
Current behavior: The screen exposes 108 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: PROVIDERADMIN__SHELLER__CONTENT__RESEARCH__LOAD__DESKTOP__351
Affected routes: /operations?workspace=rabbi_sheller_provider&view=content&section=research
Current behavior: The screen has 485 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: PROVIDERADMIN__SHELLER__CONTENT__REPURPOSE__LOAD__DESKTOP__353
Affected routes: /operations?workspace=rabbi_sheller_provider&view=content&section=repurpose
Current behavior: The screen exposes 73 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: PROVIDERADMIN__SHELLER__CONTENT__REPURPOSE__LOAD__DESKTOP__353
Affected routes: /operations?workspace=rabbi_sheller_provider&view=content&section=repurpose
Current behavior: The screen has 211 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: PROVIDERADMIN__SHELLER__SERVICE_PROVIDERS__OVERVIEW__LOAD__DESKTOP__365
Affected routes: /operations?workspace=rabbi_sheller_provider&view=service_providers&section=overview
Current behavior: The screen has 83 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: PROVIDERADMIN__SHELLER__SERVICE_PROVIDERS__DIRECTORY__LOAD__DESKTOP__366
Affected routes: /operations?workspace=rabbi_sheller_provider&view=service_providers&section=directory
Current behavior: The screen has 82 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: PROVIDERADMIN__SHELLER__SERVICE_PROVIDERS__WORKSPACES__LOAD__DESKTOP__367
Affected routes: /operations?workspace=rabbi_sheller_provider&view=service_providers&section=workspaces
Current behavior: The screen exposes 75 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: PROVIDERADMIN__SHELLER__SERVICE_PROVIDERS__WORKSPACES__LOAD__DESKTOP__367
Affected routes: /operations?workspace=rabbi_sheller_provider&view=service_providers&section=workspaces
Current behavior: The screen has 62 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: PROVIDERADMIN__SHELLER__COMMUNICATIONS__OVERVIEW__LOAD__DESKTOP__379
Affected routes: /operations?workspace=rabbi_sheller_provider&view=communications&section=overview
Current behavior: The screen has 203 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: PROVIDERADMIN__SHELLER__COMMUNICATIONS__PARENTS__LOAD__DESKTOP__380
Affected routes: /operations?workspace=rabbi_sheller_provider&view=communications&section=parents
Current behavior: The screen has 194 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: PROVIDERADMIN__SHELLER__COMMUNICATIONS__EMAIL__LOAD__DESKTOP__385
Affected routes: /operations?workspace=rabbi_sheller_provider&view=communications&section=email
Current behavior: The screen has 90 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: PUBLIC__WEBSITE__WEBSITE__PUBLIC_SITE_HOME__LOAD__MOBILE__446
Affected routes: /
Current behavior: The screen has 74 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/*.html and shared CSS

### Too many card/panel blocks

Severity: P2
Affected screen IDs: PUBLIC__WEBSITE__WEBSITE__HEBREW_STATE__LOAD__MOBILE__447
Affected routes: /he
Current behavior: The screen has 50 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/*.html and shared CSS

### Too many card/panel blocks

Severity: P2
Affected screen IDs: PUBLIC__WEBSITE__WEBSITE__BLOG__LOAD__MOBILE__448
Affected routes: /blog
Current behavior: The screen has 73 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/*.html and shared CSS

### Too many card/panel blocks

Severity: P2
Affected screen IDs: SUPERADMIN__PLATFORM__PIPELINES__PARTICIPANTS__LOAD__MOBILE__474
Affected routes: /operations?workspace=platform&view=pipelines&section=participants
Current behavior: The screen has 37 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: SUPERADMIN__PLATFORM__COMMUNICATIONS__OVERVIEW__LOAD__MOBILE__540
Affected routes: /operations?workspace=platform&view=communications&section=overview
Current behavior: The screen has 203 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: SUPERADMIN__PLATFORM__COMMUNICATIONS__PARENTS__LOAD__MOBILE__541
Affected routes: /operations?workspace=platform&view=communications&section=parents
Current behavior: The screen has 194 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: SUPERADMIN__PLATFORM__COMMUNICATIONS__EMAIL__LOAD__MOBILE__546
Affected routes: /operations?workspace=platform&view=communications&section=email
Current behavior: The screen has 90 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: SUPERADMIN__PLATFORM__SETTINGS__INTEGRATIONS__LOAD__MOBILE__601
Affected routes: /operations?workspace=platform&view=settings&section=integrations
Current behavior: The screen has 42 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__CONTACTS__OVERVIEW__LOAD__MOBILE__643
Affected routes: /operations?workspace=bna&view=contacts&section=overview
Current behavior: The screen has 41 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__CONTACTS__PARENTS__LOAD__MOBILE__645
Affected routes: /operations?workspace=bna&view=contacts&section=parents
Current behavior: The screen has 41 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__CONTACTS__PEOPLE__LOAD__MOBILE__646
Affected routes: /operations?workspace=bna&view=contacts&section=people
Current behavior: The screen has 81 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__CONTACTS__CONTACTS__LOAD__MOBILE__647
Affected routes: /operations?workspace=bna&view=contacts&section=contacts
Current behavior: The screen has 41 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__CONTACTS__NOTES__LOAD__MOBILE__648
Affected routes: /operations?workspace=bna&view=contacts&section=notes
Current behavior: The screen has 41 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__CONTACTS__STUDENTS__LOAD__MOBILE__649
Affected routes: /operations?workspace=bna&view=contacts&section=students
Current behavior: The screen has 41 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__CONTACTS__INTAKE__LOAD__MOBILE__650
Affected routes: /operations?workspace=bna&view=contacts&section=intake
Current behavior: The screen has 41 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__CONTACTS__FOLLOW_UP__LOAD__MOBILE__651
Affected routes: /operations?workspace=bna&view=contacts&section=follow_up
Current behavior: The screen has 41 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__CONTACTS__TAGS__LOAD__MOBILE__652
Affected routes: /operations?workspace=bna&view=contacts&section=tags
Current behavior: The screen has 41 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__CONTENT__RESEARCH__LOAD__MOBILE__655
Affected routes: /operations?workspace=bna&view=content&section=research
Current behavior: The screen has 485 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__CONTENT__REPURPOSE__LOAD__MOBILE__657
Affected routes: /operations?workspace=bna&view=content&section=repurpose
Current behavior: The screen has 211 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__SERVICE_PROVIDERS__OVERVIEW__LOAD__MOBILE__669
Affected routes: /operations?workspace=bna&view=service_providers&section=overview
Current behavior: The screen has 83 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__SERVICE_PROVIDERS__DIRECTORY__LOAD__MOBILE__670
Affected routes: /operations?workspace=bna&view=service_providers&section=directory
Current behavior: The screen has 82 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__SERVICE_PROVIDERS__WORKSPACES__LOAD__MOBILE__671
Affected routes: /operations?workspace=bna&view=service_providers&section=workspaces
Current behavior: The screen has 62 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__SERVICE_PROVIDERS__ACCESS_CHECKLIST__LOAD__MOBILE__675
Affected routes: /operations?workspace=bna&view=service_providers&section=access_checklist
Current behavior: The screen has 47 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__COMMUNICATIONS__OVERVIEW__LOAD__MOBILE__683
Affected routes: /operations?workspace=bna&view=communications&section=overview
Current behavior: The screen has 203 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__COMMUNICATIONS__PARENTS__LOAD__MOBILE__684
Affected routes: /operations?workspace=bna&view=communications&section=parents
Current behavior: The screen has 194 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__COMMUNICATIONS__EMAIL__LOAD__MOBILE__689
Affected routes: /operations?workspace=bna&view=communications&section=email
Current behavior: The screen has 90 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: PROVIDERADMIN__SHELLER__CONTENT__LIBRARY__LOAD__MOBILE__796
Affected routes: /operations?workspace=rabbi_sheller_provider&view=content&section=library
Current behavior: The screen has 211 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: PROVIDERADMIN__SHELLER__CONTENT__RESEARCH__LOAD__MOBILE__798
Affected routes: /operations?workspace=rabbi_sheller_provider&view=content&section=research
Current behavior: The screen has 485 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: PROVIDERADMIN__SHELLER__CONTENT__REPURPOSE__LOAD__MOBILE__800
Affected routes: /operations?workspace=rabbi_sheller_provider&view=content&section=repurpose
Current behavior: The screen has 211 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: PROVIDERADMIN__SHELLER__SERVICE_PROVIDERS__OVERVIEW__LOAD__MOBILE__812
Affected routes: /operations?workspace=rabbi_sheller_provider&view=service_providers&section=overview
Current behavior: The screen has 83 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: PROVIDERADMIN__SHELLER__SERVICE_PROVIDERS__DIRECTORY__LOAD__MOBILE__813
Affected routes: /operations?workspace=rabbi_sheller_provider&view=service_providers&section=directory
Current behavior: The screen has 82 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: PROVIDERADMIN__SHELLER__SERVICE_PROVIDERS__WORKSPACES__LOAD__MOBILE__814
Affected routes: /operations?workspace=rabbi_sheller_provider&view=service_providers&section=workspaces
Current behavior: The screen has 62 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: PROVIDERADMIN__SHELLER__SERVICE_PROVIDERS__ACCESS_CHECKLIST__LOAD__MOBILE__818
Affected routes: /operations?workspace=rabbi_sheller_provider&view=service_providers&section=access_checklist
Current behavior: The screen has 47 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: PROVIDERADMIN__SHELLER__COMMUNICATIONS__OVERVIEW__LOAD__MOBILE__826
Affected routes: /operations?workspace=rabbi_sheller_provider&view=communications&section=overview
Current behavior: The screen has 203 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: PROVIDERADMIN__SHELLER__COMMUNICATIONS__PARENTS__LOAD__MOBILE__827
Affected routes: /operations?workspace=rabbi_sheller_provider&view=communications&section=parents
Current behavior: The screen has 194 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: PROVIDERADMIN__SHELLER__COMMUNICATIONS__EMAIL__LOAD__MOBILE__832
Affected routes: /operations?workspace=rabbi_sheller_provider&view=communications&section=email
Current behavior: The screen has 90 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: PUBLIC__WEBSITE__WEBSITE__PUBLIC_SITE_HOME__LOAD__LAPTOP__894
Affected routes: /
Current behavior: The screen has 74 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/*.html and shared CSS

### Too many card/panel blocks

Severity: P2
Affected screen IDs: PUBLIC__WEBSITE__WEBSITE__BLOG__LOAD__LAPTOP__896
Affected routes: /blog
Current behavior: The screen has 73 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/*.html and shared CSS

### Too many visible actions

Severity: P2
Affected screen IDs: SUPERADMIN__PLATFORM__PIPELINES__STALE_TASKS__LOAD__LAPTOP__923
Affected routes: /operations?workspace=platform&view=pipelines&section=stale_tasks
Current behavior: The screen exposes 67 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: SUPERADMIN__PLATFORM__CALENDAR__CLASSES__LOAD__LAPTOP__969
Affected routes: /operations?workspace=platform&view=calendar&section=classes
Current behavior: The screen exposes 67 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: SUPERADMIN__PLATFORM__CALENDAR__CLASSES__LOAD__LAPTOP__969
Affected routes: /operations?workspace=platform&view=calendar&section=classes
Current behavior: The screen has 88 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: SUPERADMIN__PLATFORM__SERVICE_PROVIDERS__OVERVIEW__LOAD__LAPTOP__974
Affected routes: /operations?workspace=platform&view=service_providers&section=overview
Current behavior: The screen has 83 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: SUPERADMIN__PLATFORM__SERVICE_PROVIDERS__DIRECTORY__LOAD__LAPTOP__975
Affected routes: /operations?workspace=platform&view=service_providers&section=directory
Current behavior: The screen has 82 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: SUPERADMIN__PLATFORM__SERVICE_PROVIDERS__WORKSPACES__LOAD__LAPTOP__976
Affected routes: /operations?workspace=platform&view=service_providers&section=workspaces
Current behavior: The screen exposes 75 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: SUPERADMIN__PLATFORM__SERVICE_PROVIDERS__WORKSPACES__LOAD__LAPTOP__976
Affected routes: /operations?workspace=platform&view=service_providers&section=workspaces
Current behavior: The screen has 62 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: SUPERADMIN__PLATFORM__COMMUNICATIONS__OVERVIEW__LOAD__LAPTOP__988
Affected routes: /operations?workspace=platform&view=communications&section=overview
Current behavior: The screen has 203 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: SUPERADMIN__PLATFORM__COMMUNICATIONS__PARENTS__LOAD__LAPTOP__989
Affected routes: /operations?workspace=platform&view=communications&section=parents
Current behavior: The screen has 194 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: SUPERADMIN__PLATFORM__COMMUNICATIONS__EMAIL__LOAD__LAPTOP__994
Affected routes: /operations?workspace=platform&view=communications&section=email
Current behavior: The screen has 90 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: SUPERADMIN__PLATFORM__SETTINGS__INTEGRATIONS__LOAD__LAPTOP__1049
Affected routes: /operations?workspace=platform&view=settings&section=integrations
Current behavior: The screen exposes 73 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: BNAADMIN__BNA__TASKS__DECISIONS__LOAD__LAPTOP__1068
Affected routes: /operations?workspace=bna&view=tasks&section=decisions
Current behavior: The screen exposes 101 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: BNAADMIN__BNA__TASKS__CHANGELOG__LOAD__LAPTOP__1072
Affected routes: /operations?workspace=bna&view=tasks&section=changelog
Current behavior: The screen exposes 166 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: BNAADMIN__BNA__STUDENTS__GOAL_BOARD__LOAD__LAPTOP__1077
Affected routes: /operations?workspace=bna&view=students&section=goal_board
Current behavior: The screen exposes 79 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Horizontal overflow

Severity: P2
Affected screen IDs: BNAADMIN__BNA__STUDENTS__ASSIGNMENTS__LOAD__LAPTOP__1078
Affected routes: /operations?workspace=bna&view=students&section=assignments&student=643
Current behavior: The page is wider than the viewport.
Desired behavior: Mobile screen has no overflow and comfortable tap targets.
Acceptance criteria: Constrain grids, tables, filters, nav labels, and long unbroken content.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: BNAADMIN__BNA__STUDENTS__ASSIGNMENTS__LOAD__LAPTOP__1078
Affected routes: /operations?workspace=bna&view=students&section=assignments&student=643
Current behavior: The screen exposes 57 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: BNAADMIN__BNA__STUDENTS__QUESTIONS__LOAD__LAPTOP__1079
Affected routes: /operations?workspace=bna&view=students&section=questions
Current behavior: The screen exposes 64 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: BNAADMIN__BNA__STUDENTS__PORTAL_LINKS__LOAD__LAPTOP__1081
Affected routes: /operations?workspace=bna&view=students&section=portal_links
Current behavior: The screen exposes 86 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: BNAADMIN__BNA__STUDENTS__PARENT_FAMILY__LOAD__LAPTOP__1084
Affected routes: /operations?workspace=bna&view=students&section=parent_family
Current behavior: The screen exposes 56 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: BNAADMIN__BNA__STUDENTS__ACTIVITY__LOAD__LAPTOP__1088
Affected routes: /operations?workspace=bna&view=students&section=activity
Current behavior: The screen exposes 67 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__CONTACTS__PEOPLE__LOAD__LAPTOP__1093
Affected routes: /operations?workspace=bna&view=contacts&section=people
Current behavior: The screen has 81 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: BNAADMIN__BNA__CONTENT__LIBRARY__LOAD__LAPTOP__1100
Affected routes: /operations?workspace=bna&view=content&section=library
Current behavior: The screen exposes 75 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__CONTENT__LIBRARY__LOAD__LAPTOP__1100
Affected routes: /operations?workspace=bna&view=content&section=library
Current behavior: The screen has 211 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: BNAADMIN__BNA__CONTENT__RESEARCH__LOAD__LAPTOP__1102
Affected routes: /operations?workspace=bna&view=content&section=research
Current behavior: The screen exposes 110 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__CONTENT__RESEARCH__LOAD__LAPTOP__1102
Affected routes: /operations?workspace=bna&view=content&section=research
Current behavior: The screen has 485 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: BNAADMIN__BNA__CONTENT__REPURPOSE__LOAD__LAPTOP__1104
Affected routes: /operations?workspace=bna&view=content&section=repurpose
Current behavior: The screen exposes 75 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__CONTENT__REPURPOSE__LOAD__LAPTOP__1104
Affected routes: /operations?workspace=bna&view=content&section=repurpose
Current behavior: The screen has 211 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: BNAADMIN__BNA__CALENDAR__CLASSES__LOAD__LAPTOP__1111
Affected routes: /operations?workspace=bna&view=calendar&section=classes
Current behavior: The screen exposes 60 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__CALENDAR__CLASSES__LOAD__LAPTOP__1111
Affected routes: /operations?workspace=bna&view=calendar&section=classes
Current behavior: The screen has 70 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__SERVICE_PROVIDERS__OVERVIEW__LOAD__LAPTOP__1116
Affected routes: /operations?workspace=bna&view=service_providers&section=overview
Current behavior: The screen has 83 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__SERVICE_PROVIDERS__DIRECTORY__LOAD__LAPTOP__1117
Affected routes: /operations?workspace=bna&view=service_providers&section=directory
Current behavior: The screen has 82 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: BNAADMIN__BNA__SERVICE_PROVIDERS__WORKSPACES__LOAD__LAPTOP__1118
Affected routes: /operations?workspace=bna&view=service_providers&section=workspaces
Current behavior: The screen exposes 77 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__SERVICE_PROVIDERS__WORKSPACES__LOAD__LAPTOP__1118
Affected routes: /operations?workspace=bna&view=service_providers&section=workspaces
Current behavior: The screen has 62 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__COMMUNICATIONS__OVERVIEW__LOAD__LAPTOP__1130
Affected routes: /operations?workspace=bna&view=communications&section=overview
Current behavior: The screen has 203 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__COMMUNICATIONS__PARENTS__LOAD__LAPTOP__1131
Affected routes: /operations?workspace=bna&view=communications&section=parents
Current behavior: The screen has 194 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: BNAADMIN__BNA__COMMUNICATIONS__EMAIL__LOAD__LAPTOP__1136
Affected routes: /operations?workspace=bna&view=communications&section=email
Current behavior: The screen has 90 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: BNAADMIN__BNA__SETTINGS__INTEGRATIONS__LOAD__LAPTOP__1191
Affected routes: /operations?workspace=bna&view=settings&section=integrations
Current behavior: The screen exposes 60 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: PROVIDERADMIN__SHELLER__PIPELINES__PROVIDER_ONBOARDING__LOAD__LAPTOP__1205
Affected routes: /operations?workspace=rabbi_sheller_provider&view=pipelines&section=provider_onboarding
Current behavior: The screen exposes 147 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Too many card/panel blocks

Severity: P2
Affected screen IDs: PROVIDERADMIN__SHELLER__PIPELINES__PROVIDER_ONBOARDING__LOAD__LAPTOP__1205
Affected routes: /operations?workspace=rabbi_sheller_provider&view=pipelines&section=provider_onboarding
Current behavior: The screen has 127 card-like elements.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Use compact tables/lists and open details in drawers/pages.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: PROVIDERADMIN__SHELLER__PIPELINES__STALE_TASKS__LOAD__LAPTOP__1207
Affected routes: /operations?workspace=rabbi_sheller_provider&view=pipelines&section=stale_tasks
Current behavior: The screen exposes 67 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: PROVIDERADMIN__SHELLER__TASKS__OVERVIEW__LOAD__LAPTOP__1209
Affected routes: /operations?workspace=rabbi_sheller_provider&view=tasks&section=overview
Current behavior: The screen exposes 220 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: PROVIDERADMIN__SHELLER__TASKS__DECISIONS__LOAD__LAPTOP__1210
Affected routes: /operations?workspace=rabbi_sheller_provider&view=tasks&section=decisions
Current behavior: The screen exposes 99 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

### Too many visible actions

Severity: P2
Affected screen IDs: PROVIDERADMIN__SHELLER__TASKS__MINE__LOAD__LAPTOP__1211
Affected routes: /operations?workspace=rabbi_sheller_provider&view=tasks&section=mine
Current behavior: The screen exposes 114 visible actions.
Desired behavior: Page is compact, scannable, and action hierarchy is clear.
Acceptance criteria: Keep one primary action visible and group secondary actions into action menus.
Recommended file/component: public/operations.html

## P3

- No items in this bucket.
