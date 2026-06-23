# Registration, Provider Intake, Student Security, and Rabbi Video Pass

## Context

The operator asked for one implementation pass that keeps the public website/forms, provider intake, student portal security, and Rabbi/One Time video workflow aligned with the BNA operating rules.

This app-visible pass is deployed and live-smoked on Railway deployment `d4f0be3c-1890-4f4a-9364-41ef6d57df58`.

## Implemented And Deployed

- Public signup now treats four documents as the visible required set: Handbook, Tuition, Waiver, and Student Handbook.
- Registration/Intake Form and Parent Agreement/Signature Page remain in source as archived/reference package sections, but they are filtered out of the browser document cards and server required-signature definitions because the live signup form and signature workflow already capture the duplicated data.
- Signup English/Hebrew pages now share language tabs, Back/Home style navigation, rectangular sign/open controls, hover lift/shadow, and richer BNA footer treatment.
- `brand-kit/09-visual-design-tokens.md` documents the BNA UI/control palette and the rule that blue/gold is the system palette while graphite/sepia/parchment/Torah-scroll remains the visual identity.
- Public provider intake at `/providers/join` now collects expanded review fields: category, service area, language, ages served, web/Google links, kids served, years active, background, problems solved, pricing, typical charge, discounts/group options, ads status, raw intake, and Shloimie approval notes.
- Provider onboarding preserves the expanded fields in provider metadata and tags provider services from category/language/ages.
- Provider/student unavailable setup language was polished to user-facing `Coming soon` / approved-path wording instead of raw connector/configuration status.
- AI Max is presented as an interest/application path only. No checkout, ad launch, paid automation, publishing, posting, messages, or billing should happen until pricing/payment/delivery terms are approved.
- Student portal API routes now use `getStudentForPortalCredential`, returning 401 for missing/invalid/expired codes and 429 after repeated failed attempts in a short window.
- Student portal client no longer stores access code before validation. Invalid/revoked/missing credentials clear local storage and return the student to login.
- User-facing unavailable states should say `Coming soon`, not `not configured`.
- `scripts/smoke-live-app.mjs` now enforces the current four-document signup dry-run contract.

## Rabbi / One Time Video Workflow Brief

Do not rebuild the existing Remotion stack. Extend the current natural-language video editing scripts:

- `scripts/video-edit.mjs` already turns prompts into safe Remotion render JSON for `BnaIntroPortrait` / `BnaIntroWide`, with tone presets, concise copy, duration bounds, and no claim that BNA is an accredited/clinical program.
- `scripts/video-edit-source.mjs` already accepts a source video, optional assets, orientation (`portrait`, `wide`, `square`, `source`), timeline segments, speed/zoom/focus/brightness/contrast, text/subtitle/image/audio overlays, and simple transitions.
- Next version should add Rabbi/One Time presets without exposing BNA private areas: 16:9, 9:16, and 1:1 outputs; raw long clip in, short publishable clip out; CTA options such as join the Mishnah class; optional music/audio overlay slots; word flashes/transitions; per-platform presets; Rabbi style/template library; and natural-language slide/presentation planning.
- Keep One Time project scoped separately from BNA school parents/students. Rabbi video/library tooling is provider/project work, not BNA student portal work.
- Cloud rendering should only be added after local Remotion limits are proven and a provider/credential decision exists.

## Open Decisions

- Decide final student auth model: private code only, or code plus PIN/password.
- Decide whether student portal rate-limit/audit should be persistent database-backed rather than in-memory.
- Confirm AI Max pricing, payment, delivery, and approval rules before enabling checkout or paid automation.
- Confirm whether any archived registration package sections should be restored as visible public docs. Current local direction is no.

## Verification Checklist

- PASS `node --check server.js`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS `node --check scripts/smoke-live-app.mjs`
- PASS focused contracts: `node --test tests/parent-student-portal-contract.test.js tests/service-provider-directory.test.js tests/parent-student-polish-contract.test.js` (35/35)
- PASS `npm test` (277/277)
- PASS `npm run screenshot` (360/390/430/768/1440, no horizontal scroll)
- PASS dedicated local Playwright smoke against `http://127.0.0.1:8125`: homepage rendered, English signup showed exactly Handbook/Tuition/Waiver/Student Handbook, Hebrew signup was RTL with four docs, provider join showed AI Max guardrails and expanded fields, service-provider shell loaded, bad/stale student codes cleared local storage, and missing code returned 401.
- WARN Lighthouse report generated at `tmp/registration-provider-security-lighthouse.html` with scores Performance 67, Accessibility 84, Best Practices 100, SEO 100, Agentic Browsing 50; CLI exited 1 only during Windows Chrome temp cleanup (`EPERM`).
- PASS Railway deployment `d4f0be3c-1890-4f4a-9364-41ef6d57df58` reached SUCCESS.
- PASS `npm run railway:doctor`.
- PASS `npm run app:smoke`; report: `ops/live-smokes/2026-06-12T12-04-54-426Z-live-app-smoke.md`.
- PASS production Playwright smoke against `https://bneineviimacademy.org`; report and screenshots: `ops/playwright-smokes/2026-06-12-registration-provider-security-production/`.
