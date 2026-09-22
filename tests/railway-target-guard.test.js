const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

async function guardModule() {
  return import('../scripts/railway-target-guard.mjs');
}

function statusFixture(overrides = {}) {
  return {
    id: overrides.projectId || 'bd5b6d78-5e83-4e83-89b2-cd5f52ed7889',
    name: overrides.projectName || 'skillful-motivation',
    environments: {
      edges: [{
        node: {
          id: overrides.environmentId || '3ce30933-49c7-4b90-8c36-a5afd67df329',
          name: overrides.environmentName || 'production',
          serviceInstances: {
            edges: [{
              node: {
                serviceId: overrides.serviceId || '4079db35-5f4a-44ef-a767-3406c74f6005',
                serviceName: overrides.serviceName || 'skillful-motivation',
                domains: {
                  customDomains: [{ domain: overrides.domain || 'bneineviimacademy.org' }],
                  serviceDomains: [],
                },
              },
            }],
          },
        },
      }],
    },
    services: {
      edges: [{
        node: {
          id: overrides.serviceId || '4079db35-5f4a-44ef-a767-3406c74f6005',
          name: overrides.serviceName || 'skillful-motivation',
        },
      }],
    },
  };
}

test('Railway target guard blocks BNA deploys pointed at One Time', async () => {
  const { validateRailwayTarget } = await guardModule();
  const report = validateRailwayTarget({
    target: {
      app: 'bna',
      deployment_mode: 'cli',
      project_name: 'one-time-production',
      environment_name: 'production',
      service_name: 'one-time-web',
      expected_domain: 'bneineviimacademy.org',
      custom_domains: ['join.onetimeonetime.com'],
    },
  });

  assert.equal(report.ok, false);
  assert.ok(report.blockers.some((line) => /One Time project\/service/.test(line)));
});

test('Railway target guard blocks missing production service instead of using a fallback', async () => {
  const { validateRailwayTarget } = await guardModule();
  const report = validateRailwayTarget({
    target: {
      app: 'bna',
      deployment_mode: 'cli',
      project_name: 'skillful-motivation',
      environment_name: 'production',
      expected_domain: 'bneineviimacademy.org',
      custom_domains: ['bneineviimacademy.org'],
    },
  });

  assert.equal(report.ok, false);
  assert.ok(report.blockers.some((line) => /explicit service/.test(line)));
});

test('Railway target guard blocks custom-domain mismatch', async () => {
  const { validateRailwayTarget } = await guardModule();
  const report = validateRailwayTarget({
    target: {
      app: 'bna',
      deployment_mode: 'cli',
      project_name: 'skillful-motivation',
      environment_name: 'production',
      service_name: 'skillful-motivation',
      expected_domain: 'bneineviimacademy.org',
      custom_domains: ['wrong.example.test'],
    },
  });

  assert.equal(report.ok, false);
  assert.ok(report.blockers.some((line) => /custom domain mismatch/.test(line)));
});

test('Railway target guard accepts explicit BNA CLI target from env and status', async () => {
  const { buildRailwayTarget, validateRailwayTarget } = await guardModule();
  const target = buildRailwayTarget({
    env: {
      BNA_RAILWAY_PROJECT_ID: 'bd5b6d78-5e83-4e83-89b2-cd5f52ed7889',
      BNA_RAILWAY_PROJECT_NAME: 'skillful-motivation',
      BNA_RAILWAY_ENVIRONMENT_ID: '3ce30933-49c7-4b90-8c36-a5afd67df329',
      BNA_RAILWAY_ENVIRONMENT_NAME: 'production',
      BNA_RAILWAY_SERVICE_ID: '4079db35-5f4a-44ef-a767-3406c74f6005',
      BNA_RAILWAY_SERVICE_NAME: 'skillful-motivation',
      BNA_RAILWAY_CUSTOM_DOMAIN: 'bneineviimacademy.org',
    },
    status: statusFixture(),
    localConfig: {},
  });
  const report = validateRailwayTarget({ target });

  assert.equal(report.ok, true);
  assert.equal(report.target.project_name, 'skillful-motivation');
  assert.equal(report.target.service_name, 'skillful-motivation');
  assert.equal(report.target.environment_name, 'production');
});

test('Railway target guard uses committed non-secret BNA target profile by default', async () => {
  const { buildRailwayTarget, loadLocalRailwayTargetConfig, validateRailwayTarget } = await guardModule();
  const targetConfig = {
    default_profile: 'bna',
    profiles: {
      bna: {
        app: 'bna',
        deployment_mode: 'cli',
        expected_domain: 'bneineviimacademy.org',
        project_id: 'bd5b6d78-5e83-4e83-89b2-cd5f52ed7889',
        project_name: 'skillful-motivation',
        environment_name: 'production',
        service_name: 'skillful-motivation',
        custom_domain: 'bneineviimacademy.org',
      },
    },
  };
  const localConfig = loadLocalRailwayTargetConfig({
    env: {},
    repoRoot: 'C:\\repo',
    existsSync: (filePath) => filePath.endsWith(`${path.sep}config${path.sep}railway-targets.json`),
    readFileSync: () => JSON.stringify(targetConfig),
  });
  const target = buildRailwayTarget({
    env: {},
    status: {},
    localConfig,
  });
  const report = validateRailwayTarget({ target });

  assert.equal(report.ok, true);
  assert.equal(report.target.app, 'bna');
  assert.equal(report.target.project_id, 'bd5b6d78-5e83-4e83-89b2-cd5f52ed7889');
  assert.equal(report.target.service_name, 'skillful-motivation');
  assert.deepEqual(report.target.custom_domains, ['bneineviimacademy.org']);
});

