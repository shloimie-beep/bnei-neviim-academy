const test = require('node:test');
const assert = require('node:assert/strict');

const {
  assertCampaignPolicy,
  compileNaturalLanguageCampaignPlan,
  createCampaignDraft,
  createDripSequenceDraft,
  previewCampaignSegment,
} = require('../src/platform/assistant/campaign-control');
const {
  buildAssistantActionPlan,
  runPlannedAssistantAction,
} = require('../src/platform/assistant/action-planner');

const superAdmin = {
  user_id: 'shloimie-local',
  identity_key: 'identity_admin_1',
  role: 'super_admin',
  scope: { type: 'all' },
  workspace_id: 'bna',
};

const provider = {
  user_id: 'provider-local',
  identity_key: 'identity_provider_1',
  role: 'provider_admin',
  provider_id: 'sheller',
  workspace_id: 'rabbi_sheller_provider',
  workspace_key: 'rabbi_sheller_provider',
  project_key: 'one_time_mishnah_class',
};

const parent = {
  user_id: 'parent-local',
  role: 'parent',
  workspace_id: 'bna',
  parent_id: 'parent-1',
  linked_child_ids: ['101'],
};

test('super admin previews a segment with consent and suppression counts before campaign drafts', () => {
  const preview = previewCampaignSegment({
    actor: superAdmin,
    channel: 'operations_helper',
    segment_name: 'Opted-in leads',
    estimated_count: 1000,
    consent_count: 1000,
    suppression_counts: { unsubscribed: 20, bounced: 5, already_enrolled: 30 },
    exclusions: ['unsubscribed', 'bounced', 'already_enrolled'],
  });

  assert.equal(preview.requirement_id, 'REQ-20260623-020');
  assert.equal(preview.estimated_count, 1000);
  assert.equal(preview.consent_count, 1000);
  assert.equal(preview.suppressed_count, 55);
  assert.equal(preview.sendable_count, 945);
  assert.equal(preview.consent_checked, true);
  assert.equal(preview.suppression_checked, true);
  assert.equal(preview.external_send_performed, false);
  assert.equal(preview.approval_required_before_send, true);
});

test('natural-language drip request becomes a sequence draft with versioned messages and approval gate', () => {
  const plan = compileNaturalLanguageCampaignPlan({
    actor: superAdmin,
    channel: 'telegram',
    message: 'I need to send 1,000 opted-in leads a six-email nurture sequence. Exclude unsubscribed, bounced, and already enrolled contacts.',
  });
  const sequence = createDripSequenceDraft({
    actor: superAdmin,
    channel: 'telegram',
    goal: plan.goal,
    audience: plan.audience,
    message_count: plan.message_count,
    sender: { sender_key: 'bna_sender_pending' },
    schedule: { start: 'next_monday' },
    rate_limit: { max_per_hour: 250, batch_size: 100 },
  });

  assert.equal(plan.action_category, 'drip_sequence');
  assert.equal(plan.message_count, 6);
  assert.equal(sequence.sequence.message_count, 6);
  assert.equal(sequence.sequence.messages[0].message_number, 1);
  assert.equal(sequence.sequence.messages.every((message) => message.version_key), true);
  assert.equal(sequence.previews.length, 6);
  assert.equal(sequence.safety_gate.no_send_before_audience_preview, true);
  assert.equal(sequence.safety_gate.explicit_approval_required, true);
  assert.equal(sequence.sequence_enabled, false);
  assert.equal(sequence.external_send_performed, false);
});

test('email campaign drafts use shared draft/version previews and never send', () => {
  const campaign = createCampaignDraft({
    actor: superAdmin,
    channel: 'website_assistant',
    goal: 'Invite parents to the new class.',
    audience: {
      segment_name: 'Approved parents',
      estimated_count: 120,
      consent_count: 120,
      suppression_counts: { unsubscribed: 2 },
    },
    message: { subject: 'New class opening', body: 'Draft copy for review.' },
    sender: { sender_key: 'bna_sender_pending' },
  });

  assert.equal(campaign.action_category, 'email_campaign');
  assert.equal(campaign.email.draft.object_type, 'email');
  assert.equal(campaign.email.version.content.subject, 'New class opening');
  assert.equal(campaign.email.preview.external_action, true);
  assert.equal(campaign.email.preview.blockers.includes('External send approval is required before delivery.'), true);
  assert.equal(campaign.campaign_execution_performed, false);
});

test('campaign policy denies live send without explicit approval and cross-workspace provider drafts', () => {
  assert.throws(() => assertCampaignPolicy({
    actor: superAdmin,
    channel: 'telegram',
    action_category: 'drip_sequence',
    operation: 'send',
    dry_run: false,
  }), /approval_required_for_external_action/);

  assert.throws(() => createDripSequenceDraft({
    actor: provider,
    channel: 'provider_portal_assistant',
    goal: 'Provider campaign for the wrong workspace.',
    workspace_key: 'bna',
    project_key: 'bna',
    audience: { segment_name: 'Wrong workspace', estimated_count: 10, consent_count: 10 },
  }), /permission_denied: workspace_scope_mismatch/);

  const providerSequence = createDripSequenceDraft({
    actor: provider,
    channel: 'provider_portal_assistant',
    goal: 'Provider parent welcome sequence.',
    audience: { segment_name: 'Provider parents', estimated_count: 20, consent_count: 20 },
    message_count: 3,
  });
  assert.equal(providerSequence.workspace_key, undefined);
  assert.equal(providerSequence.audience_preview.workspace_key, 'rabbi_sheller_provider');
  assert.equal(providerSequence.sequence.message_count, 3);
});

test('shared planner exposes campaign actions to authorized actors and keeps parents out', async () => {
  const message = 'Create a six email drip sequence for 1,000 opted-in leads and exclude unsubscribed contacts.';
  const adminPlan = buildAssistantActionPlan({
    channel: 'operations_helper',
    actor: superAdmin,
    message,
  });

  assert.equal(adminPlan.actions[0].action_id, 'draft_drip_sequence');
  assert.equal(adminPlan.actions[0].approval_required, true);
  assert.equal(adminPlan.actions[0].preview_required, true);
  assert.equal(adminPlan.actions[0].inputs.message_count, 6);
  assert.equal(adminPlan.actions[0].inputs.estimated_count, 1000);

  const preview = await runPlannedAssistantAction({ plan: adminPlan });
  assert.equal(preview.success, true);
  assert.equal(preview.executed, false);
  assert.equal(preview.dry_run, true);
  assert.equal(preview.preview.requirement_id, 'REQ-20260623-020');
  assert.equal(preview.preview.action_category, 'drip_sequence');
  assert.equal(preview.preview.external_send_performed, false);

  const parentPlan = buildAssistantActionPlan({
    channel: 'parent_portal_assistant',
    actor: parent,
    requested_action_id: 'draft_drip_sequence',
    message,
  });
  assert.deepEqual(parentPlan.actions, []);
  assert.deepEqual(parentPlan.rejected_actions, [
    { action_id: 'draft_drip_sequence', reason: 'permission_denied' },
  ]);
});
