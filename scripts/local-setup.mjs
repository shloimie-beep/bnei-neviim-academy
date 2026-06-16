#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const runtimeDir = path.join(repoRoot, '.runtime');
const envExamplePath = path.join(repoRoot, '.env.example');
const envLocalPath = path.join(repoRoot, '.env.local');
const packageJsonPath = path.join(repoRoot, 'package.json');
const minimumNodeMajor = 20;

function runVersion(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    shell: false,
  });
  if (result.error) return { ok: false, error: result.error.message };
  return {
    ok: result.status === 0,
    version: String(result.stdout || result.stderr || '').trim(),
    status: result.status,
  };
}

function npmCommand() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

function printStep(label, value) {
  console.log(`${label.padEnd(22)} ${value}`);
}

function main() {
  console.log('BNA local setup');
  console.log('');

  const nodeMajor = Number(process.versions.node.split('.')[0] || 0);
  printStep('Node', `${process.version}${nodeMajor >= minimumNodeMajor ? ' OK' : ' needs Node 20+'}`);

  const npm = runVersion(npmCommand(), ['--version']);
  printStep('npm', npm.ok ? `${npm.version} OK` : `missing (${npm.error || `exit ${npm.status}`})`);

  fs.mkdirSync(runtimeDir, { recursive: true });
  printStep('.runtime', 'ready');

  if (!fs.existsSync(envExamplePath)) {
    console.error('Missing .env.example. Restore it before creating .env.local.');
    process.exit(1);
  }

  if (fs.existsSync(envLocalPath)) {
    printStep('.env.local', 'exists, not overwritten');
  } else {
    fs.copyFileSync(envExamplePath, envLocalPath);
    printStep('.env.local', 'created from .env.example');
  }

  if (!fs.existsSync(packageJsonPath)) {
    console.error('Missing package.json. Run this from the BNA repo root.');
    process.exit(1);
  }

  const nodeModulesPath = path.join(repoRoot, 'node_modules');
  const lockPath = path.join(repoRoot, 'package-lock.json');
  if (fs.existsSync(nodeModulesPath)) {
    printStep('Dependencies', 'node_modules present');
  } else if (fs.existsSync(lockPath)) {
    printStep('Dependencies', 'run npm install');
  } else {
    printStep('Dependencies', 'run npm install after package-lock is restored');
  }

  console.log('');
  console.log('Next steps');
  console.log('1. Edit .env.local and fill DATABASE_URL, OPS_USERNAME, and OPS_PASSWORD.');
  console.log('2. Run: npm install');
  console.log('3. Run: npm run doctor');
  console.log('4. Run: npm run smoke:local -- --skip-tests');
  console.log('5. Start the app: npm run dev');
  console.log('');
  console.log('No secret values were printed.');

  if (nodeMajor < minimumNodeMajor || !npm.ok) {
    process.exitCode = 1;
  }
}

main();
