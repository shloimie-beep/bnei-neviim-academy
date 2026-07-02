const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');
const provider = fs.readFileSync('public/provider.html', 'utf8');
const actionRegistry = JSON.parse(fs.readFileSync('ops/action-registry.json', 'utf8'));

test('provider-scoped Operations identities do not receive BNA super-admin navigation capabilities', () => {
  assert.match(server, /const providerAllowedViews = \[[^\]]*'api_usage'[\s\S]*'settings'\]/);
  assert.match(server, /const ownerAllowedViews = \[[^\]]*'api_usage'[\s\S]*'settings'\]/);
  assert.match(server, /const adminAllowedViews = \[[^\]]*'api_usage'[\s\S]*'settings'\]/);
  assert.match(server, /const managerAllowedViews = \[[^\]]*'api_usage'[\s\S]*'integrations'\]/);

  for (const listName of ['providerAllowedViews', 'ownerAllowedViews', 'adminAllowedViews', 'managerAllowedViews']) {
    assert.doesNotMatch(server, new RegExp(`${listName} = \\[[^\\]]*'platform_suite'`), `${listName} must not expose Platform Suite`);
    assert.doesNotMatch(server, new RegExp(`${listName} = \\[[^\\]]*'admin'`), `${listName} must not expose Team/Admin`);
    assert.doesNotMatch(server, new RegExp(`${listName} = \\[[^\\]]*'accounting'`), `${listName} must not expose Accounting`);
    assert.doesNotMatch(server, new RegExp(`${listName} = \\[[^\\]]*'students'`), `${listName} must not expose BNA Students`);
  }

  const providerNavProfile = operations.match(/service_provider: \[[^\]]+\]/)?.[0] || '';
  assert.ok(providerNavProfile, 'Operations service_provider nav profile should be explicit');
  assert.doesNotMatch(providerNavProfile, /platform_suite/);
  assert.doesNotMatch(providerNavProfile, /admin/);
  assert.doesNotMatch(providerNavProfile, /accounting/);
});

test('Operations portal fallback preserves server-backed auth and safe returnTo behavior', () => {
  assert.match(server, /function safeOperationsReturnPath\(value\)/);
  assert.match(server, /if \(url\.origin !== 'https:\/\/bna\.local' \|\| url\.pathname !== '\/operations'\)/);
  assert.match(server, /return fallback/);
  assert.match(server, /function operationsReturnPathTargetsOneTime\(value\)/);
  assert.match(server, /preferredRole: operationsReturnPathTargetsOneTime\(requestedReturnTo\) \? 'one_time_admin' : ''/);
  assert.match(server, /async function maybeHandleOpsPortalFallback/);
  assert.match(server, /issueSession\(opsSessionUsername\(identity\)\)/);
  assert.match(server, /setSessionCookie\(res, sessionId\)/);
  assert.match(server, /portal_redirect: true/);
  assert.doesNotMatch(server.match(/async function maybeHandleOpsPortalFallback[\s\S]*?function safePortalReturnPath/)?.[0] || '', /issueProviderSession|issueStudentSession|issueParentSession/);
});

