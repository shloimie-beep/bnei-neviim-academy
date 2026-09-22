# One Time Task And Decision Production Census

Generated: 2026-06-24T17:29:00.889Z
Source: database:bna_tasks
Read only: yes
Tasks seen: 1000

## Lane Counts

- decisions: 19
- tasks: 620
- codex_queue: 17
- pending: 14
- calendar: 17
- done_activity: 313

## Audit Dimensions

- workspace
- project
- source
- owner
- status
- requirement
- agent run
- contact
- student
- provider
- duplicate fingerprint
- age
- last activity

## Default Task Views

| View | Description |
| --- | --- |
| My Tasks | Open work owned by Shloimie/operator roles. |
| One Time Tasks | Open One Time Mishnah Class work only. |
| Codex / Agent Work | Machine work and observable agent jobs. |
| Blocked | Open work blocked by a human or external account/system. |
| Due Soon | Open work due within seven days. |
| Calendar | Open work with a planned or due date. |
| Done / Activity | Closed work and recent task activity. |
| Archived | Reversible archive, duplicate, or hidden records. |

## Default Decision Views

| View | Description |
| --- | --- |
| Needs My Decision | Open Decisions owned by Shloimie/operator roles. |
| Needs Rabbi Scheller | Open Decisions owned by Rabbi Ellie Scheller or provider staff. |
| Needs External Owner | Open Decisions blocked by an outside account, credential, legal, billing, DNS, or platform owner. |
| Decided | Decisions with a selected outcome or terminal lifecycle status. |
| Superseded | Duplicate, stale, or replaced Decision records. |
| Archived | Hidden or archived Decision records. |

## Card Contract

- concise title
- owner
- workspace
- project
- priority
- status
- next action
- blocker
- source
- due date
- latest meaningful activity
- direct action

## Warnings

- BNA_APP_URL/OPS_USERNAME/OPS_PASSWORD unavailable for live API read.

## Default View Rules

- My Tasks: open work assigned to or waiting on Shloimie/operator roles.
- One Time Tasks: open rabbi_sheller_provider / one_time_mishnah_class records only.
- Codex / Agent Work: Codex/agent/system work and agent_job rows, including queued/running/failed machine states.
- Blocked: human or external blockers only, with blocker owner and next action.
- Due Soon: open work due within seven days.
- Calendar: open work with due_date or planned_at.
- Done / Activity: done/archive/history rows with proof or verification notes.
- Archived: archived, hidden, or duplicate-archived rows excluded from default active views.

## Duplicate Groups

