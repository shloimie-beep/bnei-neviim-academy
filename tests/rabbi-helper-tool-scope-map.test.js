const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const parityRows = JSON.parse(fs.readFileSync('ops/helper-tool-parity-map.json', 'utf8'));
const scopeMap = JSON.parse(fs.readFileSync('ops/helper-tool-scope/rabbi-one-time-tool-scope-map.json', 'utf8'));
const accountTemplate = JSON.parse(fs.readFileSync('ops/helper-tool-scope/account-bot-scope-template.json', 'utf8'));

function sourceKey(record) {
  return [
    record.surface,
    record.label,
    record.current_file,
    record.api_endpoint,
    record.method,
    record.helper_tool_name,
  ].join('|');
}

test('Rabbi helper tool scope map covers every current tool-needed parity row', () => {
  const toolNeededRows = parityRows.filter((record) => record.status === 'tool_needed');
  const sourceKeys = new Set(toolNeededRows.map(sourceKey));
  const contractKeys = new Set(scopeMap.contracts.map((contract) => sourceKey(contract.source)));

  assert.equal(scopeMap.source.path, 'ops/helper-tool-parity-map.json');
  assert.equal(scopeMap.source.total_rows, parityRows.length);
  assert.equal(scopeMap.source.tool_needed_count, toolNeededRows.length);
  assert.equal(scopeMap.source.contract_count, scopeMap.contracts.length);
  assert.equal(scopeMap.contracts.length, 163);
  assert.equal(contractKeys.size, scopeMap.contracts.length, 'scope contracts should not duplicate a parity row');
  assert.ok(scopeMap.source.preserved_audit_contract_count > 0);

  for (const key of sourceKeys) {
    assert.ok(contractKeys.has(key), `missing Rabbi scope contract for ${key}`);
  }
});

test('Rabbi helper tool scope contracts lock every capability to One Time provider scope', () => {
  assert.equal(scopeMap.target_account.account_key, 'rabbi_scheller_onetime_bot');
  assert.equal(scopeMap.target_account.workspace_key, 'rabbi_sheller_provider');
  assert.equal(scopeMap.target_account.project_key, 'one_time_mishnah_class');

  for (const contract of scopeMap.contracts) {
    const rabbi = contract.rabbi_contract;
    assert.ok([
      'tool_needed',
      'tool_available',
      'requires_confirmation',
      'external_blocker',
      'student_safe_only',
    ].includes(contract.source.source_status));
    assert.equal(rabbi.target_account_key, 'rabbi_scheller_onetime_bot');
    assert.equal(rabbi.scope_lock.workspace_key, 'rabbi_sheller_provider');
    assert.equal(rabbi.scope_lock.project_key, 'one_time_mishnah_class');
    assert.equal(rabbi.scope_lock.server_recomputes_scope, true);
    assert.equal(rabbi.scope_lock.client_scope_trusted, false);
    assert.equal(rabbi.scope_lock.cross_workspace_allowed, false);
    assert.deepEqual(rabbi.planner_intent.default_slots.workspace_key, 'rabbi_sheller_provider');
    assert.deepEqual(rabbi.planner_intent.default_slots.project_key, 'one_time_mishnah_class');
    assert.ok(rabbi.planner_intent.forbidden_slots.includes('workspace_key=bna'));
    assert.ok(rabbi.planner_intent.forbidden_slots.includes('project_key=bna'));
    assert.ok(rabbi.negative_tests.some((check) => /workspace_key=bna/i.test(check)));
    assert.equal(rabbi.result_rules.links_must_resolve_through_destination_resolver, true);
    assert.equal(rabbi.result_rules.audit_log_required, true);
    assert.equal(rabbi.result_rules.redaction_required, true);
    assert.equal(rabbi.agent_mode_probe.safe_prompt.includes('rabbi_sheller_provider / one_time_mishnah_class'), true);
    assert.ok(rabbi.agent_mode_probe.failure_signals.some((signal) => /BNA Academy/i.test(signal)));
    assert.ok([
      'tool_wrapper_missing',
      'tool_wrapper_available_local',
      'registered_fallback_only_blocker',
    ].includes(rabbi.implementation_gap.implementation_status));
  }
});

test('Rabbi helper scope map keeps privacy, external writes, and student-parent data gated', () => {
  for (const contract of scopeMap.contracts) {
    const rabbi = contract.rabbi_contract;
    const joinedSource = `${contract.source.label} ${contract.source.helper_tool_name}`.toLowerCase();

    assert.ok(rabbi.forbidden_data.some((item) => /raw private message bodies/i.test(item)));
    assert.ok(rabbi.forbidden_data.some((item) => /secrets, passwords, API keys/i.test(item)));

    if (rabbi.capability_groups.includes('students') || rabbi.capability_groups.includes('parents')) {
      assert.match(rabbi.surface_policy, /provider_visible/);
      assert.ok(rabbi.negative_tests.some((check) => /unrelated parent, family, student/i.test(check)));
    }

    if (/approve|send|whatsapp|wapi|buffer|schedule_.*after/i.test(joinedSource)) {
      assert.match(rabbi.action_policy, /approval_gated|draft_only|blocked/);
      assert.equal(rabbi.confirmation_policy, 'explicit_confirmation_required');
    }

    if (/secret|api key|credential/i.test(joinedSource)) {
      assert.equal(rabbi.action_policy, 'blocked_until_owner_credential_approval');
      assert.equal(rabbi.confirmation_policy, 'explicit_confirmation_required');
    }

    if (/payment|stripe|checkout|charge|access grant/i.test(joinedSource)) {
      assert.match(rabbi.action_policy, /financial|draft|read_only|blocked/);
    }
  }
});

