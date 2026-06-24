# Green Invoice Walkthrough

Purpose: alternate or future billing provider path surfaced in accounting and
payment settings.

1. Open `/integration-setup.html#green-invoice`.
2. Open https://www.greeninvoice.co.il/.
3. Decide whether Green Invoice is in scope for One Time billing.
4. If not selected, leave the status as `Owner approval required`.
5. If selected, use these variable names:
   - `RABBI_GREEN_INVOICE_MODE`
   - `RABBI_GREEN_INVOICE_SECRET`
   - `RABBI_GREEN_INVOICE_API_KEY`
   - `GREEN_INVOICE_SECRET`
6. Store values only in approved secret storage.
7. Run `node --test tests/rabbi-scheller-audit-docs.test.js`.
8. Expected success: docs/tests confirm the approval gate.
9. External effects: no provider effect from local tests.
10. Live acceptance requires provider decision, test-mode proof, webhook or
    callback plan, explicit billing approval, and rollback path.