| Group fingerprint | Lane | Workspace | Project | Count | Task IDs | Source fingerprints | Dry-run action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| b50872bb02afa9f1 | codex_queue | unknown | bna | 2 | 1578, 1577 | 4ec548556fb97b45 | archive_or_link_duplicates_after_operator_review |
| 1bdd7796d27e8103 | codex_queue | unknown | bna | 2 | 1576, 1575 | 574069bd211d9725 | archive_or_link_duplicates_after_operator_review |
| 718740ed838deea6 | tasks | unknown | bna | 13 | 1571, 1486, 1469, 1458, 1449, 1435, 1140, 1135, 1129, 1058, 1044, 1025, 1001 | cde53112c1bf95a9 | archive_or_link_duplicates_after_operator_review |
| 192dc5034b5b8f8a | tasks | unknown | bna | 4 | 1501, 1502, 1504, 1503 | b5cbfac5ac12d794 | archive_or_link_duplicates_after_operator_review |
| a9f2a7199075cb92 | tasks | unknown | bna | 2 | 1491, 1492 | da57b5eabc84d03a | archive_or_link_duplicates_after_operator_review |
| 279e9bc14049f856 | tasks | unknown | bna | 6 | 1478, 1482, 1480, 1479, 1481, 1477 | 8dbdb13eafc92a2e | archive_or_link_duplicates_after_operator_review |
| 8bacf0e8b2bd954a | codex_queue | unknown | bna | 7 | 1470, 1459, 1450, 1436, 1141, 1136, 1130 | d36ca881225ccb20 | archive_or_link_duplicates_after_operator_review |
| 3b250cb4fe55548b | tasks | unknown | bna | 2 | 1462, 1463 | a84697c07c9ff059 | archive_or_link_duplicates_after_operator_review |
| 0c1812c8ee846b21 | tasks | unknown | bna | 2 | 1461, 1460 | 6528b9548aaef316 | archive_or_link_duplicates_after_operator_review |
| db821ad519bbed5c | tasks | unknown | bna | 2 | 1454, 1134 | 756995793a8049b8 | archive_or_link_duplicates_after_operator_review |
| 540b05eee2146074 | tasks | unknown | bna | 2 | 1452, 1132 | a98388125b203eaa | archive_or_link_duplicates_after_operator_review |
| 54c33e529738b0d1 | tasks | unknown | bna | 15 | 1160, 1159, 1158, 1149, 1154, 1163, 1161, 1153, 1157, 1156, 1151, 1164, 1152, 1155, 1162 | 13db71217143751a | archive_or_link_duplicates_after_operator_review |
| 629d0f50054615bf | tasks | unknown | bna | 4 | 1028, 1029, 1027, 1026 | dc58447febd3bb2a | archive_or_link_duplicates_after_operator_review |
| 4eb6f92420ab0636 | tasks | unknown | bna | 2 | 1005, 1003 | 165862bbd72a8aa4 | archive_or_link_duplicates_after_operator_review |
| 0b98080c15891cc9 | tasks | unknown | bna | 2 | 965, 973 | 24fcf41d937ffb3d | archive_or_link_duplicates_after_operator_review |
| c1f0fc6d9a5ad900 | tasks | unknown | bna | 2 | 966, 926 | ae75cda8e15463a4 | archive_or_link_duplicates_after_operator_review |
| 4dfdfff2302f5d86 | tasks | unknown | bna | 2 | 975, 935 | 55df4f32d9521477 | archive_or_link_duplicates_after_operator_review |
| 08d7ac6ab30ccb15 | tasks | unknown | bna | 2 | 919, 905 | cde53112c1bf95a9 | archive_or_link_duplicates_after_operator_review |
| 131271023bb9acd2 | tasks | unknown | bna | 2 | 933, 925 | 24fcf41d937ffb3d | archive_or_link_duplicates_after_operator_review |
| 371e99fa20a92d15 | tasks | unknown | bna | 2 | 920, 906 | d8c03aa1375ca26e | archive_or_link_duplicates_after_operator_review |
| 9c382468536e8a76 | tasks | unknown | bna | 2 | 903, 902 | 4146d6404991a1ec | archive_or_link_duplicates_after_operator_review |

## Violations

