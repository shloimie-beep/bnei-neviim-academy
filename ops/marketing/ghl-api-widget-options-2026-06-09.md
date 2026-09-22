# GHL API, Social, Review Widget, And CRM Options

Date: 2026-06-09
Tasks: #205, related follow-up #206
Status: research complete, implementation choice still pending

## Operator Question

The current question is not "can BNA use GHL?" BNA already can. The question is
whether GHL is worth keeping if its main value is connecting YouTube, Facebook,
Google Business Profile, and a review widget, while the operator rarely works
inside GHL.

## Short Recommendation

Keep the BNA app as the internal CRM and source of truth. Do not make GHL the
master place for BNA conversations unless the operator is actually going to live
there.

For the next 30 days, keep GHL only as a thin connector while testing cheaper
replacement pieces:

1. Review widget: first test GHL's own review widget because it already supports
   Google/Facebook sources, carousel/slider layouts, external embed code, and
   automatic updates. If it looks good, no extra review widget is needed while
   GHL is active.
2. Social connector: test Publer, Buffer, or Metricool with exactly three
   accounts: Facebook Page, YouTube channel, and Google Business Profile.
3. WhatsApp/Wappy: confirm which Wappy product is meant. `wappy.chat` is a
   website click-to-WhatsApp widget, not a full WhatsApp Business API inbox.
4. CRM: keep contacts, notes, task decisions, and conversation summaries in BNA;
   use outside tools only for delivery/channel access.

If the cheaper stack passes a live smoke, GHL can likely be replaced for roughly
USD 15-40/month plus WhatsApp usage, instead of the USD 97/month GHL Starter
subscription plus add-ons. If GHL is also running forms, funnels, automations,
reputation requests, email/SMS workflows, or a serious conversations inbox, keep
Starter until those workflows are replaced one by one.

## Current GHL Value For BNA

Already useful:

- BNA already has a PIT-token based HighLevel integration in repo memory.
- GHL social diagnostics have passed in live smoke checks.
- Facebook, YouTube, and Google accounts have already been connected through
  GHL in the existing workflow.
- GHL can create drafts/publish through Social Planner, which avoids direct
  Meta/Google app-review work for now.

Not enough by itself:

- Paying for GHL as an "internal CRM" is weak if the operator rarely opens it.
- GHL should not become the canonical BNA memory. The repo/app should remain the
  durable source of truth.
- GHL add-ons can push cost beyond the base subscription: WhatsApp is listed by
  HighLevel as USD 10/month per enabled sub-account plus usage, Online Listings
  is USD 30/month, dedicated IP is USD 59/month, AI Employee Unlimited is USD
  97/month per enabled sub-account, and LC Email is usage-based.

## Direct API Reality

| Need | Direct API answer | Practical risk |
| --- | --- | --- |
| YouTube posting | Feasible through YouTube Data API v3. Requires Google Cloud project, API enablement, OAuth, and channel authorization. Current docs show default quota buckets including 100 `videos.insert` calls/day and 10,000 units/day for other endpoints. | Low technical risk for BNA's own channel. Needs OAuth refresh-token handling, upload retry handling, title/description/status rules, and thumbnail support. |
| Facebook Page posting | Feasible through Meta Pages API. Official docs show Page posting via `POST /page_id/feed`, photos via `/page_id/photos`, and the `pages_manage_posts` permission with dependencies including `pages_read_engagement` and `pages_show_list`. | Medium/high setup friction. Production use needs Page access tokens, Facebook Login, permission review/advanced access where applicable, token renewal/reauth handling, and Meta API breakage monitoring. |
| Google Business Profile | Feasible through Business Profile APIs for location info, reviews, posts, photos, insights, and notifications. Google says these APIs are for developers with technical experience and coding knowledge. | Medium setup friction. Requires the correct Google account with GBP owner/manager access, API signup/enablement, OAuth, location IDs, review/post policy care, and caching. |
| Google review carousel on website | Technically possible with GBP API, but a custom widget means building, caching, styling, and maintaining the review display. | Low value to build first. Use GHL widget or a third-party widget unless BNA needs total ownership/no third-party script. |
| WhatsApp/Wappy | If this means `wappy.chat`, it is a click-to-WhatsApp website widget with free and EUR 9.99/month premium tiers. If this means official WhatsApp Cloud API, Meta pricing is based on delivered template messages; non-template replies inside the customer service window are free. | Confirm exact provider. Click-to-WhatsApp is cheap and simple; official WhatsApp API adds template approval, WABA setup, billing, and compliance. |

## Cheaper Social Connector Options

### Publer

Best candidate if BNA wants a cheap all-in-one scheduler with an API surface.

- Free plan supports 3 social accounts and 10 pending scheduled posts per
  account.
- Supports Facebook, YouTube channels, and Google Business locations.
- Paid Professional starts at USD 5/month for 1 social account, with extra
  social accounts priced separately.
