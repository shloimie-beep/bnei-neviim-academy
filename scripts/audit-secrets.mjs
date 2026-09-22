import { execFileSync } from 'node:child_process';

const tracked = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);

const riskyPatterns = [
  /(^|\/)\.secrets(\/|$)/i,
  /(^|\/)\.env($|\.|\/)/i,
  /(^|\/)keyholder(\/|$)/i,
  /(^|\/)BNA-Keyholder(\/|$)/i,
  /(^|\/).*(token|secret|credential|api-key).*\.(txt|json)$/i,
];

const allowedPatterns = [
  /^\.env\.example$/,
  /^docs\//,
  /^ops\/preflight\/.*secret-scan-redacted/i,
  /^ops\/qa-runs\/.*keyholder-diagnostics/i,
  /^scripts\/audit-secrets\.mjs$/,
  /^scripts\/check-railway-token\.sh$/,
  /^scripts\/keyholder-diagnostics\.mjs$/,
  /^scripts\/open-bna-keyholder\.ps1$/,
  /^tests\//,
  /^RAILWAY_TOKEN_SETUP\.md$/,
  /^brand-kit\/09-visual-design-tokens\.md$/,
];

const findings = tracked.filter((file) => {
  if (allowedPatterns.some((pattern) => pattern.test(file))) return false;
  return riskyPatterns.some((pattern) => pattern.test(file));
});

if (findings.length) {
  console.error('Tracked secret-risk paths found. Do not open or print contents; remove from git and rotate affected credentials.');
  for (const file of findings) console.error(`- ${file}`);
  process.exit(1);
}

console.log(`Tracked secret audit passed: ${tracked.length} tracked paths checked, 0 tracked secret-risk files found.`);
