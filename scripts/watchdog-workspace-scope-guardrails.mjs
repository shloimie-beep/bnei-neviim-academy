#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const args = new Set(process.argv.slice(2));
const json = args.has('--json');

function read(filePath) {
  return fs.readFileSync(path.join(repoRoot, filePath), 'utf8');
}

function sliceBetween(source, startNeedle, endNeedle) {
  const start = source.indexOf(startNeedle);
  if (start < 0) return '';
  const end = source.indexOf(endNeedle, start);
  return source.slice(start, end > start ? end : undefined);
}

const server = read('server.js');
const emailTemplates = read('src/lib/bna/rabbi-emails.js');
const workspaceMemory = read('memory-topics/workspace-scope-isolation.md');
const brandMemory = read('memory-topics/brand-kits.md');

const parentInviteRoute = sliceBetween(
  server,
  "app.post('/api/bna/one-time/parent-trial-invite'",
  "app.get('/api/bna/rabbi/site'"
);
const sendEmailBlock = sliceBetween(
  server,
  'async function sendEmail',
  'async function logCommunication'
);

const findings = [];

function check(condition, id, severity, message, evidence = '') {
  if (condition) return;
  findings.push({ id, severity, message, evidence });
}

check(
  parentInviteRoute,
  'WSG-ONETIME-PARENT-ROUTE-MISSING',
  'high',
  'OneTime parent trial invite route could not be found for scope inspection.'
);

check(
  /function configuredOneTimePublicBaseUrl/.test(server),
  'WSG-ONETIME-BASE-HELPER',
  'high',
  'OneTime-scoped flows need a dedicated public-base helper instead of deriving URLs from the current request host.'
);

check(
  /ONE_TIME_PUBLIC_DOMAIN/.test(server) && /join\.onetimeonetime\.com/.test(server),
  'WSG-ONETIME-CANONICAL-DOMAIN',
  'high',
  'The canonical OneTime public domain must be declared server-side.'
);

check(
  /configuredOneTimePublicBaseUrl\(\)/.test(parentInviteRoute),
  'WSG-ONETIME-PARENT-BASE',
  'high',
  'OneTime parent invite route must use configuredOneTimePublicBaseUrl().'
);

check(
  /oneTimeParentPortalPasswordResetUrl\(reset\.token\)/.test(parentInviteRoute),
  'WSG-ONETIME-PASSWORD-LINK',
  'high',
  'OneTime parent password setup links must be rebuilt against the OneTime public base URL.'
);

check(
  !/requestBaseUrl\(req\)/.test(parentInviteRoute),
  'WSG-ONETIME-NO-REQUEST-HOST',
  'high',
  'OneTime parent invite route must not derive parent/member/classroom links from requestBaseUrl(req).',
  'This prevents Academy-hosted admin requests from creating Academy URLs in OneTime emails.'
);

check(
  !/Bnei Neviim Academy|bneineviimacademy\.org/i.test(parentInviteRoute),
  'WSG-ONETIME-NO-ACADEMY-COPY',
  'high',
  'OneTime parent invite route must not contain Academy branding or Academy domains.'
);

check(
  /liveClassUrl/.test(parentInviteRoute) && /normalizeHttpsExternalUrl/.test(parentInviteRoute),
  'WSG-ONETIME-LIVE-LINK-VALIDATION',
  'medium',
  'OneTime parent invite route should validate the optional live class/Zoom link before sending.'
);

check(
  /workspace:\s*'one_time_mishnah_class'/.test(parentInviteRoute),
  'WSG-ONETIME-MAIL-WORKSPACE',
  'high',
  'OneTime parent invite sends must pass the OneTime project workspace to the email sender.'
);

check(
  /identity\?\.oneTime/.test(sendEmailBlock) && /sendResendMessage/.test(sendEmailBlock),
  'WSG-ONETIME-RESEND-SENDER',
  'high',
  'sendEmail must route OneTime-scoped mail through the OneTime Resend identity when configured.'
);

check(
  /parent_trial_invite:[\s\S]*Tonight's live shiur Zoom link/.test(emailTemplates),
  'WSG-ONETIME-PARENT-ZOOM-COPY',
  'medium',
  'OneTime parent invite template should have a dedicated live-shiur link line.'
);

check(
  !/parent_trial_invite:[\s\S]{0,900}Bnei Neviim Academy|parent_trial_invite:[\s\S]{0,900}bneineviimacademy\.org/i.test(emailTemplates),
  'WSG-ONETIME-TEMPLATE-NO-ACADEMY',
  'high',
  'OneTime parent invite template must not include Academy branding or Academy domains.'
);

check(
  /Rabbi\/provider scope cannot read unrelated BNA/.test(workspaceMemory)
    && /support\/admin diagnostics belong behind a support drawer or role gate/i.test(workspaceMemory),
  'WSG-WORKSPACE-MEMORY',
  'medium',
  'Workspace scope memory must preserve provider isolation and support-diagnostic gating rules.'
);

check(
  /Rabbi \/ One Time brand = black \+ yellow/.test(brandMemory)
    && /BNA brand = cream \+ navy \+ teal\/cyan/.test(brandMemory),
  'WSG-BRAND-MEMORY',
  'medium',
  'Brand memory must preserve separate OneTime and BNA palettes.'
);

const report = {
  ok: findings.length === 0,
  checked_at: new Date().toISOString(),
  guardrail: 'workspace_scope_guardrails',
  findings,
};

if (json) {
  console.log(JSON.stringify(report, null, 2));
} else if (findings.length) {
  console.error('Workspace scope guardrail failed:');
  for (const finding of findings) {
    console.error(`- ${finding.id} [${finding.severity}]: ${finding.message}`);
    if (finding.evidence) console.error(`  ${finding.evidence}`);
  }
} else {
  console.log('Workspace scope guardrail passed.');
}

if (findings.length) process.exitCode = 1;
