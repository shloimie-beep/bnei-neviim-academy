# Merge Order

All workers start from checkpoint commit
`b2fd5039990ee1cb370a49d4475a7763fb8548b7`.

## Order

1. W1 - Core platform backend and data
2. W3 - Ramble queue, parser, agent loop, content prompt
3. W4 - One Time partner instance and integrations
4. W2 - SaaS UI and product experience
5. Prompt 05 - final shared-file integration and verification

## Pre-Merge Requirements

Each worker must provide:

- clean `git status --short` in its worktree after committing local work
- worker status file updated outside Git
- tests for its owned surface
- `INTEGRATION.md` with any shared-file needs
- no edits to the shared-file deny list
- no production deploy, DNS, DB, OAuth, Vimeo, Zoom, Resend, or credential mutation

Prompt 05 must run the final combined validation suite after merging workers.
