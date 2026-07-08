#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourcePath = path.join(root, 'public', 'operations.html');
const bootstrapPath = path.join(root, 'public', 'operations-bootstrap.html');
const cssPath = path.join(root, 'public', 'css', 'operations-shell.css');
const jsPath = path.join(root, 'public', 'js', 'operations-shell.js');
const deferredJsPath = path.join(root, 'public', 'js', 'operations-deferred-renderers.js');

function normalizeGeneratedText(value) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, ''))
    .join('\n')
    .replace(/\n*$/, '\n');
}

const source = fs.readFileSync(sourcePath, 'utf8');
const styleMatch = source.match(/\n    <style>\r?\n([\s\S]*?)\r?\n    <\/style>/);
if (!styleMatch) throw new Error('Could not find the inline Operations style block.');

let scriptStart = source.indexOf('\n    <script>\r\n        // API Client');
if (scriptStart < 0) scriptStart = source.indexOf('\n    <script>\n        // API Client');
if (scriptStart < 0) throw new Error('Could not find the inline Operations app script.');

const scriptOpenEnd = source.indexOf('>', scriptStart);
const appSelectScript = '\n    <script src="/js/app-select.js"></script>';
const appSelectStart = source.indexOf(appSelectScript, scriptOpenEnd);
if (appSelectStart < 0) throw new Error('Could not find the app-select script after the Operations app script.');
const scriptClose = source.lastIndexOf('\n    </script>', appSelectStart);
if (scriptOpenEnd < 0 || scriptClose < 0) throw new Error('Could not find the Operations app script boundary.');

const cssBody = normalizeGeneratedText(styleMatch[1].replace(/^\s*\r?\n/, ''));
const scriptBody = normalizeGeneratedText(source.slice(scriptOpenEnd + 1, scriptClose).replace(/^\r?\n/, ''));
const deferredStartMarker = '\n        function renderPipelines() {';
const deferredCommandBotStartMarker = '\n        function renderCommandBotPanel(pageContext = currentView) {';
const deferredCommandBotEndMarker = '\n        async function createPipelineCardPrompt() {';
const deferredAccountingHelperStartMarker = '\n        function isUnresolvedPaymentIntake(intake) {';
const deferredAccountingHelperEndMarker = '\n        function renderPaymentReminderBlock() {';
const deferredContentHelperStartMarker = '\n        function defaultContentSection(workspaceKey = currentWorkspaceKey()) {';
const deferredContentRendererStartMarker = '\n        function renderContent() {';
const deferredEndMarker = '\n        function renderTaskModal() {';
const deferredLiveStartMarker = '\n        function renderLiveClasses() {';
const deferredLiveEndMarker = '\n        async function loadIntakeData() {';
const deferredStart = scriptBody.indexOf(deferredStartMarker);
const deferredCommandBotStart = scriptBody.indexOf(deferredCommandBotStartMarker, deferredStart);
const deferredCommandBotEnd = scriptBody.indexOf(deferredCommandBotEndMarker, deferredCommandBotStart);
const deferredAccountingHelperStart = scriptBody.indexOf(deferredAccountingHelperStartMarker, deferredCommandBotEnd);
const deferredAccountingHelperEnd = scriptBody.indexOf(deferredAccountingHelperEndMarker, deferredAccountingHelperStart);
const deferredContentHelperStart = scriptBody.indexOf(deferredContentHelperStartMarker, deferredAccountingHelperEnd);
const deferredContentRendererStart = scriptBody.indexOf(deferredContentRendererStartMarker, deferredContentHelperStart);
const deferredEnd = scriptBody.indexOf(deferredEndMarker, deferredContentRendererStart);
const deferredLiveStart = scriptBody.indexOf(deferredLiveStartMarker, deferredEnd);
const deferredLiveEnd = scriptBody.indexOf(deferredLiveEndMarker, deferredLiveStart);
const emailScopeHelperStartMarker = '\n        const EMAIL_INBOX_SCOPES = [';
const emailScopeHelperEndMarker = '\n        function emailRecordProjectKey(record = {}) {';
const communicationsBundleStartMarker = '\n        async function fetchCommunicationsIntegrationBundle(filters = workspaceDataProjectFilters()) {';
const communicationsBundleEndMarker = '\n        async function refreshCommunicationsIntegrations() {';
const emailScopeHelperStart = scriptBody.indexOf(emailScopeHelperStartMarker, deferredStart);
const emailScopeHelperEnd = scriptBody.indexOf(emailScopeHelperEndMarker, emailScopeHelperStart);
const communicationsBundleStart = scriptBody.indexOf(communicationsBundleStartMarker, deferredStart);
const communicationsBundleEnd = scriptBody.indexOf(communicationsBundleEndMarker, communicationsBundleStart);
if (
  deferredStart < 0
  || deferredCommandBotStart < 0
  || deferredCommandBotEnd < 0
  || deferredAccountingHelperStart < 0
  || deferredAccountingHelperEnd < 0
  || deferredContentHelperStart < 0
  || deferredContentRendererStart < 0
  || deferredEnd < 0
  || deferredLiveStart < 0
  || deferredLiveEnd < 0
  || emailScopeHelperStart < 0
  || emailScopeHelperEnd < 0
  || communicationsBundleStart < 0
  || communicationsBundleEnd < 0
) {
  throw new Error('Could not find Operations deferred renderer chunk boundaries.');
}

