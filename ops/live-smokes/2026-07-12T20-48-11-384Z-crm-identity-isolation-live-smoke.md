# CRM Identity Isolation Live Smoke - 2026-07-12T20:48:11.384Z

Result: passed
Mode: transaction_rollback_live_database_proof
Persistent write performed: false

## Proof
- Workspace A: bna
- Workspace B: rabbi_sheller_provider
- Same email coexistence: true
- Same phone coexistence: true
- Workspace-filtered email rows: 1/1
- Workspace-filtered phone rows: 1/1
- Same-workspace duplicate blocked: true
- Rollback cleanup count: 0

Guardrail: synthetic data was inserted only inside a transaction and rolled back before exit.
