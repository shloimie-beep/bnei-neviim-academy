# Class/Drive Intake Pipeline Census

Generated: 2026-06-24T19:27:27.585Z
No production mutation: true

## Summary

- Inspected rows: 150
- Content jobs: 75
- Drive orphans: 75
- Missing canonical writes: 1
- Student ambiguity/review rows: 0

## Suspected Causes

| Cause | Status | Evidence |
| --- | --- | --- |
| openai_transcription_401_invalid_api_key | CONFIRMED | 401/invalid_api_key appears in inspected state. |
| drive_target_not_configured | DISPROVED | 21 Drive folder(s) detected. |
| drive_auth_path_mismatch | DISPROVED | Canonical auth path is oauth_refresh_token. |
| files_uploaded_but_no_job_created | CONFIRMED | Drive orphan(s) found. |
| jobs_queued_but_no_worker | UNKNOWN | Queued/stuck/worker language needs log confirmation. |
| transcript_exists_but_parser_never_ran | CONFIRMED | Transcript exists without parser metadata/output. |
| parser_output_exists_but_apply_step_did_not_run | CONFIRMED | 1 structured row(s) lack canonical writes. |
| student_alias_name_mismatch | DISPROVED | No name/alias mismatch found. |
| ambiguous_names_auto_linked_incorrectly | DISPROVED | No ambiguous matches found. |
| scores_written_to_wrong_table | DISPROVED | No missing inspected progress rows. |
| questions_written_but_not_linked | DISPROVED | No orphan question write found. |
| accountability_omitted | DISPROVED | No missing accountability candidate found. |
| duplicates_suppressing_valid_retry | UNKNOWN | Duplicate source fingerprints exist. |
| generic_ramble_parser_used_instead_of_class_parser | CONFIRMED | 18 row(s) use canonical-intake-parser. |
| local_fix_not_deployed | UNKNOWN | This lane did not compare production revisions. |
| stale_job_status_masking_completed_output | CONFIRMED | 39 row(s) have in-progress status with output. |

## Job Rows

