const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');
const { chromium } = require('playwright');

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://bna_test:bna_test@127.0.0.1:1/bna_test';
process.env.OPS_USERNAME = 'super-admin-test';
process.env.OPS_PASSWORD = 'super-secret-test';
process.env.ONE_TIME_OPS_USERNAME = 'one-time-test';
process.env.ONE_TIME_OPS_PASSWORD = 'one-time-secret-test';
process.env.PAYMENT_REMINDER_SCHEDULER = 'off';

const { app } = require('../server');

const TEST_STUDENT_ID = 301;
const TEST_STUDENT_NAME = 'TEST BNA Seed Student';
const TEST_ACCESS_CODE = 'TEST-SEED-CODE';

function basicAuth(username, password) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

async function withServer(fn) {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    return await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

function jsonResponse(payload) {
  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(payload),
  };
}

function projectFrom(url) {
  return url.searchParams.get('project') || 'all';
}

function fixtureStudent() {
  return {
    id: TEST_STUDENT_ID,
    workspace_id: 1,
    project_key: 'bna',
    workspace_key: 'bna',
    workspace_name: 'BNA',
    name: TEST_STUDENT_NAME,
    parent_name: 'TEST BNA Seed Parent',
    parent_email: 'test-bna-seed@example.invalid',
    grade: 'TEST',
    age: 11,
    status: 'active',
    student_access_code: TEST_ACCESS_CODE,
    tags: ['TEST'],
    notes: 'TEST-BNA-SEED student fixture',
  };
}

function fixtureGoal() {
  return {
    id: 401,
    workspace_id: 1,
    student_id: TEST_STUDENT_ID,
    student_name: TEST_STUDENT_NAME,
    event_type: 'student_goal',
    title: 'TEST-BNA-SEED: Finish today honestly',
    topic: 'Self governance',
    progress_percent: 50,
    source: 'manual',
    created_at: '2026-06-18T08:00:00+03:00',
    metadata: {
      source: 'admin',
      urgency: 'today',
      status: 'active',
      due_at: '2026-06-19T20:00:00+03:00',
      student_summary: 'Student sees only the assigned goal summary.',
      agreement: {
        bedtime_time: '21:30',
        wake_time: '07:00',
        student_commitment: 'I will check off honestly.',
        chosen_consequence: 'Review with rebbi',
      },
      consequence: {
        success_device_access_state: 'approved_access',
        success_duration_minutes: 60,
      },
    },
  };
}

