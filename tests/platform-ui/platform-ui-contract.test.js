const assert = require('node:assert/strict');
const test = require('node:test');

const fixtures = require('../../public/js/platform-ui/platform-ui-fixtures');
const platformUi = require('../../public/js/platform-ui/platform-ui');

test('W2 fixture exposes the frozen shell view-model contracts', () => {
  for (const workspaceId of ['bna', 'one_time']) {
    const state = platformUi.createInitialState(fixtures, { workspaceId });
    assert.ok(state.shell.activeInstance.id);
    assert.ok(state.shell.activeWorkspace.id);
    assert.ok(Array.isArray(state.shell.authorizedWorkspaces));
    assert.ok(state.shell.activeRole);
    assert.ok(state.shell.brand.accent);
  }
});

test('BNA workspace shows school modules while One Time hides school-only modules', () => {
  const bna = platformUi.createInitialState(fixtures, { workspaceId: 'bna' });
  const oneTime = platformUi.createInitialState(fixtures, { workspaceId: 'one_time' });

  const bnaKeys = platformUi.visibleModuleDefinitions(bna.shell, fixtures).map((module) => module.key);
  const oneTimeKeys = platformUi.visibleModuleDefinitions(oneTime.shell, fixtures).map((module) => module.key);

  for (const key of [
    'overview',
    'members',
    'students',
    'service_providers',
    'community',
    'courses',
    'course_builder',
    'lesson_video',
    'tasks',
    'decisions',
    'calendar',
    'goals_rewards',
    'prompt_queue',
    'agents',
    'automations',
    'integrations',
    'settings',
  ]) {
    assert.ok(bnaKeys.includes(key), `BNA should include ${key}`);
  }

  assert.ok(oneTimeKeys.includes('members'));
  assert.ok(oneTimeKeys.includes('community'));
  assert.ok(oneTimeKeys.includes('courses'));
  assert.ok(oneTimeKeys.includes('integrations'));
  assert.equal(oneTimeKeys.includes('students'), false);
  assert.equal(oneTimeKeys.includes('service_providers'), false);
  assert.equal(oneTimeKeys.includes('prompt_queue'), false);
});

test('module cards follow ModuleCardViewModel shape', () => {
  const state = platformUi.createInitialState(fixtures, { workspaceId: 'bna' });
  const cards = platformUi.deriveModuleCards(state.shell, state.data, fixtures);
  assert.ok(cards.length >= 12);
  for (const card of cards) {
    assert.ok(card.key);
    assert.ok(card.label);
    assert.ok(['active', 'empty'].includes(card.status));
    assert.ok(['visible', 'hidden'].includes(card.visibility));
    assert.equal(typeof card.primaryMetric, 'number');
    assert.ok(card.secondaryMetric);
    assert.ok(card.actionState);
  }
});

test('local form flows validate and record expected events without backend writes', () => {
  let state = platformUi.createInitialState(fixtures, { workspaceId: 'one_time' });
  assert.deepEqual(platformUi.validateMember({ name: '', role: '', email: 'bad' }), {
    name: 'Name is required',
    role: 'Role is required',
    email: 'Email is required',
  });

  state = platformUi.submitMember(state, {
    name: 'New Member',
    role: 'Member',
    email: 'new-member@example.test',
  });
  assert.equal(state.data.members[0].name, 'New Member');
  assert.equal(state.eventLog[0].type, 'membership.changed');

  state = platformUi.submitCommunity(state, {
    name: 'Alumni Circle',
    visibility: 'Members only',
    owner: 'Rabbi Elie Scheller',
    groups: '2',
  });
  assert.equal(state.data.communities[0].name, 'Alumni Circle');
  assert.equal(state.eventLog[0].type, 'community.created');

  state = platformUi.submitCourse(state, {
    title: 'Pirkei Avos Track',
    visibility: 'Library and live members',
    enrollment_rule: 'Paid or manually granted access',
  });
  assert.equal(state.data.courses[0].title, 'Pirkei Avos Track');
  assert.equal(state.eventLog[0].type, 'course.created');
});

test('video, reward, and integration flows preserve privacy gates', () => {
  let state = platformUi.createInitialState(fixtures, { workspaceId: 'bna' });
  state = platformUi.submitVideoAttachment(state, {
    lesson_id: 'lesson-2',
    video_asset_id: 'video-bna-1',
    visibility: 'BNA',
  }, fixtures.videoAssets);
  const course = state.data.courses.find((item) => item.id === 'course-bna-01');
  assert.equal(course.lessons.find((lesson) => lesson.id === 'lesson-2').status, 'ready');
  assert.equal(state.eventLog[0].type, 'lesson.video.attached');

  state = platformUi.submitRewardAssignment(state, {
    reward_id: 'reward-1',
    assigned: 'Student Alpha',
  });
  assert.equal(state.data.rewards.find((reward) => reward.id === 'reward-1').state, 'assigned');

  state = platformUi.testIntegration(state, 'google');
  const google = state.data.integrations.find((integration) => integration.id === 'google');
  assert.equal(google.secret, '[redacted]');
  assert.equal(state.eventLog[0].type, 'integration.readiness.checked');
});

test('renderer includes required W2 surfaces and no raw secret text', () => {
  const state = platformUi.createInitialState(fixtures, { workspaceId: 'bna', moduleKey: 'overview' });
  const html = platformUi.renderApp(state, fixtures);
  for (const label of [
    'Overview',
    'Members',
    'Students',
    'Service Providers',
    'Community',
    'Courses',
    'Course Builder',
    'Lesson Video',
    'Content / Research',
    'Tasks',
    'Decisions',
    'Calendar',
    'Goals / Rewards',
    'Prompt/Ramble Queue',
    'Agents',
    'Automations',
    'Integrations',
    'Settings',
  ]) {
    assert.match(html, new RegExp(label.replace('/', '\\/')));
  }
  assert.doesNotMatch(html, /api[_-]?key|password|secret.+[A-Za-z0-9]{16,}/i);
});

test('adapter manifest records shared endpoint and event names for Prompt 05', () => {
  for (const eventName of [
    'workspace.changed',
    'community.created',
    'course.created',
    'lesson.video.attached',
    'integration.readiness.checked',
    'ui.prompt_queue.opened',
  ]) {
    assert.ok(platformUi.EVENT_NAMES.includes(eventName), `missing ${eventName}`);
  }
  assert.match(platformUi.INTEGRATION_ENDPOINTS.shell, /platform-shell-view-model/);
  assert.match(platformUi.INTEGRATION_ENDPOINTS.integrations, /platform-integrations\/readiness/);
});
