const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const repoRoot = path.resolve('.');
const scriptPath = path.join(repoRoot, 'scripts', 'inventory-download-spreadsheets.mjs');

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

test('Downloads spreadsheet inventory writes redacted metadata only', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'downloads-inventory-'));
  const downloadsDir = path.join(tempRoot, 'Downloads');
  writeFile(
    path.join(downloadsDir, 'Rabbi Scheller Followers.csv'),
    [
      'Email,First Name,Last Name,Phone,Source',
      'private.parent@example.com,Private,Parent,+15555550123,One Time',
      'second.parent@example.com,Second,Parent,+15555550124,One Time',
    ].join('\n')
  );
  writeFile(
    path.join(downloadsDir, 'opportunities.csv'),
    [
      'Contact Name,Email,Phone,Pipeline,Stage,Value',
      'Pipeline Person,pipeline@example.com,+15555550125,Trial,Warm,67',
    ].join('\n')
  );

  const result = spawnSync(process.execPath, [scriptPath, downloadsDir], {
    cwd: tempRoot,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const jsonPath = path.join(tempRoot, 'ops', 'one-time-mishnah', 'downloads-spreadsheet-inventory.json');
  const mdPath = path.join(tempRoot, 'ops', 'one-time-mishnah', 'downloads-spreadsheet-inventory.md');
  assert.equal(fs.existsSync(jsonPath), true);
  assert.equal(fs.existsSync(mdPath), true);

  const report = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const markdown = fs.readFileSync(mdPath, 'utf8');
  assert.equal(report.summary.total_files, 2);
  assert.equal(report.items.some((item) => item.classification === 'one_time_rabbi_scheller_followers'), true);
  assert.equal(report.items.some((item) => item.classification === 'legacy_crm_or_pipeline_export'), true);
  assert.equal(report.items.every((item) => item.sha256 && item.header_fingerprint), true);
  assert.equal(report.items.every((item) => !Object.hasOwn(item, 'headers')), true);

  const serialized = JSON.stringify(report) + markdown;
  assert.doesNotMatch(serialized, /private\.parent@example\.com/i);
  assert.doesNotMatch(serialized, /\+15555550123/);
  assert.doesNotMatch(serialized, /Pipeline Person/);
  assert.match(markdown, /No GHL runtime/i);
});
