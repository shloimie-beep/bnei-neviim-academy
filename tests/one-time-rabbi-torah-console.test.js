const assert = require('assert');
const test = require('node:test');

const {
  ONE_TIME_RABBI_TORAH_CONSOLE_KEY,
  TORAH_CONSOLE_ALLOWED_ACTIONS,
  TORAH_CONSOLE_FORBIDDEN_CAPABILITIES,
  buildOneTimeRabbiTorahConsoleReadiness,
  createFakeTorahConsoleAdapter,
  handleTorahConsoleAction,
  normalizeRabbiAnswerInput,
  validateBulkCampaignConfirmation,
} = require('../src/lib/bna/one-time-rabbi-torah-console');

function fakeAdapter() {
  return createFakeTorahConsoleAdapter({
    questions: [
      {
        question_id: 'TORAH-001',
        title: 'Mishnah question',
        question_text: 'What is the structure of this Mishnah?',
        assigned_to: 'rabbi_elie_scheller',
        ghl_conversation_id: 'conv-synthetic-1',
        pipeline_record_id: 'pipeline-synthetic-1',
        record_type: 'torah_question',
      },
      {
        question_id: 'SUPPORT-001',
        title: 'Login problem',
        record_type: 'general_support',
      },
    ],
    now: () => '2026-07-22T12:00:00.000Z',
  });
}

test('Torah console is provider-off with a fake adapter when protected credentials are absent', () => {
  const readiness = buildOneTimeRabbiTorahConsoleReadiness({ env: {} });
  assert.equal(readiness.console_key, ONE_TIME_RABBI_TORAH_CONSOLE_KEY);
  assert.equal(readiness.mode, 'provider_off');
  assert.equal(readiness.adapter, 'fake');
  assert.equal(readiness.provider_configured, false);
  assert.equal(readiness.operator_private_canary.eligible, false);
  assert.equal(readiness.customer_messages_sent, 0);
  assert.equal(readiness.external_write_performed, false);
  assert.ok(readiness.blockers.includes('protected_rabbi_telegram_bot_token'));
  assert.ok(readiness.blockers.includes('protected_one_time_ghl_token'));
  assert.equal(readiness.configured_key_names.telegram_token, null);
});
test('readiness allows one operator-owned private canary only when every protected provider is configured', () => {
  const readiness = buildOneTimeRabbiTorahConsoleReadiness({
    env: {
      TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER: 'configured-not-returned',
      TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER: 'configured-not-returned',
      ONE_TIME_GHL_PRIVATE_INTEGRATION_TOKEN: 'configured-not-returned',
      ONE_TIME_GHL_LOCATION_ID: 'configured-not-returned',
    },
  });
  assert.equal(readiness.mode, 'private_canary_ready');
  assert.equal(readiness.operator_private_canary.eligible, true);
  assert.equal(readiness.operator_private_canary.max_messages, 1);
  assert.equal(readiness.operator_private_canary.operator_owned_recipient_required, true);
  assert.equal(readiness.operator_private_canary.customer_recipient_allowed, false);
  assert.doesNotMatch(JSON.stringify(readiness), /configured-not-returned/);
});

test('fake adapter lists only assigned Torah questions and never exposes general support', async () => {
  const response = await handleTorahConsoleAction(fakeAdapter(), { action: 'list_assigned_questions' });
  assert.equal(response.result.length, 1);
  assert.equal(response.result[0].question_id, 'TORAH-001');
  assert.equal(response.result[0].record_type, 'torah_question');
  assert.equal(response.result[0].source_of_truth.conversations, 'ghl_conversations');
});

test('Rabbi text and voice drafts can be saved and previewed without a second transcript or send', async () => {
  const adapter = fakeAdapter();
  const text = await handleTorahConsoleAction(adapter, {
    action: 'save_text_draft',
    question_id: 'TORAH-001',
    text: 'Rabbi-authored draft answer.',
  });
  assert.equal(text.result.draft.input_mode, 'text');
  assert.equal(text.result.send_performed, false);

  const voice = await handleTorahConsoleAction(adapter, {
    action: 'save_voice_draft',
    question_id: 'TORAH-001',
    voice: { asset_id: 'voice-synthetic-1', duration_seconds: 18, transcript: 'Rabbi voice draft.' },
  });
  assert.equal(voice.result.draft.input_mode, 'voice');
  assert.equal(voice.result.draft.raw_audio_stored, false);
  const preview = await handleTorahConsoleAction(adapter, {
    action: 'preview_draft',
    question_id: 'TORAH-001',
  });
  assert.equal(preview.result.canonical_delivery_channel, 'ghl_conversations');
  assert.equal(preview.result.local_customer_transcript_created, false);
  assert.equal(preview.result.send_performed, false);
});

