const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const supervisorUrl = pathToFileURL(path.join(__dirname, '..', 'scripts', 'agent-fleet-supervisor.mjs')).href;

async function loadSupervisor() {
  return import(supervisorUrl);
}

function watchdogImprovementFixture() {
  return {
    id: 'no_ghl_policy_fixture',
    title: 'Verify no-GHL policy stays enforced',
    decision_title: 'Decide no-GHL watchdog follow-up',
    signature: 'watchdog-improvement-v1:no_ghl_policy_fixture',
    category: 'docs',
    task_category: 'operations',
    urgency: 'this_week',
    message: 'Fixture finding used to verify watchdog decision creation without requiring stale docs to exist in the repo.',
    evidence: [
      {
        file: 'README.md',
        count: 1,
        line: null,
        excerpt: 'No-GHL policy is current and should stay enforced.',
      },
    ],
    options: [
      {
        label: 'Option A',
        value: 'Keep the no-GHL policy enforced in active docs and tests.',
        patch: {
          title: 'Verify active docs keep no-GHL policy',
          category: 'operations',
        },
      },
      {
        label: 'Option B',
        value: 'Add a follow-up scan only if active GHL language returns.',
        patch: {
          title: 'Add no-GHL watchdog follow-up scan',
          category: 'operations',
        },
      },
    ],
  };
}

test('watchdog can clean the raw task #195 style title safely', async () => {
  const {
    buildTaskTitleRepair,
    looksRawRambleTitle,
    looksWatchdogWarningRepairRequest,
  } = await loadSupervisor();
  const original = "Yes definitely fix up that thing but your student is super professional really legit way like so nothing gets messed up cuz there's other critical warnings and we just need to put this in the change log";
  const task = {
    id: 195,
    title: `${original} ${original.slice(0, 40)}...`,
    notes: 'Clear task extracted from Telegram input.',
    stage: 'in_progress',
    category: 'accountability',
    assigned_to: 'Codex',
    decision_required: false,
    ai_parsed: { original_text: original },
  };

  assert.equal(looksRawRambleTitle(task), true);
  assert.equal(looksWatchdogWarningRepairRequest(task), true);

  const repair = buildTaskTitleRepair(task);
  assert.equal(repair.next_title, 'Add watchdog soft repair for obvious task warnings');
  assert.equal(repair.patch.title, 'Add watchdog soft repair for obvious task warnings');
  assert.equal(repair.patch.category, 'operations');
  assert.equal(repair.patch.assigned_to, 'Codex');
  assert.equal(repair.patch.decision_required, false);
  assert.equal(Object.hasOwn(repair.patch, 'stage'), false);
});

test('watchdog reroutes a Shloimie-owned watchdog cleanup request to Codex', async () => {
  const {
    buildWatchdogRoutingRepair,
    looksRawRambleTitle,
    looksWatchdogWarningRepairRequest,
  } = await loadSupervisor();
  const task = {
    id: 193,
    title: 'Clean raw natural-language wording from the Tasks dashboard',
    notes: 'Clear task extracted from Telegram input. Owner: Shloimie.',
    stage: 'assigned',
    category: 'operations',
    assigned_to: 'Shloimie',
    decision_required: false,
    ai_parsed: {
      original_text: "So just create something that auto fixes those Watch Dogs so if anything gets into the category of warning like your example here of the visible ramble and natural language in the wrong place that'll fix it. If it's not clear what to do and you have different options it should go to the decision.",
    },
  };

  assert.equal(looksRawRambleTitle(task), false);
  assert.equal(looksWatchdogWarningRepairRequest(task), true);

  const repair = buildWatchdogRoutingRepair(task);
  assert.equal(repair.next_title, 'Add watchdog soft repair for obvious task warnings');
  assert.equal(repair.patch.title, 'Add watchdog soft repair for obvious task warnings');
  assert.equal(repair.patch.assigned_to, 'Codex');
  assert.equal(repair.patch.category, 'operations');
  assert.equal(repair.patch.stage, 'assigned');
  assert.equal(repair.patch.decision_required, false);
});

