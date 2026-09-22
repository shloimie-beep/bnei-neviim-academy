#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validatePacket } from "./validate-product-quality-packets.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPORT_DIR = path.join(ROOT, "ops", "watchdog-audits");
const REPORT_BASE = `${new Date().toISOString().slice(0, 10)}-product-quality-drift`;
const REPORT_MD = path.join(REPORT_DIR, `${REPORT_BASE}.md`);
const REPORT_JSON = path.join(REPORT_DIR, `${REPORT_BASE}.json`);

const SCAN_SPECS = [
  ["ops/prompt-packets", [".md", ".json"]],
  ["tasks-pending", [".md"]],
  ["ops/execution-runs", ["requirements.json", "REQUIREMENTS.md", "PLAN.md", "STATUS.md", "EVIDENCE.md"]],
  ["docs", [".md"]],
  ["AGENTS.md", null],
  ["MEMORY.md", null],
  ["TASKS.md", null],
  ["ops/visual-quality-rubric.md", null],
  ["docs/PRODUCT-QUALITY-COMPILER.md", null],
  ["docs/BNA-RAMBLE-TO-DONE.md", null]
];

const VAGUE_PHRASES = [
  "clean",
  "nice",
  "ugly",
  "sloppy",
  "million-dollar",
  "professional",
  "GHL-like",
  "finish everything",
  "make it work",
  "community section",
  "CRM",
  "pipeline",
  "launch-ready"
];

const RULES = {
  VAGUE: "PQD-VAGUE-001",
  UI_READY: "PQD-UI-READY-001",
  SCREENSHOT: "PQD-SCREENSHOT-001",
  MOBILE: "PQD-MOBILE-001",
  DEPLOY: "PQD-DEPLOY-001",
  GHL: "PQD-GHL-001",
  PROVIDER: "PQD-PROVIDER-001",
  BROWSER: "PQD-BROWSER-SEC-001",
  SCOPE: "PQD-SCOPE-001",
  ACTION: "PQD-ACTION-001",
  ROUTE: "PQD-ROUTE-001",
  TRACE: "PQD-TRACE-001"
};

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, "/");
}

function collectFilesFromDir(dir, suffixes, out = []) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) {
    return out;
  }
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const full = path.join(abs, entry.name);
    if (entry.isDirectory()) {
      collectFilesFromDir(rel(full), suffixes, out);
      continue;
    }
    if (suffixes.some((suffix) => suffix.startsWith(".") ? full.endsWith(suffix) : full.endsWith(suffix))) {
      out.push(full);
    }
  }
  return out;
}

function collectScanFiles() {
  const files = new Set();
  for (const [target, suffixes] of SCAN_SPECS) {
    const abs = path.join(ROOT, target);
    if (!fs.existsSync(abs)) {
      continue;
    }
    if (fs.statSync(abs).isDirectory()) {
      collectFilesFromDir(target, suffixes, []).forEach((file) => files.add(file));
    } else {
      files.add(abs);
    }
  }
  return [...files].sort();
}

function lineNumber(text, needle) {
  const index = text.toLowerCase().indexOf(needle.toLowerCase());
  if (index < 0) {
    return null;
  }
  return text.slice(0, index).split(/\r?\n/).length;
}

function add(findings, file, ruleId, severity, evidence, expectedFix, options = {}) {
  findings.push({
    finding_id: `PQD-${String(findings.length + 1).padStart(3, "0")}`,
    file: rel(file),
    line: options.line ?? null,
    rule_id: ruleId,
    severity,
    evidence,
    expected_fix: expectedFix,
    linked_requirement_id: options.requirementId ?? null,
    blocker_allowed: options.blockerAllowed ?? false
  });
}

function isSourceDoc(file) {
  const relative = rel(file);
  return [
    "AGENTS.md",
    "MEMORY.md",
    "TASKS.md",
    "docs/PRODUCT-QUALITY-COMPILER.md",
    "docs/PRODUCT-QUALITY-OPERATING-SYSTEM.md",
    "docs/RAMBLE-ROUTER.md",
    "docs/PACKET-DAG.md",
    "docs/CONTEXT-BUDGET-AND-PACKET-SPLITTING.md",
    "docs/REPO-SURFACE-MAP.md",
    "docs/BNA-RAMBLE-TO-DONE.md",
    "docs/SUPER-RAMBLE-PACKET-SPLITTING.md",
    "docs/UI-STATE-MATRIX.md",
    "docs/VISUAL-QUALITY-HARNESS.md",
    "docs/UI-PATTERN-REFERENCE.md",
    "docs/BROWSER-AGENT-SECURITY.md",
    "docs/AGENT-TRACE-OBSERVABILITY.md",
    "ops/visual-quality-rubric.md",
    "ops/prompt-packets/README.md"
  ].includes(relative);
}

