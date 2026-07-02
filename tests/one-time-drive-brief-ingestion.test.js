const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const {
  LATEST_ONE_TIME_DRIVE_BRIEF_SOURCE,
  ONE_TIME_PROJECT_KEY,
  ONE_TIME_WORKSPACE_KEY,
  assertOneTimeScopedPreview,
  buildOneTimeDriveBriefIngestionPreview,
  oneTimeOwnerAssignments,
  sourceKeyForBrief,
} = require('../src/lib/bna/one-time-drive-brief');

const serverJs = fs.readFileSync('server.js', 'utf8');
const operationsHtml = fs.readFileSync('public/operations.html', 'utf8');

const SAMPLE_BRIEF = `
# 2026-06-18 Rabbi Elie Scheller / One Time Meeting

## Account And Access Checklist
| Account | Current state | Needed decision |
| --- | --- | --- |
| Zoom | Owner-only app setup needed | Verify Shloimie role and Server-to-Server OAuth path |
| Vimeo | Manual library may be needed first | Decide token/app owner |
| Resend | Sender domain undecided | Choose recovery, new account, or alternate provider |

## Thirty-Day Timeline
| Date | Workstream | Owner |
| --- | --- | --- |
| 2026-06-19 | Verify Zoom, Vimeo, and Stripe access | Rabbi Elie + Shloimie |
| 2026-06-20 | Decide DNS and Resend account path | Rabbi Elie + Shloimie |

## Product And Launch Decisions
Confirm Worldwide Mishnayos positioning, live format, first offer, video guardrails,
and moderated question flow before launch.
`;

function allRecords(preview) {
  return Object.values(preview.records).flatMap((value) => Array.isArray(value) ? value : []);
}

test('One Time Drive brief preview is scoped, idempotent, and no-write', () => {
  const preview = buildOneTimeDriveBriefIngestionPreview({
    text: SAMPLE_BRIEF,
    source: LATEST_ONE_TIME_DRIVE_BRIEF_SOURCE,
    fetched_at: '2026-06-19T00:00:00.000Z',
  });

  assert.equal(preview.dry_run, true);
  assert.equal(preview.external_write_performed, false);
  assert.equal(preview.acceptance.production_mutation_performed, false);
  assert.equal(preview.routing.project_key, ONE_TIME_PROJECT_KEY);
  assert.equal(preview.routing.workspace_key, ONE_TIME_WORKSPACE_KEY);
  assert.equal(preview.routing.default_bna_workspace_allowed, false);
  assert.equal(preview.source.raw_text_committed_to_git, false);
  assert.equal(preview.source_tables_detected.account_access_rows, 3);
  assert.equal(preview.source_tables_detected.timeline_rows, 2);
  assert.equal(preview.counts.decisions, 17);
  assert.equal(preview.counts.integration_items, 9);
  assert.equal(preview.acceptance.no_secrets_in_output, true);
  assertOneTimeScopedPreview(preview);

  for (const record of allRecords(preview)) {
    assert.equal(record.project_key, ONE_TIME_PROJECT_KEY);
    assert.equal(record.workspace_key, ONE_TIME_WORKSPACE_KEY);
    assert.equal(record.external_write_performed, false);
    assert.ok(record.record_key);
  }

  const secondPreview = buildOneTimeDriveBriefIngestionPreview({
    text: SAMPLE_BRIEF,
    source: LATEST_ONE_TIME_DRIVE_BRIEF_SOURCE,
    fetched_at: '2026-06-19T00:01:00.000Z',
  });
  assert.equal(secondPreview.idempotency.source_key, preview.idempotency.source_key);
  assert.deepEqual(
    allRecords(secondPreview).map((record) => record.record_key),
    allRecords(preview).map((record) => record.record_key)
  );
  assert.equal(sourceKeyForBrief(LATEST_ONE_TIME_DRIVE_BRIEF_SOURCE, SAMPLE_BRIEF), preview.idempotency.source_key);
});

test('One Time Drive brief creates exact credential and owner Decisions without active GHL runtime', () => {
  const preview = buildOneTimeDriveBriefIngestionPreview({ text: SAMPLE_BRIEF });
  const titles = preview.records.decisions.map((decision) => decision.title);
  assert.ok(titles.some((title) => /Zoom owner role/i.test(title)));
  assert.ok(titles.some((title) => /Vimeo seat/i.test(title)));
  assert.ok(titles.some((title) => /Resend recovery/i.test(title)));
  assert.ok(titles.some((title) => /DNS authority/i.test(title)));
  assert.ok(titles.some((title) => /Stripe role/i.test(title)));

  const emailProvider = preview.records.integration_items.find((item) => item.integration_type === 'email_provider_decision');
  assert.equal(emailProvider.active_runtime, false);
  assert.match(emailProvider.title, /Google\/email provider readiness gate/);

  const decision = preview.records.decisions.find((item) => item.item_key === 'email_provider_decision');
  assert.match(decision.notes, /mentions GHL historically/);
  assert.match(decision.notes, /active runtime remains first-party BNA/);
});

test('One Time owner assignments put Rabbi Elie as Owner and Shloimie as Admin', () => {
  assert.deepEqual(oneTimeOwnerAssignments(), [
    {
      person_name: 'Rabbi Elie Scheller',
      role: 'project owner',
      access_level: 'owner',
      workspace_key: ONE_TIME_WORKSPACE_KEY,
      project_key: ONE_TIME_PROJECT_KEY,
    },
    {
      person_name: 'Shloimie',
      role: 'project admin',
      access_level: 'admin',
      workspace_key: ONE_TIME_WORKSPACE_KEY,
      project_key: ONE_TIME_PROJECT_KEY,
    },
  ]);
  assert.match(serverJs, /Rabbi Elie Scheller'[\s\S]*role: 'project owner'[\s\S]*access_level: 'owner'/);
  assert.match(serverJs, /Shloimie'[\s\S]*role: 'project admin'[\s\S]*access_level: 'admin'/);
});

test('server and Operations expose no-write One Time Drive brief preview controls', () => {
  assert.match(serverJs, /one-time-drive-brief\/preview/);
  assert.match(serverJs, /buildOneTimeDriveBriefIngestionPreview/);
  assert.match(serverJs, /assertOneTimeScopedPreview\(preview\)/);
  assert.match(operationsHtml, /previewOneTimeDriveBrief/);
  assert.match(operationsHtml, /data-preview-one-time-drive-brief/);
  assert.match(operationsHtml, /data-one-time-drive-brief-preview/);
  assert.match(operationsHtml, /No-write Drive Brief Preview/);
  assert.match(operationsHtml, /role: 'project owner'/);
  assert.match(operationsHtml, /access_level: 'owner'/);
});
