# Student Goal Board, Classroom Assignments, And Consequence Rules

Date: 2026-06-05
Task: #65, implemented by agent-fleet task #108
Status: Student Goal Board MVP implemented and deployed; Google Classroom API posting and real consequence/device enforcement remain future blocked layers

## Boundary

The Student Goal Board MVP has been built. Keep this brief as the future design
map for Google Classroom assignment posting and parent/admin-approved
consequence/device rules.

The operator chose the student Goal Board as the base. Google Classroom
assignments and natural consequence/device rules should still be designed as
connected layers, not separate apps.

## Product Goal

Create a mobile-first student accountability surface that feels like a clean
task manager, not a full-day schedule.

The top of each student page is a school-tracked Torah/morning learning section
that the student cannot edit. Below that is the student's own Goal Board for
self-owned goals, optional assigned learning, and check-ins.

Google Classroom assignments from YouTube links should appear as Goal Board
items. Natural consequences should be private accountability agreements that can
lead to device access changes only after parent/admin approval.

## Recommendation

Build Option A first: Goal Board with optional time display.

This keeps the student page simple enough for mobile while still allowing due
dates, urgency, and specific assignment windows when needed. Avoid a full daily
calendar as the default view.

## Student Goal Board UX

### Top Section: School-Tracked Learning

- Read-only for the student.
- Shows the student's name and an English/Hebrew toggle.
- Shows Torah trip progress and the current morning learning goal.
- Use compact progress circles or rings for:
  - cumulative 30-unit trip progress
  - today's school-tracked completion
  - current morning goal status
- Do not expose private minutes, goal type, raw listening/inside data, or admin
  notes.
- Student can see progress, but cannot edit this section.

### Student-Owned Goal Area

- Main filters: Today, Upcoming, Waiting, Done.
- Goal card fields:
  - title
  - category
  - urgency
  - optional due date/time
  - source: Self, Admin, Classroom, Private Meeting
  - progress: Not Yet, Half, Done, or numeric percent later
  - optional reflection/check-in note
- Goal card expansion can show:
  - smaller checklist items if needed
  - linked Classroom assignment
  - private agreement/consequence status if one exists
  - recovery path if the item is overdue
- Student create flow:
  - add goal title
  - pick urgency
  - optional category
  - optional due/time
  - optional target value/unit
  - submit immediately for student-owned goals or send to review if the goal
    affects device access/consequences

### Design Options

- Goal Board: recommended. Clean task-manager layout, goal-first, mobile-first.
- Schedule Lite: optional times inside goal cards, no full calendar grid.
- Accountability Journal: useful for private meeting review/admin screens, not
  the main student daily surface.

## Admin And Parent Surfaces

Operations Students should become the command center for:

- creating/admin-editing school-tracked Torah goals
- creating student Goal Board items
- approving student-created goals when approval is required
- creating Classroom assignments from YouTube links
- reviewing private accountability agreements
- approving, denying, rescheduling, or overriding consequences
- seeing device access state and session history once the device module exists

Private meeting notes should be able to create or update accountability
agreements, but raw private meeting notes should not be visible on the student
Goal Board unless explicitly summarized for the student.

## Google Classroom Assignment Builder

Official Google Classroom docs confirm that `CourseWork` supports assignments,
short answer questions, and multiple-choice questions; can include YouTube
materials; and supports `dueDate`/`dueTime` in UTC. Creating/modifying
CourseWork requires an authorized teacher/project context.

Reference docs:

- https://developers.google.com/workspace/classroom/guides/manage-coursework
- https://developers.google.com/workspace/classroom/reference/rest/v1/courses.courseWork
- https://developers.google.com/workspace/classroom/guides/key-concepts/api-structure

### Admin Workflow

1. Paste a YouTube link.
2. Choose a student, multiple students, or a Classroom course.
3. Set due date/time.
4. Choose assignment type:
   - watch/respond assignment
   - short answer question
   - multiple-choice question
5. Let AI draft:
   - title
   - instructions
   - optional question(s)
   - optional answer choices
6. Preview before posting.
7. Create as a local BNA assignment draft first.
8. Post to Google Classroom only after admin approval.
9. Store Classroom IDs and alternate link.
10. Mirror the assignment into the student's Goal Board.
11. Sync completion/submission state back into BNA when available.

### First Build Shape

Start with a draft-first flow. Do not silently publish an assignment from a raw
Telegram message.

The local BNA record should exist before the Classroom API call. If the
Classroom API call fails, the draft remains available for retry.

## Consequence And Device Rules

Natural consequences are private agreements, not automatic punishments.

### Agreement Flow

1. Student and operator discuss the agreement in a private meeting.
2. The consequence is written in clear language.
3. The recovery path is written at the same time.
4. Parent/admin approves the agreement before it becomes active.
5. The agreement may be linked to:
   - one Goal Board item
   - a Classroom assignment
   - a recurring accountability goal
   - a broader private agreement such as Wake Up On Time

### Missed Goal Flow

1. Goal or assignment becomes overdue or is marked missed.
2. System creates a pending consequence review.
3. Parent/admin chooses:
   - apply consequence
   - reschedule/defer
   - override
   - request student reflection
   - mark complete based on offline evidence
