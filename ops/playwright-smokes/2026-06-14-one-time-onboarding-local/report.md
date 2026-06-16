# One Time Onboarding Local Browser Smoke

Date: 2026-06-14
Target: http://127.0.0.1:8100/one-time-preview#one-time-onboarding

## Result

PASS

## Checks

- Preview page loaded with title `One Time Mishnah Preview`.
- Guided onboarding form rendered once at `#one-time-onboarding`.
- Text fields accepted local smoke values for contact, learner, age, location, and questions.
- Styled intent option changed from live membership to `library`.
- Review-only acknowledgment checkbox toggled after scrolling it into a stable viewport position.
- Review-only/no-send copy was present on the page.
- The submit button was visible as `Send for review`.

## Safety

The browser smoke did not submit the form. The write path is covered by the separate dry-run endpoint smoke, which returned `no_send: true`, `external_write_performed: false`, and `local_write_performed: false`.
