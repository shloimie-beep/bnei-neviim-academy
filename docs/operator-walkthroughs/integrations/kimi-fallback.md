# Kimi Fallback Walkthrough

Purpose: fallback hosted chat/content provider when OpenAI is unavailable or
when temporary Kimi-primary mode is explicitly selected.

1. Open `/integration-setup.html#kimi-fallback`.
2. Open https://platform.kimi.ai/console/api-keys.
3. Create or rotate a Kimi API key.
4. Store the value only in the approved secret store.
5. Use these variable names only:
   - `KIMI_API_KEY`
   - `KIMI_BASE_URL`
   - `KIMI_MODEL`
   - `KIMI_CLI_MODEL`
   - `BNA_AI_PRIMARY_PROVIDER`
6. Run `node scripts/kimi-chat.mjs`.
7. Send one small test prompt.
8. Expected success: Kimi returns an actual provider response.
9. Expected failure: auth, rate, quota, or model error is shown exactly.
10. Do not route Codex ownership to Kimi. Kimi is only a hosted model path.
11. Record whether the provider path was OpenAI-primary, Kimi-primary, or
    fallback.
12. Live acceptance requires a real request result and no fake response text.
