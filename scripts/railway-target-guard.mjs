#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'approved', 'verified']);

export const DEFAULT_BNA_DOMAIN = 'bneineviimacademy.org';
export const DEFAULT_BNA_REPO = 'shloimie-beep/bnei-neviim-academy';

function clean(value) {
  return String(value || '').trim();
}

function truthy(value) {
  return TRUE_VALUES.has(clean(value).toLowerCase());
}

function firstValue(...values) {
  for (const value of values) {
    const normalized = clean(value);
    if (normalized) return normalized;
  }
  return '';
}

function lower(value) {
  return clean(value).toLowerCase();
}

function splitDomains(value = '') {
  return clean(value)
    .split(/[,\s]+/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function readJsonFile(filePath, context = {}) {
  const existsSync = context.existsSync || fs.existsSync;
  const readFileSync = context.readFileSync || fs.readFileSync;
  if (!filePath || !existsSync(filePath)) return null;
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

export function loadLocalRailwayTargetConfig(context = {}) {
  const env = context.env || process.env;
  const repoRoot = context.repoRoot || process.cwd();
  const candidates = [
    clean(env.BNA_RAILWAY_TARGET_CONFIG),
    path.join(repoRoot, '.secrets', 'bna-railway-target.json'),
    path.join(repoRoot, '.secrets', 'railway-target.json'),
  ].filter(Boolean);

  for (const filePath of candidates) {
    const parsed = readJsonFile(filePath, context);
    if (parsed && typeof parsed === 'object') {
      return {
        ...parsed,
        source: filePath.includes(`${path.sep}.secrets${path.sep}`) ? '.secrets' : 'configured-file',
      };
    }
  }
  return {};
}

function projectFromStatus(status = {}) {
  if (!status || typeof status !== 'object') return {};
  return {
    id: clean(status.id),
    name: clean(status.name),
  };
}

function environmentFromStatus(status = {}, target = {}) {
  const edges = status?.environments?.edges || [];
  const preferredId = lower(target.environment_id || target.environmentId);
  const preferredName = lower(target.environment_name || target.environmentName);
  const nodes = edges.map((edge) => edge?.node).filter(Boolean);
  return nodes.find((node) => lower(node.id) === preferredId) ||
    nodes.find((node) => lower(node.name) === preferredName) ||
    nodes.find((node) => lower(node.name) === 'production') ||
    nodes[0] ||
    {};
}

function serviceFromStatus(status = {}, target = {}) {
  const services = (status?.services?.edges || []).map((edge) => edge?.node).filter(Boolean);
  const envNode = environmentFromStatus(status, target);
  const instances = (envNode?.serviceInstances?.edges || []).map((edge) => edge?.node).filter(Boolean);
  const preferredId = lower(target.service_id || target.serviceId);
  const preferredName = lower(target.service_name || target.serviceName);
  const service = services.find((node) => lower(node.id) === preferredId) ||
    services.find((node) => lower(node.name) === preferredName) ||
    {};
  const instance = instances.find((node) => lower(node.serviceId) === preferredId) ||
    instances.find((node) => lower(node.serviceName) === preferredName) ||
    {};
  return {
    id: clean(service.id || instance.serviceId),
    name: clean(service.name || instance.serviceName),
    instance,
  };
}

function domainsFromStatus(status = {}, target = {}) {
  const service = serviceFromStatus(status, target);
  const domains = service.instance?.domains || {};
  const customDomains = (domains.customDomains || [])
    .map((domain) => clean(domain.domain || domain.name))
    .filter(Boolean);
  const serviceDomains = (domains.serviceDomains || [])
    .map((domain) => clean(domain.domain || domain.name))
    .filter(Boolean);
  return [...customDomains, ...serviceDomains];
}

export function buildRailwayTarget(context = {}) {
  const env = context.env || process.env;
  const localConfig = context.localConfig || loadLocalRailwayTargetConfig(context);
  const status = context.status || {};
  const statusProject = projectFromStatus(status);
  const configProject = {
    id: firstValue(env.BNA_RAILWAY_PROJECT_ID, env.RAILWAY_PROJECT_ID, localConfig.project_id, localConfig.projectId),
    name: firstValue(env.BNA_RAILWAY_PROJECT_NAME, env.RAILWAY_PROJECT_NAME, localConfig.project_name, localConfig.projectName),
  };
  const envNode = environmentFromStatus(status, localConfig);
  const service = serviceFromStatus(status, localConfig);
  return {
    app: lower(firstValue(env.BNA_DEPLOY_APP, localConfig.app, 'bna')),
    deployment_mode: lower(firstValue(env.BNA_RAILWAY_DEPLOY_MODE, env.RAILWAY_DEPLOY_MODE, localConfig.deployment_mode, localConfig.deploymentMode, 'cli')),
    expected_domain: lower(firstValue(env.BNA_EXPECTED_DOMAIN, localConfig.expected_domain, localConfig.expectedDomain, DEFAULT_BNA_DOMAIN)),
    project_id: firstValue(configProject.id, statusProject.id),
    project_name: firstValue(configProject.name, statusProject.name),
    environment_id: firstValue(env.BNA_RAILWAY_ENVIRONMENT_ID, env.RAILWAY_ENVIRONMENT_ID, localConfig.environment_id, localConfig.environmentId, envNode.id),
    environment_name: firstValue(env.BNA_RAILWAY_ENVIRONMENT_NAME, env.RAILWAY_ENVIRONMENT_NAME, env.RAILWAY_ENVIRONMENT, localConfig.environment_name, localConfig.environmentName, envNode.name, 'production'),
    service_id: firstValue(env.BNA_RAILWAY_SERVICE_ID, env.RAILWAY_SERVICE_ID, localConfig.service_id, localConfig.serviceId, service.id),
    service_name: firstValue(env.BNA_RAILWAY_SERVICE_NAME, env.RAILWAY_SERVICE_NAME, localConfig.service_name, localConfig.serviceName, service.name),
    custom_domains: splitDomains(firstValue(env.BNA_RAILWAY_CUSTOM_DOMAIN, localConfig.custom_domain, localConfig.customDomain)).concat(domainsFromStatus(status, localConfig)),
    github_repo: firstValue(env.BNA_RAILWAY_GITHUB_REPO, localConfig.github_repo, localConfig.githubRepo, DEFAULT_BNA_REPO),
    github_branch: firstValue(env.BNA_RAILWAY_GITHUB_BRANCH, localConfig.github_branch, localConfig.githubBranch, 'master'),
    auto_deploy_verified: truthy(firstValue(env.BNA_RAILWAY_AUTO_DEPLOY_VERIFIED, localConfig.auto_deploy_verified, localConfig.autoDeployVerified)),
    source: localConfig.source || 'environment/status',
  };
}

function isOneTimeProject(target = {}) {
  const project = lower(target.project_name);
  const service = lower(target.service_name);
  return project === 'one-time-production' || service.includes('one-time');
}

function isBnaProject(target = {}) {
  const project = lower(target.project_name);
  const service = lower(target.service_name);
  return project === 'skillful-motivation' || service === 'skillful-motivation';
}

export function validateRailwayTarget(context = {}) {
  const target = context.target || buildRailwayTarget(context);
  const mode = lower(context.mode || 'doctor');
  const blockers = [];
  const warnings = [];
  const autoDeploy = target.deployment_mode === 'github-auto' || target.deployment_mode === 'github_auto';
  const app = lower(target.app || 'bna');

  if (autoDeploy) {
    if (!target.auto_deploy_verified) blockers.push('GitHub auto-deploy mode requires BNA_RAILWAY_AUTO_DEPLOY_VERIFIED=approved.');
    if (lower(target.github_repo) !== DEFAULT_BNA_REPO) blockers.push(`GitHub auto-deploy repo must be ${DEFAULT_BNA_REPO}.`);
    if (lower(target.github_branch) !== 'master') blockers.push('GitHub auto-deploy branch must be master.');
    return {
      ok: blockers.length === 0,
      mode,
      deployment_mode: 'github-auto',
      target,
      blockers,
      warnings,
      secrets_redacted: true,
    };
  }

  if (!target.project_id && !target.project_name) blockers.push('Railway target requires explicit project ID or project name.');
  if (!target.environment_id && !target.environment_name) blockers.push('Railway target requires explicit environment ID or environment name.');
  if (!target.service_id && !target.service_name) blockers.push('Railway target requires explicit service ID or service name; no production fallback is allowed.');

  if (app === 'bna' && isOneTimeProject(target)) {
    blockers.push('BNA deploy target resolves to One Time project/service; aborting.');
  }
  if (app === 'one-time' && isBnaProject(target)) {
    blockers.push('One Time deploy target resolves to BNA project/service; aborting.');
  }

  const expectedDomain = lower(target.expected_domain || DEFAULT_BNA_DOMAIN);
  const domains = (target.custom_domains || []).map(lower).filter(Boolean);
  if (domains.length && expectedDomain && !domains.includes(expectedDomain)) {
    blockers.push(`Railway target custom domain mismatch; expected ${expectedDomain}.`);
  } else if (!domains.length) {
    warnings.push('No Railway custom domain was available for comparison.');
  }

  return {
    ok: blockers.length === 0,
    mode,
    deployment_mode: 'cli',
    target,
    blockers,
    warnings,
    secrets_redacted: true,
  };
}

export function summarizeRailwayTarget(report = {}) {
  const target = report.target || {};
  return [
    `Railway deployment mode: ${report.deployment_mode || target.deployment_mode || 'unknown'}`,
    `Railway project: ${target.project_name || '(not set)'}${target.project_id ? ` (${target.project_id})` : ''}`,
    `Railway environment: ${target.environment_name || '(not set)'}${target.environment_id ? ` (${target.environment_id})` : ''}`,
    `Railway service: ${target.service_name || '(not set)'}${target.service_id ? ` (${target.service_id})` : ''}`,
    `Expected domain: ${target.expected_domain || DEFAULT_BNA_DOMAIN}`,
    `Known domains: ${(target.custom_domains || []).join(', ') || '(not available)'}`,
  ];
}

function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    mode: 'doctor',
    json: false,
    statusJsonFile: '',
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === 'doctor' || arg === 'deploy') options.mode = arg;
    else if (arg === '--json') options.json = true;
    else if (arg === '--status-json-file') {
      options.statusJsonFile = argv[index + 1] || '';
      index += 1;
    } else if (arg.startsWith('--status-json-file=')) {
      options.statusJsonFile = arg.slice('--status-json-file='.length);
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return options;
}

function usage() {
  return `Usage:
  node scripts/railway-target-guard.mjs doctor [--json] [--status-json-file path]
  node scripts/railway-target-guard.mjs deploy [--json] [--status-json-file path]

Provide an explicit BNA Railway target through environment variables or
.secrets/bna-railway-target.json. This command is read-only and never prints
tokens or secret values.`;
}

function loadStatusJson(filePath) {
  if (!filePath) return {};
  return readJsonFile(filePath) || {};
}

function loadCurrentRailwayStatusJson() {
  const result = spawnSync('railway', ['status', '--json'], {
    encoding: 'utf8',
    windowsHide: true,
  });
  if (result.status !== 0 || !result.stdout) return {};
  try {
    return JSON.parse(result.stdout);
  } catch {
    return {};
  }
}

function printReport(report, options = {}) {
  if (options.json) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return;
  }
  console.log(`BNA Railway target guard: ${report.ok ? 'ready' : 'blocked'}`);
  for (const line of summarizeRailwayTarget(report)) console.log(line);
  for (const warning of report.warnings || []) console.log(`Warning: ${warning}`);
  for (const blocker of report.blockers || []) console.log(`Blocked: ${blocker}`);
}

async function main() {
  const options = parseArgs();
  if (options.help) {
    console.log(usage());
    return;
  }
  const report = validateRailwayTarget({
    mode: options.mode,
    status: options.statusJsonFile ? loadStatusJson(options.statusJsonFile) : loadCurrentRailwayStatusJson(),
  });
  printReport(report, options);
  if (!report.ok) process.exitCode = 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`Railway target guard failed: ${error.message}`);
    process.exit(1);
  });
}
