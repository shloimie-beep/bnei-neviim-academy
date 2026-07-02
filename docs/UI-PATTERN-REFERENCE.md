# UI Pattern Reference

This reference gives the Product Quality Compiler concrete patterns so words
like professional, polished, and logical compile into usable product specs.

## CRM Resource List

Pattern:

- list same-type resources;
- search, filter, sort;
- each item opens detail;
- item summary shows status and next action.

BNA application:

- One Time contacts;
- parents/students/leads;
- class participants;
- email recipients.

Required for BNA:

- resource heading;
- count;
- search;
- filters;
- sort where useful;
- status/stage;
- last activity;
- source;
- primary contact method;
- selected item opens detail;
- empty state;
- filtered empty state;
- loading state;
- pagination or progressive loading for long lists.

Reference principle: Shopify Polaris resource-list style is for finding an
object and navigating to its details, with filters/sorting/pagination and bulk
actions where appropriate.

## Data Table

Pattern:

- structured comparison;
- sortable columns;
- selectable rows;
- expandable rows;
- toolbar for primary action/search/filter/settings;
- batch actions only when selected.

BNA application:

- bulk email recipients;
- payments/access rows;
- import review;
- admin audit rows.

Reference principle: Carbon-style data tables fit structured data, search and
filter toolbars, expandable rows, selection, and batch actions.

## Pipeline Board

Pattern:

- business stages as columns;
- cards show entity summary;
- card opens detail drawer;
- drag/drop optional only with accessible fallback;
- stage changes audited.

BNA stages:

- New Lead;
- Interested;
- Free Class / Trial;
- Paid Member;
- Inactive;
- Cancelled;
- Refund / Dispute Review only if needed.

Use for:

- leads;
- enrollment/membership status;
- free class/trial to paid flow.

Card required fields:

- name;
- parent/student marker if relevant;
- contact method;
- source;
- last activity;
- stage;
- next action;
- owner;
- payment/access status if relevant.

## Contact Detail Drawer

Required tabs:

- Overview;
- Communications;
- Classes & Access;
- Payments;
- Tasks & Decisions;
- Notes;
- Audit.

## Activity Timeline

Required:

- newest first;
- type icon/label;
- timestamp;
- actor/source;
- related record;
- privacy/scope marker if relevant;
- no raw payloads.

## Empty State

Required:

- communicate system status;
- explain what can appear here;
- provide next action;
- distinguish loading from empty;
- distinguish filtered empty from true empty.

Reference principle: NN/g empty-state guidance emphasizes status, learning, and
direct pathways.

## Blocked Setup Card

Required:

- title;
- what is blocked;
- owner;
- reason;
- recommended next action;
- safe alternatives;
- whether the normal user should see it;
- support drawer routing.

## Bulk Action Gate

Required:

- selected count;
- recipient/source clarity;
- preview step;
- test step;
- suppression/unsubscribe readiness;
- confirmation;
- readback/audit.

## Community/Class Discussion

Required:

- classes;
- announcements;
- resources;
- private student replies to Rabbi;
- Rabbi moderation;
- Rabbi-selected public Q&A;
- no public student-to-student chat unless approved.

Use for:

- One Time announcements;
- classes;
- class resources;
- questions;
- private student replies to Rabbi;
- member/student/parent portal separation;
- admin moderation.

Admin/provider/member/student/parent states must not be mixed in one screen
unless the packet explicitly defines role gates and support-drawer boundaries.

## Mobile Master-Detail

Required:

- list state;
- selected detail state;
- clear back action;
- no trapped drawer;
- touch targets;
- sticky actions do not obscure content.

Reference principle: WCAG 2.2 and mobile accessibility require contrast, focus,
target size, labels, and keyboard/touch paths.
