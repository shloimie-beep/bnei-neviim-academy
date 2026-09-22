# Provider Setup Email / Short Join Local Smoke

Date: 2026-06-14

Target: `http://localhost:8096`

Checks:
- `/providers/join` rendered with heading `Join the BNA provider index`.
- Conversational provider join flow showed `Question 1 of 10`.
- Short-flow copy was present: `I will keep this short`.
- Provider setup email copy was present.
- Old review-first copy was not visible.
- `/provider?setup=bad-token-for-smoke` rendered the setup-password panel.
- Invalid setup token showed `This provider setup link is invalid or expired`.
- Invalid setup token disabled the setup submit button.

No real provider data was submitted.