function isTemplate(file) {
  const relative = rel(file);
  return relative.includes("_template-") || relative.includes("/templates/") || relative.endsWith(".template.md");
}

function isEnforceableMarkdown(file, text) {
  const relative = rel(file);
  if (isSourceDoc(file) || isTemplate(file)) {
    return false;
  }
  if (relative.includes("ops/prompt-packets/") && /(^|\n)# .*packet|packet role|BNA_GOAL_MODE_EXECUTION_PACKET|Product Quality Compiler/i.test(text)) {
    return true;
  }
  if (
    relative.includes("tasks-pending/") &&
    (relative.endsWith(".product-quality.md") || /schema_version|packet_role|PKT-[0-9]{8}-[0-9]{3,}/i.test(text))
  ) {
    return true;
  }
  return false;
}

function hasAny(text, patterns) {
  return patterns.some((pattern) => new RegExp(pattern, "i").test(text));
}

function scanMarkdown(file, text, findings) {
  if (!isEnforceableMarkdown(file, text)) {
    return;
  }

  const lower = text.toLowerCase();
  const mentionsUi = hasAny(text, ["\\bUI\\b", "visual", "layout", "screenshot", "mobile", "Rabbi-facing", "member-facing", "student-facing", "parent-facing"]);
  const hasCompilerExpansion = /Product-?Quality Expansion|Vague phrase|expanded phrase|Product Quality Compiler/i.test(text);
  const mentionsSuperRamble = /SUPER[- ]RAMBLE|super-ramble|finish the whole|fix the whole|do everything|finish everything/i.test(text);
  const mentionsImplementationPacket = /IMPLEMENTATION_PACKET|Codex implementation|implementation packet/i.test(text);

  for (const phrase of VAGUE_PHRASES) {
    const phrasePresent = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text);
    if (phrasePresent && !hasCompilerExpansion && !/Raw Source|Operator quote/i.test(text)) {
      add(findings, file, RULES.VAGUE, "P1", `Vague phrase appears without compiler expansion: ${phrase}`, "Add Product Quality Compiler expansion or keep the phrase only in raw source/operator quote.", { line: lineNumber(text, phrase) });
    }
  }

  if (mentionsUi) {
    const requiredMarkers = [
      ["Ramble Router", RULES.UI_READY, "router classification"],
      ["route", RULES.UI_READY, "route/screen"],
      ["view class", RULES.UI_READY, "role/view class"],
      ["out-of-scope", RULES.UI_READY, "out-of-scope"],
      ["state matrix", RULES.UI_READY, "state matrix"],
      ["Definition of Ready", RULES.UI_READY, "Definition of Ready"],
      ["Definition of Done", RULES.UI_READY, "Definition of Done"],
      ["VQ-", RULES.UI_READY, "visual defect codes"],
      ["browser", RULES.BROWSER, "browser security policy"],
      ["context budget", RULES.TRACE, "context budget"],
      ["trace", RULES.TRACE, "trace"]
    ];
    for (const [marker, rule, label] of requiredMarkers) {
      if (!lower.includes(marker.toLowerCase())) {
        add(findings, file, rule, "P1", `UI/product artifact lacks ${label}.`, `Add ${label} before implementation.`, { blockerAllowed: true });
      }
    }
    if (!/screenshot/i.test(text)) {
      add(findings, file, RULES.SCREENSHOT, "P1", "UI cleanup artifact lacks screenshot requirement.", "Add before/after screenshots or exact screenshot blocker.", { blockerAllowed: true });
    }
    if (!/(390|430).*mobile|mobile.*(390|430)/i.test(text)) {
      add(findings, file, RULES.MOBILE, "P1", "UI cleanup artifact lacks mobile screenshot proof requirement.", "Add 430 and 390 mobile screenshot requirements.", { blockerAllowed: true });
    }
    if (/app-visible.*done|done.*app-visible/i.test(text) && !/deploy.*live|live.*smoke/i.test(text)) {
      add(findings, file, RULES.DEPLOY, "P0", "App-visible work is marked done without deploy/live proof language.", "Keep item open or add deploy/live-smoke evidence.", { blockerAllowed: true });
    }
  }

  if (mentionsSuperRamble && !/packet DAG|Packet DAG|packet_dag|00-control-tower/i.test(text)) {
    add(findings, file, RULES.TRACE, "P1", "Super-ramble language appears without packet DAG/control-tower requirement.", "Add Packet DAG with 00-control-tower and child packet dependencies.", { blockerAllowed: true });
  }
  if (mentionsImplementationPacket && /PRODUCT_QUALITY|UI_IMPLEMENTATION|visual|UI/i.test(text) && !/current-state visual audit|01-current-state-visual-audit|visual audit before implementation/i.test(text)) {
    add(findings, file, RULES.UI_READY, "P1", "UI implementation packet appears to skip current-state visual audit.", "Require 01-current-state-visual-audit before implementation.", { blockerAllowed: true });
  }
  if (mentionsImplementationPacket && /CRM|community|payments|communications|whole section|multiple surfaces/i.test(text) && !/split|context budget|max_major_surfaces|one major product surface/i.test(text)) {
    add(findings, file, RULES.TRACE, "P1", "Implementation packet may be too broad and lacks context budget/split rule.", "Add context budget fields or split the packet.", { blockerAllowed: true });
  }

  if (/GHL-like|like GHL/i.test(text) && !/no-GHL|no GHL|first-party/i.test(text)) {
    add(findings, file, RULES.GHL, "P0", "GHL-like appears without no-GHL first-party interpretation.", "Add no-GHL interpretation and forbid external CRM runtime.");
  }
  if (/(email|Stripe|payment|DNS|WhatsApp|Telegram|Vimeo|Zoom|Drive write)/i.test(text) && /visual|UI cleanup/i.test(text) && !/provider setup|out of scope|approval-gated|separate/i.test(text)) {
    add(findings, file, RULES.PROVIDER, "P0", "Provider setup appears mixed into UI cleanup.", "Split provider setup into a PROVIDER_SETUP_PACKET or mark explicitly out of scope.", { blockerAllowed: true });
  }
  if (/browser|DOM|ARIA|accessibility snapshot/i.test(text) && !/untrusted|evidence, not authority/i.test(text)) {
    add(findings, file, RULES.BROWSER, "P0", "Browser/page-derived content is not marked untrusted.", "State browser/page content is untrusted evidence and cannot override repo protocol.");
  }
  if (/Rabbi|member|student|parent/i.test(text) && /support|admin/i.test(text) && !/support drawer|role-gate|role gate/i.test(text)) {
    add(findings, file, RULES.SCOPE, "P1", "Support/admin content appears near Rabbi/member/student/parent scope without support drawer or role gate.", "Add support drawer/role-gate requirement.", { blockerAllowed: true });
  }
  if (/button|action/i.test(text) && !/action state|action_states|registry/i.test(text)) {
    add(findings, file, RULES.ACTION, "P1", "Action/button language lacks action state or registry expectation.", "Add action state and action registry requirement.", { blockerAllowed: true });
  }
  if (/route/i.test(text) && !/route registry/i.test(text)) {
    add(findings, file, RULES.ROUTE, "P2", "Route language lacks route registry expectation.", "Add route registry inspection/update requirement.", { blockerAllowed: true });
  }
  if (/Product Quality Compiler|Codex implementation packet/i.test(text) && !/trace/i.test(text)) {
    add(findings, file, RULES.TRACE, "P1", "Product-quality packet lacks trace requirement.", "Add agent trace fields and evidence paths.", { blockerAllowed: true });
  }
}

