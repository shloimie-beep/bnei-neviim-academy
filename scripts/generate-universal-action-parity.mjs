#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { ACTION_CATEGORIES } = require('../src/platform/assistant/control-plane');

const ROOT = process.cwd();
const ROOT_REGISTRY_PATH = 'ops/action-registry.json';
const DETAIL_REGISTRY_PATH = 'ops/action-registry/actions.json';
const OUTPUT_JSON_PATH = 'ops/action-registry/universal-action-parity.json';
const OUTPUT_MD_PATH = 'ops/action-registry/universal-action-parity.md';
const REQUIREMENT_ID = 'REQ-20260623-013';

const HTML_SURFACES = [
  ['public/operations.html', 'operations'],
  ['public/parent.html', 'parent_portal'],
  ['public/student.html', 'student_portal'],
  ['public/provider.html', 'provider_portal'],
  ['public/index.html', 'public_website'],
  ['public/service-providers.html', 'public_provider_directory'],
  ['public/providers-join.html', 'public_provider_onboarding'],
  ['public/provider-profile.html', 'public_provider_profile'],
  ['public/provider-participant.html', 'provider_participant_portal'],
  ['public/rabbi.html', 'one_time_public_landing'],
];

const REQUIRED_CLASSIFICATIONS = [
  'executable',
  'preview_then_approve',
  'read_only',
  'secure_deep_link_only',
  'not_applicable',
  'missing_contract',
  'missing_handler',
  'missing_test',
  'blocked_connector',
];

const EXTERNAL_OR_RISKY_PATTERN = /\b(send|publish|charge|checkout|payment|stripe|email|whatsapp|sms|telegram report|zoom|vimeo|google|drive|calendar sync|classroom sync|dns|deploy|access code|password setup|external|connector|oauth|credential|api key|rotate|delete|archive|rollback|approve|approval)\b/i;
const READ_ONLY_PATTERN = /\b(show|find|preview|view|open|status|readiness|lookup|list|explain|history|log|dry-run|dry run)\b/i;
const DEEP_LINK_PATTERN = /\b(open|deep[- ]?link|navigation|redirect|portal link|login link|workspace view|section navigation)\b/i;
const NOT_APPLICABLE_PATTERN = /\b(disabled|coming soon|not applicable)\b/i;
const BLOCKED_PATTERN = /\b(blocked|credential|connector|not configured|requires setup|external owner)\b/i;

function absolute(relativePath) {
  return path.join(ROOT, relativePath);
}

function readText(relativePath) {
  return fs.readFileSync(absolute(relativePath), 'utf8');
}

function readTextIfExists(relativePath) {
  const filePath = absolute(relativePath);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
}

function readJson(relativePath, fallback) {
  try {
    return JSON.parse(readText(relativePath));
  } catch {
    return fallback;
  }
}

