#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const THIS_FILE = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(THIS_FILE), "..");
const REPORT_DIR_REL = "ops/audit-governance";

export const AUDIT_SPECS = [
  { rel: "ops/audits", strategy: "directory-or-file", label: "ops_audit" },
  { rel: "ops/system-audits", strategy: "loose-files", label: "system_audit" },
  { rel: "ops/watchdog-audits", strategy: "loose-files", label: "watchdog_audit" },
  { rel: "ops/ui-audits", strategy: "directory-or-file", label: "ui_audit" },
  { rel: "ops/ux-audit-runs", strategy: "directory-or-file", label: "ux_audit" },
  { rel: "ops/drive-audits", strategy: "directory-or-file", label: "drive_audit" },
  { rel: "ops/display-audits", strategy: "directory-or-file", label: "display_audit" },
  { rel: "ops/asset-audits", strategy: "directory-or-file", label: "asset_audit" },
  { rel: "ops/queue-audits", strategy: "loose-files", label: "queue_audit" },
  { rel: "ops/raw-intake-audits", strategy: "loose-files", label: "raw_intake_audit" },
  { rel: "docs/audits", strategy: "directory-or-file", label: "docs_audit" },
  {
    rel: "docs/owner-review",
    strategy: "matching-files",
    label: "owner_review",
    match: /(audit|matrix|reconciliation|report|inventory)/i,
  },
  {
    rel: "tasks-pending",
    strategy: "matching-files",
    label: "task_register_audit",
    match: /(audit|parity|scope|gap|reality|governance)/i,
  },
];

const ID_PATTERNS = {
  raw: /RAW-\d{8}-\d{3}/g,
  requirement: /REQ-\d{8}-\d{3}/g,
  task: /TASK-\d{8}-\d{3}/g,
  decision: /DEC-\d{8}-\d{3}/g,
  question: /Q-\d{8}-\d{3}/g,
  memory: /MEM-\d{8}-\d{3}/g,
  watch: /WATCH-\d{8}-\d{3}/g,
};

const OPEN_GAP_PATTERNS = [
  /\b(obvious gap|gap|gaps|missing|not implemented|unimplemented|partially implemented|partial|failed|failure|stale|drift|regression|warning|critical|remaining|needs? follow-up|needs? implementation|next action|todo|fixme|must be implemented|must be converted|blocked|blocker|needs operator decision)\b/i,
  /\b(P0|P1|high severity|medium severity)\b/i,
  /\b(no task mapping|unmapped|orphaned|not linked|sitting there)\b/i,
];

const PROOF_PATTERNS = [
  /\b(implemented_verified|implemented and verified|implemented|already satisfied|done|completed|verified|passed|pass|deployed|pushed|live smoke|readback passed|0 findings|zero findings|no automated findings|no findings)\b/i,
  /\b(PASS\s+\d+\/\d+|SUCCESS)\b/i,
];

const BLOCKER_PATTERNS = [
  /\b(blocked|blocker|needs operator decision|approval gate|approval-gated|missing credential|missing chat id|credential|external account|owner decision|cannot run|cannot deploy|not configured)\b/i,
];

const TEXT_EXTENSIONS = new Set([".md", ".txt", ".json", ".jsonl", ".csv", ".html"]);
const MAX_TEXT_BYTES_PER_FILE = 120_000;
const MAX_PACKAGE_TEXT_CHARS = 360_000;
const DEFAULT_STALE_AFTER_DAYS = 7;

function rel(absPath, repoRoot = REPO_ROOT) {
  return path.relative(repoRoot, absPath).replace(/\\/g, "/");
}