function operationsFixture(pathname, url, options = {}) {
  const authMode = options.authMode || 'super_admin';
  const scopedOneTime = authMode === 'scoped_one_time';
  const project = projectFrom(url);
  const workspaceProject = project === 'all' ? 'all' : project;
  const student = fixtureStudent();
  const goal = fixtureGoal();

  const routes = {
    '/api/bna/auth/me': {
      success: true,
      user: scopedOneTime ? 'one-time-test' : 'super-admin-test',
      role: scopedOneTime ? 'workspace_member' : 'super_admin',
      scope: scopedOneTime
        ? {
            type: 'workspace',
            workspaceType: 'service_provider',
            workspaceKey: 'one_time_mishnah_class',
            projectKey: 'one_time_mishnah_class',
          }
        : { type: 'global', workspaceType: null, workspaceKey: null, projectKey: null },
      allowedViews: scopedOneTime
        ? ['tasks', 'assistant', 'calendar', 'content', 'contacts', 'automations', 'integrations']
        : ['tasks', 'assistant', 'calendar', 'students', 'content', 'contacts', 'accounting', 'automations', 'integrations', 'users'],
    },
    '/api/bna/projects': {
      projects: scopedOneTime
        ? [
            { project_key: 'one_time_mishnah_class', name: 'One Time Mishnah Class', short_name: 'One Time', workspace_type: 'service_provider' },
          ]
        : [
            { project_key: 'bna', name: 'BNA', short_name: 'BNA', workspace_type: 'school' },
            { project_key: 'one_time_mishnah_class', name: 'One Time Mishnah Class', short_name: 'One Time', workspace_type: 'service_provider' },
          ],
    },
    '/api/bna/tasks': {
      tasks: [
        {
          id: 201,
          workspace_id: project === 'one_time_mishnah_class' ? 2 : 1,
          project_key: project === 'one_time_mishnah_class' ? 'one_time_mishnah_class' : 'bna',
          title: `${project === 'one_time_mishnah_class' ? 'One Time' : 'BNA'} acceptance task`,
          stage: 'decision_required',
          category: 'operations',
          urgency: 'today',
          assigned_to: 'System Work',
          blocker_reason: 'Needs operator choice',
          created_at: '2026-06-18T08:00:00+03:00',
          due_date: '2026-06-20',
          source: 'telegram',
          source_context: {
            message_id: 901,
            raw_id: 'RAW-TEST-001',
            source: 'telegram',
          },
          ai_parsed: {
            original_text: 'Raw operator ramble should stay out of the visible title.',
            raw_id: 'RAW-TEST-001',
            seed_marker: 'TEST-BNA-SEED',
          },
        },
        {
          id: 202,
          workspace_id: project === 'one_time_mishnah_class' ? 2 : 1,
          project_key: project === 'one_time_mishnah_class' ? 'one_time_mishnah_class' : 'bna',
          title: `${project === 'one_time_mishnah_class' ? 'One Time' : 'BNA'} legacy alias task`,
          stage: 'needs_decision',
          category: 'operations',
          urgency: 'this_week',
          assigned_to: 'System Work',
          created_at: '2026-06-18T09:00:00+03:00',
          ai_parsed: { seed_marker: 'TEST-BNA-SEED', legacy_stage_alias: 'needs_decision' },
        },
        {
          id: 203,
          workspace_id: project === 'one_time_mishnah_class' ? 2 : 1,
          project_key: project === 'one_time_mishnah_class' ? 'one_time_mishnah_class' : 'bna',
          title: 'Decide where to route captured intake',
          notes: 'Low-confidence intake needs an operator routing choice before it becomes work.',
          stage: 'decision_required',
          category: 'operations',
          urgency: 'today',
          assigned_to: 'System Work',
          created_at: '2026-06-18T10:00:00+03:00',
          decision_required: true,
          ai_parsed: {
            seed_marker: 'TEST-BNA-SEED',
            intake_confidence: 'low',
            routing: { route: 'decision', confidence: 0.42 },
            options: [
              {
                label: 'File as my task',
                value: 'operator_task',
                updates: { stage: 'ready', decision_required: false, assigned_to: 'Shloimie', category: 'operations' },
              },
              {
                label: 'Send to System Work',
                value: 'system_work',
                updates: { stage: 'ready', decision_required: false, assigned_to: 'Codex', category: 'operations' },
              },
              {
                label: 'Archive',
                value: 'archive',
                updates: { stage: 'archived', decision_required: false, assigned_to: null },
              },
            ],
          },
        },
        {
          id: 204,
          workspace_id: project === 'one_time_mishnah_class' ? 2 : 1,
          project_key: project === 'one_time_mishnah_class' ? 'one_time_mishnah_class' : 'bna',
          title: 'TEST-BNA-SEED blocked task',
          notes: 'Cannot continue until the provider portal access is restored.',
          stage: 'blocked',
          category: 'operations',
          urgency: 'today',
          assigned_to: 'Shloimie',
          blocker_reason: 'Needs access to provider portal',
          created_at: '2026-06-18T11:00:00+03:00',
          ai_parsed: { seed_marker: 'TEST-BNA-SEED', blocker_reason: 'Needs access to provider portal' },
        },
      ],
    },
    '/api/bna/calendar': {
      events: [
        {
          id: 'task-due-1',
          source_type: 'task',
          title: 'TEST-BNA-SEED Task due',
          due_date: '2026-06-18',
          status: 'ready',
          project_key: workspaceProject,
          workspace_label: project === 'one_time_mishnah_class' ? 'One Time Mishnah Class' : 'BNA',
        },
        {
          id: 'class-1',
          source_type: 'class_session',
          title: 'TEST-BNA-SEED Live class',
          class_date: '2026-06-19',
          project_key: workspaceProject,
          workspace_label: project === 'one_time_mishnah_class' ? 'One Time Mishnah Class' : 'BNA',
        },
        ...(project === 'one_time_mishnah_class' ? [] : [
          {
            id: 'class-bna-only',
            source_type: 'class_session',
            title: 'TEST-BNA-SEED BNA-only class',
            class_date: '2026-06-22',
            project_key: 'bna',
            workspace_label: 'BNA',
          },
        ]),
        {
          id: 'check-in-1',
          source_type: 'check_in',
          title: 'TEST-BNA-SEED Student check-in',
          next_check_in_date: '2026-06-20',
          status: 'ready',
          project_key: workspaceProject,
          workspace_label: project === 'one_time_mishnah_class' ? 'One Time Mishnah Class' : 'BNA',
        },
        {
          id: 'student-event-1',
          source_type: 'accountability_event',
          title: 'TEST-BNA-SEED Student event',
          occurred_at: '2026-06-17T12:00:00+03:00',
          status: 'completed',
          project_key: workspaceProject,
          workspace_label: project === 'one_time_mishnah_class' ? 'One Time Mishnah Class' : 'BNA',
        },
        {
          id: 'group-goal-1',
          source_type: 'group_goal',
          title: 'TEST-BNA-SEED Group goal',
          due_date: '2026-06-21',
          status: 'active',
          project_key: workspaceProject,
          workspace_label: project === 'one_time_mishnah_class' ? 'One Time Mishnah Class' : 'BNA',
        },
      ],
    },
    '/api/bna/assistant/status': {
      assistant: {
        visible_label: 'BNA Assistant',
        active_provider: 'openai',
        openai_configured: true,
        model: 'test-model',
        workspace_project: workspaceProject,
        user_role: 'super_admin',
        capabilities: ['operations_navigation', 'permissioned_action_registry'],
        disabled_until_verified: [],
      },
    },
    '/api/bna/assistant/memory': {
      scope: {
        project_key: workspaceProject,
        module_key: 'assistant',
        subject_type: 'workspace',
        subject_id: workspaceProject,
        user_scope: 'current_user',
        user_role: 'super_admin',
      },
      memories: [{ memory_key: 'test_seed_context', visibility: 'scoped' }],
    },
    '/api/bna/assistant/actions': {
      actions: [
        {
          action_key: 'calendar.read_context',
          label: 'Read calendar context',
          module_key: 'calendar',
          method: 'GET',
          route: '/api/bna/calendar',
          enabled: true,
        },
      ],
    },
    '/api/bna/automations/status': {
      automations: project === 'one_time_mishnah_class'
        ? [
            {
              automation_key: 'content_drive_intake',
              title: 'TEST-BNA-SEED Content Drive Intake',
              owner: 'Operations',
              status: 'running',
              workspace_label: 'One Time Mishnah Class',
              project_key: 'one_time_mishnah_class',
              last_run_at: '2026-06-18T12:00:00+03:00',
              next_run_at: '2026-06-18T13:00:00+03:00',
              failure_reason: null,
              details: { active_count: 2 },
            },
            {
              automation_key: 'codex_task_automation',
              title: 'TEST-BNA-SEED System Work Automation',
              owner: 'System Work',
              status: 'failed',
              workspace_label: 'One Time Mishnah Class',
              project_key: 'one_time_mishnah_class',
              last_run_at: '2026-06-18T11:00:00+03:00',
              next_run_at: null,
              failure_reason: 'Needs operator approval before retry',
              details: { open_count: 1 },
            },
          ]
        : [
            {
              automation_key: 'payment_reminders',
              title: 'TEST-BNA-SEED BNA Payment Reminders',
              owner: 'Operations',
              status: 'ready',
              workspace_label: 'BNA',
              project_key: 'bna',
              last_run_at: '2026-06-18T09:00:00+03:00',
              next_run_at: '2026-06-19T09:00:00+03:00',
              failure_reason: null,
              details: { due_count: 0 },
            },
          ],
    },
    '/api/bna/integrations/status': {
      integrations: project === 'one_time_mishnah_class'
        ? [
            {
              provider: 'Buffer',
              platform: 'Facebook',
              status: 'connected',
              account_identity: 'facebook: One Time Page',
              last_check_at: '2026-06-18T12:05:00+03:00',
              needed_action: 'Ready to schedule drafts',
              failure_reason: null,
              workspace_label: 'One Time Mishnah Class',
              project_key: 'one_time_mishnah_class',
            },
            {
              provider: 'Buffer',
              platform: 'LinkedIn',
              status: 'not_connected',
              account_identity: '',
              last_check_at: null,
              needed_action: 'Connect LinkedIn profile',
              failure_reason: null,
              workspace_label: 'One Time Mishnah Class',
              project_key: 'one_time_mishnah_class',
            },
            {
              provider: 'Buffer',
              platform: 'YouTube',
              status: 'error',
              account_identity: 'youtube: One Time Channel',
              last_check_at: '2026-06-18T12:10:00+03:00',
              needed_action: 'Refresh Buffer permission',
              failure_reason: 'Buffer token lacks YouTube profile access',
              workspace_label: 'One Time Mishnah Class',
              project_key: 'one_time_mishnah_class',
            },
          ]
        : [
            {
              provider: 'Buffer',
              platform: 'Facebook',
              status: 'connected',
              account_identity: 'facebook: BNA Page',
              last_check_at: '2026-06-18T09:00:00+03:00',
              needed_action: 'Ready',
              failure_reason: null,
              workspace_label: 'BNA',
              project_key: 'bna',
            },
          ],
    },
    '/api/bna/users': {
      users: project === 'one_time_mishnah_class'
        ? [
            {
              id: 901,
              person_name: 'One Time Manager',
              login_username: 'one-time-manager',
              role: 'workspace_member',
              access_level: 'manager',
              active: true,
              project_key: 'one_time_mishnah_class',
              project_name: 'One Time Mishnah Class',
              project_short_name: 'One Time',
              workspace_name: 'One Time Mishnah Class',
            },
            {
              id: 902,
              person_name: 'One Time Viewer',
              login_username: 'one-time-viewer',
              role: 'workspace_member',
              access_level: 'viewer',
              active: false,
              project_key: 'one_time_mishnah_class',
              project_name: 'One Time Mishnah Class',
              project_short_name: 'One Time',
              workspace_name: 'One Time Mishnah Class',
            },
          ]
        : [
            {
              id: 900,
              person_name: 'BNA Admin',
              login_username: 'bna-admin',
              role: 'super_admin',
              access_level: 'owner',
              active: true,
              project_key: 'bna',
              project_name: 'BNA',
              project_short_name: 'BNA',
              workspace_name: 'BNA',
            },
          ],
    },
    '/api/bna/invitations': {
      invitations: project === 'one_time_mishnah_class'
        ? [
            {
              id: 951,
              person_name: 'One Time Invitee',
              email: 'invitee-one-time@example.invalid',
              role: 'workspace_member',
              access_level: 'member',
              status: 'pending',
              project_key: 'one_time_mishnah_class',
              project_name: 'One Time Mishnah Class',
              project_short_name: 'One Time',
              workspace_name: 'One Time Mishnah Class',
            },
          ]
        : [
            {
              id: 950,
              person_name: 'BNA Invitee',
              email: 'invitee-bna@example.invalid',
              role: 'workspace_member',
              access_level: 'member',
              status: 'pending',
              project_key: 'bna',
              project_name: 'BNA',
              project_short_name: 'BNA',
              workspace_name: 'BNA',
            },
          ],
    },
    '/api/bna/signups': {
      signups: [
        project === 'one_time_mishnah_class'
          ? {
              id: 701,
              parent_name: 'One Time Parent',
              student_name: 'One Time Learner',
              parent_email: 'one-time-parent@example.invalid',
              parent_phone: '0500000001',
              status: 'new',
              payment_status: 'paid',
              project_key: 'one_time_mishnah_class',
              project_name: 'One Time Mishnah Class',
              project_short_name: 'One Time',
              workspace_key: 'one_time_mishnah_class',
              workspace_name: 'One Time Mishnah Class',
              workspace_type: 'service_provider',
              tags: ['service-provider'],
            }
          : {
              id: 700,
              parent_name: 'BNA Parent',
              student_name: 'BNA Learner',
              parent_email: 'bna-parent@example.invalid',
              parent_phone: '0500000000',
              status: 'new',
              payment_status: 'open',
              project_key: 'bna',
              project_name: 'BNA',
              project_short_name: 'BNA',
              workspace_key: 'bna',
              workspace_name: 'BNA',
              workspace_type: 'school',
              tags: ['school'],
            },
      ],
    },
    '/api/bna/payments': {
      payments: project === 'one_time_mishnah_class'
        ? [
            {
              id: 1001,
              signup_id: 701,
              amount: 1000,
              method: 'green_invoice',
              status: 'completed',
              received_at: '2026-06-18T12:20:00+03:00',
              workspace_label: 'One Time Mishnah Class',
              project_key: 'one_time_mishnah_class',
            },
          ]
        : [
            {
              id: 1000,
              signup_id: 700,
              amount: 1000,
              method: 'cash',
              status: 'completed',
              received_at: '2026-06-18T09:20:00+03:00',
              workspace_label: 'BNA',
              project_key: 'bna',
            },
          ],
    },
    '/api/bna/payment-intake': {
      intake: project === 'one_time_mishnah_class'
        ? [
            {
              id: 1101,
              parent_name: 'One Time Cash Parent',
              student_name: 'One Time Cash Learner',
              parent_email: 'cash-one-time@example.invalid',
              parent_phone: '0500000002',
              amount: 750,
              method: 'cash',
              status: 'needs_signup',
              received_at: '2026-06-18T12:25:00+03:00',
              workspace_label: 'One Time Mishnah Class',
              project_key: 'one_time_mishnah_class',
            },
          ]
        : [
            {
              id: 1100,
              parent_name: 'BNA Cash Parent',
              student_name: 'BNA Cash Learner',
              parent_email: 'cash-bna@example.invalid',
              parent_phone: '0500000003',
              amount: 650,
              method: 'cash',
              status: 'needs_signup',
              received_at: '2026-06-18T09:25:00+03:00',
              workspace_label: 'BNA',
              project_key: 'bna',
            },
          ],
    },
    '/api/bna/payment-reminders/due': {
      found: project === 'one_time_mishnah_class' ? 1 : 0,
      reminderTarget: '2026-06-23',
      reminders: project === 'one_time_mishnah_class'
        ? [
            {
              parent_name: 'One Time Parent',
              student_name: 'One Time Learner',
              parent_email: 'one-time-parent@example.invalid',
              payment_amount: 1000,
              payment_due_date: '2026-06-22',
              language: 'en',
            },
          ]
        : [],
      due: [],
    },
    '/api/bna/green-invoice/webhooks': {
      events: project === 'one_time_mishnah_class'
        ? [
            {
              id: 1201,
              event_type: 'payment.created',
              transaction_id: 'one-time-txn-001',
              payer_name: 'One Time Invoice Parent',
              amount: 1000,
              status: 'matched',
              webhook_received_at: '2026-06-18T12:30:00+03:00',
              signup: { parent_name: 'One Time Parent' },
              student: { name: 'One Time Learner' },
            },
          ]
        : [
            {
              id: 1200,
              event_type: 'payment.created',
              transaction_id: 'bna-txn-001',
              payer_name: 'BNA Invoice Parent',
              amount: 1000,
              status: 'matched',
              webhook_received_at: '2026-06-18T09:30:00+03:00',
              signup: { parent_name: 'BNA Parent' },
              student: { name: 'BNA Learner' },
            },
          ],
    },
    '/api/bna/content-jobs': {
      jobs: [
        {
          id: 801,
          title: 'TEST-BNA-SEED Mishnah teaching clip',
          source_type: 'video',
          status: 'transcribed',
          project_key: workspaceProject,
          project_name: project === 'one_time_mishnah_class' ? 'One Time Mishnah Class' : 'BNA',
          project_short_name: project === 'one_time_mishnah_class' ? 'One Time' : 'BNA',
          workspace_key: project === 'one_time_mishnah_class' ? 'one_time_mishnah_class' : 'bna',
          workspace_name: project === 'one_time_mishnah_class' ? 'One Time Mishnah Class' : 'BNA',
          workspace_type: project === 'one_time_mishnah_class' ? 'service_provider' : 'school',
          workspace_label: project === 'one_time_mishnah_class' ? 'One Time Mishnah Class' : 'BNA',
          workspace_short_label: project === 'one_time_mishnah_class' ? 'One Time' : 'BNA',
          transcript_status: 'transcribed',
          transcript_text: 'The class explored a Mishnah about found objects.',
          parse_status: 'parsed',
          output_count: 3,
          needs_approval_output_count: 1,
          approved_output_count: 1,
          published_output_count: 1,
          latest_output_at: '2026-06-18T13:00:00+03:00',
          drive_stage: 'workspace_imported',
          drive_file_id: 'drive-file-801',
          drive_folder_id: project === 'one_time_mishnah_class' ? 'drive-folder-one-time' : 'drive-folder-bna',
          source_message_id: 'telegram-message-801',
          source_chat_id: 'telegram-chat-801',
          mime_type: 'video/mp4',
          media_url: 'https://example.invalid/content/801.mp4',
          local_path: 'media/content/TEST-BNA-SEED-801.mp4',
          created_at: '2026-06-18T12:00:00+03:00',
          updated_at: '2026-06-18T12:30:00+03:00',
          parse_json: {
            parsed_at: '2026-06-18T12:35:00+03:00',
            summary: 'Students explored how a Mishnah frames responsibility for found objects.',
            topics: [
              'Mishnah structure for lost objects',
              'Torah progress update: 50 percent',
            ],
            discussions: [
              'Why does the Mishnah separate owner despair from finder responsibility?',
              'Review accountability notes for Menachem',
            ],
            sources: [
              'Bava Metzia 2a',
              'timer update 20 minutes',
            ],
            highlights: [
              'Use the case distinction as a discussion opener',
              'parser fallback: make a task',
            ],
          },
          outputs: [],
        },
      ],
    },
    '/api/bna/content-prompts': { prompts: [] },
    '/api/bna/content-bundles': { bundles: [] },
    '/api/bna/students': { students: project === 'one_time_mishnah_class' ? [] : [student] },
    '/api/bna/devices': {
      devices: [
        {
          id: 501,
          workspace_id: 1,
          student_id: TEST_STUDENT_ID,
          device_name: 'TEST-BNA-SEED Tablet',
          status: 'approved_access',
          provider: 'mock',
          active_session: {
            started_at: '2026-06-19T18:00:00+03:00',
            expires_at: '2026-06-19T19:00:00+03:00',
          },
        },
      ],
    },
    '/api/bna/device-access-rules': { rules: [] },
    '/api/bna/torah-learning': {
      group: { groupPercentage: 50 },
      students: [{ id: TEST_STUDENT_ID, percentage: 50, daily_completion_percentage: 50 }],
    },
    '/api/bna/accountability': { events: [goal] },
    '/api/bna/group-goals': { goals: [] },
  };

  return routes[pathname] || null;
}