const emailScopeHelperBlock = normalizeGeneratedText(scriptBody.slice(emailScopeHelperStart + 1, emailScopeHelperEnd));
const communicationsBundleBlock = normalizeGeneratedText(scriptBody.slice(communicationsBundleStart + 1, communicationsBundleEnd));
let deferredRendererBlock = scriptBody.slice(deferredStart + 1, deferredCommandBotStart);
deferredRendererBlock = deferredRendererBlock
  .replace(scriptBody.slice(emailScopeHelperStart, emailScopeHelperEnd), '')
  .replace(scriptBody.slice(communicationsBundleStart, communicationsBundleEnd), '');
const deferredBlock = normalizeGeneratedText(`${deferredRendererBlock}
${scriptBody.slice(deferredCommandBotEnd + 1, deferredAccountingHelperStart)}
${scriptBody.slice(deferredAccountingHelperEnd + 1, deferredContentHelperStart)}
${scriptBody.slice(deferredContentRendererStart + 1, deferredEnd)}
${scriptBody.slice(deferredLiveStart + 1, deferredLiveEnd)}`);
let mainScriptBody = normalizeGeneratedText(`${scriptBody.slice(0, deferredStart)}
        // Heavy non-initial renderers are emitted to /js/operations-deferred-renderers.js.
${scriptBody.slice(deferredCommandBotStart, deferredCommandBotEnd)}
${scriptBody.slice(deferredAccountingHelperStart, deferredAccountingHelperEnd)}
${scriptBody.slice(deferredContentHelperStart, deferredContentRendererStart)}
        // Content and Student renderers are emitted to /js/operations-deferred-renderers.js.
${scriptBody.slice(deferredEnd, deferredLiveStart)}
        // Live Classes renderer and actions are emitted to /js/operations-deferred-renderers.js.
${scriptBody.slice(deferredLiveEnd + 1)}`);

function replaceRequired(haystack, needle, replacement) {
  if (!haystack.includes(needle)) throw new Error(`Could not find required generated-shell replacement: ${needle}`);
  return haystack.replace(needle, replacement);
}