function toPosix(input) {
  return String(input || "").replace(/\\/g, "/");
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function fileExists(absPath) {
  try {
    fs.accessSync(absPath);
    return true;
  } catch {
    return false;
  }
}

function readTextFile(absPath) {
  try {
    const stat = fs.statSync(absPath);
    const size = Math.min(stat.size, MAX_TEXT_BYTES_PER_FILE);
    const fd = fs.openSync(absPath, "r");
    const buffer = Buffer.alloc(size);
    fs.readSync(fd, buffer, 0, size, 0);
    fs.closeSync(fd);
    return buffer.toString("utf8").replace(/\u0000/g, "");
  } catch {
    return "";
  }
}

function walk(absDir, out = []) {
  if (!fileExists(absDir)) return out;
  for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const full = path.join(absDir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

function listImmediateDirectories(absRoot) {
  if (!fileExists(absRoot)) return [];
  return fs
    .readdirSync(absRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(absRoot, entry.name))
    .sort();
}

function normalizedLooseGroupName(fileName) {
  const ext = path.extname(fileName);
  const base = path.basename(fileName, ext);
  const isoRun = base.match(/^(20\d{2}-\d{2}-\d{2})T[\d-]+(?:Z)?-(.+)$/);
  if (isoRun) return `${isoRun[1]}-${isoRun[2]}`;
  return base;
}

function groupLooseFiles(absRoot, match = null) {
  if (!fileExists(absRoot)) return [];
  const groups = new Map();
  for (const entry of fs.readdirSync(absRoot, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    if (match && !match.test(entry.name)) continue;
    const full = path.join(absRoot, entry.name);
    const groupName = normalizedLooseGroupName(entry.name);
    const key = path.join(absRoot, groupName);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(full);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, files]) => ({ key, files: files.sort(), displayRel: rel(key) }));
}

function isLikelyText(absPath) {
  const ext = path.extname(absPath).toLowerCase();
  return TEXT_EXTENSIONS.has(ext);
}

function isSummaryTextFile(absPath, packageAbs) {
  if (!isLikelyText(absPath)) return false;
  const packageRel = toPosix(path.relative(packageAbs, absPath));
  const base = path.basename(absPath).toLowerCase();
  if (packageRel.includes("/screenshots/")) return false;
  if (packageRel.includes("/accessibility/") && base.endsWith(".json")) return false;
  if (packageRel.includes("/aria/") && base.endsWith(".txt")) return false;
  if (base === "observed-state-matrix.json") return false;
  if (base === "report.json" && fs.statSync(absPath).size > 500_000) return false;
  if (base.endsWith(".md")) return true;
  return [
    "status.json",
    "packet.json",
    "manifest.json",
    "summary.json",
    "report.json",
    "findings.json",
    "latest.json",
  ].includes(base);
}

function primaryFilesForPackage(packageAbs, explicitFiles = null) {
  if (explicitFiles && explicitFiles.length > 1) {
    return explicitFiles
      .filter(isLikelyText)
      .sort((a, b) => {
        const score = (file) => {
          const base = path.basename(file).toLowerCase();
          if (base.endsWith(".md")) return 0;
          if (base.endsWith("status.json")) return 1;
          if (base.endsWith("report.json")) return 2;
          if (base.endsWith(".json")) return 3;
          return 9;
        };
        const scored = score(a) - score(b);
        if (scored !== 0) return scored;
        try {
          return fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs;
        } catch {
          return a.localeCompare(b);
        }
      })
      .slice(0, 16);
  }
  const stat = fs.statSync(packageAbs);
  if (stat.isFile()) {
    return isLikelyText(packageAbs) ? [packageAbs] : [];
  }
  const files = explicitFiles || walk(packageAbs);
  const summary = files
    .filter((file) => isSummaryTextFile(file, packageAbs))
    .sort((a, b) => {
      const aRel = toPosix(path.relative(packageAbs, a));
      const bRel = toPosix(path.relative(packageAbs, b));
      const score = (value) => {
        const lower = value.toLowerCase();
        if (lower === "readme.md") return 0;
        if (lower.endsWith("report.md")) return 1;
        if (lower.endsWith("top-findings.md")) return 2;
        if (lower.endsWith("implementation-backlog.md")) return 3;
        if (lower.endsWith("status.json")) return 4;
        if (lower.endsWith(".md")) return 5;
        return 9;
      };
      return score(aRel) - score(bRel) || aRel.localeCompare(bRel);
    });
  return summary.slice(0, 16);
}

function extractIds(text) {
  const result = {};
  for (const [kind, pattern] of Object.entries(ID_PATTERNS)) {
    result[kind] = unique(text.match(pattern) || []);
  }
  return result;
}

function mergeIds(...sets) {
  const result = {};
  for (const key of Object.keys(ID_PATTERNS)) {
    result[key] = unique(sets.flatMap((set) => set?.[key] || []));
  }
  return result;
}

function hasAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function parseDateFromPath(relativePath) {
  const dashed = relativePath.match(/20\d{2}-\d{2}-\d{2}/);
  if (dashed) return dashed[0];
  const compact = relativePath.match(/20\d{6}/);
  if (!compact) return null;
  const value = compact[0];
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

function ageDaysFromPath(relativePath, now = new Date()) {
  const date = parseDateFromPath(relativePath);
  if (!date) return null;
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.valueOf())) return null;
  return Math.floor((now.valueOf() - parsed.valueOf()) / (24 * 60 * 60 * 1000));
}

function loadGitStatus(repoRoot = REPO_ROOT) {
  try {
    const output = execFileSync("git", ["status", "--porcelain=v1"], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return output
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => ({
        status: line.slice(0, 2),
        file: toPosix(line.slice(3).replace(/^"|"$/g, "")),
      }));
  } catch {
    return [];
  }
}

function gitStatusesForPath(relativePath, gitStatus) {
  const normalized = toPosix(relativePath).replace(/\/+$/, "");
  return gitStatus
    .filter((entry) => entry.file === normalized || entry.file.startsWith(`${normalized}/`))
    .map((entry) => `${entry.status} ${entry.file}`);
}

function collectBacklinkLines(repoRoot = REPO_ROOT) {
  const files = [
    "TASKS.md",
    "ops/agent-changelog.md",
    "ops/agent-task-ledger.jsonl",
    ...walk(path.join(repoRoot, "tasks-pending")).filter((file) => file.endsWith(".md")).map((file) => rel(file, repoRoot)),
  ];
  const lines = [];
  for (const relative of unique(files)) {
    const abs = path.join(repoRoot, relative);
    if (!fileExists(abs)) continue;
    const text = readTextFile(abs);
    text.split(/\r?\n/).forEach((line, index) => {
      lines.push({ file: relative, line: index + 1, text: line });
    });
  }
  return lines;
}

function backlinksForArtifact(artifact, backlinkLines) {
  const needles = unique([
    artifact.package_path,
    ...artifact.primary_files,
    path.basename(artifact.package_path),
  ]).filter((needle) => needle && needle.length > 12);
  const matches = [];
  for (const line of backlinkLines) {
    if (matches.length >= 25) break;
    if (needles.some((needle) => line.text.includes(needle))) {
      matches.push(line);
    }
  }
  const ids = mergeIds(...matches.map((line) => extractIds(line.text)));
  return {
    count: matches.length,
    ids,
    sample: matches.slice(0, 5).map((line) => `${line.file}:${line.line}`),
  };
}

function summarizeText(primaryFiles) {
  const chunks = [];
  for (const file of primaryFiles) {
    if (chunks.join("\n").length >= MAX_PACKAGE_TEXT_CHARS) break;
    chunks.push(`\n--- ${toPosix(file)} ---\n${readTextFile(file)}`);
  }
  return chunks.join("\n").slice(0, MAX_PACKAGE_TEXT_CHARS);
}

function collectAuditArtifacts(options = {}) {
  const repoRoot = options.repoRoot || REPO_ROOT;
  const specs = options.specs || AUDIT_SPECS;
  const gitStatus = options.gitStatus || loadGitStatus(repoRoot);
  const backlinkLines = options.backlinkLines || collectBacklinkLines(repoRoot);
  const artifacts = [];

  for (const spec of specs) {
    const absRoot = path.join(repoRoot, spec.rel);
    if (!fileExists(absRoot)) continue;
    if (spec.strategy === "loose-files") {
      for (const group of groupLooseFiles(absRoot, spec.match)) {
        const primaryFiles = primaryFilesForPackage(group.files[0], group.files);
        artifacts.push(
          buildArtifact({
            repoRoot,
            spec,
            packageAbs: group.key,
            explicitFiles: group.files,
            primaryFiles,
            gitStatus,
            backlinkLines,
            displayRel: group.displayRel,
          }),
        );
      }
      continue;
    }
    if (spec.strategy === "matching-files") {
      for (const group of groupLooseFiles(absRoot, spec.match)) {
        const primaryFiles = primaryFilesForPackage(group.files[0], group.files);
        artifacts.push(
          buildArtifact({
            repoRoot,
            spec,
            packageAbs: group.key,
            explicitFiles: group.files,
            primaryFiles,
            gitStatus,
            backlinkLines,
            displayRel: group.displayRel,
          }),
        );
      }
      continue;
    }
    for (const packageAbs of listImmediateDirectories(absRoot)) {
      const explicitFiles = fs.statSync(packageAbs).isDirectory() ? walk(packageAbs) : [packageAbs];
      const primaryFiles = primaryFilesForPackage(packageAbs, explicitFiles);
      artifacts.push(buildArtifact({ repoRoot, spec, packageAbs, explicitFiles, primaryFiles, gitStatus, backlinkLines }));
    }
    for (const group of groupLooseFiles(absRoot, spec.match)) {
      const primaryFiles = primaryFilesForPackage(group.files[0], group.files);
      artifacts.push(
        buildArtifact({
          repoRoot,
          spec,
          packageAbs: group.key,
          explicitFiles: group.files,
          primaryFiles,
          gitStatus,
          backlinkLines,
          displayRel: group.displayRel,
        }),
      );
    }
  }

  return artifacts
    .filter((artifact) => artifact.primary_files.length > 0 || artifact.file_count > 0)
    .sort((a, b) => a.package_path.localeCompare(b.package_path));
}

function buildArtifact({ repoRoot, spec, packageAbs, explicitFiles = null, primaryFiles, gitStatus, backlinkLines, displayRel = null }) {
  const statPath = fileExists(packageAbs) ? packageAbs : primaryFiles[0];
  const packagePath = displayRel || rel(statPath, repoRoot);
  const files = explicitFiles || (fs.statSync(statPath).isDirectory() ? walk(statPath) : [statPath]);
  const latestMtime = files.reduce((latest, file) => {
    try {
      return Math.max(latest, fs.statSync(file).mtimeMs);
    } catch {
      return latest;
    }
  }, 0);
  const text = summarizeText(primaryFiles);
  const ids = extractIds(text);
  const gitStatuses = unique([
    ...gitStatusesForPath(packagePath, gitStatus),
    ...files.flatMap((file) => gitStatusesForPath(rel(file, repoRoot), gitStatus)),
  ]);
  const artifact = {
    artifact_id: packagePath.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 120),
    kind: spec.label,
    package_path: packagePath,
    artifact_date: parseDateFromPath(packagePath),
    age_days: ageDaysFromPath(packagePath, new Date(optionsNow())),
    file_count: files.length,
    primary_files: primaryFiles.map((file) => rel(file, repoRoot)),
    latest_mtime: latestMtime ? new Date(latestMtime).toISOString() : null,
    git_statuses: gitStatuses,
    ids,
    text,
  };
  artifact.backlinks = backlinksForArtifact(artifact, backlinkLines);
  artifact.ids = mergeIds(artifact.ids, artifact.backlinks.ids);
  Object.assign(artifact, classifyArtifact(artifact));
  delete artifact.text;
  return artifact;
}

