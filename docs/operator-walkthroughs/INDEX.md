# Owner Setup Center

Goal: `BNA OWNER SETUP CENTER - EXACT LINKS, STEPS, STATUS, AND VALIDATION`

Use this folder as the owner-facing setup packet for integrations. It is safe
to read without credentials. It names secret variables but never contains
secret values.

## Open First

1. Open the static setup center: `/integration-setup.html`.
2. If Operations is logged in and the shared endpoint is wired, the page can
   load live readiness from `/api/bna/integration-setup/readiness`.
3. If the endpoint is not wired or the user is logged out, the static checklist
   still renders exact setup steps and validation commands.

## Walkthroughs

1. [Owner first login](OWNER-FIRST-LOGIN-WALKTHROUGH.md)
2. [Rabbi Scheller workspace](RABBI-SCHELLER-WORKSPACE-WALKTHROUGH.md)
3. [Class intake recovery](CLASS-INTAKE-RECOVERY-WALKTHROUGH.md)
4. [Release and rollback](RELEASE-AND-ROLLBACK-WALKTHROUGH.md)
5. [Walkthrough index](WALKTHROUGH-INDEX.md)
6. [Inventory](SETUP-CENTER-INVENTORY.json)
7. [Shared patch](SHARED-PATCH.diff)
8. [Link check](LINK-CHECK.md)

## Integration Walkthroughs

1. [OpenAI / Hosted AI](integrations/openai-hosted-ai.md)
2. [Kimi fallback](integrations/kimi-fallback.md)
3. [Google Drive](integrations/google-drive.md)
4. [Google workspace add-ons](integrations/google-workspace-addons.md)
5. [Railway / database](integrations/railway-database.md)
6. [Stripe](integrations/stripe.md)
7. [Vimeo](integrations/vimeo.md)
8. [Zoom](integrations/zoom.md)
9. [Resend / email](integrations/resend-email.md)
10. [Transcription](integrations/transcription.md)
11. [Telegram academy bot](integrations/telegram-academy-bot.md)
12. [Telegram Rabbi worker](integrations/telegram-rabbi-worker.md)
13. [GitHub Actions / workflow scope](integrations/github-actions.md)
14. [Buffer social scheduler](integrations/buffer-social.md)
15. [WhatsApp / WAPI / Whapi](integrations/whatsapp-wapi.md)
16. [Green Invoice](integrations/green-invoice.md)

## Status Words

The setup center uses these exact statuses:

1. Already configured
2. Available with current keys
3. Mock-tested only
4. Sandbox/test-only
5. Preview-only
6. Missing credential
7. Invalid credential
8. Missing account permission
9. Missing target
10. Owner approval required
11. Ready for live
12. Live

No card should say only "Blocked". Missing state must name the credential,
target, permission, account owner, or approval that is actually missing.