test('watchdog does not treat unrelated critical findings as task-title repairs', async () => {
  const { buildTaskTitleRepair, looksWatchdogWarningRepairRequest } = await loadSupervisor();
  const task = {
    id: 777,
    title: 'Railway doctor reports critical deployment warning',
    notes: 'Investigate deployment status before changing production.',
    stage: 'assigned',
    assigned_to: 'Codex',
  };

  assert.equal(looksWatchdogWarningRepairRequest(task), false);
  assert.equal(buildTaskTitleRepair(task), null);
});

test('watchdog improvement decisions are not retitled as soft-repair tasks', async () => {
  const {
    buildTaskTitleRepair,
    buildWatchdogRoutingRepair,
    isWatchdogImprovementDecision,
    looksWatchdogWarningRepairRequest,
  } = await loadSupervisor();
  const task = {
    id: 210,
    title: 'Add watchdog soft repair for obvious task warnings',
    notes: [
      'Decision resolved from dashboard comment: take whatever we need from the dormant family-app code and get rid of the rest.',
      'Original watchdog evidence/report: ops/system-audits/2026-06-09T05-56-15-092Z-watchdog-improvements.md',
    ].join('\n'),
    stage: 'assigned',
    category: 'technology',
    assigned_to: 'Codex',
    decision_required: false,
    source_context: {
      source: 'watchdog',
      audit: 'improvement',
      signature: 'watchdog-improvement-v1:legacy_family_runtime_surfaces',
    },
    ai_parsed: {
      kind: 'watchdog_improvement_decision',
      signature: 'watchdog-improvement-v1:legacy_family_runtime_surfaces',
      display_title: 'Decide how to handle dormant family-app code',
      original_text: 'Dormant Next/Supabase/Telegram family-app code paths still exist and can mislead future agents or become risky if reused.',
    },
  };

  assert.equal(isWatchdogImprovementDecision(task), true);
  assert.equal(looksWatchdogWarningRepairRequest(task), false);
  assert.equal(buildTaskTitleRepair(task), null);
  assert.equal(buildWatchdogRoutingRepair(task), null);
});

test('watchdog bridge profile check does not fail after startup log churn', async () => {
  const { inspectTelegramBridgeLock } = await loadSupervisor();
  const bridge = inspectTelegramBridgeLock();

  if (bridge.running) {
    assert.equal(bridge.expected_bot, 'bneineviimacademy_bot');
    assert.equal(bridge.bot_ok, true);
  } else {
    assert.equal(bridge.bot_ok, true);
  }
});

test('watchdog incident signature dedupes repeated findings but changes on new issues', async () => {
  const { watchdogIncidentSignature } = await loadSupervisor();
  const baseAudit = {
    severity: 'critical',
    findings: [
      {
        severity: 'critical',
        type: 'telegram_wrong_profile',
        message: 'Academy Telegram bridge identity is unclear.',
      },
    ],
  };
  const sameAudit = {
    severity: 'critical',
    findings: [
      {
        severity: 'critical',
        type: 'telegram_wrong_profile',
        message: 'Different wording should not create a new incident.',
      },
    ],
  };
  const changedAudit = {
    severity: 'critical',
    findings: [
      {
        severity: 'critical',
        type: 'machine_task_conflict',
        message: 'Multiple machine tasks are in progress.',
        task_ids: [192, 195],
      },
    ],
  };

  assert.equal(watchdogIncidentSignature(baseAudit, []), watchdogIncidentSignature(sameAudit, []));
  assert.notEqual(watchdogIncidentSignature(baseAudit, []), watchdogIncidentSignature(changedAudit, []));
});