test('provider portal API Usage is feature-flagged and honest until instrumentation is wired', () => {
  assert.match(provider, /const providerApiUsagePreviewFlag = \['1', 'true', 'yes'\]\.includes/);
  assert.match(provider, /let activeProviderSection = initialSearchParams\.get\('section'\) \|\| 'overview'/);
  assert.match(provider, /function providerApiUsagePreviewEnabled\(\)/);
  assert.match(provider, /function providerSectionFromLocation\(\)/);
  assert.match(provider, /function updateProviderSectionUrl\(section\)/);
  assert.match(provider, /window\.history\.pushState\(\{ providerSection: section \}, '', nextUrl\)/);
  assert.match(provider, /window\.addEventListener\('popstate'/);
  assert.match(provider, /portalEntitlementEnabled\('api_usage_preview'\) \|\| portalEntitlementEnabled\('api_usage'\)/);
  assert.match(provider, /if \(providerApiUsagePreviewEnabled\(\)\) \{\s*sections\.push\(\{ id: 'api_usage', label: 'API Usage' \}\);/);
  assert.match(provider, /data-provider-section="api_usage"/);
  assert.match(provider, /API usage metering is not instrumented yet/);
  assert.match(provider, /No usage events recorded/);
  assert.match(provider, /intentionally empty until the backend recorder and aggregation endpoint are enabled/);
  assert.doesNotMatch(provider, /input_tokens|output_tokens|estimated_cost_usd|actual_cost_usd/i);

  const action = actionRegistry.actions.find((item) => item.action_id === 'ACTION-PROVIDER-API-USAGE-PREVIEW-NAV');
  assert.equal(action?.surface, 'provider_portal');
  assert.equal(action?.route, '/provider?api_usage_preview=1&section=api_usage');
  assert.equal(action?.selector_hint, '[data-provider-nav="api_usage"]');
  assert.equal(action?.status, 'preview_feature_flag');
  assert.match(action?.expected_behavior || '', /not display fabricated requests, token counts, costs, prompts, secrets, or cross-workspace usage/);
});

test('provider portal section navigation is registered and excludes super-admin sections', () => {
  const providerSectionsBlock = provider.match(/function providerSections\(\) \{[\s\S]*?return sections;\s*\}/)?.[0] || '';
  assert.match(providerSectionsBlock, /overview/);
  assert.match(providerSectionsBlock, /profile/);
  assert.match(providerSectionsBlock, /services/);
  assert.match(providerSectionsBlock, /class_setup/);
  assert.match(providerSectionsBlock, /communications/);
  assert.match(providerSectionsBlock, /activity/);
  assert.match(providerSectionsBlock, /settings/);
  assert.doesNotMatch(providerSectionsBlock, /platform_suite|Platform Suite|accounting|Accounting|Team\/Admin|credentials|deployment/i);
  assert.match(provider, /data-action-id="ACTION-PROVIDER-SECTION-NAVIGATION" data-provider-nav="\$\{escapeHtml\(section\.id\)\}"/);

  const action = actionRegistry.actions.find((item) => item.action_id === 'ACTION-PROVIDER-SECTION-NAVIGATION');
  assert.equal(action?.surface, 'provider_portal');
  assert.equal(action?.route, '/provider');
  assert.equal(action?.selector_hint, '[data-provider-nav][data-action-id="ACTION-PROVIDER-SECTION-NAVIGATION"]');
  assert.equal(action?.status, 'active');
  assert.match(action?.expected_behavior || '', /must not reveal BNA super-admin sections/);
});

test('Operations Rabbi workspace deep links initialize provider-scoped task fetches', () => {
  assert.match(operations, /const initialWorkspaceKey = normalizeWorkspaceKey\(initialWorkspace \|\| ''\);/);
  assert.match(operations, /let currentWorkspaceId = initialWorkspaceKey;/);
  assert.match(operations, /let taskProjectFilter = initialProject\s*\?\s*normalizeProjectKey\(initialProject\)\s*:\s*\(initialWorkspaceKey && initialWorkspaceKey !== 'platform' \? projectKeyForWorkspaceKey\(initialWorkspaceKey\) : 'all'\);/);
  assert.match(operations, /needsTaskData \? api\.getTasks\(taskProjectFilter !== 'all' \? \{ project_key: taskProjectFilter \} : \{\}\) : Promise\.resolve\(\{ tasks: \[\] \}\)/);
});

test('Rabbi One Time workspace taxonomy reads as launch CRM instead of generic admin', () => {
  const providerOverrides = operations.match(/service_provider: \{[\s\S]*?\n\s*\},\n\s*family:/)?.[0] || '';
  assert.match(providerOverrides, /service_providers: \{ label: 'Program \/ Launch'/);
  assert.match(providerOverrides, /contacts: \{ label: 'Contacts'/);
  assert.match(providerOverrides, /content: \{ label: 'Materials'/);
  assert.match(providerOverrides, /communications: \{ label: 'Communications'/);
  assert.match(providerOverrides, /automations: \{ label: 'Workflows'/);
  assert.match(providerOverrides, /integrations: \{ label: 'Setup'/);
  assert.match(providerOverrides, /api_usage: \{ label: 'Usage'/);

  assert.match(operations, /\? \['service_providers', 'contacts', 'community', 'content', 'calendar', 'communications', 'tasks', 'agents', 'automations', 'integrations', 'api_usage', 'settings'\]/);
  assert.match(operations, /\{ label: 'Active contacts', value: activeMembers/);
  assert.match(operations, /\{ label: 'Support', value: openSupport/);
  assert.match(operations, /PROVIDER_PROGRAM_SUBTABS = \[[\s\S]*label: 'Class Schedule'[\s\S]*label: 'Materials'[\s\S]*label: 'Payments \/ Access'/);
  assert.match(operations, /PROVIDER_PARTICIPANT_SUBTABS = \[[\s\S]*label: 'All Contacts'[\s\S]*label: 'Warm Leads'[\s\S]*label: 'Active Members'[\s\S]*label: 'Email Audience'[\s\S]*label: 'Suppressed \/ No-send'/);
  assert.match(operations, /getOneTimeContactReadiness\(\) \{ return this\.request\('GET', '\/one-time\/contact-readiness'\); \}/);
  assert.match(server, /app\.get\('\/api\/bna\/one-time\/contact-readiness'/);
  assert.doesNotMatch(operations, /subscribers\.csv/);
});

test('Operations route changes push history after initial deep-link normalization', () => {
  assert.match(operations, /let operationsUrlInitialized = false;/);
  assert.match(operations, /let suppressOperationsHistoryPush = false;/);
  assert.match(operations, /const shouldReplace = !operationsUrlInitialized \|\| suppressOperationsHistoryPush;/);
  assert.match(operations, /window\.history\[shouldReplace \? 'replaceState' : 'pushState'\]\(\{ operationsRoute: true \}, '', url\);/);
  assert.match(operations, /window\.addEventListener\('popstate', \(\) => \{\s*suppressOperationsHistoryPush = true;\s*window\.location\.reload\(\);\s*\}\);/);
});

test('Operations API Usage remains an honest empty state and does not present the future provider bot as live', () => {
  assert.match(operations, /Token\/cost values stay blank until backend tracking is added/);
  assert.match(operations, /No fake cost is shown until API metering persistence exists/);
  assert.match(operations, /Detailed token, model, cost, budget, and export controls need backend metering before they can be enabled/);
  assert.match(operations, /const API_USAGE_SUBTABS = \[/);
  assert.doesNotMatch(operations, /Provider Workspace Bot is live|Start provider bot|Ask provider bot/i);
});
