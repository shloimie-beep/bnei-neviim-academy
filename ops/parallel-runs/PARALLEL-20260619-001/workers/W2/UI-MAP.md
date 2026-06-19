# W2 UI Map

## Harness

- URL path: `/platform-ui/index.html`
- BNA fixture: `/platform-ui/index.html?workspace=bna`
- One Time fixture: `/platform-ui/index.html?workspace=one_time`
- Module deep link: `/platform-ui/index.html?workspace=bna&module=tasks`

## Shell

- Topbar: brand lockup, active workspace/role, workspace switcher, search.
- Left rail: grouped module navigation.
- Main pane: active module view.
- Right rail: recent UI event log.

## Navigation Groups

- Overview: Overview.
- People: Members, Students, Service Providers.
- Engagement: Community, Courses, Course Builder, Lesson Video,
  Content / Research.
- Operations: Tasks, Decisions, Calendar, Goals / Rewards, Prompt/Ramble Queue.
- System: Agents, Automations, Integrations, Settings.

## Workspace Visibility

BNA shows all W2 modules.

One Time shows:

- Overview
- Members
- Community
- Courses
- Course Builder
- Lesson Video
- Content / Research
- Tasks
- Decisions
- Calendar
- Goals / Rewards
- Agents
- Automations
- Integrations
- Settings

One Time hides:

- Students
- Service Providers
- Prompt/Ramble Queue

## Interactive Flows

- Add member/student: role/type, contact, workspace, access, validation,
  success toast, `membership.changed` event.
- Add community: name, description, visibility, owner/admin, group count,
  validation, `community.created` event.
- Add course: title, description, visibility, status, enrollment rule,
  validation, `course.created` event.
- Course builder: modules, lessons, ordering controls, preview command.
- Attach video: lesson, approved asset, privacy/visibility, transcript state,
  `lesson.video.attached` event.
- Rewards: reward catalog, assignment target, assigned/awarded/redeemed states,
  neutral wording, audit list, `ui.reward.opened` event.
- Integrations: readiness card, account, scopes, last check, redacted secret
  field, Test Connection, `integration.readiness.checked` event.
- Tasks: Meeting Agenda, My Next 30 Days, Codex Queue, Waiting / Blocked,
  Recently Completed, Prompt/Ramble Queue.
- Decisions: actual question, context, options, source.

## States

The fixture package includes ready, empty, loading, error, and success copy.
The current harness renders ready/empty/success states directly; backend
loading/error binding belongs to Prompt 05.