| Kind | Job | Status | Transcript | Parser | Canonical Writes | Retry/Dedup |
| --- | ---: | --- | ---: | --- | --- | --- |
| content_job | 2 | needs_approval/05 WhatsApp Ready | 14302 |  | UNKNOWN | CONFIRMED |
| content_job | 4 | transcribed/06 Newsletter Candidates | 53319 |  | CONFIRMED | CONFIRMED |
| content_job | 5 | needs_approval/05 WhatsApp Ready | 2464 |  | CONFIRMED | CONFIRMED |
| content_job | 6 | needs_approval/05 WhatsApp Ready | 2454 |  | CONFIRMED | CONFIRMED |
| content_job | 7 | needs_approval/05 WhatsApp Ready | 50827 |  | CONFIRMED | CONFIRMED |
| content_job | 8 | needs_approval/05 WhatsApp Ready | 37268 |  | CONFIRMED | CONFIRMED |
| content_job | 9 | needs_approval/05 WhatsApp Ready | 14827 |  | CONFIRMED | CONFIRMED |
| content_job | 10 | archived/ | 152 |  | CONFIRMED | CONFIRMED |
| content_job | 11 | archived/ | 152 |  | CONFIRMED | NEEDS_REVIEW |
| content_job | 12 | archived/ | 152 |  | UNKNOWN | NEEDS_REVIEW |
| content_job | 13 | archived/ | 152 |  | CONFIRMED | NEEDS_REVIEW |
| content_job | 14 | archived/ | 152 |  | CONFIRMED | NEEDS_REVIEW |
| content_job | 16 | archived/ | 89 |  | CONFIRMED | CONFIRMED |
| content_job | 17 | archived/ | 89 |  | CONFIRMED | CONFIRMED |
| content_job | 18 | archived/05 WhatsApp Ready | 66752 |  | MISSING | CONFIRMED |
| content_job | 19 | archived/04 Parsed | 68514 |  | CONFIRMED | CONFIRMED |
| content_job | 20 | archived/04 Parsed | 58246 |  | CONFIRMED | CONFIRMED |
| content_job | 21 | needs_approval/04 Parsed | 8568 |  | CONFIRMED | CONFIRMED |
| content_job | 22 | transcribed/ | 15 |  | UNKNOWN | CONFIRMED |
| content_job | 23 | archived/04 Parsed | 77 |  | UNKNOWN | CONFIRMED |
| content_job | 24 | transcribed/04 Parsed | 99 |  | UNKNOWN | CONFIRMED |
| content_job | 25 | needs_approval/04 Parsed | 58244 |  | CONFIRMED | CONFIRMED |
| content_job | 26 | needs_approval/04 Parsed | 71944 |  | CONFIRMED | CONFIRMED |
| content_job | 27 | transcribed/ | 108 | canonical-intake-parser | CONFIRMED | CONFIRMED |
| content_job | 28 | transcribed/04 Parsed | 1169 |  | UNKNOWN | CONFIRMED |
| content_job | 29 | needs_approval/ | 853 |  | UNKNOWN | CONFIRMED |
| content_job | 30 | needs_approval/04 Parsed | 29040 |  | CONFIRMED | CONFIRMED |
| content_job | 31 | needs_approval/04 Parsed | 52560 |  | CONFIRMED | CONFIRMED |
| content_job | 32 | transcribed/03 Transcribed | 6395 |  | CONFIRMED | CONFIRMED |
| content_job | 33 | transcribed/03 Transcribed | 6140 |  | CONFIRMED | CONFIRMED |
| content_job | 34 | transcribed/03 Transcribed | 5843 |  | CONFIRMED | CONFIRMED |
| content_job | 35 | transcribed/03 Transcribed | 803 |  | CONFIRMED | CONFIRMED |
| content_job | 36 | transcribed/03 Transcribed | 7350 |  | CONFIRMED | CONFIRMED |
| content_job | 37 | transcribed/03 Transcribed | 5157 |  | CONFIRMED | CONFIRMED |
| content_job | 38 | transcribed/03 Transcribed | 6332 |  | CONFIRMED | CONFIRMED |
| content_job | 39 | transcribed/03 Transcribed | 2089 |  | CONFIRMED | CONFIRMED |
| content_job | 40 | transcribed/03 Transcribed | 2540 |  | CONFIRMED | CONFIRMED |
| content_job | 41 | transcribed/03 Transcribed | 5670 |  | CONFIRMED | CONFIRMED |
| content_job | 42 | transcribed/03 Transcribed | 3374 |  | CONFIRMED | CONFIRMED |
| content_job | 43 | transcribed/03 Transcribed | 5697 |  | CONFIRMED | CONFIRMED |
| content_job | 44 | transcribed/03 Transcribed | 3815 |  | CONFIRMED | CONFIRMED |
| content_job | 45 | transcribed/03 Transcribed | 4141 |  | CONFIRMED | CONFIRMED |
| content_job | 46 | transcribed/03 Transcribed | 3722 |  | CONFIRMED | CONFIRMED |
| content_job | 47 | transcribed/03 Transcribed | 4917 |  | CONFIRMED | CONFIRMED |
| content_job | 48 | transcribed/03 Transcribed | 1205 |  | CONFIRMED | CONFIRMED |
| content_job | 49 | transcribed/03 Transcribed | 1913 |  | CONFIRMED | CONFIRMED |
| content_job | 50 | transcribed/03 Transcribed | 1117 |  | CONFIRMED | CONFIRMED |
| content_job | 51 | transcribed/03 Transcribed | 1908 |  | CONFIRMED | CONFIRMED |
| content_job | 52 | transcribed/03 Transcribed | 5241 |  | CONFIRMED | CONFIRMED |
| content_job | 53 | transcribed/03 Transcribed | 1784 |  | CONFIRMED | CONFIRMED |
| content_job | 54 | transcribed/03 Transcribed | 7540 |  | CONFIRMED | CONFIRMED |
| content_job | 56 | needs_approval/04 Parsed | 105867 |  | CONFIRMED | CONFIRMED |
| content_job | 57 | needs_approval/04 Parsed | 35521 |  | CONFIRMED | CONFIRMED |
| content_job | 58 | needs_approval/04 Parsed | 55809 |  | CONFIRMED | CONFIRMED |
| content_job | 59 | needs_approval/04 Parsed | 5481 |  | CONFIRMED | CONFIRMED |
| content_job | 62 | ingested/02 Ingesting | 0 |  | UNKNOWN | CONFIRMED |
| content_job | 63 | ingested/02 Ingesting | 0 |  | UNKNOWN | CONFIRMED |
| content_job | 64 | archived/04 Parsed | 63148 | canonical-intake-parser | CONFIRMED | CONFIRMED |
| content_job | 65 | transcribed/04 Parsed | 77245 | canonical-intake-parser | CONFIRMED | CONFIRMED |
| content_job | 66 | archived/04 Parsed | 40257 | canonical-intake-parser | CONFIRMED | CONFIRMED |
| content_job | 67 | transcribed/04 Parsed | 55731 | canonical-intake-parser | CONFIRMED | CONFIRMED |
| content_job | 68 | transcribed/04 Parsed | 64715 | canonical-intake-parser | CONFIRMED | CONFIRMED |
| content_job | 69 | transcribed/04 Parsed | 23859 | canonical-intake-parser | CONFIRMED | CONFIRMED |
| content_job | 70 | transcribed/04 Parsed | 24519 | canonical-intake-parser | CONFIRMED | CONFIRMED |
| content_job | 71 | transcribed/04 Parsed | 751 |  | UNKNOWN | CONFIRMED |
| content_job | 72 | transcribed/04 Parsed | 5505 | canonical-intake-parser | CONFIRMED | CONFIRMED |
| content_job | 73 | transcribed/04 Parsed | 32048 | canonical-intake-parser | CONFIRMED | CONFIRMED |
| content_job | 74 | transcribed/04 Parsed | 33459 | canonical-intake-parser | CONFIRMED | CONFIRMED |
| content_job | 75 | transcribed/04 Parsed | 41580 | canonical-intake-parser | CONFIRMED | CONFIRMED |
| content_job | 76 | transcribed/04 Parsed | 5456 | canonical-intake-parser | CONFIRMED | CONFIRMED |
| content_job | 77 | transcribed/04 Parsed | 19941 | canonical-intake-parser | CONFIRMED | CONFIRMED |
| content_job | 78 | transcribed/04 Parsed | 77315 | canonical-intake-parser | CONFIRMED | CONFIRMED |
| content_job | 79 | transcribed/04 Parsed | 70420 | canonical-intake-parser | CONFIRMED | CONFIRMED |
| content_job | 80 | transcribed/04 Parsed | 56556 | canonical-intake-parser | CONFIRMED | CONFIRMED |
| content_job | 81 | transcribed/03 Transcribed | 79807 | canonical-intake-parser | CONFIRMED | CONFIRMED |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_ROOT_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_SIMPLIFIED_APPROVED_ASSETS_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_SIMPLIFIED_APPROVED_ASSETS_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_SIMPLIFIED_APPROVED_ASSETS_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_SIMPLIFIED_LEGACY_ARCHIVE_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_SIMPLIFIED_LEGACY_ARCHIVE_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_SIMPLIFIED_LEGACY_ARCHIVE_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_SIMPLIFIED_LEGACY_ARCHIVE_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_SIMPLIFIED_LEGACY_ARCHIVE_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_SIMPLIFIED_LEGACY_ARCHIVE_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_SIMPLIFIED_LEGACY_ARCHIVE_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_SIMPLIFIED_LEGACY_ARCHIVE_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_STAGE_09_BRAND_KIT_SUGGESTIONS_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_STAGE_09_BRAND_KIT_SUGGESTIONS_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_STAGE_09_BRAND_KIT_SUGGESTIONS_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_STAGE_09_BRAND_KIT_SUGGESTIONS_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_STAGE_09_BRAND_KIT_SUGGESTIONS_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_STAGE_09_BRAND_KIT_SUGGESTIONS_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_STAGE_09_BRAND_KIT_SUGGESTIONS_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_STAGE_09_BRAND_KIT_SUGGESTIONS_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_STAGE_10_APPROVED_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_STAGE_10_APPROVED_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_STAGE_10_APPROVED_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_STAGE_11_PUBLISHED_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_STAGE_11_PUBLISHED_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
| drive_orphan |  | orphan_drive_file/BNA_DRIVE_STAGE_11_PUBLISHED_FOLDER_ID | 0 |  | UNKNOWN | UNKNOWN |
