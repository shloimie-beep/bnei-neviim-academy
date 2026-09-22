# 01-Current State Visual Audit Sample - Rabbi / One Time

You are Stage 1 / Stage 2 of parent raw input `RAW-SAMPLE`. Do not solve the
whole parent ramble. Produce only this packet's output contract.

## Scope

No implementation. Inspect and report current state only.

Routes/screen hypotheses:

- `/operations?workspace=rabbi_sheller_provider`;
- `/operations?workspace=rabbi_sheller_provider&view=crm`;
- `/operations?workspace=rabbi_sheller_provider&view=content`;
- `/operations?workspace=rabbi_sheller_provider&view=communications`;
- `/operations?workspace=rabbi_sheller_provider&view=settings`;
- member/student/parent portal routes only if the control tower includes them.

## Required Evidence

Viewports:

- 1440 desktop;
- 1024 desktop/tablet;
- 768 tablet;
- 430 mobile;
- 390 mobile.

Audit outputs:

- route/screen inventory;
- surface map;
- screenshots;
- VQ findings;
- IA/category/subcategory/filter findings;
- action state inventory;
- data display and leak scan;
- role/scope leakage findings;
- mobile drawer/back-action findings;
- accessibility preliminary findings;
- proposed implementation packets.

## Visual Defect Categories

Use `ops/visual-quality-rubric.md`, including:

- `VQ-TYPE-*`;
- `VQ-LAYOUT-*`;
- `VQ-IA-*`;
- `VQ-ACTION-*`;
- `VQ-DATA-*`;
- `VQ-CRM-*`;
- `VQ-COMMUNITY-*`;
- `VQ-RESP-*`;
- `VQ-A11Y-*`;
- `VQ-CRED-*`.

## Terminal Condition

The audit is complete only when before screenshots exist or exact blockers are
recorded and every finding maps to a proposed requirement ID. Implementation
packets come after this audit.
