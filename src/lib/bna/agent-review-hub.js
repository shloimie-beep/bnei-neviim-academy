const AGENT_REVIEW_RUN = {
  agent_review_run_id: '2026-06-26-agent-review-dropoff-repair',
  raw_id: 'RAW-20260626-001',
  parent_goal_id: 'PARENT-20260626-001',
  linked_issue_raw_id: 'RAW-20260625-024',
  linked_issue_parent_goal_id: 'PARENT-20260625-024',
  requirement_ids: [
    'REQ-20260626-002',
    'REQ-20260626-003',
    'REQ-20260626-004',
    'REQ-20260626-005',
    'REQ-20260626-006',
    'REQ-20260626-007',
    'REQ-20260626-008',
  ],
  issue_url: 'https://github.com/shloimie-beep/bnei-neviim-academy/issues/24',
  hub_path: '/operations/agent-review',
  dropoff_path: '/operations/agent-review/dropoff',
  result_endpoint: '/api/bna/agent-review/results',
};

const AGENT_REVIEW_SESSION_TTL_MINUTES = 12;
const TASK_AGENT_MODE_RESULT_TIMEOUT_MS = 1000 * 60 * 45;
const TASK_AGENT_MODE_STATUSES = new Set([
  'not_started',
  'prompt_copied',
  'agent_running_or_pending',
  'agent_result_overdue',
  'result_saved',
  'blocked',
  'failed',
  'repair_created',
  'rerun_required',
  'completed',
]);

const AGENT_REVIEW_CONTEXTS = [
  {
    key: 'public_visitor',
    label: 'Public Visitor',
    role: 'anonymous_public',
    workspace_key: 'public',
    project_key: 'bna_public',
    target_route: '/',
    helper_surface: 'public website helper',
    context_type: 'synthetic_read_only',
    permitted_actions: ['browse public pages', 'ask public-safe helper questions', 'verify login/setup links'],
    prohibited_actions: ['view private records', 'create internal tasks', 'use Operations APIs'],
  },
  {
    key: 'one_time_public_landing',
    label: 'One Time Public Landing',
    role: 'anonymous_public',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    target_route: '/one-time',
    helper_surface: 'One Time public landing helper',
    context_type: 'synthetic_read_only',
    permitted_actions: ['review the public One Time landing page', 'test public-safe One Time helper answers', 'verify brand and English-only scope'],
    prohibited_actions: ['view BNA school records', 'submit real forms', 'send messages', 'create accounts', 'grant class access'],
  },
  {
    key: 'operations_super_admin',
    label: 'BNA Operations',
    role: 'super_admin',
    workspace_key: 'bna_platform',
    project_key: 'bna_school_platform',
    target_route: '/operations?view=tasks',
    helper_surface: 'Operations helper',
    context_type: 'owner_authenticated_live_read_only',
    permitted_actions: ['review tasks and evidence', 'test helper previews', 'submit review result'],
    prohibited_actions: ['deploy', 'send messages', 'charge cards', 'change credentials'],
  },
  {
    key: 'owner_task_decision',
    label: 'Owner Task / Decision',
    role: 'operator_with_agent_mode_assist',
    workspace_key: 'bna_platform',
    project_key: 'task_decision_queue',
    target_route: '/operations?view=tasks',
    helper_surface: 'Operations task or Decision card',
    context_type: 'owner_authenticated_task_decision',
    permitted_actions: ['read the visible card', 'verify UI state', 'prepare a recommendation', 'submit a redacted Agent Review result'],
    prohibited_actions: ['make final owner decisions', 'send messages', 'publish', 'charge cards', 'change credentials', 'apply class backfill'],
  },
  {
    key: 'rabbi_provider_admin',
    label: 'Rabbi Provider Admin',
    role: 'workspace_owner',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    target_route: '/provider.html?admin_provider=one-time&section=mailbox',
    helper_surface: 'provider/Rabbi workspace helper',
    context_type: 'fixture_read_only',
    permitted_actions: ['review One Time provider workspace', 'test provider helper', 'verify scoped links'],
    prohibited_actions: ['grant platform access', 'send WhatsApp/email', 'change billing'],
  },
  {
    key: 'provider_participant_staff',
    label: 'Provider Staff',
    role: 'provider_staff',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    target_route: '/provider-participant.html?review=one-time',
    helper_surface: 'provider participant helper',
    context_type: 'fixture_read_only',
    permitted_actions: ['review participant setup', 'test staff-safe support flow'],
    prohibited_actions: ['view owner billing', 'edit provider admin settings', 'access unrelated providers'],
  },
  {
    key: 'parent_qa_identity',
    label: 'Parent QA',
    role: 'parent',
    workspace_key: 'bna',
    project_key: 'bna_school_platform',
    target_route: '/parent?review=agent',
    helper_surface: 'parent helper',
    context_type: 'synthetic_read_only',
    permitted_actions: ['review parent portal shell', 'test parent-safe helper answers'],
    prohibited_actions: ['view unrelated families', 'see adult internal notes', 'change student records'],
  },
  {
    key: 'student_qa_identity',
    label: 'Student QA',
    role: 'student',
    workspace_key: 'bna',
    project_key: 'bna_school_platform',
    target_route: '/student?review=agent',
    helper_surface: 'student helper',
    context_type: 'synthetic_read_only',
    permitted_actions: ['review student-safe routes', 'test student helper boundaries'],
    prohibited_actions: ['see parent-only notes', 'access other students', 'change goals without permission'],
  },
  {
    key: 'one_time_member',
    label: 'One Time Member',
    role: 'member_parent',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    target_route: '/rabbi-member.html?review=one-time',
    helper_surface: 'One Time member helper',
    context_type: 'fixture_read_only',
    permitted_actions: ['review member library shell', 'test membership-safe helper responses'],
    prohibited_actions: ['access BNA school records', 'change membership tier', 'see private admin notes'],
  },
  {
    key: 'one_time_parent',
    label: 'One Time Parent',
    role: 'parent',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    target_route: '/parent.html?review=one-time',
    helper_surface: 'One Time parent review portal',
    context_type: 'fixture_read_only',
    permitted_actions: ['review parent schedule, library, trial/access, attendance, and support UI', 'test parent-safe navigation', 'verify no-password review link'],
    prohibited_actions: ['send real welcome email', 'create a real parent account', 'grant access', 'change billing', 'expose unrelated families'],
  },
  {
    key: 'one_time_student',
    label: 'One Time Student',
    role: 'student',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    target_route: '/student.html?review=one-time',
    helper_surface: 'One Time student review portal',
    context_type: 'fixture_read_only',
    permitted_actions: ['review student class, library, worksheet, attendance, and progress UI', 'test student-safe navigation', 'verify no-password review link'],
    prohibited_actions: ['view parent billing', 'change student credentials', 'access BNA school accountability goals', 'expose other students'],
  },
  {
    key: 'one_time_classroom',
    label: 'One Time Classroom',
    role: 'classroom_member',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    target_route: '/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS',
    helper_surface: 'One Time classroom helper',
    context_type: 'fixture_read_only',
    permitted_actions: ['review classroom/library', 'test question/support helper flow'],
    prohibited_actions: ['publish recordings', 'send notifications', 'expose raw recordings'],
  },
  {
    key: 'wrong_role_error_states',
    label: 'Wrong Role/Error States',
    role: 'negative_authorization_probe',
    workspace_key: 'mixed',
    project_key: 'mixed',
    target_route: '/operations/agent-review?negative=1',
    helper_surface: 'all helpers, negative cases',
    context_type: 'synthetic_error_probe',
    permitted_actions: ['verify 401/403 states', 'check safe fallbacks', 'record failures'],
    prohibited_actions: ['bypass auth', 'reuse tokens', 'mutate production records'],
  },
];

