# RAW-20260712-008 - One Time signup location hotfix

Source channel: codex_chat
Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`
Received: 2026-07-12
Parse status: registered
Requirement register: `tasks-pending/2026-07-12-onetime-signup-location-hotfix.md`

## Raw Source

User reported that the live One Time signup form is blocking a real signup because it says to choose a city but there is no usable city option. User asked to check whether this was already in the tasks/prompts and fix it immediately, allowing the family/school to type a city, ZIP/postal code, area code, or area instead of being forced into a city picker.

## Status Finding

The city/timezone correction was already captured as `REQ-20260712-106` in `tasks-pending/2026-07-12-onetime-landing-visual-revision.md`, and the production-base code uses a free-text `city_label` input. This hotfix hardens the visible form copy and validation so the field clearly accepts a city, ZIP/postal code, or area and does not imply a missing city list.
