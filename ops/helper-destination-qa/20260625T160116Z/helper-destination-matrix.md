# Helper Destination Watchdog

Generated: 2026-06-25T16:01:16.905Z

| Case | Result | Decision | Path/Fallback | Route key | Action | Reason |
|---|---|---|---|---|---|---|
| owner_operations_tasks | PASS | allowed | /operations?view=tasks&section=decisions&workspace=bna | operations | ACTION-HELPER-OPEN-OPERATIONS-VIEW | registry_resolved |
| owner_calendar_week | PASS | allowed | /operations?view=tasks&section=schedule&workspace=bna&calendar_mode=week | operations | ACTION-HELPER-OPEN-OPERATIONS-VIEW | registry_resolved |
| parent_portal_self | PASS | allowed | /parent | parent_portal |  | registry_resolved |
| student_portal_self | PASS | allowed | /student | student_portal |  | registry_resolved |
| provider_workspace_self | PASS | allowed | /provider | provider_portal |  | registry_resolved |
| public_provider_index | PASS | allowed | /service-providers | public_provider_index |  | registry_resolved |
| parent_cannot_open_operations | PASS | blocked | /parent | operations | ACTION-HELPER-OPEN-OPERATIONS-VIEW | role_not_allowed |
| provider_cannot_cross_to_bna_operations | PASS | blocked | /provider | operations | ACTION-HELPER-OPEN-OPERATIONS-VIEW | role_not_allowed,workspace_scope_mismatch |
| missing_route_rejected | PASS | blocked | /operations-login.html |  |  | route_not_registered |
| external_url_rejected | PASS | blocked | /operations-login.html |  |  | non_same_origin_or_invalid_route,route_not_registered |

Summary: 10/10 cases passed.
