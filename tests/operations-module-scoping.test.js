const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const operationsHtml = fs.readFileSync('public/operations.html', 'utf8');
const server = fs.readFileSync('server.js', 'utf8');

function sliceBetween(source, start, end) {
  const startIndex = source.indexOf(start);
  assert.notEqual(startIndex, -1, `Missing start marker: ${start}`);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.notEqual(endIndex, -1, `Missing end marker: ${end}`);
  return source.slice(startIndex, endIndex);
}

test('Community data is scoped by selected workspace instead of defaulting to One Time', () => {
  assert.match(operationsHtml, /function communityDataProjectFilters/);
  assert.match(operationsHtml, /const communityFilters = communityDataProjectFilters\(\);/);
  assert.match(operationsHtml, /api\.getWs11Courses\(communityFilters\)/);
  assert.match(operationsHtml, /api\.getWs11Worksheets\(communityFilters\)/);
  assert.match(operationsHtml, /api\.getWs11CourseQuestions\(communityFilters\)/);
  assert.match(operationsHtml, /api\.getWs11GamificationEvents\(communityFilters\)/);
  assert.match(operationsHtml, /api\.getWs11Shoutouts\(communityFilters\)/);
  assert.match(operationsHtml, /function communityWorkspaceProfile/);
  assert.match(operationsHtml, /BNA Community/);
  assert.match(operationsHtml, /Family Community/);
  assert.doesNotMatch(operationsHtml, /api\.getWs11Courses\(\{ project_key: 'one_time_mishnah_class' \}\)/);
  assert.doesNotMatch(operationsHtml, /<h2>Mishnayos Community<\/h2>/);
});

test('Content and One Time library data stay in the selected workspace', () => {
  assert.match(operationsHtml, /const contentFilters = contentDataProjectFilters\(\);/);
  assert.match(operationsHtml, /api\.getContentJobs\(contentFilters\)/);
  assert.match(operationsHtml, /api\.getClassSessions\(contentFilters\)/);
  assert.match(operationsHtml, /const shouldLoadOneTimeContentData = needsContentData && \(currentWorkspaceIsGlobal\(\) \|\| currentWorkspaceIsOneTime\(\)\);/);
  assert.match(operationsHtml, /shouldLoadOneTimeContentData \? api\.getOneTimeClasses/);
  assert.match(operationsHtml, /function visibleContentSubtabs/);
  assert.match(operationsHtml, /tab\.id !== 'one_time_library' \|\| currentWorkspaceIsGlobal\(\) \|\| currentWorkspaceIsOneTime\(\)/);
  assert.match(operationsHtml, /const activeContentSection = contentTabs\.some\(tab => tab\.id === contentSection\) \? contentSection : 'library';/);
  assert.match(operationsHtml, /function contentIsReusableContent/);
  assert.match(operationsHtml, /function contentLooksPrivateOrNonContentInput/);
  assert.match(operationsHtml, /const visibleJobs = scopedJobs\.filter\(contentIsReusableContent\);/);
  assert.match(operationsHtml, /private meeting\|rabbi coordination\|coordination meeting\|operator task\|student goal\|student note\|accountability note/);
});

test('Live Classes and members use selected workspace project filters', () => {
  assert.match(operationsHtml, /function liveClassDataProjectFilters/);
  assert.match(operationsHtml, /const liveClassFilters = liveClassDataProjectFilters\(\);/);
  assert.match(operationsHtml, /api\.getMembers\(liveClassFilters\)/);
  assert.match(operationsHtml, /api\.getLiveSessions\(liveClassFilters\)/);
  assert.match(operationsHtml, /function liveClassWorkspaceProfile/);
  assert.match(operationsHtml, /This workspace only shows its own live classes/);
  assert.doesNotMatch(operationsHtml, /needsLiveClassData \? api\.getMembers\(\)/);
  assert.doesNotMatch(operationsHtml, /needsLiveClassData \? api\.getLiveSessions\(\)/);
});

