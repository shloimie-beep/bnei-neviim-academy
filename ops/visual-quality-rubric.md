# Visual Quality Rubric

Every screenshot-based UI finding must use one or more defect codes from this
rubric. Findings are evidence records, not vibes.

## Finding Fields

Each finding must include:

- finding ID;
- route;
- viewport;
- screenshot path;
- defect code(s);
- severity: `P0`, `P1`, `P2`, or `P3`;
- user impact;
- exact expected fix;
- owner;
- requirement ID;
- terminal status;
- before evidence;
- after evidence.

## TYPOGRAPHY

- `VQ-TYPE-001` unreadable text size
- `VQ-TYPE-002` inconsistent font scale
- `VQ-TYPE-003` low contrast text
- `VQ-TYPE-004` overuse of all caps
- `VQ-TYPE-005` unclear label hierarchy
- `VQ-TYPE-006` text truncation hides important meaning
- `VQ-TYPE-007` raw/mechanical fallback copy

## LAYOUT

- `VQ-LAYOUT-001` misaligned cards
- `VQ-LAYOUT-002` inconsistent spacing
- `VQ-LAYOUT-003` uneven button height/width
- `VQ-LAYOUT-004` crowded panel
- `VQ-LAYOUT-005` too much vertical stacking
- `VQ-LAYOUT-006` unclear grouping
- `VQ-LAYOUT-007` horizontal overflow
- `VQ-LAYOUT-008` overlapping elements
- `VQ-LAYOUT-009` sticky/header/filter collision
- `VQ-LAYOUT-010` detail panel not visually tied to selected item

## NAVIGATION / IA

- `VQ-IA-001` duplicate category/subcategory
- `VQ-IA-002` filter used as navigation
- `VQ-IA-003` navigation item points to wrong scope
- `VQ-IA-004` super-admin view leaks into Rabbi/member view
- `VQ-IA-005` too many top-level options
- `VQ-IA-006` unclear current location
- `VQ-IA-007` inconsistent terminology
- `VQ-IA-008` user cannot identify next action

## ACTIONS

- `VQ-ACTION-001` dead button
- `VQ-ACTION-002` duplicate buttons
- `VQ-ACTION-003` action state unclear
- `VQ-ACTION-004` destructive/external action not gated
- `VQ-ACTION-005` preview action not labeled preview
- `VQ-ACTION-006` blocked action missing owner/reason/next action
- `VQ-ACTION-007` primary action not obvious
- `VQ-ACTION-008` too many competing primary buttons

## DATA DISPLAY

- `VQ-DATA-001` missing status
- `VQ-DATA-002` missing date/last activity
- `VQ-DATA-003` missing owner/source
- `VQ-DATA-004` raw JSON/provider payload visible
- `VQ-DATA-005` raw transcript/private data visible
- `VQ-DATA-006` unrelated workspace data visible
- `VQ-DATA-007` mechanical job name shown instead of human title
- `VQ-DATA-008` empty placeholder shown as real feature
- `VQ-DATA-009` important related record hidden

## CRM / PIPELINE

- `VQ-CRM-001` contacts shown as unstructured cards
- `VQ-CRM-002` no searchable contact list
- `VQ-CRM-003` no contact detail view
- `VQ-CRM-004` no lifecycle stage
- `VQ-CRM-005` no communication history
- `VQ-CRM-006` no next action
- `VQ-CRM-007` pipeline stages unclear
- `VQ-CRM-008` card open/detail flow clumsy
- `VQ-CRM-009` tasks/decisions overwhelm contact detail

## COMMUNITY

- `VQ-COMMUNITY-001` class discussion context unclear
- `VQ-COMMUNITY-002` private/public response state unclear
- `VQ-COMMUNITY-003` student-to-student posting accidentally implied
- `VQ-COMMUNITY-004` Rabbi moderation controls unclear
- `VQ-COMMUNITY-005` portal/member/admin views mixed
- `VQ-COMMUNITY-006` class/library/announcement organization unclear

## RESPONSIVE

- `VQ-RESP-001` mobile overflow
- `VQ-RESP-002` mobile actions hidden
- `VQ-RESP-003` mobile detail panel unusable
- `VQ-RESP-004` tablet layout awkward
- `VQ-RESP-005` touch targets too small
- `VQ-RESP-006` filter rail unusable on mobile
- `VQ-RESP-007` modal/drawer cannot close on mobile

## ACCESSIBILITY / READABILITY

Baseline: user-facing UI must satisfy WCAG 2.2 A/AA where applicable plus BNA
mobile/touch requirements. Automated scans supplement screenshot and agent
inspection; they do not replace visual review.

Required checks:

- contrast minimum for text and non-text controls;
- visible focus state;
- focus not obscured by sticky headers/drawers;
- keyboard path for critical actions;
- labels/instructions for fields;
- name/role/value for controls;
- target size minimum for mobile/touch;
- no action conveyed by color alone;
- error identification;
- reflow/no horizontal scrolling at mobile viewport unless an intentionally
  scrollable table has accessible handling;
- modal/drawer close path;
- no trapped focus;
- readable mobile typography;
- touch targets not crowded.

- `VQ-A11Y-001` contrast minimum
- `VQ-A11Y-002` non-text contrast
- `VQ-A11Y-003` focus visible
- `VQ-A11Y-004` focus not obscured
- `VQ-A11Y-005` keyboard path missing
- `VQ-A11Y-006` label missing
- `VQ-A11Y-007` name/role/value missing
- `VQ-A11Y-008` target size too small
- `VQ-A11Y-009` status conveyed only by color
- `VQ-A11Y-010` error identification missing
- `VQ-A11Y-011` drawer/modal focus trap issue
- `VQ-A11Y-012` mobile reflow/overflow issue

Accessibility done rule: a UI cleanup packet cannot be done if it introduces
new P0/P1 accessibility defects.

## CREDIBILITY

- `VQ-CRED-001` screen looks unfinished
- `VQ-CRED-002` internal implementation detail visible
- `VQ-CRED-003` duplicated or contradictory status
- `VQ-CRED-004` fake/placeholder content in normal path
- `VQ-CRED-005` user-facing screen exposes setup noise
- `VQ-CRED-006` obvious inconsistency between screens
