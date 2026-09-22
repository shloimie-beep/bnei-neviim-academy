# 01 Current-State Visual Audit - One Time P0/P1 Corrective

Packet ID: `PKT-20260711-001-AUDIT`
Parent raw ID: `RAW-20260711-001`
Status: implementation audit opened before product edits.

## Inspected Sources

- `server.js`
- `public/operations-bootstrap.html`
- `public/operations.html`
- `public/js/operations-shell.js`
- `public/js/operations-deferred-renderers.js`
- `public/css/operations-shell.css`
- `scripts/split-operations-shell.mjs`
- `public/provider.html`
- `src/platform/instances/one-time-rabbi-dashboard-ia.js`
- `src/lib/bna/one-time-role-model.js`
- `src/lib/bna/crm-contact-model.js`
- `public/one-time/index.html`
- `public/one-time-preview.html`
- `config/service-provider-sites/one-time.json`
- `public/js/bna-bot-widget.js`

## Findings

| ID | Severity | Surface | Finding | Required Fix |
| --- | --- | --- | --- | --- |
| VQ-20260711-001 | P0 | Operations artifact | `/operations` route uses bootstrap, but package has no generated-asset build/check command and direct `/operations.html` is still user-reachable. | Add `operations:build`, `operations:check-generated`, and source-artifact redirect/proof. |
| VQ-20260711-002 | P0 | Public lead capture | `/api/one-time/interest` can attempt a Telegram reminder for non-synthetic public leads. | Suppress Telegram/external notification for public corrective leads and report no-send. |
| VQ-20260711-003 | P1 | Public landing config | `config/service-provider-sites/one-time.json` still advertises stale free-class, FAQ, and "See How It Works" contracts. | Synchronize config to approved Sign Up Now hierarchy and no-send onboarding contract. |
| VQ-20260711-004 | P1 | Signup continuation | `/one-time-preview` contains preview/TBD/checklist language. | Convert to real onboarding page/alias with family/school branches and CRM lead linkage. |
| VQ-20260711-005 | P1 | Robot Scheller bubble | Bot widget references `/assets/one-time/robot/robot-scheller-whatsapp.png`, but the repo lacks the approved full-body asset at that path. | Import latest downloaded image and set bubble background sizing to contain. |

## Screenshot Plan

Screenshots are still required after local implementation:

- `/one-time` at desktop 1440 and mobile 390/430.
- Signup modal empty, invalid, success, and onboarding-choice states.
- `/one-time-onboarding` family and school branches.
- Authenticated or fixture-backed `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=crm_contacts`.
- Canonical `/operations` generated artifact check proving bootstrap + generated JS/CSS, not direct `operations.html` source-only proof.

## Screenshot Blocker Before Edits

No before screenshots were captured before these first source-level Wave 1 fixes because the authenticated Operations route needs session credentials and the existing local static smoke does not prove canonical Express `/operations`. This blocker is explicit; after implementation, local static/canonical artifact smokes and public route screenshots must still be captured before terminal Done.