function optionsNow() {
  return process.env.AUDIT_GOVERNANCE_NOW || new Date().toISOString();
}

export function classifyArtifact(artifact, options = {}) {
  const staleAfterDays = options.staleAfterDays ?? DEFAULT_STALE_AFTER_DAYS;
  const text = artifact.text || artifact.summary_text || "";
  const ids = artifact.ids || extractIds(text);
  const hasMapping = Boolean(
    ids.requirement?.length ||
      ids.task?.length ||
      ids.decision?.length ||
      ids.watch?.length ||
      artifact.backlinks?.count > 0,
  );
  const hasOpenGap = hasAny(text, OPEN_GAP_PATTERNS);
  const hasProof = hasAny(text, PROOF_PATTERNS);
  const hasBlocker = hasAny(text, BLOCKER_PATTERNS);
  const isUntracked = (artifact.git_statuses || []).some((entry) => entry.startsWith("??"));
  const ageDays = typeof artifact.age_days === "number" ? artifact.age_days : ageDaysFromPath(artifact.package_path || "", new Date(optionsNow()));

  let status = "unclear_needs_review";
  let recommendation = "Review manually and either link to proof/task/decision/watchdog or archive.";

  if (isUntracked) {
    status = "untracked_needs_registration";
    recommendation = "Inspect for private data, then register as evidence, map to a task, or archive intentionally.";
  } else if ((hasOpenGap || hasBlocker) && !hasMapping) {
    status = ageDays !== null && ageDays >= staleAfterDays ? "stale_needs_task_mapping" : "needs_task_mapping";
    recommendation = "Create a scoped REQ/TASK/DEC/WATCH mapping or archive with rationale.";
  } else if (hasBlocker) {
    status = "blocked_or_needs_decision";
    recommendation = "Keep the blocker owner, consequence, and exact next action visible.";
  } else if (hasOpenGap && hasMapping) {
    status = "active_requirement_or_task";
    recommendation = "Work the linked requirement/task/decision/watchdog item to terminal status.";
  } else if (hasProof) {
    status = "implemented_or_proven";
    recommendation = "Keep as evidence; no new task needed unless a newer regression exists.";
  } else if (hasMapping) {
    status = "active_requirement_or_task";
    recommendation = "Review linked item status and close or block it explicitly.";
  } else if (ageDays !== null && ageDays >= staleAfterDays) {
    status = "archive_candidate";
    recommendation = "Archive as provenance or add a mapping if it still has actionable work.";
  }

  return {
    status,
    has_mapping: hasMapping,
    has_open_gap_language: hasOpenGap,
    has_proof_language: hasProof,
    has_blocker_language: hasBlocker,
    recommendation,
  };
}

