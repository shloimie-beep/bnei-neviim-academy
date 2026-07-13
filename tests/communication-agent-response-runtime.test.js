const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const {
  RESPONSE_RUNTIME_VERSION,
  enforceCommunicationAgentPolicy,
  generateCommunicationAgentResponse,
  hasRawClassLink,
  hasUnsafeProgramClaim,
  scopedConversationHistory,
} = require('../src/lib/bna/crm/communication-agent-response-runtime');

const oneTimeBinding = {
  workspace_key: 'rabbi_sheller_provider',
  project_key: 'one_time_mishnah_class',
};

test('communication-agent response runtime accepts safe model replies and keeps delivery draft for email', async () => {
  let requested = null;
  const result = await generateCommunicationAgentResponse({
    binding: oneTimeBinding,
    channel: 'email',
    provider: 'resend',
    message: 'What time is the class?',
    contact: { contact_type: 'lead', lead_id: 12 },
    conversationHistory: [
      { direction: 'inbound', body: 'Can I have https://private.example.invalid/class please?' },
    ],
    publicBaseUrl: 'https://join.onetimeonetime.com',
    openai: {
      apiKey: 'test-key-never-returned',
      model: 'gpt-test-communication',
      fetchImpl: async (url, options) => {
        requested = { url, options };
        return {
          ok: true,
          text: async () => JSON.stringify({
            id: 'resp_safe_123',
            output_text: JSON.stringify({
              reply: 'The class is live every day at 7:00 p.m. Israel time.',
              proposed_actions: [],
            }),
          }),
        };
      },
    },
  });

  assert.equal(result.success, true);
  assert.equal(result.runtime_version, RESPONSE_RUNTIME_VERSION);
  assert.equal(result.agent_key, 'one_time_parent_information_agent');
  assert.equal(result.agent_version, '2026-07-13-v3');
  assert.match(result.knowledge_snapshot_version, /^one_time_parent_information_agent:2026-07-13-v3:/);
  assert.equal(result.channel, 'email');
  assert.equal(result.model_status, 'ok');
  assert.equal(result.response_status, 'model_reply_accepted');
  assert.equal(result.reply, 'The class is live every day at 7:00 p.m. Israel time.');
  assert.equal(result.delivery.mode, 'draft');
  assert.equal(result.delivery.enqueue, false);
  assert.equal(result.create_task, false);
  assert.equal(result.external_send_performed, false);
  assert.equal(result.prompt_input_returned, false);
  assert.equal(result.raw_api_key_stored, false);
  assert.equal(result.raw_secret_returned, false);
  assert.equal(result.raw_class_link_in_model_context, false);
  assert.equal(result.model_response_id, 'resp_safe_123');
  assert.doesNotMatch(JSON.stringify(result), /test-key-never-returned|private\.example\.invalid/i);

  assert.ok(requested);
  const body = JSON.parse(requested.options.body);
  assert.equal(body.model, 'gpt-test-communication');
  assert.doesNotMatch(body.input, /private\.example\.invalid|test-key-never-returned/i);
  assert.match(body.input, /\[redacted-url\]/);
  assert.match(body.instructions, /Do not state a trial length, price, renewal term/i);
});

test('runtime blocks stale model claims and falls back to deterministic approved reply', async () => {
  const result = await generateCommunicationAgentResponse({
    binding: oneTimeBinding,
    channel: 'whatsapp',
    provider: 'wapi',
    message: 'Do we get a parent portal and library?',
    contact: { contact_type: 'lead', lead_id: 19 },
    publicBaseUrl: 'https://join.onetimeonetime.com',
    openai: {
      apiKey: 'test-key-never-returned',
      fetchImpl: async () => ({
        ok: true,
        text: async () => JSON.stringify({
          output_text: JSON.stringify({
            reply: 'Yes, the parent portal is open with library access after the 30-day trial.',
            proposed_actions: [{ action_id: 'ACTION-CREATE-CRM-TASK' }],
          }),
        }),
      }),
    },
  });

  assert.equal(result.model_status, 'ok');
  assert.equal(result.response_status, 'model_reply_blocked_fallback_used');
  assert.equal(result.model_reply_blocked, true);
  assert.equal(result.fallback_used, true);
  assert.match(result.reply, /We are not giving portal access yet/);
  assert.doesNotMatch(result.reply, /30-day|parent portal is open|library access after/i);
  assert.equal(result.blocked_actions[0].action_id, 'ACTION-CREATE-CRM-TASK');
  assert.equal(result.blocked_actions[0].reason, 'prohibited_capability');
  assert.equal(result.create_task, false);
  assert.equal(result.delivery.mode, 'capture_only');
  assert.equal(result.delivery.enqueue, false);
});

