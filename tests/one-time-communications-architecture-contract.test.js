const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');
const CONTRACT_ROOT = path.join(ROOT, 'docs', 'architecture', 'contracts');

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function sorted(value) {
  return [...value].sort();
}

function assertTopLevelSchemaMatch(schema, instance) {
  for (const key of schema.required || []) {
    assert.ok(Object.hasOwn(instance, key), `missing required property ${key}`);
  }
  if (schema.additionalProperties === false) {
    const allowed = new Set(Object.keys(schema.properties || {}));
    assert.deepEqual(
      Object.keys(instance).filter((key) => !allowed.has(key)),
      [],
      'instance has unexpected top-level properties',
    );
  }
  for (const [key, definition] of Object.entries(schema.properties || {})) {
    if (!Object.hasOwn(instance, key)) continue;
    if (Object.hasOwn(definition, 'const')) {
      assert.deepEqual(instance[key], definition.const, `${key} must match schema const`);
    }
    if (definition.enum) {
      assert.ok(definition.enum.includes(instance[key]), `${key} must match schema enum`);
    }
    if (definition.pattern && typeof instance[key] === 'string') {
      assert.match(instance[key], new RegExp(definition.pattern), `${key} must match schema pattern`);
    }
  }
}

test('One Time connector assigns communication truth without changing BNA School CRM', () => {
  const schema = readJson('docs/architecture/contracts/super-admin-external-product-connector-v1.schema.json');
  const connector = readJson('docs/architecture/contracts/one-time-communications-connector-v1.json');
  assertTopLevelSchemaMatch(schema, connector);

  assert.equal(connector.connector_id, 'one_time');
  assert.equal(connector.connector_type, 'external_product_connector');
  assert.equal(connector.workspace_key, 'one_time');
  assert.equal(connector.project_key, 'one_time_mishnayos');
  assert.equal(connector.sources_of_truth.customer_communications.system, 'highlevel');
  assert.equal(connector.sources_of_truth.customer_communications.canonical, true);
  assert.equal(connector.sources_of_truth.product_accounts.system, 'one_time_app');
  assert.equal(connector.sources_of_truth.product_accounts.canonical, true);
  assert.equal(connector.sources_of_truth.rabbi_interface.system, 'telegram');
  assert.equal(connector.sources_of_truth.rabbi_interface.canonical, false);
  assert.equal(connector.sources_of_truth.security_token_email.system, 'resend');

  assert.deepEqual(connector.bna_school_boundary, {
    workspace_key: 'bna_school',
    crm_source_of_truth: 'first_party_bna_operations',
    ghl_exception_applies: false,
    architecture_preserved: true,
  });
});

test('One Time human routing is Shloimie-default and Rabbi-exact', () => {
  const connector = readJson('docs/architecture/contracts/one-time-communications-connector-v1.json');
  assert.equal(connector.human_routing.default_inbound_owner, 'Shloimie');
  assert.equal(connector.human_routing.rabbi_recipient, 'Rabbi Eli');
  assert.deepEqual(sorted(connector.human_routing.rabbi_allowlist), sorted([
    'assigned_substantive_torah_mishnah_halachic_question',
    'rabbi_authored_newsletter_content_draft',
    'approved_warm_enrollment_draft',
  ]));
  assert.deepEqual(sorted(connector.human_routing.rabbi_denylist), sorted([
    'login',
    'billing',
    'support',
    'scheduling',
    'parent_administration',
    'unknown_general',
  ]));
  assert.equal(connector.human_routing.ai_torah_answer_policy, 'must_not_originate_in_rabbi_name');
});

test('ticket types have separate owners and no BNA catch-all queue', () => {
  const connector = readJson('docs/architecture/contracts/one-time-communications-connector-v1.json');
  assert.deepEqual(
    Object.keys(connector.record_routes).sort(),
    ['business_conversation', 'live_class_question', 'technical_ticket'],
  );
  assert.equal(connector.record_routes.live_class_question.owner, 'one_time');
  assert.equal(connector.record_routes.live_class_question.canonical_system, 'one_time_app');
  assert.equal(connector.record_routes.business_conversation.owner, 'highlevel');
  assert.equal(connector.record_routes.business_conversation.canonical_system, 'highlevel');
  assert.equal(connector.record_routes.technical_ticket.owner, 'platform_control');
  assert.equal(connector.record_routes.technical_ticket.source_workspace_required, true);
  assert.deepEqual(sorted(connector.record_routes.technical_ticket.allowed_source_workspaces), ['bna_school', 'one_time']);
  for (const route of Object.values(connector.record_routes)) {
    assert.equal(route.bna_ticket_queue, false);
  }
});

