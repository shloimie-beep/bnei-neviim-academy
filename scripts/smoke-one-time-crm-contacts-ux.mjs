#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const {
  ONE_TIME_PROJECT_KEY,
  ONE_TIME_WORKSPACE_KEY,
  buildOneTimeContactImportPlan,
} = require('../src/lib/bna/one-time-launch-readiness');

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const operations = fs.readFileSync(path.join(repoRoot, 'public', 'operations.html'), 'utf8');
const plan = buildOneTimeContactImportPlan();

assert.match(operations, /Email Contacts Map/);
assert.match(operations, /one-time-list:rabbi-email-contacts/);
assert.match(operations, /one-time-no-send-until-approved/);
assert.match(operations, /No One Time email contacts are uploaded yet/);
assert.match(operations, /Campaign staging is tagged, but no email, WhatsApp, Telegram, Buffer, payment, or external CRM send is triggered here\./);
assert.equal(plan.workspace_key, ONE_TIME_WORKSPACE_KEY);
assert.equal(plan.project_key, ONE_TIME_PROJECT_KEY);
assert.equal(plan.no_send, true);
assert.equal(plan.external_write_performed, false);
assert.equal(plan.private_contact_values_in_report, false);

console.log(JSON.stringify({
  success: true,
  workspace_key: plan.workspace_key,
  project_key: plan.project_key,
  contacts_after_dedupe: plan.counts.contacts_after_dedupe,
  no_send_contacts: plan.counts.no_send,
  ui_contracts: [
    'email_contacts_map_visible',
    'one_time_list_tag_visible',
    'no_send_tag_visible',
    'no_external_send_copy_visible',
  ],
}, null, 2));