test('Railway target guard selects committed One Time profile from deploy app', async () => {
  const { buildRailwayTarget, loadLocalRailwayTargetConfig, validateRailwayTarget } = await guardModule();
  const targetConfig = {
    default_profile: 'bna',
    profiles: {
      bna: {
        app: 'bna',
        project_name: 'skillful-motivation',
        service_name: 'skillful-motivation',
      },
      'one-time': {
        app: 'one-time',
        deployment_mode: 'cli',
        expected_domain: 'join.onetimeonetime.com',
        project_id: 'ce55ef20-1418-4ad3-aafa-f877fb992dc8',
        project_name: 'one-time-production',
        environment_name: 'production',
        service_name: 'one-time-web',
        custom_domain: 'join.onetimeonetime.com',
      },
    },
  };
  const localConfig = loadLocalRailwayTargetConfig({
    env: { BNA_DEPLOY_APP: 'one_time' },
    repoRoot: 'C:\\repo',
    existsSync: (filePath) => filePath.endsWith(`${path.sep}config${path.sep}railway-targets.json`),
    readFileSync: () => JSON.stringify(targetConfig),
  });
  const target = buildRailwayTarget({
    env: { BNA_DEPLOY_APP: 'one_time' },
    status: {},
    localConfig,
  });
  const report = validateRailwayTarget({ target });

  assert.equal(report.ok, true);
  assert.equal(report.target.app, 'one-time');
  assert.equal(report.target.project_name, 'one-time-production');
  assert.equal(report.target.service_name, 'one-time-web');
  assert.deepEqual(report.target.custom_domains, ['join.onetimeonetime.com']);
});

test('Railway target guard does not borrow status values from the wrong project', async () => {
  const { buildRailwayTarget, validateRailwayTarget } = await guardModule();
  const target = buildRailwayTarget({
    env: {},
    localConfig: {
      app: 'bna',
      deployment_mode: 'cli',
      expected_domain: 'bneineviimacademy.org',
      project_id: 'bd5b6d78-5e83-4e83-89b2-cd5f52ed7889',
      project_name: 'skillful-motivation',
      environment_name: 'production',
      service_name: 'skillful-motivation',
      custom_domain: 'bneineviimacademy.org',
    },
    status: statusFixture({
      projectId: 'ce55ef20-1418-4ad3-aafa-f877fb992dc8',
      projectName: 'one-time-production',
      environmentId: 'f911acfc-e206-44df-a569-9d69d709b94b',
      serviceId: 'd175ad94-5e3c-41c2-8cbc-daa1a299077d',
      serviceName: 'one-time-web',
      domain: 'join.onetimeonetime.com',
    }),
  });
  const report = validateRailwayTarget({ target });

  assert.equal(report.ok, true);
  assert.equal(report.target.project_name, 'skillful-motivation');
  assert.equal(report.target.environment_id, '');
  assert.equal(report.target.service_id, '');
  assert.deepEqual(report.target.custom_domains, ['bneineviimacademy.org']);
});

test('Railway target guard accepts verified GitHub auto-deploy mode without CLI service', async () => {
  const { buildRailwayTarget, validateRailwayTarget } = await guardModule();
  const target = buildRailwayTarget({
    env: {
      BNA_RAILWAY_DEPLOY_MODE: 'github-auto',
      BNA_RAILWAY_AUTO_DEPLOY_VERIFIED: 'approved',
      BNA_RAILWAY_GITHUB_REPO: 'shloimie-beep/bnei-neviim-academy',
      BNA_RAILWAY_GITHUB_BRANCH: 'master',
    },
    localConfig: {},
    status: {},
  });
  const report = validateRailwayTarget({ target });

  assert.equal(report.ok, true);
  assert.equal(report.deployment_mode, 'github-auto');
});

test('Railway scripts no longer contain implicit skillful-motivation fallback', () => {
  const doctor = fs.readFileSync('scripts/railway-doctor.ps1', 'utf8');
  const redeploy = fs.readFileSync('scripts/railway-redeploy.ps1', 'utf8');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  assert.doesNotMatch(doctor, /if \(-not \$railwayService\) \{ \$railwayService = "skillful-motivation" \}/);
  assert.doesNotMatch(redeploy, /if \(-not \$railwayService\) \{ \$railwayService = "skillful-motivation" \}/);
  assert.match(doctor, /Railway target guard blocked this command/);
  assert.match(redeploy, /Railway target guard blocked this command/);
  assert.match(doctor, /\$useAccountAuth = \$env:BNA_RAILWAY_USE_ACCOUNT_AUTH -match '\^\(1\|true\|yes\)\$'/);
  assert.match(doctor, /-not \$useAccountAuth -and -not \$env:RAILWAY_TOKEN/);
  assert.match(redeploy, /\$useAccountAuth = \$env:BNA_RAILWAY_USE_ACCOUNT_AUTH -match '\^\(1\|true\|yes\)\$'/);
  assert.match(redeploy, /-not \$useAccountAuth -and -not \$env:RAILWAY_TOKEN/);
  assert.equal(packageJson.scripts['railway:target:doctor'], 'node scripts/railway-target-guard.mjs doctor');
});