test('Rabbi helper scope map does not classify write-shaped missing wrappers as read-only', () => {
  const expectedPolicies = new Map([
    ['ask_for_help', 'internal_write'],
    ['capture_provider_google_business_link', 'internal_write'],
    ['distill_ramble', 'draft_only'],
    ['generate_social_posts_from_newsletter', 'draft_only'],
    ['generate_student_worksheet', 'draft_only'],
    ['link_prompt_to_goal', 'internal_write'],
    ['move_lead_stage', 'approval_gated_internal_state_change'],
    ['move_task_workspace', 'approval_gated_internal_state_change'],
    ['post_community_message', 'approval_gated_external_write'],
    ['queue_telegram_report', 'approval_gated_external_write'],
    ['record_agent_result', 'internal_write'],
    ['request_provider_contact', 'internal_write'],
    ['retitle_task_naturally', 'internal_write'],
    ['review_moderated_question', 'approval_gated_internal_state_change'],
    ['save_newsletter_revision', 'internal_write'],
    ['submit_checkoff', 'internal_write'],
    ['submit_question', 'internal_write'],
    ['submit_student_question_for_moderation', 'internal_write'],
    ['submit_worksheet_answer', 'internal_write'],
    ['sync_google_calendar', 'approval_gated_external_write'],
    ['sync_google_classroom', 'approval_gated_external_write'],
    ['upload_provider_asset_reference', 'internal_write'],
  ]);

  for (const [toolName, expectedPolicy] of expectedPolicies.entries()) {
    const contracts = scopeMap.contracts.filter((contract) => contract.source.helper_tool_name === toolName);
    assert.ok(contracts.length > 0, `${toolName} should remain represented in the Rabbi scope map`);
    for (const contract of contracts) {
      assert.equal(contract.rabbi_contract.action_policy, expectedPolicy, `${toolName} should be ${expectedPolicy}`);
      assert.notEqual(contract.rabbi_contract.action_policy, 'read_only', `${toolName} should not be read-only`);
    }
  }
});

test('Rabbi helper scope map includes natural-language and Agent Mode probes for every contract', () => {
  for (const contract of scopeMap.contracts) {
    const rabbi = contract.rabbi_contract;
    assert.ok(rabbi.planner_intent.natural_language_examples.length >= 3);
    assert.ok(rabbi.planner_intent.required_slots.includes('intent'));
    assert.ok(rabbi.agent_mode_probe.safe_prompt.length > 80);
    assert.ok(rabbi.agent_mode_probe.expected_result.length > 40);
    assert.ok(rabbi.agent_mode_probe.failure_signals.length >= 4);
    assert.ok(rabbi.implementation_gap.next_action.includes(contract.source.helper_tool_name));
  }
});

test('Rabbi helper scope map marks the first runtime alias batch as locally wrapper-backed', () => {
  const aliasNames = [
    'capture_ramble',
    'show_operating_goals',
    'route_bug_to_codex',
    'create_report_problem_ticket',
    'create_ticket',
    'create_help_request',
    'create_rabbi_source_sheet_task',
    'create_rabbi_shiur_idea',
    'draft_parent_response',
    'draft_weekly_update',
  ];
  const aliasContracts = scopeMap.contracts.filter((contract) => aliasNames.includes(contract.source.helper_tool_name));
  assert.equal(aliasContracts.length, 18);

  for (const contract of aliasContracts) {
    assert.equal(contract.rabbi_contract.implementation_gap.implementation_status, 'tool_wrapper_available_local');
    assert.match(contract.rabbi_contract.implementation_gap.next_action, /Agent Mode PASS\/BLOCKED evidence/);
  }

  assert.ok(scopeMap.counts.by_implementation_status.tool_wrapper_available_local >= aliasContracts.length);
  assert.ok(scopeMap.counts.by_implementation_status.tool_wrapper_missing > aliasContracts.length);
});

test('Rabbi helper scope map marks the read-only runtime batch as locally wrapper-backed', () => {
  const readOnlyNames = [
    'show_one_time_launch_checklist',
    'list_calendar_sessions',
    'open_calendar_event',
    'view_email_log',
    'show_contact_communication_history',
    'list_provider_leads',
    'open_content_item_url',
  ];
  const readOnlyContracts = scopeMap.contracts.filter((contract) => readOnlyNames.includes(contract.source.helper_tool_name));
  assert.equal(readOnlyContracts.length, 9);

  for (const contract of readOnlyContracts) {
    assert.equal(contract.rabbi_contract.action_policy, 'read_only');
    assert.equal(contract.rabbi_contract.confirmation_policy, 'safe_without_confirmation_after_scope_check');
    assert.equal(contract.rabbi_contract.implementation_gap.implementation_status, 'tool_wrapper_available_local');
    assert.match(contract.rabbi_contract.implementation_gap.next_action, /Agent Mode PASS\/BLOCKED evidence/);
  }

  assert.equal(scopeMap.counts.by_implementation_status.tool_wrapper_available_local, 66);
});