function studentPortalFixture() {
  return {
    student: fixtureStudent(),
    torah: {
      public_trip_percentage: 50,
      daily_completion_percentage: 50,
      morning_goal_status: 'in_progress',
    },
    device_access: {
      status: 'approved_access',
      status_label: 'approved_access',
      device_count: 1,
      expires_at: '2026-06-19T19:00:00+03:00',
    },
    goals: [
      {
        id: 401,
        title: 'TEST-BNA-SEED: Finish today honestly',
        bucket: 'today',
        status: 'active',
        progress_percent: 50,
        goal_target_value: 1,
        goal_actual_value: 0.5,
        goal_unit: 'checkoff',
        source_label: 'BNA',
        urgency: 'today',
        due_at: '2026-06-19T20:00:00+03:00',
        agreement: {
          bedtime_time: '21:30',
          wake_time: '07:00',
          student_commitment: 'I will check off honestly.',
          chosen_consequence: 'Review with rebbi',
        },
        consequence: {
          success_device_access_state: 'approved_access',
          success_duration_minutes: 60,
        },
        student_summary: 'Student sees only the assigned goal summary.',
      },
    ],
  };
}

async function installFixtureRoutes(context, calls, options = {}) {
  await context.route('**/api/bna/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const rawBody = request.postData();
    let body = null;
    if (rawBody) {
      try {
        body = JSON.parse(rawBody);
      } catch {
        body = rawBody;
      }
    }
    calls.push({ body, method: request.method(), pathname: url.pathname, search: url.search, project: projectFrom(url) });
    if (request.method() === 'PATCH' && /^\/api\/bna\/tasks\/\d+$/.test(url.pathname)) {
      const taskId = Number(url.pathname.split('/').pop());
      await route.fulfill(jsonResponse({ success: true, task: { id: taskId, ...(body || {}) } }));
      return;
    }
    const payload = operationsFixture(url.pathname, url, options);
    if (!payload) {
      await route.fulfill(jsonResponse({ error: `Unhandled test fixture route: ${url.pathname}` }));
      return;
    }
    await route.fulfill(jsonResponse(payload));
  });

  await context.route('**/api/student-portal**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    calls.push({ method: request.method(), pathname: url.pathname, search: url.search, project: '' });
    await route.fulfill(jsonResponse(studentPortalFixture()));
  });
}

async function noHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  assert.ok(metrics.scrollWidth <= metrics.clientWidth + 1, JSON.stringify(metrics));
}

async function assertOperationsShellStable(page, label) {
  await page.locator('.ops-app-shell').waitFor();
  await page.locator('.ops-view-frame').waitFor();
  const metrics = await page.evaluate(() => {
    const shell = document.querySelector('.ops-app-shell');
    const frame = document.querySelector('.ops-view-frame');
    const shellBox = shell?.getBoundingClientRect();
    const frameBox = frame?.getBoundingClientRect();
    return {
      shellHeight: shellBox?.height || 0,
      frameHeight: frameBox?.height || 0,
      frameWidth: frameBox?.width || 0,
      currentView: frame?.getAttribute('data-current-view') || '',
    };
  });
  assert.ok(metrics.shellHeight > 300, `${label} shell collapsed: ${JSON.stringify(metrics)}`);
  assert.ok(metrics.frameHeight > 180, `${label} frame collapsed: ${JSON.stringify(metrics)}`);
  assert.ok(metrics.frameWidth > 200, `${label} frame width collapsed: ${JSON.stringify(metrics)}`);
  assert.ok(metrics.currentView, `${label} missing current view: ${JSON.stringify(metrics)}`);
  await noHorizontalOverflow(page);
}

async function assertOperationsIdentity(page) {
  const identity = await page.evaluate(() => ({
    manifest: document.querySelector('link[rel="manifest"]')?.getAttribute('href') || '',
    hasOpsLogo: Array.from(document.images).some((img) => (
      img.classList.contains('ops-brand-logo')
        && img.getAttribute('alt') === "Bnei Nevi'im Academy"
        && img.getAttribute('src') === '/images/bna-logo-nobg.png'
    )),
    hasMobileLogo: Array.from(document.images).some((img) => (
      img.classList.contains('mobile-brand-logo')
        && img.getAttribute('alt') === "Bnei Nevi'im Academy"
        && img.getAttribute('src') === '/images/bna-logo-nobg.png'
    )),
    text: document.body.textContent || '',
  }));
  assert.equal(identity.manifest, '/operations-manifest.json');
  assert.ok(identity.hasOpsLogo, JSON.stringify(identity));
  assert.ok(identity.hasMobileLogo, JSON.stringify(identity));
  assert.match(identity.text, /BNA Operations/);
  assert.match(identity.text, /Private Operations portal/);
  assert.match(identity.text, /EN/);
}

async function assertOperationsDesignSystem(page) {
  await page.locator('.focus-panel').first().waitFor();
  await page.locator('.metric-button').first().waitFor();
  const styles = await page.evaluate(() => {
    function colorFromToken(name) {
      const probe = document.createElement('span');
      probe.style.color = `var(${name})`;
      document.body.append(probe);
      const value = getComputedStyle(probe).color;
      probe.remove();
      return value;
    }

    function read(selector) {
      const node = document.querySelector(selector);
      if (!node) return null;
      const computed = getComputedStyle(node);
      return {
        backgroundColor: computed.backgroundColor,
        borderColor: computed.borderColor,
        borderRadius: computed.borderRadius,
        color: computed.color,
        minHeight: computed.minHeight,
        outlineColor: computed.outlineColor,
        outlineOffset: computed.outlineOffset,
        outlineWidth: computed.outlineWidth,
      };
    }

    const focusedButton = document.querySelector('.ops-module-button');
    focusedButton?.focus?.({ preventScroll: true });

    return {
      tokens: {
        surface: colorFromToken('--ops-surface'),
        border: colorFromToken('--ops-border'),
        textMuted: colorFromToken('--ops-text-muted'),
        gold: colorFromToken('--ops-gold'),
        bg: colorFromToken('--ops-bg'),
        focus: colorFromToken('--ops-focus'),
      },
      shellLetterSpacing: getComputedStyle(document.querySelector('.ops-app-shell')).letterSpacing,
      focusPanel: read('.focus-panel'),
      metricButton: read('.metric-button'),
      moduleButton: read('.ops-module-button'),
      activeMarker: read('.ops-module-button.active .ops-module-marker'),
    };
  });

  assert.match(styles.shellLetterSpacing, /^(0px|normal)$/);
  assert.equal(styles.focusPanel.backgroundColor, styles.tokens.surface);
  assert.equal(styles.focusPanel.borderColor, styles.tokens.border);
  assert.equal(styles.focusPanel.borderRadius, '8px');
  assert.equal(styles.focusPanel.color, styles.tokens.textMuted);
  assert.equal(styles.metricButton.backgroundColor, styles.tokens.surface);
  assert.equal(styles.metricButton.borderRadius, '8px');
  assert.ok(parseFloat(styles.metricButton.minHeight) >= 36, JSON.stringify(styles.metricButton));
  assert.equal(styles.moduleButton.borderRadius, '8px');
  assert.ok(parseFloat(styles.moduleButton.minHeight) >= 36, JSON.stringify(styles.moduleButton));
  assert.equal(styles.moduleButton.outlineColor, styles.tokens.focus);
  assert.equal(styles.moduleButton.outlineOffset, '2px');
  assert.equal(styles.moduleButton.outlineWidth, '3px');
  assert.equal(styles.activeMarker.backgroundColor, styles.tokens.gold);
}

