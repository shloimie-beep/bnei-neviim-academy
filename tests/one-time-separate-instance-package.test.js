const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const {
  DISABLED_FEATURES,
  ENABLED_MODULES,
  NON_SECRET_VARIABLES,
  ONE_TIME_PUBLIC_DOMAIN,
  ONE_TIME_PUBLIC_URL,
  REQUIRED_SECRET_VARIABLES,
  buildOneTimeRailwayPlan,
  buildOneTimeRailwayProvisioningChecklist,
  buildOneTimeRuntimeFlags,
  buildOneTimeSeedManifest,
  buildOneTimeSeedSql,
  assertOneTimeRailwayTarget,
  assertOneTimeSeedIsolation,
} = require('../src/platform/instances/one-time-separate-deployment');

test('single-tenant runtime flags force One Time scope and disable BNA-only features', () => {
  const flags = buildOneTimeRuntimeFlags({
    APP_MODE: 'single_tenant',
    APP_INSTANCE: 'onetime',
    STUDENT_BOT_ENABLED: 'true',
    BNA_ACCOUNTABILITY_ENABLED: 'true',
  });
  assert.equal(flags.single_tenant, true);
  assert.equal(flags.workspace_key, 'rabbi_sheller_provider');
  assert.equal(flags.project_key, 'one_time_mishnah_class');
  assert.equal(flags.student_bot_enabled, false);
  assert.equal(flags.bna_accountability_enabled, false);
  assert.equal(flags.sefaria_study_assistant_enabled, false);
  assert.ok(flags.enabled_modules.includes('Vimeo Library'));
  assert.ok(flags.disabled_features.includes('BNA school accountability'));
});

test('Railway plan is redacted, uses separate services, and does not target shared BNA project', () => {
  const plan = buildOneTimeRailwayPlan({
    SESSION_SECRET: 'do-not-print',
    ONE_TIME_OWNER_USERNAME: 'owner',
    ONE_TIME_OWNER_PASSWORD: 'password',
  }, { baseUrl: ONE_TIME_PUBLIC_URL });
  assert.equal(plan.railway.project_name, 'one-time-production');
  assert.equal(plan.railway.web_service_name, 'one-time-web');
  assert.equal(plan.railway.postgres_service_name, 'one-time-postgres');
  assert.equal(plan.railway.forbidden_project, 'skillful-motivation');
  assert.equal(plan.railway.worker_service.required, false);
  assert.equal(plan.variables.non_secret.APP_INSTANCE, 'onetime');
  assert.equal(plan.variables.non_secret.DEFAULT_WORKSPACE_KEY, 'rabbi_sheller_provider');
  assert.equal(plan.variables.non_secret.DEFAULT_PROJECT_KEY, 'one_time_mishnah_class');
  assert.equal(plan.variables.non_secret.ONE_TIME_PUBLIC_DOMAIN, ONE_TIME_PUBLIC_DOMAIN);
  assert.equal(plan.variables.non_secret.APP_URL, ONE_TIME_PUBLIC_URL);
  assert.equal(plan.variables.non_secret.STUDENT_BOT_ENABLED, 'false');
  assert.equal(plan.variables.non_secret.BNA_ACCOUNTABILITY_ENABLED, 'false');
  assert.ok(REQUIRED_SECRET_VARIABLES.includes('DATABASE_URL'));
  assert.ok(plan.variables.required_secret_names.every((item) => item.value === '[redacted]'));
  assert.doesNotMatch(JSON.stringify(plan), /do-not-print|password/);
});

