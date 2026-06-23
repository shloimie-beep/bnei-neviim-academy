# Drive Mapping

The Google Drive `BNA V2` structure should mirror this logic:

- `01 Raw Intake`: raw files from phone/browser
- `02 Ingesting`: files currently being processed
- `03 Transcribed`: transcript artifacts
- `04 Parsed`: parsed notes/tasks/student/content data
- `05 WhatsApp Ready`: WhatsApp-ready videos and copy
- `06 Newsletter Candidates`: weekly update material
- `07 Social Candidates`: Facebook/YouTube/Google drafts
- `08 Blog Candidates`: future blog material
- `09 Brand Kit Suggestions`: possible improvements to the brand kit
- `10 Approved`: approved outputs that can become future examples
- `11 Published`: published/sent outputs
- `99 Failed`: failed or blocked processing

The simplified live Drive layout also includes:

- `00 Upload Here - Raw Media Intake`: operator upload folder for recordings,
  videos, audio, and raw files
- `00 Upload Here - Website Images`: operator upload folder for website/blog
  images
- `20 Processed Recordings - Source Media`: processed source recordings/videos
- `30 Approved Website Assets`: approved public website image assets
- `40 Content Library - Marketing`: readable Google Docs mirror for real
  content transcripts and website articles
`40 Content Library - Marketing` is intentionally a browseable marketing mirror,
not the working database. Transcript Google Docs are generated from the live app
database by `npm run content:sync-drive-library`; each transcript doc includes
metadata, source links, a clean subject breakdown, and the raw transcript.

Separate project roots:

- `My Drive / One Time Mishnah Class - Rabbi Elie Scheller`: separate Rabbi
  Elie / One Time partnership workspace for proposals, project maps,
  provider/community setup, content/media intake, launch material,
  finance/admin notes, shiur materials, and drafting-agent tasks. Keep this
  distinct from the BNA Academy media pipeline and use
  `ops/one-time-mishnah-class/` for the repo report.

The important rule: generated content should read brand-kit and platform memory
before drafting. Approved content should feed back into examples.