test('confirmed answer remains a provider-off GHL preview and sends no customer message', async () => {
  const adapter = fakeAdapter();
  await handleTorahConsoleAction(adapter, {
    action: 'save_text_draft',
    question_id: 'TORAH-001',
    text: 'Rabbi-authored draft answer.',
  });
  await assert.rejects(
    handleTorahConsoleAction(adapter, {
      action: 'send_confirmed_answer',
      question_id: 'TORAH-001',
      confirmed: true,
      exact_question_id: 'WRONG-ID',
    }),
    /exact_answer_confirmation_required/
  );
  const response = await handleTorahConsoleAction(adapter, {
    action: 'send_confirmed_answer',
    question_id: 'TORAH-001',
    confirmed: true,
    exact_question_id: 'TORAH-001',
  });
  assert.equal(response.result.channel, 'ghl_conversations');
  assert.equal(response.result.status, 'provider_off_preview');
  assert.equal(response.result.send_performed, false);
  assert.equal(response.result.customer_message_sent, false);
  assert.equal(response.result.local_customer_transcript_created, false);
  assert.equal(response.customer_messages_sent, 0);
});

test('return, close, newsletter, and warm enrollment email remain draft/control-only', async () => {
  const adapter = fakeAdapter();
  const returned = await handleTorahConsoleAction(adapter, {
    action: 'return_to_shloimie',
    question_id: 'TORAH-001',
    reason: 'Needs account-owner context.',
  });
  assert.equal(returned.result.question.status, 'returned_to_shloimie');
  const closed = await handleTorahConsoleAction(adapter, {
    action: 'close_question',
    question_id: 'TORAH-001',
  });
  assert.equal(closed.result.question.status, 'closed');
  const newsletter = await handleTorahConsoleAction(adapter, {
    action: 'draft_torah_newsletter',
    subject: 'This week in Mishnayos',
    body: 'Draft only.',
  });
  const enrollment = await handleTorahConsoleAction(adapter, {
    action: 'draft_warm_enrollment_email',
    subject: 'A warm invitation',
    body: 'Draft only.',
  });
  assert.equal(newsletter.result.send_performed, false);
  assert.equal(enrollment.result.send_performed, false);
  assert.equal(newsletter.result.bulk_send_allowed, false);
  assert.equal(enrollment.result.bulk_send_allowed, false);
});

test('bulk campaign send is unavailable and exact segment/count/confirmation stay mandatory', async () => {
  const incomplete = validateBulkCampaignConfirmation({ exact_segment: 'warm leads', recipient_count: 12 });
  assert.equal(incomplete.valid, false);
  assert.deepEqual(incomplete.missing, ['explicit_confirmation']);
  const complete = validateBulkCampaignConfirmation({ exact_segment: 'warm leads', recipient_count: 12, confirmed: true });
  assert.equal(complete.valid, true);
  await assert.rejects(
    handleTorahConsoleAction(fakeAdapter(), {
      action: 'send_bulk_campaign',
      exact_segment: 'warm leads',
      recipient_count: 12,
      confirmed: true,
    }),
    /bulk_campaign_send_not_available/
  );
  assert.ok(TORAH_CONSOLE_ALLOWED_ACTIONS.includes('draft_torah_newsletter'));
  assert.ok(TORAH_CONSOLE_FORBIDDEN_CAPABILITIES.includes('answer_torah_independently'));
});

test('console rejects adapters that create a second transcript or use a non-GHL answer channel', async () => {
  const wrongChannel = {
    sendConfirmedAnswer: async () => ({ channel: 'telegram', send_performed: false }),
  };
  await assert.rejects(
    handleTorahConsoleAction(wrongChannel, {
      action: 'send_confirmed_answer',
      question_id: 'TORAH-001',
      confirmed: true,
      exact_question_id: 'TORAH-001',
    }),
    /answers_must_send_through_ghl_conversations/
  );
  const secondTranscript = {
    sendConfirmedAnswer: async () => ({ channel: 'ghl_conversations', local_customer_transcript_created: true }),
  };
  await assert.rejects(
    handleTorahConsoleAction(secondTranscript, {
      action: 'send_confirmed_answer',
      question_id: 'TORAH-001',
      confirmed: true,
      exact_question_id: 'TORAH-001',
    }),
    /second_customer_transcript_forbidden/
  );
});

test('voice normalization stores a reference and transcript only, never raw audio', () => {
  const normalized = normalizeRabbiAnswerInput({
    voice: { asset_id: 'voice-1', duration_seconds: 9, transcript: 'Draft transcript.' },
  });
  assert.equal(normalized.input_mode, 'voice');
  assert.equal(normalized.voice.asset_id, 'voice-1');
  assert.equal(normalized.raw_audio_stored, false);
  assert.equal(Object.hasOwn(normalized.voice, 'data'), false);
});