async function assertOperationsMobileControls(page) {
  const viewport = page.viewportSize();
  assert.ok(viewport && viewport.width <= 768, JSON.stringify(viewport));
  await page.locator('.section-tab-list').waitFor();
  const overviewMetrics = await page.evaluate(() => {
    function rect(selector) {
      const node = document.querySelector(selector);
      if (!node) return null;
      const box = node.getBoundingClientRect();
      const computed = getComputedStyle(node);
      return {
        height: box.height,
        width: box.width,
        clientWidth: node.clientWidth,
        scrollWidth: node.scrollWidth,
        display: computed.display,
        flexWrap: computed.flexWrap,
        overflowX: computed.overflowX,
        scrollSnapType: computed.scrollSnapType,
      };
    }

    return {
      moduleRail: rect('.ops-module-list'),
      moduleButton: rect('.ops-module-button'),
      sectionRail: rect('.section-tab-list'),
      sectionTab: rect('.section-tab'),
    };
  });
  assert.equal(overviewMetrics.sectionRail.display, 'flex');
  assert.equal(overviewMetrics.sectionRail.overflowX, 'auto');
  assert.match(overviewMetrics.sectionRail.scrollSnapType, /^x( proximity)?$/);
  assert.equal(overviewMetrics.moduleRail.overflowX, 'auto');
  assert.ok(overviewMetrics.moduleButton.height >= 44, JSON.stringify(overviewMetrics.moduleButton));
  assert.ok(overviewMetrics.sectionTab.height >= 44, JSON.stringify(overviewMetrics.sectionTab));

  await page.locator('.section-tab').filter({ hasText: 'Decisions' }).first().click();
  await page.locator('.task-row').first().waitFor();
  const laneMetrics = await page.evaluate(() => {
    function rect(selector) {
      const node = document.querySelector(selector);
      if (!node) return null;
      const box = node.getBoundingClientRect();
      const computed = getComputedStyle(node);
      return {
        height: box.height,
        flexDirection: computed.flexDirection,
        flexWrap: computed.flexWrap,
        overflowX: computed.overflowX,
      };
    }

    return {
      filterChip: rect('.filter-chip'),
      taskAction: rect('.task-action'),
      taskRowActions: rect('.task-row-actions'),
    };
  });
  assert.ok(laneMetrics.filterChip.height >= 44, JSON.stringify(laneMetrics.filterChip));
  assert.ok(laneMetrics.taskAction.height >= 44, JSON.stringify(laneMetrics.taskAction));
  assert.equal(laneMetrics.taskRowActions.flexDirection, 'row');
  assert.equal(laneMetrics.taskRowActions.flexWrap, 'nowrap');
  assert.equal(laneMetrics.taskRowActions.overflowX, 'auto');

  await page.locator('.task-row').first().click({ position: { x: 20, y: 20 } });
  await page.locator('#taskModal.show .modal-footer').waitFor();
  const modalMetrics = await page.evaluate(() => {
    const footer = document.querySelector('#taskModal.show .modal-footer');
    const button = footer?.querySelector('.btn');
    const close = document.querySelector('#taskModal.show .modal-close');
    const footerBox = footer?.getBoundingClientRect();
    const buttonBox = button?.getBoundingClientRect();
    const closeBox = close?.getBoundingClientRect();
    const footerStyle = footer ? getComputedStyle(footer) : null;
    const footerContentWidth = footerStyle && footerBox
      ? footerBox.width - parseFloat(footerStyle.paddingLeft || '0') - parseFloat(footerStyle.paddingRight || '0')
      : 0;
    return {
      footer: {
        bottom: footerStyle?.bottom || '',
        contentWidth: footerContentWidth,
        flexDirection: footerStyle?.flexDirection || '',
        position: footerStyle?.position || '',
        width: footerBox?.width || 0,
      },
      button: {
        height: buttonBox?.height || 0,
        width: buttonBox?.width || 0,
      },
      close: {
        height: closeBox?.height || 0,
      },
    };
  });
  assert.equal(modalMetrics.footer.position, 'sticky');
  assert.equal(modalMetrics.footer.bottom, '0px');
  assert.equal(modalMetrics.footer.flexDirection, 'column');
  assert.ok(modalMetrics.button.height >= 44, JSON.stringify(modalMetrics.button));
  assert.ok(Math.abs(modalMetrics.button.width - modalMetrics.footer.contentWidth) <= 2, JSON.stringify(modalMetrics));
  assert.ok(modalMetrics.close.height >= 44, JSON.stringify(modalMetrics.close));

  await page.locator('#taskModal.show .modal-close').click();
  await page.waitForFunction(() => !document.querySelector('#taskModal')?.classList.contains('show'));
  await page.locator('.section-tab').filter({ hasText: 'Overview' }).first().click();
  await page.locator('.focus-panel[aria-label="Tasks overview"]').waitFor();
}

async function assertOperationsDesktopGrids(page) {
  const viewport = page.viewportSize();
  assert.ok(viewport && viewport.width >= 1024, JSON.stringify(viewport));
  await page.locator('.focus-panel[aria-label="Tasks overview"] .focused-grid').waitFor();
  const grids = await page.evaluate(() => {
    function gridMetrics(selector, childSelector) {
      const node = document.querySelector(selector);
      if (!node) return null;
      const computed = getComputedStyle(node);
      const trackWidths = computed.gridTemplateColumns
        .split(/\s+/)
        .map((value) => Number.parseFloat(value))
        .filter((value) => Number.isFinite(value) && value > 0);
      const childWidths = Array.from(node.querySelectorAll(childSelector))
        .map((child) => child.getBoundingClientRect().width)
        .filter((width) => width > 0);
      return {
        childWidths,
        display: computed.display,
        gridTemplateColumns: computed.gridTemplateColumns,
        trackWidths,
      };
    }

    return {
      taskOverview: gridMetrics('.focus-panel[aria-label="Tasks overview"] .focused-grid', '.metric-button'),
    };
  });

  for (const [label, grid] of Object.entries(grids)) {
    assert.equal(grid.display, 'grid', `${label} should render as grid`);
    assert.ok(grid.trackWidths.length >= 2, `${label} needs multiple desktop tracks: ${JSON.stringify(grid)}`);
    assert.ok(Math.min(...grid.trackWidths) >= 170, `${label} track too narrow: ${JSON.stringify(grid)}`);
    assert.ok(
      Math.max(...grid.trackWidths) - Math.min(...grid.trackWidths) <= 24,
      `${label} tracks are imbalanced: ${JSON.stringify(grid)}`,
    );
    assert.ok(grid.childWidths.length >= 2, `${label} should render multiple cards: ${JSON.stringify(grid)}`);
    assert.ok(
      Math.max(...grid.childWidths) - Math.min(...grid.childWidths) <= 24,
      `${label} cards are imbalanced: ${JSON.stringify(grid)}`,
    );
  }
}

async function assertStudentProfileDesktopGrid(page) {
  const viewport = page.viewportSize();
  assert.ok(viewport && viewport.width >= 1024, JSON.stringify(viewport));
  await page.locator('.student-profile-grid').first().waitFor();
  const grid = await page.evaluate(() => {
    const node = document.querySelector('.student-profile-grid');
    const computed = getComputedStyle(node);
    return {
      display: computed.display,
      gridTemplateColumns: computed.gridTemplateColumns,
      trackWidths: computed.gridTemplateColumns
        .split(/\s+/)
        .map((value) => Number.parseFloat(value))
        .filter((value) => Number.isFinite(value) && value > 0),
    };
  });
  assert.equal(grid.display, 'grid');
  assert.equal(grid.trackWidths.length, 2, JSON.stringify(grid));
  assert.ok(Math.min(...grid.trackWidths) >= 260, JSON.stringify(grid));
  assert.ok(Math.max(...grid.trackWidths) - Math.min(...grid.trackWidths) <= 24, JSON.stringify(grid));
}

async function assertOperationsAccessibility(page) {
  await page.locator('.section-tab').filter({ hasText: 'Decisions' }).first().click();
  const taskRow = page.locator('.task-row').first();
  await taskRow.waitFor();
  const taskRowState = await taskRow.evaluate((node) => ({
    ariaLabel: node.getAttribute('aria-label') || '',
    role: node.getAttribute('role') || '',
    tabIndex: node.getAttribute('tabindex') || '',
  }));
  assert.equal(taskRowState.role, 'button');
  assert.equal(taskRowState.tabIndex, '0');
  assert.match(taskRowState.ariaLabel, /^Open task:/);

  await taskRow.focus();
  await page.keyboard.press('Enter');
  await page.locator('#taskModal.show').waitFor();
  await page.waitForFunction(() => document.activeElement?.id === 'taskTitle');
  const modalState = await page.evaluate(() => {
    const modalOverlay = document.querySelector('#taskModal');
    const dialog = modalOverlay?.querySelector('.modal');
    const close = modalOverlay?.querySelector('.modal-close');
    const description = document.querySelector('#taskModalDescription');
    const activeTab = document.querySelector('.section-tab.active');
    return {
      activeElementId: document.activeElement?.id || '',
      ariaHidden: modalOverlay?.getAttribute('aria-hidden') || '',
      ariaModal: dialog?.getAttribute('aria-modal') || '',
      closeLabel: close?.getAttribute('aria-label') || '',
      describedBy: dialog?.getAttribute('aria-describedby') || '',
      descriptionHidden: description?.classList.contains('sr-only') || false,
      descriptionText: description?.textContent?.trim() || '',
      labelledBy: dialog?.getAttribute('aria-labelledby') || '',
      role: dialog?.getAttribute('role') || '',
      tabPressed: activeTab?.getAttribute('aria-pressed') || '',
      tabCurrent: activeTab?.getAttribute('aria-current') || '',
    };
  });
  assert.equal(modalState.activeElementId, 'taskTitle');
  assert.equal(modalState.ariaHidden, 'false');
  assert.equal(modalState.role, 'dialog');
  assert.equal(modalState.ariaModal, 'true');
  assert.equal(modalState.labelledBy, 'taskModalTitle');
  assert.equal(modalState.describedBy, 'taskModalDescription');
  assert.equal(modalState.closeLabel, 'Close task details');
  assert.equal(modalState.descriptionHidden, true);
  assert.match(modalState.descriptionText, /Review or edit task fields/);
  assert.equal(modalState.tabPressed, 'true');
  assert.equal(modalState.tabCurrent, 'page');

  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('#taskModal')?.classList.contains('show'));
  await page.waitForFunction(() => document.activeElement?.classList?.contains('task-row'));
  const restoredFocus = await page.evaluate(() => ({
    ariaLabel: document.activeElement?.getAttribute('aria-label') || '',
    rowId: document.activeElement?.getAttribute('data-task-row-id') || '',
  }));
  assert.match(restoredFocus.ariaLabel, /^Open task:/);
  assert.ok(restoredFocus.rowId);

  await page.locator('.section-tab').filter({ hasText: 'Overview' }).first().click();
  await page.locator('.focus-panel[aria-label="Tasks overview"]').waitFor();
}

