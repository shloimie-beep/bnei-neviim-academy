# RAW-20260712-010 - One Time Signup Family/School Custom Picker

Date: 2026-07-12
Source channel: codex_chat
Workspace: rabbi_sheller_provider
Project: one_time_mishnah_class
Status: captured

## Raw Source

Also the form isn't working I selected family and it still said select family or school also store in the memory that we're never using the Samsung you know pop-up option it's always going to be like a clean pop-up field in our own user interface so fix that and make sure that works in the form that I'm make sure it work so when I selected it should actually work

## Compiled Requirements

- REQ-20260712-010A: Fix the One Time signup form so selecting `Family` or `School` reliably sets the submitted `signup_as` value.
- REQ-20260712-010B: Replace the native mobile/Samsung-style Family/School picker with a clean in-page One Time UI control.
- REQ-20260712-010C: Ensure validation clears the Family/School error after a valid selection and does not block submit with a stale `Choose Family or School` message.
- REQ-20260712-010D: Store the durable preference that customer-facing choice fields should use owned in-page UI controls instead of native Samsung/Android pop-up select controls.
- REQ-20260712-010E: Prove the fix with a real browser click test, not only a programmatic `selectOption` test.
