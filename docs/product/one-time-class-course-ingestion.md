# One Time Class And Course Ingestion

Status: local beta contract
Run: `ops/execution-runs/2026-06-19-onetime-local-beta-hardening/`

## Canonical Sources

One Time class/course ingestion accepts these local-beta source types:

- Zoom recording
- Vimeo asset
- approved drop-folder video

No large video file should be duplicated unnecessarily. The application
database owns canonical metadata, permissions, progress, and relationships.

## Canonical Flow

1. source fingerprint
2. transcript
3. speaker/participant mapping
4. class session
5. attendance/minutes
6. class summary
7. topics/questions/answers
8. course/module/lesson placement
9. video asset/reference
10. worksheet/resource suggestions
11. role-scoped parent/student/provider updates
12. approval
13. publish

Every stage must be idempotent and auditable.

## Natural-Language Commands

The system should support commands equivalent to:

- Make this the next lesson in Course X.
- Create a new course from these four videos.
- Use this as Module 2.
- Turn the transcript into a worksheet.
- Publish the summary to parents.
- Give each student their own progress update.
- Do not publish this yet.
- Regenerate the lesson with the new class prompt.

Buttons may exist for common actions, but natural language remains primary.

## Course Builder Scope

Required local flows:

- create course
- add/reorder modules
- add/reorder lessons
- attach video
- attach worksheet/resource
- preview as parent/student
- draft/publish/archive
- enroll user/class
- set completion rule
- show progress
- regenerate transcript-derived content
- edit class-level and student-level prompts

Code contract: `buildOneTimeClassIngestionContract()` in
`src/platform/instances/one-time.js`.

Local preview builder:
`src/platform/ingestion/one-time-class-course-builder.js`.

## Local Acceptance

- `buildOneTimeClassCourseIngestionPreview()` produces preview-only course,
  module, lesson, class-session, video-reference, worksheet/resource, role
  update, decision, task, and review-item drafts from natural language.
- Preview artifacts preserve raw/source provenance, source fingerprint,
  workspace/project scope, and idempotent draft IDs.
- Ambiguous or incomplete commands stay reviewable instead of publishing,
  sending, uploading, or writing to external services.
- `tests/one-time-class-course-ingestion.test.js` verifies rich command
  drafting, ambiguous command review behavior, and idempotent reruns.