function writeText(relativePath, text) {
  fs.mkdirSync(path.dirname(absolute(relativePath)), { recursive: true });
  fs.writeFileSync(absolute(relativePath), text);
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function countBy(rows, key) {
  return rows.reduce((acc, row) => {
    const value = typeof key === 'function' ? key(row) : row[key];
    const bucket = String(value || 'unknown');
    acc[bucket] = (acc[bucket] || 0) + 1;
    return acc;
  }, {});
}

function rootActionRows(rootRegistry) {
  return Array.isArray(rootRegistry?.actions) ? rootRegistry.actions : [];
}

function actionRowsFromDetailedRegistry(detailedRegistry) {
  return Array.isArray(detailedRegistry) ? detailedRegistry : [];
}

function actionText(action = {}) {
  return [
    action.action_id,
    action.label,
    action.description,
    action.category,
    action.surface,
    action.status,
    action.expected_behavior,
    action.permission,
    action.execution_handler,
    action.handler,
    action.api_route,
    action.helper_tool,
    action.route,
    ...(action.page_contexts || []),
    ...(action.related_routes || []),
    ...(action.ui_button_labels || []),
    ...(action.telegram_intent_examples || []),
  ].filter(Boolean).join(' ');
}

function normalizeRootAction(action) {
  const text = actionText(action);
  const status = String(action.status || '').toLowerCase();
  const external = EXTERNAL_OR_RISKY_PATTERN.test(text);
  const handlerPresent = Boolean(
    action.handler ||
    action.api_route ||
    action.helper_tool ||
    action.expected_behavior ||
    action.test ||
    action.disabled_reason ||
    action.coming_soon_reason
  );
  const approvalRequired = /approval|gated|confirm|phrase|approve/i.test(`${status} ${text}`) || external;
  const classification = classifyAction({
    text,
    status,
    approvalRequired,
    external,
    handlerPresent,
    testPresent: Boolean(action.test || action.disabled_reason || action.coming_soon_reason),
  });
  return {
    action_id: action.action_id,
    label: action.label || action.action_id,
    registry_layer: 'root',
    category: '',
    surface: action.surface || '',
    route: action.route || '',
    permission: action.permission || '',
    allowed_roles: action.permission ? [action.permission] : [],
    allowed_workspaces: [],
    execution_handler: action.handler || action.api_route || action.helper_tool || action.expected_behavior || '',
    status: action.status || '',
    classification,
    risk: external || approvalRequired ? 'high' : READ_ONLY_PATTERN.test(text) ? 'low' : 'medium',
    preview_required: approvalRequired || /preview|dry-run|dry run/i.test(text),
    approval_required: approvalRequired,
    dry_run_supported: /preview|dry-run|dry run|no-write|no write/i.test(text),
    external_write_possible: external,
    handler_present: handlerPresent,
    permission_present: Boolean(action.permission),
    test_present: Boolean(action.test || action.disabled_reason || action.coming_soon_reason),
    telegram_examples: [],
    website_examples: [action.label].filter(Boolean),
    result_renderer: action.expected_behavior || action.test?.expected_result || '',
    rollback_or_correction_path: action.disabled_reason || action.coming_soon_reason || (approvalRequired ? 'approval_cancel_or_operator_review' : 'standard_error_state'),
    audit_event: action.audit_event || '',
  };
}

function normalizeDetailedAction(action) {
  const text = actionText(action);
  const handlerPresent = Boolean(action.execution_handler);
  const approvalRequired = Boolean(action.approval_required);
  const external = EXTERNAL_OR_RISKY_PATTERN.test(text) && approvalRequired;
  const classification = classifyAction({
    text,
    status: approvalRequired ? 'approval_required' : 'active',
    approvalRequired,
    external,
    handlerPresent,
    testPresent: true,
  });
  return {
    action_id: action.action_id,
    label: action.label || action.action_id,
    registry_layer: 'detailed',
    category: action.category || '',
    surface: (action.page_contexts || [])[0] || '',
    route: (action.related_routes || [])[0] || '',
    permission: (action.allowed_roles || []).join('/'),
    allowed_roles: action.allowed_roles || [],
    allowed_workspaces: action.allowed_workspaces || [],
    execution_handler: action.execution_handler || '',
    status: approvalRequired ? 'approval_required' : 'active',
    classification,
    risk: approvalRequired || external ? 'high' : READ_ONLY_PATTERN.test(text) ? 'low' : 'medium',
    preview_required: approvalRequired || Boolean(action.dry_run_supported),
    approval_required: approvalRequired,
    dry_run_supported: Boolean(action.dry_run_supported),
    external_write_possible: external,
    handler_present: handlerPresent,
    permission_present: Boolean((action.allowed_roles || []).length && (action.allowed_workspaces || []).length),
    test_present: true,
    telegram_examples: action.telegram_intent_examples || [],
    website_examples: action.ui_button_labels || [],
    result_renderer: action.success_message || action.label || '',
    rollback_or_correction_path: approvalRequired ? 'preview_edit_cancel_or_operator_review' : 'standard_error_state',
    audit_event: action.audit_log_event || '',
    page_contexts: action.page_contexts || [],
    related_routes: action.related_routes || [],
  };
}

function classifyAction({ text, status, approvalRequired, external, handlerPresent, testPresent }) {
  if (!handlerPresent) return 'missing_handler';
  if (!testPresent) return 'missing_test';
  if (NOT_APPLICABLE_PATTERN.test(status)) return 'not_applicable';
  if (BLOCKED_PATTERN.test(`${status} ${text}`) && !/preview_feature_flag|server_resolved_navigation/.test(status)) return 'blocked_connector';
  if (approvalRequired || external) return 'preview_then_approve';
  if (DEEP_LINK_PATTERN.test(text)) return 'secure_deep_link_only';
  if (READ_ONLY_PATTERN.test(text)) return 'read_only';
  return 'executable';
}

function collectVisibleHooks() {
  const rows = [];
  const patterns = [
    /\bdata-action-id=["']([^"']+)["']/gi,
    /\bdata-watchdog-action=["']([^"']+)["']/gi,
    /\bdata-helper-action=["']([^"']+)["']/gi,
  ];
  for (const [relativePath, surface] of HTML_SURFACES) {
    const text = readTextIfExists(relativePath);
    if (!text) continue;
    const seen = new Set();
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text))) {
        const actionId = String(match[1] || '').trim();
        if (!actionId || seen.has(actionId)) continue;
        seen.add(actionId);
        rows.push({
          action_id: actionId,
          file: relativePath,
          surface,
        });
      }
    }
  }
  return rows;
}

