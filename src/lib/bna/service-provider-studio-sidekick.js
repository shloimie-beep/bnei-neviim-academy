'use strict';

const studio = require('./service-provider-studio');
const openArt = require('./studio-openart-mcp-adapter');
const studioPolicy = require('./one-time-studio-sidekick-policy');

function compactLines(lines = []) {
  return lines.map((line) => studio.safeText(line)).filter(Boolean);
}

function normalizedCorrectionText({ correction_text = '', image_observation = '', image_reference = '', target = '' } = {}) {
  return compactLines([
    correction_text,
    image_observation ? `Image/render observation: ${image_observation}` : '',
    image_reference ? `Reference note: ${image_reference}` : '',
    target ? `Target: ${target}` : '',
  ]).join('\n');
}

function visualGuidanceFromText(text = '') {
  const normalized = String(text || '').toLowerCase();
  const guidance = [];

  if (/\bhat|clothing|robe|beard|face|hair|glasses|expression|pose\b/.test(normalized)) {
    guidance.push({
      target_layer: 'character_bible',
      instruction: 'Update the saved character description and continuity notes before rendering more scenes.',
    });
  }
  if (/\brealistic|photoreal|cartoon|illustration|style|lighting|cinematic|camera|background|color|texture\b/.test(normalized)) {
    guidance.push({
      target_layer: 'visual_style',
      instruction: 'Add explicit visual style, realism level, camera, lighting, background, and texture constraints.',
    });
  }
  if (/\bconsistent|same\s+(?:person|character|face)|reference|continuity|looks?\s+different\b/.test(normalized)) {
    guidance.push({
      target_layer: 'character_bible',
      instruction: 'Use the same named character profile and reference checklist across scenes.',
    });
  }
  if (/\bnot\s+(?:jewish|frum|torah|mishnah)|anachron|inaccurate|inappropriate|modest|respectful\b/.test(normalized)) {
    guidance.push({
      target_layer: 'jewish_guardrails',
      instruction: 'Add a guardrail that keeps the image Torah-grounded, respectful, and historically appropriate.',
    });
  }
  if (/\bscene|storyboard|narration|voiceover|duration|transition\b/.test(normalized)) {
    guidance.push({
      target_layer: 'scene_instruction',
      instruction: 'Revise the scene-level instruction instead of changing the whole project style.',
    });
  }

  if (!guidance.length) {
    guidance.push({
      target_layer: 'correction_patch',
      instruction: 'Save this as a reversible correction patch and inspect the compiled prompt before render.',
    });
  }

  return guidance;
}

function sceneReference(scene = null) {
  if (!scene) return null;
  return {
    id: scene.id || null,
    scene_key: scene.scene_key || null,
    position: scene.position || null,
    title: scene.title || null,
    visual_prompt: scene.visual_prompt || null,
  };
}

function draftStudioSidekickPatch({ project = {}, scene = null, correction_text = '', image_observation = '', image_reference = '', target = '', scope = '' } = {}) {
  const correction = normalizedCorrectionText({
    correction_text,
    image_observation,
    image_reference,
    target,
  });
  const targetScope = scope || (scene ? 'scene' : 'project');
  const patch = studio.previewCorrectionPatch({
    correction,
    scope: targetScope,
    scene,
    project,
  });
  const guidance = visualGuidanceFromText(correction);

  return {
    requirement_id: 'REQ-20260706-204',
    provider: 'studio_sidekick',
    mode: 'prompt_patch_preview',
    no_live_model: true,
    no_external_writes: true,
    external_write_performed: false,
    project: {
      id: project.id || null,
      workspace_key: project.workspace_key || 'rabbi_sheller_provider',
      project_key: project.project_key || 'one_time_mishnah_class',
      title: project.title || null,
    },
    scene: sceneReference(scene),
    patch: {
      ...patch,
      operations: [
        ...(patch.operations || []),
        ...guidance.map((item) => ({
          op: 'add_instruction',
          target: item.target_layer,
          instruction: item.instruction,
          source: 'studio_sidekick_visual_guidance',
        })),
      ],
      affected_layers: [...new Set([...(patch.affected_layers || []), ...guidance.map((item) => item.target_layer)])],
    },
    visual_critique: {
      image_observation: studio.safeText(image_observation),
      image_reference: studio.safeText(image_reference),
      guidance,
    },
    next_actions: [
      'Review the patch preview.',
      'Apply it only if the affected layers are correct.',
      'Compile the prompt and copy the OpenArt-ready export when OAuth is connected.',
    ],
  };
}

