#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validatePacket } from "../../../scripts/validate-product-quality-packets.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..", "..");
const CASES_PATH = path.join(HERE, "eval-cases.json");
const REPORT_JSON = path.join(HERE, "latest-eval-report.json");
const REPORT_MD = path.join(HERE, "latest-eval-report.md");
const FIXTURES_DIR = path.resolve(HERE, "..", "fixtures");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function loadExpectedOutput(relativePath) {
  const outputPath = path.join(HERE, relativePath);
  const output = readJson(outputPath);
  if (output.fixture) {
    return {
      packet: readJson(path.resolve(path.dirname(outputPath), output.fixture)),
      outputPath,
      fixturePath: path.resolve(path.dirname(outputPath), output.fixture)
    };
  }
  return { packet: output, outputPath, fixturePath: null };
}

function getPath(value, dottedPath) {
  return dottedPath.split(".").reduce((current, part) => {
    if (current === undefined || current === null) {
      return undefined;
    }
    return current[part];
  }, value);
}

function flattenedDefectCodes(packet) {
  return (packet.visual_quality?.findings || []).flatMap((finding) => finding.defect_codes || []);
}

function expansionKeys(packet) {
  const expanded = packet.product_quality_expansion?.expanded_phrases;
  if (Array.isArray(expanded)) {
    return expanded.map((item) => String(item).toLowerCase());
  }
  if (expanded && typeof expanded === "object") {
    return Object.keys(expanded).map((item) => item.toLowerCase());
  }
  return [];
}

function screenshotViewports(packet) {
  return new Set((packet.visual_quality?.screenshot_requirements || []).map((entry) => Number(entry.viewport)));
}

function outOfScopeText(packet) {
  return (packet.out_of_scope || []).join("\n").toLowerCase();
}

function assertCase(evalCase, packet) {
  const failures = [];
  const validationErrors = validatePacket(packet);
  if (validationErrors.length) {
    failures.push(`Packet validation failed: ${[...new Set(validationErrors.map((error) => error.code))].join(", ")}`);
  }

  for (const expected of evalCase.expected_packet_properties || []) {
    const actual = getPath(packet, expected.path);
    if ("equals" in expected && actual !== expected.equals) {
      failures.push(`Expected ${expected.path} to equal ${JSON.stringify(expected.equals)}, got ${JSON.stringify(actual)}.`);
    }
    if ("contains" in expected && !String(actual || "").toLowerCase().includes(String(expected.contains).toLowerCase())) {
      failures.push(`Expected ${expected.path} to contain ${JSON.stringify(expected.contains)}.`);
    }
  }

  for (const forbidden of evalCase.forbidden_packet_properties || []) {
    const actual = getPath(packet, forbidden.path);
    if ("equals" in forbidden && actual === forbidden.equals) {
      failures.push(`Forbidden ${forbidden.path} equals ${JSON.stringify(forbidden.equals)}.`);
    }
  }

  const expansions = expansionKeys(packet);
  for (const required of evalCase.required_expansions || []) {
    if (!expansions.includes(String(required).toLowerCase())) {
      failures.push(`Missing expansion for ${required}.`);
    }
  }

  const codes = flattenedDefectCodes(packet);
  for (const required of evalCase.required_defect_codes || []) {
    if (!codes.includes(required)) {
      failures.push(`Missing defect code ${required}.`);
    }
  }

  for (const viewClass of evalCase.required_view_classes || []) {
    if (!(packet.view_classes || []).includes(viewClass)) {
      failures.push(`Missing view class ${viewClass}.`);
    }
  }

  const scopeText = outOfScopeText(packet);
  for (const phrase of evalCase.required_out_of_scope || []) {
    if (!scopeText.includes(String(phrase).toLowerCase())) {
      failures.push(`Missing out-of-scope phrase ${phrase}.`);
    }
  }

  if (evalCase.required_provider_policy && packet.external_provider_policy !== evalCase.required_provider_policy) {
    failures.push(`Expected provider policy ${evalCase.required_provider_policy}, got ${packet.external_provider_policy}.`);
  }

  if (evalCase.required_state_matrix) {
    const requiredStates = [
      "loading",
      "empty",
      "populated",
      "filtered_empty",
      "error",
      "blocked_setup",
      "preview_only",
      "success_readback",
      "permission_denied",
      "mobile_drawer_or_detail_state"
    ];
    for (const state of requiredStates) {
      if (!packet.state_matrix?.[state]) {
        failures.push(`Missing state matrix entry ${state}.`);
      }
    }
  }

  const viewports = screenshotViewports(packet);
  for (const viewport of evalCase.required_screenshots || []) {
    if (!viewports.has(Number(viewport))) {
      failures.push(`Missing screenshot viewport ${viewport}.`);
    }
  }

  for (const traceField of evalCase.required_trace_fields || []) {
    if (!(traceField in (packet.trace || {}))) {
      failures.push(`Missing trace field ${traceField}.`);
    }
  }

  return failures;
}

