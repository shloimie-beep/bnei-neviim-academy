const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const {
  ONE_TIME_ACTION_STATES,
  ONE_TIME_BUTTON_CONTRACTS,
  getOneTimeButtonState,
  isOneTimeExternalWriteAction,
  getOneTimeBlockedReason,
  getOneTimeActionDisplay,
  assertOneTimeButtonContractCoverage,
} = require('../src/platform/instances/one-time-action-state-contract');

const requiredProductControls = [
  ['Add Member / Invite User', 'one_time.workspace_user.invite_no_send'],
  ['Assign Role', 'one_time.workspace_user.assign_role'],
  ['Deactivate / Reactivate / Remove Membership', 'one_time.workspace_user.lifecycle'],
  ['Add Task', 'one_time.tasks.add'],
  ['Create Decision', 'one_time.decisions.create'],
  ['Add Class', 'one_time.class_package.create'],
  ['Add Session', 'one_time.classroom.assignment.create'],
  ['Add Appointment setup', 'one_time.appointment.setup_task'],
  ['Save / Attach Vimeo Video', 'one_time.class_package.attach_vimeo'],
  ['Preview Upload', 'one_time.class_package.preview_upload'],
  ['Approve', 'one_time.member_library.approve'],
  ['Publish', 'one_time.member_library.publish'],
  ['Unpublish / Restore Latest', 'one_time.member_library.rollback'],
  ['Retry setup', 'one_time.recording.retry_setup'],
  ['Post Rabbi Thread', 'one_time.classroom.thread.create'],
  ['Approve / Feature / Parent Hold / Reject', 'one_time.classroom.message.review'],
  ['Configure Integration', 'one_time.integrations.configure'],
  ['Test Connection', 'one_time.integrations.test_connection'],
  ['Create Draft', 'one_time.communications.create_draft'],
  ['View Evidence', 'one_time.agent_run.view_evidence'],
  ['Archive / Restore', 'one_time.tasks.archive_restore'],
];

const requiredRegistryHooks = [
  ['Ask / Search', 'ACTION-OPERATIONS-HELPER-OPEN'],
  ['View One Time as Rabbi', 'ACTION-ONETIME-WORKSPACE-VIEW'],
  ['Create automation with helper', 'ACTION-HELPER-CREATE-AUTOMATION'],
  ['Preview Drive Brief', 'ACTION-ONETIME-DRIVE-BRIEF-PREVIEW'],
  ['Package Preview', 'preview_one_time_member_library_publish_package'],
  ['Run Smoke', 'ACTION-ONETIME-MEMBER-LIBRARY-SMOKE'],
  ['Preview Package', 'ACTION-ONETIME-CLASS-PACKAGE-PREVIEW'],
  ['Member Preview', 'ACTION-ONETIME-MEMBER-LIBRARY-PREVIEW'],
  ['Approve', 'ACTION-ONETIME-MEMBER-LIBRARY-APPROVE'],
  ['Publish', 'ACTION-ONETIME-MEMBER-LIBRARY-PUBLISH'],
  ['Rollback Latest', 'ACTION-ONETIME-MEMBER-LIBRARY-ROLLBACK'],
  ['Dry-run send', 'ACTION-ONETIME-LIVE-ZOOM-LINK-DRY-RUN'],
  ['Send links', 'ACTION-ONETIME-LIVE-ZOOM-LINK-SEND'],
  ['Generate Access Code', 'ACTION-PARENT-ACCESS-CODE-GENERATE'],
  ['Open Parent Portal', 'ACTION-PARENT-ACCESS-LINK-OPEN'],
  ['Email Login Link', 'ACTION-PARENT-ACCESS-LINK-EMAIL'],
  ['WhatsApp Login Link', 'ACTION-PARENT-ACCESS-LINK-WHATSAPP'],
  ['Preview Password Setup', 'ACTION-PARENT-PASSWORD-SETUP-PREVIEW'],
  ['Email Password Setup', 'ACTION-PARENT-PASSWORD-SETUP-SEND'],
];

function stateKeys() {
  return new Set(Object.values(ONE_TIME_ACTION_STATES).map((state) => state.key));
}

test('every required One Time product control and registry hook has a complete contract', () => {
  const summary = assertOneTimeButtonContractCoverage();
  assert.equal(summary.ok, true);
  assert.equal(summary.product_controls, requiredProductControls.length);
  assert.equal(summary.registry_hook_controls, requiredRegistryHooks.length);

  for (const [label, key] of [...requiredProductControls, ...requiredRegistryHooks]) {
    const item = ONE_TIME_BUTTON_CONTRACTS[key];
    assert.ok(item, `${label} (${key}) missing`);
    assert.equal(item.external_write_performed, false, `${key} must never perform a direct external write`);
    assert.ok(item.label, `${key} label missing`);
    assert.ok(item.action_key || item.action_id, `${key} action key/id missing`);
    assert.ok(stateKeys().has(item.ui_state), `${key} has unsupported state ${item.ui_state}`);
    assert.ok(item.click_outcome, `${key} click outcome missing`);
    assert.ok(item.handler, `${key} handler/API/helper route missing`);
    assert.ok(Array.isArray(item.expected_tests) && item.expected_tests.length > 0, `${key} expected tests missing`);
  }
});

