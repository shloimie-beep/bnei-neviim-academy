const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {
  hasContactLeadPipelineBuildIntent,
} = require('../src/lib/bna/telegram-contact-lead-capture');
const {
  hasPromptPlanningIntent,
} = require('../src/lib/bna/telegram-planning-intent');

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

function loadServerTaskRouting() {
  const server = read('server.js');
  const start = server.indexOf('function isSpeakerDiarizationText');
  const end = server.indexOf('function normalizeTaskAssignee', start);
  assert.ok(start > 0 && end > start, 'server task-routing functions should be found');
  const sandbox = {
    hasContactLeadPipelineBuildIntent,
    hasInterestedParentLeadCaptureIntent: () => false,
    hasPromptPlanningIntent,
    inferProjectKeyFromText: () => 'bna',
  };
  vm.runInNewContext(`${server.slice(start, end)}
result = { inferTaskCategory, inferTaskOwner, parseRambleIntoTaskCandidates, polishTaskCandidateText, shouldOverrideRequestedTaskCategory };`, sandbox);
  return sandbox.result;
}

function loadServerProjectRouting() {
  const server = read('server.js');
  const start = server.indexOf('function normalizeProjectKey');
  const end = server.indexOf('async function upsertProject', start);
  assert.ok(start > 0 && end > start, 'server project-routing functions should be found');
  const sandbox = {};
  vm.runInNewContext(`const DEFAULT_PROJECT_KEY = 'bna';
const ONE_TIME_PROJECT_KEY = 'one_time_mishnah_class';
${server.slice(start, end)}
result = { inferProjectKeyFromText, normalizeProjectKey };`, sandbox);
  return sandbox.result;
}

test('contact pipeline and source-sheet rambles have separate routing cues', () => {
  const server = read('server.js');
  const leadCapture = read('src/lib/bna/telegram-contact-lead-capture.js');
  const operations = read('public/operations.html');

  assert.match(leadCapture, /parents\? \(\?:that are \)\?interested/);
  assert.match(leadCapture, /pipeline created from contacts/);
  assert.match(server, /Build interested-parent pipeline in Contacts/);
  assert.match(server, /Build source-sheet research workflow for student questions/);
  assert.match(server, /Clarify Signup Intake in Contacts/);
  assert.match(server, /hasInterestedParentLeadCaptureIntent\(text\) && !hasContactLeadPipelineBuildIntent\(text\)/);
  assert.match(operations, /const RESEARCH_TASK_CATEGORIES = new Set/);
  assert.match(operations, /const TASK_LANE_IDS = \['decisions', 'pending', 'tasks', 'schedule', 'done', 'activity'\]/);
  assert.match(operations, /\{ id: 'agent_working', label: 'Agent Working' \}/);
  assert.doesNotMatch(operations, /waiting_shloimie|waiting_sheller|waiting_access|Ready for Codex/);
  assert.match(operations, /\{ id: 'intake', label: 'Signup Intake' \}/);
});

test('generic BNA source-sheet work does not route to One Time Mishnah project', () => {
  const { inferProjectKeyFromText } = loadServerProjectRouting();

  assert.equal(
    inferProjectKeyFromText('Generate Sefaria source sheets from every class transcript'),
    'bna'
  );
  assert.equal(
    inferProjectKeyFromText('Build student source sheet task from the BNA class recording'),
    'bna'
  );
  assert.equal(
    inferProjectKeyFromText('Rabbi Elie Scheller source sheet for the One Time Mishnah class'),
    'one_time_mishnah_class'
  );
});

