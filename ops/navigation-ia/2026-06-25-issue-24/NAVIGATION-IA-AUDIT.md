# Issue #24 Navigation IA Duplicate Watchdog

Generated: 2026-06-25T16:01:06.195Z
Requirement: REQ-20260625-029
Source: RAW-20260625-024

Rule: Side navigation owns major modules. Horizontal tabs may contain only children, view modes, status filters, scoped subcategories, or record-specific sections.

## Inventory

| Surface | Route | Side nav | Horizontal tabs | Mobile menu |
|---|---|---|---|---|
| public | / |  |  | Explore, Admissions, Parents, Service Providers, Portal Login |
| operations | /operations | parsed_from_public_operations_html | parsed_from_public_operations_html | same module list plus child-section drilldown |
| provider | /provider | Dashboard, Program, Members, Content, Schedule, Communications, Tasks, Settings | children of Program, Schedule, Content, Communications, Settings | same major modules as side nav |
| parent | /parent | Today, Goals, Calendar, Questions, Documents, Help | child views and status filters only | same major modules as side nav |
| student | /student | Today, Goals, Assignments, Calendar, Questions, Documents, Help | student-safe child sections only | same major modules as side nav |
| one_time_member | /rabbi-member | Library, Classroom, Questions, Support, Account | library/classroom subcategories only | same major modules as side nav |
| one_time_classroom | /one-time-classroom | Classroom, Library, Questions, Support | class/session/material subcategories only | same major modules as side nav |

## Fixes Implemented

- Operations Tasks child lane label changed from Calendar to Schedule so it no longer repeats the side-nav Calendar module.
- Operations Tasks child lane label changed from Codex / Agent Work to Codex Queue so it no longer competes with the side-nav Agents module.
- Static watchdog added to fail on same-level duplicate labels and major modules repeated as horizontal tabs.

## Findings

- None. Same-level duplicate labels and side/horizontal major-module repeats passed.