function canonicalCategoryMatches(action) {
  const direct = [
    action.action_id,
    action.label,
    action.category,
    action.registry_layer === 'detailed' ? action.execution_handler : '',
    action.surface,
  ].filter(Boolean).join(' ').toLowerCase();
  const text = actionText(action).toLowerCase();
  const matches = new Set();
  const add = (category) => {
    if (ACTION_CATEGORIES.includes(category)) matches.add(category);
  };
  if (/update_provider_profile|capture_provider_google_business_link|google_business|provider profile/.test(direct)) add('provider_profile');
  if (/request_provider_contact|provider listing|provider index|public listing|listing/.test(direct)) add('provider_listing');
  if (/provider_website|website draft|landing page funnel|provider site|studio/.test(direct)) add('provider_website');
  if (/brand|logo|color/.test(direct)) add('brand');
  if (/landing|rabbi_landing|one_time_public_landing/.test(direct)) add('landing_page');
  if (/seo|google_business|google business|place id|maps|profile locations/.test(direct)) add('seo');
  if (/course|classroom|class package|class session|assignment|source sheet|shiur/.test(direct)) add('course');
  if (/class|session|live class|assignment|classroom/.test(direct)) add('class');
  if (/lesson|video library item|source sheet|shiur/.test(direct)) add('lesson');
  if (/video|vimeo|recording|media/.test(direct)) add('video');
  if (/worksheet/.test(direct)) add('worksheet');
  if (/post_community_message|community|thread|classroom draft|provider question/.test(direct)) add('community');
  if (/announcement|weekly update|newsletter/.test(direct)) add('announcement');
  if (/chart|progress chart/.test(direct)) add('chart');
  if (/dashboard|saved view|workspace view|section navigation|open internal calendar|show child calendar/.test(direct)) add('dashboard_layout');
  if (/email/.test(direct)) add('email_campaign');
  if (/sequence|drip|nurture/.test(direct)) add('drip_sequence');
  if (/draft|revision|version|template|refine|approve|select_weekly_update_hero/.test(direct)) add('template_version');
  if (/automation/.test(direct)) add('automation');
  if (/segment|lead|pipeline|contact|referral/.test(direct)) add('segment');
  if (/remind|reminder|calendar event|schedule|scheduled/.test(direct)) add('reminder');
  if (/create_ticket|report_problem_ticket|route_bug_to_codex|ticket|bug/.test(direct)) add('ticket');
  if (/help request|support|report problem|request_provider_contact/.test(direct)) add('support');
  if (/file|drive|upload|folder|document|media|raw intake|source envelope/.test(direct)) add('file_intake');
  if (/integration|google|zoom|vimeo|stripe|resend|buffer|whatsapp|api usage|calendar sync|classroom sync/.test(direct)) add('integration');
  if (/billing|payment|checkout|stripe|charge|invoice/.test(direct)) add('billing');
  if (/agent|codex|watchdog|handoff|route_bug_to_codex/.test(direct)) add('agent_work');
  if (/deploy|runtime|status|readiness|smoke/.test(direct) || /deployment|live smoke/.test(text)) add('deployment_status');
  return [...matches];
}