test('watchdog treats Railway build progress states as non-alerting transient states', async () => {
  const { classifyRailwayDoctorResult } = await loadSupervisor();

  for (const status of ['INITIALIZING', 'BUILDING', 'DEPLOYING']) {
    const result = classifyRailwayDoctorResult({
      ok: true,
      stdout: `BNA Railway Doctor\nStatus: ${status}\nRailway doctor passed for skillful-motivation / production.`,
      stderr: '',
      command: 'npm run railway:doctor',
      code: 0,
      timedOut: false,
    });

    assert.equal(result.status, status);
    assert.equal(result.transient, true);
    assert.equal(result.warning, false);
    assert.equal(result.ok, true);
  }
});

test('watchdog still alerts on Railway failures and doctor command failures', async () => {
  const { classifyRailwayDoctorResult } = await loadSupervisor();
  const failedStatus = classifyRailwayDoctorResult({
    ok: true,
    stdout: 'BNA Railway Doctor\nStatus: FAILED\nRailway doctor passed for skillful-motivation / production.',
    stderr: '',
    command: 'npm run railway:doctor',
    code: 0,
    timedOut: false,
  });
  const commandFailure = classifyRailwayDoctorResult({
    ok: false,
    stdout: '',
    stderr: 'railway service status failed with exit code 1',
    command: 'npm run railway:doctor',
    code: 1,
    timedOut: false,
  });

  assert.equal(failedStatus.status, 'FAILED');
  assert.equal(failedStatus.warning, true);
  assert.equal(failedStatus.ok, false);
  assert.equal(commandFailure.warning, true);
  assert.equal(commandFailure.ok, false);
});

test('watchdog Telegram signature dedupes Railway progress states', async () => {
  const { watchdogIncidentSignature, watchdogNotificationSignature } = await loadSupervisor();
  const initializingAudit = {
    severity: 'warn',
    findings: [
      {
        severity: 'warn',
        type: 'railway_doctor_warning',
        message: 'Railway doctor reports INITIALIZING.',
        railway_status: 'INITIALIZING',
      },
    ],
  };
  const buildingAudit = {
    severity: 'warn',
    findings: [
      {
        severity: 'warn',
        type: 'railway_doctor_warning',
        message: 'Railway doctor reports BUILDING.',
        railway_status: 'BUILDING',
      },
    ],
  };

  assert.notEqual(watchdogIncidentSignature(initializingAudit, []), watchdogIncidentSignature(buildingAudit, []));
  assert.equal(watchdogNotificationSignature(initializingAudit, []), watchdogNotificationSignature(buildingAudit, []));
});

test('watchdog Telegram resolution signature is separate from active warning signature', async () => {
  const { watchdogNotificationSignature } = await loadSupervisor();
  const warningAudit = {
    severity: 'warn',
    findings: [
      {
        severity: 'warn',
        type: 'railway_doctor_warning',
        message: 'Railway doctor reports BUILDING.',
        railway_status: 'BUILDING',
      },
    ],
  };
  const okAudit = {
    severity: 'ok',
    findings: [],
  };
  const previousIncident = {
    signature: 'railway-building-incident',
    severity: 'warn',
    findings: warningAudit.findings,
  };

  assert.notEqual(
    watchdogNotificationSignature(warningAudit, [], 'active'),
    watchdogNotificationSignature(okAudit, [], 'resolved', previousIncident),
  );
});

test('watchdog improvement audit daily gate respects dry run and interval', async () => {
  const { watchdogImprovementShouldRun } = await loadSupervisor();
  const config = {
    watchdogImprovementAudit: true,
    watchdogImprovementIntervalMs: 24 * 60 * 60 * 1000,
  };
  const now = new Date('2026-06-09T12:00:00.000Z');

  assert.equal(watchdogImprovementShouldRun({}, config, {}, now), true);
  assert.equal(
    watchdogImprovementShouldRun({ improvements: { last_run_at: '2026-06-09T10:00:00.000Z' } }, config, {}, now),
    false,
  );
  assert.equal(
    watchdogImprovementShouldRun({ improvements: { last_run_at: '2026-06-09T10:00:00.000Z' } }, config, { dryRun: true }, now),
    true,
  );
  assert.equal(watchdogImprovementShouldRun({}, { ...config, watchdogImprovementAudit: false }, {}, now), false);
});

