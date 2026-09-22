# Provider Assistant Onboarding

Requirement: `REQ-20260623-017`, final QA `REQ-20260623-026`

Provider onboarding uses the universal assistant control plane plus Service
Provider Studio. Telegram and the website assistant are intake/editing
adapters; they do not own a separate onboarding forum, page builder, action
registry, or publish path.

## Supported Flow

1. A provider starts from Telegram or the website assistant.
2. The shared onboarding session records identity, workspace, role, channel,
   stage, assets, and continuation state.
3. Uploaded logos, photos, videos, PDFs, and forwarded messages use the shared
   file/media intake contract.
4. Service Provider Studio creates the profile, listing, website, brand,
   course/community, and communication draft package.
5. Drafts use the shared draft/version/preview model.
6. Launch remains gated by operator approval, integration readiness, and live
   smoke checks.

## Scope

- One Time/Rabbi provider work is scoped to
  `rabbi_sheller_provider / one_time_mishnah_class`.
- Provider assistants cannot see BNA private/admin data.
- Parent and student assistants cannot perform provider-owner actions.
- Publish, external sends, payment, DNS, OAuth, and connector writes remain
  approval/credential gated.

## Verification

- `tests/assistant-provider-onboarding-studio-contract.test.js`
- `tests/assistant-file-media-intake-contract.test.js`
- `tests/universal-control-plane-scope-policy.test.js`
- Final QA packet:
  `.runtime/telegram-audit/CHATGPT-RETURN-PACKET.md`
