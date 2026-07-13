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
const oneTimeParentSetupPage = read('public/one-time-parent.html');
const oneTimeMemberHomePage = read('public/rabbi-member.html');
const oneTimeMemberLibraryPage = read('public/member-library.html');
const oneTimeClassroomPage = read('public/one-time-classroom.html');
const oneTimeParticipantPage = read('public/provider-participant.html');

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
  'One Time parent promotional access invite route could not be found for scope inspection.'
);

check(
  /function configuredOneTimePublicBaseUrl/.test(server),
  'WSG-ONETIME-BASE-HELPER',
  'high',
  'One Time scoped flows need a dedicated public-base helper instead of deriving URLs from the current request host.'
);

check(
  /ONE_TIME_PUBLIC_DOMAIN/.test(server) && /join\.onetimeonetime\.com/.test(server),
  'WSG-ONETIME-CANONICAL-DOMAIN',
  'high',
  'The canonical One Time public domain must be declared server-side.'
);

check(
  /configuredOneTimePublicBaseUrl\(\)/.test(parentInviteRoute),
  'WSG-ONETIME-PARENT-BASE',
  'high',
  'One Time parent invite route must use configuredOneTimePublicBaseUrl().'
);

check(
  /oneTimeParentPortalPasswordResetUrl\(reset\.token\)/.test(parentInviteRoute),
  'WSG-ONETIME-PASSWORD-LINK',
  'high',
  'One Time parent password setup links must be rebuilt against the One Time public base URL.'
);

check(
  /\/one-time-parent\?reset=/.test(server),
  'WSG-ONETIME-PASSWORD-SETUP-PATH',
  'high',
  'One Time parent password setup links must land on /one-time-parent instead of the generic Academy parent portal.'
);

check(
  /parent_portal:\s*scopedPublicUrl\(oneTimeBaseUrl,\s*'\/one-time-parent'\)/.test(parentInviteRoute)
    && !/parent_portal:\s*scopedPublicUrl\(oneTimeBaseUrl,\s*'\/parent'\)/.test(parentInviteRoute),
  'WSG-ONETIME-PREVIEW-PARENT-PORTAL-PATH',
  'high',
  'One Time parent invite preview must advertise /one-time-parent, not /parent.'
);

check(
  !/requestBaseUrl\(req\)/.test(parentInviteRoute),
  'WSG-ONETIME-NO-REQUEST-HOST',
  'high',
  'One Time parent invite route must not derive parent/member/classroom links from requestBaseUrl(req).',
  'This prevents Academy-hosted admin requests from creating Academy URLs in One Time emails.'
);

check(
  !/Bnei Neviim Academy|bneineviimacademy\.org/i.test(parentInviteRoute),
  'WSG-ONETIME-NO-ACADEMY-COPY',
  'high',
  'One Time parent invite route must not contain Academy branding or Academy domains.'
);

check(
  /liveClassUrl/.test(parentInviteRoute)
    && /normalizeHttpsExternalUrl/.test(parentInviteRoute)
    && /configuredOneTimeLiveClassUrl\(\)/.test(parentInviteRoute)
    && /missing_live_class_url/.test(server),
  'WSG-ONETIME-LIVE-LINK-VALIDATION',
  'medium',
  'One Time parent invite route should validate and require a live class/Zoom link before production sending.'
);

check(
  /function oneTimeParentTrialInvitePreflight/.test(server)
    && /missing_student_name/.test(server)
    && /One Time parent promotional access invite is not launch-ready/.test(parentInviteRoute)
    && !/TEST One Time Student/.test(parentInviteRoute)
    && /inviteMode = smokeMode \? 'smoke_test' : 'production'/.test(parentInviteRoute),
  'WSG-ONETIME-NO-TEST-INVITE-DEFAULT',
  'high',
  'One Time parent invites must be production/live by default and must not default to TEST student labels.'
);

check(
  /app\.post\('\/api\/one-time\/parent-password\/request'/.test(server)
    && /sendOneTimeParentPasswordResetEmail/.test(server)
    && /oneTimeParentPasswordResetEligible/.test(server)
    && /oneTimeParentPortalPasswordResetUrl\(token\)/.test(server),
  'WSG-ONETIME-PARENT-FORGOT-PASSWORD',
  'high',
  'One Time forgot-password must send a One Time branded /one-time-parent reset link only for One Time eligible parent/member records.'
);

check(
  /workspace:\s*'one_time_mishnah_class'/.test(parentInviteRoute),
  'WSG-ONETIME-MAIL-WORKSPACE',
  'high',
  'One Time parent invite sends must pass the One Time project workspace to the email sender.'
);

check(
  /identity\?\.oneTime/.test(sendEmailBlock) && /sendResendMessage/.test(sendEmailBlock),
  'WSG-ONETIME-RESEND-SENDER',
  'high',
  'sendEmail must route One Time scoped mail through the One Time Resend identity when configured.'
);

check(
  /parent_trial_invite:[\s\S]*Tonight's live shiur Zoom link/.test(emailTemplates),
  'WSG-ONETIME-PARENT-ZOOM-COPY',
  'medium',
  'One Time parent invite template should have a dedicated live-shiur link line.'
);

check(
  /One Time Parent(?: Account)? Setup/.test(oneTimeParentSetupPage)
    && /\/api\/parent-portal\/password\/reset/.test(oneTimeParentSetupPage)
    && /\/api\/one-time\/parent-password\/request/.test(oneTimeParentSetupPage)
    && !/\bBNA\b|Bnei Neviim|Academy|bneineviimacademy/i.test(oneTimeParentSetupPage),
  'WSG-ONETIME-PARENT-SETUP-NO-ACADEMY',
  'high',
  'One Time parent setup page must be a One Time only password setup surface with no Academy branding.'
);

check(
  [
    oneTimeParentSetupPage,
    oneTimeMemberHomePage,
    oneTimeMemberLibraryPage,
    oneTimeClassroomPage,
    oneTimeParticipantPage,
  ].every((source) => !/One Time home|Return to public site|href="\/one-time(?:[?#"])|href="\/"/.test(source)),
  'WSG-ONETIME-NO-PUBLIC-RETURN-LINKS',
  'medium',
  'Logged-in One Time launch surfaces must not show public-home/public-site detours.'
);

check(
  !/Use fallback access code|Fallback access code|support recovery code|Recovery-code|Access code required/i.test(`${oneTimeMemberLibraryPage}\n${oneTimeClassroomPage}`)
    && /There is no separate classroom or library password/.test(oneTimeMemberLibraryPage)
    && /There is no separate classroom password/.test(oneTimeClassroomPage)
    && /currentMemberSessionToken/.test(oneTimeMemberLibraryPage)
    && /currentMemberSessionToken/.test(oneTimeClassroomPage),
  'WSG-ONETIME-NO-CODE-FALLBACK-UX',
  'high',
  'One Time library/classroom must load through member session or secure invite link without visible access-code fallback/recovery UI.'
);

check(
  !/parent_trial_invite:[\s\S]{0,900}Bnei Neviim Academy|parent_trial_invite:[\s\S]{0,900}bneineviimacademy\.org/i.test(emailTemplates),
  'WSG-ONETIME-TEMPLATE-NO-ACADEMY',
  'high',
  'One Time parent invite template must not include Academy branding or Academy domains.'
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
  'Brand memory must preserve separate One Time and BNA palettes.'
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
