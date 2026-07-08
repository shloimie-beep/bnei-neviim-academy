#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourcePath = path.join(root, 'public', 'operations.html');
const bootstrapPath = path.join(root, 'public', 'operations-bootstrap.html');
const cssPath = path.join(root, 'public', 'css', 'operations-shell.css');
const jsPath = path.join(root, 'public', 'js', 'operations-shell.js');

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

fs.writeFileSync(cssPath, `/* Extracted from public/operations.html for split /operations delivery. */\n${cssBody}`);
fs.writeFileSync(jsPath, `// Extracted from public/operations.html for split /operations delivery.\n${scriptBody}`);

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
  bytes: {
    source: fs.statSync(sourcePath).size,
    bootstrap: fs.statSync(bootstrapPath).size,
    css: fs.statSync(cssPath).size,
    js: fs.statSync(jsPath).size,
  },
}, null, 2));
