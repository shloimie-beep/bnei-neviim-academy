const { assertNoBnaPrivateData } = require('./one-time');

const REQUIREMENT_ID = 'REQ-20260621-909';
const ONE_TIME_WORKSPACE_KEY = 'rabbi_sheller_provider';
const ONE_TIME_PROJECT_KEY = 'one_time_mishnah_class';
const BNA_WORKSPACE_KEY = 'bna';

function testKey(value = '') {
  const raw = String(value || '').trim().toUpperCase();
  return raw.startsWith('TEST-') ? raw : `TEST-${raw.replace(/^TEST[-_]?/, '')}`;
}

function fixtureIdentity(input = {}) {
  const key = testKey(input.key);
  const emailLocal = String(input.email_local || key.toLowerCase().replace(/[^a-z0-9]+/g, '.')).replace(/^\.+|\.+$/g, '');
  return {
    key,
    display_name: input.display_name || key.replace(/-/g, ' '),
    role: input.role || 'member',
    workspace_key: input.workspace_key || ONE_TIME_WORKSPACE_KEY,
    project_key: input.project_key || (input.workspace_key === BNA_WORKSPACE_KEY ? 'bna' : ONE_TIME_PROJECT_KEY),
    email: `${emailLocal}@example.test`,
    phone: input.phone || '+15550100000',
    status: 'active',
    cleanup_key: `${REQUIREMENT_ID}:${key}`,
    source: 'synthetic_fixture',
    private_export_source: false,
    external_write_performed: false,
    notes: input.notes || 'Synthetic TEST-prefixed identity; not a real person.',
  };
}

