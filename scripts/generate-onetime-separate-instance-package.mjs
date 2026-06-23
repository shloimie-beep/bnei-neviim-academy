#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  writeDeploymentPackage,
} = require('../src/platform/instances/one-time-separate-deployment');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const outputDir = path.join(repoRoot, 'ops', 'one-time-mishnah');

const result = writeDeploymentPackage(outputDir, {
  generatedAt: new Date().toISOString(),
});

console.log(JSON.stringify({
  ok: result.isolation.ok,
  files: Object.fromEntries(Object.entries(result.files).map(([key, value]) => [key, path.relative(repoRoot, value).replace(/\\/g, '/')])),
  railway_project: result.plan.railway.project_name,
  web_service: result.plan.railway.web_service_name,
  postgres_service: result.plan.railway.postgres_service_name,
  worker_required: result.plan.railway.worker_service.required,
  isolation_failures: result.isolation.failures,
}, null, 2));

if (!result.isolation.ok) process.exitCode = 1;
