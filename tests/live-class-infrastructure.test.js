const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');
const memberPortal = fs.readFileSync('public/member.html', 'utf8');
const telegramBridge = fs.readFileSync('scripts/telegram-kimi-bridge.mjs', 'utf8');

test('server defines first-party live class tables and keeps class transcript table separate', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_members/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_live_class_series/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_live_class_sessions/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_live_class_attendance/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_communication_log/);
  assert.match(server, /const createOneTimeMemberLibrarySQL = `/);
  assert.match(server, /ALTER TABLE bna_class_sessions ADD COLUMN IF NOT EXISTS media_url/);
});

test('server exposes admin and member live class APIs', () => {
  for (const route of [
    "app.get('/api/bna/members'",
    "app.post('/api/bna/members'",
    "app.patch('/api/bna/members/:id'",
    "app.post('/api/bna/members/:id/access-code'",
    "app.get('/api/bna/live-sessions'",
    "app.post('/api/bna/live-sessions'",
    "app.get('/api/bna/live-sessions/tonight'",
    "app.patch('/api/bna/live-sessions/:id'",
    "app.post('/api/bna/live-sessions/:id/check-in'",
    "app.post('/api/bna/live-sessions/:id/send-zoom-link'",
    "app.get('/api/bna/live-sessions/:id/communications'",
    "app.get('/api/member-portal'",
    "app.get('/api/member-portal/live-sessions'",
    "app.post('/api/member-portal/live-sessions/:id/check-in'",
    "app.get('/api/member-portal/library'",
  ]) {
    assert.ok(server.includes(route), `${route} missing`);
  }
});

test('operations UI and member portal include live classes without static Zoom URLs', () => {
  assert.match(operations, /id: 'live_classes', label: 'Live Classes'/);
  assert.match(operations, /function renderLiveClasses\(\)/);
  assert.match(operations, /sendLiveSessionZoomLink/);
  assert.match(memberPortal, /api\/member-portal\/live-sessions/);
  assert.match(memberPortal, /api\/member-portal\/library/);
  assert.doesNotMatch(memberPortal, /zoom\.us\/j/i);
});

test('telegram bridge redacts Zoom URLs from general context and supports direct live commands', () => {
  assert.match(telegramBridge, /redactZoomLinksForTelegram/);
  assert.match(telegramBridge, /handleLiveClassTelegramCommand/);
  assert.match(telegramBridge, /Zoom URLs are omitted from this general snapshot/);
  assert.match(telegramBridge, /\[zoom link redacted\]/);
});