test('Telegram is non-canonical, GHL receives state changes, and the lane authorizes no writes', () => {
  const connector = readJson('docs/architecture/contracts/one-time-communications-connector-v1.json');
  assert.equal(connector.telegram_contract.canonical_transcript, false);
  assert.deepEqual(sorted(connector.telegram_contract.ghl_write_required_for), ['draft', 'send', 'status_change']);
  assert.equal(connector.telegram_contract.ai_may_originate_torah_answer, false);
  assert.deepEqual(connector.write_policy, {
    external_mutations_authorized: false,
    email_send: false,
    telegram_send: false,
    ghl_mutation: false,
    dns_change: false,
    production_deployment: false,
  });
});

test('Agent Action job and result examples enforce no-mutation save/readback policy', () => {
  const jobSchema = readJson('docs/architecture/contracts/one-time-communications-agent-action-job-v1.schema.json');
  const resultSchema = readJson('docs/architecture/contracts/one-time-communications-agent-action-result-v1.schema.json');
  const job = readJson('docs/architecture/contracts/examples/one-time-communications-agent-action-job-v1.json');
  const result = readJson('docs/architecture/contracts/examples/one-time-communications-agent-action-result-v1.json');

  assertTopLevelSchemaMatch(jobSchema, job);
  assertTopLevelSchemaMatch(resultSchema, result);
  assert.equal(job.job_type, 'agent_action');
  assert.equal(job.target_workspace, 'one_time');
  assert.equal(job.target_connector_id, 'one_time');
  assert.equal(job.communications_policy.customer_communication_source_of_truth, 'highlevel');
  assert.equal(job.communications_policy.product_account_source_of_truth, 'one_time_app');
  assert.equal(job.communications_policy.telegram_is_canonical_transcript, false);
  assert.equal(job.communications_policy.ghl_write_required_for_customer_communication_changes, true);
  assert.equal(job.communications_policy.resend_usage, 'security_token_email_only');
  assert.equal(job.communications_policy.default_inbound_owner, 'Shloimie');
  assert.equal(job.communications_policy.ai_may_originate_torah_answer_in_rabbi_name, false);
  assert.equal(job.communications_policy.bna_school_architecture_preserved, true);
  assert.equal(job.communications_policy.external_mutation_authorized, false);
  assert.equal(result.job_id, job.job_id);
  assert.equal(result.readback_verified, true);
  assert.deepEqual(result.external_mutations, []);
  assert.equal(result.production_deployed, false);
});

test('durable prose repeats the connector-only exception and BNA boundary', () => {
  const adr = readText('docs/architecture/one-time-communications-architecture-v1.md');
  const roleMap = readText('docs/architecture/workspace-community-provider-role-map.md');
  const memory = readText('MEMORY.md');
  const oneTimeTopic = readText('memory-topics/one-time-rabbi-sheller.md');
  const resendTopic = readText('memory-topics/email-resend.md');
  const noGhlPolicy = readText('docs/architecture/no-ghl-policy.md');

  for (const text of [adr, roleMap, memory, oneTimeTopic]) {
    assert.match(text, /GHL/i);
    assert.match(text, /BNA School/i);
    assert.match(text, /Shloimie/i);
    assert.match(text, /security-token/i);
  }
  assert.match(adr, /One Time is not BNA/);
  assert.match(adr, /AI may not\s+originate a Torah answer in Rabbi Eli's name/);
  assert.match(roleMap, /`technical_ticket`[\s\S]*Requires `source_workspace`/);
  assert.match(memory, /Never promote this\s+exception to `bna_school` or a platform-wide default/);
  assert.match(resendTopic, /security-token email/);
  assert.match(noGhlPolicy, /GHL is the One Time customer-communication source of truth/);
  assert.match(noGhlPolicy, /`bna_school\.ghl_exception_applies=false`/);
});

test('contract directory contains only parseable JSON contract artifacts', () => {
  const jsonFiles = [];
  const walk = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith('.json')) jsonFiles.push(full);
    }
  };
  walk(CONTRACT_ROOT);
  assert.ok(jsonFiles.length >= 5);
  for (const file of jsonFiles) {
    assert.doesNotThrow(() => JSON.parse(fs.readFileSync(file, 'utf8')), file);
  }
});