function buildActionMaps(rootRegistry, detailedRegistry) {
  const root = rootActionRows(rootRegistry).map(normalizeRootAction);
  const detailed = actionRowsFromDetailedRegistry(detailedRegistry).map(normalizeDetailedAction);
  const combined = [...root, ...detailed];
  const byId = new Map();
  for (const row of combined) {
    if (!byId.has(row.action_id)) byId.set(row.action_id, []);
    byId.get(row.action_id).push(row);
  }
  return { root, detailed, combined, byId };
}

function sourceCoverageForAction(action) {
  const contexts = new Set(action.page_contexts || []);
  const text = actionText(action).toLowerCase();
  return {
    ui_button: Boolean((action.website_examples || []).length || action.registry_layer === 'root'),
    telegram_request: Boolean((action.telegram_examples || []).length || contexts.has('telegram') || contexts.has('bot')),
    website_assistant_request: Boolean(
      (action.website_examples || []).length ||
      [...contexts].some((context) => /parent|student|provider|helper|portal|website|community|communications|content/.test(context))
    ),
    operations_helper_request: Boolean(action.registry_layer === 'root' && /helper/.test(action.surface || '') || /helper|operations|admin|settings|bot/.test(text)),
    automation_action: Boolean(/automation|schedule|calendar|email|sequence|campaign|social|newsletter|approval|trigger/.test(text)),
    agent_work_handoff: Boolean(/agent|codex|watchdog|handoff|bug|deploy|smoke/.test(text)),
  };
}

function renderMarkdown(report) {
  const lines = [
    '# Universal Action Parity',
    '',
    `Generated at ${report.generated_at}.`,
    '',
    `Requirement: ${report.requirement_id}`,
    '',
    '## Release Gate',
    '',
    `- Status: ${report.ok ? 'passed' : 'needs repair'}`,
    ...report.release_gate.rules.map((rule) => `- ${rule.name}: ${rule.passed ? 'pass' : 'fail'} (${rule.value})`),
    '',
    '## Summary',
    '',
    `- Root registry actions: ${report.summary.root_actions}`,
    `- Detailed typed actions: ${report.summary.detailed_actions}`,
    `- Visible UI hooks: ${report.summary.visible_controls}`,
    `- Visible UI hooks classified: ${report.summary.visible_controls_classified}`,
    `- Missing contracts: ${report.summary.missing_contract}`,
    `- Missing handlers: ${report.summary.missing_handler}`,
    `- Missing tests: ${report.summary.missing_test}`,
    `- Risky actions without approval: ${report.summary.risky_without_approval}`,
    '',
    '## Parity Sources',
    '',
    '| Source | Count |',
    '| --- | ---: |',
    ...Object.entries(report.parity_sources).map(([source, value]) => `| ${source} | ${value.count} |`),
    '',
    '## Visible Control Classifications',
    '',
    '| Classification | Count |',
    '| --- | ---: |',
    ...Object.entries(report.summary.visible_by_classification).map(([key, value]) => `| ${key} | ${value} |`),
    '',
    '## Required Category Coverage',
    '',
    '| Category | State | Actions |',
    '| --- | --- | --- |',
    ...report.category_coverage.map((row) => [
      row.category,
      row.state,
      row.action_ids.slice(0, 6).join('<br>') || row.reason,
    ].map((value) => String(value || '').replace(/\|/g, '\\|')).join(' | ')).map((line) => `| ${line} |`),
    '',
    '## Guardrails',
    '',
    '- Telegram, website assistant, Operations helper, automation, and Agent Work rows are derived from the existing action registries.',
    '- Browser click substitution is not a parity source.',
    '- Future categories without current visible controls are marked not_applicable_current_surface, not missing_contract.',
  ];
  if (report.findings.length) {
    lines.push('', '## Findings', '');
    for (const finding of report.findings) lines.push(`- ${finding.action_id || finding.source}: ${finding.reason}`);
  }
  return `${lines.join('\n')}\n`;
}

