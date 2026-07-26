const assert = require('assert');
const test = require('node:test');

const {
  HIGHLEVEL_EXPORT_SOURCE,
  parseHighLevelAgentModeExport,
} = require('../src/lib/bna/agent-action-hub');

test('authoritative PR 107 queue reconciles creation work and explicit workflow follow-ups without duplicates', () => {
  const jobs = Array.from({ length: 13 }, (_, index) => ({
    job_id: `GHL-UI-${String(index + 1).padStart(2, '0')}`,
    order: index + 1,
    title: `job ${index + 1}`,
    ghl_location: { location_id: 'protected-location', location_fingerprint: 'safe-fingerprint' },
    exact_copy_paste_prompt: `Verify protected-location job ${index + 1}`,
    target_application: 'HighLevel',
    target_workspace: 'one_time',
    target_ui_url: 'https://app.gohighlevel.com/',
    idempotency_key: `queue:${index + 1}`,
  }));
  const parsed = parseHighLevelAgentModeExport(JSON.stringify({
    schema_id: 'bna-agent-action-export',
    schema_version: '1.1.0',
    jobs,
  }), HIGHLEVEL_EXPORT_SOURCE);
  assert.equal(parsed.success, true);
  assert.equal(parsed.jobs.length, 31);
  assert.equal(new Set(parsed.jobs.map((job) => job.job_id)).size, 31);
  assert.equal(parsed.jobs.find((job) => job.job_id === 'GHL-UI-01').status, 'verified');
  assert.equal(parsed.jobs.find((job) => job.job_id === 'GHL-UI-08').status, 'superseded');
  assert.equal(parsed.jobs.find((job) => job.job_id === 'GHL-FOLLOWUP-OT-C01').status, 'blocked');
  assert.equal(parsed.source.sha, '1fb2d39285b5cf644f2a5bc04d27e1b7385db173');
  assert.equal(parsed.source.authoritative_result_blob_sha, '91719bc831bbe8a9b6032d6f27a946abe77b69f4');
  assert.equal(parsed.source.authoritative_result_sha256, 'b5e116a99854c634b19bdee4653becb424d635368890ba5a92bca859841537cf');
  assert.doesNotMatch(JSON.stringify(parsed.jobs), /protected-location/);
});
