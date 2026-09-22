# Provider Commercial Model, Entitlements, and Pre-Integration Setup

## Objective

Build the provider commercial packaging layer so BNA Operations can distinguish:

- free public provider listings
- paid managed growth/setup clients
- paid provider/admin workspaces
- paid school or micro-school workspaces
- custom partner/revenue-share projects such as Rabbi Sheller

This is the next queued implementation layer after the current Operations UI/QA/provider launch work. Do not block on Rabbi Sheller backend access. His current Replit/Vimeo/app system should be modeled as an external delivery system until inspected.

## Product Decision

- BNA Operations is canonical for CRM, leads, automations, tasks, content workflow, reporting, provider index, and provider setup.
- GHL is not canonical.
- External systems are connectors only.
- Rabbi Sheller already has an external Replit/Vimeo/app system, but BNA does not have full backend access yet.
- The app should not hardcode only Rabbi Sheller. Rabbi Sheller is the first partner/provider example, not the product model itself.

## Commercial Modes

### Free Provider Listing

For any service provider who should appear in the public Provider Index.

Includes:

- public profile/listing
- category/tags/search visibility
- basic program/class listing
- contact/signup CTA
- claim listing option
- manual lead notification
- limited analytics

Does not include by default:

- funnels
- email automations
- WhatsApp automation
- ad tracking
- landing page buildout
- CRM management
- content engine
- student/parent portals
- done-for-you setup

### Paid Managed Provider Setup

For a service provider paying Shloimie/BNA to set up or manage growth operations.

Includes:

- landing page/funnel setup
- lead pipeline
- email identity
- email drafts/drips
- WhatsApp workflow
- social/Publer workflow
- payment-link setup
- ad tracking
- content workflow
- reporting
- internal tasks
- automation setup
- support/ticket workflow

### Paid School / Micro-School Workspace

For a rabbi/provider running a real school or micro-school.

Includes:

- parent records
- student records
- parent portal
- student workspace
- assignments
- goals
- check-ins
- calendar
- billing
- communications
- bot permissions
- school operations
- full workspace settings

### Partner / Revenue Share

For custom deals such as Rabbi Sheller.

Includes:

- custom commercial terms
- partnership dashboard
- revenue/expense reporting
- access/materials checklist
- launch checklist
- shared internal tasks
- approval workflows
- monthly split reporting
- program/tier setup
- managed automations

## Rabbi Sheller Special Case

- Rabbi Sheller is a service provider, not a BNA school.
- Rabbi Sheller Provider Workspace is his provider workspace.
- Mishnayos Membership is his provider program.
- Video Library tier is $67/month.
- Live Membership tier is $149/month.
- His current Replit/Vimeo app remains the external delivery system until inspected.
- His commercial model is `revenue_share` / partner, not ordinary `free_listing`.
- BNA role for now: CRM, automation, funnel, content, reporting, and operating system.

## Data Model Concepts

Add or extend provider model support for:

- `provider_status`
- `commercial_model`
- `plan` / entitlement level
- `source_of_truth`
- `integration_status`
- `setup_package`
- `managed_services`
- `provider_entitlements`
- `provider_integrations`
- `provider_access_checklist`

Suggested `provider_status` values:

- `draft`
- `listed_free`
- `claimed`
- `managed_setup`
- `active_partner`
- `school_workspace`
- `paused`
- `hidden`

Suggested `commercial_model` values:

- `free_listing`
- `paid_setup`
- `monthly_management`
- `revenue_share`
- `school_subscription`
- `custom`

Suggested `source_of_truth` values:

- `bna_operations`
- `external_app`
- `hybrid`
- `unknown_pending_access`

Suggested `integration_status` values:

- `no_access`
- `access_requested`
- `read_only_access`
- `full_access`
- `api_available`
- `manual_only`
- `integrated`

## Entitlements

Provider entitlements should control which features appear. This is the core clarity requirement.

Free listings should not see paid automation settings unless shown as an upgrade CTA. Paid managed providers can show setup/admin controls. School workspace users can show school operations. Revenue-share partners can show custom partner controls.

Entitlement comparison rows:

- public profile
- provider index
- lead capture
- lead pipeline
- landing page/funnel
- email workflows
- WhatsApp workflows
- social scheduling
- ad tracking
- payment/access tracking
- content/video workflow
- worksheets/source sheets
- parent portal
- student workspace
- provider admin
- reporting
- bot actions
- support/tickets
- custom partnership terms

## Admin UI

Add provider commercial settings to provider admin pages.

Provider Commercial Settings fields:

- provider status
- commercial model
- entitlement/plan
- source of truth
- integration status
- setup package
- managed services enabled
- public listing enabled
- public signup enabled
- provider can claim listing
- provider admin user
- internal owner
- notes

Helper text:

- Free listing is public index only.
- Managed setup unlocks funnels/automation services.
- School workspace unlocks parent/student operations.
- Revenue-share partner uses custom terms.

Add Provider Plans / Entitlements page with comparison table:

- Free Listing
- Managed Provider Setup
- School Workspace
- Revenue-Share Partner

## Public Provider Listing CTA Logic

Public provider pages should choose CTAs based on provider status and commercial model:

- Free provider: Contact / Request Info / Claim This Listing
- Managed provider: Signup / Request Info / View Program
- School workspace: Apply / Contact School / Parent Portal
- Revenue-share partner: Join Membership / Request Info

Public listing must never show private business notes, access credentials, partnership terms, internal tasks, or internal launch/checklist details.

## Provider Onboarding Flow

Add route:

- `/providers/join`

or admin route:

- `/operations/providers/onboarding`

Provider signup fields:

- provider name
- contact name
- email
- phone/WhatsApp
- category
- service type
- location/online
- language
- age range
- program/class description
- website
- interested in: free listing, paid funnel/setup help, school workspace, not sure
- notes

On submit:

- create provider record
- create provider lead
- create provider onboarding pipeline item
- create internal task for review
- set `provider_status = draft`
- default `commercial_model = free_listing` unless selected otherwise
- set `integration_status = no_access`
- set `source_of_truth = unknown_pending_access`

## Rabbi Sheller Pre-Integration State

In Rabbi Sheller Provider Workspace, show:

- External delivery system: Replit/Vimeo app
- Backend access: pending
- Source of truth: hybrid/external pending inspection
- Available now:
  - provider profile
  - program/tier structure
  - lead pipeline
  - payment/access state placeholder
  - manual video/library links
  - manual worksheet/source-sheet links
  - questions
  - email/WhatsApp/social drafts
  - internal tasks
  - launch checklist
- Blocked until access:
  - database sync
  - member import
  - video library import
  - automated upload
  - analytics import
  - payment/access sync
  - internal app merge

## Access Checklist

Checklist items:

- Replit code access
- database access
- Vimeo access
- video library structure
- existing member/customer list
- email system details
- payment link/provider
- analytics dashboard
- question/comment/dialogue system
- worksheets/source sheets folder
- domain/DNS
- social accounts
- Publer/social connector
- Israeli payment processor
- bank/reporting access

Each item needs:

- status
- owner
- next action
- due date
- notes
- related task

## Integration Audit Page

For any provider with an external app, show:

- What system exists?
- What data exists?
- Who owns it?
- Can we export it?
- Is there an API?
- Is there database access?
- What should remain external?
- What should BNA Operations own?
- What should be synced?
- What should be ignored?

Rabbi Sheller integration audit should be empty/pending but ready to fill.

## Settings To Add Or Extend

- Provider Plans
- Provider Entitlements
- Provider Index
- Provider Onboarding
- Commercial Models
- Integrations
- Payment Links
- External Apps

## Testing

Run:

- `npm test`
- `npm run screenshot`
- `npm run lighthouse` if local server is available

Manual QA:

- Create a free provider listing.
- View public profile.
- Confirm only public fields show.
- Submit provider signup form.
- Confirm provider onboarding task created.
- Change provider to managed setup.
- Confirm extra admin features appear.
- Change provider to school workspace.
- Confirm school features appear.
- Open Rabbi Sheller workspace.
- Confirm he is partner/revenue-share service provider, not school.
- Confirm backend access pending state is clear.
- Confirm free listing vs paid setup distinction is obvious.
- Confirm mobile layout is usable.

Create QA report:

- `ops/qa-runs/YYYY-MM-DD-provider-commercial-model.md`

## Acceptance Criteria

- Provider free listing model exists.
- Paid managed setup model exists.
- Paid school workspace model exists.
- Revenue-share partner model exists.
- Rabbi Sheller is modeled as partner/provider with external app pending integration.
- Provider entitlements control visible features.
- Public provider index hides private fields.
- Provider onboarding creates proper records/tasks.
- Integration audit structure exists before backend access.
- UI clearly explains the difference between free listing, managed setup, and school workspace.

## Recommended Build Order

1. Finish UI/QA polish.
2. Add provider commercial model and entitlements.
3. Build Rabbi Sheller Launch Control Room.
4. Build public provider index/profile.
5. Build lead capture.
6. Inspect Rabbi Sheller backend.
7. Decide integration vs replacement.
