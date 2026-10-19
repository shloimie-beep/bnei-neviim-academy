'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const server = fs.readFileSync('server.js', 'utf8');
const start = fs.readFileSync('scripts/railway-start.mjs', 'utf8');
const initializer = server.slice(server.indexOf('async function initDb()'), server.indexOf('\ninitDb();'));
const inboundInitializer = server.slice(server.indexOf('let lifeSkillsAppInboundPool = null;'), server.indexOf('\nasync function captureLifeSkillsAppInbound('));

for (const [skip, present] of [[true, true], [true, false], [false, true]]) {
  test(`existing inbound outbox uses read-only validation in no-DB boot, skip=${skip} present=${present}`, async () => {
    const statements = [], pool = {query: async sql => { statements.push(sql); return {rows: [{present}]}; }};
    const work = vm.runInNewContext(inboundInitializer + '\nlifeSkillsAppInboundDatabase();', {
      process: {env: {BNA_WEBSITE_ONLY_NO_DB_BOOT: String(skip)}},
      createLifeSkillsAppInboundPool: () => pool,
      createLifeSkillsAppInboundOutboxSQL: 'CREATE SYNTHETIC OUTBOX ONLY',
    });
    if (skip && !present) await assert.rejects(work, /EXISTING_INBOUND_OUTBOX_REQUIRED/);
    else assert.equal(await work, pool);
    assert.equal(statements.length, 1);
    if (skip) assert.equal(statements[0], "SELECT to_regclass('public.bna_life_skills_app_inbound_outbox') IS NOT NULL AS present");
    else assert.equal(statements[0], 'CREATE SYNTHETIC OUTBOX ONLY');
  });
}

for (const value of ['true', undefined, 'false', 'TRUE', '1']) {
  test(`database initializer skips all statements only for exact release opt-in ${value}`, async () => {
    let queries = 0;
    const env = value === undefined ? {} : {BNA_WEBSITE_ONLY_NO_DB_BOOT: value};
    await vm.runInNewContext(initializer + '\ninitDb();', {
      process: {env}, console: {log() {}, error() {}},
      ONE_TIME_REVIEW_ONLY_NO_DB: false, DATABASE_URL: 'synthetic-only',
      createSignupsTableSQL: 'synthetic first bootstrap statement',
      pool: {query: async () => { queries++; throw Error('STOP_SYNTHETIC_NORMAL_BOOT'); }},
    });
    assert.equal(queries, value === 'true' ? 0 : 1);
  });
}

for (const mode of ['web', 'server', 'telegram-academy', 'telegram-rabbi']) {
  for (const skip of [false, true]) {
    test(`${mode} routing is preserved, no-DB boot=${skip}`, () => {
      const calls = [], preflights = [];
      const source = start.replace(/^#![^\r\n]*\r?\n/, '').replace(/^import [^\r\n]*\r?\n/gm, '');
      vm.runInNewContext(source, {
        process: {env: {BNA_RAILWAY_PROCESS: mode, BNA_WEBSITE_ONLY_NO_DB_BOOT: String(skip)}, platform: 'linux', on() {}, exit() { throw Error('UNEXPECTED_EXIT'); }},
        console: {log() {}, error() {}},
        spawnSync(command, args) { preflights.push({command, args}); return {status: 0}; },
        spawn(command, args) { calls.push({command, args}); return {killed: false, on() {}, kill() {}}; },
      });
      const web = mode === 'web' || mode === 'server';
      assert.equal(preflights.length, web && !skip ? 1 : 0);
      assert.equal(calls.length, 1);
      assert.equal(calls[0].command, web ? 'node' : 'npm');
      assert.deepEqual(Array.from(calls[0].args), web ? ['server.js'] : ['run', mode === 'telegram-rabbi' ? 'telegram:rabbi' : 'telegram:kimi']);
      if (preflights.length) assert.deepEqual(Array.from(preflights[0].args), ['scripts/ensure-content-job-compatibility.mjs']);
    });
  }
}