4. Device control only happens after this approval.
5. Student sees the next recovery step, not a shaming message.

### Device Boundary

QStudio remains the app/category/content filtering layer. BNA should only
control access states through the future device module:

- Locked
- Accountability Only
- Approved Access
- Expired
- Manual Override

Device controls must not be triggered silently by Classroom status alone. The
first implementation should use a mock provider until Headwind MDM or FreeKiosk
control is verified on a real tablet.

Use the related device-control checklist:

- `tasks-pending/2026-06-05-qstudio-device-control-checklist.md`

## Suggested Data Model

Do not rely on the legacy family-app `goals` and `goal_consequences` tables as
the BNA production model. They are useful references only. The current BNA
system uses `bna_students`, `bna_torah_learning_*`, and
`bna_accountability_events` with `event_type = 'student_goal'`; that is enough
for the current checkoff page, but the Goal Board should get structured tables
when it becomes a core product surface.

Suggested future tables:

- `bna_goal_board_items`
  - student_id
  - source: self, admin, classroom, private_meeting
  - title, description, category
  - status: active, waiting, done, overdue, archived
  - urgency
  - due_at
  - optional_scheduled_at
  - target_value, target_unit, progress_percent
  - student_owned boolean
  - school_tracked boolean
  - classroom_assignment_id nullable
  - created_by, approved_by, approved_at
  - metadata
- `bna_goal_board_checkins`
  - item_id, student_id
  - progress_percent
  - reflection
  - submitted_at
  - approved_by nullable
- `bna_classroom_courses`
  - classroom_course_id
  - name, section, alternate_link
  - owner/teacher account metadata
- `bna_classroom_enrollments`
  - student_id
  - classroom_course_id
  - classroom_user_id/email
- `bna_classroom_assignments`
  - local item id
  - classroom_course_id
  - classroom_course_work_id
  - youtube_url
  - work_type
  - due_at
  - state: draft, posted, failed, archived
  - alternate_link
  - generated_prompt/output metadata
- `bna_accountability_agreements`
  - student_id
  - private_meeting_event_id nullable
  - agreement text
  - recovery path
  - approved_by_student, approved_by_parent, approved_by_admin
  - effective_at, expires_at
- `bna_consequence_rules`
  - agreement_id
  - goal_board_item_id nullable
  - trigger
  - consequence_type
  - device_access_state nullable
  - duration_minutes nullable
  - approval_required boolean default true
  - active boolean
- `bna_consequence_events`
  - rule_id
  - student_id
  - triggered_by item/assignment
  - status: pending_review, approved, denied, applied, overridden, resolved
  - approved_by, approved_at
  - override_reason
  - device_access_session_id nullable

## Implementation Order

1. Extend the student portal into the Goal Board.
   - Keep top Torah progress read-only.
   - Add mobile-first self-owned goals below.
   - Add English/Hebrew toggle.
   - Preserve private access-code security.
2. Add admin Goal Board controls in Operations Students.
   - Create/edit/archive items.
   - Review student-created items.
   - Keep private notes private.
3. Add Classroom assignment draft builder.
   - Course/student mapping.
   - YouTube link intake.
   - due date/time.
   - generated instructions/questions.
   - local draft and admin approval.
4. Add Classroom posting/sync.
   - Post approved drafts.
   - Store Google IDs/links.
   - Mirror assignment status into Goal Board.
5. Add private agreement and consequence approval UI.
   - Student proposal/private meeting source.
   - parent/admin approval queue.
   - recovery paths.
6. Add mock device provider.
   - No real lock/unlock yet.
   - Verify UI/status/event flow.
7. Add real device provider only after the QStudio/Headwind/FreeKiosk checklist
   is verified on test hardware.

## Acceptance Criteria For First Build

- On a 390px mobile viewport, the student page is not crowded.
- The school-tracked Torah section is visibly separate and read-only.
- The student can add and check off personal goals below the Torah section.
- Optional due time can appear without turning the page into a full schedule.
- English/Hebrew switching works for visible student UI text.
- Admin can create a Goal Board item for a student.
- A Classroom-sourced assignment can appear as a Goal Board item.
- A missed item creates a pending review, not an automatic device action.
- Consequence/device actions require parent/admin approval.
- A recovery path is always visible for an approved consequence.
- Public website progress still exposes only cumulative trip progress.

## Open Questions

- Should the permanent student surface remain `/student.html`, become a new app
  route, or become a PWA/kiosk wrapper?
- Which Google account is the teacher identity for Classroom writes?
- Are BNA students already mapped to Google Classroom user emails?
- Should each student have a separate Classroom course, or should BNA use group
  courses with per-student assignments?
- For YouTube plus questions, should the first version create a
  multiple-choice `CourseWork` item, a normal assignment with instructions, or
  a Google Form/quiz attachment later?
- Who counts as approval for a consequence: operator only, parent only, or
  either parent/admin?
- Can students create any goal immediately, or should only consequence/device
  connected goals require approval?
- What is the exact Hebrew wording for the student-facing Goal Board states?