- Publer API exposes connected accounts and posting endpoints with providers
  including `facebook`, `youtube`, and `google`.

Likely BNA cost: free if the 3-account/10-pending-post limit is enough; about
USD 13/month for 3 social accounts on Professional based on current pricing.

### Buffer

Best candidate if BNA wants simple scheduling and developer-friendly API access.

- Free plan: 3 channels, 10 scheduled posts per channel, API access.
- Essentials: USD 5/month per channel when billed yearly.
- Channel list includes Facebook, YouTube, and Google Business Profile.
- Community inbox can reply to comments on Google Business Profile, YouTube,
  Facebook, and other networks.

Likely BNA cost: free for light use, or about USD 15/month yearly-billed for 3
paid channels.

### Metricool

Best candidate if BNA wants social analytics and reporting, not just posting.

- Free plan manages 1 brand and can connect one profile per included network.
- Free plan schedules up to 20 posts/month.
- Facebook, YouTube, and Google Business Profile are supported in the pricing
  matrix.
- Starter starts around USD 20-25/month depending on monthly/yearly pricing and
  manages multiple brands.
- API/Zapier/Make/MCP access appears in the Advanced tier, not the free tier.

Likely BNA cost: free for low volume, USD 20-25/month if scheduling volume or
brand/account needs grow.

## Review Widget Options

### Keep GHL widget while subscribed

GHL's own Reputation review widget already supports Google/Facebook review
sources, carousel/slider layouts, filters, external embed code, automatic
updates, and mobile responsiveness. If the visual quality is acceptable, use
this before buying another widget.

### Third-party widgets if canceling GHL

| Tool | Current fit | Cost signal |
| --- | --- | --- |
| Elfsight Google Reviews | Most polished low-friction embed; has free testing, templates, moderation/filtering, custom CSS/JS, lazy loading, and multiple layouts. | Free with 200 views/month; low paid tier shown at USD 4/month yearly-billed for 5,000 views and 3 widgets. |
| SociableKIT Google Reviews | Explicit carousel/dark carousel layouts; simple if unlimited views matter. | Page advertises unlimited views from USD 10/month. |
| Trustindex | Strong annual value if styling is acceptable; slider/grid/badge layouts and unlimited views. | Single plan shown at USD 65/year for 1 domain. |
| EmbedSocial EmbedReviews | More full review-management platform; good if BNA wants review collection, forms, API, or nonprofit discount. | Free tier plus paid review plans around USD 24/month yearly or USD 29/month monthly for 1 source. |

Recommended first pick if leaving GHL: test Elfsight and SociableKIT side by
side on a hidden website section, then keep whichever looks more natural on the
BNA homepage. Trustindex is cheaper annually, but should be visually checked
before choosing it.

## CRM Direction

Use BNA as the internal CRM:

- Contacts live in BNA.
- Telegram, Gmail, WhatsApp/Wappy, and form intake should write summaries or
  structured lead records back to BNA.
- GHL or a scheduler can be a channel adapter, not the system of record.
- Conversation history should be captured where it happens and summarized into
  BNA when it creates a lead, task, student note, payment item, or decision.

This prevents the operator from paying for a CRM interface he does not use,
while preserving the option to use GHL for specific channel functions until
they are replaced.

## WhatsApp / Wappy Decision Note

The current question is whether GHL is needed only because the BNA WhatsApp
number is connected there.

Do not decide until "Wappy" is disambiguated:

- `wappy.chat` is mainly a website click-to-WhatsApp widget. Its own FAQ says a
  visitor types a message, WhatsApp opens, and the message is carried over. This
  can replace a simple website contact widget, but it does not appear to be a
  full replacement for GHL's WhatsApp API, inbox sync, templates, or automation.
- `wappy.ai` presents itself as a WhatsApp Business automation platform with
  existing-number/new-number support, AI agents, workflows, data-source
  connections, appointment booking, analytics, and WhatsApp Business API
  integration language. This is the Wappy-style path that might replace GHL's
  WhatsApp role if pricing, onboarding, webhooks/API export, and data ownership
  check out.

Decision rule:

- If the target is `wappy.chat`, keep GHL or another official WhatsApp API
  provider for backend WhatsApp operations. Use Wappy only as a website
  WhatsApp CTA/widget.
- If the target is `wappy.ai` or another API-capable WhatsApp platform, run a
  proof of concept before keeping GHL for WhatsApp: connect a test number or
  confirm safe migration of the existing number, receive an inbound message,
  send a reply/template, export/sync the conversation into BNA Contacts, and
  verify manual handoff plus opt-in/compliance behavior.

Questions to ask Wappy before migrating:

1. Can BNA bring the exact current WhatsApp number that is connected to GHL?
2. Is this official WhatsApp Business Platform/API access or WhatsApp Web style
   automation?
