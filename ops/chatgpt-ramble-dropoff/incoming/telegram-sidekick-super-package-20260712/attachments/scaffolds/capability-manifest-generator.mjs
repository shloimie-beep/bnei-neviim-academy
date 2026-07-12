#!/usr/bin/env node

// Starter for scripts/generate-assistant-capability-manifest.mjs.
// It intentionally fails on unmapped current registries until Codex supplies
// the canonical executable capability source and explicit exclusions.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const root = process.cwd();
const write = process.argv.includes('--write');
const check = process.argv.includes('--check');

function readJson(relativePath, fallback) {
  const absolute = path.join(root, relativePath);
  if (!fs.existsSync(absolute)) return fallback;
  return JSON.parse(fs.readFileSync(absolute, 'utf8'));
}

function sha(value) {
  return crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
}

function listCanonicalCapabilities() {
  const candidate = path.join(root, 'src', 'platform', 'assistant', 'capabilities', 'registry.js');
  if (!fs.existsSync(candidate)) return [];
  const loaded = require(candidate);
  const rows = typeof loaded.listCapabilities === 'function' ? loaded.listCapabilities() : loaded.CAPABILITIES;
  return Array.isArray(rows) ? rows : [];
}

function duplicates(values) {
  const seen = new Set();
  const repeated = new Set();
  for (const value of values.filter(Boolean)) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated].sort();
}

function main() {
  const { listActions } = require(path.join(root, 'src', 'lib', 'actions', 'registry.js'));
  const helper = require(path.join(root, 'src', 'lib', 'bna', 'helper', 'tool-registry.js'));
  const typedActions = listActions();
  const helperTools = helper.REQUIRED_HELPER_TOOL_NAMES || [];
  const rootRegistry = readJson('ops/action-registry.json', { actions: [] });
  const routeRegistry = readJson('ops/route-registry.json', { routes: [] });
  const exclusions = readJson('ops/assistant-capabilities/ui-exclusions.json', { ui_action_ids: {}, route_keys: {} });
  const capabilities = listCanonicalCapabilities();

  const mappedTyped = new Map();
  const mappedHelper = new Map();
  const mappedUi = new Map();
  const mappedRoutes = new Map();
  const errors = [];

  for (const capability of capabilities) {
    const id = capability.capability_id;
    if (!id) errors.push('capability_missing_id');
    if (!capability.execution || (capability.kind !== 'answer' && !capability.execution.handler)) errors.push(`${id}:missing_handler`);
    if (!capability.effect?.class) errors.push(`${id}:missing_effect_class`);
    if (!capability.input_schema || capability.input_schema.additionalProperties !== false) errors.push(`${id}:input_schema_not_strict`);
    if (!capability.tests?.contract) errors.push(`${id}:missing_contract_test`);
    if (!capability.intent_examples?.en?.length || !capability.intent_examples?.he?.length) errors.push(`${id}:missing_bilingual_examples`);
    if (!capability.negative_examples?.en?.length || !capability.negative_examples?.he?.length) errors.push(`${id}:missing_bilingual_negatives`);
    const aliases = capability.aliases || {};
    for (const value of aliases.typed_action_ids || []) mappedTyped.set(value, id);
    for (const value of aliases.helper_tools || []) mappedHelper.set(value, id);
    for (const value of aliases.ui_action_ids || []) mappedUi.set(value, id);
    for (const value of aliases.route_keys || []) mappedRoutes.set(value, id);
  }

  const typedIds = typedActions.map((row) => row.action_id);
  const uiRows = Array.isArray(rootRegistry.actions) ? rootRegistry.actions : [];
  const routeRows = Array.isArray(routeRegistry.routes) ? routeRegistry.routes : [];
  const uiIds = uiRows.map((row) => row.action_id).filter(Boolean);
  const routeKeys = routeRows.map((row) => row.route_key || row.route).filter(Boolean);

  const report = {
    schema_version: 'bna.assistant_capability_parity.v2',
    generated_at: new Date().toISOString(),
    source_hash: sha({ typedActions, helperTools, uiRows, routeRows, capabilities, exclusions }),
    counts: {
      canonical_capabilities: capabilities.length,
      typed_actions: typedIds.length,
      helper_tools: helperTools.length,
      ui_actions: uiIds.length,
      routes: routeKeys.length,
    },
    duplicate_ids: {
      capability_ids: duplicates(capabilities.map((row) => row.capability_id)),
      typed_aliases: duplicates(capabilities.flatMap((row) => row.aliases?.typed_action_ids || [])),
      helper_aliases: duplicates(capabilities.flatMap((row) => row.aliases?.helper_tools || [])),
      ui_aliases: duplicates(capabilities.flatMap((row) => row.aliases?.ui_action_ids || [])),
      route_aliases: duplicates(capabilities.flatMap((row) => row.aliases?.route_keys || [])),
    },
    gaps: {
      typed_actions: typedIds.filter((id) => !mappedTyped.has(id)),
      helper_tools: helperTools.filter((id) => !mappedHelper.has(id)),
      ui_actions: uiIds.filter((id) => !mappedUi.has(id) && !exclusions.ui_action_ids?.[id]),
      routes: routeKeys.filter((id) => !mappedRoutes.has(id) && !exclusions.route_keys?.[id]),
    },
    exclusions,
    errors,
  };

  const duplicateCount = Object.values(report.duplicate_ids).reduce((sum, rows) => sum + rows.length, 0);
  const gapCount = Object.values(report.gaps).reduce((sum, rows) => sum + rows.length, 0);
  report.ok = duplicateCount === 0 && gapCount === 0 && errors.length === 0;

  if (write) {
    const outputDir = path.join(root, 'ops', 'assistant-capabilities');
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'parity-report.json'), `${JSON.stringify(report, null, 2)}\n`);
  }
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if ((check || write) && !report.ok) process.exitCode = 1;
}

main();
