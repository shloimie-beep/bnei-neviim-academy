# Model Readiness

Generated for branch `codex/closeout-assistant-ramble-usage-20260624`.

## Module

`src/platform/assistant/model-readiness.js` exposes:

- `MODEL_CREDENTIAL_STATES`
- `classifyModelCredentialState(input)`
- `disabledReasonForModelState(state, detail)`
- `buildModelReadinessMatrix(providers, options)`
- `hasUsableCredential(value)`

## States

| State | Meaning | Live call allowed |
| --- | --- | --- |
| `missing` | No usable credential is configured. | No |
| `configured` | Credential exists, but a live call has not been proven in this audit. | No |
| `invalid` | Configured credential failed authentication. | No |
| `test_only` | Only a test/dry-run credential is configured. | No |
| `live` | A live model call has succeeded. | Yes |
| `rate_limited` | Provider rejected due to rate limit. | No |
| `quota_exhausted` | Provider rejected due to quota, credits, or billing capacity. | No |
| `external_outage` | Provider or network path is unavailable. | No |

## Disabled Reasons

The runtime does not collapse failures into a generic "Blocked" message. It returns exact reasons such as:

- `missing_model_credential`
- `configured_but_live_call_not_proven`
- `invalid_model_credential`
- `test_only_model_credential`
- `model_provider_rate_limited`
- `model_provider_quota_exhausted`
- `model_provider_external_outage`

The public/user-facing unavailable message remains provider-neutral and does not reveal secrets.

## Current Audit Result

`npm run owner-review:assistant-runtime` reported `openai:missing` and `kimi:missing` in this local environment. Model calls were therefore `BLOCKED` with exact missing-credential reasons, not faked as live.

## Test Evidence

Covered by `tests/assistant-model-readiness.test.js`:

- all credential states classify distinctly
- placeholder/test-only values are not treated as live
- raw key/error text is not exposed
- matrix includes exact disabled reasons and a provider-neutral user-safe message