const AGENT_MODE_PROMPTS = [
  {
    key: 'public-login-setup',
    title: 'Public/Login/Setup Surfaces',
    context_keys: ['public_visitor', 'wrong_role_error_states'],
    requirement_id: 'REQ-20260626-005',
    focus: 'public pages, login paths, setup links, public helper safety, and logged-out behavior',
  },
  {
    key: 'operations-super-admin',
    title: 'Operations Super-Admin',
    context_keys: ['operations_super_admin'],
    requirement_id: 'REQ-20260626-004',
    focus: 'Operations helper, task/evidence lookup, safe preview actions, route landmarks, and owner-only controls',
  },
  {
    key: 'rabbi-provider-admin',
    title: 'Rabbi Scheller Provider Admin',
    context_keys: ['rabbi_provider_admin'],
    requirement_id: 'REQ-20260626-004',
    focus: 'One Time provider admin scope, provider helper links, payment/access previews, classroom setup, and no cross-workspace leakage',
    exact_navigation: [
      'Open /operations/agent-review?prompt=rabbi-provider-admin first. Confirm this prompt key is visible, click Start Audit / I started this agent mode, and open the drop-off page in a second tab before auditing.',
      'Open /operations. If login is required, use browser takeover so the owner types credentials directly. Do not ask for, store, screenshot, or repeat credentials.',
      'Confirm you are in BNA Operations / Super Admin, then find the workspace switcher in the side panel or top shell.',
      'Select the One Time / Rabbi workspace. Expected labels may include One Time, Rabbi / One Time, One Time Mishnah Class, rabbi_sheller_provider, or one_time_mishnah_class.',
      'If the workspace switcher is missing, confusing, or broken, record the failed click path, then use /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview as the fallback.',
      'Open Communications > Email. If visible, click Rabbi / One Time or View Rabbi / One Time Inbox and confirm the panel says Now Viewing: Rabbi / One Time Inbox or shows info@onetimeonetime.com. If the click path is not findable, use /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email as the fallback and record the failed visible path.',
      'Open Communications > WhatsApp. Confirm the WAPI readiness, inbound CRM logging, outbound send blocking, WhatsApp contact history, and missing-credential state are scoped to OneTime. If the click path is not findable, use /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=whatsapp as the fallback and record the failed visible path. Do not send a WhatsApp message.',
      'Click Open Rabbi Provider Portal. Confirm the resulting page is /provider.html?admin_provider=one-time&section=mailbox or an equivalent One Time provider route.',
      'In the provider/Rabbi route, inspect mailbox, contacts/CRM, class media, Communications > Email, Communications > WhatsApp, support, and dashboard areas. Rabbi view must be OneTime-branded, scoped to rabbi_sheller_provider / one_time_mishnah_class, and free of BNA Academy branding.',
      'Record every card that says configured/not configured, diagnostics, setup internals, or raw status. If Rabbi cannot click it and perform a role-appropriate action, mark it as Super Admin noise that must move out of Rabbi view.',
      'Click Student View, Parent/Member View, Classroom, and Library links if visible. Record whether each link opens the correct One Time route and whether the role boundary is clear.',
      'Open the real live One Time user entry routes after the visible click paths have been attempted: https://join.onetimeonetime.com/provider.html?admin_provider=one-time&section=mailbox, https://join.onetimeonetime.com/parent/login, https://join.onetimeonetime.com/student/login, and https://join.onetimeonetime.com/one-time-parent. Confirm these surfaces are OneTime-only, English-only where applicable, and do not flash BNA Academy reset/login branding, Hebrew/English toggle, classroom-code fallback, recovery-code fallback, or test labels.',
      'Open /provider.html?review=one-time, /parent.html?review=one-time, /student.html?review=one-time, /rabbi-member.html?review=one-time, and /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS only after the real login/provider routes and visible click paths have been attempted.',
      'Repeat reachable provider and role routes at 1440px, 1024px, 768px, 430px, and 390px. Check toolbar density, button alignment, side-panel behavior, top subcategory/filter placement, helper placement, and text wrapping.',
      'If any login, route, click path, helper, viewport, or drop-off step fails, immediately save BLOCKED through the Operations drop-off with exact step, expected result, observed result, partial findings, and smallest Codex-ready repair.',
    ],
    audit_checklist: [
      'PASS/FAIL for Super Admin to Rabbi provider navigation, Communications > Email inbox distinction, Communications > WhatsApp/WAPI readiness, provider mailbox/CRM visibility, real parent login, real student login, OneTime parent password setup, Student View, Parent/Member View, Classroom, Library, and return-to-Super-Admin path.',
      'List every Rabbi/provider screen that shows BNA Academy branding, Hebrew/English toggle, BNA colors/copy, unrelated BNA records, raw diagnostics, setup internals, or non-actionable configured/not-configured cards.',
      'Produce a route matrix with desktop 1440 and mobile 390/430 notes for spacing, toolbar density, filter placement, side-panel behavior, button consistency, role label, helper placement, and first useful content.',
      'Recommend the smallest implementation packets for Rabbi CRM/mailbox cleanup, non-actionable card removal, view-as navigation repair, and responsive toolbar/filter alignment.',
    ],
  },
  {
    key: 'provider-participant-staff',
    title: 'Provider Participant/Staff',
    context_keys: ['provider_participant_staff'],
    requirement_id: 'REQ-20260626-004',
    focus: 'provider participant portal, staff-safe helper behavior, support requests, and denied owner-only actions',
  },
  {
    key: 'rabbi-telegram-helper-ticket-smoke',
    title: 'Rabbi Telegram Helper Ticket Smoke',
    context_keys: ['operations_super_admin', 'rabbi_provider_admin', 'one_time_parent', 'one_time_student'],
    requirement_id: 'REQ-20260708-084',
    focus: 'Rabbi Telegram readiness, super-admin support ticket ding routing, Rabbi helper scope, OneTime communications scope, and autonomous drop-off behavior without live sends',
    exact_navigation: [
      'Open /operations/agent-review?prompt=rabbi-telegram-helper-ticket-smoke first. Confirm this prompt key is visible, click Start Audit / I started this agent mode, and open the drop-off page in a second tab before auditing.',
      'Open /operations. If login is required, use browser takeover so the owner types credentials directly. Do not ask for, store, screenshot, or repeat credentials.',
      'Confirm you are in BNA Operations / Super Admin. Use the workspace switcher to select One Time / Rabbi / One Time Mishnah Class. If the visible switcher is missing or confusing, record the failed path and then open /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=admin&section=tickets.',
      'Open Admin > Tickets or /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=admin&section=tickets. Confirm tickets are visible to Super Admin and the review owner is Shloimie/super-admin, not Rabbi as first responder.',
      'Create no real ticket unless the page explicitly exposes a safe review/test mode. If a safe test button exists, create a synthetic support ticket titled Agent Mode Rabbi ticket smoke using an @example.invalid identity, then verify it appears in Tickets and records a super-admin Telegram notification/readiness state. If no safe test mode exists, do not submit; inspect the UI and report BLOCKED with the missing safe-smoke action.',
      'Open Communications > Email or /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email. Confirm Rabbi/OneTime email is visibly separated from Shloimie/BNA email and no unrelated BNA inbox is shown as the active Rabbi inbox.',
      'Open Communications > WhatsApp or /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=whatsapp. Confirm WAPI/Rabbi communications are scoped to OneTime and outbound sends remain blocked unless explicitly approved. Do not send a WhatsApp message.',
      'Open /provider.html?admin_provider=one-time&section=mailbox or click Open Rabbi Provider Portal. Confirm Rabbi provider view shows communications/actions that Rabbi can actually use, and does not show random Super Admin configured/not-configured diagnostics without an action.',
      'Open the provider helper if visible. Ask: What messages need my attention? How do I see student questions? What is the Telegram bot status? The helper should answer in OneTime/Rabbi scope only and should not claim it sent Telegram, email, or WhatsApp.',
      'Open /parent.html?review=one-time and /student.html?review=one-time. Find the support/help flow. Do not submit a live support ticket unless a safe review/test mode is explicit. Verify the route makes clear that support tickets go to staff/super-admin review, while Rabbi class communications stay Rabbi-scoped.',
      'Open /operations/agent-review/dropoff with this prompt key if the tab is not already open. Save PASS, FAIL, or BLOCKED with exact routes, click path, screenshots/DOM notes if available, Telegram/readiness state, and smallest Codex-ready repair suggestions.',
      'If any route, login, helper, ticket flow, Telegram readiness check, or drop-off save fails, do not stop in chat. Save BLOCKED through the drop-off. If UI drop-off fails, POST to /api/bna/agent-review/results. Only end with OPERATIONS_DROPOFF_SAVED: AGR-... or OPERATIONS_DROPOFF_FAILED: ... with the full redacted payload.',
    ],
    audit_checklist: [
      'PASS/FAIL for Super Admin ticket visibility, ticket owner/routing to Shloimie, safe synthetic ticket path, Telegram ticket ding readiness, and no raw private ticket body in notification previews.',
      'PASS/FAIL for Rabbi Telegram readiness: Rabbi profile, Rabbi token present, TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER present/missing, OneTime ops credentials present/missing, runtime/startup status, and exact blocker.',
      'PASS/FAIL for Rabbi communications scope across Email, WhatsApp, provider mailbox, provider helper, parent support, and student support.',
      'List every place where Rabbi/helper views expose BNA data, unrelated inboxes, raw diagnostics, setup internals, tokens, chat IDs, or non-actionable configured/not-configured cards.',
      'Recommend Codex-ready repairs for missing safe-smoke buttons, missing Telegram readiness display, missing super-admin ticket ding state, wrong ticket owner routing, or drop-off failures.',
      'Confirm no live Telegram, email, WhatsApp, WAPI, Drive, payment, access grant, Zoom, Vimeo, or credential mutation was performed by Agent Mode.',
    ],
  },
  {
    key: 'parent-portal',
    title: 'Parent Portal',
    context_keys: ['parent_qa_identity'],
    requirement_id: 'REQ-20260626-004',
    focus: 'parent-safe navigation, child-only visibility, parent helper answers, setup flows, and wrong-family denial',
  },
  {
    key: 'student-portal',
    title: 'Student Portal',
    context_keys: ['student_qa_identity'],
    requirement_id: 'REQ-20260626-004',
    focus: 'student-safe dashboard, no adult/private notes, helper boundaries, assignments, progress, and denied cross-student access',
  },
  {
    key: 'one-time-member-library-classroom',
    title: 'One Time Member/Library/Classroom',
    context_keys: ['one_time_member', 'one_time_classroom'],
    requirement_id: 'REQ-20260626-004',
    focus: 'member library, classroom, question/support flow, fixture-only review data, and no raw recording exposure',
  },
  {
    key: 'one-time-parent-trial-journey',
    title: 'One Time Parent Trial Journey',
    context_keys: ['one_time_parent', 'one_time_classroom'],
    requirement_id: 'REQ-20260707-113',
    focus: 'no-password parent review journey, 30-day trial state, schedule/class link, library/resource access, student click/attendance visibility, billing/trial boundaries, and parent-safe support actions',
    exact_navigation: [
      'Open /operations/agent-review?prompt=one-time-parent-trial-journey first. Confirm this prompt key is visible, click Start Audit / I started this agent mode, and keep the drop-off page open.',
      'Open the live One Time host https://join.onetimeonetime.com/. Confirm it is OneTimeOneTime / One Time Mishnah Class, black/yellow scoped, English-only, and not BNA Academy.',
      'From the live host, attempt the visible parent/member login or access path first. Record whether a brand-new parent can understand how to set a password, reset a password, and enter the portal without seeing BNA Academy reset/login pages.',
      'Open /one-time-parent, /parent/login, and /parent.html?review=one-time as fallback routes only after checking the visible path. Flag any expired setup link, BNA Academy reset page, recovery code, classroom code, test label, or fallback password copy.',
      'Audit the parent route first viewport at 1440px, then repeat at 1024px, 768px, 430px, and 390px.',
      'Inspect the header/top section spacing, role label, selected category, top subcategory position, filters, buttons, and mobile overflow. Buttons should have equal heights and predictable alignment.',
      'Find the schedule or next-class area. Record whether a brand-new parent can immediately see when class happens and what link to use.',
      'Find the library/resource area. Click the classroom/library link and verify it opens /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS or an equivalent TEST One Time classroom route.',
      'Find 30-day trial, billing, and access-state copy. Record whether it is clear without showing admin-only setup/debug information.',
      'Find student click, attendance, or activity information. Record whether the parent can tell if the child clicked or attended.',
      'Find student login management. Confirm parent can reset the child password from parent scope, while parent forgot-password sends a reset to the signup email. Flag any separate classroom/recovery code as wrong.',
      'Find support/private question UI. Record whether it is parent-safe and does not send real messages in review mode.',
      'Open /one-time-email-review.html and inspect the parent welcome/trial email preview. Do not send email.',
      'If any step fails, save a BLOCKED or FAIL report in Operations drop-off. Include exact route, click path, visible text, screenshot/DOM notes, and the smallest Codex-ready repair.',
    ],
    audit_checklist: [
      'PASS/FAIL for schedule visibility, class link visibility, library visibility, trial/billing clarity, student click/activity visibility, attendance visibility, support UI, and student-login management expectations.',
      'PASS/FAIL for OneTime-only branding on live parent login/reset/setup surfaces, with no BNA Academy leakage, Hebrew/English toggle, test labels, expired setup flow, fallback classroom code, or recovery-code copy.',
      'Top 5 UI/IA fixes in Codex-ready language, with severity labels P0-SCOPE, P1-IA, P1-DEADEND, P2-TOOLBAR, P2-RESPONSIVE, P2-RELEVANCE, P2-TYPOGRAPHY, or P3-POLISH.',
      'Explicit missing pieces before Codex can send a real parent welcome email.',
      'Recommended email copy shape, but no live send.',
    ],
  },
  {
    key: 'one-time-student-login-reset-journey',
    title: 'One Time Student Login And Parent Reset Journey',
    context_keys: ['one_time_parent', 'one_time_student'],
    requirement_id: 'REQ-20260707-114',
    focus: 'student login experience, parent-managed student username/password reset expectations, no recovery/classroom-code fallback, student-safe class/library state, and no parent billing/private-note leakage',
    exact_navigation: [
      'Open /operations/agent-review?prompt=one-time-student-login-reset-journey first. Confirm this prompt key is visible, click Start Audit / I started this agent mode, and keep the drop-off page open.',
      'Open the live One Time host https://join.onetimeonetime.com/. Attempt the visible student login/access path before using direct route fallbacks.',
      'Open /student/login and audit the logged-out student login shell. It should be OneTime-branded and should not show BNA Academy reset, fallback classroom password, recovery code, or unrelated Academy copy.',
      'Open /student.html?review=one-time directly as a review fixture only after checking the visible path.',
      'Audit the first viewport at 1440px, then repeat the same route at 1024px, 768px, 430px, and 390px.',
      'Inspect the topbar/header spacing, sidebar or hamburger behavior, side categories, top subcategories, filters, button alignment, and text wrapping.',
      'Confirm the student sees only student-safe class, library, worksheet/resource, attendance, progress, question/support, and achievement/reward information.',
      'Confirm the student does not see parent billing, adult/private notes, Super Admin controls, provider-admin setup, raw debug data, or unrelated BNA school accountability records.',
      'Click the visible Parent link from the student route and confirm it opens /parent.html?review=one-time or an equivalent TEST parent route.',
      'In the parent route, confirm the parent-managed reset model: parent can reset the child password; parent forgot-password sends a reset to the signup email; no separate classroom/recovery code exists.',
      'Open /student/login again at 1440px and 390px: username/password fields, forgot/reset copy, error/help copy, and mobile spacing.',
      'Open /parent/login and audit whether the parent setup/reset model is clearly different from student login.',
      'If any route, role boundary, login shell, or drop-off step fails, save BLOCKED or FAIL through Operations drop-off with exact failed step, partial findings, and suggested correction.',
    ],
    audit_checklist: [
      'State whether parent and student login roles are visually and conceptually distinct.',
      'PASS/FAIL for student-safe data, parent-managed reset expectation, no recovery/classroom-code fallback, class link, library/resources, question/support, and mobile spacing.',
      'List every place where the student view feels cramped, uneven, overstuffed, or contaminated by parent/admin/provider information.',
      'Recommend the minimum secure product change needed before a real parent can reset a real student login.',
    ],
  },
  {
    key: 'one-time-role-ia-consistency',
    title: 'One Time Role IA Consistency',
    context_keys: ['operations_super_admin', 'rabbi_provider_admin', 'one_time_parent', 'one_time_student', 'one_time_member', 'one_time_classroom', 'wrong_role_error_states'],
    requirement_id: 'REQ-20260707-115',
    focus: 'consistent side panel, category, top subcategory, filter, drawer, role-label, and mobile IA placement across Super Admin, Rabbi/provider, parent, student, member, and classroom views',
    exact_navigation: [
      'Start at /operations/agent-review and open each listed review context from the hub when available.',
      'From /operations, navigate visibly through the workspace switcher into rabbi_sheller_provider / one_time_mishnah_class before using route fallbacks.',
      'Also open these direct review routes after visible navigation has been attempted: /operations?view=tasks, /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class, /provider.html?admin_provider=one-time&section=mailbox, /provider.html?review=one-time, /parent.html?review=one-time, /student.html?review=one-time, /rabbi-member.html?review=one-time, and /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS.',
      'Compare against live One Time host routes where accessible: https://join.onetimeonetime.com/, https://join.onetimeonetime.com/parent/login, https://join.onetimeonetime.com/student/login, and https://join.onetimeonetime.com/provider.html?review=one-time.',
      'For each route, capture the IA map at 1440px and 390px: side navigation categories, selected category state, top subcategories/tabs, filters/search controls, primary action buttons, role/workspace label, drawer/helper placement, and mobile menu behavior.',
      'Compare each role against the Operations shell pattern. The position can adapt to role scope, but the placement model must feel the same across workspaces.',
      'Flag any One Time screen that splits categories in a weird way, moves filters to a new position, duplicates controls, hides the role being viewed, or shows Super Admin setup/debug cards to Rabbi, parent, student, or member roles.',
      'In the provider/Rabbi route, verify whether random configuration cards are actionable for Rabbi. If they are not actionable by Rabbi, report them as role-contaminating admin noise.',
      'In parent/student/member/classroom routes, verify that the view never exposes unrelated BNA records, Operations task data, provider setup internals, raw tokens, or other families/students.',
    ],
    audit_checklist: [
      'Produce a comparison table with one row per route and columns for side categories, top subcategories, filters, role label, drawer/helper, mobile behavior, and irrelevant/admin noise.',
      'Rank inconsistencies by severity using P0-SCOPE, P1-IA, P1-DEADEND, P2-TOOLBAR, P2-RESPONSIVE, P2-RELEVANCE, P2-TYPOGRAPHY, or P3-POLISH.',
      'Recommend a single shared IA rule for category/subcategory/filter placement that Codex can apply across provider, parent, student, member, classroom, and Operations views.',
      'Do not propose color-only fixes. Prioritize structure, spacing, hierarchy, role clarity, and mobile behavior.',
    ],
  },
  {
    key: 'one-time-brand-helper-toolbar-audit',
    title: 'One Time Brand Helper Toolbar Audit',
    context_keys: ['one_time_public_landing', 'operations_super_admin', 'rabbi_provider_admin', 'one_time_parent', 'one_time_student', 'one_time_member', 'one_time_classroom'],
    requirement_id: 'REQ-20260707-136',
    focus: 'One Time black/yellow brand isolation, English-only public scope, helper presence and role scoping, toolbar density, filter placement, equal buttons, mobile fit, and autonomous Operations drop-off reporting',
    exact_navigation: [
      'Open /operations/agent-review?prompt=one-time-brand-helper-toolbar-audit first. Confirm this prompt key is visible in the Agent Review Hub and keep the drop-off page available in another tab.',
      'Open /one-time. Confirm the page is OneTimeOneTime / One Time Mishnah Class, black/yellow scoped, English-only, and does not flash BNA cream/navy/teal, BNA Academy copy, or a Hebrew/English toggle.',
      'At /one-time, audit 1440px, 1024px, 768px, 430px, and 390px. Check first-viewport density, top section wasted space, button equal heights, text wrapping, helper launcher placement, and horizontal overflow.',
      'Open the One Time Helper on /one-time. Ask three public-safe questions: class schedule, parent trial link, and library access. Verify answers stay in one_time_mishnah_class scope and do not mention BNA school accountability unless explicitly framed as unrelated.',
      'Open /operations. If login is required, use browser takeover so the owner types credentials directly. Do not ask for, store, or repeat credentials.',
      'From Operations, use the workspace switcher to select One Time / Rabbi / One Time Mishnah Class. If the click path is not findable, record the failed click path and then open /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview.',
      'In the One Time Operations workspace, inspect the side panel, active workspace label, top subcategories, filters/search, primary action buttons, helper/drawer position, and any cards that say configured/not configured. If Rabbi cannot act on a card, mark it as role-contaminating admin noise.',
      'In Operations, open Communications > Email or /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email. Record whether the screen loops, switches to a broken display, or fails to show a clean Rabbi / One Time inbox distinction.',
      'In Operations, open Communications > WhatsApp or /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=whatsapp. Record whether WAPI readiness, WhatsApp contact history, and send controls are scoped to OneTime and clearly blocked when credentials are missing.',
      'Open /provider.html?review=one-time and /provider.html?admin_provider=one-time&section=mailbox if available. Confirm Rabbi/provider sees clear action buttons such as send message/email previews only where safe, and no random Super Admin diagnostics.',
      'Open /parent.html?review=one-time, /student.html?review=one-time, /rabbi-member.html?review=one-time, and /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS.',
      'For every role route, audit 1440px, 1024px, 768px, 430px, and 390px. Compare category/subcategory/filter placement, toolbar density, button height, helper scope, role label, and mobile menu behavior against the Operations pattern.',
      'Open https://join.onetimeonetime.com/parent/login and https://join.onetimeonetime.com/student/login. Confirm login/reset surfaces are OneTime-only and do not flash BNA Academy branding or Hebrew/English toggle.',
      'If any route, click path, login, helper, or drop-off step fails, do not stop in frustration. Save a BLOCKED or FAIL report through Operations drop-off with the exact route attempted, what failed, screenshots/DOM notes if available, and the smallest Codex-ready repair suggestion.',
    ],
    audit_checklist: [
      'Produce a route matrix for /one-time, live One Time login/reset surfaces, One Time Operations, Communications > Email, Communications > WhatsApp, provider/Rabbi, parent, student, member, and classroom.',
      'For each route include 1440px, 1024px, 768px, 430px, and 390px verdicts for spacing, topbar density, button alignment, filter placement, helper placement, role label, and overflow.',
      'Flag brand bleed specifically: BNA colors/copy, Hebrew/English toggle, BNA Academy language, or non-One-Time helper language on One Time surfaces.',
      'Flag role bleed specifically: Super Admin diagnostics in Rabbi/parent/student/member views, parent billing in student views, raw setup data in user views, or unrelated BNA records anywhere in One Time.',
      'Report Communications loops or bad-display switches with exact click path and route/query string.',
      'Report WhatsApp/WAPI readiness: whether inbound CRM logging, outbound send blocking, auto-reply readiness, and missing credentials are understandable without enabling a live send.',
      'Rank fixes by P0-SCOPE, P1-IA, P1-DEADEND, P2-TOOLBAR, P2-RESPONSIVE, P2-RELEVANCE, P2-TYPOGRAPHY, or P3-POLISH.',
      'End only with OPERATIONS_DROPOFF_SAVED after a saved AGR readback, or OPERATIONS_DROPOFF_FAILED with the full redacted payload if every save path fails.',
    ],
  },
  {
    key: 'one-time-public-signup-whatsapp-workflow',
    title: 'One Time Public Signup And WhatsApp Workflow',
    context_keys: ['one_time_public_landing', 'operations_super_admin', 'rabbi_provider_admin'],
    requirement_id: 'REQ-20260708-071',
    focus: 'public OneTime email-only signup strip, black/yellow landing header, Rabbi Scheller helper/WhatsApp readiness, first-party CRM capture, and Agent Review copied prompt/drop-off state',
    exact_navigation: [
      'Open /operations/agent-review?prompt=one-time-public-signup-whatsapp-workflow first. Confirm this prompt key is visible. Click Start Audit if it is not already started, then click Copy Agent Prompt. Confirm the card moves from Ready To Copy into Running / Drop-off Needed or shows prompt copied / awaiting drop-off. Keep the drop-off page open in a second tab before auditing.',
      'Open the public OneTime host https://join.onetimeonetime.com/ and the fallback path https://join.onetimeonetime.com/one-time. Confirm the page is OneTimeOneTime Mishnah / Rabbi Scheller scoped and does not show BNA Academy, Hebrew/English toggle, BNA cream/navy/teal, provider-preview copy, test labels, or raw Operations data.',
      'At 1440px, inspect the first viewport. The top toolbar should be black, bounded by a yellow outline/border, and should not have a separate yellow announcement bar above it. The logo should sit on a white tile and render as dark/black artwork.',
      'At the bottom of the hero, before the next section, find the yellow Sign Up Now signup strip. It should have one visible email input only, one visible Sign Up Now button, concise parent-facing copy, and no visible Parent name, Phone / WhatsApp, Region, Notes, checkbox, checkout, access code, classroom code, or recovery-code field.',
      'Click each visible Sign Up Now CTA from the header and hero. Confirm each lands on the same #start-free yellow email strip without layout jump, overlap, or horizontal overflow.',
      'Submit testing rule: do not use a real parent email and do not trigger any external send. If you are on a local/dev route or the hub explicitly indicates a safe smoke route, submit a synthetic email such as agent-mode+timestamp@example.invalid and record the response flags. If you are on live production and cannot confirm synthetic first-party lead testing is allowed, do not submit; instead verify DOM, payload fields, and endpoint target. In all cases, report whether the form posts only to /api/one-time/interest and never to checkout, email, WhatsApp, Stripe, Zoom, Vimeo, Drive, or GHL.',
      'Open the Rabbi Scheller Assistant bubble on the public page. Ask: "How do I sign up?", "What is the class schedule?", and "Can I message Rabbi Scheller on WhatsApp?" Verify the helper stays scoped to one_time_mishnah_class, names Rabbi Scheller Assistant or Rabbi Scheller digital assistant, and does not claim a WhatsApp was sent unless live WAPI send gates are configured and explicitly approved.',
      'Open /operations. If login is required, use browser takeover so the owner types credentials directly. Do not ask for, store, repeat, or screenshot credentials. Navigate visibly to One Time / Rabbi / One Time Mishnah Class using the workspace switcher before using route fallbacks.',
      'In Operations, open Communications > WhatsApp or fallback to /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=whatsapp. Confirm WAPI readiness, inbound CRM logging, outbound send blocking, missing-credential state, class-link configuration state, and WhatsApp contact history are scoped to OneTime. Do not send a WhatsApp message.',
      'In Operations, open Communications > Email or fallback to /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email. Confirm the Rabbi / One Time inbox distinction is clear and the screen does not loop into a broken display.',
      'Repeat the public landing checks at 1024px, 768px, 430px, and 390px. For each viewport, inspect header density, nav overflow, yellow signup strip placement, email input/button alignment, helper bubble placement, and first useful content. Record whether text or buttons overlap.',
      'Return to the drop-off tab and save PASS, FAIL, or BLOCKED. If anything fails mid-audit, save BLOCKED immediately with exact route, viewport, clicked element, observed failure, partial findings, and smallest Codex-ready repair suggestion. Do not end in chat unless every drop-off and API save path fails.',
    ],
    audit_checklist: [
      'PASS/FAIL for the public header: black toolbar, yellow outline, logo dark on white, no top yellow announcement, no BNA Academy/brand bleed.',
      'PASS/FAIL for the signup strip: yellow bar at hero bottom before next section, one visible email input only, Sign Up Now CTA, no visible phone/name/region/notes/checkbox/recovery/classroom-code fields, and no checkout/access grant.',
      'Report form behavior: endpoint, payload fields observed, whether a synthetic submit was performed, response flags if submitted, and confirmation that no external send/charge/access/WhatsApp occurred.',
      'PASS/FAIL for Rabbi Scheller Assistant public helper scope, WhatsApp answer safety, and no BNA helper language.',
      'PASS/FAIL for Operations Communications > WhatsApp readiness and Communications > Email inbox distinction. Include exact click path or fallback route used.',
      'Viewport matrix for 1440px, 1024px, 768px, 430px, and 390px covering spacing, button alignment, topbar density, hero/signup strip placement, helper placement, and horizontal overflow.',
      'Agent Review workflow proof: prompt key, copied/start AGR result ref, idempotency key, whether the card moved to Running / Drop-off Needed, and final AGR readback result.',
      'Rank fixes by P0-SCOPE, P1-IA, P1-DEADEND, P2-TOOLBAR, P2-RESPONSIVE, P2-RELEVANCE, P2-TYPOGRAPHY, or P3-POLISH.',
      'End only with OPERATIONS_DROPOFF_SAVED after saved AGR readback, or OPERATIONS_DROPOFF_FAILED with the full redacted payload if every save path fails.',
    ],
  },
  {
    key: 'cross-role-wrong-permission',
    title: 'Cross-Role Wrong-Permission/Error States',
    context_keys: ['wrong_role_error_states'],
    requirement_id: 'REQ-20260626-004',
    focus: '401/403 handling, wrong-role requests, wrong-workspace requests, ambiguous names, and safe fallbacks',
  },
  {
    key: 'helper-natural-language-action-audit',
    title: 'Helper Natural-Language Action Audit',
    context_keys: AGENT_REVIEW_CONTEXTS.map((item) => item.key),
    requirement_id: 'REQ-20260626-005',
    focus: 'natural-language helper actions, link grounding, typed audits, unsupported actions, and readback proof',
  },
  {
    key: 'navigation-ia-duplicate-control-audit',
    title: 'Navigation IA/Duplicate-Control Audit',
    context_keys: AGENT_REVIEW_CONTEXTS.map((item) => item.key),
    requirement_id: 'REQ-20260626-002',
    focus: 'side navigation, horizontal tabs, filters, duplicate controls, selected states, and mobile overflow',
  },
  {
    key: 'final-regression-pass',
    title: 'Final Regression Pass',
    context_keys: AGENT_REVIEW_CONTEXTS.map((item) => item.key),
    requirement_id: 'REQ-20260626-007',
    focus: 'complete Issue #24 acceptance gates, prompt pack links, result drop-off, newest recording trace, helper reachability, and live smoke evidence',
  },
];