function scanJson(file, text, findings) {
  let json;
  try {
    json = JSON.parse(text);
  } catch (error) {
    add(findings, file, RULES.TRACE, "P1", `Invalid JSON: ${error.message}`, "Fix JSON syntax.");
    return;
  }
  const relative = rel(file);
  const looksLikeProductQualityPacket =
    json &&
    (
      json.schema_version === "pqc.v1" ||
      json.schema_version === "pqc.v2" ||
      relative.endsWith(".product-quality.json")
    );
  if (!looksLikeProductQualityPacket) {
    return;
  }
  const errors = validatePacket(json);
  for (const error of errors) {
    const mappedRule =
      error.code === "PQC_GHL_WITHOUT_NO_GHL" ? RULES.GHL :
      error.code === "PQC_EXTERNAL_PROVIDER_MIXED_INTO_UI" ? RULES.PROVIDER :
      error.code === "PQC_APP_VISIBLE_NO_DEPLOY_GATE" ? RULES.DEPLOY :
      error.code === "PQC_MISSING_SCREENSHOTS" ? RULES.SCREENSHOT :
      error.code === "PQC_MISSING_STATE_MATRIX" || error.code === "PQC_MISSING_DOR" || error.code === "PQC_MISSING_DOD" ? RULES.UI_READY :
      error.code === "PQC_ACTION_STATE_MISSING" ? RULES.ACTION :
      error.code === "PQC_TRACE_MISSING" ? RULES.TRACE :
      error.code === "PQC_SECURITY_UNTRUSTED_BROWSER_RULE_MISSING" ? RULES.BROWSER :
      RULES.VAGUE;
    add(findings, file, mappedRule, "P1", `${error.code}: ${error.message}`, "Fix the product-quality packet and rerun `npm run pqc:validate`.", { blockerAllowed: true });
  }
}