async function assertOperationsTaskStateModel(page) {
  await page.locator('.section-tab').filter({ hasText: 'Decisions' }).first().click();
  const legacyRow = page.locator('.task-row').filter({ hasText: 'legacy alias task' }).first();
  await legacyRow.waitFor();
  const legacyState = await legacyRow.evaluate((node) => ({
    actionText: node.querySelector('.task-row-actions')?.textContent || '',
    text: node.textContent || '',
  }));
  assert.match(legacyState.text, /Status:\s*Decision/);
  assert.match(legacyState.actionText, /Turn into my task/);
  assert.match(legacyState.actionText, /Hide/);

  await legacyRow.click({ position: { x: 20, y: 20 } });
  await page.locator('#taskModal.show').waitFor();
  await page.waitForFunction(() => document.getElementById('taskStage')?.value === 'decision_required');
  const modalState = await page.evaluate(() => ({
    decisionRequiredChecked: document.getElementById('taskDecisionRequired')?.checked || false,
    stageOptions: Array.from(document.querySelectorAll('#taskStage option')).map((option) => option.value),
    stageValue: document.getElementById('taskStage')?.value || '',
  }));
  assert.equal(modalState.stageValue, 'decision_required');
  assert.equal(modalState.decisionRequiredChecked, true);
  assert.deepEqual(modalState.stageOptions, [
    'decision_required',
    'ready',
    'in_progress',
    'blocked',
    'done',
    'archived',
  ]);

  await page.locator('#taskModal.show .modal-close').click();
  await page.waitForFunction(() => !document.querySelector('#taskModal')?.classList.contains('show'));
  await page.locator('.section-tab').filter({ hasText: 'Overview' }).first().click();
  await page.locator('.focus-panel[aria-label="Tasks overview"]').waitFor();
}

async function assertOperationsTaskMetadataProvenance(page) {
  await page.locator('.section-tab').filter({ hasText: 'Decisions' }).first().click();
  const taskRow = page.locator('.task-row').filter({ hasText: 'BNA acceptance task' }).first();
  await taskRow.waitFor();
  const rowState = await taskRow.evaluate((node) => ({
    badges: Object.fromEntries(Array.from(node.querySelectorAll('[data-task-meta]')).map((badge) => [
      badge.getAttribute('data-task-meta'),
      badge.textContent.replace(/\s+/g, ' ').trim(),
    ])),
    text: node.textContent || '',
    title: node.querySelector('.task-row-title')?.textContent?.trim() || '',
  }));
  assert.equal(rowState.title, 'BNA acceptance task');
  assert.doesNotMatch(rowState.text, /Raw operator ramble should stay out of the visible title/);
  assert.match(rowState.badges.owner, /Owner:\s*System Work/);
  assert.match(rowState.badges.status, /Status:\s*Decision/);
  assert.match(rowState.badges.urgency, /Urgency:\s*Today/);
  assert.match(rowState.badges.due, /Due:\s*20 Jun/);
  assert.match(rowState.badges.blocker, /Blocker:\s*Needs operator choice/);
  assert.match(rowState.badges.source, /Source:\s*Raw RAW-TEST-001/);

  await taskRow.click({ position: { x: 20, y: 20 } });
  await page.locator('#taskModal.show').waitFor();
  const modalState = await page.evaluate(() => {
    const provenance = document.querySelector('[aria-label="Task provenance"]');
    return {
      blockerValue: document.getElementById('taskBlockerReason')?.value || '',
      provenanceText: provenance?.textContent?.replace(/\s+/g, ' ').trim() || '',
      titleValue: document.getElementById('taskTitle')?.value || '',
    };
  });
  assert.equal(modalState.titleValue, 'BNA acceptance task');
  assert.equal(modalState.blockerValue, 'Needs operator choice');
  assert.match(modalState.provenanceText, /Source:\s*Raw RAW-TEST-001/);
  assert.match(modalState.provenanceText, /Raw ID:\s*RAW-TEST-001/);
  assert.doesNotMatch(modalState.titleValue, /Raw operator ramble/);

  await page.locator('#taskModal.show .modal-close').click();
  await page.waitForFunction(() => !document.querySelector('#taskModal')?.classList.contains('show'));
  await page.locator('.section-tab').filter({ hasText: 'Overview' }).first().click();
  await page.locator('.focus-panel[aria-label="Tasks overview"]').waitFor();
}

async function assertOperationsIntakeRoutingDecisions(page, calls) {
  await page.locator('.section-tab').filter({ hasText: 'Decisions' }).first().click();
  const routingRow = page.locator('.task-row').filter({ hasText: 'Decide where to route captured intake' }).first();
  await routingRow.waitFor();
  const laneState = await routingRow.evaluate((node) => ({
    actionText: node.querySelector('.task-row-actions')?.textContent?.replace(/\s+/g, ' ').trim() || '',
    bodyText: document.body.textContent || '',
    detail: node.querySelector('.task-row-detail')?.textContent?.trim() || '',
    title: node.querySelector('.task-row-title')?.textContent?.trim() || '',
  }));
  assert.equal(laneState.title, 'Decide where to route captured intake');
  assert.match(laneState.detail, /Low-confidence intake needs an operator routing choice/);
  assert.match(laneState.actionText, /File as my task/);
  assert.match(laneState.actionText, /Send to System Work/);
  assert.match(laneState.actionText, /Archive/);
  assert.doesNotMatch(laneState.actionText, /Send to Codex/);
  assert.doesNotMatch(laneState.bodyText, /Review Queue|Intake Review/);

  await routingRow.locator('.task-action').filter({ hasText: 'Send to System Work' }).click();
  const routedCall = await waitForCall(
    calls,
    (call) => call.method === 'PATCH' && call.pathname === '/api/bna/tasks/203',
    'routing option task update',
  );
  assert.equal(routedCall.body.stage, 'ready');
  assert.equal(routedCall.body.decision_required, false);
  assert.equal(routedCall.body.assigned_to, 'Codex');
  assert.equal(routedCall.body.category, 'operations');
  assert.match(routedCall.body.notes, /Decision chosen from dashboard: Send to System Work - system_work/);

  await page.locator('.section-tab').filter({ hasText: 'Overview' }).first().click();
  await page.locator('.focus-panel[aria-label="Tasks overview"]').waitFor();
}

async function assertOperationsLiveCountsBlockers(page) {
  await page.locator('.ops-module-button').filter({ hasText: 'Tasks' }).click();
  await page.locator('.focus-panel[aria-label="Tasks overview"]').waitFor();
  const overviewState = await page.evaluate(() => {
    const metrics = Object.fromEntries(Array.from(document.querySelectorAll('.metric-button')).map((button) => {
      const label = button.querySelector('.metric-label')?.textContent?.trim() || '';
      return [label, {
        note: button.querySelector('.metric-note')?.textContent?.trim() || '',
        value: button.querySelector('.metric-value')?.textContent?.trim() || '',
      }];
    }));
    const blockedSection = document.querySelector('#blockedTasksSection');
    return {
      blockedText: blockedSection?.textContent?.replace(/\s+/g, ' ').trim() || '',
      metrics,
      statusPills: Array.from(document.querySelectorAll('.page-status-pill')).map((node) => node.textContent.trim()),
    };
  });
  assert.equal(overviewState.metrics['Urgent / Today'].value, '3');
  assert.equal(overviewState.metrics.Decisions.value, '3');
  assert.equal(overviewState.metrics.Blocked.value, '1');
  assert.equal(overviewState.metrics.Blocked.note, 'Open blocked records with blocker notes.');
  assert.ok(overviewState.statusPills.includes('1 blocked'), JSON.stringify(overviewState.statusPills));
  assert.match(overviewState.blockedText, /Blocked Work/);
  assert.match(overviewState.blockedText, /TEST-BNA-SEED blocked task/);
  assert.match(overviewState.blockedText, /Blocker:\s*Needs access to provider portal/);

  await page.locator('.metric-button').filter({ hasText: 'Blocked' }).click();
  await page.locator('#blockedTasksSection .task-row').filter({ hasText: 'TEST-BNA-SEED blocked task' }).waitFor();
}

