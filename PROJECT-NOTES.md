# BNA v2.0 Notes

This workspace was bootstrapped from `family-accountability` so we could reuse
the existing Supabase-backed app structure without rebuilding the plumbing from
scratch.

Current state:

- The copied `.env.local` still points at the working family-system Supabase
  project, which is now acting as the starting database for this workspace.
- Free-text bot chat no longer depends on Anthropic. It now tries the Kimi
  Open Platform first through its OpenAI-compatible endpoint and falls back to
  OpenAI if Kimi is unavailable or errors.
- The app's business logic and copy are still family-oriented. The next phase
  is to reshape the schema, labels, pages, and workflows for the new school or
  business use case.