function normalizeBaseUrl(baseUrl = '') {
  return String(baseUrl || '').trim().replace(/\/+$/, '');
}

function absoluteUrl(baseUrl, route) {
  const normalized = normalizeBaseUrl(baseUrl);
  return normalized ? `${normalized}${route}` : route;
}

function contextByKey(key) {
  return AGENT_REVIEW_CONTEXTS.find((item) => item.key === key) || null;
}

function promptFileName(prompt) {
  return `${prompt.key}.md`;
}

function promptPublicPath(prompt) {
  return `/agent-review-prompts/${promptFileName(prompt)}`;
}

function promptReturnPath(prompt) {
  return `${AGENT_REVIEW_RUN.hub_path}?prompt=${encodeURIComponent(prompt.key)}`;
}

function promptDropoffPath(prompt, { contextKey = '' } = {}) {
  const params = new URLSearchParams();
  params.set('agent_review_run_id', AGENT_REVIEW_RUN.agent_review_run_id);
  params.set('prompt_key', prompt.key);
  params.set('requirement_id', prompt.requirement_id);
  params.set('return_url', promptReturnPath(prompt));
  params.set('idempotency_key', promptIdempotencyKey(prompt, { contextKey }));
  if (contextKey) params.set('context_key', contextKey);
  params.set('autosave', '1');
  return `${AGENT_REVIEW_RUN.dropoff_path}?${params.toString()}`;
}

