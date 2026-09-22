const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

test('agentic goal memory source-of-truth files and migration exist', () => {
  for (const file of [
    'QUALITY-GOALS.md',
    'GOAL-MODE.md',
    'AGENTIC-MEMORY.md',
    'railway-migration-2026-06-17-agentic-goal-memory.sql',
    'src/lib/bna/intake-schema.js',
    'src/lib/bna/goal-memory.js',
    'src/lib/bna/goal-registry.js',
  ]) {
    assert.ok(fs.existsSync(file), file);
  }
  const agents = fs.readFileSync('AGENTS.md', 'utf8');
  assert.match(agents, /## Universal Natural Language Intake Protocol/);
  assert.match(agents, /## Agentic Goal Memory/);
  assert.match(agents, /## Goal Promotion Rules/);
  assert.match(agents, /## Action Registry Requirement/);
  assert.match(agents, /## Route Registry Requirement/);
  assert.match(agents, /## Definition of Done/);
});

test('package scripts expose watchdog hardening commands', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  for (const script of [
    'watchdog:audit',
    'watchdog:ui',
    'watchdog:links',
    'watchdog:actions',
    'watchdog:security',
    'watchdog:raw',
    'watchdog:content',
    'watchdog:communications',
    'watchdog:visual',
    'watchdog:all',
  ]) {
    assert.ok(pkg.scripts[script], script);
  }
});