test('external and app-visible write actions are gated and never direct live actions', () => {
  const externalActions = Object.values(ONE_TIME_BUTTON_CONTRACTS).filter((item) => item.external_write_action);
  assert.ok(externalActions.length >= 7);

  for (const item of externalActions) {
    assert.equal(isOneTimeExternalWriteAction(item.action_key), true, `${item.action_key} should be classified external/app-visible`);
    assert.equal(item.external_write_performed, false, `${item.action_key} performed an external write`);
    assert.equal(item.direct_live_action, false, `${item.action_key} must not be a direct live action`);
    assert.equal(item.approval_gated, true, `${item.action_key} missing approval gate`);
    assert.ok(item.confirmation_gate, `${item.action_key} must name the exact confirmation/gate`);
    assert.notEqual(getOneTimeButtonState(item.action_key), ONE_TIME_ACTION_STATES.READY.key, `${item.action_key} must not default to Ready`);
    assert.match(`${item.click_outcome} ${item.disabled_blocker_message}`, /approval|confirm|gate|SEND_|APPROVE_|dry-run|rollback|tier/i);
  }
});

test('no required action defaults to unknown or dead behavior', () => {
  for (const [, key] of [...requiredProductControls, ...requiredRegistryHooks]) {
    const display = getOneTimeActionDisplay(key);
    assert.ok(stateKeys().has(display.ui_state), `${key} returned unknown state`);
    assert.doesNotMatch(display.state_label, /unknown|dead/i);
    assert.doesNotMatch(display.click_outcome, /unknown|dead/i);
    assert.ok(display.label);
    assert.ok(display.disabled_blocker_message || display.click_outcome);
  }

  const unknown = getOneTimeActionDisplay('one_time.unregistered.live_button');
  assert.equal(unknown.ui_state, ONE_TIME_ACTION_STATES.BLOCKED_EXTERNAL_SETUP.key);
  assert.equal(unknown.disabled, true);
  assert.match(unknown.disabled_blocker_message, /No One Time button\/action contract/);
  assert.equal(isOneTimeExternalWriteAction('one_time.unregistered.live_button'), false);
});

test('registry coverage remains compatible with present registry rows', () => {
  const rootRegistry = JSON.parse(fs.readFileSync('ops/action-registry.json', 'utf8'));
  const detailedRegistry = JSON.parse(fs.readFileSync('ops/action-registry/actions.json', 'utf8'));
  const summary = assertOneTimeButtonContractCoverage({ rootRegistry, detailedRegistry });

  assert.equal(summary.ok, true);
  assert.ok(summary.registry_rows_checked >= 4);
  assert.ok(Array.isArray(summary.registry_rows_without_contracts));

  const presentRequestedHooks = requiredRegistryHooks
    .map(([, key]) => key)
    .filter((key) => JSON.stringify(rootRegistry).includes(key) || JSON.stringify(detailedRegistry).includes(key));
  for (const key of presentRequestedHooks) {
    assert.ok(ONE_TIME_BUTTON_CONTRACTS[key], `${key} is present in registry but missing contract`);
  }
});

test('preview-only and internal support controls state no-write and hideability rules', () => {
  for (const item of Object.values(ONE_TIME_BUTTON_CONTRACTS)) {
    if (item.preview_only) {
      assert.equal(item.external_write_performed, false);
      assert.match(item.click_outcome, /no .*write|no-write|dry[_ -]?run|without (?:changing|publishing|sending|writing)|preview/i, `${item.action_key} must say preview/no-write`);
    }
    if (item.internal_support_only) {
      assert.equal(item.hide_from_rabbi_owner_view, true, `${item.action_key} internal support action must be hideable`);
      const display = getOneTimeActionDisplay(item.action_key, { viewer_role: 'rabbi_owner' });
      assert.equal(display.hidden, true, `${item.action_key} should hide from Rabbi owner view`);
      assert.match(getOneTimeBlockedReason(item.action_key, { viewer_role: 'rabbi_owner' }), /hide this from Rabbi owner view/i);
    }
  }
});

test('no-send no-charge no-Zoom no-Vimeo guardrails remain true', () => {
  for (const item of Object.values(ONE_TIME_BUTTON_CONTRACTS)) {
    assert.equal(item.no_send, true, `${item.action_key} send guardrail failed`);
    assert.equal(item.no_charge, true, `${item.action_key} charge guardrail failed`);
    assert.equal(item.no_zoom_mutation, true, `${item.action_key} Zoom guardrail failed`);
    assert.equal(item.no_vimeo_mutation, true, `${item.action_key} Vimeo guardrail failed`);
    assert.equal(item.external_write_performed, false, `${item.action_key} must keep external_write_performed=false`);
  }

  const serialized = JSON.stringify(ONE_TIME_BUTTON_CONTRACTS);
  assert.doesNotMatch(serialized, /uploadToVimeo|createZoomMeeting|zoom\.us\/v2|api\.vimeo\.com|stripe\.charges|createCharge|chargeCustomer/i);
});
