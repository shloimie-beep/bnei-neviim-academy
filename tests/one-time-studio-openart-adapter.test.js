'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const studio = require('../src/lib/bna/service-provider-studio');
const sidekick = require('../src/lib/bna/service-provider-studio-sidekick');
const openArt = require('../src/lib/bna/studio-openart-mcp-adapter');

test('OpenArt MCP status is blocked and no-live until OAuth is connected', () => {
  const status = openArt.openArtMcpStatus({});

  assert.equal(status.provider, 'openart');
  assert.equal(status.connected, false);
  assert.equal(status.status, 'blocked_no_oauth');
  assert.equal(status.no_live_call, true);
  assert.equal(status.external_write_performed, false);
  assert.match(status.next_action, /Shloimie must sign up/);
});

test('OpenArt MCP request plan prepares generation intents without making a live call', () => {
  const plan = openArt.buildOpenArtMcpRequestPlan({
    env: {},
    project: {
      id: 44,
      title: 'One Time prompt test',
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
    },
    prompt_export: {
      copy_text: 'A consistent Mishnah teacher character in a beis midrash.',
    },
    references: ['Rabbi reference image'],
  });

  assert.equal(plan.connected, false);
  assert.equal(plan.requires_oauth, true);
  assert.equal(plan.no_live_call, true);
  assert.equal(plan.external_write_performed, false);
  assert.equal(plan.references.length, 1);
  assert.ok(plan.prepared_actions.some((action) => action.intent === 'generate_image_or_video_from_prompt'));
});

test('Studio sidekick turns image/render feedback into reversible prompt patch guidance', () => {
  const patch = sidekick.draftStudioSidekickPatch({
    project: {
      id: 77,
      title: 'One Time character continuity',
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
    },
    scene: {
      id: 12,
      scene_key: 'scene_1',
      position: 1,
      title: 'Opening chazara',
      visual_prompt: 'Warm beis midrash teacher scene',
    },
    correction_text: 'This guy needs a better hat and should look like the same rabbi.',
    image_observation: 'The render is not realistic and the face changed.',
    image_reference: 'Use the saved Rabbi reference.',
  });

  assert.equal(patch.no_live_model, true);
  assert.equal(patch.no_external_writes, true);
  assert.equal(patch.patch.status, 'preview');
  assert.equal(patch.patch.reversible, true);
  assert.ok(patch.patch.affected_layers.includes('character_bible'));
  assert.ok(patch.patch.affected_layers.includes('visual_style'));
  assert.ok(patch.visual_critique.guidance.some((item) => item.target_layer === 'character_bible'));
});

test('OpenArt prompt export includes character continuity and no-live MCP plan', () => {
  const compiled = studio.compileStudioPrompt({
    project: {
      title: 'OpenArt export',
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
    },
    source: studio.normalizeStudioSourceInput({
      title: 'Source',
      raw_text: 'A clear Mishnah review begins with one precise idea.',
    }),
    character_bible: [{
      key: 'rabbi_elie',
      name: 'Rabbi Elie',
      description: 'Warm Mishnah teacher.',
      visual_prompt: 'Same face, same black hat, same suit.',
    }],
    guardrails: [{ label: 'Respectful visuals', rule: 'No anachronistic or disrespectful scenes.' }],
  });

  const exportPlan = sidekick.buildOpenArtPromptExport({
    env: {},
    project: {
      id: 88,
      title: 'One Time OpenArt export',
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
    },
    compiled_prompt: compiled,
    character_bible: [{
      key: 'rabbi_elie',
      name: 'Rabbi Elie',
      description: 'Warm Mishnah teacher.',
      visual_prompt: 'Same face, same black hat, same suit.',
    }],
    guardrails: [{ label: 'Respectful visuals', rule: 'No anachronistic or disrespectful scenes.' }],
  });

  assert.equal(exportPlan.provider, 'openart');
  assert.equal(exportPlan.no_live_call, true);
  assert.equal(exportPlan.external_write_performed, false);
  assert.equal(exportPlan.openart_status.status, 'blocked_no_oauth');
  assert.match(exportPlan.copy_text, /Character continuity/);
  assert.match(exportPlan.copy_text, /Rabbi Elie/);
  assert.equal(exportPlan.mcp_request_plan.requires_oauth, true);
});
