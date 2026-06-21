# Batch Status

| Batch | Requirement | Status | Notes |
| --- | --- | --- | --- |
| 0 | REQ-20260619-300 | done | Successor run created and validation passed. |
| 1 | REQ-20260619-301 | done | Protocol, validator, schema, resume/next/source/blocker/stale-evidence behavior verified locally. |
| 2 | REQ-20260621-501 | done | Current master reconciliation refresh. |
| 3 | REQ-20260619-302 | done | Production cleanup applied; default Task/Decision views deployed and live-smoked. |
| 4 | REQ-20260619-303 | done | Workspace user and role model deployed and live-smoked. |
| 5 | REQ-20260621-502 | done | Visible action coverage deployed and live-smoked. |
| 6 | REQ-20260619-304 | done | Operations UI/design correction deployed and live-smoked. |
| 7 | REQ-20260621-503 | done | WhatsApp UX deployed and live-smoked without sends or external writes. |
| 8 | REQ-20260621-504 | done | Email and Resend UX deployed and live-smoked without sends. |
| 9 parent | REQ-20260619-306 | in_progress | Parent reopened as an umbrella for the revenue-launch/parser follow-up. Do not mark complete until child requirements 9A-9J are terminal. |
| 9A | REQ-20260621-901 | done | Source-envelope classifier and mixed-context parser routing deployed and live-smoked with a dry-run synthetic parse. |
| 9B | REQ-20260621-902 | blocked | Today's class-upload trace reached live source job #78, but transcription/parse is blocked by the hosted transcription credential returning `401 invalid_credential`; content-job notes were sanitized and focused smoke verified no parse run was created. |
| 9C | REQ-20260621-903 | done | Downloads spreadsheet inventory generated with redacted metadata/schema signals only: 203 files inventoried, 56 import candidates, no raw rows or private exports committed, no GHL runtime added. |
| 9D | REQ-20260621-904 | not_started | CRM import and deduplication. |
| 9E | REQ-20260621-905 | not_started | CRM Contacts UX. |
| 9F | REQ-20260621-906 | not_started | Warm-lead trial and referral configuration. |
| 9G | REQ-20260621-907 | not_started | Payment-to-access and class-link flow. |
| 9H | REQ-20260621-908 | not_started | Authenticated questions and support-ticket bot. |
| 9I | REQ-20260621-909 | not_started | Test identities and mock data. |
| 9J | REQ-20260621-910 | not_started | Agent Mode end-to-end acceptance. |
| 11 | REQ-20260619-308 | done | Manual Vimeo member-library workflow, disabled automated-upload readiness, and recording/publication states deployed and live-smoked. |
| 12 | REQ-20260619-307 | done | Zoom and attendance foundation deployed and live-smoked without creating meetings, registrants, attendance writes, recording reads, transcript reads, summary reads, sends, or portal publishing. |
| 13 | REQ-20260619-308 | done | Recording/transcript/publication lifecycle and retention gates bundled with Batch 11 under the shared requirement. |
| 14 | REQ-20260619-309 | not_started | Transcript privacy. |
| 15 | REQ-20260619-310 | not_started | Gamification. |
| 16 | REQ-20260619-311 | not_started | Community. |
| 17 | REQ-20260619-312 | not_started | Sefaria/study assistant. |
| 18 | REQ-20260619-313 | needs_operator_decision | Separate paid infrastructure/DNS remains external. |
| 19 | REQ-20260619-314 | not_started | Final verification and release. |
