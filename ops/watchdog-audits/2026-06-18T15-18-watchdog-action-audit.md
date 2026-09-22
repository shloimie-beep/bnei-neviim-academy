# Watchdog Action Audit

Generated at 2026-06-18T15:18:36.508Z.

This watchdog is local-safe and read-only except for writing this report.

## Summary

- Severity: high
- Findings: 1
- Root actions: 1
- Detailed registry rows: 0
- HTML files scanned: 1

## Findings

- **HIGH** Visible action missing_action is not registered: A visible data-action-id/data-watchdog-action/data-helper-action must be present in the action registry.
  Goals: GOAL-CORE-002
  Evidence: ../AppData/Local/Temp/bna-action-audit-U6LEPU/fixture.html -> missing_action
  Fix: Add an action registry row with selector, behavior, handler/tool, scope, and verification.
  Repair: WATCH action issue missing_action: register or disable with reason.