test('watchdog secret scan allowlists marked placeholders only', async () => {
  const {
    collectSecretEvidenceFromText,
    isAllowlistedSecretScanLine,
    isNonSensitiveSecretScanPlaceholder,
  } = await loadSupervisor();
  const marker = 'watchdog-secret-scan: allow-placeholder';
  const placeholderToken = `sk-${'x'.repeat(24)}`;
  const placeholderLine = `Example token ${placeholderToken} ${marker}`;
  const realLikeToken = `sk-${'Ab3Cd4Ef5Gh6Ij7Kl8Mn9Op0Qr1St'}`;
  const realLikeLine = `Captured token ${realLikeToken} ${marker}`;

  assert.equal(isNonSensitiveSecretScanPlaceholder(placeholderToken), true);
  assert.equal(isAllowlistedSecretScanLine(placeholderLine), true);
  assert.equal(collectSecretEvidenceFromText('fixture.md', placeholderLine), null);
  assert.equal(isAllowlistedSecretScanLine(realLikeLine), false);

  const evidence = collectSecretEvidenceFromText('fixture.md', realLikeLine);
  assert.equal(evidence.count, 1);
  assert.equal(evidence.file, 'fixture.md');
});

test('watchdog improvement audit stays quiet after stale docs and task filter drift are cleaned', async () => {
  const { collectWatchdogImprovementFindings } = await loadSupervisor();
  const findings = collectWatchdogImprovementFindings();
  const ids = new Set(findings.map((finding) => finding.id));

  assert.equal(ids.has('stale_legacy_docs'), false);
  assert.equal(ids.has('task_filter_visibility_drift'), false);
});

test('watchdog improvement selection dedupes an active decision with the same signature', async () => {
  const {
    selectWatchdogImprovementFindingsForCreation,
  } = await loadSupervisor();
  const finding = watchdogImprovementFixture();
  const activeTask = {
    id: 501,
    title: finding.decision_title,
    stage: 'needs_decision',
    ai_parsed: { signature: finding.signature },
  };

  const result = selectWatchdogImprovementFindingsForCreation(
    [finding],
    [activeTask],
    { improvements: { findings: {} } },
    { watchdogImprovementMaxDecisions: 5, watchdogImprovementDedupeMs: 14 * 24 * 60 * 60 * 1000 },
    new Date('2026-06-09T12:00:00.000Z'),
  );

  assert.equal(result.selected.length, 0);
  assert.equal(result.skipped.length, 1);
  assert.equal(result.skipped[0].reason, 'active_task');
  assert.equal(result.skipped[0].task_id, 501);
});

test('watchdog improvement decision payload creates an actionable Decisions item', async () => {
  const {
    buildWatchdogImprovementDecisionPayload,
  } = await loadSupervisor();
  const finding = watchdogImprovementFixture();
  const payload = buildWatchdogImprovementDecisionPayload(finding, 'ops/system-audits/example-watchdog-improvements.md');

  assert.equal(payload.stage, 'needs_decision');
  assert.equal(payload.decision_required, true);
  assert.equal(payload.assigned_to, 'Shloimie');
  assert.equal(payload.source, 'manual');
  assert.equal(payload.created_by, 'watchdog');
  assert.equal(payload.ai_parsed.kind, 'watchdog_improvement_decision');
  assert.equal(payload.ai_parsed.signature, finding.signature);
  assert.equal(Array.isArray(payload.ai_parsed.options), true);
  assert.equal(Boolean(payload.ai_parsed.options[0].patch), true);
});
