# Service Provider Directory And Login

Captured: 2026-06-10

## Intent

Map and build the BNA service-provider side of the system without interfering
with the current full-UI redesign agent.

BNA needs approved external providers who can log in, manage their own services
or classes, and appear in a parent-facing index. Parents should be able to find
approved services near them and filter by practical family/student needs.

## Operator Requirements

- Providers are part of the BNA network and must be approved by BNA.
- Example provider/service types: math tutor, electronics group, therapy,
  coaching, mentoring, Rabbi-led learning/classes.
- Providers can be connected to a Rabbi/subscription context.
- If a family is subscribed through that Rabbi, they receive the configured
  discount on that provider's service.
- BNA may run billing, management, and marketing for providers in exchange for
  an external admin fee or through the marketing-agency lane.
- Parents should see the provider index from the parent section/portal, linked
  to their own student/family account.
- Parents need search/filter controls:
  - city/location
  - near-me radius
  - service type/category
  - price/cost
  - child age range
  - number of kids / group size / capacity
  - class/service options and times
- First seed/class option to account for: 7:00 Rabbi Scheller Mishnah class.

## Initial Research Notes

There are marketplace/directory products that could accelerate this, but they
would not automatically understand BNA parent accounts, student records, Rabbi
subscription discounts, provider approval rules, or BNA billing/admin-fee
logic.

Useful references checked:

- Sharetribe Developer Platform supports marketplace functionality through
  Marketplace and Integration APIs:
  https://www.sharetribe.com/docs/introduction/
- Sharetribe web template can be cloned/customized if choosing an external
  marketplace path:
  https://github.com/sharetribe/web-template
- PostGIS has first-class radius search with `ST_DWithin`, which is the right
  shape for "near me" filtering if Railway Postgres can enable PostGIS:
  https://postgis.net/docs/ST_DWithin.html
- OpenStreetMap/Nominatim can geocode addresses, but the public hosted service
  has usage-policy limits; production should use caching, a paid geocoder, or a
  self-hosted/service-backed option:
  https://operations.osmfoundation.org/policies/nominatim/

Recommendation: build a first-party MVP inside the existing BNA app first. It
should be a directory, not a full marketplace, until payment-provider and
provider self-service needs are proven. Keep external marketplace platforms as
fallback only if BNA later needs a generic public two-sided marketplace.

## Proposed Data Model

Start with explicit tables/objects rather than overloading parent/student
records:

- `bna_service_providers`
  - provider/account name
  - contact name/email/phone
  - login user/account linkage
  - status: `draft`, `pending_review`, `approved`, `paused`, `rejected`,
    `archived`
  - public/private notes
  - approval metadata
  - marketing-management flag
  - billing-management flag
  - admin-fee configuration
- `bna_provider_services`
  - provider id
  - title
  - service type/category
  - description
  - price and billing period
  - child age min/max
  - group size min/max/capacity
  - city/address/service area
  - latitude/longitude
  - searchable tags
  - approval/publication status
- `bna_provider_service_sessions`
  - service id
  - class/session title
  - day/time/timezone
  - location or online flag
  - capacity
  - enrollment/availability status
- `bna_provider_rabbi_links`
  - provider/service id
  - Rabbi/account/project id
  - discount type: percent/fixed/custom
  - discount value
  - eligibility rules
- `bna_provider_billing_accounts`
  - provider id
  - payout/billing status
  - admin-fee terms
  - external payment provider references
  - approval/no-live-charge gates

## Product Surface

Provider login:
- Scoped provider account separate from parent/student accounts.
- Provider can edit own profile, services, classes, prices, locations, capacity,
  and availability.
- Any public-facing change should remain `pending_review` until BNA approves.
- Provider cannot see BNA private Students, Accounting, Tasks, or parent data
  unless explicitly granted later.

Operations admin:
- Review and approve provider profiles/services.
- Add services/classes manually for a provider.
- Configure Rabbi subscription discount rules.
- Configure BNA admin-fee/billing-management/marketing-management flags.
- Seed the 7:00 Rabbi Scheller Mishnah class.

Parent portal:
- Show approved providers/services only.
- Default to family/student context.
- Filters: city, near me radius, type, price, age range, group size/capacity,
  class time/options.
- Search result cards should show provider, service, city/distance, price,
  age range, capacity, next session/time, discount eligibility, and contact/
  request action.

## Technical Questions To Resolve

- Is PostGIS available/enabled on the current Railway Postgres instance?
- Which geocoder should be used for provider addresses: Google Maps, Mapbox,
  Geoapify, Nominatim with caching, or manual lat/lng entry for MVP?
- Should provider payments go through Green Invoice, Morning, Stripe, GHL,
  Buffer-adjacent marketing flow, or a later selected provider?
- Should provider login reuse the new scoped external-user pattern built for
  Rabbi Elie/One Time, or become its own account type?
- What exactly counts as Rabbi subscription eligibility for discounts: parent
  subscription, student enrollment, class membership, or project/account
  membership?

## Suggested MVP Sequence

1. Add read/write schema and protected APIs for providers, services, sessions,
   Rabbi discount links, and approval status.
2. Add Operations admin view for provider review/approval and manual seeding.
3. Add provider-scoped login using the existing external-user/scoped-access
   pattern where possible.
4. Add parent-portal provider directory with city/category/age/price/capacity
   filters first.
5. Add radius search:
   - if PostGIS is available, store `geography(Point, 4326)` and use
     `ST_DWithin`
   - if not, start with city filter plus stored lat/lng and a simple
     application-level distance fallback for small data
6. Add Rabbi discount eligibility display.
7. Add request/enrollment/contact action.
8. Add billing/admin-fee management after the directory and approval workflow
   are stable.

## Acceptance Criteria

- A provider can be created and approved by BNA.
- The 7:00 Rabbi Scheller Mishnah class exists as a seeded service/session.
- Parent portal shows only approved services.
- Parent filters work for city, type, price, age range, capacity, and class
  options.
- Near-me radius search works or is explicitly blocked behind a clear geocoder/
  PostGIS decision.
- Rabbi subscription discount eligibility is visible on service cards.
- Provider login is scoped and does not expose private BNA admin/student/
  accounting data.
- No live billing/charges/payouts happen without an explicit typed confirmation
  and separate payment-provider approval path.
- App-visible changes are deployed to Railway and verified by Railway doctor,
  live app smoke, and Playwright desktop/mobile screenshots before completion.