function invalidFixtureResults() {
  if (!fs.existsSync(FIXTURES_DIR)) {
    return [];
  }
  return fs
    .readdirSync(FIXTURES_DIR)
    .filter((file) => file.startsWith("invalid-") && file.endsWith(".json"))
    .sort()
    .map((file) => {
      const full = path.join(FIXTURES_DIR, file);
      const packet = readJson(full);
      const expected = packet.expected_failure_codes || [];
      const errors = validatePacket(packet);
      const actualCodes = [...new Set(errors.map((error) => error.code))];
      const missingExpected = expected.filter((code) => !actualCodes.includes(code));
      return {
        file: path.relative(ROOT, full).replace(/\\/g, "/"),
        expected_failure_codes: expected,
        actual_failure_codes: actualCodes,
        passed: errors.length > 0 && missingExpected.length === 0,
        missing_expected_failure_codes: missingExpected
      };
    });
}

function main() {
  const cases = readJson(CASES_PATH);
  const results = [];
  for (const evalCase of cases) {
    const loaded = loadExpectedOutput(evalCase.expected_output);
    const failures = assertCase(evalCase, loaded.packet);
    results.push({
      id: evalCase.id,
      vague_ramble: evalCase.vague_ramble,
      expected_output: path.relative(ROOT, loaded.outputPath).replace(/\\/g, "/"),
      fixture: loaded.fixturePath ? path.relative(ROOT, loaded.fixturePath).replace(/\\/g, "/") : null,
      passed: failures.length === 0,
      failures
    });
  }

  const failed = results.filter((result) => !result.passed);
  const invalidResults = invalidFixtureResults();
  const failedInvalid = invalidResults.filter((result) => !result.passed);
  const payload = {
    generated_at: new Date().toISOString(),
    total: results.length,
    passed: results.length - failed.length,
    failed: failed.length,
    invalid_fixture_total: invalidResults.length,
    invalid_fixture_passed: invalidResults.length - failedInvalid.length,
    invalid_fixture_failed: failedInvalid.length,
    results,
    invalid_fixture_results: invalidResults
  };
  fs.writeFileSync(REPORT_JSON, `${JSON.stringify(payload, null, 2)}\n`);

  const lines = [
    "# Product Quality Compiler Eval Report",
    "",
    `Generated: ${payload.generated_at}`,
    `Passed: ${payload.passed}`,
    `Failed: ${payload.failed}`,
    `Invalid fixture checks passed: ${payload.invalid_fixture_passed}/${payload.invalid_fixture_total}`,
    ""
  ];
  for (const result of results) {
    lines.push(`## ${result.passed ? "PASS" : "FAIL"} ${result.id}`);
    lines.push(`Ramble: ${result.vague_ramble}`);
    lines.push(`Output: \`${result.expected_output}\``);
    if (result.fixture) {
      lines.push(`Fixture: \`${result.fixture}\``);
    }
    if (result.failures.length) {
      lines.push("");
      for (const failure of result.failures) {
        lines.push(`- ${failure}`);
      }
    }
    lines.push("");
  }
  if (invalidResults.length) {
    lines.push("## Invalid Fixture Checks");
    lines.push("");
    lines.push("| Fixture | Result | Expected Codes | Actual Codes |");
    lines.push("|---|---|---|---|");
    for (const result of invalidResults) {
      lines.push(`| \`${result.file}\` | ${result.passed ? "PASS" : "FAIL"} | ${result.expected_failure_codes.join(", ")} | ${result.actual_failure_codes.join(", ")} |`);
    }
    lines.push("");
  }
  fs.writeFileSync(REPORT_MD, `${lines.join("\n")}\n`);

  console.log(`Product Quality Compiler eval report: ${path.relative(ROOT, REPORT_MD).replace(/\\/g, "/")}`);
  console.log(`Product Quality Compiler eval JSON: ${path.relative(ROOT, REPORT_JSON).replace(/\\/g, "/")}`);
  process.exitCode = failed.length || failedInvalid.length ? 1 : 0;
}

try {
  main();
} catch (error) {
  console.error(`Product Quality Compiler eval runner failed: ${error.stack || error.message}`);
  process.exitCode = 2;
}
