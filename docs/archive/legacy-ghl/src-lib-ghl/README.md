# GHL TypeScript Helper Notes

These TypeScript helpers are preserved as BNA-specific implementation patterns.
They are not imported by the live Express runtime today.

Current live GHL behavior is implemented in `server.js` and the operational
scripts under `scripts/`, especially `scripts/ghl-ops.mjs` and
`scripts/sync-signups-to-ghl.mjs`.

Before using these helpers in live code, audit them against the current Railway
environment, current LeadConnector API behavior, and the BNA Postgres schema.