| Type | Severity | Task ID | Lane | Workspace | Recommendation |
| --- | --- | --- | --- | --- | --- |
| unscoped_record | high | 1606 | tasks | unknown | Attach the task to exactly one workspace/project or quarantine it from default views. |
| orphaned_record | medium | 1606 | tasks | unknown | Attach a project, archive as provenance, or link to the canonical requirement. |
| unscoped_record | high | 1603 | tasks | unknown | Attach the task to exactly one workspace/project or quarantine it from default views. |
| orphaned_record | medium | 1603 | tasks | unknown | Attach a project, archive as provenance, or link to the canonical requirement. |
| one_time_record_in_bna | high | 1292 | decisions | unknown | Re-scope the One Time record to rabbi_sheller_provider / one_time_mishnah_class. |
| visible_title_not_distilled | medium | 1598 | pending | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| internal_brief_visible_as_task | high | 610 | done_activity | unknown | Keep internal handoff files as Codex evidence, not visible operator Tasks. |
| visible_title_not_distilled | medium | 343 | calendar | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| visible_title_not_distilled | medium | 342 | done_activity | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| internal_brief_visible_as_task | high | 280 | done_activity | unknown | Keep internal handoff files as Codex evidence, not visible operator Tasks. |
| visible_title_not_distilled | medium | 276 | done_activity | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| internal_brief_visible_as_task | high | 110 | done_activity | unknown | Keep internal handoff files as Codex evidence, not visible operator Tasks. |
| visible_title_not_distilled | medium | 1595 | tasks | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| raw_prompt_title_visible | medium | 1595 | tasks | unknown | Distill the visible title and keep raw wording only as provenance. |
| no_owner_record | medium | 1582 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1580 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1585 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1574 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1579 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1581 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1583 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1584 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1572 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1571 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1573 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1586 | tasks | unknown | Assign an owner or move the item out of default active views. |
| raw_prompt_title_visible | medium | 1549 | tasks | unknown | Distill the visible title and keep raw wording only as provenance. |
| raw_prompt_title_visible | medium | 1512 | tasks | unknown | Distill the visible title and keep raw wording only as provenance. |
| raw_prompt_title_visible | medium | 1508 | tasks | unknown | Distill the visible title and keep raw wording only as provenance. |
| no_owner_record | medium | 1499 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1493 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1498 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1486 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1501 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1491 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1502 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1506 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1495 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1504 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1505 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1489 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1488 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1503 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1496 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1500 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1492 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1497 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1490 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1487 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1478 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1474 | tasks | unknown | Assign an owner or move the item out of default active views. |
| visible_title_not_distilled | medium | 1472 | tasks | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| no_owner_record | medium | 1472 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1475 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1482 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1480 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1479 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1481 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1477 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1469 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1471 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1473 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1476 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1468 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1467 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1458 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1462 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1461 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1463 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1460 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1465 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1466 | tasks | unknown | Assign an owner or move the item out of default active views. |
| visible_title_not_distilled | medium | 1456 | tasks | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| no_owner_record | medium | 1454 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1451 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1449 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1452 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1453 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1443 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1435 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1437 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1442 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1439 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1446 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1440 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1448 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1447 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1444 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1445 | tasks | unknown | Assign an owner or move the item out of default active views. |
| one_time_record_in_bna | high | 1445 | tasks | unknown | Re-scope the One Time record to rabbi_sheller_provider / one_time_mishnah_class. |
| one_time_record_in_bna | high | 1438 | tasks | unknown | Re-scope the One Time record to rabbi_sheller_provider / one_time_mishnah_class. |
| no_owner_record | medium | 1390 | tasks | unknown | Assign an owner or move the item out of default active views. |
| visible_title_not_distilled | medium | 1372 | tasks | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| raw_prompt_title_visible | medium | 1372 | tasks | unknown | Distill the visible title and keep raw wording only as provenance. |
| visible_title_not_distilled | medium | 1371 | tasks | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| raw_prompt_title_visible | medium | 1371 | tasks | unknown | Distill the visible title and keep raw wording only as provenance. |
| visible_title_not_distilled | medium | 1169 | done_activity | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| visible_title_not_distilled | medium | 1308 | tasks | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| raw_prompt_title_visible | medium | 1308 | tasks | unknown | Distill the visible title and keep raw wording only as provenance. |
| visible_title_not_distilled | medium | 1305 | tasks | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| raw_prompt_title_visible | medium | 1305 | tasks | unknown | Distill the visible title and keep raw wording only as provenance. |
| no_owner_record | medium | 1250 | tasks | unknown | Assign an owner or move the item out of default active views. |
| visible_title_not_distilled | medium | 1209 | tasks | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| raw_prompt_title_visible | medium | 1209 | tasks | unknown | Distill the visible title and keep raw wording only as provenance. |
| visible_title_not_distilled | medium | 1185 | tasks | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| no_owner_record | medium | 1160 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1159 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1150 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1158 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1146 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1149 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1154 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1145 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1147 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1163 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1144 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1161 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1148 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1153 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1157 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1143 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1140 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1156 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1151 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1164 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1152 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1155 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1162 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1139 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1137 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1138 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1135 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1132 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1129 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1133 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1134 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1131 | tasks | unknown | Assign an owner or move the item out of default active views. |
| visible_title_not_distilled | medium | 1077 | tasks | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| no_owner_record | medium | 1073 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1067 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1071 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1062 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1065 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1070 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1066 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1063 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1059 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1064 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1069 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1072 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1068 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1060 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1058 | tasks | unknown | Assign an owner or move the item out of default active views. |
| visible_title_not_distilled | medium | 1054 | tasks | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| no_owner_record | medium | 1054 | tasks | unknown | Assign an owner or move the item out of default active views. |
| raw_prompt_title_visible | medium | 1054 | tasks | unknown | Distill the visible title and keep raw wording only as provenance. |
| no_owner_record | medium | 1056 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1053 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1057 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1049 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1055 | tasks | unknown | Assign an owner or move the item out of default active views. |
| visible_title_not_distilled | medium | 1047 | tasks | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| no_owner_record | medium | 1047 | tasks | unknown | Assign an owner or move the item out of default active views. |
| raw_prompt_title_visible | medium | 1047 | tasks | unknown | Distill the visible title and keep raw wording only as provenance. |
| no_owner_record | medium | 1046 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1044 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1045 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1050 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1051 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1048 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1052 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1036 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1028 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1038 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1040 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1034 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1032 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1041 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1033 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1042 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1037 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1031 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1035 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1029 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1027 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1039 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1043 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1030 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1026 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1025 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1012 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1021 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1009 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1014 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1018 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1019 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1008 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1001 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1017 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1023 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1011 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1013 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1005 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1007 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1016 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1022 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1015 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1010 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1002 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1003 | tasks | unknown | Assign an owner or move the item out of default active views. |
| visible_title_not_distilled | medium | 983 | done_activity | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| no_owner_record | medium | 965 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 966 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 963 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 982 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 978 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 994 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 970 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 979 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 995 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 1000 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 989 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 987 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 997 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 976 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 962 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 969 | tasks | unknown | Assign an owner or move the item out of default active views. |
| visible_title_not_distilled | medium | 990 | tasks | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| no_owner_record | medium | 990 | tasks | unknown | Assign an owner or move the item out of default active views. |
| raw_prompt_title_visible | medium | 990 | tasks | unknown | Distill the visible title and keep raw wording only as provenance. |
| no_owner_record | medium | 971 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 964 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 975 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 968 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 999 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 973 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 977 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 974 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 993 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 981 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 992 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 980 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 996 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 998 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 972 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 988 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 991 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 919 | tasks | unknown | Assign an owner or move the item out of default active views. |
| visible_title_not_distilled | medium | 943 | tasks | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| no_owner_record | medium | 959 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 923 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 954 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 955 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 924 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 935 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 958 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 951 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 941 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 953 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 942 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 957 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 929 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 952 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 949 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 948 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 960 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 926 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 936 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 931 | tasks | unknown | Assign an owner or move the item out of default active views. |
| visible_title_not_distilled | medium | 950 | tasks | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| no_owner_record | medium | 950 | tasks | unknown | Assign an owner or move the item out of default active views. |
| raw_prompt_title_visible | medium | 950 | tasks | unknown | Distill the visible title and keep raw wording only as provenance. |
| no_owner_record | medium | 937 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 933 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 932 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 920 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 925 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 956 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 939 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 917 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 906 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 907 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 918 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 916 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 909 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 914 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 915 | tasks | unknown | Assign an owner or move the item out of default active views. |
| visible_title_not_distilled | medium | 908 | tasks | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| no_owner_record | medium | 908 | tasks | unknown | Assign an owner or move the item out of default active views. |
| raw_prompt_title_visible | medium | 908 | tasks | unknown | Distill the visible title and keep raw wording only as provenance. |
| no_owner_record | medium | 910 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 905 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 887 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 903 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 881 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 900 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 886 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 899 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 895 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 878 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 877 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 884 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 879 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 897 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 898 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 890 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 902 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 882 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 885 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 891 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 888 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 883 | tasks | unknown | Assign an owner or move the item out of default active views. |
| no_owner_record | medium | 889 | tasks | unknown | Assign an owner or move the item out of default active views. |
| visible_title_not_distilled | medium | 511 | done_activity | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| raw_prompt_title_visible | medium | 511 | done_activity | unknown | Distill the visible title and keep raw wording only as provenance. |
| visible_title_not_distilled | medium | 581 | done_activity | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| visible_title_not_distilled | medium | 640 | done_activity | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| visible_title_not_distilled | medium | 509 | tasks | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| no_owner_record | medium | 509 | tasks | unknown | Assign an owner or move the item out of default active views. |
| visible_title_not_distilled | medium | 483 | done_activity | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| visible_title_not_distilled | medium | 482 | done_activity | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| visible_title_not_distilled | medium | 470 | tasks | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| no_owner_record | medium | 470 | tasks | unknown | Assign an owner or move the item out of default active views. |
| visible_title_not_distilled | medium | 465 | tasks | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| no_owner_record | medium | 465 | tasks | unknown | Assign an owner or move the item out of default active views. |
| visible_title_not_distilled | medium | 206 | done_activity | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| visible_title_not_distilled | medium | 379 | done_activity | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| visible_title_not_distilled | medium | 376 | done_activity | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| internal_brief_visible_as_task | high | 311 | done_activity | unknown | Keep internal handoff files as Codex evidence, not visible operator Tasks. |
| visible_title_not_distilled | medium | 294 | done_activity | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| visible_title_not_distilled | medium | 285 | done_activity | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| raw_prompt_title_visible | medium | 285 | done_activity | unknown | Distill the visible title and keep raw wording only as provenance. |
| internal_brief_visible_as_task | high | 260 | done_activity | unknown | Keep internal handoff files as Codex evidence, not visible operator Tasks. |
| visible_title_not_distilled | medium | 262 | done_activity | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| internal_brief_visible_as_task | high | 220 | done_activity | unknown | Keep internal handoff files as Codex evidence, not visible operator Tasks. |
| visible_title_not_distilled | medium | 205 | done_activity | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| visible_title_not_distilled | medium | 195 | done_activity | unknown | Rewrite visible title as a concise action while preserving raw wording as provenance. |
| repeated_parser_fan_out | high | 1571 | tasks | unknown | Collapse repeated parser fan-out into one canonical executable requirement and archive duplicates. |
| repeated_parser_fan_out | high | 1501 | tasks | unknown | Collapse repeated parser fan-out into one canonical executable requirement and archive duplicates. |
| repeated_parser_fan_out | high | 1478 | tasks | unknown | Collapse repeated parser fan-out into one canonical executable requirement and archive duplicates. |
| repeated_parser_fan_out | high | 1470 | codex_queue | unknown | Collapse repeated parser fan-out into one canonical executable requirement and archive duplicates. |
| repeated_parser_fan_out | high | 1160 | tasks | unknown | Collapse repeated parser fan-out into one canonical executable requirement and archive duplicates. |
| repeated_parser_fan_out | high | 1028 | tasks | unknown | Collapse repeated parser fan-out into one canonical executable requirement and archive duplicates. |

