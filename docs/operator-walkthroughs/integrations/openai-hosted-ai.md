# OpenAI / Hosted AI Walkthrough

Purpose: default hosted AI path for Assistant replies, summaries, content
drafting, research-style helper tasks, and diagnostics.

1. Open `/integration-setup.html#openai-hosted-ai`.
2. Open https://platform.openai.com/api-keys.
3. Select the intended project before creating a key.
4. Create or rotate the API key.
5. Store the value only in `C:\Users\User\BNA-Keyholder`, `.secrets`, or
   Railway Variables.
6. Use these variable names only:
   - `OPENAI_API_KEY`
   - `OPENAI_BASE_URL`
   - `OPENAI_MODEL`
   - `OPENAI_RESEARCH_MODEL`
   - `OPENAI_TRANSCRIPTION_MODEL`
   - `OPENAI_PROJECT`
   - `OPENAI_ORG`
7. Run `npm run openai:diagnose`.
8. Expected success: real provider status or a real model response is recorded
   without printing the key.
9. Expected failure: exact invalid key, quota, rate limit, project, or network
   error is recorded.
10. Do not accept fake helper replies as proof.
11. Record API usage evidence from the provider dashboard or diagnostic output.
12. Live acceptance requires a real response, no secret exposure, and visible
   failure behavior for quota/rate errors.

Future provider-bot scope: provider-specific bots may use OpenAI later, but
each provider workspace must have its own scoping and approval evidence.
