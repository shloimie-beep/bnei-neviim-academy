# BNA-SEP-01 Final Report

Status: in progress. Final report will be completed after baseline, implementation, verification, and deployment/canary checkpoint phases.

Base SHA: $remoteSha
Worktree: $worktree
Branch: $branch
"@
 = "path,canonical_or_generated,primary_surface,current_consumers,planned_change,run_owner,collision_risk,coordination_required
"
 = @"
# Collision Hotspots

Initial hotspots before source inspection:

- server.js
- public/operations.html
- public/operations-bootstrap.html
- public/js/operations-shell.js
- public/parent.html
- public/student.html
- ops/route-registry.json
- ops/action-registry.json
- package.json

Detailed ownership will be updated after canonical source and route/API inspection.
