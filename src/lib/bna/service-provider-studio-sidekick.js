'use strict';

const studio = require('./service-provider-studio');
const openArt = require('./studio-openart-mcp-adapter');
const studioPolicy = require('./one-time-studio-sidekick-policy');

function envNumber(env = {}, key = '', fallback = 0) {
  const value = Number(env[key]);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function envInteger(env = {}, key = '', fallback = 0) {
  return Math.floor(envNumber(env, key, fallback));
}

function provisionalAiVideoPolicy(env = process.env) {
  return {
    requirement_id: 'REQ-20260706-941',
    policy_version: studio.safeText(env.ONE_TIME_AI_VIDEO_POLICY_VERSION, '2026-07-06-provisional-no-live'),
    status: 'provisional_no_live',
    model_provider: studio.safeText(env.ONE_TIME_AI_VIDEO_MODEL_PROVIDER, 'openart_mcp_pending_oauth'),
    model: studio.safeText(env.ONE_TIME_AI_VIDEO_MODEL, 'openart-video-provisional-manual-export-v1'),
    budget: {
      currency: 'USD',
      monthly_cap_usd: envNumber(env, 'ONE_TIME_AI_VIDEO_MONTHLY_BUDGET_USD', 25),
      per_render_cap_usd: envNumber(env, 'ONE_TIME_AI_VIDEO_PER_RENDER_CAP_USD', 2),
      max_render_attempts_per_month: envInteger(env, 'ONE_TIME_AI_VIDEO_MAX_RENDERS_PER_MONTH', 10),
      live_spend_enabled: false,
    },
    privacy_retention: {
      source_material: 'Use only One Time Studio source records scoped to rabbi_sheller_provider / one_time_mishnah_class.',
      private_media: 'Do not upload students, private family material, raw messages, or staff-only notes to an external model.',
      reference_uploads: 'Blocked until approved vendor credentials, reference ownership, retention terms, and rollback path are recorded.',
      generated_assets: 'Treat generated images/video as review drafts until rights, source fidelity, Jewish guardrails, and Rabbi/admin approval are recorded.',
    },
    worker_can: [
      'Review source, storyboard, prompt pack, character continuity, and Jewish guardrails.',
      'Prepare no-live OpenArt-ready prompt text and MCP request plans.',
      'Record Studio sidekick prompt-patch requests for render defects or source-fidelity issues.',
    ],
    worker_cannot: [
      'Run live generation, upload references, spend credits, publish, send, grant access, or mutate vendor workspaces.',
      'Use private student/family/contact/payment data as model input.',
      'Raise the provisional budget or switch model/provider without a new recorded approval.',
    ],
    approval_gates: [
      'OpenArt or replacement vendor credentials are configured and read back without exposing secrets.',
      'Actual model, pricing, monthly cap, per-render cap, and kill/stop rules replace the provisional placeholders.',
      'Reference upload policy, privacy/retention terms, and rollback/delete path are approved.',
      'One supervised no-live readiness smoke passes before any credit-consuming render.',
    ],
    no_live_call: true,
    external_write_performed: false,
  };
}

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

function sourceSummary(source = {}) {
  const text = studio.safeText(source.normalized_text || source.normalized_text_preview || source.raw_text || source.raw_text_preview || source.title);
  return {
    title: studio.safeText(source.title, 'Studio source'),
    source_type: studio.safeText(source.source_type, 'manual'),
    source_hash: source.source_hash || (text ? studio.sha256(text) : null),
    word_count: source.word_count || (text ? text.split(/\s+/).filter(Boolean).length : 0),
    excerpt: text.slice(0, 700),
  };
}

function buildAiVideoWorkerPromptPack({ project = {}, source = {}, scenes = [], compiled_prompts = [], character_bible = [], guardrails = [], sidekick_patch = null, references = [], env = process.env } = {}) {
  const aiVideoPolicy = provisionalAiVideoPolicy(env);
  const normalizedScenes = (Array.isArray(scenes) ? scenes : []).map(studio.normalizeStudioScene);
  const compiledList = Array.isArray(compiled_prompts) ? compiled_prompts : [compiled_prompts].filter(Boolean);
  const scenePrompts = normalizedScenes.map((scene, index) => {
    const compiled = compiledList[index] || compiledList[0] || studio.compileStudioPrompt({
      project,
      source,
      character_bible,
      guardrails,
      scene,
      correction_patches: sidekick_patch ? [sidekick_patch] : [],
    });
    const openArtExport = buildOpenArtPromptExport({
      project,
      compiled_prompt: compiled,
      sidekick_patch,
      character_bible,
      guardrails,
      scene,
      references,
      env,
    });
    return {
      scene_key: scene.scene_key,
      position: scene.position,
      title: scene.title,
      duration_seconds: scene.duration_seconds,
      narration: scene.narration,
      visual_prompt: scene.visual_prompt,
      compiled_hash: compiled.compiled_hash || null,
      openart_prompt_hash: openArtExport.prompt_hash,
      copy_text: openArtExport.copy_text,
      character_reference_checklist: openArtExport.character_reference_checklist,
      guardrail_checklist: openArtExport.guardrail_checklist,
      mcp_request_plan: openArtExport.mcp_request_plan,
    };
  });
  const sourceInfo = sourceSummary(source);
  const packHash = studio.sha256(JSON.stringify({
    project_key: project.project_key,
    source_hash: sourceInfo.source_hash,
    scenes: scenePrompts.map((scene) => [scene.scene_key, scene.compiled_hash, scene.openart_prompt_hash]),
  }));

  return {
    requirement_id: 'REQ-20260702-967',
    pack_type: 'ai_video_worker_prompt_pack',
    pack_id: studio.stableId('ai_video_prompt_pack', [project.project_key, sourceInfo.source_hash, packHash]),
    pack_hash: packHash,
    worker_role: 'one_time_ai_video_worker',
    ai_video_policy: aiVideoPolicy,
    source: sourceInfo,
    scene_count: scenePrompts.length,
    scene_prompts: scenePrompts,
    review_contract: [
      'Review each scene prompt against the source, character continuity, Jewish guardrails, and visual realism notes.',
      'Record requested changes as Studio prompt patches before any external generation.',
      `Use provisional model ${aiVideoPolicy.model} only as no-live planning metadata; live render, upload, and spend remain disabled.`,
      `Keep the provisional monthly cap at ${aiVideoPolicy.budget.currency} ${aiVideoPolicy.budget.monthly_cap_usd} and per-render cap at ${aiVideoPolicy.budget.currency} ${aiVideoPolicy.budget.per_render_cap_usd} until real vendor pricing is approved.`,
    ],
    no_live_call: true,
    external_write_performed: false,
  };
}

function buildAiVideoWorkerReviewHandoff({ project = {}, source = {}, scenes = [], prompt_pack = {}, assets = [], usage = {}, approved_by = '', env = process.env } = {}) {
  const aiVideoPolicy = provisionalAiVideoPolicy(env);
  const normalizedScenes = (Array.isArray(scenes) ? scenes : []).map(studio.normalizeStudioScene);
  const sourceInfo = sourceSummary(source);
  const openArtStatus = openArt.openArtMcpStatus(env);
  const idempotencyKey = studio.stableId('ai_video_worker_handoff', [
    project.workspace_key,
    project.project_key,
    project.id,
    sourceInfo.source_hash,
    prompt_pack.pack_hash,
    normalizedScenes.map((scene) => `${scene.scene_key}:${scene.version}`).join(','),
  ]);

  return {
    requirement_id: 'REQ-20260702-967',
    handoff_type: 'ai_video_worker_review',
    status: 'ready_for_worker_review',
    idempotency_key: idempotencyKey,
    worker_role: 'one_time_ai_video_worker',
    scope: {
      workspace_key: project.workspace_key || 'rabbi_sheller_provider',
      project_key: project.project_key || 'one_time_mishnah_class',
      studio_project_id: project.id || null,
      title: project.title || null,
    },
    source: sourceInfo,
    storyboard: {
      scene_count: normalizedScenes.length,
      scenes: normalizedScenes.map((scene) => ({
        scene_key: scene.scene_key,
        position: scene.position,
        title: scene.title,
        duration_seconds: scene.duration_seconds,
        version: scene.version,
        status: scene.status,
      })),
    },
    prompt_pack,
    ai_video_policy: aiVideoPolicy,
    assets: (Array.isArray(assets) ? assets : []).map((asset) => ({
      asset_key: asset.asset_key || null,
      scene_key: asset.scene_key || null,
      asset_type: asset.asset_type || null,
      rights_status: asset.rights_status || 'review_required',
      privacy_status: asset.privacy_status || 'review_required',
      url: asset.url || null,
    })),
    usage,
    review_steps: [
      'Open the prompt pack and review scene order, narration, and visual prompt intent.',
      'Check character continuity against the saved character bible and any reference notes.',
      'Check Jewish guardrails and source fidelity before external generation.',
      'Draft Studio sidekick patch requests for every render defect or prompt issue.',
      'Do not publish, send, upload references, spend credits, or grant member access from this handoff.',
    ],
    vendor_blockers: [
      openArtStatus.connected ? 'OpenArt OAuth is connected but live generation still needs supervised no-live readiness smoke.' : openArtStatus.next_action,
      'Provisional model and budget are placeholders only; real vendor model, pricing, and stop/kill rules must replace them before spend.',
      'Hosted multimodal image-analysis and pixel review remain blocked until real model credentials, retention/privacy terms, and upload policy are approved.',
      'Reference upload, generation, credit spend, and result pull remain blocked until explicit vendor approval and smoke evidence.',
    ],
    openart_status: openArtStatus,
    no_publish: true,
    no_send: true,
    no_upload: true,
    no_live_call: true,
    external_write_performed: false,
    approved_by: approved_by || null,
  };
}

function planStudioRepairRequest(scope = {}, request = {}) {
  return studioPolicy.planOneTimeStudioRepairRequest(scope, {
    action: studioPolicy.STUDIO_REPAIR_ACTION,
    ...request,
  });
}

module.exports = {
  provisionalAiVideoPolicy,
  compactLines,
  normalizedCorrectionText,
  visualGuidanceFromText,
  draftStudioSidekickPatch,
  characterReferenceChecklist,
  buildOpenArtPromptExport,
  buildAiVideoWorkerPromptPack,
  buildAiVideoWorkerReviewHandoff,
  planStudioRepairRequest,
};
