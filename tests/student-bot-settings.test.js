const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');

test('student bot settings are persisted, project-scoped, and route-filterable', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_student_bot_settings/);
  assert.match(server, /UNIQUE \(student_id, channel\)/);
  assert.match(server, /idx_bna_student_bot_settings_active_chat_unique/);
  assert.match(server, /source_chat_id IS NOT NULL/);
  assert.match(server, /ALTER TABLE bna_student_bot_settings ADD COLUMN IF NOT EXISTS project_id/);
  assert.match(server, /await pool\.query\(createStudentBotSettingsSQL\)/);
  assert.match(server, /UPDATE bna_student_bot_settings b[\s\S]*SET project_id = s\.project_id/);
});

test('student bot admin APIs expose filtered list, save, and prompt preview', () => {
  assert.match(server, /app\.get\('\/api\/bna\/student-bot-settings'/);
  assert.match(server, /source_chat_id/);
  assert.match(server, /active_only/);
  assert.match(server, /include_prompt/);
  assert.match(server, /app\.put\('\/api\/bna\/students\/:id\/bot-settings\/:channel'/);
  assert.match(server, /app\.get\('\/api\/bna\/students\/:id\/bot-settings\/:channel\/preview'/);
  assert.match(server, /await assertStudentAccess\(req, studentId\)/);
  assert.match(server, /That active chat id is already assigned to another student bot/);
});

test('resolved student bot prompts include student context and hard privacy guardrails', () => {
  assert.match(server, /function buildStudentBotPromptPreview/);
  assert.match(server, /This bot is scoped only to student #/);
  assert.match(server, /Never reveal access codes, credentials, billing\/accounting, admin analysis, private meeting notes/);
  assert.match(server, /other students' information/);
  assert.match(server, /Student-visible goals/);
  assert.match(server, /Student-visible assignments/);
  assert.match(server, /Student-visible calendar/);
  assert.match(server, /Student-visible questions/);
  assert.match(server, /Operator prompt patch for this student bot/);
});

test('Operations UI can filter and configure student bot routes', () => {
  assert.match(operations, /STUDENT_BOT_FILTERS/);
  assert.match(operations, /studentBotRouteState/);
  assert.match(operations, /studentBotFilter/);
  assert.match(operations, /Student bot route filter/);
  assert.match(operations, /Bot \$\{escapeHtml\(studentBotRouteLabel\(botState\)\)\}/);
  assert.match(operations, /function renderStudentBotSettingsView/);
  assert.match(operations, /Telegram Bot Route/);
  assert.match(operations, /Source Chat ID/);
  assert.match(operations, /Per-Student Prompt Patch/);
  assert.match(operations, /saveStudentBotSettings/);
  assert.match(operations, /previewStudentBotPrompt/);
  assert.doesNotMatch(operations, /per-student bot routing, WhatsApp identities, prompts, and transcript permissions do not have persistence yet/);
});
