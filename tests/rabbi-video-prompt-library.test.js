const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '..');
const libraryPath = path.join(
  repoRoot,
  'content-memory',
  'prompt-patches',
  'rabbi-video-content',
  'library.json',
);
const readmePath = path.join(
  repoRoot,
  'content-memory',
  'prompt-patches',
  'rabbi-video-content',
  'README.md',
);
const basePromptPath = path.join(
  repoRoot,
  'content-memory',
  'prompt-patches',
  'rabbi-video-content',
  'base-video-generation-prompt.md',
);

function loadLibrary() {
  return JSON.parse(fs.readFileSync(libraryPath, 'utf8'));
}

test('Rabbi video prompt patch library is structured and complete', () => {
  const library = loadLibrary();
  assert.equal(library.library_id, 'rabbi-video-content');
  assert.equal(library.owner_project, 'One Time Mishnah Class');
  assert.equal(library.primary_person, 'Rabbi Elie Scheller');
  assert.ok(Array.isArray(library.patches));
  assert.ok(Array.isArray(library.stacks));
  assert.ok(library.patches.length >= 10);

  const patchIds = new Set();
  for (const patch of library.patches) {
    assert.ok(patch.id, 'patch id is required');
    assert.ok(!patchIds.has(patch.id), `duplicate patch id: ${patch.id}`);
    patchIds.add(patch.id);
    assert.ok(patch.category, `patch category missing: ${patch.id}`);
    assert.ok(Array.isArray(patch.prompt_lines), `prompt_lines missing: ${patch.id}`);
    assert.ok(patch.prompt_lines.length > 0, `prompt_lines empty: ${patch.id}`);
  }

  for (const category of library.required_patch_categories) {
    assert.ok(library.patches.some((patch) => patch.category === category), `missing category: ${category}`);
  }

  for (const stack of library.stacks) {
    assert.ok(stack.id, 'stack id is required');
    assert.ok(Array.isArray(stack.patch_ids), `stack patches missing: ${stack.id}`);
    assert.ok(stack.patch_ids.length >= 5, `stack too thin: ${stack.id}`);
    for (const patchId of stack.patch_ids) {
      assert.ok(patchIds.has(patchId), `stack ${stack.id} references missing patch ${patchId}`);
    }
  }
});

test('Rabbi video library covers camera angles, ratios, and Jewish thematic elements', () => {
  const text = fs.readFileSync(libraryPath, 'utf8');

  assert.match(text, /9:16/);
  assert.match(text, /1080x1920/);
  assert.match(text, /16:9/);
  assert.match(text, /1920x1080/);
  assert.match(text, /over-the-shoulder/);
  assert.match(text, /close-up/);
  assert.match(text, /slow push-in/);
  assert.match(text, /Mishnayos/);
  assert.match(text, /sefarim/);
  assert.match(text, /chavrusa/);
  assert.match(text, /source sheet/);
  assert.match(text, /worksheet/);
});

test('Rabbi video composer outputs a usable patched prompt', () => {
  const output = execFileSync(
    process.execPath,
    [
      path.join(repoRoot, 'scripts', 'rabbi-video-prompt-library.mjs'),
      '--stack',
      'one-time-vertical-short',
      '--topic',
      'Why review makes Mishnayos stick',
      '--audience',
      'parents and boys',
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );

  assert.match(output, /One Time Mishnah Class/);
  assert.match(output, /Rabbi Elie Scheller/);
  assert.match(output, /Why review makes Mishnayos stick/);
  assert.match(output, /9:16 vertical video at 1080x1920/);
  assert.match(output, /over-the-shoulder angle/);
  assert.match(output, /sefarim/);
  assert.match(output, /Negative prompt \/ avoid:/);
  assert.match(output, /No private BNA student names/);
});

test('Rabbi video docs point future agents to the patch workflow', () => {
  const readme = fs.readFileSync(readmePath, 'utf8');
  const basePrompt = fs.readFileSync(basePromptPath, 'utf8');

  assert.match(readme, /Default Patch Order/);
  assert.match(readme, /one-time-vertical-short/);
  assert.match(readme, /node scripts\/rabbi-video-prompt-library\.mjs/);
  assert.match(readme, /Operator Correction Workflow/);
  assert.match(basePrompt, /Base Rabbi Video Generation Prompt/);
  assert.match(basePrompt, /shot list/);
  assert.match(basePrompt, /review flags/i);
});