test('Rabbi helper scope map marks parent and student summary wrappers as locally wrapper-backed', () => {
  const parentStudentNames = [
    'list_students',
    'show_assignments',
    'show_child_calendar',
    'view_parent_visible_notes',
    'show_my_assignments',
    'show_my_goals',
    'show_parent_students',
    'show_student_progress',
    'show_student_progress_for_parent',
  ];
  const parentStudentContracts = scopeMap.contracts.filter((contract) => parentStudentNames.includes(contract.source.helper_tool_name));
  assert.equal(parentStudentContracts.length, 9);

  for (const contract of parentStudentContracts) {
    assert.equal(contract.rabbi_contract.action_policy, 'read_only');
    assert.equal(contract.rabbi_contract.confirmation_policy, 'safe_without_confirmation_after_scope_check');
    assert.equal(contract.rabbi_contract.implementation_gap.implementation_status, 'tool_wrapper_available_local');
    assert.ok(contract.rabbi_contract.forbidden_data.some((item) => /raw private message bodies/i.test(item)));
    assert.ok(contract.rabbi_contract.negative_tests.some((check) => /unrelated parent, family, student/i.test(check)));
  }
});

test('Rabbi helper scope map marks Google and classroom preview wrappers as locally wrapper-backed', () => {
  const previewNames = [
    'calendar_batch_launch_plan_preview',
    'classroom_topic_material_preview',
    'google_drive_find_file_preview',
    'google_drive_create_doc_preview',
    'google_drive_create_folder_preview',
    'google_business_place_id_lookup',
    'google_business_list_locations_preview',
  ];
  const previewContracts = scopeMap.contracts.filter((contract) => previewNames.includes(contract.source.helper_tool_name));
  assert.equal(previewContracts.length, 13);

  for (const contract of previewContracts) {
    assert.equal(contract.rabbi_contract.action_policy, 'draft_only');
    assert.ok([
      'safe_without_confirmation_after_scope_check',
      'explicit_confirmation_required',
    ].includes(contract.rabbi_contract.confirmation_policy));
    assert.equal(contract.rabbi_contract.implementation_gap.implementation_status, 'tool_wrapper_available_local');
    assert.match(contract.rabbi_contract.agent_mode_probe.expected_result, /draft|preview|no external/i);
  }
});

test('Rabbi helper scope map marks draft-only sidekick wrappers as locally wrapper-backed', () => {
  const draftNames = [
    'create_calendar_event_draft',
    'update_calendar_event_draft',
    'create_shoutout_draft',
    'distill_ramble',
    'draft_automation',
    'draft_drip_sequence',
    'draft_email_campaign',
    'draft_email_from_newsletter',
    'draft_mishnayos_landing_page',
    'find_latest_newsletter_draft',
    'generate_social_posts_from_newsletter',
    'generate_student_worksheet',
    'preview_campaign_segment',
    'refine_email',
    'refine_newsletter_draft',
    'draft_message_to_admin',
  ];
  const draftContracts = scopeMap.contracts.filter((contract) => draftNames.includes(contract.source.helper_tool_name));
  assert.equal(draftContracts.length, 17);

  for (const contract of draftContracts) {
    assert.equal(contract.rabbi_contract.action_policy, 'draft_only');
    assert.ok([
      'safe_without_confirmation_after_scope_check',
      'explicit_confirmation_required',
    ].includes(contract.rabbi_contract.confirmation_policy));
    assert.equal(contract.rabbi_contract.implementation_gap.implementation_status, 'tool_wrapper_available_local');
    assert.match(contract.rabbi_contract.agent_mode_probe.expected_result, /draft|preview|no external/i);
    assert.ok(contract.rabbi_contract.forbidden_data.some((item) => /raw private message bodies/i.test(item)));
  }
});

test('account bot scope template supports narrower subaccounts like Benny tasks and Studio', () => {
  assert.equal(accountTemplate.template_key, 'service_provider_project_bot_scope_v1');
  assert.ok(accountTemplate.required_fields.includes('allowed_tool_ids'));
  assert.ok(accountTemplate.required_fields.includes('forbidden_tool_ids'));
  const benny = accountTemplate.subaccount_examples.find((example) => example.account_key === 'benny_studio_tasks_bot');
  assert.ok(benny, 'Benny example should exist');
  assert.deepEqual(benny.allowed_surface_groups, ['tasks', 'studio']);
  assert.ok(benny.forbidden_surface_groups.includes('payments'));
  assert.ok(benny.forbidden_surface_groups.includes('contacts_crm'));
  assert.ok(benny.forbidden_surface_groups.includes('integrations'));
  assert.match(benny.natural_language_rule, /plain language/i);
});
