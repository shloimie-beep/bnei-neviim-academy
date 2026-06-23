#!/usr/bin/env node
import { spawn } from 'node:child_process';

const rawProcessName = String(
  process.env.BNA_RAILWAY_PROCESS ||
  process.env.RAILWAY_PROCESS ||
  process.env.PROCESS_TYPE ||
  'web',
).trim().toLowerCase();

const processName = rawProcessName.replace(/_/g, '-');

const processMap = new Map([
  ['web', { command: 'node', args: ['server.js'] }],
  ['server', { command: 'node', args: ['server.js'] }],
  ['telegram-academy', { command: 'npm', args: ['run', 'telegram:kimi'] }],
  ['academy-telegram', { command: 'npm', args: ['run', 'telegram:kimi'] }],
  ['academy-telegram-worker', { command: 'npm', args: ['run', 'telegram:kimi'] }],
  ['telegram-rabbi', { command: 'npm', args: ['run', 'telegram:rabbi'] }],
  ['rabbi-telegram', { command: 'npm', args: ['run', 'telegram:rabbi'] }],
  ['rabbi-telegram-worker', { command: 'npm', args: ['run', 'telegram:rabbi'] }],
]);

const selected = processMap.get(processName);

if (!selected) {
  console.error(
    `Unknown BNA_RAILWAY_PROCESS "${rawProcessName}". ` +
    `Use one of: ${Array.from(processMap.keys()).join(', ')}.`,
  );
  process.exit(1);
}

console.log(`Starting Railway process "${processName}": ${selected.command} ${selected.args.join(' ')}`);

const child = spawn(selected.command, selected.args, {
  env: process.env,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

let shuttingDown = false;

function forwardSignal(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  if (!child.killed) child.kill(signal);
}

process.on('SIGINT', () => forwardSignal('SIGINT'));
process.on('SIGTERM', () => forwardSignal('SIGTERM'));

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});

child.on('error', (error) => {
  console.error(`Failed to start Railway process "${processName}": ${error.message}`);
  process.exit(1);
});