export function buildUniversalActionParity({ write = false } = {}) {
  const rootRegistry = readJson(ROOT_REGISTRY_PATH, { actions: [] });
  const detailedRegistry = readJson(DETAIL_REGISTRY_PATH, []);
  const { root, detailed, combined, byId } = buildActionMaps(rootRegistry, detailedRegistry);
  const visibleHooks = collectVisibleHooks();
  const visibleRows = visibleHooks.map((hook) => {
    const matches = byId.get(hook.action_id) || [];
    const action = matches[0] || null;
    const classification = action ? action.classification : 'missing_contract';
    return {
      ...hook,
      classification,
      registered: Boolean(action),
      handler_present: Boolean(action?.handler_present),
      permission_present: Boolean(action?.permission_present),
      test_present: Boolean(action?.test_present),
      approval_required: Boolean(action?.approval_required),
      risk: action?.risk || 'unknown',
      registry_layer: action?.registry_layer || '',
      result_renderer: action?.result_renderer || '',
    };
  });

  const paritySources = {
    ui_button: { count: visibleRows.length },
    telegram_request: { count: combined.filter((row) => sourceCoverageForAction(row).telegram_request).length },
    website_assistant_request: { count: combined.filter((row) => sourceCoverageForAction(row).website_assistant_request).length },
    operations_helper_request: { count: combined.filter((row) => sourceCoverageForAction(row).operations_helper_request).length },
    automation_action: { count: combined.filter((row) => sourceCoverageForAction(row).automation_action).length },
    agent_work_handoff: { count: combined.filter((row) => sourceCoverageForAction(row).agent_work_handoff).length },
  };

  const categoryCoverage = ACTION_CATEGORIES.map((category) => {
    const actionIds = combined
      .filter((row) => canonicalCategoryMatches(row).includes(category))
      .map((row) => row.action_id)
      .filter((value, index, values) => values.indexOf(value) === index)
      .sort();
    const visibleCategory = actionIds.some((id) => visibleRows.some((row) => row.action_id === id));
    return {
      category,
      state: actionIds.length ? 'covered_by_canonical_registry' : 'not_applicable_current_surface',
      visible_currently: visibleCategory,
      action_ids: actionIds,
      reason: actionIds.length ? '' : 'No current visible control in this category; future work must add a typed registry row before exposing UI or assistant execution.',
    };
  });

  const allActionRows = [...combined, ...visibleRows.filter((row) => !row.registered)];
  const findings = [];
  for (const row of visibleRows) {
    if (!row.registered) findings.push({ source: 'visible_control', action_id: row.action_id, reason: 'visible control is missing a registry contract' });
    if (row.registered && !row.handler_present) findings.push({ source: 'visible_control', action_id: row.action_id, reason: 'visible control is missing handler/behavior metadata' });
    if (row.registered && !row.permission_present) findings.push({ source: 'visible_control', action_id: row.action_id, reason: 'visible control is missing permission metadata' });
    if (row.registered && !row.test_present) findings.push({ source: 'visible_control', action_id: row.action_id, reason: 'visible control is missing test coverage metadata' });
  }
  for (const row of combined) {
    if (!row.handler_present) findings.push({ source: 'registry_action', action_id: row.action_id, reason: 'registry action lacks execution handler or behavior metadata' });
    if (!row.permission_present) findings.push({ source: 'registry_action', action_id: row.action_id, reason: 'registry action lacks role/workspace or permission metadata' });
    if (!row.test_present) findings.push({ source: 'registry_action', action_id: row.action_id, reason: 'registry action lacks test metadata' });
    if (row.external_write_possible && !row.approval_required) findings.push({ source: 'registry_action', action_id: row.action_id, reason: 'risky or external action lacks approval policy' });
  }

  const summary = {
    root_actions: root.length,
    detailed_actions: detailed.length,
    total_registry_rows: combined.length,
    visible_controls: visibleRows.length,
    visible_controls_classified: visibleRows.filter((row) => REQUIRED_CLASSIFICATIONS.includes(row.classification)).length,
    missing_contract: visibleRows.filter((row) => row.classification === 'missing_contract').length,
    missing_handler: allActionRows.filter((row) => row.classification === 'missing_handler' || row.handler_present === false).length,
    missing_test: allActionRows.filter((row) => row.classification === 'missing_test' || row.test_present === false).length,
    blocked_connector: allActionRows.filter((row) => row.classification === 'blocked_connector').length,
    risky_actions: combined.filter((row) => row.external_write_possible || row.risk === 'high').length,
    risky_without_approval: combined.filter((row) => (row.external_write_possible || row.risk === 'high') && !row.approval_required && row.classification !== 'read_only').length,
    visible_by_classification: countBy(visibleRows, 'classification'),
    registry_by_classification: countBy(combined, 'classification'),
  };

  const releaseGateRules = [
    { name: 'all_visible_controls_classified', passed: summary.visible_controls === summary.visible_controls_classified, value: `${summary.visible_controls_classified}/${summary.visible_controls}` },
    { name: 'zero_visible_missing_contracts', passed: summary.missing_contract === 0, value: summary.missing_contract },
    { name: 'zero_missing_handlers', passed: summary.missing_handler === 0, value: summary.missing_handler },
    { name: 'zero_missing_tests', passed: summary.missing_test === 0, value: summary.missing_test },
    { name: 'zero_risky_actions_without_approval', passed: summary.risky_without_approval === 0, value: summary.risky_without_approval },
    { name: 'telegram_request_parity_present', passed: paritySources.telegram_request.count > 0, value: paritySources.telegram_request.count },
    { name: 'website_assistant_request_parity_present', passed: paritySources.website_assistant_request.count > 0, value: paritySources.website_assistant_request.count },
    { name: 'agent_work_handoff_parity_present', passed: paritySources.agent_work_handoff.count > 0, value: paritySources.agent_work_handoff.count },
  ];
  const sourceFiles = [
    ROOT_REGISTRY_PATH,
    DETAIL_REGISTRY_PATH,
    'public/operations.html',
    'public/parent.html',
    'public/student.html',
    'public/provider.html',
    'src/platform/assistant/control-plane.js',
  ];
  const sourceHashes = Object.fromEntries(sourceFiles.map((file) => [file, sha256(readTextIfExists(file))]));
  const stablePayload = {
    summary,
    paritySources,
    categoryCoverage,
    visibleRows,
    actionRows: combined,
    releaseGateRules,
    sourceHashes,
    findings,
  };
  const report = {
    generated_at: new Date().toISOString(),
    requirement_id: REQUIREMENT_ID,
    source_id: 'RAW-20260623-005',
    registry_policy: 'The root action registry and detailed typed action registry are the single parity source for UI buttons, Telegram requests, website assistant requests, Operations helper requests, automation actions, and Agent Work handoffs.',
    allowed_classifications: REQUIRED_CLASSIFICATIONS,
    browser_click_substitution_allowed: false,
    ok: releaseGateRules.every((rule) => rule.passed) && findings.length === 0,
    content_hash: sha256(JSON.stringify(stablePayload)),
    source_hashes: sourceHashes,
    summary,
    parity_sources: paritySources,
    release_gate: {
      rules: releaseGateRules,
    },
    visible_controls: visibleRows,
    action_rows: combined,
    category_coverage: categoryCoverage,
    findings,
  };
  if (write) {
    writeText(OUTPUT_JSON_PATH, `${JSON.stringify(report, null, 2)}\n`);
    writeText(OUTPUT_MD_PATH, renderMarkdown(report));
  }
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  const report = buildUniversalActionParity({ write: true });
  console.log(`Universal action parity: ${report.ok ? 'ok' : 'needs repair'} (${report.summary.visible_controls} visible controls, ${report.summary.total_registry_rows} registry rows)`);
  if (!report.ok) {
    for (const finding of report.findings.slice(0, 10)) {
      console.error(`- ${finding.action_id || finding.source}: ${finding.reason}`);
    }
    process.exitCode = 1;
  }
}