async function assertOperationsTaskDiagnosticsClean(page) {
  await page.locator('.ops-module-button').filter({ hasText: 'Tasks' }).click();
  await page.locator('.focus-panel[aria-label="Tasks overview"]').waitFor();
  const overviewState = await page.evaluate(() => {
    const taskView = document.querySelector('.ops-view-frame[data-current-view="tasks"]');
    return {
      text: taskView?.textContent?.replace(/\s+/g, ' ').trim() || '',
      tabs: Array.from(document.querySelectorAll('.section-tab')).map((node) => node.textContent.trim()),
    };
  });
  for (const forbidden of [
    /Queue Health/i,
    /Track Agent Work/i,
    /Handoff Files/i,
    /Do Not Restart/i,
    /proof[- ]gap/i,
    /worker diagnostics/i,
    /Changelog Queue Visibility/i,
    /Agent queue status/i,
    /Queued Agent Work/i,
    /No heartbeat recorded/i,
    /fresh heartbeat/i,
  ]) {
    assert.doesNotMatch(overviewState.text, forbidden);
  }
  assert.ok(overviewState.tabs.includes('Changelog'), JSON.stringify(overviewState.tabs));
  assert.match(overviewState.text, /Implementation activity lives in Changelog/);

  await page.locator('.section-tab').filter({ hasText: 'Changelog' }).first().click();
  await page.locator('.focus-panel[aria-label="Changelog"]').waitFor();
  const changelogText = await page.locator('.focus-panel[aria-label="Changelog"]').textContent();
  assert.match(changelogText || '', /Activity trail|Changelog/);
  assert.doesNotMatch(changelogText || '', /Queue Health|Track Agent Work|Handoff Files|Do Not Restart|worker diagnostics/i);

  await page.locator('.section-tab').filter({ hasText: 'Overview' }).first().click();
  await page.locator('.focus-panel[aria-label="Tasks overview"]').waitFor();
}

async function assertOperationsCalendarModule(page) {
  await page.locator('.ops-module-button').filter({ hasText: 'Calendar' }).click();
  await page.locator('.ops-view-frame[data-current-view="calendar"]').waitFor();
  await page.locator('.focus-panel[aria-label="Internal calendar"]').waitFor();
  const calendarState = await page.evaluate(() => {
    const panel = document.querySelector('.focus-panel[aria-label="Internal calendar"]');
    return {
      panelText: panel?.textContent?.replace(/\s+/g, ' ').trim() || '',
      pageText: document.body.textContent?.replace(/\s+/g, ' ').trim() || '',
    };
  });
  assert.match(calendarState.panelText, /Calendar Items/);
  assert.match(calendarState.panelText, /TEST-BNA-SEED Task due/);
  assert.match(calendarState.panelText, /Task/);
  assert.match(calendarState.panelText, /TEST-BNA-SEED Live class/);
  assert.match(calendarState.panelText, /Class/);
  assert.match(calendarState.panelText, /TEST-BNA-SEED Student check-in/);
  assert.match(calendarState.panelText, /Check-in/);
  assert.match(calendarState.panelText, /TEST-BNA-SEED Student event/);
  assert.match(calendarState.panelText, /Student Event/);
  assert.match(calendarState.panelText, /TEST-BNA-SEED Group goal/);
  assert.match(calendarState.panelText, /Group Goal/);
  assert.doesNotMatch(calendarState.pageText, /google calendar|sync calendar|connect calendar/i);
}

async function assertOperationsLiveClassesWorkspaceScope(page, calls) {
  await page.locator('.ops-module-button').filter({ hasText: 'Calendar' }).click();
  await page.locator('.ops-view-frame[data-current-view="calendar"]').waitFor();
  await waitForCall(
    calls,
    (call) => call.pathname === '/api/bna/calendar' && call.project === 'one_time_mishnah_class',
    'Calendar request scoped to One Time workspace for class sessions',
  );
  await page.locator('.focus-panel[aria-label="Internal calendar"]').waitFor();
  const calendarState = await page.evaluate(() => {
    const panel = document.querySelector('.focus-panel[aria-label="Internal calendar"]');
    return {
      panelText: panel?.textContent?.replace(/\s+/g, ' ').trim() || '',
    };
  });
  assert.match(calendarState.panelText, /TEST-BNA-SEED Live class/);
  assert.match(calendarState.panelText, /Class/);
  assert.match(calendarState.panelText, /One Time Mishnah Class/);
  assert.doesNotMatch(calendarState.panelText, /TEST-BNA-SEED BNA-only class/);
}

async function assertOperationsAutomationsWorkspaceStatus(page, calls) {
  await page.locator('.ops-module-button').filter({ hasText: 'Automations' }).click();
  await page.locator('.ops-view-frame[data-current-view="automations"]').waitFor();
  await waitForCall(
    calls,
    (call) => call.pathname === '/api/bna/automations/status' && call.project === 'one_time_mishnah_class',
    'Automations status request scoped to One Time workspace',
  );
  await page.locator('.focus-panel[aria-label="Automation status"]').waitFor();
  const automationState = await page.evaluate(() => {
    const frame = document.querySelector('.ops-view-frame[data-current-view="automations"]');
    return {
      text: frame?.textContent?.replace(/\s+/g, ' ').trim() || '',
    };
  });
  assert.match(automationState.text, /2 tracked/);
  assert.match(automationState.text, /1 need attention/);
  assert.match(automationState.text, /TEST-BNA-SEED Content Drive Intake/);
  assert.match(automationState.text, /Owner\s*Operations/);
  assert.match(automationState.text, /Status\s*running/);
  assert.match(automationState.text, /Last Run/);
  assert.match(automationState.text, /Next Run/);
  assert.match(automationState.text, /Active:\s*2/);
  assert.match(automationState.text, /TEST-BNA-SEED System Work Automation/);
  assert.match(automationState.text, /Owner\s*System Work/);
  assert.match(automationState.text, /Status\s*failed/);
  assert.match(automationState.text, /Needs operator approval before retry/);
  assert.match(automationState.text, /Open:\s*1/);
  assert.match(automationState.text, /One Time Mishnah Class/);
  assert.doesNotMatch(automationState.text, /TEST-BNA-SEED BNA Payment Reminders/);
}

async function assertOperationsIntegrationsWorkspaceStatus(page, calls) {
  await page.locator('.ops-module-button').filter({ hasText: 'Integrations' }).click();
  await page.locator('.ops-view-frame[data-current-view="integrations"]').waitFor();
  await waitForCall(
    calls,
    (call) => call.pathname === '/api/bna/integrations/status' && call.project === 'one_time_mishnah_class',
    'Integrations status request scoped to One Time workspace',
  );
  await page.locator('.focus-panel[aria-label="Integration status"]').waitFor();
  const integrationState = await page.evaluate(() => {
    const frame = document.querySelector('.ops-view-frame[data-current-view="integrations"]');
    const panel = frame?.querySelector('.focus-panel[aria-label="Integration status"]');
    return {
      text: panel?.textContent?.replace(/\s+/g, ' ').trim() || '',
    };
  });
  assert.match(integrationState.text, /Connected\s*1/);
  assert.match(integrationState.text, /Errors\s*1/);
  assert.match(integrationState.text, /Targets\s*3/);
  assert.match(integrationState.text, /Buffer Facebook/);
  assert.match(integrationState.text, /Status\s*Connected/);
  assert.match(integrationState.text, /Account\s*facebook: One Time Page/);
  assert.match(integrationState.text, /Needed Action\s*Ready to schedule drafts/);
  assert.match(integrationState.text, /Buffer LinkedIn/);
  assert.match(integrationState.text, /Status\s*Not connected/);
  assert.match(integrationState.text, /Needed Action\s*Connect LinkedIn profile/);
  assert.match(integrationState.text, /Buffer YouTube/);
  assert.match(integrationState.text, /Status\s*Error/);
  assert.match(integrationState.text, /Account\s*youtube: One Time Channel/);
  assert.match(integrationState.text, /Needed Action\s*Refresh Buffer permission/);
  assert.match(integrationState.text, /Buffer token lacks YouTube profile access/);
  assert.match(integrationState.text, /One Time Mishnah Class/);
  assert.doesNotMatch(integrationState.text, /facebook: BNA Page/);
  assert.doesNotMatch(integrationState.text, /GHL|GoHighLevel|LeadConnector/i);
}

async function assertOperationsUsersWorkspaceScope(page, calls) {
  await page.locator('.ops-module-button').filter({ hasText: 'Users' }).click();
  await page.locator('.ops-view-frame[data-current-view="users"]').waitFor();
  await waitForCall(
    calls,
    (call) => call.pathname === '/api/bna/users' && call.project === 'one_time_mishnah_class',
    'Users request scoped to One Time workspace',
  );
  await waitForCall(
    calls,
    (call) => call.pathname === '/api/bna/invitations' && call.project === 'one_time_mishnah_class',
    'Invitations request scoped to One Time workspace',
  );
  await page.locator('.focus-panel[aria-label="Workspace users and invitations"]').waitFor();
  const usersState = await page.evaluate(() => {
    const panel = document.querySelector('.focus-panel[aria-label="Workspace users and invitations"]');
    return {
      text: panel?.textContent?.replace(/\s+/g, ' ').trim() || '',
    };
  });
  assert.match(usersState.text, /Users\s*2/);
  assert.match(usersState.text, /Active\s*1/);
  assert.match(usersState.text, /Invitations\s*1/);
  assert.match(usersState.text, /One Time Manager/);
  assert.match(usersState.text, /one-time-manager/);
  assert.match(usersState.text, /manager/);
  assert.match(usersState.text, /One Time Viewer/);
  assert.match(usersState.text, /one-time-viewer/);
  assert.match(usersState.text, /viewer/);
  assert.match(usersState.text, /One Time Invitee/);
  assert.match(usersState.text, /invitee-one-time@example\.invalid/);
  assert.match(usersState.text, /pending/);
  assert.match(usersState.text, /One Time/);
  assert.doesNotMatch(usersState.text, /BNA Admin|BNA Invitee|invitee-bna@example\.invalid/);
  assert.doesNotMatch(usersState.text, /Send invitation|Invite user|Create user|Delete user/i);
}