const deferredLoader = `        const OPERATIONS_DEFERRED_RENDER_CHUNK = '/js/operations-deferred-renderers.js';
        const OPERATIONS_DEFERRED_VIEW_RENDERERS = {
            pipelines: 'renderPipelines',
            calendar: 'renderCalendar',
            internal_dialogue: 'renderInternalDialogue',
            communications: 'renderCommunications',
            studio: 'renderStudio',
            api_usage: 'renderApiUsage',
            admin: 'renderTeamAdmin',
            settings: 'renderSettings',
            accounting: 'renderAccounting',
            intake: 'renderIntakeReview',
            community: 'renderCommunityAdmin',
            content: 'renderContent',
            students: 'renderStudents',
            live_classes: 'renderLiveClasses'
        };
        const OPERATIONS_DEFERRED_PROVIDER_SECTION_RENDERERS = {
            content: 'renderProviderContentPanel',
            communications: 'renderProviderCommunicationsPanel',
            leads: 'renderProviderLeadsPanel'
        };
        const OPERATIONS_DEFERRED_GLOBAL_HANDLER_NAMES = [
            'setStudioSection',
            'selectStudioProject',
            'createStudioProjectFromForm',
            'saveStudioLibraryFromForm',
            'saveStudioSourceFromForm',
            'prepareStudioReviewPackFromForm',
            'generateStudioOutline',
            'generateStudioStoryboard',
            'compileStudioPrompt',
            'previewStudioSidekickPatch',
            'exportStudioOpenArtPrompt',
            'copyStudioOpenArtPrompt',
            'planStudioRepairRequest',
            'previewStudioCorrection',
            'applyStudioCorrection',
            'updateStudioSceneFromForm',
            'regenerateStudioScene',
            'renderStudioMock',
            'retryStudioJob',
            'cancelStudioJob',
            'handoffStudioAiVideoWorker',
            'handoffStudioProject'
        ];
        let operationsDeferredRenderChunkPromise = null;

        function exposeOperationsDeferredHandlers() {
            OPERATIONS_DEFERRED_GLOBAL_HANDLER_NAMES.forEach(name => {
                if (typeof window[name] === 'function') window[name] = window[name];
            });
        }

        function loadOperationsDeferredRenderers() {
            if (window.__operationsDeferredRenderersLoaded) return Promise.resolve();
            if (operationsDeferredRenderChunkPromise) return operationsDeferredRenderChunkPromise;
            operationsDeferredRenderChunkPromise = new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = OPERATIONS_DEFERRED_RENDER_CHUNK;
                script.async = true;
                script.onload = () => {
                    window.__operationsDeferredRenderersLoaded = true;
                    exposeOperationsDeferredHandlers();
                    resolve();
                };
                script.onerror = () => {
                    operationsDeferredRenderChunkPromise = null;
                    reject(new Error('Unable to load Operations deferred renderers.'));
                };
                document.head.appendChild(script);
            });
            return operationsDeferredRenderChunkPromise;
        }

        function renderDeferredLoadingCard(label = 'Loading view') {
            return \`
                <div class="container">
                    <section class="focus-panel" data-operations-deferred-loading="true">
                        <div class="task-section-header"><h3>\${escapeHtml(label)}</h3><span>loading</span></div>
                        <p class="settings-disabled-note">Loading this Operations view. The initial Rabbi / One Time overview stays lighter by loading these renderers only when needed.</p>
                    </section>
                </div>
            \`;
        }

        function renderDeferredView(viewId, rendererName) {
            const renderer = window[rendererName];
            if (typeof renderer === 'function') return renderer();
            loadOperationsDeferredRenderers()
                .then(() => {
                    if (currentView === viewId) render([], { force: true });
                })
                .catch(error => {
                    console.error(error);
                });
            const label = (workspaceNavItems().find(item => item.id === viewId)?.label || viewId).replace(/_/g, ' ');
            return renderDeferredLoadingCard(label);
        }

        function renderDeferredProviderSection(sectionId, rendererName) {
            const renderer = window[rendererName];
            if (typeof renderer === 'function') return renderer();
            loadOperationsDeferredRenderers()
                .then(() => {
                    if (currentView === 'service_providers' && serviceProviderSection === sectionId) render([], { force: true });
                })
                .catch(error => {
                    console.error(error);
                });
            return renderDeferredLoadingCard(serviceProviderSectionLabel(sectionId));
        }
`;

mainScriptBody = replaceRequired(
  mainScriptBody,
  '\n        function render(errors = [], options = {}) {',
  `\n${deferredLoader}\n        function render(errors = [], options = {}) {`,
);

mainScriptBody = replaceRequired(
  mainScriptBody,
  '\n        async function loadData(options = {}) {',
  `\n${emailScopeHelperBlock}\n${communicationsBundleBlock}\n        async function loadData(options = {}) {`,
);

[
  ['${section === \'content\' ? renderProviderContentPanel() : \'\'}', '${section === \'content\' ? renderDeferredProviderSection(\'content\', \'renderProviderContentPanel\') : \'\'}'],
  ['${section === \'communications\' ? renderProviderCommunicationsPanel() : \'\'}', '${section === \'communications\' ? renderDeferredProviderSection(\'communications\', \'renderProviderCommunicationsPanel\') : \'\'}'],
  ['${section === \'leads\' ? renderProviderLeadsPanel() : \'\'}', '${section === \'leads\' ? renderDeferredProviderSection(\'leads\', \'renderProviderLeadsPanel\') : \'\'}'],
].forEach(([needle, replacement]) => {
  mainScriptBody = replaceRequired(mainScriptBody, needle, replacement);
});

