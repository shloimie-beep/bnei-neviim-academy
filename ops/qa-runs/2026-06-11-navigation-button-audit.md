# Navigation Button Audit

Status: implemented, locally verified
Updated: 2026-06-12

| Route | Button label | Expected behavior | Actual behavior | Fix made | Remaining blocker |
| --- | --- | --- | --- | --- | --- |
| Operations all workspaces | Back to all modules | Switch left rail from current-module sections to broad module list. | Works in screenshot route with `nav=modules`; no horizontal scroll. | Added sidebar mode and drilldown render. | None. |
| Operations module list | Workspace module buttons | Open selected module and show only that module's sections. | Works through `switchView`; current module section rail shown. | Replaced mixed global/subnav sidebar with module-or-section mode. | None. |
| BNA Tasks / Decisions | Needs Decision chip | Filter task list to decision lane. | Shows decision lane, filters, empty state when no matching tasks. | Added compact task status toolbar and lane state. | None. |
| BNA Tasks / Waiting Access | Waiting for Access chip | Filter to access/credential/permission blockers. | Route loaded and screenshot passed. | Added visible waiting-access focus and alias mapping from old stale focus. | None. |
| BNA Tasks | Ready for Codex chip | Filter to queued Codex-ready work. | Route contract passes; chip available in toolbar. | Renamed old Changelog queue language in visible task controls. | None. |
| BNA Tasks | Filter controls | Filter lane by urgency, date, project, category without large card stack. | Filters render inside compact toolbar. | Moved filter panel into local toolbar. | None. |
| Decision cards | Approve option | Apply selected option through existing decision action. | Render path parses option payload and keeps existing action. | Added question/context/recommendation model plus option buttons. | Needs real option data to test mutation end-to-end. |
| Decision cards | Defer | Move decision to Shloimie-owned work. | Button renders through task action. | Added explicit defer action. | Needs populated decision card for mutation smoke. |
| Decision cards | Ask assistant | Move unclear decision to Codex clarification. | Button renders through task action. | Added explicit assistant clarification action. | Needs populated decision card for mutation smoke. |
| BNA Settings / Bots & AI | Overview | Show category overview instead of endless settings rail. | Works on desktop/mobile screenshots. | Added settings category tabs and child chips. | None. |
| BNA Settings / Bots & AI | Bot Permissions | Open existing bot permissions leaf section. | Button rendered and route-safe. | Added `setSettingsLeaf`. | None. |
| BNA Settings / Bots & AI | Save / Test / Reset | Keep controls visible and labeled; unsafe actions disabled/not configured. | Buttons visible in toolbar. | Added local settings toolbar. | Test/Reset intentionally not configured. |
| Parent Portal Home | View full update | Jump from weekly update panel to Learning section. | Button rendered in weekly update panel when portal loaded. | Added weekly-update-first home panel. | None. |
| Parent Portal Home | Ask about this update | Jump to Messages/Help. | Button rendered in weekly update panel. | Added scoped action to parent messages. | None. |
| Student Portal Home | Enter access code again | Return to entering a code without implying fake account switching. | Button visible on loaded student portal. | Renamed old `Use a different link`. | None. |
| Student Portal Home | Ask BNA Helper | Keep helper dock scoped to student-visible context. | Dock visible in mobile screenshot. | Existing dock preserved; copy remains scoped. | None. |
| Provider Participant Home | Home / Program / Schedule / Worksheets / Questions / Messages / Payment / Account | Keep participant portal separate from BNA school data. | Buttons render as provider-only sections. | No code change needed beyond verification. | None. |

## Notes

- Button audit focused on navigation, lane switching, settings traversal, and portal entry actions requested in the prompt.
- Destructive or external-send buttons were not enabled or configured.
- WAPI/Resend were not touched.
