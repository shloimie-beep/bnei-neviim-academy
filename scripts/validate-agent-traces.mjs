#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TRACE_DIR = path.join(ROOT, "ops", "agent-traces");
const REQUIRED_FIELDS = [
  "trace_id",
  "parent_raw_id",
  "packet_ids",
  "source_files_read",
  "source_statements_mapped",
  "compiler_schema_version",
  "validation_results",
  "tool_actions_taken",
  "tool_actions_skipped",
  "skipped_action_reasons",
  "browser_routes_visited",
  "screenshots_captured",
  "aria_snapshots_captured",
  "accessibility_scans",
  "tests_run",
  "watchdogs_run",
  "external_actions_blocked",
  "decisions_created_or_updated",
  "blockers",
  "implementation_files_changed",
  "commits",
  "PR",
  "deployment",
  "live_smoke",
  "final_status",
  "next_packet",
  "evidence_paths"
];

const REQUIRED_V2_FIELDS = [
  "trace_schema_version",
  "raw_id",
  "stage_transitions",
  "repo_surface_map_path",
  "router_classification",
  "packet_dag_transitions",
  "context_budget_decisions",
  "visual_audit_evidence"
];

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, "/");
}

function collectJsonFiles(dir, out = []) {
  if (!fs.existsSync(dir)) {
    return out;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectJsonFiles(full, out);
    } else if (entry.name.endsWith(".json")) {
      out.push(full);
    }
  }
  return out;
}

function validateTrace(file) {
  const errors = [];
  let json;
  try {
    json = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    return [`Invalid JSON: ${error.message}`];
  }
  if (!json || typeof json !== "object" || Array.isArray(json)) {
    return ["Trace must be a JSON object."];
  }
  for (const field of REQUIRED_FIELDS) {
    if (!(field in json)) {
      errors.push(`Missing required trace field: ${field}`);
    }
  }
  if (json.trace_schema_version === "agent-trace.v2") {
    for (const field of REQUIRED_V2_FIELDS) {
      if (!(field in json)) {
        errors.push(`Missing required v2 trace field: ${field}`);
      }
    }
  }
  if (json.parent_raw_id && !/^RAW-[0-9]{8}-[0-9]{3,}$/.test(json.parent_raw_id)) {
    errors.push("parent_raw_id must match RAW-YYYYMMDD-###.");
  }
  if (json.raw_id && !/^RAW-[0-9]{8}-[0-9]{3,}$/.test(json.raw_id)) {
    errors.push("raw_id must match RAW-YYYYMMDD-###.");
  }
  if (json.trace_id && !/^TRACE-[0-9]{8}-[0-9]{3,}/.test(json.trace_id)) {
    errors.push("trace_id should match TRACE-YYYYMMDD-###.");
  }
  return errors;
}

function main() {
  const explicit = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
  const files = explicit.length ? explicit.map((arg) => path.resolve(ROOT, arg)) : collectJsonFiles(TRACE_DIR);
  const results = files.map((file) => ({ file, errors: validateTrace(file) }));
  const failed = results.filter((result) => result.errors.length);

  if (!files.length) {
    console.log("No agent trace JSON files found; trace validation skipped with pass.");
    return;
  }

  for (const result of results) {
    if (!result.errors.length) {
      console.log(`PASS ${rel(result.file)}`);
      continue;
    }
    console.log(`FAIL ${rel(result.file)}`);
    for (const error of result.errors) {
      console.log(`- ${error}`);
    }
  }
  process.exitCode = failed.length ? 1 : 0;
}

try {
  main();
} catch (error) {
  console.error(`Agent trace validator failed: ${error.stack || error.message}`);
  process.exitCode = 2;
}
