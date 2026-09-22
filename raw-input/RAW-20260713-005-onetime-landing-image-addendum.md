---
raw_id: RAW-20260713-005
source_channel: codex_chat
source_file: C:\Users\User\.codex\attachments\6c69f82a-c7a1-450d-845c-70264f5a789d\pasted-text.txt
parse_status: registered
workspace_key: rabbi_sheller_provider
project_key: one_time_mishnah_class
parent_raw_ids:
  - RAW-20260710-007
  - RAW-20260710-008
requirement_register: tasks-pending/2026-07-13-onetime-landing-image-addendum.md
created_at: 2026-07-13T16:10:00+03:00
privacy_classification: public_landing_asset_addendum_with_operator_selected_images
---

# One Time Landing Image Addendum

Operator message:

> Hey, can we just focus on the landing page for a minute? Can you just go through and push anything and focus on, you know, fixing up the landing page? I know you're going through and launching everything, but let's first fix up the landing page and all the tracks and stuff that's open regarding the landing page. So this is one additional prompt. And then you can go back to doing all the other stuff you're doing.

Attached prompt title:

> CODEX PROMPT - ONE TIME LANDING IMAGE ADDENDUM - NON-COLLIDING

Key raw assignments from the attached prompt:

- Use `C:\Users\User\Downloads\WhatsApp Image 2026-07-13 at 14.37.21 (1).jpeg` for the Clarity card under "What Your Son Will Gain".
- Use `C:\Users\User\Downloads\WhatsApp Image 2026-07-13 at 14.37.22 (1).jpeg` for the Excitement for learning Torah card under "What Your Son Will Gain".
- Use `C:\Users\User\Downloads\Norfolk, Virginia.jpg` for the "Who It's For / Built for Families and Schools" background only.
- Preserve any existing Accomplishment card asset assignment; if no assignment is found after inspection, leave the card unchanged and report `ACCOMPLISHMENT_ASSET_ASSIGNMENT_NOT_FOUND`.
- Do not deploy independently while another agent owns overlapping landing-page work.

Collision result:

- `public/one-time/index.html` and `public/assets/one-time` had no local landing diff before this addendum.
- The ChatGPT dropoff control tower had no ready packet; the earlier launch-priority packet was terminal.
- No active Accomplishment card image assignment was found in the current landing HTML, asset manifest, prompt packets, or landing task files.
- The Norfolk source initially was not present during search, then the operator provided the exact file at `C:\Users\User\Downloads\Norfolk, Virginia.jpg`; it was imported after visual inspection.
- The operator later provided `C:\Users\User\Downloads\Lakewood 3.jpg` for the Accomplishment card; it was imported after confirming no prior active Accomplishment image assignment existed.
- Latest operator crop correction: Clarity must show the Rabbi's full face/head and the slide display behind him; Excitement should avoid the bottom-right chair/gap and show more of the full group of boys.
- Latest operator hero/topbar/text follow-up:
  - Use `C:\Users\User\Downloads\WhatsApp Image 2026-07-13 at 14.37.22.jpeg` as a faded/masked hero background using the page's current black/yellow/ice-blue colors.
  - Incorporate the top toolbar corrections, including switching the One Time lockup back into black and keeping the page consistent.
  - Re-check the landing text changes because people are about to start signing up.