async function assertOperationsAccountingWorkspaceScope(page, calls) {
  await page.locator('.ops-module-button').filter({ hasText: 'Accounting' }).click();
  await page.locator('.ops-view-frame[data-current-view="accounting"]').waitFor();
  for (const [pathname, label] of [
    ['/api/bna/signups', 'Accounting signups request scoped to One Time workspace'],
    ['/api/bna/payments', 'Payments request scoped to One Time workspace'],
    ['/api/bna/payment-intake', 'Payment intake request scoped to One Time workspace'],
    ['/api/bna/payment-reminders/due', 'Payment reminders request scoped to One Time workspace'],
    ['/api/bna/green-invoice/webhooks', 'Green Invoice webhook request scoped to One Time workspace'],
  ]) {
    await waitForCall(
      calls,
      (call) => call.pathname === pathname && call.project === 'one_time_mishnah_class',
      label,
    );
  }
  const accountingFrame = page.locator('.ops-view-frame[data-current-view="accounting"]');
  const overviewState = await accountingFrame.locator('.container').first().evaluate((node) => ({
    text: node.textContent?.replace(/\s+/g, ' ').trim() || '',
  }));
  assert.match(overviewState.text, /Total records\s*2/);
  assert.match(overviewState.text, /Paid\s*2/);
  assert.match(overviewState.text, /Needs signup\s*1/);
  assert.match(overviewState.text, /One Time Cash Parent/);
  assert.doesNotMatch(overviewState.text, /BNA Cash Parent|BNA Invoice Parent/);

  await page.locator('.section-tab').filter({ hasText: 'Payments' }).click();
  await page.locator('.payment-roster').waitFor();
  const paymentsState = await accountingFrame.locator('.payment-roster').evaluate((node) => ({
    text: node.textContent?.replace(/\s+/g, ' ').trim() || '',
  }));
  assert.match(paymentsState.text, /One Time Parent/);
  assert.match(paymentsState.text, /One Time Learner/);
  assert.match(paymentsState.text, /one-time-parent@example\.invalid/);
  assert.match(paymentsState.text, /ILS 1000/);
  assert.match(paymentsState.text, /green_invoice/);
  assert.match(paymentsState.text, /Paid/);
  assert.match(paymentsState.text, /One Time Cash Parent/);
  assert.match(paymentsState.text, /Pre-signup payment/);
  assert.match(paymentsState.text, /cash-one-time@example\.invalid/);
  assert.match(paymentsState.text, /ILS 750/);
  assert.doesNotMatch(paymentsState.text, /BNA Parent|BNA Cash Parent|cash-bna@example\.invalid/);
}

async function assertOperationsContactsCommunityScope(page, calls) {
  await page.locator('.ops-module-button').filter({ hasText: 'Contacts' }).click();
  await page.locator('.ops-view-frame[data-current-view="contacts"]').waitFor();
  await waitForCall(
    calls,
    (call) => call.pathname === '/api/bna/signups' && call.project === 'one_time_mishnah_class',
    'Contacts signups request scoped to One Time workspace',
  );
  await page.locator('.contact-card').filter({ hasText: 'One Time Parent' }).waitFor();
  const contactsState = await page.evaluate(() => {
    const frame = document.querySelector('.ops-view-frame[data-current-view="contacts"]');
    return {
      detailText: frame?.querySelector('.contact-detail-panel')?.textContent?.replace(/\s+/g, ' ').trim() || '',
      headerText: frame?.querySelector('.page-heading')?.textContent?.replace(/\s+/g, ' ').trim() || '',
      listText: frame?.querySelector('.contact-list')?.textContent?.replace(/\s+/g, ' ').trim() || '',
    };
  });
  assert.match(contactsState.headerText, /Workspace:\s*Service provider:\s*One Time Mishnah Class/);
  assert.match(contactsState.headerText, /1 visible/);
  assert.match(contactsState.listText, /One Time Parent/);
  assert.match(contactsState.listText, /One Time Learner/);
  assert.match(contactsState.listText, /One Time/);
  assert.match(contactsState.detailText, /Workspace\s*One Time/);
  assert.match(contactsState.detailText, /one-time-parent@example\.invalid/);
  assert.doesNotMatch(contactsState.listText, /BNA Parent/);
}

async function assertOperationsContentBoundary(page, calls) {
  await page.locator('.ops-module-button').filter({ hasText: 'Content' }).click();
  await page.locator('.ops-view-frame[data-current-view="content"]').waitFor();
  await waitForCall(
    calls,
    (call) => call.pathname === '/api/bna/content-jobs' && call.project === 'one_time_mishnah_class',
    'Content jobs request scoped to One Time workspace',
  );
  const contentCard = page.locator('.content-library-card').filter({ hasText: 'TEST-BNA-SEED Mishnah teaching clip' }).first();
  await contentCard.waitFor();
  await contentCard.locator('.content-card-compact').click();
  await page.locator('.content-library-card.expanded').filter({ hasText: 'TEST-BNA-SEED Mishnah teaching clip' }).waitFor();
  const contentState = await page.evaluate(() => {
    const frame = document.querySelector('.ops-view-frame[data-current-view="content"]');
    return {
      text: frame?.textContent?.replace(/\s+/g, ' ').trim() || '',
    };
  });
  assert.match(contentState.text, /Mishnah structure for lost objects/);
  assert.match(contentState.text, /Why does the Mishnah separate owner despair from finder responsibility\?/);
  assert.match(contentState.text, /Bava Metzia 2a/);
  assert.match(contentState.text, /Use the case distinction as a discussion opener/);
  assert.doesNotMatch(contentState.text, /Torah progress update/i);
  assert.doesNotMatch(contentState.text, /Review accountability notes/i);
  assert.doesNotMatch(contentState.text, /timer update/i);
  assert.doesNotMatch(contentState.text, /parser fallback/i);
}

async function assertOperationsContentMetadataProvenance(page, calls) {
  await page.locator('.ops-module-button').filter({ hasText: 'Content' }).click();
  await page.locator('.ops-view-frame[data-current-view="content"]').waitFor();
  await waitForCall(
    calls,
    (call) => call.pathname === '/api/bna/content-jobs' && call.project === 'one_time_mishnah_class',
    'Content provenance request scoped to One Time workspace',
  );
  const contentCard = page.locator('.content-library-card').filter({ hasText: 'TEST-BNA-SEED Mishnah teaching clip' }).first();
  await contentCard.waitFor();
  const expanded = await contentCard.evaluate((node) => node.classList.contains('expanded'));
  if (!expanded) {
    await contentCard.locator('.content-card-compact').click();
  }
  await contentCard.locator('[aria-label="Content provenance"]').waitFor();
  const metadataState = await contentCard.evaluate((node) => {
    const compactMeta = node.querySelector('.content-card-compact .content-source-meta');
    const provenance = node.querySelector('[aria-label="Content provenance"]');
    return {
      compactText: compactMeta?.textContent?.replace(/\s+/g, ' ').trim() || '',
      provenanceText: provenance?.textContent?.replace(/\s+/g, ' ').trim() || '',
    };
  });
  assert.match(metadataState.compactText, /Workspace:\s*One Time/);
  assert.match(metadataState.compactText, /Source:\s*Drive - Workspace Imported - video\/mp4/);
  assert.match(metadataState.compactText, /Transcript:\s*Transcribed/);
  assert.match(metadataState.compactText, /Outputs:\s*3 outputs, 1 need approval, 1 approved, 1 published/);
  assert.match(metadataState.compactText, /Approval:\s*1 need approval/);
  assert.match(metadataState.provenanceText, /Workspace\s*One Time/);
  assert.match(metadataState.provenanceText, /Source\s*Drive - Workspace Imported - video\/mp4/);
  assert.match(metadataState.provenanceText, /Transcript\s*Transcribed/);
  assert.match(metadataState.provenanceText, /Parse\s*Parsed/);
  assert.match(metadataState.provenanceText, /Outputs\s*3 outputs, 1 need approval, 1 approved, 1 published/);
  assert.match(metadataState.provenanceText, /Approval\s*1 need approval/);
  assert.match(metadataState.provenanceText, /Created/);
  assert.match(metadataState.provenanceText, /Updated/);
  assert.match(metadataState.provenanceText, /Latest output/);
  assert.match(metadataState.provenanceText, /Drive file\s*drive-file-801/);
  assert.match(metadataState.provenanceText, /Drive folder\s*drive-folder-one-time/);
  assert.match(metadataState.provenanceText, /Source message\s*telegram-message-801/);
  assert.match(metadataState.provenanceText, /Source chat\s*telegram-chat-801/);
  assert.match(metadataState.provenanceText, /MIME type\s*video\/mp4/);
  assert.match(metadataState.provenanceText, /Media URL\s*https:\/\/example\.invalid\/content\/801\.mp4/);
  assert.match(metadataState.provenanceText, /Local capture\s*media\/content\/TEST-BNA-SEED-801\.mp4/);
}

async function assertOperationsContentDriveWorkspaceRouting(page, calls) {
  await page.locator('.ops-module-button').filter({ hasText: 'Content' }).click();
  await page.locator('.ops-view-frame[data-current-view="content"]').waitFor();
  await waitForCall(
    calls,
    (call) => call.pathname === '/api/bna/content-jobs' && call.project === 'one_time_mishnah_class',
    'Content jobs Drive routing request scoped to One Time workspace',
  );
  await waitForCall(
    calls,
    (call) => call.pathname === '/api/bna/content-bundles' && call.project === 'one_time_mishnah_class',
    'Content bundle request scoped to One Time workspace',
  );
  const contentCard = page.locator('.content-library-card').filter({ hasText: 'TEST-BNA-SEED Mishnah teaching clip' }).first();
  await contentCard.waitFor();
  const expanded = await contentCard.evaluate((node) => node.classList.contains('expanded'));
  if (!expanded) {
    await contentCard.locator('.content-card-compact').click();
  }
  await contentCard.locator('[aria-label="Content provenance"]').waitFor();
  const routingState = await page.evaluate(() => {
    const frame = document.querySelector('.ops-view-frame[data-current-view="content"]');
    const provenance = frame?.querySelector('[aria-label="Content provenance"]');
    return {
      pageText: frame?.textContent?.replace(/\s+/g, ' ').trim() || '',
      provenanceText: provenance?.textContent?.replace(/\s+/g, ' ').trim() || '',
    };
  });
  assert.match(routingState.provenanceText, /Workspace\s*One Time/);
  assert.match(routingState.provenanceText, /Drive folder\s*drive-folder-one-time/);
  assert.match(routingState.provenanceText, /Drive file\s*drive-file-801/);
  assert.doesNotMatch(routingState.pageText, /drive-folder-bna/);
  assert.doesNotMatch(routingState.pageText, /Workspace\s*BNA/);
}

