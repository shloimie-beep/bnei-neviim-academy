const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const operationsHtml = fs.readFileSync('public/operations.html', 'utf8');
const studentHtml = fs.readFileSync('public/student.html', 'utf8');
const server = fs.readFileSync('server.js', 'utf8');
const supervisor = fs.readFileSync('scripts/agent-fleet-supervisor.mjs', 'utf8');

test('Content jobs and class sessions are explicitly scoped by active workspace project', () => {
  assert.match(operationsHtml, /function contentDataProjectFilters/);
  assert.match(operationsHtml, /projectKeyForWorkspaceKey\(workspaceKey\)/);
  assert.match(operationsHtml, /const contentFilters = contentDataProjectFilters\(\);/);
  assert.match(operationsHtml, /api\.getContentJobs\(contentFilters\)/);
  assert.match(operationsHtml, /api\.getClassSessions\(contentFilters\)/);
  assert.match(server, /const requestedProjectKey = normalizeProjectKey\(req\.query\.project_key \|\| req\.query\.project \|\| ''\);/);
  assert.match(server, /conditions\.push\(`COALESCE\(p\.project_key, '\$\{DEFAULT_PROJECT_KEY\}'\) = \$/);
  assert.match(server, /SELECT cs\.\*,[\s\S]*p\.project_key,[\s\S]*row_to_json\(j\.\*\) AS content_job/);
  assert.match(server, /COALESCE\(p\.project_key, '\$\{DEFAULT_PROJECT_KEY\}'\) = \$/);
});

test('Content dashboard exposes a Research subtab backed by class sessions', () => {
  assert.match(operationsHtml, /\{ id: 'research', label: 'Research' \}/);
  assert.match(operationsHtml, /getClassSessions\(filters = \{\}\)/);
  assert.match(operationsHtml, /if \(filters\.project_key\) params\.set\('project_key', filters\.project_key\);/);
  assert.match(operationsHtml, /needsContentData \? api\.getClassSessions\(contentFilters\)/);
  assert.match(operationsHtml, /classSessions = classSessionsRes\.value\.sessions/);
  assert.match(operationsHtml, /function renderContentResearchPanel/);
  assert.match(operationsHtml, /function renderContentResearchCard/);
});

test('BNA admin prompt library renders prompt_text from the content prompt API', () => {
  assert.match(operationsHtml, /data-bna-admin-prompt-library/);
  assert.match(operationsHtml, /data-content-prompt-count/);
  assert.match(operationsHtml, /async function refreshContentPromptLibrary/);
  assert.match(operationsHtml, /api\.getContentPrompts\(\)/);
  assert.match(operationsHtml, /prompt\?\.prompt_text \|\| prompt\?\.prompt/);
  assert.match(operationsHtml, /const promptPreview = promptBody \? shortContentValue\(promptBody, 180\) : '';/);
  assert.match(operationsHtml, /<strong>Prompt:<\/strong>/);
  assert.match(operationsHtml, /Prompt body is not loaded yet/);
  assert.match(server, /app\.get\('\/api\/bna\/content-prompts'/);
  assert.match(server, /await ensureDefaultContentPrompts\(\)/);
  assert.match(server, /SELECT p\.\*,[\s\S]*FROM bna_content_prompts p/);
});

test('Student portal exposes student-visible questions with sources and follow-up learning', () => {
  assert.match(studentHtml, /id="questionsSection"/);
  assert.match(studentHtml, /id="questionList"/);
  assert.match(studentHtml, /function renderQuestions\(questions = \[\]\)/);
  assert.match(studentHtml, /renderQuestionSources\(question\.sources\)/);
  assert.match(studentHtml, /renderQuestionAssignments\(question\.assignments\)/);
  assert.match(server, /function safeQuestionView/);
  assert.match(server, /async function getStudentQuestionsForPortal/);
  assert.match(server, /WHERE student_id = \$1[\s\S]*AND event_type = 'question'/);
  assert.match(server, /eventStudentVisible\(row\)/);
});

test('Content Research tab creates source-sheet work from the whole class session', () => {
  assert.match(operationsHtml, /Create Student Source Sheet Task/);
  assert.match(operationsHtml, /createSourceSheetResearchTask/);
  assert.match(operationsHtml, /source_sheet_research/);
  assert.match(operationsHtml, /Sourceable Topics/);
  assert.match(operationsHtml, /Sources Mentioned/);

  assert.match(server, /if \(action === 'source_sheet_research'\)/);
  assert.match(server, /Research scope: source every sourceable topic from this recording for the student source sheet, not only explicit student questions\./);
  assert.match(server, /Parent follow-up should show topics\/interests, struggles, and open-ended questions/);
  assert.match(server, /category: 'source_sheets'/);
  assert.match(server, /assigned_to: 'Codex'/);
  assert.match(server, /direct Sefaria links for every Torah source used/);
  assert.match(server, /Chasidut\/Hasidut/);
});

test('Content Library cards include student questions and Sefaria research links', () => {
  assert.match(operationsHtml, /function contentClassSessionForJob/);
  assert.match(operationsHtml, /function contentResearchSectionsForJob/);
  assert.match(operationsHtml, /function renderContentCardResearchBlock/);
  assert.match(operationsHtml, /Research \/ Source Links/);
  assert.match(operationsHtml, /Student Questions/);
  assert.match(operationsHtml, /Sefaria search/);
  assert.match(operationsHtml, /Open Sefaria ref/);
  assert.match(operationsHtml, /createContentJobSourceSheetResearchTask/);
  assert.match(operationsHtml, /studentQuestions/);
  assert.match(operationsHtml, /parsed\.student_questions/);
  assert.match(operationsHtml, /Operational tasks and decisions are filed separately/);
});

test('Content Research tab creates separate public bibliography work for parent-facing content', () => {
  const contentReadme = fs.readFileSync('content-memory/README.md', 'utf8');
  const bibliographyReadme = fs.readFileSync('content-memory/public-bibliographies/README.md', 'utf8');

  assert.match(operationsHtml, /Create Public Bibliography Task/);
  assert.match(operationsHtml, /createPublicBibliographyTask/);
  assert.match(operationsHtml, /public_content_bibliography/);
  assert.match(operationsHtml, /taskIsPublicBibliographyWorkflow/);

  assert.match(server, /if \(action === 'public_content_bibliography'\)/);
  assert.match(server, /Public content bibliography workflow:/);
  assert.match(server, /content-memory\/public-bibliographies/);
  assert.match(server, /Do not invent citations/);
  assert.match(server, /books and page\/chapter details/);
  assert.match(server, /scientific\/educational literature/);
  assert.match(server, /category: 'content'/);
  assert.doesNotMatch(server, /title: `Public bibliography:[\s\S]{0,2500}category: 'source_sheets'/);
  assert.match(supervisor, /Public content bibliography instructions:/);
  assert.match(supervisor, /content-memory\/public-bibliographies/);

  assert.match(contentReadme, /public-bibliographies\//);
  assert.match(contentReadme, /second-stage sourcing/);
  assert.match(bibliographyReadme, /Claim Audit/);
  assert.match(bibliographyReadme, /Keep this lane separate from `content-memory\/source-sheets\/`/);
});
