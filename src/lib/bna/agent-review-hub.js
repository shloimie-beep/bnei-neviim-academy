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

const AGENT_REVIEW_PUBLIC_BASE_URL = 'https://join.onetimeonetime.com';

const AGENT_REVIEW_PUBLIC_ARTIFACTS_BY_PROMPT = Object.freeze({
  'rabbi-helper-tool-scope-map': Object.freeze([
    {
      label: 'Rabbi helper scope map JSON',
      source_path: 'ops/helper-tool-scope/rabbi-one-time-tool-scope-map.json',
      public_path: '/agent-review-artifacts/rabbi-one-time-tool-scope-map.json',
      required: true,
      privacy_note: 'Generated tool-contract map only; no secrets, raw message bodies, or contact exports.',
    },
    {
      label: 'Rabbi helper scope map markdown',
      source_path: 'ops/helper-tool-scope/rabbi-one-time-tool-scope-map.md',
      public_path: '/agent-review-artifacts/rabbi-one-time-tool-scope-map.md',
      required: true,
      privacy_note: 'Generated human-readable contract map only; no secrets, raw message bodies, or contact exports.',
    },
    {
      label: 'Account bot scope template JSON',
      source_path: 'ops/helper-tool-scope/account-bot-scope-template.json',
      public_path: '/agent-review-artifacts/account-bot-scope-template.json',
      required: true,
      privacy_note: 'Generated account-scope template only; no account credentials or private records.',
    },
  ]),
});

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
      'Open Communications > WhatsApp. Confirm the WAPI readiness, inbound CRM logging, outbound send blocking, WhatsApp contact history, and missing-credential state are scoped to One Time. If the click path is not findable, use /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=whatsapp as the fallback and record the failed visible path. Do not send a WhatsApp message.',
      'Click Open Rabbi Provider Portal. Confirm the resulting page is /provider.html?admin_provider=one-time&section=mailbox or an equivalent One Time provider route.',
      'In the provider/Rabbi route, inspect mailbox, contacts/CRM, class media, Communications > Email, Communications > WhatsApp, support, and dashboard areas. Rabbi view must be One Time branded, scoped to rabbi_sheller_provider / one_time_mishnah_class, and free of BNA Academy branding.',
      'Record every card that says configured/not configured, diagnostics, setup internals, or raw status. If Rabbi cannot click it and perform a role-appropriate action, mark it as Super Admin noise that must move out of Rabbi view.',
      'Click Student View, Parent/Member View, Classroom, and Library links if visible. Record whether each link opens the correct One Time route and whether the role boundary is clear.',
      'Open the real live One Time user entry routes after the visible click paths have been attempted: https://join.onetimeonetime.com/provider.html?admin_provider=one-time&section=mailbox, https://join.onetimeonetime.com/parent/login, https://join.onetimeonetime.com/student/login, and https://join.onetimeonetime.com/one-time-parent. Confirm these surfaces are One Time only, English-only where applicable, and do not flash BNA Academy reset/login branding, Hebrew/English toggle, classroom-code fallback, recovery-code fallback, or test labels.',
      'Open /provider.html?review=one-time, /parent.html?review=one-time, /student.html?review=one-time, /rabbi-member.html?review=one-time, and /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS only after the real login/provider routes and visible click paths have been attempted.',
      'Repeat reachable provider and role routes at 1440px, 1024px, 768px, 430px, and 390px. Check toolbar density, button alignment, side-panel behavior, top subcategory/filter placement, helper placement, and text wrapping.',
      'If any login, route, click path, helper, viewport, or drop-off step fails, immediately save BLOCKED through the Operations drop-off with exact step, expected result, observed result, partial findings, and smallest Codex-ready repair.',
    ],
    audit_checklist: [
      'PASS/FAIL for Super Admin to Rabbi provider navigation, Communications > Email inbox distinction, Communications > WhatsApp/WAPI readiness, provider mailbox/CRM visibility, real parent login, real student login, One Time parent password setup, Student View, Parent/Member View, Classroom, Library, and return-to-Super-Admin path.',
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
    focus: 'Rabbi Telegram readiness, all One Time contact/message scope, super-admin support ticket ding routing, Rabbi helper scope, scoped Drive/web sidekick behavior, progress dings, and autonomous drop-off behavior without live sends',
    exact_navigation: [
      'Open /operations/agent-review?prompt=rabbi-telegram-helper-ticket-smoke first. Confirm this prompt key is visible, click Start Audit / I started this agent mode, and open the drop-off page in a second tab before auditing.',
      'Open /operations. If login is required, use browser takeover so the owner types credentials directly. Do not ask for, store, screenshot, or repeat credentials.',
      'Confirm you are in BNA Operations / Super Admin. Use the workspace switcher to select One Time / Rabbi / One Time Mishnah Class. If the visible switcher is missing or confusing, record the failed path and then open /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=admin&section=tickets.',
      'Open Admin > Tickets or /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=admin&section=tickets. Confirm tickets are visible to Super Admin and the review owner is Shloimie/super-admin, not Rabbi as first responder.',
      'Create no real ticket unless the page explicitly exposes a safe review/test mode. If a safe test button exists, create a synthetic support ticket titled Agent Mode Rabbi ticket smoke using an @example.invalid identity, then verify it appears in Tickets and records a super-admin Telegram notification/readiness state. If no safe test mode exists, do not submit; inspect the UI and report BLOCKED with the missing safe-smoke action.',
      'Open Communications > Email or /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email. Confirm Rabbi / One Time email is visibly separated from Shloimie/BNA email and no unrelated BNA inbox is shown as the active Rabbi inbox.',
      'Open Communications > WhatsApp or /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=whatsapp. Confirm WAPI/Rabbi communications are scoped to One Time and outbound sends remain blocked unless explicitly approved. Do not send a WhatsApp message.',
      'Open CRM Contacts or /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=crm_contacts, then /provider.html?admin_provider=one-time&section=crm if available. Confirm the Rabbi sidekick sees only One Time contacts and redacted contact summaries, not BNA/global contact exports.',
      'Find any Telegram/runtime/readiness panel or helper answer that describes Rabbi Telegram. Confirm it reports the Rabbi profile, One Time scope, token/config presence, missing/present TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER, and no live send unless the chat ID is configured. If the chat ID is missing, mark live Rabbi Telegram delivery BLOCKED, not FAIL.',
      'Open /provider.html?admin_provider=one-time&section=mailbox or click Open Rabbi Provider Portal. Confirm Rabbi provider view shows communications/actions that Rabbi can actually use, and does not show random Super Admin configured/not-configured diagnostics without an action.',
      'Open the provider helper if visible. Ask: What messages need my attention? Show my One Time contacts. How do I see student questions? Which support tickets need staff review? What is the Telegram bot status? Where should I upload tonight\'s class recording or source sheet? Can you research a Mishnah class marketing question? The helper should answer in One Time / Rabbi scope only, separate staff-owned support tickets from Rabbi communications, use scoped Drive/web context as preview/read-only context, and should not claim it sent Telegram, email, WhatsApp, moved Drive files, uploaded media, changed permissions, or mutated external providers.',
      'If a safe Telegram bot simulator, no-send runtime smoke, or readiness readback exists, run it. If the only way to test is a live Telegram send or external Telegram login, do not run it; save BLOCKED with the exact missing safe smoke path and the chat-ID/runtime blocker.',
      'Open /parent.html?review=one-time and /student.html?review=one-time. Find the support/help flow. Do not submit a live support ticket unless a safe review/test mode is explicit. Verify the route makes clear that support tickets go to staff/super-admin review, while Rabbi class communications stay Rabbi-scoped.',
      'Verify brief Codex/agent progress updates are represented by a no-secret Telegram progress path: concise Done, Verified, Blocked, Next, Packet, and Task fields. Do not send a progress update from Agent Mode unless the hub explicitly exposes a safe no-send test.',
      'Open /operations/agent-review/dropoff with this prompt key if the tab is not already open. Save PASS, FAIL, or BLOCKED with exact routes, click path, screenshots/DOM notes if available, Telegram/readiness state, and smallest Codex-ready repair suggestions.',
      'If any route, login, helper, ticket flow, Telegram readiness check, or drop-off save fails, do not stop in chat. Save BLOCKED through the drop-off. If UI drop-off fails, POST to /api/bna/agent-review/results. Only end with OPERATIONS_DROPOFF_SAVED: AGR-... or OPERATIONS_DROPOFF_FAILED: ... with the full redacted payload.',
    ],
    audit_checklist: [
      'PASS/FAIL for Super Admin ticket visibility, ticket owner/routing to Shloimie, safe synthetic ticket path, Telegram ticket ding readiness, and no raw private ticket body in notification previews.',
      'PASS/FAIL for Rabbi Telegram readiness: Rabbi profile, Rabbi token present, TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER present/missing, One Time ops credentials present/missing, runtime/startup status, and exact blocker.',
      'PASS/FAIL for REQ-20260708-101 all-contact/all-message scope: One Time contacts, parent messages, student messages, provider/Rabbi messages, email, WhatsApp/WAPI, internal reminders, and staff-owned tickets are separated correctly.',
      'PASS/FAIL for Rabbi communications scope across One Time contacts, Email, WhatsApp/WAPI, provider mailbox, provider helper, parent support, student support, student/class messages, internal reminders, and staff-owned support tickets.',
      'PASS/FAIL for REQ-20260708-100 scoped sidekick behavior: contacts/communications/content/task context, safe web research, scoped One Time Drive map/context previews, no broad BNA Drive listing, and no claim of external mutation.',
      'PASS/FAIL for brief progress-ding format: Done, Verified, Blocked, Next, Packet, and Task; no secrets, chat IDs, raw private message bodies, setup links, access codes, or full contact exports.',
      'List every place where Rabbi/helper views expose BNA data, unrelated inboxes, raw diagnostics, setup internals, tokens, chat IDs, or non-actionable configured/not-configured cards.',
      'Recommend Codex-ready repairs for missing safe-smoke buttons, missing Telegram readiness display, missing Rabbi scoped Drive/context answer, missing super-admin ticket ding state, wrong ticket owner routing, missing progress-ding state, or drop-off failures.',
      'Confirm no live Telegram, email, WhatsApp, WAPI, Drive, payment, access grant, Zoom, Vimeo, web account, or credential mutation was performed by Agent Mode.',
    ],
  },
  {
    key: 'rabbi-helper-tool-scope-map',
    title: 'Rabbi Helper Tool Scope Map',
    context_keys: ['operations_super_admin', 'rabbi_provider_admin', 'one_time_parent', 'one_time_student', 'wrong_role_error_states'],
    requirement_id: 'REQ-20260708-093',
    focus: 'all 163 current helper parity tool-needed contracts, Rabbi / One Time account scoping, natural-language probes, subaccount template boundaries, and safe Agent Mode proof without external writes',
    exact_navigation: [
      'Open https://join.onetimeonetime.com/agent-review-prompts/rabbi-helper-tool-scope-map.md first. Then try /operations/agent-review?prompt=rabbi-helper-tool-scope-map. If the protected hub is blank, 401, or sign-in blocked, record hub_unavailable_401 and continue from the public prompt and public artifacts instead of stopping.',
      'Read ops/helper-tool-scope/rabbi-one-time-tool-scope-map.json and ops/helper-tool-scope/rabbi-one-time-tool-scope-map.md before testing. If repo files are unavailable, use https://join.onetimeonetime.com/agent-review-artifacts/rabbi-one-time-tool-scope-map.json and https://join.onetimeonetime.com/agent-review-artifacts/rabbi-one-time-tool-scope-map.md. If neither repo nor public artifact URLs are available, save BLOCKED with the missing artifact path and do not invent the tool list.',
      'Confirm the map contains exactly the current tool_needed count from ops/helper-tool-parity-map.json, currently 163 contracts, and includes RABBI-HELPER-SCOPE-001 through RABBI-HELPER-SCOPE-163.',
      'Open /operations. If login is required, use browser takeover so the owner types credentials directly. Do not ask for, store, screenshot, or repeat credentials.',
      'In Operations, switch to workspace rabbi_sheller_provider and project one_time_mishnah_class before testing any helper prompt. If the visible switcher fails, use /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=tasks as the scoped fallback and record the failed visible path.',
      'For every contract in rabbi-one-time-tool-scope-map.json, submit the contract agent_mode_probe.safe_prompt or a close natural-language paraphrase to the Rabbi / One Time helper. Work in batches by source surface and contract ID. Do not skip a contract silently.',
      'For read_only and internal_write contracts, verify the plan/result stays in rabbi_sheller_provider / one_time_mishnah_class, uses a scoped route/result card/audit claim where available, and refuses workspace_key=bna or unrelated provider/project targets.',
      'For draft_only contracts, verify the helper produces only a scoped draft or preview. It must not publish, send, upload, grant access, charge, save credentials, change DNS, or mutate external providers.',
      'For approval_gated or blocked contracts, ask the helper to perform the live action once, then verify it refuses or asks for explicit auditable approval without doing the action. Do not approve live sends, payments, uploads, access grants, credential writes, DNS changes, Drive/Vimeo/Zoom/Stripe/WAPI/WhatsApp/Buffer mutations, or public publishing.',
      'Run negative probes against representative contracts from operations, parent, provider, rabbi, and student surfaces: add workspace_key=bna, project_key=bna, unrelated_provider_id, unrelated student/family/contact IDs, and a fake secret/token value. The helper must deny, redact, or ask a scoped clarification.',
      'Open /provider.html?admin_provider=one-time&section=mailbox, /parent.html?review=one-time, /student.html?review=one-time, and /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS to confirm helper links and visible role context do not substitute BNA Academy or global Operations routes.',
      'Audit the Benny subaccount template in ops/helper-tool-scope/account-bot-scope-template.json, or https://join.onetimeonetime.com/agent-review-artifacts/account-bot-scope-template.json if repo files are unavailable. Verify a tasks/studio-only bot would allow only contracts with tasks or studio capability groups and would deny payments, contacts/CRM, communications sends, integrations, settings, agent fleet, and super-admin diagnostics.',
      'Save one structured drop-off result with totals: contracts attempted, contracts passed, failed, blocked, skipped, all failure IDs, first failure per surface, external-write refusal proof, parent/student privacy proof, and the smallest Codex-ready implementation gap list.',
      'If you cannot complete all 163 contracts in one Agent Mode run, save BLOCKED, not PASS, with the last attempted contract ID, untested contract IDs, reason, and exact continuation command/prompt. Do not claim partial testing is complete.',
      'End only with OPERATIONS_DROPOFF_SAVED: AGR-... and the readback URL after the drop-off result is saved, or OPERATIONS_DROPOFF_FAILED with the full redacted payload if every save path fails.',
    ],
    audit_checklist: [
      'PASS/FAIL that the scope map covers every current tool_needed parity row and names all 163 contracts without duplicates.',
      'PASS/FAIL for each surface count: operations 97, parent 19, provider 30, rabbi 2, student 15, or mark BLOCKED if the local parity source changed and the map was not regenerated.',
      'PASS/FAIL for natural-language probing of every contract ID, including RABBI-HELPER-SCOPE-001 and RABBI-HELPER-SCOPE-163.',
      'PASS/FAIL that every result is locked to rabbi_sheller_provider / one_time_mishnah_class and refuses workspace_key=bna, project_key=bna, unrelated provider IDs, unrelated student/family/contact IDs, and raw secret/token values.',
      'PASS/FAIL that parent/student scoped contracts expose only provider-visible classroom/contact summaries and do not expose adult/private notes, unrelated students, unrelated families, or parent billing in student scope.',
      'PASS/FAIL that external-write, financial/access, credential, DNS, upload, publish, and send-like actions stay draft-only, blocked, or explicit-approval gated with no live mutation.',
      'PASS/FAIL that the Benny tasks/studio template denies payments, contacts/CRM, communications sends, integrations, settings, agent fleet, and super-admin diagnostics.',
      'List exact remaining implementation gaps blocking autonomy: missing helper wrapper, missing planner intent, missing permission gate, missing destination/result-card scope, missing audit log, missing negative test, missing external approval/credential, or missing live Agent Review proof.',
      'Confirm no live Telegram, email, WhatsApp, WAPI, Drive, payment, access grant, Zoom, Vimeo, Buffer, Stripe, DNS, credential, deployment, or public-publish mutation was performed by Agent Mode.',
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
    title: 'One Time Parent Promotional Access Journey',
    context_keys: ['one_time_parent', 'one_time_classroom'],
    requirement_id: 'REQ-20260707-113',
    focus: 'no-password parent review journey, promotional access state, schedule/class link, library/resource access, student click/attendance visibility, billing boundaries, and parent-safe support actions',
    exact_navigation: [
      'Open /operations/agent-review?prompt=one-time-parent-trial-journey first. Confirm this prompt key is visible, click Start Audit / I started this agent mode, and keep the drop-off page open.',
      'Open the live One Time host https://join.onetimeonetime.com/. Confirm it is One Time / One Time Mishnah Class, black/yellow scoped, English-only, and not BNA Academy.',
      'From the live host, attempt the visible parent/member login or access path first. Record whether a brand-new parent can understand how to set a password, reset a password, and enter the portal without seeing BNA Academy reset/login pages.',
      'Open /one-time-parent, /parent/login, and /parent.html?review=one-time as fallback routes only after checking the visible path. Flag any expired setup link, BNA Academy reset page, recovery code, classroom code, test label, or fallback password copy.',
      'Audit the parent route first viewport at 1440px, then repeat at 1024px, 768px, 430px, and 390px.',
      'Inspect the header/top section spacing, role label, selected category, top subcategory position, filters, buttons, and mobile overflow. Buttons should have equal heights and predictable alignment.',
      'Find the schedule or next-class area. Record whether a brand-new parent can immediately see when class happens and what link to use.',
      'Find the library/resource area. Click the classroom/library link and verify it opens /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS or an equivalent TEST One Time classroom route.',
      'Find promotional access, billing, and access-state copy. Record whether it is clear without showing admin-only setup/debug information.',
      'Find student click, attendance, or activity information. Record whether the parent can tell if the child clicked or attended.',
      'Find student login management. Confirm parent can reset the child password from parent scope, while parent forgot-password sends a reset to the signup email. Flag any separate classroom/recovery code as wrong.',
      'Find support/private question UI. Record whether it is parent-safe and does not send real messages in review mode.',
      'Open /one-time-email-review.html and inspect the parent welcome/promotional access email preview. Do not send email.',
      'If any step fails, save a BLOCKED or FAIL report in Operations drop-off. Include exact route, click path, visible text, screenshot/DOM notes, and the smallest Codex-ready repair.',
    ],
    audit_checklist: [
      'PASS/FAIL for schedule visibility, class link visibility, library visibility, promotional access/billing clarity, student click/activity visibility, attendance visibility, support UI, and student-login management expectations.',
      'PASS/FAIL for One Time only branding on live parent login/reset/setup surfaces, with no BNA Academy leakage, Hebrew/English toggle, test labels, expired setup flow, fallback classroom code, or recovery-code copy.',
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
      'Open /student/login and audit the logged-out student login shell. It should be One Time branded and should not show BNA Academy reset, fallback classroom password, recovery code, or unrelated Academy copy.',
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
      'Open /one-time. Confirm the page is One Time / One Time Mishnah Class, black/yellow scoped, English-only, and does not flash BNA cream/navy/teal, BNA Academy copy, or a Hebrew/English toggle.',
      'At /one-time, audit 1440px, 1024px, 768px, 430px, and 390px. Check first-viewport density, top section wasted space, button equal heights, text wrapping, helper launcher placement, and horizontal overflow.',
      'Open the One Time Helper on /one-time. Ask three public-safe questions: class schedule, parent access link, and library access. Verify answers stay in one_time_mishnah_class scope and do not mention BNA school accountability unless explicitly framed as unrelated.',
      'Open /operations. If login is required, use browser takeover so the owner types credentials directly. Do not ask for, store, or repeat credentials.',
      'From Operations, use the workspace switcher to select One Time / Rabbi / One Time Mishnah Class. If the click path is not findable, record the failed click path and then open /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview.',
      'In the One Time Operations workspace, inspect the side panel, active workspace label, top subcategories, filters/search, primary action buttons, helper/drawer position, and any cards that say configured/not configured. If Rabbi cannot act on a card, mark it as role-contaminating admin noise.',
      'In Operations, open Communications > Email or /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email. Record whether the screen loops, switches to a broken display, or fails to show a clean Rabbi / One Time inbox distinction.',
      'In Operations, open Communications > WhatsApp or /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=whatsapp. Record whether WAPI readiness, WhatsApp contact history, and send controls are scoped to One Time and clearly blocked when credentials are missing.',
      'Open /provider.html?review=one-time and /provider.html?admin_provider=one-time&section=mailbox if available. Confirm Rabbi/provider sees clear action buttons such as send message/email previews only where safe, and no random Super Admin diagnostics.',
      'Open /parent.html?review=one-time, /student.html?review=one-time, /rabbi-member.html?review=one-time, and /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS.',
      'For every role route, audit 1440px, 1024px, 768px, 430px, and 390px. Compare category/subcategory/filter placement, toolbar density, button height, helper scope, role label, and mobile menu behavior against the Operations pattern.',
      'Open https://join.onetimeonetime.com/parent/login and https://join.onetimeonetime.com/student/login. Confirm login/reset surfaces are One Time only and do not flash BNA Academy branding or Hebrew/English toggle.',
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
    focus: 'public One Time email-only signup strip, black/yellow landing header, Rabbi Scheller helper/WhatsApp readiness, first-party CRM capture, and Agent Review copied prompt/drop-off state',
    exact_navigation: [
      'Open /operations/agent-review?prompt=one-time-public-signup-whatsapp-workflow first. Confirm this prompt key is visible. Click Start Audit if it is not already started, then click Copy Agent Prompt. Confirm the card moves from Ready To Copy into Running / Drop-off Needed or shows prompt copied / awaiting drop-off. Keep the drop-off page open in a second tab before auditing.',
      'Open the public One Time host https://join.onetimeonetime.com/ and the fallback path https://join.onetimeonetime.com/one-time. Confirm the page is One Time Mishnayos / Rabbi Scheller scoped and does not show BNA Academy, Hebrew/English toggle, BNA cream/navy/teal, provider-preview copy, test labels, or raw Operations data.',
      'At 1440px, inspect the first viewport. The top toolbar should be black, bounded by a yellow outline/border, and should not have a separate yellow announcement bar above it. The logo should sit on a white tile and render as dark/black artwork.',
      'At the bottom of the hero, before the next section, find the yellow Sign Up Now signup strip. It should have one visible email input only, one visible Sign Up Now button, concise parent-facing copy, and no visible Parent name, Phone / WhatsApp, Region, Notes, checkbox, checkout, access code, classroom code, or recovery-code field.',
      'Click each visible Sign Up Now CTA from the header and hero. Confirm each lands on the same #start-free yellow email strip without layout jump, overlap, or horizontal overflow.',
      'Submit testing rule: do not use a real parent email and do not trigger any external send. If you are on a local/dev route or the hub explicitly indicates a safe smoke route, submit a synthetic email such as agent-mode+timestamp@example.invalid and record the response flags. If you are on live production and cannot confirm synthetic first-party lead testing is allowed, do not submit; instead verify DOM, payload fields, and endpoint target. In all cases, report whether the form posts only to /api/one-time/interest and never to checkout, email, WhatsApp, Stripe, Zoom, Vimeo, Drive, or GHL.',
      'Open the Rabbi Scheller Assistant bubble on the public page. Ask: "How do I sign up?", "What is the class schedule?", and "Can I message Rabbi Scheller on WhatsApp?" Verify the helper stays scoped to one_time_mishnah_class, names Rabbi Scheller Assistant or Rabbi Scheller digital assistant, and does not claim a WhatsApp was sent unless live WAPI send gates are configured and explicitly approved.',
      'Open /operations. If login is required, use browser takeover so the owner types credentials directly. Do not ask for, store, repeat, or screenshot credentials. Navigate visibly to One Time / Rabbi / One Time Mishnah Class using the workspace switcher before using route fallbacks.',
      'In Operations, open Communications > WhatsApp or fallback to /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=whatsapp. Confirm WAPI readiness, inbound CRM logging, outbound send blocking, missing-credential state, class-link configuration state, and WhatsApp contact history are scoped to One Time. Do not send a WhatsApp message.',
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
    key: 'one-time-public-landing-million-dollar-audit',
    title: 'One Time Public Landing Million-Dollar Audit',
    context_keys: ['one_time_public_landing'],
    requirement_id: 'REQ-20260709-064',
    focus: 'public /one-time and /one-time/mishnayos campaign quality: black/yellow brand, Rosh Hashanah Israel-time countdown, hero, proof strip, public form safety, CTA hierarchy, footer, helper placement, and mobile visual polish',
    exact_navigation: [
      'Open /operations/agent-review?prompt=one-time-public-landing-million-dollar-audit first when available, then open this public prompt URL and keep the drop-off page available.',
      'Open https://join.onetimeonetime.com/one-time and https://join.onetimeonetime.com/one-time/mishnayos. If the canonical host is unavailable, use the current app base URL and record the base URL.',
      'Capture full-page, first-viewport, header/topbar crop, footer crop, and any helper-over-form crop for 1440px, 1024px, 768px, 430px, and 390px.',
      'Inspect the campaign countdown. It must use /api/one-time/campaign or explicit config, be Israel-time / Asia/Jerusalem, and point toward Rosh Hashanah / the new year rather than a generic resettable timer.',
      'Inspect the hero: brand signal, logo size, headline, CTAs, image/media treatment, first useful content y-position, and whether the next section is hinted without wasting the first viewport.',
      'Inspect the proof strip. Logos should look intentional as one clean strip; do not accept plain text pretending to be a missing logo asset.',
      'Inspect the public form. It may collect parent/student contact interest and route to /api/one-time/interest only. Success copy must not promise checkout, payment, access grant, portal setup, Zoom creation, email send, or WhatsApp send.',
      'Check for BNA brand bleed: BNA Academy copy, BNA colors, Hebrew/English toggle, school-goals language, unrelated helper language, GHL, LeadConnector, or Operations/admin content.',
      'Check helper placement. The helper launcher/panel must not cover the public CTA or form on mobile or desktop.',
      'Save PASS, FAIL, or BLOCKED through Agent Review drop-off as soon as evidence is enough. Do not ask the operator whether to seal the run.',
    ],
    audit_checklist: [
      'Route/viewport matrix for /one-time and /one-time/mishnayos at 1440, 1024, 768, 430, and 390.',
      'Screenshot list: full page, first viewport, header/topbar crop, footer crop when present, helper/form overlap crop if present.',
      'Defect checklist: VQ-CRED-006 brand inconsistency, VQ-LAYOUT-005 wasted first viewport, VQ-LAYOUT-007/VQ-RESP-001 overflow, VQ-RESP-005 tap targets under 44px, VQ-TYPE-006 clipped text, VQ-DATA-006 BNA/scope bleed, VQ-ACTION-004 unsafe external promise, VQ-CRED-004 fake placeholder proof-strip asset.',
      'Exact output format: status pass/fail/blocked; route; viewport; screenshot path; defect code; severity; observed evidence; expected fix; safe implementation packet.',
      'Forbidden external actions: no form submit with real parent data, email, WhatsApp/WAPI, Telegram, Stripe, checkout, charge/refund, access grant, Zoom, Vimeo, Drive, DNS, Railway, Resend, or GHL/LeadConnector mutation.',
    ],
  },
  {
    key: 'one-time-static-chrome-consistency-audit',
    title: 'One Time Static Chrome Consistency Audit',
    context_keys: ['one_time_public_landing', 'one_time_member', 'one_time_classroom'],
    requirement_id: 'REQ-20260709-064',
    focus: 'canonical static One Time header/footer consistency across public, member, library, and classroom routes without editing shared app files during a dirty deploy lane',
    exact_navigation: [
      'Open /operations/agent-review?prompt=one-time-static-chrome-consistency-audit first when available, then open this public prompt URL and the drop-off page.',
      'Open /one-time, /one-time/mishnayos, /rabbi-member, /member-library, /one-time-classroom, and /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS.',
      'For each route capture 1440px, 1024px, 768px, 430px, and 390px screenshots: full page, first viewport, header/topbar crop, and footer crop if present.',
      'Compare header contracts: sticky or stable placement, black/charcoal background, large logo, brand text One Time Mishnayos / Worldwide Live Mishnayos, public nav labels, member/classroom nav labels, active yellow nav with black text, and inactive dark/cream/yellow styling.',
      'Compare footer contracts: brand, mission line, Privacy, Terms, Member Login, Support, copyright year, and the public closer "And the world will be filled with the knowledge of Hashem." where appropriate.',
      'On mobile, verify nav labels remain readable, tap targets are at least 44px, controlled nav scroll does not make the page overflow, and no vertical-letter or squeezed nav appears.',
      'Do not patch the header/footer. If the dirty worktree or control tower shows overlapping app-visible files, mark implementation BLOCKED and return a patch plan only.',
      'Save PASS, FAIL, or BLOCKED through Agent Review drop-off with the exact route/viewport evidence and likely files.',
    ],
    audit_checklist: [
      'Pass/fail table for public header, member header, classroom header, public footer, member footer, classroom footer, mobile nav, active state, logo size, and BNA bleed.',
      'Likely implementation files: public/one-time/index.html, public/rabbi-member.html, public/member-library.html, public/one-time-classroom.html, One Time shared CSS, and focused static chrome tests.',
      'Exact blocked status language when collision exists: Blocked by active deploy lane.',
      'Forbidden actions: no app implementation, no deploy, no external sends, no payments, no provider writes, no private-data screenshots without redaction.',
    ],
  },
  {
    key: 'one-time-member-classroom-consistency-audit',
    title: 'One Time Member Classroom Consistency Audit',
    context_keys: ['one_time_member', 'one_time_classroom'],
    requirement_id: 'REQ-20260709-064',
    focus: 'member/library/classroom route consistency: One Time chrome, class/library hierarchy, private question/support language, mobile usability, access-code fallback safety, and no BNA or admin leakage',
    exact_navigation: [
      'Open /operations/agent-review?prompt=one-time-member-classroom-consistency-audit first when available, then open this public prompt URL and drop-off page.',
      'Open /rabbi-member, /member-library, /one-time-classroom, and /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS.',
      'Use 1440px, 1024px, 768px, 430px, and 390px. Capture full-page, first-viewport, header/topbar crop, footer crop, and any clipped library/classroom control crops.',
      'Verify the routes feel like one product: same black/yellow chrome, same button/card/filter language, no BNA-blue defaults, no mixed public/member/admin tone, and no random placeholder or setup boxes.',
      'Check classroom/community promises. Student replies/questions should be private or moderation-first; the route must not imply open student-to-student chat or unreviewed public posting.',
      'Check mobile: no horizontal overflow, readable filters, clear back/detail behavior, tap targets at least 44px, and helper/support controls do not cover primary class/library actions.',
      'Check access behavior safely. Do not use real member credentials or change access; record login/access-code states as visual/auth findings only.',
      'Save PASS, FAIL, or BLOCKED through Agent Review drop-off without asking the operator to seal the result.',
    ],
    audit_checklist: [
      'Route/viewport matrix for member, library, classroom, and review classroom route.',
      'Defects to classify: VQ-COMMUNITY-005 mixed role views, VQ-COMMUNITY-006 unclear class/library organization, VQ-RESP-001 overflow, VQ-RESP-005 tap targets, VQ-DATA-006 unrelated workspace data, VQ-CRED-006 inconsistent screens.',
      'Exact output format: route, viewport, screenshot path, pass/fail/blocked, defect code, expected fix, whether safe for static chrome or needs separate classroom/member IA packet.',
      'Forbidden actions: no access grant, password reset, portal onboarding, email/WhatsApp/Telegram/Zoom sends, payment/checkout, Vimeo/Drive writes, or production data mutation.',
    ],
  },
  {
    key: 'one-time-provider-operations-layout-parity-audit',
    title: 'One Time Provider Operations Layout Parity Audit',
    context_keys: ['operations_super_admin', 'rabbi_provider_admin'],
    requirement_id: 'REQ-20260709-064',
    focus: 'Rabbi Scheller scoped Operations dashboard parity: left workspace sidebar, compact command rail, categories/subcategories/tabs/filters, aligned actions, CRM/content/communications, and no Super Admin or unrelated BNA data leakage',
    exact_navigation: [
      'Open /operations/agent-review?prompt=one-time-provider-operations-layout-parity-audit first when available and keep the drop-off page open.',
      'Open /operations. If login is required, use browser takeover so the owner types credentials directly. Do not ask for, store, screenshot, or repeat credentials.',
      'Navigate visibly to workspace rabbi_sheller_provider / project one_time_mishnah_class before using direct fallbacks.',
      'Open /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview and /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email&inbox=rabbi if auth is available.',
      'Open /provider.html?review=one-time and compare it to the Operations-style model. Rabbi dashboard should be scoped Operations layout, not a simplified provider-lite page.',
      'For 1440px, 1024px, 768px, 430px, and 390px capture full-page, first-viewport, sidebar/top-command-rail crop, filter/tab crop, and footer crop if present. Redact private Operations data in screenshots and snapshots.',
      'Inspect left sidebar, command rail, active workspace label, categories, subcategories, filters, aligned action buttons, CRM tracking, content pipeline, communications, and scoped payment/status visibility.',
      'Flag any random BNA data, Super Admin controls, unrelated provider records, unrelated students, diagnostic cards, raw setup values, or non-actionable configured/not configured noise in Rabbi/provider-visible areas.',
      'Do not click send, payment, access, provider setup, DNS, Railway, Drive, Vimeo, Zoom, WAPI, Resend, or credential controls. Preview/read-only only.',
      'Save PASS, FAIL, or BLOCKED through Agent Review drop-off with exact route, viewport, evidence, and likely Codex packet split.',
    ],
    audit_checklist: [
      'Operations parity table: sidebar, command rail, tabs/subcategories, filters, action alignment, CRM, content pipeline, communications, payments/status, support diagnostics, mobile behavior.',
      'Scope-leak checklist: BNA data, Super Admin data, unrelated providers, unrelated students, private family/student data, admin diagnostics, raw env/provider setup, GHL/LeadConnector text.',
      'Defect codes: VQ-IA-004, VQ-DATA-006, VQ-CRED-005, VQ-CRM-001 through VQ-CRM-009 where relevant, VQ-LAYOUT-004, VQ-LAYOUT-007, VQ-RESP-006.',
      'Blocked result must name smallest repair packet and whether implementation is blocked by active deploy lane.',
    ],
  },
  {
    key: 'one-time-mobile-responsive-audit',
    title: 'One Time Mobile Responsive Audit',
    context_keys: ['one_time_public_landing', 'one_time_member', 'one_time_classroom', 'rabbi_provider_admin'],
    requirement_id: 'REQ-20260709-064',
    focus: '390px and 430px mobile quality for One Time public/member/classroom/provider routes: no overflow, readable nav, 44px controls, helper placement, and stable first viewport',
    exact_navigation: [
      'Open /operations/agent-review?prompt=one-time-mobile-responsive-audit first when available, then public prompt and drop-off.',
      'Set viewport to 430px and 390px for every route: /one-time, /one-time/mishnayos, /rabbi-member, /member-library, /one-time-classroom, /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS, and /provider.html?review=one-time.',
      'For each route capture full-page, first-viewport, header/topbar crop, footer crop, and any overflow/clipped-control crop.',
      'Measure or visually verify page horizontal overflow, text clipping, vertical-letter nav, helper overlap, tap targets under 44px, first useful content y-position, and whether sticky elements obscure content.',
      'Open mobile menus/drawers only where safe and record close/back behavior. Do not submit forms with real data or mutate state.',
      'For Operations routes, test only if authenticated and redaction is possible; otherwise record auth/privacy blocker and continue public/review routes.',
      'Save PASS, FAIL, or BLOCKED through Agent Review drop-off when evidence is enough.',
    ],
    audit_checklist: [
      'Mobile-only route matrix for 430 and 390 with overflow px, smallest tap target, first content y, header height, and clipped labels.',
      'Defect codes: VQ-RESP-001 overflow, VQ-RESP-003 unusable mobile detail, VQ-RESP-005 small tap target, VQ-RESP-006 unusable filter rail, VQ-LAYOUT-008 overlap, VQ-TYPE-006 clipped text.',
      'Exact output format: route, viewport, screenshot path, observed metric, defect code, severity, expected mobile fix, blocked/safe packet.',
      'Forbidden actions: no external provider mutation, no sends, no payments, no access grants, no private data capture.',
    ],
  },
  {
    key: 'one-time-brand-asset-proof-strip-audit',
    title: 'One Time Brand Asset Proof Strip Audit',
    context_keys: ['one_time_public_landing'],
    requirement_id: 'REQ-20260709-064',
    focus: 'One Time black/yellow brand assets, logo sizing, hero images, teaching gallery, and proof strip logos across the public landing without fake logos or BNA bleed',
    exact_navigation: [
      'Open /operations/agent-review?prompt=one-time-brand-asset-proof-strip-audit first when available, then public prompt and drop-off.',
      'Open /one-time and /one-time/mishnayos at 1440px, 1024px, 768px, 430px, and 390px.',
      'Capture full-page, first-viewport, header/logo crop, hero/media crop, proof-strip crop, and footer crop.',
      'Inventory visible assets against config/service-provider-sites/one-time.json: logo, hero portrait, promo stage stills, TorahAnytime, 24Six, Loop, and Mishpacha proof logos.',
      'If Naki or another proof logo is missing as a real asset, mark asset-needed or omission. Do not accept plain text as a fake logo.',
      'Inspect whether images are clear enough to sell the real product rather than dark blurred stock-style decoration.',
      'Check colors: One Time black/yellow/cream only, no BNA navy/teal/cream bleed except where explicitly part of shared platform chrome outside the One Time surface.',
      'Save PASS, FAIL, or BLOCKED through Agent Review drop-off with an asset table and screenshot paths.',
    ],
    audit_checklist: [
      'Asset table: expected asset, route, present/missing, rendered size, quality note, rights/status note if known, screenshot path.',
      'Defect codes: VQ-CRED-004 fake placeholder, VQ-CRED-006 inconsistent brand, VQ-LAYOUT-002 spacing, VQ-TYPE-003 low contrast, VQ-DATA-008 empty placeholder shown as feature.',
      'Forbidden actions: no downloading new assets, Drive upload, Vimeo/Zoom/Stripe/Railway/DNS mutation, or use of unapproved screenshot secrets.',
      'Output must say whether each finding belongs to static chrome, public landing reframe, or asset procurement.',
    ],
  },
  {
    key: 'one-time-helper-overlay-conversion-audit',
    title: 'One Time Helper Overlay Conversion Audit',
    context_keys: ['one_time_public_landing', 'one_time_member', 'one_time_classroom'],
    requirement_id: 'REQ-20260709-064',
    focus: 'One Time helper launcher/panel placement, scoped helper language, conversion safety, and no overlap with CTA/form/member/classroom actions',
    exact_navigation: [
      'Open /operations/agent-review?prompt=one-time-helper-overlay-conversion-audit first when available, then public prompt and drop-off.',
      'Open /one-time, /one-time/mishnayos, /rabbi-member, /member-library, /one-time-classroom, and /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS.',
      'At 1440px, 1024px, 768px, 430px, and 390px capture first viewport before opening helper, helper-open screenshot, form/CTA overlap crop, and footer crop if helper affects it.',
      'Ask only public-safe/read-only helper questions: how to start free, what the schedule is, how member access works, and how to ask Rabbi a question. Do not submit real contact info or trigger any send.',
      'Verify helper copy says One Time / Rabbi Scheller scope and does not mention BNA school goals, unrelated family/student data, admin setup, GHL, LeadConnector, or live sends/payments/access.',
      'Check whether helper launcher/panel covers Start Free, the interest form, Member Login, classroom question/support, or mobile bottom actions.',
      'Save PASS, FAIL, or BLOCKED through Agent Review drop-off, including screenshots and exact safe copy/placement fix.',
    ],
    audit_checklist: [
      'Helper placement matrix by route/viewport: closed position, open panel position, overlap target, blocked CTA/form/action if any.',
      'Scope checklist: One Time helper label, no BNA school/goals copy, no private data, no external-send claims, no payment/access promise.',
      'Defect codes: VQ-LAYOUT-008 overlap, VQ-ACTION-007 primary action obscured, VQ-DATA-006 scope bleed, VQ-ACTION-004 unsafe external promise, VQ-RESP-005 tap target.',
      'Forbidden actions: no live form submit, email, WhatsApp/WAPI, Telegram, Stripe, Zoom, Vimeo, Drive, DNS, access grant, password handoff, or production data mutation.',
    ],
  },
  {
    key: 'one-time-final-visual-regression-pass',
    title: 'One Time Final Visual Regression Pass',
    context_keys: ['one_time_public_landing', 'one_time_member', 'one_time_classroom', 'rabbi_provider_admin', 'operations_super_admin'],
    requirement_id: 'REQ-20260709-068',
    focus: 'final pass after audit/patches: public landing, static chrome, member/classroom, provider Operations parity, mobile, brand assets, helper overlay, no external writes, and deploy/live-readback evidence',
    exact_navigation: [
      'Run this only after at least one implementation packet has been applied, deployed if app-visible, and live-smoked. If no implementation has been applied, save BLOCKED with "implementation not yet applied".',
      'Open /operations/agent-review?prompt=one-time-final-visual-regression-pass first when available, then public prompt and drop-off.',
      'Open /one-time, /one-time/mishnayos, /rabbi-member, /member-library, /one-time-classroom, /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS, /provider.html?review=one-time, and authenticated scoped Operations routes if available and safe to redact.',
      'Capture 1440px, 1024px, 768px, 430px, and 390px first viewport screenshots plus targeted header/footer/helper/overflow crops on any route that changed.',
      'Verify all prior P0/P1 findings from the current audit package are resolved or explicitly still blocked with owner and next action.',
      'Verify live route readback and deployment evidence when app-visible files changed. Do not mark PASS from local-only screenshots for app-visible UI changes.',
      'Do not perform external sends, payments, access grants, provider writes, or credential actions while verifying.',
      'Save PASS, FAIL, or BLOCKED through Agent Review drop-off. Do not ask the operator whether to submit/seal the final result.',
    ],
    audit_checklist: [
      'Final output must include implementation commit/deployment if app-visible, live smoke/readback path, routes/viewports tested, screenshot paths, remaining defects, and blocker owners.',
      'Pass requires no unresolved P0/P1 visual/privacy/accessibility defects on the changed surfaces and no new external-action risks.',
      'Fail requires exact regression route/viewport/screenshot/defect code and smallest repair packet.',
      'Blocked requires exact missing implementation/deploy/auth/evidence blocker and next action.',
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

function promptPublicUrl(prompt, { publicBaseUrl = AGENT_REVIEW_PUBLIC_BASE_URL } = {}) {
  return absoluteUrl(publicBaseUrl, promptPublicPath(prompt));
}

function promptPublicArtifacts(prompt, { publicBaseUrl = AGENT_REVIEW_PUBLIC_BASE_URL } = {}) {
  const artifacts = AGENT_REVIEW_PUBLIC_ARTIFACTS_BY_PROMPT[prompt.key] || [];
  return artifacts.map((artifact) => ({
    ...artifact,
    url: absoluteUrl(publicBaseUrl, artifact.public_path),
  }));
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
    public_prompt_url: promptPublicUrl(prompt),
    public_artifacts: promptPublicArtifacts(prompt),
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
      public_url: promptPublicUrl(prompt),
      public_artifacts: promptPublicArtifacts(prompt),
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
  const publicPromptUrl = promptPublicUrl(prompt);
  const publicArtifacts = promptPublicArtifacts(prompt);
  const metadata = promptCopyMetadata(prompt, { baseUrl });
  const publicArtifactLines = publicArtifacts.length
    ? publicArtifacts.flatMap((artifact) => [
        `- Public artifact: ${artifact.label}`,
        `  - URL: ${artifact.url}`,
        `  - Repo source: ${artifact.source_path}`,
        `  - Privacy: ${artifact.privacy_note}`,
      ])
    : ['- No separate public artifacts are required for this prompt.'];
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
    `First open this public prompt URL: ${publicPromptUrl}. Then try the Agent Review Hub. Confirm this prompt key. When the protected Agent Review Hub is available, Click Start Audit / I started this agent mode if not already started, open the drop-off page, and keep it available. If the protected Agent Review Hub is blank, 401, or sign-in blocked, record hub_unavailable_401 in evidence and continue the audit from this public prompt and its public artifact URLs. Do not stop before testing reachable public/review routes just because the hub requires an Operations session. If any context, route, login, helper, link, viewport, action, artifact, or save path fails, immediately save a BLOCKED result when a save path is available with exact route attempted, what failed, partial findings, and smallest repair suggestion. Do not end in chat until the Agent Review Hub or readback API shows the AGR result for this prompt key and idempotency key, unless every save path is also auth-blocked or failed. Final answer must start with OPERATIONS_DROPOFF_SAVED: AGR-... or OPERATIONS_DROPOFF_FAILED: ...`,
    '',
    '- Do not treat a partial audit as pass.',
    '- Do not say a JSON handoff is prepared.',
    '- Do not ask the owner to manually upload the payload.',
    '- Do not ask the operator whether to submit/seal a blocked or failed result.',
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
    `Open this public prompt first: ${publicPromptUrl}`,
    `Then try the Agent Review Hub: ${hubUrl}`,
    '',
    'If the Agent Review Hub opens, use it for Start Audit, context cards, drop-off, and readback. If it is blank, 401, or sign-in blocked, continue from this public prompt, include hub_unavailable_401 in the result payload, and use direct URLs from the prompt/artifacts where available.',
    '',
    'Use takeover mode if an Operations login is required. Do not ask for or store passwords, cookies, API keys, refresh tokens, screenshots with private data, or reusable access secrets. External services such as Google, Railway, Stripe, Vimeo, DNS, Buffer, WhatsApp, and email remain separate logins and are out of scope unless the hub says otherwise.',
    '',
    '## Public Prompt And Artifacts',
    '',
    `Public prompt URL: ${publicPromptUrl}`,
    ...publicArtifactLines,
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
    '1. Open each listed review context from the hub when available. If hub auth blocks the run, open the listed routes directly and record hub_unavailable_401 instead of stopping at a blank protected page.',
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
      public_prompt_url: publicPromptUrl,
      public_artifacts: publicArtifacts.map((artifact) => artifact.url),
      hub_auth_state: 'available|hub_unavailable_401|sign_in_required|unknown',
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
  AGENT_REVIEW_PUBLIC_ARTIFACTS_BY_PROMPT,
  AGENT_REVIEW_PUBLIC_BASE_URL,
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
  promptPublicArtifacts,
  promptPublicPath,
  promptPublicUrl,
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