async function assertStudentPortalIdentity(page) {
  const identity = await page.evaluate(() => ({
    hasLogo: Array.from(document.images).some((img) => (
      img.classList.contains('portal-logo')
        && img.getAttribute('alt') === "Bnei Nevi'im Academy"
        && img.getAttribute('src') === '/images/bna-logo-nobg.png'
    )),
    brand: document.querySelector('.portal-brand-name')?.textContent?.trim() || '',
    eyebrow: document.querySelector('.eyebrow')?.textContent?.trim() || '',
    languageButtons: Array.from(document.querySelectorAll('[data-lang]')).map((node) => node.textContent.trim()),
  }));
  assert.ok(identity.hasLogo, JSON.stringify(identity));
  assert.equal(identity.brand, 'Bnei Neviim Academy');
  assert.equal(identity.eyebrow, 'Student Portal');
  assert.deepEqual(identity.languageButtons, ['EN', 'HE']);
}

async function moduleToolbarLabels(page) {
  return page.locator('.ops-module-toolbar .ops-module-button span:last-child').evaluateAll((nodes) => (
    nodes.map((node) => node.textContent.trim())
  ));
}

async function assertSidebarWorkspaceContextOnly(page) {
  const sidebar = page.locator('.ops-sidebar');
  await sidebar.waitFor();
  assert.equal(await sidebar.locator('.workspace-context-control').count(), 1);
  assert.equal(await sidebar.locator('.ops-module-button').count(), 0);
  assert.equal(await sidebar.locator('.ops-sidebar-nav').count(), 0);
}

async function waitForCall(calls, predicate, label) {
  const deadline = Date.now() + 3000;
  while (Date.now() < deadline) {
    const call = calls.find(predicate);
    if (call) return call;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.fail(`Timed out waiting for API call: ${label}`);
}

test('Playwright Operations acceptance covers routes, history, responsive layout, workspace, helper, and student detail', async () => {
  await withServer(async (baseUrl) => {
    const calls = [];
    const browser = await chromium.launch();
    const context = await browser.newContext({
      baseURL: baseUrl,
      httpCredentials: { username: 'super-admin-test', password: 'super-secret-test' },
      serviceWorkers: 'block',
      viewport: { width: 390, height: 844 },
      extraHTTPHeaders: {
        authorization: basicAuth('super-admin-test', 'super-secret-test'),
      },
    });
    await installFixtureRoutes(context, calls);

    try {
      const page = await context.newPage();
      await page.goto('/operations?view=tasks', { waitUntil: 'domcontentloaded' });
      await page.locator('.ops-app-shell').waitFor();
      await assertOperationsIdentity(page);
      await assertOperationsDesignSystem(page);
      await assertSidebarWorkspaceContextOnly(page);
      assert.deepEqual(await moduleToolbarLabels(page), [
        'Tasks',
        'Assistant',
        'Calendar',
        'Students',
        'Content',
        'Contacts',
        'Accounting',
        'Automations',
        'Integrations',
        'Users',
      ]);
      await assertOperationsMobileControls(page);
      await assertOperationsShellStable(page, 'initial mobile operations shell');

      await page.setViewportSize({ width: 1440, height: 900 });
      await assertOperationsDesktopGrids(page);
      await assertOperationsAccessibility(page);
      await assertOperationsTaskStateModel(page);
      await assertOperationsTaskMetadataProvenance(page);
      await assertOperationsIntakeRoutingDecisions(page, calls);
      await assertOperationsLiveCountsBlockers(page);
      await assertOperationsTaskDiagnosticsClean(page);
      await assertOperationsCalendarModule(page);
      await assertOperationsShellStable(page, 'desktop operations shell');

      await page.locator('.ops-module-button').filter({ hasText: 'Assistant' }).click();
      await page.locator('.ops-view-frame[data-current-view="assistant"]').waitFor();
      assert.match(page.url(), /view=assistant/);
      await page.getByText('Memory Scope').waitFor();
      await page.getByText('test_seed_context').waitFor();
      await assertOperationsShellStable(page, 'assistant module operations shell');

      await page.locator('.ops-module-button').filter({ hasText: 'Students' }).click();
      await page.locator('.ops-view-frame[data-current-view="students"]').waitFor();
      await page.getByText(TEST_STUDENT_NAME).waitFor();
      await page.locator('.student-card').filter({ hasText: TEST_STUDENT_NAME }).first().click();
      await page.locator('.student-profile-hero').filter({ hasText: TEST_STUDENT_NAME }).waitFor();
      assert.match(page.url(), /view=students/);
      assert.match(page.url(), /section=profile/);
      assert.match(page.url(), new RegExp(`student=${TEST_STUDENT_ID}`));
      await assertStudentProfileDesktopGrid(page);
      await assertOperationsShellStable(page, 'student profile operations shell');

      await page.goBack();
      await page.waitForFunction(() => new URL(window.location.href).searchParams.get('section') === 'overview');
      await page.goBack();
      await page.waitForFunction(() => new URL(window.location.href).searchParams.get('view') === 'assistant');
      await page.goForward();
      await page.waitForFunction(() => new URL(window.location.href).searchParams.get('view') === 'students');
      await assertOperationsShellStable(page, 'history restored operations shell');

      await page.locator('#workspaceProjectSelector').selectOption('one_time_mishnah_class');
      await page.waitForFunction(() => new URL(window.location.href).searchParams.get('project') === 'one_time_mishnah_class');
      const workspaceUrl = new URL(page.url());
      assert.equal(workspaceUrl.searchParams.get('view'), 'tasks');
      assert.equal(workspaceUrl.searchParams.get('section'), 'overview');
      assert.equal(workspaceUrl.searchParams.get('student'), null);
      await waitForCall(
        calls,
        (call) => call.pathname === '/api/bna/tasks' && call.project === 'one_time_mishnah_class',
        'tasks scoped to One Time workspace',
      );
      assert.equal(await page.locator('#workspaceProjectSelector').inputValue(), 'one_time_mishnah_class');
      await page.locator('.ops-view-frame[data-current-view="tasks"]').waitFor();
      assert.equal(await page.locator('.student-profile-hero').count(), 0);
      await assertOperationsShellStable(page, 'workspace switched operations shell');

      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('.ops-view-frame[data-current-view="tasks"]').waitFor();
      await assertOperationsShellStable(page, 'refreshed operations shell');
      await assertOperationsLiveClassesWorkspaceScope(page, calls);
      await assertOperationsAutomationsWorkspaceStatus(page, calls);
      await assertOperationsIntegrationsWorkspaceStatus(page, calls);
      await assertOperationsUsersWorkspaceScope(page, calls);
      await assertOperationsAccountingWorkspaceScope(page, calls);
      await assertOperationsContactsCommunityScope(page, calls);
      await assertOperationsContentBoundary(page, calls);
      await assertOperationsContentMetadataProvenance(page, calls);
      await assertOperationsContentDriveWorkspaceRouting(page, calls);
    } finally {
      await context.close();
      await browser.close();
    }
  });
});

test('Playwright Operations scoped user sees locked workspace context without global selector', async () => {
  await withServer(async (baseUrl) => {
    const calls = [];
    const browser = await chromium.launch();
    const context = await browser.newContext({
      baseURL: baseUrl,
      httpCredentials: { username: 'one-time-test', password: 'one-time-secret-test' },
      serviceWorkers: 'block',
      viewport: { width: 390, height: 844 },
      extraHTTPHeaders: {
        authorization: basicAuth('one-time-test', 'one-time-secret-test'),
      },
    });
    await installFixtureRoutes(context, calls, { authMode: 'scoped_one_time' });

    try {
      const page = await context.newPage();
      await page.goto('/operations?view=tasks', { waitUntil: 'domcontentloaded' });
      await page.locator('.ops-app-shell').waitFor();
      await page.locator('.workspace-context-control[data-mode="scoped"]').waitFor();
      await assertSidebarWorkspaceContextOnly(page);
      assert.doesNotMatch(await page.locator('.ops-sidebar').textContent(), /All workspaces/);
      assert.deepEqual(await moduleToolbarLabels(page), [
        'Tasks',
        'Assistant',
        'Calendar',
        'Content',
        'Contacts',
        'Automations',
        'Integrations',
      ]);
      await page.getByText('Service provider: One Time Mishnah Class').waitFor();
      await page.getByText('Scoped login').waitFor();
      assert.equal(await page.locator('#workspaceProjectSelector').count(), 0);
      await waitForCall(
        calls,
        (call) => call.pathname === '/api/bna/tasks' && call.project === 'one_time_mishnah_class',
        'scoped user tasks pinned to One Time workspace',
      );
      await waitForCall(
        calls,
        (call) => call.pathname === '/api/bna/calendar' && call.project === 'one_time_mishnah_class',
        'scoped user calendar pinned to One Time workspace',
      );
      await noHorizontalOverflow(page);
    } finally {
      await context.close();
      await browser.close();
    }
  });
});

test('Playwright Student Portal acceptance covers private route, Hebrew RTL, and responsive goal view', async () => {
  await withServer(async (baseUrl) => {
    const calls = [];
    const browser = await chromium.launch();
    const context = await browser.newContext({
      baseURL: baseUrl,
      serviceWorkers: 'block',
      viewport: { width: 390, height: 844 },
    });
    await installFixtureRoutes(context, calls);

    try {
      const page = await context.newPage();
      await page.goto(`/student?code=${TEST_ACCESS_CODE}`, { waitUntil: 'domcontentloaded' });
      await page.locator('#studentName').waitFor();
      await assertStudentPortalIdentity(page);
      assert.equal(await page.locator('#studentName').textContent(), TEST_STUDENT_NAME);
      await page.getByText('TEST-BNA-SEED: Finish today honestly').waitFor();
      await noHorizontalOverflow(page);

      await page.locator('[data-lang="he"]').click();
      const htmlState = await page.evaluate(() => ({
        lang: document.documentElement.lang,
        dir: document.documentElement.dir,
      }));
      assert.deepEqual(htmlState, { lang: 'he', dir: 'rtl' });
      await noHorizontalOverflow(page);

      assert.ok(
        calls.some((call) => call.pathname === '/api/student-portal' && call.search.includes(TEST_ACCESS_CODE)),
        'student portal should request only the private access-code API',
      );
    } finally {
      await context.close();
      await browser.close();
    }
  });
});