test('project backfill does not rewrite explicit BNA source-sheet tasks', () => {
  const server = read('server.js');
  const start = server.indexOf('async function ensureDefaultProjects');
  const end = server.indexOf('return { bna, oneTime };', start);
  assert.ok(start > 0 && end > start, 'ensureDefaultProjects should be found');
  const block = server.slice(start, end);

  assert.match(block, /project_id IS NULL\s+AND \(/);
  assert.doesNotMatch(block, /category IN \('torah_class_prep', 'source_sheets'/);
  assert.ok(
    block.indexOf("category IN ('torah_class_prep', 'shiur_ideas', 'community_setup', 'community')") <
      block.lastIndexOf('WHERE project_id IS NULL'),
    'One Time backfill should run before the default BNA backfill'
  );
});

test('routing/system tasks with source-sheet wording do not become Torah Research', () => {
  const { inferTaskCategory, shouldOverrideRequestedTaskCategory } = loadServerTaskRouting();
  const text = [
    'Route task and student recordings outside Content',
    "The research section should have the sources that are coming to make worksheets for the kids.",
    'The boys asked about fasting and Shabbat, and I want source sheets for those class questions.',
    'Also check why the pipeline task did not get done and why student recordings are still in Content.',
  ].join('\n');

  assert.equal(inferTaskCategory(text), 'operations');
  assert.equal(shouldOverrideRequestedTaskCategory('torah_research', 'operations', text), true);
});

test('source-sheet workflow and explicit halacha research stay distinct', () => {
  const { inferTaskCategory } = loadServerTaskRouting();

  assert.equal(
    inferTaskCategory('Build source-sheet research workflow for student questions. The research section should have Sefaria sources for worksheets.'),
    'source_sheets'
  );
  assert.equal(
    inferTaskCategory('Research the halacha question of fasting on Shabbos and bring Sefaria sources.'),
    'torah_research'
  );
});

test('comment requeue rambles become clean Codex operations tasks', () => {
  const { inferTaskCategory, inferTaskOwner, parseRambleIntoTaskCandidates, polishTaskCandidateText } = loadServerTaskRouting();
  const text = [
    'I keep adding comments right now.',
    'Make sure these comments when I push that button go back into the queue.',
    'They need to be ingested again and dealt with.',
    'Tell Codex to check the comments and make sure those buttons are working.',
  ].join(' ');

  assert.equal(inferTaskCategory(text), 'operations');
  assert.equal(inferTaskOwner(text), 'Codex');
  assert.equal(polishTaskCandidateText(text), 'Requeue commented tasks for Codex review');
  const candidates = parseRambleIntoTaskCandidates(text);
  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].title, 'Requeue commented tasks for Codex review');
  assert.equal(candidates[0].category, 'operations');
  assert.equal(candidates[0].assigned_to, 'Codex');
});

test('direct chat correction does not become a Codex dashboard task', () => {
  const { parseRambleIntoTaskCandidates } = loadServerTaskRouting();
  const text = "No dude I don't want to speak to codex I want to speak to you I didn't want you to file that for codex no I want you to be aren't you able to give me that right now can't you do that for me put that text together so I can just paste it in";

  assert.equal(parseRambleIntoTaskCandidates(text).length, 0);
});

test('research section requests from uploaded content become source-sheet workflow tasks', () => {
  const { inferTaskCategory, inferTaskOwner, parseRambleIntoTaskCandidates, polishTaskCandidateText } = loadServerTaskRouting();
  const text = [
    'In terms of all the topics that were discussing in the content being uploaded,',
    'the research section needs to be developed.',
    'The research section should bring all the sources and source sheets with links to Safari.',
    'Not just questions; any topic that can be sourced should be sourced from recordings and expanded upon.',
  ].join(' ');

  assert.equal(inferTaskCategory(text), 'source_sheets');
  assert.equal(inferTaskOwner(text), 'Codex');
  assert.equal(polishTaskCandidateText(text), 'Expand Research section to source all class topics');
  const candidates = parseRambleIntoTaskCandidates(text);
  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].title, 'Expand Research section to source all class topics');
  assert.equal(candidates[0].category, 'source_sheets');
  assert.equal(candidates[0].assigned_to, 'Codex');
});

