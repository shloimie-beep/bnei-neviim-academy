# Downloads Prompt Implementation Audit

## Objective

Audit the Markdown implementation prompts in `C:\Users\User\Downloads`, dedupe
repeated prompt exports, compare them against the current BNA repo state, and
continue implementing the remaining gaps without reintroducing legacy GHL or
unrelated client work.

## Current Findings

- Downloads contained 117 Markdown files, 81 unique by content hash.
- 37 unique active BNA/Rabbi/Codex prompt candidates were identified.
- The recent WS01-WS11, Kimi, ChatGPT Pro, and Rabbi/One Time prompt files are
  the active source packet.
- Old WebCraft, GHL, LeadConnector, and other-client prompt files are legacy and
  should not be implemented into current BNA runtime.
- Kimi's two-login/white-label/scoped parsing handoff is already present in
  code and task records.
- WS04 and One Time Classroom are deployed and verified.
- WS01 Operations layout/mobile/readability is now locally closed out and
  verified. The closeout patch lives in `public/css/bna-app-shell.css` and adds
  page overflow guards, light modal/form/detail surfaces, wrapping 40px action
  controls, and one-column mobile task rows.
- WS01 verification on 2026-06-16 passed `node --check server.js`, Operations
  inline script parse, focused WS01/brand/shell tests, full `npm test` 615/615,
  and an in-app Browser smoke over a temporary local HTTP server serving
  `/operations.html`.
- The audit matrix no longer leaves active prompts in vague "mostly/partial"
  buckets. Rows now distinguish implemented active scope from external writes,
  live rollout, human decisions, or later generic BNA reuse.
- On 2026-06-16, Shloimie clarified that the actual source list is the
  WS01-WS11 prompt pack in
  `C:\Users\User\.codex\attachments\7e3bb822-96a8-43ff-b206-aa750f56a73a\pasted-text.txt`.
  The map is saved at
  `ops/download-prompt-audit/2026-06-16-actual-ws-prompt-list-map.md`.
- The resumed actual-list pass found and patched a local UI/helper consistency
  gap: public website/content pages, signup/registration document pages, One
  Time preview, and public provider pages now load the public Helper knowledge
  bundle and widget consistently; public provider pages also use the shared BNA
  main-site nav, and the widget no longer scopes `/providers` or
  `/provider-signup` as a private provider workspace.
- Focused verification for that patch passed 47/47 across assistant, provider,
  signup, communications, and app-select contracts.
- On 2026-06-16, Shloimie explicitly asked for fullclean/debug/deploy/audit.
  The accumulated app bundle was deployed to Railway production service
  `skillful-motivation`; deployment
  `81912f69-e43f-4131-96f1-a6b26bb95166` reached `SUCCESS`.
- Production verification after that deploy passed Railway doctor, main live
  app smoke, public route privacy smoke, student auth policy smoke, assistant
  onboarding intake smoke, signup credit email preview smoke, AI sidekick smoke
  through the configured Kimi fallback provider, and guarded dry-run email
  smoke. Local verification passed full `npm test` 617/617 and diff hygiene
  with line-ending warnings only.
- Most remaining WS specs are locally complete. The blockers are no longer a
  general safe-deploy-window blocker for the accumulated worktree; the remaining
  open items are local `DATABASE_URL` for laptop doctor/smoke, missing live
  credentials/DNS/account setup, specific live data/privacy readbacks, queue
  cleanup decisions, and human product/legal/account/asset decisions.

## Status Artifact

See:

- `ops/download-prompt-audit/2026-06-15-downloads-prompt-status.md`
- `ops/download-prompt-audit/2026-06-16-downloads-file-coverage-index.md`
- `ops/download-prompt-audit/2026-06-16-requirement-evidence-ledger.md`
- `ops/download-prompt-audit/2026-06-16-actual-ws-prompt-list-map.md`

## Next Steps

1. Keep the download prompt audit matrix, file coverage index, requirement
   evidence ledger, and actual WS01-WS11 attachment map as the canonical
   prompt-pile map, and update them when blocked live closeouts move.
2. Use the requirement evidence ledger before starting any new "Downloads prompt"
   implementation turn; only start code if the ledger shows a local-only gap or
   a new top-level prompt file appears in Downloads.
3. When external blockers are cleared, run the remaining targeted closeouts:
   local doctor/smoke with a reachable `DATABASE_URL`, WS11 parent/student live
   privacy readback, secure Operator Setup authenticated live smoke, queue
   reconciliation/duplicate cleanup decisions, and credential/DNS/account
   setup for integrations.
4. Future deployments can use the same Railway path, but still record exactly
   which targeted live readbacks were run instead of treating a broad smoke as
   proof for every specialized workflow.

## Guardrails

- Do not implement old GHL/LeadConnector prompts as active runtime.
- Do not print or commit secrets.
- Do not perform live sends, publishes, billing, access grants, Google writes,
  Zoom writes, Vimeo/video-host writes, or external CRM writes without the
  existing typed approval gates.
- Do not guess SDDraftler or Menachem duplicate decisions without runtime
  evidence.