function buildOneTimeTestIdentityPreview(options = {}) {
  const checkedAt = options.checked_at || options.checkedAt || new Date().toISOString();
  const identities = [
    fixtureIdentity({
      key: 'TEST-ONETIME-PARENT-001',
      display_name: 'TEST One Time Parent 001',
      role: 'parent',
      phone: '+15550101001',
    }),
    fixtureIdentity({
      key: 'TEST-ONETIME-STUDENT-001',
      display_name: 'TEST One Time Student 001',
      role: 'student',
      phone: '+15550101011',
    }),
    fixtureIdentity({
      key: 'TEST-ONETIME-STUDENT-002',
      display_name: 'TEST One Time Student 002',
      role: 'student',
      phone: '+15550101012',
    }),
    fixtureIdentity({
      key: 'TEST-ONETIME-PROVIDER-RABBI',
      display_name: 'TEST Rabbi Ellie Scheller Provider',
      role: 'workspace_owner',
      phone: '+15550101021',
    }),
    fixtureIdentity({
      key: 'TEST-ONETIME-STAFF-001',
      display_name: 'TEST One Time Staff 001',
      role: 'provider_staff',
      phone: '+15550101031',
    }),
    fixtureIdentity({
      key: 'TEST-BNA-PARENT-001',
      display_name: 'TEST BNA Parent 001',
      role: 'parent',
      workspace_key: BNA_WORKSPACE_KEY,
      project_key: 'bna',
      phone: '+15550102001',
    }),
    fixtureIdentity({
      key: 'TEST-BNA-STUDENT-001',
      display_name: 'TEST BNA Student 001',
      role: 'student',
      workspace_key: BNA_WORKSPACE_KEY,
      project_key: 'bna',
      phone: '+15550102011',
    }),
    fixtureIdentity({
      key: 'TEST-BNA-STAFF-001',
      display_name: 'TEST BNA Staff 001',
      role: 'workspace_admin',
      workspace_key: BNA_WORKSPACE_KEY,
      project_key: 'bna',
      phone: '+15550102031',
    }),
  ];

  const relationships = [
    {
      key: 'TEST-REL-ONETIME-PARENT-STUDENT-001',
      workspace_key: ONE_TIME_WORKSPACE_KEY,
      project_key: ONE_TIME_PROJECT_KEY,
      parent_key: 'TEST-ONETIME-PARENT-001',
      student_key: 'TEST-ONETIME-STUDENT-001',
      relationship: 'parent_child',
      cleanup_key: `${REQUIREMENT_ID}:TEST-REL-ONETIME-PARENT-STUDENT-001`,
    },
    {
      key: 'TEST-REL-ONETIME-PROVIDER-STUDENT-001',
      workspace_key: ONE_TIME_WORKSPACE_KEY,
      project_key: ONE_TIME_PROJECT_KEY,
      provider_key: 'TEST-ONETIME-PROVIDER-RABBI',
      student_key: 'TEST-ONETIME-STUDENT-001',
      relationship: 'provider_student',
      cleanup_key: `${REQUIREMENT_ID}:TEST-REL-ONETIME-PROVIDER-STUDENT-001`,
    },
  ];

  const mockRecords = [
    {
      key: 'TEST-ONETIME-CRM-LEAD-001',
      category: 'crm',
      workspace_key: ONE_TIME_WORKSPACE_KEY,
      project_key: ONE_TIME_PROJECT_KEY,
      owner_key: 'TEST-ONETIME-STAFF-001',
      status: 'no_send_until_approved',
      dedupe_key: 'email:test.onetime.parent.001@example.test',
      cleanup_key: `${REQUIREMENT_ID}:TEST-ONETIME-CRM-LEAD-001`,
    },
    {
      key: 'TEST-ONETIME-PAYMENT-EVENT-001',
      category: 'payment_access',
      workspace_key: ONE_TIME_WORKSPACE_KEY,
      project_key: ONE_TIME_PROJECT_KEY,
      owner_key: 'TEST-ONETIME-PARENT-001',
      status: 'local_test_paid_pending_review',
      live_charge_created: false,
      access_grant_created: false,
      cleanup_key: `${REQUIREMENT_ID}:TEST-ONETIME-PAYMENT-EVENT-001`,
    },
    {
      key: 'TEST-ONETIME-CLASS-LINK-001',
      category: 'class_links',
      workspace_key: ONE_TIME_WORKSPACE_KEY,
      project_key: ONE_TIME_PROJECT_KEY,
      owner_key: 'TEST-ONETIME-STUDENT-001',
      status: 'protected_reference_only',
      raw_zoom_url_returned: false,
      host_start_url_returned: false,
      cleanup_key: `${REQUIREMENT_ID}:TEST-ONETIME-CLASS-LINK-001`,
    },
    {
      key: 'TEST-ONETIME-QUESTION-001',
      category: 'questions',
      workspace_key: ONE_TIME_WORKSPACE_KEY,
      project_key: ONE_TIME_PROJECT_KEY,
      owner_key: 'TEST-ONETIME-STUDENT-001',
      status: 'private_review_only',
      public_forum_created: false,
      member_feed_created: false,
      cleanup_key: `${REQUIREMENT_ID}:TEST-ONETIME-QUESTION-001`,
    },
    {
      key: 'TEST-ONETIME-SUPPORT-001',
      category: 'support',
      workspace_key: ONE_TIME_WORKSPACE_KEY,
      project_key: ONE_TIME_PROJECT_KEY,
      owner_key: 'TEST-ONETIME-PARENT-001',
      status: 'ticket_only',
      staff_internal_notes_returned: false,
      source_context_returned: false,
      cleanup_key: `${REQUIREMENT_ID}:TEST-ONETIME-SUPPORT-001`,
    },
  ];

  const scenarios = [
    {
      key: 'TEST-SCENARIO-CRM-DEDUPE',
      category: 'crm',
      fixture_keys: ['TEST-ONETIME-PARENT-001', 'TEST-ONETIME-CRM-LEAD-001'],
      expected_result: 'No-send CRM lead dedupes by normalized email before any send.',
      external_write_performed: false,
    },
    {
      key: 'TEST-SCENARIO-PAYMENT-ACCESS-GATE',
      category: 'payment_access',
      fixture_keys: ['TEST-ONETIME-PARENT-001', 'TEST-ONETIME-PAYMENT-EVENT-001'],
      expected_result: 'Local test payment event requires admin review before access.',
      external_write_performed: false,
    },
    {
      key: 'TEST-SCENARIO-CLASS-LINK-SCOPE',
      category: 'class_links',
      fixture_keys: ['TEST-ONETIME-STUDENT-001', 'TEST-ONETIME-CLASS-LINK-001'],
      expected_result: 'Student sees only a protected join reference, never raw Zoom host/start URLs.',
      external_write_performed: false,
    },
    {
      key: 'TEST-SCENARIO-PRIVATE-QUESTION',
      category: 'questions',
      fixture_keys: ['TEST-ONETIME-STUDENT-001', 'TEST-ONETIME-QUESTION-001'],
      expected_result: 'Question enters private review queue with no public forum or member feed.',
      external_write_performed: false,
    },
    {
      key: 'TEST-SCENARIO-SUPPORT-TICKET',
      category: 'support',
      fixture_keys: ['TEST-ONETIME-PARENT-001', 'TEST-ONETIME-SUPPORT-001'],
      expected_result: 'Support remains ticket-only and hides internal notes/source context.',
      external_write_performed: false,
    },
  ];

  const negativeAuthorizationMatrix = [
    ['TEST-AUTH-RABBI-BLOCKED-BNA-STUDENT', 'TEST-ONETIME-PROVIDER-RABBI', 'read:bna_student_record', 'TEST-BNA-STUDENT-001', 'workspace_scope_mismatch'],
    ['TEST-AUTH-RABBI-BLOCKED-BNA-ACCOUNTING', 'TEST-ONETIME-PROVIDER-RABBI', 'read:bna_accounting', 'TEST-BNA-ACCOUNTING-001', 'workspace_scope_mismatch'],
    ['TEST-AUTH-ONETIME-STAFF-BLOCKED-BNA-PARENT-NOTES', 'TEST-ONETIME-STAFF-001', 'read:bna_parent_notes', 'TEST-BNA-PARENT-001', 'workspace_scope_mismatch'],
    ['TEST-AUTH-BNA-STAFF-BLOCKED-ONETIME-PRIVATE', 'TEST-BNA-STAFF-001', 'read:one_time_private_record', 'TEST-ONETIME-STUDENT-001', 'workspace_scope_mismatch'],
    ['TEST-AUTH-PARENT-BLOCKED-OTHER-CHILD', 'TEST-ONETIME-PARENT-001', 'read:student_record', 'TEST-ONETIME-STUDENT-002', 'record_owner_mismatch'],
    ['TEST-AUTH-STUDENT-BLOCKED-OTHER-STUDENT', 'TEST-ONETIME-STUDENT-001', 'read:student_record', 'TEST-ONETIME-STUDENT-002', 'record_owner_mismatch'],
    ['TEST-AUTH-MANAGER-BLOCKED-PLATFORM-ROLE', 'TEST-ONETIME-STAFF-001', 'assign:platform_role', 'TEST-ONETIME-STAFF-001', 'platform_role_denied'],
    ['TEST-AUTH-QUERY-PARAM-CROSS-SCOPE-BLOCKED', 'TEST-ONETIME-STAFF-001', 'query:workspace=bna', 'TEST-BNA-STUDENT-001', 'workspace_scope_mismatch'],
    ['TEST-AUTH-CROSS-TASK-BLOCKED', 'TEST-ONETIME-STAFF-001', 'read:task', 'TEST-BNA-TASK-001', 'workspace_scope_mismatch'],
    ['TEST-AUTH-CROSS-DECISION-BLOCKED', 'TEST-ONETIME-STAFF-001', 'read:decision', 'TEST-BNA-DECISION-001', 'workspace_scope_mismatch'],
    ['TEST-AUTH-CROSS-MESSAGE-BLOCKED', 'TEST-ONETIME-STAFF-001', 'read:message', 'TEST-BNA-MESSAGE-001', 'workspace_scope_mismatch'],
    ['TEST-AUTH-CROSS-RECORDING-BLOCKED', 'TEST-ONETIME-STAFF-001', 'read:recording', 'TEST-BNA-RECORDING-001', 'workspace_scope_mismatch'],
  ].map(([key, actor_key, action, target_key, expected_denial]) => ({
    key,
    actor_key,
    action,
    target_key,
    expected_denial,
    expected_status: 403,
    external_write_performed: false,
  }));

  const preview = {
    requirement_id: REQUIREMENT_ID,
    generated_at: checkedAt,
    mode: 'read_only_test_fixture_preview',
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    external_write_performed: false,
    records_created: false,
    private_export_sources_included: false,
    raw_private_rows_included: false,
    fixture_prefix: 'TEST-',
    fixtures: {
      identities,
      relationships,
      mock_records: mockRecords,
    },
    scenarios,
    negative_authorization_matrix: negativeAuthorizationMatrix,
    readback_checks: [
      'all fixture keys are TEST-prefixed',
      'all fixture emails use example.test',
      'One Time fixtures use rabbi_sheller_provider / one_time_mishnah_class scope',
      'BNA control fixtures remain bna scoped and are denied to One Time actors',
      'mock records cover crm, payment_access, class_links, questions, and support',
      'negative authorization matrix covers cross-workspace and own-record denial cases',
    ],
    cleanup_manifest: {
      strategy: 'archive_or_delete_only_test_prefixed_records_after_dry_run',
      marker: REQUIREMENT_ID,
      cleanup_ready: true,
      requires_prefix: 'TEST-',
      allowed_tables_or_surfaces: [
        'people',
        'members',
        'students',
        'providers',
        'crm_leads',
        'payment_events',
        'access_grants',
        'class_link_references',
        'question_reviews',
        'support_tickets',
      ],
      protected_private_exports: [
        'real parent exports',
        'real student exports',
        'real payment rows',
        'raw private message bodies',
      ],
    },
    guardrails: [
      'No real private exports committed.',
      'No production records created by preview.',
      'No email, WhatsApp, SMS, Telegram, payment, Zoom, Vimeo, Google, DNS, or CRM write.',
      'All cleanup targets are TEST-prefixed and dry-run reviewable.',
    ],
  };
  const safety = assertOneTimeTestFixtureSafety(preview);
  return { ...preview, safety };
}