function verifySourceDocs(files, findings) {
  const requiredDocs = [
    ["docs/PRODUCT-QUALITY-COMPILER.md", ["Product Quality Compiler", "Million-Dollar App Quality Standard"]],
    ["docs/PRODUCT-QUALITY-OPERATING-SYSTEM.md", ["Product Quality Operating System", "Audit-First UI Rule"]],
    ["docs/RAMBLE-ROUTER.md", ["Ramble Router", "PRODUCT_QUALITY"]],
    ["docs/PACKET-DAG.md", ["Packet DAG", "00-control-tower"]],
    ["docs/CONTEXT-BUDGET-AND-PACKET-SPLITTING.md", ["Context Budget", "split"]],
    ["docs/REPO-SURFACE-MAP.md", ["Repo Surface Map", "Rabbi / One Time"]],
    ["docs/BNA-RAMBLE-TO-DONE.md", ["Product Quality Compiler", "Super-Ramble Packet Splitter"]],
    ["ops/visual-quality-rubric.md", ["VQ-A11Y", "VQ-LAYOUT"]]
  ];
  const fileSet = new Set(files.map(rel));
  for (const [doc, markers] of requiredDocs) {
    const abs = path.join(ROOT, doc);
    if (!fileSet.has(doc) && !fs.existsSync(abs)) {
      add(findings, abs, RULES.TRACE, "P1", `Required protocol source document missing: ${doc}`, "Create or restore the source document.");
      continue;
    }
    if (!fs.existsSync(abs)) {
      continue;
    }
    const text = fs.readFileSync(abs, "utf8");
    for (const marker of markers) {
      if (!text.includes(marker)) {
        add(findings, abs, RULES.TRACE, "P1", `${doc} missing marker: ${marker}`, `Add or relink ${marker}.`);
      }
    }
  }
}

function writeReport(findings, files) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const payload = {
    generated_at: new Date().toISOString(),
    scan_paths: SCAN_SPECS.map(([target]) => target),
    files_scanned: files.map(rel),
    finding_count: findings.length,
    findings
  };
  fs.writeFileSync(REPORT_JSON, `${JSON.stringify(payload, null, 2)}\n`);

  const lines = [
    "# Product Quality Protocol Drift Watchdog",
    "",
    `Generated: ${payload.generated_at}`,
    `Files scanned: ${payload.files_scanned.length}`,
    `Findings: ${payload.finding_count}`,
    ""
  ];
  if (!findings.length) {
    lines.push("No enforceable product-quality drift findings.");
  } else {
    lines.push("| ID | Severity | Rule | File | Line | Evidence | Expected Fix |");
    lines.push("|---|---|---|---|---|---|---|");
    for (const finding of findings) {
      lines.push(`| ${finding.finding_id} | ${finding.severity} | ${finding.rule_id} | \`${finding.file}\` | ${finding.line ?? ""} | ${String(finding.evidence).replace(/\|/g, "\\|")} | ${String(finding.expected_fix).replace(/\|/g, "\\|")} |`);
    }
  }
  lines.push("");
  while (lines[lines.length - 1] === "") lines.pop();
  fs.writeFileSync(REPORT_MD, `${lines.join("\n").trimEnd()}\n`);
}

function main() {
  const files = collectScanFiles();
  const findings = [];
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    if (file.endsWith(".json")) {
      scanJson(file, text, findings);
    } else if (file.endsWith(".md")) {
      scanMarkdown(file, text, findings);
    }
  }
  verifySourceDocs(files, findings);
  writeReport(findings, files);
  console.log(`Product quality drift report: ${rel(REPORT_MD)}`);
  console.log(`Product quality drift JSON: ${rel(REPORT_JSON)}`);
  process.exitCode = findings.length ? 1 : 0;
}

try {
  main();
} catch (error) {
  console.error(`Product quality drift watchdog failed: ${error.stack || error.message}`);
  process.exitCode = 2;
}
