# OpenAI Sidekick Smoke - 2026-06-05T11:33:00.151Z

Overall: PASS

## Checks

- PASS repo context files readable - 8 files found
- PASS transcript exports readable - 18 transcript files
- PASS protected app APIs readable - 10 endpoints returned
- PASS Drive folders readable - 7 folders read as office@bneineviimacademy.org
- PASS OpenAI returned expected active Codex task count - expected 6, got 6
- PASS OpenAI returned expected student names - 5 expected student(s)
- PASS OpenAI returned expected transcript job count - expected 18, got 18
- PASS OpenAI returned Drive raw folder name - 00 Upload Here - Raw Media Intake

## Expected

```json
{
  "active_codex_count": 6,
  "active_codex_ids": [
    81,
    72,
    67,
    65,
    49,
    43
  ],
  "student_names": [
    "Amitai Kosofsky",
    "Eitan Chaim Golombo",
    "Hillel Baraka",
    "Huda Weber",
    "Menachem Mendel Dratler"
  ],
  "torah_group_percentage": 16,
  "transcript_job_count": 18,
  "pending_payment_students": [
    "Hillel Baraka"
  ],
  "drive_raw_folder_name": "00 Upload Here - Raw Media Intake",
  "repo_transcript_export_count": 18
}
```

## OpenAI Returned

```json
{
  "active_codex_count": 6,
  "active_codex_ids": [
    81,
    72,
    67,
    65,
    49,
    43
  ],
  "student_names": [
    "Amitai Kosofsky",
    "Eitan Chaim Golombo",
    "Hillel Baraka",
    "Huda Weber",
    "Menachem Mendel Dratler"
  ],
  "torah_group_percentage": 16,
  "transcript_job_count": 18,
  "pending_payment_students": [
    "Hillel Baraka"
  ],
  "drive_raw_folder_name": "00 Upload Here - Raw Media Intake",
  "repo_transcript_export_count": 18
}
```

## Live Counts

```json
{
  "tasks_total": 84,
  "active_tasks": 6,
  "active_codex_tasks": 6,
  "students": 5,
  "transcript_jobs": 18,
  "pending_payment_students": 1,
  "drive_folders": 7
}
```