function promptIdempotencyKey(prompt, { contextKey = '' } = {}) {
  return [
    AGENT_REVIEW_RUN.agent_review_run_id,
    prompt.key,
    contextKey || 'all-contexts',
  ].join(':');
}

function parseObjectMaybe(value) {
  if (!value) return {};
  if (typeof value === 'object' && !Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(String(value || ''));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeTaskAgentModeStatus(value = '') {
  const normalized = String(value || '').trim().toLowerCase();
  return TASK_AGENT_MODE_STATUSES.has(normalized) ? normalized : 'not_started';
}

function taskAgentModeMetadata(task = {}) {
  const parsed = parseObjectMaybe(task.ai_parsed);
  const review = parsed.agent_mode_review && typeof parsed.agent_mode_review === 'object'
    ? parsed.agent_mode_review
    : {};
  return { parsed, review };
}

function taskIsDecision(task = {}) {
  return String(task.item_type || '').toLowerCase() === 'decision'
    || String(task.task_kind || '').toLowerCase() === 'decision'
    || Boolean(task.decision_required)
    || String(task.stage || '').toLowerCase() === 'needs_decision'
    || Boolean(task.decision_status);
}

function taskText(task = {}) {
  return [
    task.display_title,
    task.title,
    task.summary,
    task.cleaned_summary,
    task.notes,
    task.next_action,
    task.why_exists,
    task.blocked_reason,
    task.waiting_on,
    task.assigned_to,
    task.decision_owner,
  ].filter(Boolean).join('\n');
}

function taskNeedsAgentModeWorkflow(task = {}) {
  if (!task?.id) return false;
  const kind = String(task.task_kind || '').toLowerCase();
  const bucket = String(task.status_bucket || '').toLowerCase();
  const stage = String(task.stage || '').toLowerCase();
  if (['history', 'agent_job'].includes(kind)) return false;
  if (['done', 'archive', 'archived'].includes(stage) || task.completed_at || task.verified_at) return false;
  if (bucket === 'codex_queue') return false;
  if (/tasks-pending|internal handoff|implementation brief/i.test(taskText(task))) return false;
  const actionText = [task.waiting_on, task.assigned_to, task.decision_owner].filter(Boolean).join(' ');
  return taskIsDecision(task)
    || ['decisions', 'pending', 'tasks'].includes(bucket)
    || Boolean(task.needs_review)
    || Boolean(task.blocked_reason)
    || /\b(shloimie|operator|manager|owner|rabbi|external|account|setup|verify|audit|review)\b/i.test(actionText);
}

function taskOwnerClarity(task = {}) {
  const text = taskText(task);
  const waiting = String(task.waiting_on || '').toLowerCase();
  const assigned = String(task.assigned_to || '').toLowerCase();
  if (/\b(send|publish|charge|billing|dns|domain|credential|secret|token|delete|backfill|production write|apply)\b/i.test(text)) {
    return {
      key: 'dangerous_live_action_blocked',
      label: 'Dangerous/live action is blocked',
      explanation: 'Agent Mode may inspect and prepare evidence, but it must not perform live sends, publishes, charges, credential, DNS, delete, or backfill actions.',
    };
  }
  if (/\b(external|account|stripe|vimeo|zoom|resend|godaddy|domain|dns|drive|legal|billing|payment|registrar)\b/.test(waiting)) {
    return {
      key: 'external_account_owner_required',
      label: 'External account owner required',
      explanation: 'Agent Mode can gather evidence and prepare the checklist, but the outside account owner or operator must complete the external action.',
    };
  }
  if (taskIsDecision(task)) {
    return {
      key: 'owner_must_decide',
      label: 'Shloimie must personally decide',
      explanation: 'Agent Mode can research, verify screens, and submit a recommendation; it cannot make the final owner decision.',
    };
  }
  if (/\b(codex|agent|automation|system)\b/.test(assigned)) {
    return {
      key: 'codex_can_do_alone',
      label: 'Codex can do it alone',
      explanation: 'This is machine work; Agent Mode is optional and should be used only for human browser verification.',
    };
  }
  return {
    key: 'agent_mode_can_help_owner',
    label: 'Agent Mode can help Shloimie do it',
    explanation: 'Agent Mode can open the exact card, verify the requested UI/account state, and submit a PASS/FAIL/BLOCKED result for owner review.',
  };
}

function taskAgentModeId(task = {}) {
  const type = taskIsDecision(task) ? 'decision' : 'task';
  return `${type}-${Number(task.id || 0)}`;
}

function taskAgentModeRequirementId(task = {}) {
  return `${taskIsDecision(task) ? 'DECISION' : 'TASK'}-${Number(task.id || 0)}`;
}

function taskAgentModeReturnPath(task = {}) {
  const params = new URLSearchParams();
  params.set('view', 'tasks');
  params.set('task', String(Number(task.id || 0)));
  const projectKey = task.project_key || task.resolved_project_key || '';
  if (projectKey) params.set('project', projectKey);
  return `/operations?${params.toString()}`;
}

function taskAgentModeIdempotencyKey(task = {}) {
  return [
    AGENT_REVIEW_RUN.agent_review_run_id,
    taskAgentModeId(task),
    taskAgentModeRequirementId(task),
  ].join(':');
}

function taskAgentModeStatus(task = {}, now = new Date()) {
  const { review } = taskAgentModeMetadata(task);
  const status = normalizeTaskAgentModeStatus(review.status);
  const resultStatus = String(review.result_status || '').toLowerCase();
  if (review.result_ref && resultStatus === 'pass') return 'completed';
  if (review.result_ref && resultStatus === 'fail') return review.repair_requirement_id || review.repair_task_id ? 'repair_created' : 'failed';
  if (review.result_ref && resultStatus === 'blocked') return review.rerun_prompt ? 'rerun_required' : 'blocked';
  if (['prompt_copied', 'agent_running_or_pending'].includes(status) && review.prompt_copied_at) {
    const copiedAt = Date.parse(review.prompt_copied_at);
    if (Number.isFinite(copiedAt) && now.getTime() - copiedAt > TASK_AGENT_MODE_RESULT_TIMEOUT_MS) return 'agent_result_overdue';
  }
  return status;
}

function taskAgentModeDropoffPath(task = {}) {
  const params = new URLSearchParams();
  params.set('agent_review_run_id', AGENT_REVIEW_RUN.agent_review_run_id);
  params.set('prompt_key', taskAgentModeId(task));
  params.set('context_key', 'owner_task_decision');
  params.set('requirement_id', taskAgentModeRequirementId(task));
  params.set('task_id', String(Number(task.id || 0)));
  params.set('return_url', taskAgentModeReturnPath(task));
  params.set('idempotency_key', taskAgentModeIdempotencyKey(task));
  params.set('autosave', '1');
  return `${AGENT_REVIEW_RUN.dropoff_path}?${params.toString()}`;
}

function taskAgentModeAllowedActions(task = {}) {
  const clarity = taskOwnerClarity(task);
  const base = [
    'open the exact task or Decision card',
    'read visible context and links',
    'verify UI/browser state',
    'write a redacted PASS/FAIL/BLOCKED report',
  ];
  if (clarity.key === 'owner_must_decide') base.push('summarize options and recommend next owner action');
  if (clarity.key === 'external_account_owner_required') base.push('prepare external-account checklist without logging in as the owner');
  return base;
}

function taskAgentModeProhibitedActions(task = {}) {
  const blocked = [
    'make final owner decisions',
    'create duplicate visible Tasks or Decisions',
    'paste secrets, passwords, cookies, access tokens, or private student transcripts',
    'send email/WhatsApp/SMS',
    'publish public content',
    'charge cards or change billing',
    'change DNS, credentials, integrations, or production data',
    'apply class backfill',
  ];
  if (taskOwnerClarity(task).key === 'external_account_owner_required') blocked.push('complete external account setup without the account owner');
  return blocked;
}

function buildTaskAgentModeReview(task = {}, { baseUrl = '', now = new Date() } = {}) {
  if (!taskNeedsAgentModeWorkflow(task)) return null;
  const promptKey = taskAgentModeId(task);
  const returnPath = taskAgentModeReturnPath(task);
  const dropoffPath = taskAgentModeDropoffPath(task);
  const requirementId = taskAgentModeRequirementId(task);
  const { review } = taskAgentModeMetadata(task);
  const clarity = taskOwnerClarity(task);
  const context = contextByKey('owner_task_decision');
  const title = String(task.display_title || task.title || `${taskIsDecision(task) ? 'Decision' : 'Task'} #${task.id}`).slice(0, 180);
  const expectedResult = String(task.next_action || task.recommended_next_action || task.decision_prompt || task.summary || task.cleaned_summary || 'Verify the card and save a redacted Agent Mode result.').slice(0, 800);
  const packet = {
    enabled: true,
    status: taskAgentModeStatus(task, now),
    prompt_key: promptKey,
    requirement_id: requirementId,
    task_id: Number(task.id || 0),
    item_type: taskIsDecision(task) ? 'decision' : 'task',
    role: context.role,
    workspace_key: task.project_key || task.resolved_project_key || context.workspace_key,
    context_key: context.key,
    context_label: context.label,
    exact_starting_url: absoluteUrl(baseUrl, returnPath),
    exact_return_url: absoluteUrl(baseUrl, returnPath),
    exact_dropoff_url: absoluteUrl(baseUrl, dropoffPath),
    idempotency_key: taskAgentModeIdempotencyKey(task),
    allowed_actions: taskAgentModeAllowedActions(task),
    prohibited_actions: taskAgentModeProhibitedActions(task),
    expected_result: expectedResult,
    save_instructions: 'Save PASS/FAIL/BLOCKED through the Operations drop-off URL and confirm the AGR readback. Successful final answer must start with OPERATIONS_DROPOFF_SAVED: AGR-... <readback URL>. If every save path fails, start with OPERATIONS_DROPOFF_FAILED: <exact UI/API error> and include the full redacted report in chat so Codex can recover it with the same prompt key and idempotency key.',
    owner_clarity: clarity,
    prompt_copied_at: review.prompt_copied_at || null,
    result_ref: review.result_ref || null,
    result_url: review.result_ref ? absoluteUrl(baseUrl, `/api/bna/agent-review/results/${encodeURIComponent(review.result_ref)}`) : null,
    result_status: review.result_status || null,
    result_saved_at: review.result_saved_at || null,
    repair_task_id: review.repair_task_id || null,
    repair_requirement_id: review.repair_requirement_id || null,
    repair_url: review.repair_url || null,
    rerun_prompt: review.rerun_prompt || null,
    copy_metadata: {
      agent_review_run_id: AGENT_REVIEW_RUN.agent_review_run_id,
      prompt_key: promptKey,
      task_id: Number(task.id || 0),
      item_type: taskIsDecision(task) ? 'decision' : 'task',
      requirement_id: requirementId,
      role: context.role,
      workspace_key: task.project_key || task.resolved_project_key || context.workspace_key,
      context_key: context.key,
      starting_url: absoluteUrl(baseUrl, returnPath),
      return_url: absoluteUrl(baseUrl, returnPath),
      dropoff_url: absoluteUrl(baseUrl, dropoffPath),
      idempotency_key: taskAgentModeIdempotencyKey(task),
    },
  };
  packet.prompt_text = renderTaskAgentModePrompt(task, packet, { title });
  return packet;
}

function renderTaskAgentModePrompt(task = {}, review = null, { title = '' } = {}) {
  const packet = review || buildTaskAgentModeReview(task) || {};
  return [
    `# Agent Mode Prompt - ${title || task.display_title || task.title || `Task #${task.id || ''}`}`,
    '',
    `Agent review run ID: ${AGENT_REVIEW_RUN.agent_review_run_id}`,
    `Prompt key: ${packet.prompt_key || taskAgentModeId(task)}`,
    `Requirement/task/decision ID: ${packet.requirement_id || taskAgentModeRequirementId(task)}`,
    `Role/workspace/context: ${packet.role || 'operator'} / ${packet.workspace_key || 'bna_platform'} / ${packet.context_key || 'owner_task_decision'}`,
    `Exact starting URL: ${packet.exact_starting_url || taskAgentModeReturnPath(task)}`,
    `Exact return/drop-off URL: ${packet.exact_dropoff_url || taskAgentModeDropoffPath(task)}`,
    `Idempotency key: ${packet.idempotency_key || taskAgentModeIdempotencyKey(task)}`,
    '',
    '## Owner Clarity',
    '',
    `${packet.owner_clarity?.label || taskOwnerClarity(task).label}: ${packet.owner_clarity?.explanation || taskOwnerClarity(task).explanation}`,
    '',
    '## Allowed Actions',
    '',
    ...(packet.allowed_actions || taskAgentModeAllowedActions(task)).map((item) => `- ${item}`),
    '',
    '## Prohibited Actions',
    '',
    ...(packet.prohibited_actions || taskAgentModeProhibitedActions(task)).map((item) => `- ${item}`),
    '',
    '## Expected Result',
    '',
    packet.expected_result || task.next_action || 'Verify the task and save the result.',
    '',
    '## Save Instructions',
    '',
    packet.save_instructions || 'Save PASS/FAIL/BLOCKED through the Operations drop-off URL.',
    '',
    'Final answer after a successful save: OPERATIONS_DROPOFF_SAVED: AGR-... <readback URL>.',
    'Final answer only if every save path fails: OPERATIONS_DROPOFF_FAILED: <exact UI/API error>, followed by the full redacted report.',
    '',
    'Return only redacted evidence. Do not create duplicate visible Tasks or Decisions.',
    '',
  ].join('\n');
}

function promptCopyMetadata(prompt, { baseUrl = '', contextKey = '' } = {}) {
  const returnUrl = promptReturnPath(prompt);
  const dropoffUrl = promptDropoffPath(prompt, { contextKey });
  return {
    agent_review_run_id: AGENT_REVIEW_RUN.agent_review_run_id,
    prompt_key: prompt.key,
    context_key: contextKey || null,
    return_url: absoluteUrl(baseUrl, returnUrl),
    dropoff_url: absoluteUrl(baseUrl, dropoffUrl),
    requirement_id: prompt.requirement_id,
    idempotency_key: promptIdempotencyKey(prompt, { contextKey }),
  };
}

function normalizePromptStatus(value = '') {
  const normalized = String(value || '').trim().toLowerCase();
  if (['started', 'in_progress', 'copied', 'save_attempted', 'result_pending', 'result_saved', 'saved_readback_verified', 'failed', 'blocked', 'blocked_saved', 'failed_save_paths_exhausted', 'repair_created', 'rerun_required', 'not_started'].includes(normalized)) {
    return normalized;
  }
  if (normalized === 'pass') return 'result_saved';
  if (normalized === 'fail') return 'failed';
  return 'not_started';
}

function promptStatusFromResult(result = null) {
  if (!result) return 'not_started';
  const status = String(result.status || '').toLowerCase();
  if (['in_progress', 'started'].includes(status)) return 'in_progress';
  if (status === 'pass') return 'result_saved';
  if (status === 'fail') return result.repair_requirement_id ? 'repair_created' : 'failed';
  if (status === 'blocked') return 'blocked';
  return 'result_pending';
}

function promptWorkflowStateFromResult(result = null) {
  if (!result) return 'not_started';
  const storedState = String(result.workflow_state || '').toLowerCase();
  if (['prompt_copied'].includes(storedState)) return storedState;
  const status = String(result.status || '').toLowerCase();
  if (['in_progress', 'started'].includes(status)) return 'in_progress';
  if (status === 'pass') return 'saved_readback_verified';
  if (status === 'blocked') return 'blocked_saved';
  if (status === 'fail') return 'failed_save_paths_exhausted';
  return 'save_attempted';
}

function buildAgentReviewRepairItem({ resultRef = '', promptKey = '', requirementId = '', status = '', severity = '', blocker = '' } = {}) {
  if (!['fail', 'blocked'].includes(String(status || '').toLowerCase())) return null;
  const seed = `${resultRef}:${promptKey}:${requirementId}`;
  const suffix = Buffer.from(seed).toString('base64url').replace(/[^A-Za-z0-9]/g, '').slice(0, 10).toUpperCase() || 'REVIEW';
  return {
    repair_ref: `AGR-REPAIR-${suffix}`,
    requirement_id: `REQ-REPAIR-${suffix}`,
    source_result_ref: resultRef,
    prompt_key: promptKey,
    source_requirement_id: requirementId,
    status: 'open',
    severity: severity || 'medium',
    title: `Repair Agent Review failure for ${promptKey || 'prompt'}`,
    blocker: blocker || null,
    operations_url: `${AGENT_REVIEW_RUN.hub_path}?repair=AGR-REPAIR-${suffix}`,
  };
}

function buildAgentReviewContexts({ baseUrl = '', newestRecordingTrace = null } = {}) {
  return AGENT_REVIEW_CONTEXTS.map((context) => ({
    ...context,
    target_url: absoluteUrl(baseUrl, context.target_route),
    session_ttl_minutes: AGENT_REVIEW_SESSION_TTL_MINUTES,
    newest_recording_trace: newestRecordingTrace ? {
      status: newestRecordingTrace.status || newestRecordingTrace.verdict?.status || 'UNKNOWN',
      selected_job: newestRecordingTrace.selected_job || newestRecordingTrace.selection?.selected_job?.job_ref || null,
      selected_drive_file: newestRecordingTrace.selected_drive_file || newestRecordingTrace.selection?.selected_file?.id_ref?.redacted || null,
      evidence_path: newestRecordingTrace.evidence_path || null,
    } : null,
  }));
}

function buildPromptIndex({ baseUrl = '', resultsByPrompt = {}, copiedPromptKeys = [] } = {}) {
  const copied = new Set(copiedPromptKeys || []);
  return AGENT_MODE_PROMPTS.map((prompt) => {
    const latestResult = resultsByPrompt[prompt.key] || null;
    const status = copied.has(prompt.key) ? 'copied' : promptStatusFromResult(latestResult);
    const workflowState = copied.has(prompt.key) && !latestResult ? 'started' : promptWorkflowStateFromResult(latestResult);
    const idempotencyKey = promptIdempotencyKey(prompt);
    const resultRef = latestResult?.result_ref || null;
    return {
      ...prompt,
      file: promptFileName(prompt),
      path: promptPublicPath(prompt),
      url: absoluteUrl(baseUrl, promptPublicPath(prompt)),
      return_url: absoluteUrl(baseUrl, promptReturnPath(prompt)),
      dropoff_url: absoluteUrl(baseUrl, promptDropoffPath(prompt)),
      idempotency_key: idempotencyKey,
      copy_metadata: {
        ...promptCopyMetadata(prompt, { baseUrl }),
        current_workflow_state: workflowState,
        current_result_ref: resultRef,
        started_at: latestResult?.started_at || null,
      },
      status,
      workflow_state: workflowState,
      started_at: latestResult?.started_at || null,
      started_by: latestResult?.started_by || null,
      latest_result_status: latestResult?.status || null,
      last_result_ref: resultRef,
      last_result_url: resultRef
        ? absoluteUrl(baseUrl, `/api/bna/agent-review/results/${encodeURIComponent(resultRef)}`)
        : null,
      repair_requirement_id: latestResult?.repair_requirement_id || null,
      repair_url: latestResult?.repair_url || null,
      rerun_required: ['fail', 'blocked'].includes(String(latestResult?.status || '').toLowerCase()),
    };
  });
}

function renderRerunPrompt({ prompt = null, resultRef = '', repair = null, baseUrl = '' } = {}) {
  const selectedPrompt = prompt || AGENT_MODE_PROMPTS.find((item) => item.key === repair?.prompt_key) || null;
  const title = selectedPrompt?.title || repair?.prompt_key || 'Agent Review prompt';
  const dropoffUrl = selectedPrompt ? absoluteUrl(baseUrl, promptDropoffPath(selectedPrompt)) : absoluteUrl(baseUrl, AGENT_REVIEW_RUN.dropoff_path);
  return [
    `Rerun ${title} after repair is applied.`,
    `Source result: ${resultRef || repair?.source_result_ref || 'unknown'}`,
    `Repair item: ${repair?.requirement_id || 'pending repair item'}`,
    `Return/drop-off URL: ${dropoffUrl}`,
    'Re-test only the failed or blocked behavior first, then submit a fresh PASS/FAIL/BLOCKED result with the same prompt key and a new idempotency key.',
  ].join('\n');
}

function renderAgentModePrompt(prompt, { baseUrl = '', generatedAt = new Date().toISOString() } = {}) {
  const contexts = prompt.context_keys.map(contextByKey).filter(Boolean);
  const hubUrl = absoluteUrl(baseUrl, AGENT_REVIEW_RUN.hub_path);
  const returnUrl = absoluteUrl(baseUrl, promptReturnPath(prompt));
  const dropoffUrl = absoluteUrl(baseUrl, promptDropoffPath(prompt));
  const resultUrl = absoluteUrl(baseUrl, AGENT_REVIEW_RUN.result_endpoint);
  const metadata = promptCopyMetadata(prompt, { baseUrl });
  const exactNavigation = Array.isArray(prompt.exact_navigation) && prompt.exact_navigation.length
    ? [
        '## Exact Navigation',
        '',
        ...prompt.exact_navigation.map((item, index) => `${index + 1}. ${item}`),
        '',
      ]
    : [];
  const auditChecklist = Array.isArray(prompt.audit_checklist) && prompt.audit_checklist.length
    ? [
        '## Required Audit Output',
        '',
        ...prompt.audit_checklist.map((item) => `- ${item}`),
        '',
      ]
    : [];
  return [
    `# Agent Mode Prompt - ${prompt.title}`,
    '',
    `Generated: ${generatedAt}`,
    `Source issue: ${AGENT_REVIEW_RUN.issue_url}`,
    `Raw/source ID: ${AGENT_REVIEW_RUN.raw_id}`,
    `Parent goal: ${AGENT_REVIEW_RUN.parent_goal_id}`,
    `Primary requirement: ${prompt.requirement_id}`,
    `Agent review run ID: ${AGENT_REVIEW_RUN.agent_review_run_id}`,
    `Return URL: ${returnUrl}`,
    `Drop-off URL: ${dropoffUrl}`,
    `Prompt key: ${prompt.key}`,
    `Idempotency key: ${metadata.idempotency_key}`,
    `Reusable protocol/template: docs/AGENT-REVIEW-AGENT-MODE-PROTOCOL.md`,
    '',
    '## Required Workflow State',
    '',
    'First open the Agent Review Hub. Confirm this prompt key. Click Start Audit / I started this agent mode if not already started. Open the drop-off page and keep it available. Then run the audit. If any context, route, login, helper, link, viewport, action, or save path fails, immediately save a BLOCKED result through the drop-off page with exact route attempted, what failed, partial findings, and smallest repair suggestion. Do not end in chat until the Agent Review Hub or readback API shows the AGR result for this prompt key and idempotency key. Final answer must start with OPERATIONS_DROPOFF_SAVED: AGR-... or OPERATIONS_DROPOFF_FAILED: ...',
    '',
    '- Do not treat a partial audit as pass.',
    '- Do not say a JSON handoff is prepared.',
    '- Do not ask the owner to manually upload the payload.',
    '- If blocked midway, save BLOCKED immediately.',
    '- If browser can still reach drop-off, use drop-off before any chat final.',
    '- If normal form fails, use exact drop-off URL.',
    '- If exact drop-off URL fails, use Emergency paste JSON and save.',
    '- If UI save fails, POST to /api/bna/agent-review/results.',
    '- Only if every save path fails may you return OPERATIONS_DROPOFF_FAILED with complete redacted JSON payload.',
    '',
    '## Copy Metadata',
    '',
    '```json',
    JSON.stringify(metadata, null, 2),
    '```',
    '',
    '## Start',
    '',
    `Open the Agent Review Hub: ${hubUrl}`,
    '',
    'Use takeover mode if an Operations login is required. Do not ask for or store passwords, cookies, API keys, refresh tokens, screenshots with private data, or reusable access secrets. External services such as Google, Railway, Stripe, Vimeo, DNS, Buffer, WhatsApp, and email remain separate logins and are out of scope unless the hub says otherwise.',
    '',
    '## Review Contexts',
    '',
    ...contexts.flatMap((context) => [
      `- ${context.label}: role ${context.role}, workspace ${context.workspace_key}, project ${context.project_key}, route ${context.target_route}, helper ${context.helper_surface}.`,
    ]),
    '',
    '## Work To Perform',
    '',
    `Focus: ${prompt.focus}.`,
    '',
    ...exactNavigation,
    ...auditChecklist,
    '1. Open each listed review context from the hub.',
    '2. Confirm the visible "Reviewing as" banner, role, workspace/project, expiry, and Exit control.',
    '3. Converse naturally with the scoped helper using paraphrases, typos, follow-ups, and corrections.',
    '4. Follow every internal link returned by the helper and verify route, section/tab, role, workspace, project, expected landmark, authorization result, and safe fallback.',
    '5. Test safe preview actions only. Do not send, publish, charge, deploy, change DNS, rotate credentials, move Drive files, retry production workers, or mutate student data.',
    '6. For any claimed write, verify the typed action/audit/result record. If no record exists, mark the claim failed.',
    '7. Include the newest Drive recording trace status from the hub; do not claim the recording processed beyond the trace evidence.',
    '8. You must submit the structured result yourself before your final answer. Normal save path: use the Agent Review Hub/drop-off page. If that form fails, use the exact drop-off URL below. If that still fails, use the Emergency paste JSON and save control on the drop-off page. If the browser cannot submit any page, POST the same JSON to the API fallback.',
    '9. A successful final answer must start with OPERATIONS_DROPOFF_SAVED: AGR-... and include the saved readback URL. Do not finish with downloadable artifacts, owner-upload instructions, claims that a JSON handoff is prepared, file handoff language, or manual-upload wording.',
    '10. If every save path fails, the final answer must start with OPERATIONS_DROPOFF_FAILED: <exact UI/API error> and include the complete redacted JSON payload so Codex can recover it. This is the only allowed manual payload handoff.',
    '11. The window is safe to close only after the Agent Review Hub or readback API shows the AGR result for this prompt key and idempotency key.',
    '12. If a scoped context redirects to public/sign-in content and cannot open after owner takeover login, stop that context, save BLOCKED through the self-save path, and do not audit the public helper as the scoped helper.',
    '',
    '## Result Shape',
    '',
    `Preferred drop-off: ${dropoffUrl}`,
    `API fallback: ${resultUrl}`,
    'Emergency fallback: open the drop-off page and use "Emergency paste JSON and save" only after the normal save path and exact drop-off URL fail.',
    '',
    '```json',
    JSON.stringify({
      raw_id: AGENT_REVIEW_RUN.raw_id,
      parent_goal_id: AGENT_REVIEW_RUN.parent_goal_id,
      agent_review_run_id: AGENT_REVIEW_RUN.agent_review_run_id,
      requirement_id: prompt.requirement_id,
      prompt_key: prompt.key,
      return_url: returnUrl,
      dropoff_url: dropoffUrl,
      status: 'pass|fail|blocked',
      role_workspace: 'role/workspace tested',
      conversation_summary: 'brief summary, no private transcript body',
      routes_visited: ['canonical route keys and paths'],
      helper_responses: ['short redacted summaries only'],
      link_action_outcomes: ['PASS/FAIL per link/action'],
      evidence: ['screenshot path or DOM/readback evidence, redacted'],
      blocked_route_or_step: 'required when blocked',
      attempted_action: 'required when blocked',
      observed_failure: 'required when blocked',
      partial_routes_visited: ['routes visited before blocker'],
      partial_helper_responses: ['helper responses before blocker'],
      evidence_notes: 'redacted notes for readback',
      severity: 'none|low|medium|high|critical',
      blocker: 'required when status is blocked',
      suggested_correction: 'exact repair or none',
      idempotency_key: metadata.idempotency_key,
    }, null, 2),
    '```',
    '',
    'End with OPERATIONS_DROPOFF_SAVED: AGR-... and the readback URL after a successful save. End with OPERATIONS_DROPOFF_FAILED: <exact UI/API error> and the redacted JSON payload only if all save paths failed.',
    '',
  ].join('\n');
}

function normalizeAgentReviewResultStatus(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (['start', 'started', 'in_progress', 'draft'].includes(normalized)) return 'in_progress';
  if (['pass', 'passed', 'ok', 'success'].includes(normalized)) return 'pass';
  if (['fail', 'failed', 'failure'].includes(normalized)) return 'fail';
  if (['blocked', 'blocker'].includes(normalized)) return 'blocked';
  return 'needs_review';
}

module.exports = {
  AGENT_MODE_PROMPTS,
  AGENT_REVIEW_CONTEXTS,
  AGENT_REVIEW_RUN,
  AGENT_REVIEW_SESSION_TTL_MINUTES,
  TASK_AGENT_MODE_RESULT_TIMEOUT_MS,
  buildAgentReviewRepairItem,
  buildAgentReviewContexts,
  buildPromptIndex,
  buildTaskAgentModeReview,
  contextByKey,
  normalizeAgentReviewResultStatus,
  normalizePromptStatus,
  normalizeTaskAgentModeStatus,
  promptCopyMetadata,
  promptDropoffPath,
  promptFileName,
  promptIdempotencyKey,
  promptPublicPath,
  promptReturnPath,
  renderRerunPrompt,
  renderAgentModePrompt,
  renderTaskAgentModePrompt,
  taskAgentModeDropoffPath,
  taskAgentModeId,
  taskAgentModeIdempotencyKey,
  taskAgentModeRequirementId,
  taskAgentModeStatus,
  taskNeedsAgentModeWorkflow,
  taskOwnerClarity,
};