test('Community and live-class server read routes accept scoped project filters', () => {
  assert.match(server, /function requestedProjectKeyForScopedList/);
  assert.match(server, /function appendRequestedProjectScopeCondition/);

  const coursesRoute = sliceBetween(server, "app.get('/api/bna/courses'", "app.post('/api/bna/courses'");
  assert.match(coursesRoute, /const projectKey = requestedProjectKeyForScopedList\(req\);/);
  assert.match(coursesRoute, /c\.project_key = \$\$\{params\.length\}/);
  assert.doesNotMatch(coursesRoute, /opsScopeProjectKey\(req\) \|\| ONE_TIME_PROJECT_KEY/);

  const worksheetsRoute = sliceBetween(server, "app.get('/api/bna/worksheets'", "app.post('/api/bna/worksheets'");
  assert.match(worksheetsRoute, /const projectKey = requestedProjectKeyForScopedList\(req\);/);
  assert.match(worksheetsRoute, /LEFT JOIN bna_courses c ON c\.id = w\.course_id/);
  assert.match(worksheetsRoute, /c\.project_key = \$\$\{params\.length\}/);

  const questionsRoute = sliceBetween(server, "app.get('/api/bna/course-questions'", "app.post('/api/bna/course-questions'");
  assert.match(questionsRoute, /const projectKey = requestedProjectKeyForScopedList\(req\);/);
  assert.match(questionsRoute, /LEFT JOIN bna_courses c ON c\.id = q\.course_id/);
  assert.match(questionsRoute, /c\.project_key = \$\$\{params\.length\}/);

  const membersRoute = sliceBetween(server, "app.get('/api/bna/members'", "app.post('/api/bna/members'");
  assert.match(membersRoute, /appendRequestedProjectScopeCondition\(req, conditions, params, 'm\.project_id'\)/);

  const liveSessionsRoute = sliceBetween(server, "app.get('/api/bna/live-sessions'", "app.post('/api/bna/live-sessions'");
  assert.match(liveSessionsRoute, /appendRequestedProjectScopeCondition\(req, conditions, params, 's\.project_id'\)/);
});