function characterReferenceChecklist(characterBible = []) {
  const characters = Array.isArray(characterBible) ? characterBible : [];
  return characters.map((character, index) => ({
    key: studio.safeText(character.key || character.name, `character_${index + 1}`),
    name: studio.safeText(character.name || character.key, `Character ${index + 1}`),
    continuity_notes: compactLines([
      character.description,
      character.visual_prompt,
      character.continuity_notes,
      Array.isArray(character.scenario_tags) ? `Scenario tags: ${character.scenario_tags.join(', ')}` : character.scenario_tags,
    ]).join(' '),
  }));
}

function buildOpenArtPromptExport({ project = {}, compiled_prompt = {}, sidekick_patch = null, character_bible = [], guardrails = [], scene = null, references = [], env = process.env } = {}) {
  const compiledText = studio.safeText(compiled_prompt.compiled_prompt || compiled_prompt.prompt || compiled_prompt);
  const patch = sidekick_patch?.patch || sidekick_patch || null;
  const sceneLabel = scene ? `Scene ${scene.position || ''}: ${scene.title || scene.scene_key || 'Scene'}`.trim() : 'Project prompt';
  const characterChecklist = characterReferenceChecklist(character_bible);
  const guardrailLines = (Array.isArray(guardrails) ? guardrails : [])
    .map((guardrail) => studio.safeText(guardrail.label || guardrail.title || guardrail.rule || guardrail))
    .filter(Boolean);
  const openArtStatus = openArt.openArtMcpStatus(env);
  const copyText = compactLines([
    `OpenArt target: ${sceneLabel}`,
    project.title ? `Studio project: ${project.title}` : '',
    'Use saved reference images when available. Keep the same named character profile across all generated assets.',
    characterChecklist.length ? `Character continuity: ${characterChecklist.map((item) => `${item.name}: ${item.continuity_notes}`).join(' | ')}` : '',
    guardrailLines.length ? `Guardrails: ${guardrailLines.join(' | ')}` : '',
    patch?.correction ? `Applied/previewed correction: ${patch.correction}` : '',
    compiledText,
  ]).join('\n\n');

  const promptExport = {
    requirement_id: 'REQ-20260706-203',
    provider: 'openart',
    mode: 'copy_ready_prompt_export',
    copy_text: copyText,
    prompt_hash: studio.sha256(copyText),
    character_reference_checklist: characterChecklist,
    guardrail_checklist: guardrailLines,
    source_compiled_hash: compiled_prompt.compiled_hash || null,
    openart_status: openArtStatus,
    no_live_call: true,
    external_write_performed: false,
  };

  return {
    ...promptExport,
    mcp_request_plan: openArt.buildOpenArtMcpRequestPlan({
      project,
      prompt_export: promptExport,
      references,
      env,
    }),
  };
}

function planStudioRepairRequest(scope = {}, request = {}) {
  return studioPolicy.planOneTimeStudioRepairRequest(scope, {
    action: studioPolicy.STUDIO_REPAIR_ACTION,
    ...request,
  });
}

module.exports = {
  compactLines,
  normalizedCorrectionText,
  visualGuidanceFromText,
  draftStudioSidekickPatch,
  characterReferenceChecklist,
  buildOpenArtPromptExport,
  planStudioRepairRequest,
};