function countByStatus(artifacts) {
  return artifacts.reduce((counts, artifact) => {
    counts[artifact.status] = (counts[artifact.status] || 0) + 1;
    return counts;
  }, {});
}

function rowsFor(artifacts, statuses, limit) {
  return artifacts
    .filter((artifact) => statuses.includes(artifact.status))
    .sort((a, b) => {
      const ageA = typeof a.age_days === "number" ? a.age_days : -1;
      const ageB = typeof b.age_days === "number" ? b.age_days : -1;
      return ageB - ageA || a.package_path.localeCompare(b.package_path);
    })
    .slice(0, limit);
}

function mdEscape(value) {
  return String(value ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, " ")
    .slice(0, 240);
}

function mdTable(artifacts) {
  if (!artifacts.length) return "_None._\n";
  const lines = [
    "| Status | Path | IDs | Git | Recommendation |",
    "|---|---|---|---|---|",
  ];
  for (const artifact of artifacts) {
    const ids = [
      ...(artifact.ids?.requirement || []),
      ...(artifact.ids?.task || []),
      ...(artifact.ids?.decision || []),
      ...(artifact.ids?.watch || []),
    ].slice(0, 6);
    lines.push(
      `| ${mdEscape(artifact.status)} | \`${mdEscape(artifact.package_path)}\` | ${mdEscape(ids.join(", ") || "none")} | ${mdEscape((artifact.git_statuses || []).join("; ") || "clean")} | ${mdEscape(artifact.recommendation)} |`,
    );
  }
  return `${lines.join("\n")}\n`;
}

