#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const {
  ONE_TIME_DOMAIN,
  ONE_TIME_FROM_EMAIL,
  ONE_TIME_FROM_NAME,
  ONE_TIME_REPLY_TO,
  buildOneTimeEmailWorkflowPreview,
} = require('../src/lib/bna/one-time-launch-readiness');

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const server = fs.readFileSync(path.join(repoRoot, 'server.js'), 'utf8');
const operations = fs.readFileSync(path.join(repoRoot, 'public', 'operations.html'), 'utf8');
const preview = buildOneTimeEmailWorkflowPreview({
  resendReadiness: {
    configured: true,
    connected: false,
    domain: ONE_TIME_DOMAIN,
    domain_verified: false,
    blocker: 'smoke preview only',
  },
});

assert.match(server, /\/api\/bna\/one-time\/email-workflow-preview/);
assert.match(operations, /getOneTimeEmailWorkflowPreview/);
assert.match(operations, /One Time Email Sequence/);
assert.equal(preview.domain, ONE_TIME_DOMAIN);
assert.equal(preview.sender_identity.from_email, ONE_TIME_FROM_EMAIL);
assert.equal(preview.sender_identity.display_name, ONE_TIME_FROM_NAME);
assert.equal(preview.sender_identity.reply_to, ONE_TIME_REPLY_TO);
assert.equal(preview.bulk_send_enabled, false);
assert.equal(preview.test_send_enabled, false);
assert.equal(preview.email_send_performed, false);
assert.ok(preview.drafts.length >= 6);
assert.equal(preview.drafts.every((draft) => draft.preview_only && draft.email_send_performed === false), true);
assert.equal(preview.drafts.every((draft) => draft.from_email === ONE_TIME_FROM_EMAIL), true);
assert.equal(preview.drafts.every((draft) => draft.from_name === ONE_TIME_FROM_NAME), true);
assert.equal(preview.drafts.every((draft) => draft.reply_to === ONE_TIME_REPLY_TO), true);

console.log(JSON.stringify({
  success: true,
  domain: preview.domain,
  from_email: preview.sender_identity.from_email,
  from_name: preview.sender_identity.display_name,
  reply_to: preview.sender_identity.reply_to,
  draft_count: preview.drafts.length,
  bulk_send_enabled: preview.bulk_send_enabled,
  test_send_enabled: preview.test_send_enabled,
  email_send_performed: preview.email_send_performed,
}, null, 2));