test('runtime preserves inbound data path and uses an approved fallback when OpenAI fails', async () => {
  const result = await generateCommunicationAgentResponse({
    binding: oneTimeBinding,
    channel: 'whatsapp',
    provider: 'wapi',
    message: 'Please send me the class link',
    contact: { contact_type: 'lead', lead_id: 20 },
    publicBaseUrl: 'https://join.onetimeonetime.com',
    openai: {
      apiKey: 'test-key-never-returned',
      fetchImpl: async () => {
        throw new Error('network down with sk-secret-never-returned');
      },
    },
  });

  assert.equal(result.success, true);
  assert.equal(result.model_status, 'provider_exception');
  assert.equal(result.response_status, 'fallback_used');
  assert.match(result.reply, /Please sign up here:/);
  assert.equal(result.delivery.mode, 'capture_only');
  assert.equal(result.delivery.enqueue, false);
  assert.equal(result.deterministic_plan.class_link_requested, true);
  assert.equal(result.deterministic_plan.class_link_released, false);
  assert.equal(result.deterministic_plan.raw_class_link_returned, false);
  assert.equal(result.external_send_performed, false);
  assert.equal(result.create_task, false);
  assert.doesNotMatch(JSON.stringify(result), /sk-secret-never-returned|test-key-never-returned/i);
});

test('policy helpers detect unsafe claims, raw links, and redact scoped history', () => {
  assert.equal(hasUnsafeProgramClaim('The 30-day trial is $67 per month.'), true);
  assert.equal(hasUnsafeProgramClaim('Live every day at 7:00 p.m. Israel time.'), false);
  assert.equal(hasRawClassLink('Join at https://zoom.us/j/123'), true);
  assert.equal(hasRawClassLink('Sign up at https://join.onetimeonetime.com/one-time/signup'), false);

  const history = scopedConversationHistory([
    { direction: 'inbound', body: 'My raw link is https://zoom.us/j/abc' },
    { direction: 'outbound', body: 'Use the public signup page.' },
  ]);
  assert.equal(history.length, 2);
  assert.match(history[0].body, /\[redacted-url\]/);
  assert.equal(history[0].raw_provider_id_returned, false);
});

test('policy blocks arbitrary access, payment, and task actions even with a safe reply', () => {
  const policy = enforceCommunicationAgentPolicy({
    agent: { reply_mode: 'live', outbox_channel_key: 'whatsapp:one_time_agent_reply' },
    deterministicPlan: { reply_body: 'Thanks, I saved this for review.' },
    modelResult: {
      reply: 'Thanks, I saved this for review.',
      proposed_actions: [
        { action_id: 'ACTION-GRANT-ACCESS' },
        { action_id: 'ACTION-CHARGE-PAYMENT' },
        { action_id: 'ACTION-COMMUNICATION-HUMAN-HANDOFF' },
      ],
    },
    modelStatus: 'ok',
  });

  assert.equal(policy.response_status, 'model_reply_accepted');
  assert.equal(policy.delivery.enqueue, true);
  assert.deepEqual(policy.allowed_actions.map((action) => action.action_id), ['ACTION-COMMUNICATION-HUMAN-HANDOFF']);
  assert.deepEqual(policy.blocked_actions.map((action) => action.action_id), ['ACTION-GRANT-ACCESS', 'ACTION-CHARGE-PAYMENT']);
  assert.equal(policy.create_task, false);
  assert.equal(policy.external_send_performed, false);
});

test('WAPI webhook wires response runtime after inbound persistence and before auto-reply decisions', () => {
  const server = fs.readFileSync('server.js', 'utf8');
  assert.match(server, /generateCommunicationAgentResponse/);
  assert.match(server, /stampOneTimeCommunicationAgentResponse/);
  assert.match(server, /loadOneTimeCommunicationAgentConversationHistory/);
  assert.match(server, /communication_agent_runtime_version/);
  assert.match(server, /communication_agent_external_send_performed:\s*false/);
  assert.match(server, /OPENAI_API_KEY/);

  const inboundIndex = server.indexOf('let communicationResult = await createCommunicationFromWapiWebhook');
  const runtimeIndex = server.indexOf('communicationAgentResponse = await generateCommunicationAgentResponse', inboundIndex);
  const stampIndex = server.indexOf('stampOneTimeCommunicationAgentResponse', runtimeIndex);
  const applyIndex = server.indexOf('const applied = await applyOneTimeProviderBotPlan', stampIndex);
  const autoReplyIndex = server.indexOf('maybeSendOneTimeWapiAutoReply', applyIndex);
  assert.ok(inboundIndex > 0, 'inbound communication must be persisted first');
  assert.ok(runtimeIndex > inboundIndex, 'response runtime must run after inbound persistence');
  assert.ok(stampIndex > runtimeIndex, 'runtime metadata must be stamped before plan persistence');
  assert.ok(applyIndex > stampIndex, 'provider plan persistence should include runtime metadata');
  assert.ok(autoReplyIndex > applyIndex, 'auto-reply/outbox decision remains after runtime policy gates');
});