function formatReportMarkdown(report, maxRows = 80) {
  const counts = report.status_counts;
  const countLines = Object.keys(counts)
    .sort()
    .map((status) => `- ${status}: ${counts[status]}`)
    .join("\n");
  const staleRows = rowsFor(report.artifacts, ["stale_needs_task_mapping", "needs_task_mapping"], maxRows);
  const untrackedRows = rowsFor(report.artifacts, ["untracked_needs_registration"], maxRows);
  const blockedRows = rowsFor(report.artifacts, ["blocked_or_needs_decision"], maxRows);
  const activeRows = rowsFor(report.artifacts, ["active_requirement_or_task"], maxRows);
  const provenRows = rowsFor(report.artifacts, ["implemented_or_proven"], maxRows);
  const archiveRows = rowsFor(report.artifacts, ["archive_candidate", "unclear_needs_review"], maxRows);

  const markdown = `# Audit Governance Report

Generated: ${report.generated_at}

Result: ${report.ok ? "PASS" : "NEEDS TASK MAPPING"}

This report answers whether audit artifacts are implemented/proven, linked to
active work, blocked, stale/unmapped, untracked, or archive-only candidates.
The JSON report contains the full inventory.

## Status Counts

${countLines || "- none"}

## Needs Task Mapping

These audit artifacts contain likely actionable gap language but do not have a
stable requirement/task/decision/watchdog mapping.

${mdTable(staleRows)}

## Untracked Audit Packages

These packages exist in the local worktree but are not registered in Git. They
must be inspected for private data before they are committed or archived.

${mdTable(untrackedRows)}

## Blocked Or Needs Decision

${mdTable(blockedRows)}

## Active Requirement Or Task

${mdTable(activeRows)}

## Implemented Or Proven

${mdTable(provenRows)}

## Archive Or Manual Review Candidates

${mdTable(archiveRows)}
`;
  return markdown.replace(/\n+$/u, "\n");
}