## Dry-Run Cleanup Plan

| Action | Reversible | Applies to | Reason | Apply gate |
| --- | --- | --- | --- | --- |
| archive_or_link_duplicates_after_operator_review | yes | 1578, 1577 | Duplicate-like codex_queue group b50872bb02afa9f1 | operator approval required |
| archive_or_link_duplicates_after_operator_review | yes | 1576, 1575 | Duplicate-like codex_queue group 1bdd7796d27e8103 | operator approval required |
| archive_or_link_duplicates_after_operator_review | yes | 1571, 1486, 1469, 1458, 1449, 1435, 1140, 1135, 1129, 1058, 1044, 1025, 1001 | Duplicate-like tasks group 718740ed838deea6 | operator approval required |
| archive_or_link_duplicates_after_operator_review | yes | 1501, 1502, 1504, 1503 | Duplicate-like tasks group 192dc5034b5b8f8a | operator approval required |
| archive_or_link_duplicates_after_operator_review | yes | 1491, 1492 | Duplicate-like tasks group a9f2a7199075cb92 | operator approval required |
| archive_or_link_duplicates_after_operator_review | yes | 1478, 1482, 1480, 1479, 1481, 1477 | Duplicate-like tasks group 279e9bc14049f856 | operator approval required |
| archive_or_link_duplicates_after_operator_review | yes | 1470, 1459, 1450, 1436, 1141, 1136, 1130 | Duplicate-like codex_queue group 8bacf0e8b2bd954a | operator approval required |
| archive_or_link_duplicates_after_operator_review | yes | 1462, 1463 | Duplicate-like tasks group 3b250cb4fe55548b | operator approval required |
| archive_or_link_duplicates_after_operator_review | yes | 1461, 1460 | Duplicate-like tasks group 0c1812c8ee846b21 | operator approval required |
| archive_or_link_duplicates_after_operator_review | yes | 1454, 1134 | Duplicate-like tasks group db821ad519bbed5c | operator approval required |
| archive_or_link_duplicates_after_operator_review | yes | 1452, 1132 | Duplicate-like tasks group 540b05eee2146074 | operator approval required |
| archive_or_link_duplicates_after_operator_review | yes | 1160, 1159, 1158, 1149, 1154, 1163, 1161, 1153, 1157, 1156, 1151, 1164, 1152, 1155, 1162 | Duplicate-like tasks group 54c33e529738b0d1 | operator approval required |
| archive_or_link_duplicates_after_operator_review | yes | 1028, 1029, 1027, 1026 | Duplicate-like tasks group 629d0f50054615bf | operator approval required |
| archive_or_link_duplicates_after_operator_review | yes | 1005, 1003 | Duplicate-like tasks group 4eb6f92420ab0636 | operator approval required |
| archive_or_link_duplicates_after_operator_review | yes | 965, 973 | Duplicate-like tasks group 0b98080c15891cc9 | operator approval required |
| archive_or_link_duplicates_after_operator_review | yes | 966, 926 | Duplicate-like tasks group c1f0fc6d9a5ad900 | operator approval required |
| archive_or_link_duplicates_after_operator_review | yes | 975, 935 | Duplicate-like tasks group 4dfdfff2302f5d86 | operator approval required |
| archive_or_link_duplicates_after_operator_review | yes | 919, 905 | Duplicate-like tasks group 08d7ac6ab30ccb15 | operator approval required |
| archive_or_link_duplicates_after_operator_review | yes | 933, 925 | Duplicate-like tasks group 131271023bb9acd2 | operator approval required |
| archive_or_link_duplicates_after_operator_review | yes | 920, 906 | Duplicate-like tasks group 371e99fa20a92d15 | operator approval required |
| archive_or_link_duplicates_after_operator_review | yes | 903, 902 | Duplicate-like tasks group 9c382468536e8a76 | operator approval required |
| quarantine_until_workspace_scope_is_set | yes | 1606 | unscoped_record | operator approval required |
| attach_project_or_quarantine | yes | 1606 | orphaned_record | operator approval required |
| quarantine_until_workspace_scope_is_set | yes | 1603 | unscoped_record | operator approval required |
| attach_project_or_quarantine | yes | 1603 | orphaned_record | operator approval required |
| reclassify_one_time_record_into_one_time_scope | yes | 1292 | one_time_record_in_bna | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 1598 | visible_title_not_distilled | operator approval required |
| quarantine_internal_brief_card | yes | 610 | internal_brief_visible_as_task | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 343 | visible_title_not_distilled | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 342 | visible_title_not_distilled | operator approval required |
| quarantine_internal_brief_card | yes | 280 | internal_brief_visible_as_task | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 276 | visible_title_not_distilled | operator approval required |
| quarantine_internal_brief_card | yes | 110 | internal_brief_visible_as_task | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 1595 | visible_title_not_distilled | operator approval required |
| distill_title_preserve_raw_provenance | yes | 1595 | raw_prompt_title_visible | operator approval required |
| assign_owner_or_archive | yes | 1582 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1580 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1585 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1574 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1579 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1581 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1583 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1584 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1572 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1571 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1573 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1586 | no_owner_record | operator approval required |
| distill_title_preserve_raw_provenance | yes | 1549 | raw_prompt_title_visible | operator approval required |
| distill_title_preserve_raw_provenance | yes | 1512 | raw_prompt_title_visible | operator approval required |
| distill_title_preserve_raw_provenance | yes | 1508 | raw_prompt_title_visible | operator approval required |
| assign_owner_or_archive | yes | 1499 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1493 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1498 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1486 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1501 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1491 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1502 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1506 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1495 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1504 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1505 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1489 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1488 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1503 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1496 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1500 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1492 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1497 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1490 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1487 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1478 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1474 | no_owner_record | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 1472 | visible_title_not_distilled | operator approval required |
| assign_owner_or_archive | yes | 1472 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1475 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1482 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1480 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1479 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1481 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1477 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1469 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1471 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1473 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1476 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1468 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1467 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1458 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1462 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1461 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1463 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1460 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1465 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1466 | no_owner_record | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 1456 | visible_title_not_distilled | operator approval required |
| assign_owner_or_archive | yes | 1454 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1451 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1449 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1452 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1453 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1443 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1435 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1437 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1442 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1439 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1446 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1440 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1448 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1447 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1444 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1445 | no_owner_record | operator approval required |
| reclassify_one_time_record_into_one_time_scope | yes | 1445 | one_time_record_in_bna | operator approval required |
| reclassify_one_time_record_into_one_time_scope | yes | 1438 | one_time_record_in_bna | operator approval required |
| assign_owner_or_archive | yes | 1390 | no_owner_record | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 1372 | visible_title_not_distilled | operator approval required |
| distill_title_preserve_raw_provenance | yes | 1372 | raw_prompt_title_visible | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 1371 | visible_title_not_distilled | operator approval required |
| distill_title_preserve_raw_provenance | yes | 1371 | raw_prompt_title_visible | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 1169 | visible_title_not_distilled | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 1308 | visible_title_not_distilled | operator approval required |
| distill_title_preserve_raw_provenance | yes | 1308 | raw_prompt_title_visible | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 1305 | visible_title_not_distilled | operator approval required |
| distill_title_preserve_raw_provenance | yes | 1305 | raw_prompt_title_visible | operator approval required |
| assign_owner_or_archive | yes | 1250 | no_owner_record | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 1209 | visible_title_not_distilled | operator approval required |
| distill_title_preserve_raw_provenance | yes | 1209 | raw_prompt_title_visible | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 1185 | visible_title_not_distilled | operator approval required |
| assign_owner_or_archive | yes | 1160 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1159 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1150 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1158 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1146 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1149 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1154 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1145 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1147 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1163 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1144 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1161 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1148 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1153 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1157 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1143 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1140 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1156 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1151 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1164 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1152 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1155 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1162 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1139 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1137 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1138 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1135 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1132 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1129 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1133 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1134 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1131 | no_owner_record | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 1077 | visible_title_not_distilled | operator approval required |
| assign_owner_or_archive | yes | 1073 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1067 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1071 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1062 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1065 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1070 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1066 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1063 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1059 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1064 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1069 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1072 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1068 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1060 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1058 | no_owner_record | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 1054 | visible_title_not_distilled | operator approval required |
| assign_owner_or_archive | yes | 1054 | no_owner_record | operator approval required |
| distill_title_preserve_raw_provenance | yes | 1054 | raw_prompt_title_visible | operator approval required |
| assign_owner_or_archive | yes | 1056 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1053 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1057 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1049 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1055 | no_owner_record | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 1047 | visible_title_not_distilled | operator approval required |
| assign_owner_or_archive | yes | 1047 | no_owner_record | operator approval required |
| distill_title_preserve_raw_provenance | yes | 1047 | raw_prompt_title_visible | operator approval required |
| assign_owner_or_archive | yes | 1046 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1044 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1045 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1050 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1051 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1048 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1052 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1036 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1028 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1038 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1040 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1034 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1032 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1041 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1033 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1042 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1037 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1031 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1035 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1029 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1027 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1039 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1043 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1030 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1026 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1025 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1012 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1021 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1009 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1014 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1018 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1019 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1008 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1001 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1017 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1023 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1011 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1013 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1005 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1007 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1016 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1022 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1015 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1010 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1002 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1003 | no_owner_record | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 983 | visible_title_not_distilled | operator approval required |
| assign_owner_or_archive | yes | 965 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 966 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 963 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 982 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 978 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 994 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 970 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 979 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 995 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 1000 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 989 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 987 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 997 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 976 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 962 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 969 | no_owner_record | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 990 | visible_title_not_distilled | operator approval required |
| assign_owner_or_archive | yes | 990 | no_owner_record | operator approval required |
| distill_title_preserve_raw_provenance | yes | 990 | raw_prompt_title_visible | operator approval required |
| assign_owner_or_archive | yes | 971 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 964 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 975 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 968 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 999 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 973 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 977 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 974 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 993 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 981 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 992 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 980 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 996 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 998 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 972 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 988 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 991 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 919 | no_owner_record | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 943 | visible_title_not_distilled | operator approval required |
| assign_owner_or_archive | yes | 959 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 923 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 954 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 955 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 924 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 935 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 958 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 951 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 941 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 953 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 942 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 957 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 929 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 952 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 949 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 948 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 960 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 926 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 936 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 931 | no_owner_record | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 950 | visible_title_not_distilled | operator approval required |
| assign_owner_or_archive | yes | 950 | no_owner_record | operator approval required |
| distill_title_preserve_raw_provenance | yes | 950 | raw_prompt_title_visible | operator approval required |
| assign_owner_or_archive | yes | 937 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 933 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 932 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 920 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 925 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 956 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 939 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 917 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 906 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 907 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 918 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 916 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 909 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 914 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 915 | no_owner_record | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 908 | visible_title_not_distilled | operator approval required |
| assign_owner_or_archive | yes | 908 | no_owner_record | operator approval required |
| distill_title_preserve_raw_provenance | yes | 908 | raw_prompt_title_visible | operator approval required |
| assign_owner_or_archive | yes | 910 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 905 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 887 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 903 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 881 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 900 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 886 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 899 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 895 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 878 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 877 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 884 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 879 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 897 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 898 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 890 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 902 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 882 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 885 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 891 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 888 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 883 | no_owner_record | operator approval required |
| assign_owner_or_archive | yes | 889 | no_owner_record | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 511 | visible_title_not_distilled | operator approval required |
| distill_title_preserve_raw_provenance | yes | 511 | raw_prompt_title_visible | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 581 | visible_title_not_distilled | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 640 | visible_title_not_distilled | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 509 | visible_title_not_distilled | operator approval required |
| assign_owner_or_archive | yes | 509 | no_owner_record | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 483 | visible_title_not_distilled | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 482 | visible_title_not_distilled | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 470 | visible_title_not_distilled | operator approval required |
| assign_owner_or_archive | yes | 470 | no_owner_record | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 465 | visible_title_not_distilled | operator approval required |
| assign_owner_or_archive | yes | 465 | no_owner_record | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 206 | visible_title_not_distilled | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 379 | visible_title_not_distilled | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 376 | visible_title_not_distilled | operator approval required |
| quarantine_internal_brief_card | yes | 311 | internal_brief_visible_as_task | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 294 | visible_title_not_distilled | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 285 | visible_title_not_distilled | operator approval required |
| distill_title_preserve_raw_provenance | yes | 285 | raw_prompt_title_visible | operator approval required |
| quarantine_internal_brief_card | yes | 260 | internal_brief_visible_as_task | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 262 | visible_title_not_distilled | operator approval required |
| quarantine_internal_brief_card | yes | 220 | internal_brief_visible_as_task | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 205 | visible_title_not_distilled | operator approval required |
| rewrite_visible_title_preserve_raw_provenance | yes | 195 | visible_title_not_distilled | operator approval required |
| collapse_parser_fan_out_to_canonical_task | yes | 1571 | repeated_parser_fan_out | operator approval required |
| collapse_parser_fan_out_to_canonical_task | yes | 1501 | repeated_parser_fan_out | operator approval required |
| collapse_parser_fan_out_to_canonical_task | yes | 1478 | repeated_parser_fan_out | operator approval required |
| collapse_parser_fan_out_to_canonical_task | yes | 1470 | repeated_parser_fan_out | operator approval required |
| collapse_parser_fan_out_to_canonical_task | yes | 1160 | repeated_parser_fan_out | operator approval required |
| collapse_parser_fan_out_to_canonical_task | yes | 1028 | repeated_parser_fan_out | operator approval required |

## Before Counts

- tasks seen: 1000
- duplicate groups: 21
- violation types: 8

## After Counts

- dry run only: no production mutation was applied in this census.
- after-count snapshot if applied now: 1000 tasks seen

## Workspace Isolation

- BNA records in One Time: 0
- One Time records in BNA: 3
- Passed: no

## Reversible Apply Workflow

- This report is read-only and does not apply cleanup.
- Before any apply step, export affected task rows and comments.
- Apply one action family at a time: duplicate archive/linking, lane correction, decision owner/prompt repair, proof attachment, then title cleanup.
- Keep internal briefs and raw source wording as evidence/provenance, not visible Pending cards.
- After any approved apply, rerun this census and `npm run bna:run:validate`.

