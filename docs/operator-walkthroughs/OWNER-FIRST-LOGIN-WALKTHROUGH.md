# Owner First Login Walkthrough

Purpose: give Shloimie one safe place to start setup without pasting secrets
into chat, docs, screenshots, or task titles.

1. Open `/integration-setup.html`.
2. Confirm the page shows either "Authenticated readiness loaded" or the safe
   static checklist state.
3. Open Operations from the setup center.
4. Sign in to Operations with the platform admin account.
5. Open `Admin -> Operator Setup` for the secure keyholder/bootstrap workflow.
6. Keep secret values in `C:\Users\User\BNA-Keyholder`, local `.secrets`, or
   Railway Variables only.
7. Return to `/integration-setup.html`.
8. Filter by `Missing credential`.
9. For each integration, copy only the variable name, not the value.
10. Open the provider dashboard link from the card.
11. Create or locate the provider credential.
12. Store the credential in the approved secret store.
13. Run the validation command shown on the card.
14. Record the result as evidence with timestamp and status.
15. Do not mark any integration `Live` until deploy/live smoke proof exists.

Success means the owner can see every integration, exact next action, exact
page link, exact variable names, and exact validation command without exposing
a secret.