3. Can BNA still use the normal WhatsApp Business app, or does API onboarding
   remove app access/coexistence?
4. Are inbound messages exposed by webhook/API with contact phone, timestamp,
   direction, message type, text/media metadata, and delivery status?
5. Can outbound replies/templates be sent by API from the BNA app?
6. What are the exact monthly platform fees and Meta pass-through message fees?
7. Is conversation export available if BNA later leaves Wappy?
8. Does Wappy support opt-in, templates, unsubscribe/stop handling, and human
   handoff?

## Decision Paths

### Option A: Keep GHL Starter For Now

Use when:

- The GHL review widget looks good.
- GHL Social Planner is reliably handling Facebook, YouTube, and GBP.
- Existing forms/automations/reputation workflows are active or not yet audited.

Cost: USD 97/month plus add-ons/usage.

Action: keep GHL, embed the GHL review widget on the public site, and stop
treating GHL as the master CRM.

### Option B: Hybrid Replacement

Use when:

- The operator does not use GHL CRM.
- BNA only needs publishing connections and a review carousel.
- A cheaper scheduler passes a live posting/draft smoke.

Likely stack:

- Publer or Buffer for Facebook/YouTube/GBP.
- Elfsight or SociableKIT for Google review carousel.
- Wappy click-to-WhatsApp widget if that is the desired WhatsApp layer.
- BNA app as CRM/source of truth.

Cost: roughly USD 15-40/month plus WhatsApp/provider usage.

Action: build a small BNA adapter to send approved content outputs to the chosen
scheduler instead of GHL, then cancel GHL only after a clean live smoke.

### Option C: Direct APIs Only

Use when:

- BNA wants to own the whole publishing path and avoid SaaS dependencies.
- The operator accepts the upfront build/maintenance cost.
- Meta and Google app/OAuth setup is worth the savings.

Cost: low platform fees, higher build and maintenance burden.

Action: create first-party OAuth apps and adapters for YouTube, Facebook Pages,
and GBP; build review caching/widget service; add monitoring for token failures
and API errors.

Recommendation: do not start here unless SaaS tools fail or BNA wants to sell
the connector as a product.

## Next Build If Approved

1. Audit current GHL usage: accounts connected, active forms, active workflows,
   review widget availability, conversations, email/SMS/WhatsApp usage, and
   paid add-ons.
2. Create a hidden website review-widget test section with either GHL widget
   embed or two third-party widget candidates.
3. Create free Publer/Buffer/Metricool test accounts and connect only the BNA
   Facebook Page, YouTube channel, and Google Business Profile.
4. Run one safe draft/scheduled-post smoke per channel, avoiding live publishing
   until explicitly approved.
5. If the cheaper stack passes, add a BNA content action adapter and migrate
   from GHL social actions.
6. After replacement smoke passes, decide whether to cancel/downgrade GHL.

## Sources Checked

- HighLevel pricing: https://www.gohighlevel.com/pricing
- HighLevel pricing/add-ons guide: https://help.gohighlevel.com/support/solutions/articles/155000001156-highlevel-pricing-guide
- HighLevel review widget docs: https://help.gohighlevel.com/support/solutions/articles/155000000997-customizing-review-widgets-in-reputation
- HighLevel Social Planner setup: https://help.gohighlevel.com/support/solutions/articles/155000005063-launchpad-setup-social-planner
- HighLevel Social Planner analytics/platforms: https://help.gohighlevel.com/support/solutions/articles/155000004101-social-planner-statistics
- YouTube Data API overview: https://developers.google.com/youtube/v3/getting-started
- YouTube quota docs: https://developers.google.com/youtube/v3/determine_quota_cost
- Meta Pages API posts: https://developers.facebook.com/docs/pages-api/posts/
- Meta `pages_manage_posts` permission: https://developers.facebook.com/docs/permissions/reference/pages_manage_posts/
- Google Business Profile API overview: https://support.google.com/business/answer/6333473?hl=en-GB
- Google Business Profile REST reference: https://developers.google.com/my-business/reference/rest
- Meta WhatsApp pricing: https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing
- Wappy pricing: https://wappy.chat/en/pricing
- Publer pricing: https://publer.com/help/en/article/what-are-publers-plans-and-pricing-15h4yqh/
- Publer supported networks: https://publer.com/help/en/article/what-social-networks-are-supported-npoun1/
- Publer API accounts/providers: https://publer.com/docs/api-reference/accounts
- Buffer pricing: https://buffer.com/pricing
- Metricool pricing: https://metricool.com/pricing/
- Elfsight Google Reviews pricing: https://elfsight.com/google-reviews-widget/pricing/
- SociableKIT Google Reviews widget: https://www.sociablekit.com/google-reviews-widget/
- Trustindex pricing: https://www.trustindex.io/prices/
- EmbedSocial reviews pricing: https://embedsocial.com/p/pricing/reviews