Object.entries({
  pipelines: 'renderPipelines',
  students: 'renderStudents',
  community: 'renderCommunityAdmin',
  studio: 'renderStudio',
  content: 'renderContent',
  intake: 'renderIntakeReview',
  live_classes: 'renderLiveClasses',
  calendar: 'renderCalendar',
  communications: 'renderCommunications',
  internal_dialogue: 'renderInternalDialogue',
  accounting: 'renderAccounting',
  api_usage: 'renderApiUsage',
  admin: 'renderTeamAdmin',
  settings: 'renderSettings',
}).forEach(([view, renderer]) => {
  mainScriptBody = replaceRequired(
    mainScriptBody,
    `case '${view}': content = ${renderer}(); break;`,
    `case '${view}': content = renderDeferredView('${view}', '${renderer}'); break;`,
  );
});

const operationsGlobalHandlerNames = [
  'toggleBnaHelper',
  'openBnaHelperFromLauncher',
  'submitBnaHelperMessage',
  'executeBnaHelperPlan',
  'cancelBnaHelperPlan',
  'openHelperResult',
  'setStudioSection',
  'selectStudioProject',
  'createStudioProjectFromForm',
  'saveStudioLibraryFromForm',
  'saveStudioSourceFromForm',
  'prepareStudioReviewPackFromForm',
  'generateStudioOutline',
  'generateStudioStoryboard',
  'compileStudioPrompt',
  'previewStudioSidekickPatch',
  'exportStudioOpenArtPrompt',
  'copyStudioOpenArtPrompt',
  'planStudioRepairRequest',
  'previewStudioCorrection',
  'applyStudioCorrection',
  'updateStudioSceneFromForm',
  'regenerateStudioScene',
  'renderStudioMock',
  'retryStudioJob',
  'cancelStudioJob',
  'handoffStudioAiVideoWorker',
  'handoffStudioProject',
];
const objectAssignStartNeedle = '\n        Object.assign(window, {\n            toggleBnaHelper,';
const objectAssignStart = mainScriptBody.indexOf(objectAssignStartNeedle);
const objectAssignEnd = mainScriptBody.indexOf('\n        });', objectAssignStart);
if (objectAssignStart < 0 || objectAssignEnd < 0) {
  throw new Error('Could not find Operations global handler assignment block.');
}
const objectAssignReplacement = `
        ${JSON.stringify(operationsGlobalHandlerNames, null, 12)}
            .forEach(name => {
                if (typeof window[name] === 'function') window[name] = window[name];
            });
        exposeOperationsDeferredHandlers();`;
mainScriptBody = normalizeGeneratedText(
  `${mainScriptBody.slice(0, objectAssignStart)}${objectAssignReplacement}${mainScriptBody.slice(objectAssignEnd + '\n        });'.length)}`,
);

fs.writeFileSync(cssPath, `/* Extracted from public/operations.html for split /operations delivery. */\n${cssBody}`);
fs.writeFileSync(jsPath, `// Extracted from public/operations.html for split /operations delivery.\n${mainScriptBody}`);
fs.writeFileSync(deferredJsPath, `// Deferred renderers extracted from public/operations.html for lighter initial /operations delivery.\n${deferredBlock}\nwindow.__operationsDeferredRenderersLoaded = true;\nif (typeof exposeOperationsDeferredHandlers === 'function') exposeOperationsDeferredHandlers();\n`);

let bootstrap = `${source.slice(0, scriptStart)}
    <script src="/js/operations-shell.js"></script>${source.slice(scriptClose + '\n    </script>'.length)}`;
bootstrap = bootstrap.replace(styleMatch[0], '\n    <link rel="stylesheet" href="/css/operations-shell.css">');
bootstrap = normalizeGeneratedText(bootstrap);
fs.writeFileSync(bootstrapPath, bootstrap);

console.log(JSON.stringify({
  ok: true,
  source: path.relative(root, sourcePath).replace(/\\/g, '/'),
  bootstrap: path.relative(root, bootstrapPath).replace(/\\/g, '/'),
  css: path.relative(root, cssPath).replace(/\\/g, '/'),
  js: path.relative(root, jsPath).replace(/\\/g, '/'),
  deferredJs: path.relative(root, deferredJsPath).replace(/\\/g, '/'),
  bytes: {
    source: fs.statSync(sourcePath).size,
    bootstrap: fs.statSync(bootstrapPath).size,
    css: fs.statSync(cssPath).size,
    js: fs.statSync(jsPath).size,
    deferredJs: fs.statSync(deferredJsPath).size,
  },
}, null, 2));