test('Operations admin, communications, integrations, and automations use selected workspace filters', () => {
  assert.match(operationsHtml, /function workspaceDataProjectFilters/);
  assert.match(operationsHtml, /const workspaceDataFilters = workspaceDataProjectFilters\(\);/);
  assert.match(operationsHtml, /api\.getPeople\(workspaceDataFilters\)/);
  assert.match(operationsHtml, /api\.getParentLeads\(workspaceDataFilters\)/);
  assert.match(operationsHtml, /api\.getContactCommunications\(workspaceDataFilters\)/);
  assert.match(operationsHtml, /fetchCommunicationsIntegrationBundle\(workspaceDataFilters\)/);
  assert.match(operationsHtml, /api\.getAutomations\(workspaceDataFilters\)/);
  assert.match(operationsHtml, /api\.getIntegrationStatus\(workspaceDataFilters\)/);
  assert.match(operationsHtml, /api\.getSocialDrafts\(filters\)/);
  assert.match(operationsHtml, /api\.getEmailDrafts\(filters\)/);
  assert.match(operationsHtml, /api\.getDnsTasks\(\{ \.\.\.filters, provider: 'resend' \}\)/);
  assert.match(operationsHtml, /const filters = workspaceDataProjectFilters\(\);[\s\S]*api\.createSocialDraft\(\{[\s\S]*\.\.\.filters/);
  assert.match(operationsHtml, /const filters = workspaceDataProjectFilters\(\);[\s\S]*api\.createEmailDraft\(\{[\s\S]*\.\.\.filters/);
  assert.match(operationsHtml, /const filters = workspaceDataProjectFilters\(\);[\s\S]*api\.createDnsTask\(\{[\s\S]*\.\.\.filters/);
  assert.match(operationsHtml, /function visibleIntegrationsSubtabs/);
  assert.match(operationsHtml, /if \(currentWorkspaceIsGlobal\(\)\) return INTEGRATIONS_SUBTABS;/);
  assert.match(operationsHtml, /return INTEGRATIONS_SUBTABS\.filter\(tab => !\['readiness', 'external_apps'\]\.includes\(tab\.id\)\)/);
  assert.match(operationsHtml, /const needsIntegrationsReadinessData = currentWorkspaceIsGlobal\(\) &&/);
});

test('Server admin, communications, and draft routes enforce requested workspace scope', () => {
  assert.match(server, /function requestedProjectKeyForInput/);
  assert.match(server, /function appendJsonbProjectMetadataScope/);
  assert.match(server, /function appendDnsWorkspaceScope/);

  const peopleRoute = sliceBetween(server, "app.get('/api/bna/people'", "app.post('/api/bna/people'");
  assert.match(peopleRoute, /const requestedProjectKey = requestedProjectKeyForScopedList\(req\);/);
  assert.match(peopleRoute, /AND p\.project_key = \$\$\{params\.length\}/);
  assert.match(peopleRoute, /w_scope\.project_key = \$1/);

  const communicationsRoute = sliceBetween(server, 'function buildCommunicationsQueryFilters', "app.post('/api/bna/resend/webhook'");
  assert.match(communicationsRoute, /buildCommunicationsQueryFilters\(query = \{\}, forced = \{\}, req = null\)/);
  assert.match(communicationsRoute, /requestedProjectKeyForScopedList\(req\)/);
  assert.match(communicationsRoute, /COALESCE\(project_id, \(SELECT id FROM bna_projects WHERE project_key = '\$\{DEFAULT_PROJECT_KEY\}' LIMIT 1\)\)/);
  assert.match(communicationsRoute, /buildCommunicationsQueryFilters\(req\.query \|\| \{\}, \{\}, req\)/);
  assert.match(communicationsRoute, /appendRequestedProjectScopeCondition\(req, conditions, params, 'project_id'\)/);

  const contactCommunicationsRoute = sliceBetween(server, "app.get('/api/bna/contact-communications'", "app.post('/api/bna/contact-communications/screening-preview'");
  assert.match(contactCommunicationsRoute, /const requestedProjectKey = requestedProjectKeyForScopedList\(req\);/);
  assert.match(contactCommunicationsRoute, /COALESCE\(c\.project_id, l\.project_id, s\.project_id, st\.project_id/);
  assert.match(contactCommunicationsRoute, /COALESCE\(u\.project_id, \(SELECT id FROM bna_projects WHERE project_key = '\$\{DEFAULT_PROJECT_KEY\}' LIMIT 1\)\)/);

  const parentLeadsRoute = sliceBetween(server, "app.get('/api/bna/parent-leads'", "async function updateExistingParentLeadFromBody");
  assert.match(parentLeadsRoute, /appendRequestedProjectScopeCondition\(req, conditions, params, 'l\.project_id'\)/);
  assert.match(parentLeadsRoute, /SELECT l\.\*, p\.project_key, p\.name AS project_name/);
  assert.match(parentLeadsRoute, /LEFT JOIN bna_projects p ON p\.id = l\.project_id/);

  const socialDraftsRoute = sliceBetween(server, "app.get('/api/bna/communications/social/drafts'", "async function createSocialDraft");
  assert.match(socialDraftsRoute, /appendJsonbProjectMetadataScope\(req, conditions, params, 'metadata'\)/);

  const emailDraftsRoute = sliceBetween(server, "app.get('/api/bna/communications/email/drafts'", "async function createResendEmailDraft");
  assert.match(emailDraftsRoute, /appendJsonbProjectMetadataScope\(req, conditions, params, 'metadata'\)/);

  const dnsTasksRoute = sliceBetween(server, "app.get('/api/bna/communications/dns-tasks'", "app.post('/api/bna/communications/dns-tasks'");
  assert.match(dnsTasksRoute, /appendDnsWorkspaceScope\(req, conditions, params\)/);
});
