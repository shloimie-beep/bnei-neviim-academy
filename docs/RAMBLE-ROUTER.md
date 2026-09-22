# Ramble Router

The Ramble Router is the first compiler pass for every new operator input. It
decides what kind of work the ramble is before any Codex implementation prompt
is created.

Core rule:

> The operator may stay vague. The system may not. Router output decides
> whether Product Quality Compiler, Super-Ramble Packet DAG, visual audit,
> provider separation, Definition of Ready, verifier, or deploy gates are
> required before code.

## Classifications

A single ramble can receive multiple classes:

- `SIMPLE_TASK`
- `BUG_REPORT`
- `PRODUCT_QUALITY`
- `SUPER_RAMBLE`
- `UI_VISUAL_AUDIT`
- `UI_IMPLEMENTATION`
- `CRM_PIPELINE`
- `COMMUNITY_CLASSROOM`
- `COMMUNICATIONS_EMAIL`
- `PAYMENTS_ACCESS`
- `PROVIDER_SETUP`
- `EXTERNAL_WRITE_REQUEST`
- `SECURITY_PRIVACY`
- `SOURCE_OF_TRUTH_UPDATE`
- `VERIFIER_CLOSEOUT`
- `DEPLOY_RELEASE`
- `SUPPORT_ONLY`
- `DECISION_REQUIRED`

## Required Router Output

Each router record must include:

- `raw_id`;
- `classification`;
- `confidence`;
- `reasons`;
- affected workspace/project when known;
- affected view classes when known;
- affected product surfaces;
- likely external/provider blockers;
- whether Product Quality Compiler is required;
- whether Super-Ramble Packet Splitter is required;
- whether current-state visual audit must happen before implementation;
- whether implementation is forbidden until Definition of Ready passes;
- recommended packet sequence;
- next exact packet to generate.

## Routing Rules

1. If the ramble contains phrases such as `million-dollar`, `clean`, `nice`,
   `ugly`, `sloppy`, `professional`, `embarrassing`, `GHL-like`, `all over the
   place`, `fix the whole section`, `community makes no sense`, or `CRM should
   feel like GHL`, classify it as `PRODUCT_QUALITY`.
2. If the ramble touches more than one major product surface, classify it as
   `SUPER_RAMBLE`.
3. If `PRODUCT_QUALITY` and a UI surface are present, require:
   - `00-control-tower`;
   - `01-current-state-visual-audit`;
   - no implementation until visual audit and Definition of Ready pass.
4. If email, Stripe, DNS, Zoom, Vimeo, WhatsApp, Telegram, Drive write,
   payment, access grant, or other external-provider setup appears with UI
   cleanup, split provider setup into a separate `PROVIDER_SETUP_PACKET`.
5. If `GHL-like` appears, require:
   - `no_ghl_runtime: true`;
   - first-party BNA pattern interpretation;
   - no external CRM writes;
   - no LeadConnector references.
6. If the operator asks for `do everything`, `finish everything`, or broad
   equivalent language, create a Packet DAG. Do not create one giant Codex
   implementation packet.

## Default Rabbi / One Time Routing

Input:

> Make Rabbi Sheller / One Time look like a million-dollar app. It's sloppy.
> CRM should feel like GHL. Community makes no sense. Fix the whole section.

Router output:

- classifications: `PRODUCT_QUALITY`, `SUPER_RAMBLE`, `UI_VISUAL_AUDIT`,
  `CRM_PIPELINE`, `COMMUNITY_CLASSROOM`, `COMMUNICATIONS_EMAIL`,
  `PAYMENTS_ACCESS`, `SECURITY_PRIVACY`;
- workspace: `rabbi_sheller_provider`;
- project: `one_time_mishnah_class`;
- view classes: `RABBI_PROVIDER_ADMIN`, `SHLOIMIE_PLATFORM_SUPPORT`,
  `MEMBER_PARENT_PORTAL`, `STUDENT_PORTAL` as relevant;
- Product Quality Compiler required: yes;
- Super-Ramble Packet DAG required: yes;
- visual audit before implementation: yes;
- implementation forbidden until Definition of Ready passes: yes;
- external provider setup: separated into provider packets;
- GHL: first-party pattern inspiration only, no runtime.

Recommended first packets:

1. `00-control-tower`
2. `01-current-state-visual-audit`

The next exact operational packet after this protocol task is:

`Generate Rabbi Sheller / One Time 00-control-tower and 01-current-state-visual-audit packets using Ramble Protocol v3 / Product Quality Operating System.`
