const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { serviceRoot } = require('./helpers');

test('migration creates a separate control-plane schema only', () => {
  const sql = fs.readFileSync(path.join(serviceRoot, 'migrations', '001-control-plane-v1.sql'), 'utf8');
  assert.match(sql, /CREATE SCHEMA IF NOT EXISTS bna_control_plane/);
  assert.doesNotMatch(sql, /public\./i);
  assert.doesNotMatch(sql, /one_time\./i);
  assert.doesNotMatch(sql, /bna_school\./i);
});

test('case index schema contains no detailed support ownership fields', () => {
  const sql = fs.readFileSync(path.join(serviceRoot, 'migrations', '001-control-plane-v1.sql'), 'utf8');
  const forbiddenColumns = [
    'customer',
    'actor',
    'account',
    'entitlement',
    'contact',
    'attachment',
    'message',
    'reproduction',
    'diagnostic',
    'payment',
    'student',
    'guardian',
    'parent',
    'child',
    'email',
    'phone',
    'whatsapp',
    'telegram_chat',
    'raw_body',
    'payload'
  ];
  for (const column of forbiddenColumns) {
    assert.doesNotMatch(sql, new RegExp(`\\b${column}\\b`, 'i'), column);
  }
  assert.match(sql, /redacted_summary TEXT/);
  assert.match(sql, /product_case_url TEXT NOT NULL/);
});
