# Release Readiness Checklist - 2026-06-11

| Item | Status | Notes |
| --- | --- | --- |
| Clean worktree created | Done | `C:\Users\User\bna-release-clean` from `484563b`. |
| Release branch created | Done | `release/operations-parent-student-action-registry-2026-06-11`. |
| Curated patch applied | Done | Patch widened to 62 files after clean validation. |
| Dirty workspace frozen | Done | Raw git status/diff artifacts saved in this release folder. |
| Dirty files classified | Done | 353 status entries, 1957 individual file entries. |
| Full dirty backup patch | Done | `full-dirty-diff.patch` saved before P1 edits. |
| Parent dock overlap fixed | Done | Help/WhatsApp controls now render in-flow. |
| Student dock overlap fixed | Done | Helper control now renders in-flow. |
| Parent screenshots | Done | Desktop, mobile, calendar, detail, help, Hebrew RTL. |
| Student screenshots | Done | Desktop, mobile, calendar, detail, helper, Hebrew RTL. |
| Provider screenshots | Done | Desktop, mobile, schedule, worksheets, questions, payment. |
| Calendar mobile readability | Done | Mobile list/detail screenshots generated. |
| Localization spot QA | Done | English/Hebrew UI chrome screenshots generated for parent/student. |
| npm ci | Pass | Clean worktree dependencies installed, 0 vulnerabilities. |
| node --check | Pass | server.js and Telegram bridge syntax checked. |
| npm test | Pass | 110/110 in clean branch. |
| screenshot smoke | Pass | No horizontal overflow. |
| app smoke | Pass | Clean server on 127.0.0.1:18080. |
| OpenAI smoke | Pass | Temporary local smoke secrets used then removed. |
| Railway doctor | Pass | No deploy performed. |
| Lighthouse | Partial | Report generated; command failed during Windows temp cleanup EPERM. |
| Deployment from original workspace | Blocked | Dirty workspace has unrelated/generated/unsafe changes. |
| Deployment from clean branch | Awaiting approval | Clean branch is staged and verified; no deployment performed. |
