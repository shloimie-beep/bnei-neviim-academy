#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportDir = path.join(repoRoot, 'ops', 'system-audits');
const HEBREW_RE = /[\u0590-\u05FF]/;

function readText(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function findObjectEnd(source, openIndex) {
  let depth = 0;
  let quote = '';
  let escaped = false;
  for (let index = openIndex; index < source.length; index += 1) {
    const ch = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = '';
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function collectObjectBlocks(source, marker) {
  const blocks = [];
  let cursor = 0;
  while (cursor < source.length) {
    const start = source.indexOf(marker, cursor);
    if (start === -1) break;
    const open = source.indexOf('{', start);
    const end = open === -1 ? -1 : findObjectEnd(source, open);
    if (open !== -1 && end !== -1) blocks.push(source.slice(open, end + 1));
    cursor = end === -1 ? start + marker.length : end + 1;
  }
  return blocks;
}

function decodeJsString(quote, raw) {
  try {
    return Function(`"use strict"; return ${quote}${raw}${quote};`)();
  } catch {
    return raw;
  }
}

function valuesForKey(blocks, key) {
  const values = [];
  const pattern = new RegExp(`${key}\\s*:\\s*(['"\`])((?:\\\\.|(?!\\1)[\\s\\S])*?)\\1`, 'g');
  for (const block of blocks) {
    let match;
    while ((match = pattern.exec(block))) values.push(decodeJsString(match[1], match[2]));
  }
  return values;
}

function surface(id, description) {
  return { id, description, checks: [] };
}

function addCheck(item, name, ok, details = '') {
  item.checks.push({ name, ok: Boolean(ok), details });
}

function requireHebrewKeys(item, blocks, keys) {
  for (const key of keys) {
    const values = valuesForKey(blocks, key);
    addCheck(item, `${key} has Hebrew label`, values.length > 0 && values.every((value) => HEBREW_RE.test(value)), values.join(' | ') || 'missing');
  }
}

function requireHebrewOrExact(item, blocks, key, allowedExactValues = []) {
  const values = valuesForKey(blocks, key);
  const ok = values.length > 0 && values.every((value) => HEBREW_RE.test(value) || allowedExactValues.includes(value));
  addCheck(item, `${key} has Hebrew label or approved product name`, ok, values.join(' | ') || 'missing');
}

function badEnglishValues(blocks, keys, badValues) {
  const findings = [];
  for (const key of keys) {
    for (const value of valuesForKey(blocks, key)) {
      if (badValues.includes(value)) findings.push(`${key}: ${value}`);
    }
  }
  return findings;
}

export function auditSurfaces() {
  const report = {
    generated_at: new Date().toISOString(),
    task_id: 569,
    title: 'Hebrew RTL UI label audit',
    surfaces: [],
    findings: [],
  };

  const parentHtml = readText('public/parent.html');
  const parent = surface('parent-portal', 'Parent portal Hebrew mode should have RTL and Hebrew labels.');
  const parentHeBlocks = [
    ...collectObjectBlocks(parentHtml, 'he: {'),
    ...collectObjectBlocks(parentHtml, 'Object.assign(strings.he, {'),
  ];
  addCheck(parent, 'sets document direction for Hebrew', /document\.documentElement\.dir = language === 'he' \? 'rtl' : 'ltr'/.test(parentHtml));
  addCheck(parent, 'has Hebrew language toggle target', /data-language="he"/.test(parentHtml));
  requireHebrewKeys(parent, parentHeBlocks, [
    'home',
    'myChildren',
    'providerIndex',
    'parentCoaching',
    'interestTopics',
    'struggleSignals',
    'openEndedQuestions',
    'studentLoginSettings',
    'studentLoginStatus',
    'studentLoginFor',
    'studentLoginChildCopy',
    'studentUsername',
    'studentPassword',
    'studentPasswordNeverShown',
    'studentAccessFallback',
    'classroomSource',
  ]);
  const parentBad = badEnglishValues(parentHeBlocks, [
    'studentLoginSettings',
    'studentLoginStatus',
    'studentLoginFor',
    'studentLoginChildCopy',
    'studentUsername',
    'studentPassword',
    'studentPasswordNeverShown',
    'studentAccessFallback',
  ], [
    'Student login settings',
    'Student login',
    'Student portal login for',
    'Set or reset the username and password for this child only.',
    'Student username',
    'New student password',
    'Saved passwords are never displayed after set/reset.',
    'Access-code fallback',
  ]);
  addCheck(parent, 'no known parent Hebrew student-login fallbacks remain', parentBad.length === 0, parentBad.join('; '));
  report.surfaces.push(parent);

  const studentHtml = readText('public/student.html');
  const student = surface('student-portal', 'Student portal Hebrew mode should have RTL and Hebrew labels.');
  const studentHeBlocks = [
    ...collectObjectBlocks(studentHtml, 'he: {'),
    ...collectObjectBlocks(studentHtml, 'Object.assign(labels.he, {'),
  ];
  addCheck(student, 'sets document direction for Hebrew', /document\.documentElement\.dir = language === 'he' \? 'rtl' : 'ltr'/.test(studentHtml));
  addCheck(student, 'has Hebrew language button', /data-lang="he"/.test(studentHtml));
  addCheck(student, 'topbar student navigation labels are language-driven', /data-student-topbar-public/.test(studentHtml) && /publicSite/.test(studentHtml) && /dailyAccountability/.test(studentHtml));
  addCheck(student, 'device access state labels are language-driven', /function deviceAccessStateLabel/.test(studentHtml) && /deviceAccountabilityOnly/.test(studentHtml) && !/const statusLabel = access\.status_label \|\| String\(access\.status/.test(studentHtml));
  addCheck(student, 'daily checkoff weekday labels are localized', /localizedWeekdayLabel\(day\.date,\s*day\.label/.test(studentHtml));
  requireHebrewKeys(student, studentHeBlocks, [
    'publicSite',
    'families',
    'parentLoginNav',
    'dailyAccountability',
    'enterCode',
    'accessHelp',
    'studentUsername',
    'studentPassword',
    'studentLogin',
    'accessFallback',
    'clearCode',
    'boardTitle',
    'goalView',
    'today',
    'upcoming',
    'waiting',
    'done',
    'assignedOnly',
    'dailyCheckoffs',
    'noteFor',
    'saveDayNote',
    'tabletAccessLabel',
    'deviceNotConfigured',
    'deviceLocked',
    'deviceAccountabilityOnly',
    'deviceApprovedAccess',
    'deviceExpired',
    'questionsTitle',
    'askQuestion',
    'parentMessageTitle',
    'sendParentMessage',
    'talkTitle',
    'sendMessage',
    'assistantTitle',
    'sendAssistant',
    'calendarTitle',
    'googleClassroomStatus',
  ]);
  requireHebrewOrExact(student, studentHeBlocks, 'classroomSource', ['Google Classroom']);
  const studentBad = badEnglishValues(studentHeBlocks, [
    'enterCode',
    'accessHelp',
    'studentUsername',
    'studentPassword',
    'studentLogin',
    'accessFallback',
    'clearCode',
    'publicSite',
    'families',
    'parentLoginNav',
    'dailyAccountability',
    'deviceAccountabilityOnly',
  ], [
    'Student login',
    'Sign in with the username and password your parent set for you.',
    'Username',
    'Password',
    'Sign in',
    'During rollout, your private access-code link still works.',
    'Log out',
    'Public site',
    'Families',
    'Parent login',
    'Daily accountability',
    'Accountability only',
  ]);
  addCheck(student, 'no known student Hebrew login fallbacks remain', studentBad.length === 0, studentBad.join('; '));
  report.surfaces.push(student);

  const signupHe = readText('public/signup-he.html');
  const signup = surface('signup-he', 'Hebrew registration should be RTL and Hebrew-first.');
  addCheck(signup, 'html declares Hebrew RTL', /<html lang="he" dir="rtl">/.test(signupHe));
  addCheck(signup, 'site nav initializes in Hebrew', /data-nav-language="he"/.test(signupHe));
  addCheck(signup, 'form language is Hebrew', /name="form_language" value="he"/.test(signupHe));
  const signupBad = [
    /<h3>\s*Parent\s+\d/i,
    /<label[^>]*>\s*Parent name/i,
    /<label[^>]*>\s*Child name/i,
    /<h3>\s*Payment method/i,
    /<button[^>]*>\s*Submit registration/i,
  ].filter((pattern) => pattern.test(signupHe)).map(String);
  addCheck(signup, 'no known English registration-section labels remain', signupBad.length === 0, signupBad.join('; '));
  report.surfaces.push(signup);

  const siteNav = readText('public/js/bna-site-nav.js');
  const nav = surface('public-provider-navigation', 'Public Hebrew navigation should not fall back for provider entry labels.');
  const navHeBlocks = collectObjectBlocks(siteNav, 'he: {');
  requireHebrewKeys(nav, navHeBlocks, [
    'school',
    'parents',
    'serviceProviders',
    'audience',
    'portals',
    'parentLogin',
    'studentLogin',
    'providerLogin',
    'providerJoin',
    'contact',
    'signup',
    'openMenu',
  ]);
  addCheck(nav, 'public navigation omits Operations login entry', !/operationsLogin|\/operations-login\.html/.test(siteNav));
  report.surfaces.push(nav);

  const providerHtml = readText('public/provider.html');
  const provider = surface('provider-portal', 'Provider portal currently has no Hebrew mode to audit.');
  addCheck(provider, 'provider portal is explicitly English-only today', /<html lang="en">/.test(providerHtml));
  addCheck(provider, 'provider portal does not advertise a Hebrew toggle', !/data-language="he"|lang-he|document\.documentElement\.dir = language === 'he'/.test(providerHtml));
  addCheck(provider, 'provider Hebrew entry point covered by public nav audit', true, 'public-provider-navigation');
  report.surfaces.push(provider);

  for (const item of report.surfaces) {
    for (const check of item.checks) {
      if (!check.ok) report.findings.push({ surface: item.id, ...check });
    }
  }
  report.success = report.findings.length === 0;
  return report;
}

export function writeReport(report = auditSurfaces()) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.generated_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-hebrew-rtl-ui-label-audit.json`);
  const mdPath = path.join(reportDir, `${stamp}-hebrew-rtl-ui-label-audit.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const lines = [
    `# Hebrew RTL UI Label Audit - ${report.generated_at}`,
    '',
    `Task: #${report.task_id}`,
    `Result: ${report.success ? 'passed' : 'failed'}`,
    '',
    '## Surfaces',
  ];
  for (const item of report.surfaces) {
    lines.push('', `### ${item.id}`, '', item.description, '');
    for (const check of item.checks) {
      lines.push(`- ${check.ok ? 'PASS' : 'FAIL'} ${check.name}${check.details ? ` - ${check.details}` : ''}`);
    }
  }
  if (report.findings.length) {
    lines.push('', '## Findings', '');
    for (const finding of report.findings) lines.push(`- ${finding.surface}: ${finding.name}${finding.details ? ` - ${finding.details}` : ''}`);
  }
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);
  return {
    json: path.relative(repoRoot, jsonPath).replace(/\\/g, '/'),
    markdown: path.relative(repoRoot, mdPath).replace(/\\/g, '/'),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = auditSurfaces();
  const files = writeReport(report);
  console.log(`Report: ${files.markdown}`);
  if (!report.success) {
    console.error(JSON.stringify(report.findings, null, 2));
    process.exit(1);
  }
}
