# Owner Walkthrough - Clean Slate Acceptance

Generated: 2026-06-24T20:41:31+03:00

Use this as the owner review map after the clean-slate acceptance handoff.
Private Operations links require the appropriate login. Public links must be
anonymous-safe.

| Page | Live link | Role | What it is | Click | Healthy state | Disabled or preview-only | Report defect |
|---|---|---|---|---|---|---|---|
| Public homepage | https://bneineviimacademy.org/ | Public | Anonymous BNA school homepage | Open the page and scan top navigation and assistant | Loads public copy without parent/student/provider/Operations data | Public helper stays anonymous and scoped | Create a Task/Decision in Operations or send a Codex ramble with the route and screenshot path |
| Service provider directory | https://bneineviimacademy.org/service-providers | Public | Public provider index | Open provider cards and join CTA | Public provider listings only; no private provider records | Provider onboarding actions are gated | Report route `/service-providers` plus card/CTA name |
| One Time | https://bneineviimacademy.org/rabbi-member | Member or public entry | One Time member entry/library shell | Use member entry or support/questions forms after login | Logged-out view stays safe; member view shows only own member/class scope | Payment/access/class links remain guarded by test/readiness gates | Report route `/rabbi-member` and role used |
| Operations login | https://bneineviimacademy.org/operations-login.html?returnTo=%2Foperations | Super-admin | Private BNA Operations entry | Log in, then continue to Operations | Anonymous users see login only; authenticated super-admin sees Operations | None; private routes reject anonymous access | Report login status and target route |
| Provider login | https://bneineviimacademy.org/provider/login | Provider | Provider portal entry | Log in or request access | Logged-out view is safe provider login/join entry | Provider writes are scoped and guarded | Report provider identity and route |
| Parent login | https://bneineviimacademy.org/parent/login | Parent | Parent portal login/continue screen | Continue or switch parent account | Shows login/continue without silently exposing private parent data | Parent sees only own family/student data after login | Report parent route and expected child |
| Student login | https://bneineviimacademy.org/student/login | Student | Student portal login shell | Enter student access/login | Logged-out view exposes no private student data | Student helper remains student-safe | Report student route and access path, not credentials |
| Rabbi Scheller workspace | https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class | Super-admin or Rabbi provider admin | Scoped Operations workspace for Rabbi Scheller / One Time | Confirm workspace strip shows One Time/Rabbi scope | Data is scoped to Rabbi/One Time and does not show platform-only BNA data | Provider writes remain guarded by role and approval gates | Report workspace/project query and role |
| Rabbi Scheller students | https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=students | Super-admin or Rabbi provider admin | One Time student/contact roster | Open Contacts, Students | Shows scoped students/participants only | No cross-workspace student data | Report student list scope issue, no private bodies |
| Rabbi Scheller classes | https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=schedule | Super-admin or Rabbi provider admin | Provider schedule/class planning | Open Service Providers, Schedule | Class/session surfaces stay One Time scoped | Publishing/member access remains approval-gated | Report class/session ID and route |
| Questions | https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=questions | Super-admin or Rabbi provider admin | Private questions/review queue | Open Contacts, Questions | Questions remain private-first and moderated | Public/member Q&A publishing is approval-gated | Report question ID only, not raw private text |
| Provider API usage | https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=api_usage&section=provider | Super-admin or provider admin | Provider/API usage dashboard | Open API / Bots, Provider | Usage/errors are scoped to workspace/provider | Budgets/settings are controlled by role | Report API section and timestamp |
| Integrations/setup center | https://bneineviimacademy.org/integration-setup.html | Owner | Credential-safe setup center | Open setup cards | Shows readiness and safe next actions without secrets | External writes, sends, uploads, DNS, charges, and credential copies remain disabled unless approved | Report setup card and readiness label |
| Decisions | https://bneineviimacademy.org/operations?view=tasks&section=decisions | Super-admin | Human/external blockers | Open Tasks, Decisions | Real owner decisions appear here; Codex work is not disguised as a Decision | Decisions stay until owner/external input resolves them | Report Decision ID and missing action |
| Tasks / Agent Work | https://bneineviimacademy.org/operations?view=tasks&section=codex_queue | Super-admin | Machine-owned work and agent status | Open Tasks, Codex / Agent Work | Active Codex-executable work appears here; completed work moves out of active queue | Blocked human/external choices stay in Decisions/Pending | Report task ID and expected owner |
| Class-intake diagnostics | https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=content&section=classes | Super-admin or Rabbi provider admin | Read-only class/session/content intake review | Open Content, Classes | Shows class/session/intake status without applying backfill | `REQ-20260624-028` remains blocked; no production backfill apply is approved | Use GitHub issue #18 for backfill evidence |
| Support | https://bneineviimacademy.org/rabbi-member | Member or support reviewer | One Time support ticket entry/review path | Member submits support after login; admin reviews in Operations | Support is member-scoped and private | No external send unless explicitly approved | Report ticket ID only |
| Release evidence | https://github.com/shloimie-beep/bnei-neviim-academy/pull/16 | GitHub | Final release PR evidence | Open PR #16 and linked commits | PR #16 is merged; final closeout commits exist on master | `REQ-20260624-028` remains open in issue #18 | Use PR #16 or issue #18 comments for evidence updates |

## Role Distinction

- Platform super-admin views can see cross-workspace Operations controls,
  global readiness, Decisions, task/agent queues, release evidence, and setup
  center state.
- Rabbi Scheller provider views must stay scoped to
  `workspace=rabbi_sheller_provider` and `project=one_time_mishnah_class`.
  They should not expose unrelated BNA school, parent, student, provider, or
  platform-only records.
- Public, parent, student, provider, and member pages must reject or hide
  private cross-scope data when logged out or logged in with the wrong role.