export function buildAuditGovernanceReport(options = {}) {
  const artifacts = collectAuditArtifacts(options);
  const statusCounts = countByStatus(artifacts);
  const needsMapping = (statusCounts.stale_needs_task_mapping || 0) + (statusCounts.needs_task_mapping || 0);
  return {
    schema_version: 1,
    generated_at: new Date(optionsNow()).toISOString(),
    repo_root: ".",
    ok: needsMapping === 0,
    total_artifacts: artifacts.length,
    status_counts: statusCounts,
    needs_mapping_count: needsMapping,
    artifacts,
  };
}

function parseArgs(argv) {
  const args = {
    writeReport: false,
    strict: false,
    json: false,
    maxRows: 80,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--write-report") args.writeReport = true;
    else if (arg === "--strict") args.strict = true;
    else if (arg === "--json") args.json = true;
    else if (arg === "--max-rows") {
      args.maxRows = Number(argv[index + 1] || args.maxRows);
      index += 1;
    }
  }
  return args;
}

function writeReport(report, args, repoRoot = REPO_ROOT) {
  const reportDir = path.join(repoRoot, REPORT_DIR_REL);
  ensureDir(reportDir);
  const stamp = report.generated_at.replace(/[:.]/g, "-");
  const jsonText = `${JSON.stringify(report, null, 2)}${os.EOL}`;
  const mdText = formatReportMarkdown(report, args.maxRows);
  const jsonPath = path.join(reportDir, `${stamp}-audit-governance.json`);
  const mdPath = path.join(reportDir, `${stamp}-audit-governance.md`);
  fs.writeFileSync(jsonPath, jsonText);
  fs.writeFileSync(mdPath, mdText);
  fs.writeFileSync(path.join(reportDir, "latest.json"), jsonText);
  fs.writeFileSync(path.join(reportDir, "latest.md"), mdText);
  return { jsonPath, mdPath };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const report = buildAuditGovernanceReport();
  if (args.writeReport) {
    const paths = writeReport(report, args);
    console.error(`Wrote ${rel(paths.mdPath)} and ${rel(paths.jsonPath)}`);
  }
  if (args.json) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } else {
    process.stdout.write(formatReportMarkdown(report, args.maxRows));
  }
  if (args.strict && !report.ok) {
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === THIS_FILE) {
  main();
}
