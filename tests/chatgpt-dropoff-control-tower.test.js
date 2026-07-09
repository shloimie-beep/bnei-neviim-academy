const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

async function loadTower() {
  return import(pathToFileURL(path.join(process.cwd(), 'scripts', 'chatgpt-dropoff-control-tower.mjs')).href);
}

test('ChatGPT dropoff control tower package script and docs are wired', async () => {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const agents = fs.readFileSync('AGENTS.md', 'utf8');
  const startHere = fs.readFileSync('BNA-START-HERE.md', 'utf8');
  const quickstart = fs.readFileSync('ops/chatgpt-ramble-dropoff/CHATGPT-START-HERE.md', 'utf8');
  const tower = await loadTower();

  assert.equal(packageJson.scripts['chatgpt:dropoff:tower'], 'node scripts/chatgpt-dropoff-control-tower.mjs --write');
  assert.equal(packageJson.scripts['chatgpt:dropoff:tower:json'], 'node scripts/chatgpt-dropoff-control-tower.mjs --json');
  assert.match(agents, /npm run chatgpt:dropoff:tower/);
  assert.match(startHere, /CHATGPT-START-HERE\.md/);
  assert.match(quickstart, /One ChatGPT window owns one packet lane/);
  assert.match(fs.readFileSync('scripts/chatgpt-dropoff-control-tower.mjs', 'utf8'), /controlTowerGeneratedPaths/);
  assert.equal(typeof tower.buildReport, 'function');
  assert.equal(tower.classifyPacket({ status: { status: 'done_verified' }, packet: {} }, { findings: [], ready: false }), 'terminal');
  const enriched = tower.enrichAgentJobLine('- job #999 / task #999999 [running] Example stale lane');
  assert.match(enriched, /local_lock=/);
  assert.match(enriched, /task-999999\.lock\.json/);
  assert.deepEqual(
    tower.collectStatusSectionLines(
      [
        'Fallback task candidates requiring lane inspection:',
        '- #1736 [in_progress] Repair Agent Mode result (matching observable job #344 [running])',
        'Recent Pickup Reports',
      ],
      /^Fallback task candidates requiring lane inspection:/,
      /^- #\d+ /
    ),
    ['- #1736 [in_progress] Repair Agent Mode result (matching observable job #344 [running])'],
  );
  const markdown = tower.markdown({
    generated_at: '2026-07-09T00:00:00.000Z',
    git: { branch: 'master', dirty: false, dirty_files: [] },
    packets: { count: 0, counts: {}, items: [] },
    agent_fleet: {
      checked: true,
      summary: [],
      not_claimable: [],
      fallback_candidates: ['- #1736 [in_progress] Repair Agent Mode result (matching observable job #344 [running])'],
    },
    latest_pickup_reports: [],
    recommendations: [],
  });
  assert.match(markdown, /Fallback Task Candidates/);
  assert.match(markdown, /matching observable job #344/);
});

test('ChatGPT dropoff templates include lane ownership and local-state warnings', () => {
  const packet = JSON.parse(fs.readFileSync('ops/chatgpt-ramble-dropoff/templates/packet.json', 'utf8'));
  const status = JSON.parse(fs.readFileSync('ops/chatgpt-ramble-dropoff/templates/status.json', 'utf8'));
  const manifest = JSON.parse(fs.readFileSync('ops/chatgpt-ramble-dropoff/templates/MANIFEST.json', 'utf8'));
  const codexPrompt = fs.readFileSync('ops/chatgpt-ramble-dropoff/templates/CODEX_PROMPT.md', 'utf8');

  assert.equal(packet.packet_type, 'implementation_bundle');
  assert.equal(packet.owner, 'ChatGPT');
  assert.equal(packet.external_writes_performed, false);
  assert.match(packet.local_state_warning, /committed\/pushed GitHub state/);
  assert.equal(status.owner, 'ChatGPT');
  assert.equal(status.agent_mode_audit_ready, false);
  assert.equal(manifest.lane_key, 'workspace-project-short-lane');
  assert.match(codexPrompt, /Packet Lane/);
});