test('One Time seed manifest and SQL are TEST-prefixed and isolated from BNA private data', () => {
  const manifest = buildOneTimeSeedManifest({ generatedAt: '2026-06-21T21:20:00+03:00' });
  const sql = buildOneTimeSeedSql(manifest);
  const isolation = assertOneTimeSeedIsolation(manifest, sql);
  assert.equal(isolation.ok, true, isolation.failures.join(', '));
  assert.equal(manifest.workspace.workspace_key, 'rabbi_sheller_provider');
  assert.equal(manifest.workspace.project_key, 'one_time_mishnah_class');
  assert.ok(manifest.review_identities.every((identity) => identity.key.startsWith('TEST-')));
  assert.ok(manifest.review_identities.every((identity) => /@example\.test$/.test(identity.email)));
  assert.match(sql, /ON CONFLICT \(project_key\) DO UPDATE/);
  assert.match(sql, /WHERE NOT EXISTS\s*\(\s*SELECT 1 FROM bna_people existing/i);
  assert.doesNotMatch(sql, /ON CONFLICT DO NOTHING\s+RETURNING id, preferred_name/i);
  assert.match(sql, /TEST Weekly Mishnah Live Class/);
  assert.match(sql, /https:\/\/vimeo\.com\/123456789/);
  assert.match(sql, /TEST-OT-SUP-000001/);
  assert.doesNotMatch(sql, /Dratler|Bnei Neviim|raw private/i);
});

test('portal static pages load One Time single-tenant runtime helper', () => {
  const parent = fs.readFileSync('public/parent.html', 'utf8');
  const student = fs.readFileSync('public/student.html', 'utf8');
  const helper = fs.readFileSync('public/js/one-time-single-tenant.js', 'utf8');
  assert.match(parent, /one-time-single-tenant\.js/);
  assert.match(student, /one-time-single-tenant\.js/);
  assert.match(helper, /\/api\/one-time\/instance-config/);
  assert.match(helper, /student_bot_enabled/);
  assert.match(helper, /data-student-topbar-accountability/);
});

test('required One Time module and disabled-feature lists match review scope', () => {
  for (const moduleName of ['Overview', 'Parents', 'Students', 'Communications', 'Live Class', 'Vimeo Library', 'Payments/Trial/Access', 'Branding/Settings']) {
    assert.ok(ENABLED_MODULES.includes(moduleName), moduleName);
  }
  for (const disabled of ['BNA school accountability', 'BNA student tutor bot', 'unrestricted Mishnah study bot']) {
    assert.ok(DISABLED_FEATURES.includes(disabled), disabled);
  }
  assert.equal(NON_SECRET_VARIABLES.APP_MODE, 'single_tenant');
});

test('separate-instance live smoke checks the deployed API health route first', () => {
  const smoke = fs.readFileSync('scripts/smoke-onetime-separate-instance-live.mjs', 'utf8');
  assert.match(smoke, /fetchText\('\/api\/health'\)/);
  assert.match(smoke, /fetchText\('\/health'\)/);
  assert.match(smoke, /health\.response\.status === 404/);
});

test('Railway provisioning checklist is redacted and guarded against the shared project', () => {
  const plan = buildOneTimeRailwayPlan({}, { baseUrl: ONE_TIME_PUBLIC_URL });
  const target = assertOneTimeRailwayTarget(plan);
  const checklist = buildOneTimeRailwayProvisioningChecklist(plan);
  assert.equal(target.ok, true, target.failures.join(', '));
  assert.equal(checklist.target.target_project, 'one-time-production');
  assert.equal(checklist.target.forbidden_project, 'skillful-motivation');
  assert.ok(checklist.safety_guards.some((line) => /Do not add services to skillful-motivation/.test(line)));
  assert.ok(checklist.apply_checklist.some((step) => step.key === 'set_non_secret_variables'));
  assert.ok(checklist.apply_checklist.some((step) => step.key === 'attach_domain' && step.command.includes(ONE_TIME_PUBLIC_DOMAIN)));
  const secretStep = checklist.apply_checklist.find((step) => step.key === 'set_required_secrets');
  assert.ok(secretStep.secret_names.includes('SESSION_SECRET'));
  assert.ok(!secretStep.secret_names.includes('DATABASE_URL'));
  assert.doesNotMatch(JSON.stringify(checklist), /do-not-print|password|sk-[A-Za-z0-9]/);
});

test('Railway provisioning preflight script is dry-run only', () => {
  const script = fs.readFileSync('scripts/preflight-onetime-railway-provisioning.mjs', 'utf8');
  assert.match(script, /dry_run_only/);
  assert.match(script, /allowBlocked/);
  assert.match(script, /No Railway mutation was performed/);
  assert.doesNotMatch(script, /runReadOnlyRailway\(\['init|runReadOnlyRailway\(\['add|runReadOnlyRailway\(\['up|runReadOnlyRailway\(\['domain/);
});
