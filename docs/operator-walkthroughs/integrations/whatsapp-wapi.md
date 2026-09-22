# WhatsApp / WAPI / Whapi Walkthrough

Purpose: WhatsApp history sync, phonebook grouping, CRM correction previews,
and gated sends.

1. Open `/integration-setup.html#whatsapp-wapi`.
2. Open https://whapi.cloud/docs.
3. Confirm the linked WhatsApp number/channel.
4. Use these variable names:
   - `WAPI_API_TOKEN`
   - `WHAPI_API_TOKEN`
   - `WAPI_WEBHOOK_SECRET`
   - `WAPI_API_BASE_URL`
   - `WHAPI_API_BASE_URL`
   - `BNA_WHATSAPP_NUMBER`
   - `BNA_RABBI_SHLOIMIE_WHATSAPP_NUMBER`
5. Store token values only in approved secret storage.
6. Run `node --test tests/wapi-phonebook-report.test.js tests/whapi-log-sync-contract.test.js`.
7. Expected success: read-only local grouping/sync contracts pass.
8. External effects: provider history sync can read messages when a real token
   is used. Sends require exact `SEND_WHATSAPP` approval.
9. Live acceptance requires linked number proof, read-only sync evidence,
   send gate proof, and communication log evidence.
