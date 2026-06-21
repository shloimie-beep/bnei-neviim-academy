# Watchdog Security Route Audit

Generated at 2026-06-18T05:39:31.238Z.

This watchdog is local-safe and read-only except for writing this report.

## Summary

- Severity: critical
- Findings: 3
- Registered routes: 1

## Findings

- **CRITICAL** Private route /operations is marked public_allowed: Private routes must not be public_allowed.
  Goals: GOAL-CORE-006
  Evidence: /operations
  Fix: Set public_allowed false and document login/wrong-scope behavior.
- **HIGH** Private route /operations lacks safe logged-out behavior: Private route rows must say how anonymous users are rejected or shown a private-data-free shell.
  Goals: GOAL-CORE-006
  Evidence: /operations | load dashboard
  Fix: Document redirect/login/rejection behavior and verify it in smoke tests.
- **MEDIUM** Critical privacy route /operations is not linked to GOAL-CORE-006: Critical privacy routes must link to the no-privacy-leaks standing goal.
  Goals: GOAL-CORE-006
  Evidence: /operations
  Fix: Add GOAL-CORE-006 to related_goal_ids.
