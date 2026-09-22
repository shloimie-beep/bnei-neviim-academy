# Transcript And Drive Intake Policy

## Source Of Truth

Raw class recording bodies and full transcript text belong in private storage:

- private app database transcript fields;
- private Google Drive transcript library;
- local untracked audit workspaces when needed for a specific review.

GitHub is the agent memory layer. It should store privacy-safe digests,
manifests, indexes, categories, parse gaps, and dry-run repair plans, not full
transcript bodies.

## Repo-Safe Digest Memory

Repo artifacts may include:

- stable content job/source labels;
- redacted Drive source refs and hashes;
- transcript character counts;
- generated titles;
- parser and parse-run status;
- category and section routing metadata;
- class/session linkage;
- task candidates;
- student-question candidate refs and match status;
- private-review flags and pointers;
- repair candidates and parse gaps;
- dry-run Drive transcript library plans.

Repo artifacts must not include raw transcript text, raw private student
phrasing, raw Drive file IDs, contact data, secrets, or private meeting bodies.

## Processed Definition

A recording is processed only when it has all of these fields or an explicit
blocker:

- source discovered;
- stable source ID;
- generated title;
- transcript status;
- parser status;
- category classification;
- digest;
- class/task/question/student/private/content routing;
- privacy classification;
- repo digest/index export when safe;
- private Drive/app raw transcript pointer when available;
- repair or blocker status when incomplete.

`Raw transcript hidden somewhere` is not a complete outcome. The system must
produce structured routing that agents can use safely.

## Commands

Use repo-safe digest export by default:

```powershell
npm run content:export-digests -- --privacy-scan
```

The legacy raw transcript exporter is intentionally blocked unless
`--include-raw-transcript` is supplied. Stale deletion is also no longer
default; it requires `--delete-stale`.

Do not run raw-body export, Drive writes, production DB mutations, paid
retranscription, worker retries, or class backfill unless a current active
requirement and explicit owner approval authorize that exact action.
