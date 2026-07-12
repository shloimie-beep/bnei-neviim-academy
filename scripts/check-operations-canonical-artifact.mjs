#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const serverPath = path.join(root, 'server.js');
const sourcePath = path.join(root, 'public', 'operations.html');
const bootstrapPath = path.join(root, 'public', 'operations-bootstrap.html');
const cssPath = path.join(root, 'public', 'css', 'operations-shell.css');
const jsPath = path.join(root, 'public', 'js', 'operations-shell.js');
const deferredJsPath = path.join(root, 'public', 'js', 'operations-deferred-renderers.js');
const oneTimeIaPath = path.join(root, 'public', 'js', 'one-time-rabbi-dashboard-ia.generated.js');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const server = read(serverPath);
const source = read(sourcePath);
const bootstrap = read(bootstrapPath);

assert(server.includes("res.sendFile(path.join(__dirname, 'public', 'operations-bootstrap.html'))"), 'sendOperationsShell must send operations-bootstrap.html');
assert(server.includes("app.get(['/operations', '/operations/agents/runs/:runKey'], requireAdmin, sendOperationsShell);"), 'canonical /operations route must use sendOperationsShell behind requireAdmin');
assert(source.includes("window.location.pathname === '/operations.html'"), 'operations.html must contain direct source-artifact redirect guard');
assert(source.includes("operationsSourceReadModes"), 'operations.html must keep explicit source-read bypass modes for maintainers');
assert(bootstrap.includes('<link rel="stylesheet" href="/css/operations-shell.css">'), 'bootstrap must load generated Operations CSS');
assert(bootstrap.includes('<script src="/js/one-time-rabbi-dashboard-ia.generated.js"></script>'), 'bootstrap must load generated One Time Rabbi dashboard IA');
assert(bootstrap.includes('<script src="/js/operations-shell.js"></script>'), 'bootstrap must load generated Operations JS');
assert(!bootstrap.includes('<style>'), 'bootstrap must not contain the large inline source style block');
assert(!bootstrap.includes('// API Client'), 'bootstrap must not contain the large inline source app script');
assert(fs.existsSync(cssPath), 'generated CSS is missing');
assert(fs.existsSync(jsPath), 'generated JS is missing');
assert(fs.existsSync(deferredJsPath), 'generated deferred JS is missing');
assert(fs.existsSync(oneTimeIaPath), 'generated One Time Rabbi dashboard IA is missing');

console.log(JSON.stringify({
  ok: true,
  route: '/operations',
  canonical_html: 'public/operations-bootstrap.html',
  source_artifact: 'public/operations.html',
  generated_assets: [
    'public/css/operations-shell.css',
    'public/js/one-time-rabbi-dashboard-ia.generated.js',
    'public/js/operations-shell.js',
    'public/js/operations-deferred-renderers.js'
  ],
  direct_source_redirect_guard: true
}, null, 2));
