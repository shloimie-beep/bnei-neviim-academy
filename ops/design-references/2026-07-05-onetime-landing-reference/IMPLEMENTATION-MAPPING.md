# Implementation Mapping

| Target | Mapping |
|---|---|
| Public route | `/one-time`, alias `/one-time/mishnayos` |
| File | `public/one-time/index.html` |
| Config echo | `config/service-provider-sites/one-time.json` |
| Action registry | `ACTION-ONETIME-JOIN-SHIR-CTA`, `ACTION-ONETIME-WATCH-RABBI-CTA`, `ACTION-ONETIME-INTEREST-FORM`, `ACTION-ONETIME-MEMBER-LOGIN-LINK` |
| Signup route | `#start-free` until live signup/checkout route is approved |
| Existing API kept | `/api/one-time/campaign`, `/api/one-time/interest` |
| Member route kept | `/rabbi-member` |
| Out of scope | Payment/checkout changes, access grants, email/WhatsApp sends, Zoom/Vimeo/Drive writes, DNS, GHL/LeadConnector |