test('person detail side-menu requests do not become recording parser tasks', () => {
  const { inferTaskCategory, inferTaskOwner, parseRambleIntoTaskCandidates, polishTaskCandidateText } = loadServerTaskRouting();
  const text = [
    'Within each student and within each parent all the different categories should have a separate drop-down on the side.',
    'When you open up that specific student, the student section should have all of the categories in a drop-down and load one by default.',
    'The same should be true for contacts, parents, and users.',
    'Build a nice custom dropdown menu for all the sections within that person and organize the buttons neatly.',
  ].join(' ');

  assert.equal(inferTaskCategory(text), 'technology');
  assert.equal(inferTaskOwner(text), 'Codex');
  assert.equal(polishTaskCandidateText(text), 'Build person-detail side menus for students, parents, contacts, and users');
  const candidates = parseRambleIntoTaskCandidates(text);
  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].title, 'Build person-detail side menus for students, parents, contacts, and users');
  assert.equal(candidates[0].category, 'technology');
  assert.equal(candidates[0].assigned_to, 'Codex');
});

test('WhatsApp parser cleanup rambles become Codex operations tasks', () => {
  const { inferTaskCategory, inferTaskOwner, parseRambleIntoTaskCandidates, polishTaskCandidateText } = loadServerTaskRouting();
  const text = [
    'Fix up the parsing mechanism for WhatsApp posts.',
    'I do not need to see the WhatsApp post automatically in Telegram after I load something up, so we can get rid of that.',
    'Tasks I record myself saying are ending up in WhatsApp posts.',
    'Technical backend corrections should go to decisions or tasks for Codex, not into the content section.',
  ].join(' ');

  assert.equal(inferTaskCategory(text), 'operations');
  assert.equal(inferTaskOwner(text), 'Codex');
  assert.equal(polishTaskCandidateText(text), 'Fix recording parser routing for WhatsApp drafts and tasks');
  const candidates = parseRambleIntoTaskCandidates(text);
  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].title, 'Fix recording parser routing for WhatsApp drafts and tasks');
  assert.equal(candidates[0].category, 'operations');
  assert.equal(candidates[0].assigned_to, 'Codex');
});

test('decision lead-in fragments are dropped while the real legacy CRM decision is kept', () => {
  const { parseRambleIntoTaskCandidates } = loadServerTaskRouting();
  const text = [
    "How hard is it to actually build like a classroom module that just looks just like Google isn't that like easy",
    "and the same thing in terms of like the calendar right I saw one of the calendars wasn't loading nicely",
    "but I'm guessing it just wasn't smoke tested so just make sure that Mark this down also that everything is going to play right you know tested",
    'that the whole UI is like screenshots and we are really looking into it so everything goes nicely so everything loads nicely if we can make everything internal that would be best',
    'another thing that I need you to put into I guess a like a decision',
    "I need to make is regarding the email oh no now we're going to be using legacy CRM I'm just really need a scope out whether legacy CRM is still necessary",
    'and we could just do every module kind of separately on our own like can we just get some sort of classroom',
    'is there like some public GitHub for like a classroom set up',
    'if we could just do everything with API access then it make more sense than actually just using legacy CRM',
    'if we could just have different moving Parts by us either building them out from files and GitHub or from signing up for separate pieces',
    'that would be maybe more worth it than using legacy CRM if we have more ability to do Integrations',
    'so that would be like a decision at a brainstorm you need to make',
  ].join(' ');

  const candidates = parseRambleIntoTaskCandidates(text);
  assert.equal(
    candidates.some((candidate) => /another thing.*put.*decision/i.test(candidate.title)
      || /another thing.*put.*decision/i.test(candidate.original_text)),
    false
  );

  const ghlDecision = candidates.find((candidate) => /legacy CRM/i.test(candidate.title));
  assert.ok(ghlDecision, 'the legacy CRM decision should still be captured');
  assert.equal(ghlDecision.title, 'Decide whether to keep using legacy CRM');
  assert.equal(ghlDecision.stage, 'needs_decision');
  assert.equal(ghlDecision.decision_required, true);
  assert.equal(ghlDecision.assigned_to, 'Shloimie');
  assert.equal(ghlDecision.category, 'community_setup');
});