function assertOneTimeTestFixtureSafety(preview = {}) {
  const failures = [];
  const identities = preview.fixtures?.identities || [];
  const relationships = preview.fixtures?.relationships || [];
  const mockRecords = preview.fixtures?.mock_records || [];
  const allFixtureRows = [...identities, ...relationships, ...mockRecords];

  for (const row of allFixtureRows) {
    if (!String(row.key || '').startsWith('TEST-')) failures.push(`${row.key || 'unknown'} is not TEST-prefixed`);
    if (!String(row.cleanup_key || '').startsWith(REQUIREMENT_ID)) failures.push(`${row.key || 'unknown'} lacks cleanup key`);
    if (row.external_write_performed === true) failures.push(`${row.key || 'unknown'} reports external write`);
  }
  for (const identity of identities) {
    if (!String(identity.display_name || '').startsWith('TEST ')) failures.push(`${identity.key} display name is not TEST-prefixed`);
    if (!/@example\.test$/i.test(String(identity.email || ''))) failures.push(`${identity.key} email is not example.test`);
  }
  if (preview.private_export_sources_included !== false) failures.push('private export sources are included');
  if (preview.raw_private_rows_included !== false) failures.push('raw private rows are included');
  if (preview.external_write_performed !== false) failures.push('preview reports external write');
  if (preview.records_created !== false) failures.push('preview reports production record creation');

  const oneTimeRows = allFixtureRows.filter((row) => row.workspace_key === ONE_TIME_WORKSPACE_KEY || row.project_key === ONE_TIME_PROJECT_KEY);
  const bnaLeakCheck = assertNoBnaPrivateData(oneTimeRows);
  if (!bnaLeakCheck.ok) failures.push('One Time fixture bundle contains BNA private data');

  const categories = new Set((preview.scenarios || []).map((item) => item.category));
  for (const required of ['crm', 'payment_access', 'class_links', 'questions', 'support']) {
    if (!categories.has(required)) failures.push(`missing scenario category ${required}`);
  }
  const denialKeys = new Set((preview.negative_authorization_matrix || []).map((item) => item.key));
  for (const required of [
    'TEST-AUTH-RABBI-BLOCKED-BNA-STUDENT',
    'TEST-AUTH-RABBI-BLOCKED-BNA-ACCOUNTING',
    'TEST-AUTH-ONETIME-STAFF-BLOCKED-BNA-PARENT-NOTES',
    'TEST-AUTH-BNA-STAFF-BLOCKED-ONETIME-PRIVATE',
    'TEST-AUTH-PARENT-BLOCKED-OTHER-CHILD',
    'TEST-AUTH-STUDENT-BLOCKED-OTHER-STUDENT',
    'TEST-AUTH-MANAGER-BLOCKED-PLATFORM-ROLE',
    'TEST-AUTH-QUERY-PARAM-CROSS-SCOPE-BLOCKED',
    'TEST-AUTH-CROSS-TASK-BLOCKED',
    'TEST-AUTH-CROSS-DECISION-BLOCKED',
    'TEST-AUTH-CROSS-MESSAGE-BLOCKED',
    'TEST-AUTH-CROSS-RECORDING-BLOCKED',
  ]) {
    if (!denialKeys.has(required)) failures.push(`missing denial case ${required}`);
  }
  if (preview.cleanup_manifest?.cleanup_ready !== true) failures.push('cleanup manifest is not ready');

  return {
    ok: failures.length === 0,
    failures,
    checks: {
      identity_count: identities.length,
      relationship_count: relationships.length,
      mock_record_count: mockRecords.length,
      scenario_count: (preview.scenarios || []).length,
      negative_authorization_count: (preview.negative_authorization_matrix || []).length,
      cleanup_ready: preview.cleanup_manifest?.cleanup_ready === true,
      no_bna_private_data: bnaLeakCheck.ok,
    },
  };
}

module.exports = {
  REQUIREMENT_ID,
  buildOneTimeTestIdentityPreview,
  assertOneTimeTestFixtureSafety,
};
