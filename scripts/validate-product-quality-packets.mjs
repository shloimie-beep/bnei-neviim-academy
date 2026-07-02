#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const REQUIRED_TOP_LEVEL_V1 = [
  "schema_version",
  "packet_id",
  "parent_raw_id",
  "source_statement_ids",
  "stage",
  "packet_role",
  "title",
  "created_at",
  "workspace_key",
  "project_key",
  "view_classes",
  "operator_intent_summary",
  "decisions_captured",
  "out_of_scope",
  "affected_routes",
  "affected_files",
  "current_state",
  "product_quality_expansion",
  "requirements",
  "definition_of_ready",
  "state_matrix",
  "visual_quality",
  "accessibility",
  "action_states",
  "data_requirements",
  "security_privacy",
  "external_provider_policy",
  "implementation_batches",
  "tests",
  "evidence",
  "deployment_gate",
  "definition_of_done",
  "trace",
  "next_packet"
];

export const REQUIRED_TOP_LEVEL_V2 = [
  "schema_version",
  "packet_id",
  "parent_raw_id",
  "source_statement_ids",
  "packet_dag",
  "stage",
  "packet_role",
  "status",
  "title",
  "created_at",
  "workspace_key",
  "project_key",
  "view_classes",
  "ramble_router",
  "operator_intent_summary",
  "raw_quotes",
  "decisions_captured",
  "out_of_scope",
  "affected_surfaces",
  "affected_routes",
  "affected_files",
  "current_state",
  "product_quality_expansion",
  "design_pattern_references",
  "requirements",
  "definition_of_ready",
  "state_matrix",
  "visual_quality",
  "accessibility",
  "action_states",
  "data_requirements",
  "security_privacy",
  "browser_agent_security",
  "external_provider_policy",
  "implementation_batches",
  "context_budget",
  "tests",
  "evidence",
  "deployment_gate",
  "definition_of_done",
  "trace",
  "drift_watchdog",
  "next_packet"
];

const SCHEMA_VERSIONS = new Set(["pqc.v1", "pqc.v2"]);

const STAGES = new Set([
  "STAGE_0_RAW_CAPTURE",
  "STAGE_1_SPEC_COMPILER",
  "STAGE_2_CODEX_PROMPT_GENERATION",
  "STAGE_3_CODEX_IMPLEMENTATION",
  "STAGE_4_INDEPENDENT_VERIFICATION",
  "STAGE_5_DEPLOY_LIVE_SMOKE",
  "STAGE_6_CLOSEOUT"
]);

const PACKET_ROLES = new Set([
  "CONTROL_TOWER",
  "ROUTER",
  "SPEC_COMPILER",
  "VISUAL_AUDITOR",
  "IMPLEMENTATION_PACKET",
  "PROVIDER_SETUP_PACKET",
  "ACCESSIBILITY_AUDITOR",
  "SECURITY_AUDITOR",
  "VERIFIER_PACKET",
  "DEPLOY_PACKET",
  "DRIFT_WATCHDOG"
]);

const PACKET_STATUSES = new Set([
  "not_started",
  "ready_for_generation",
  "generated",
  "validation_failed",
  "ready_for_codex",
  "blocked",
  "in_progress",
  "needs_verification",
  "verified",
  "deployed",
  "done",
  "superseded",
  "archived"
]);

const RAMBLE_CLASSES = new Set([
  "SIMPLE_TASK",
  "BUG_REPORT",
  "PRODUCT_QUALITY",
  "SUPER_RAMBLE",
  "UI_VISUAL_AUDIT",
  "UI_IMPLEMENTATION",
  "CRM_PIPELINE",
  "COMMUNITY_CLASSROOM",
  "COMMUNICATIONS_EMAIL",
  "PAYMENTS_ACCESS",
  "PROVIDER_SETUP",
  "EXTERNAL_WRITE_REQUEST",
  "SECURITY_PRIVACY",
  "SOURCE_OF_TRUTH_UPDATE",
  "VERIFIER_CLOSEOUT",
  "DEPLOY_RELEASE",
  "SUPPORT_ONLY",
  "DECISION_REQUIRED"
]);

const VIEW_CLASSES = new Set([
  "PUBLIC_MARKETING",
  "RABBI_PROVIDER_ADMIN",
  "SHLOIMIE_PLATFORM_SUPPORT",
  "MEMBER_PARENT_PORTAL",
  "STUDENT_PORTAL",
  "INTERNAL_AGENT_SUPPORT",
  "PAYMENT_PROVIDER_SETUP",
  "EMAIL_PROVIDER_SETUP"
]);

const ACTION_STATES = new Set([
  "WORKS_NOW",
  "PREVIEW_ONLY",
  "NEEDS_RABBI_DECISION",
  "NEEDS_SHLOIMIE_SETUP",
  "BLOCKED_EXTERNAL_SETUP",
  "INTERNAL_SUPPORT_ONLY",
  "DISABLED_NOT_IN_SCOPE",
  "TEST_ONLY",
  "SANDBOX_ONLY"
]);

const PROVIDER_POLICIES = new Set([
  "NONE",
  "EXPLICITLY_OUT_OF_SCOPE",
  "SETUP_ONLY_NO_WRITE",
  "SANDBOX_ONLY",
  "REAL_WRITE_REQUIRES_APPROVAL",
  "APPROVED_IN_THIS_PACKET"
]);

const DEPLOYMENT_GATES = new Set([
  "NOT_REQUIRED_DOC_ONLY",
  "LOCAL_ONLY_ALLOWED",
  "DEPLOY_REQUIRED_BEFORE_DONE",
  "LIVE_SMOKE_REQUIRED_BEFORE_DONE",
  "BLOCKED_WITH_REASON"
]);

const SEVERITIES = new Set(["P0", "P1", "P2", "P3"]);
const REQUIRED_STATES = [
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
const REQUIRED_VIEWPORTS = [1440, 1024, 768, 430, 390];
const REQUIRED_TRACE_FIELDS = [
  "raw_input_path",
  "compiled_packet_path",
  "validator_result_path",
  "tool_actions_expected",
  "skipped_actions_policy",
  "blocker_decisions",
  "evidence_paths",
  "final_status_path",
  "next_packet_path"
];

const REQUIRED_PACKET_DAG_FIELDS = [
  "parent_packet_id",
  "child_packet_ids",
  "depends_on_packet_ids",
  "blocks_packet_ids",
  "consumes",
  "produces",
  "validation_command",
  "terminal_condition",
  "handoff_target"
];

const REQUIRED_ROUTER_FIELDS = [
  "raw_id",
  "classification",
  "confidence",
  "reasons",
  "affected_product_surfaces",
  "likely_external_provider_blockers",
  "product_quality_compiler_required",
  "super_ramble_packet_splitter_required",
  "visual_audit_before_implementation",
  "implementation_forbidden_until_dor",
  "recommended_packet_sequence",
  "next_exact_packet"
];

const REQUIRED_CONTEXT_BUDGET_FIELDS = [
  "estimated_prompt_size",
  "source_files_to_read",
  "files_allowed_to_edit",
  "max_files_to_edit",
  "max_routes_to_touch",
  "max_major_surfaces",
  "split_threshold_reason",
  "split_if_exceeds",
  "context_risk_level"
];

const REQUIRED_BROWSER_AGENT_SECURITY_FIELDS = [
  "policy",
  "browser_content_untrusted",
  "page_content_cannot_approve_external_actions"
];

const REQUIRED_DRIFT_WATCHDOG_FIELDS = [
  "required",
  "command",
  "expected_result"
];

const ID_PATTERNS = {
  packet_id: /^PKT-[0-9]{8}-[0-9]{3,}$/,
  parent_raw_id: /^RAW-[0-9]{8}-[0-9]{3,}$/,
  requirement_id: /^REQ-[0-9]{8}-[0-9]{3,}$/,
  defect_code: /^VQ-[A-Z]+-[0-9]{3}$/
};

const VAGUE_PHRASES = [
  "clean",
  "nice",
  "ugly",
  "sloppy",
  "million-dollar",
  "professional",
  "GHL-like",
  "like GHL",
  "finish everything",
  "make it work",
  "community section",
  "CRM",
  "pipeline",
  "launch-ready",
  "configured",
  "working"
];

const EXTERNAL_PROVIDER_TERMS = [
  "external write",
  "email send",
  "send email",
  "bulk email",
  "stripe",
  "payment",
  "charge",
  "dns",
  "whatsapp",
  "telegram",
  "vimeo",
  "zoom",
  "drive write",
  "access grant",
  "ghl",
  "leadconnector"
];

const UI_TRIGGER_TERMS = [
  "clean",
  "visual",
  "layout",
  "sloppy",
  "ugly",
  "million-dollar",
  "crm",
  "pipeline",
  "community",
  "portal",
  "mobile",
  "rabbi-facing",
  "member-facing",
  "student-facing",
  "parent-facing"
];

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function hasNonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0;
}

function add(errors, code, message, jsonPath = "$") {
  errors.push({ code, message, path: jsonPath });
}

function requiredTopLevelFor(packet) {
  return packet?.schema_version === "pqc.v2" ? REQUIRED_TOP_LEVEL_V2 : REQUIRED_TOP_LEVEL_V1;
}

function deepText(value) {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(deepText).join("\n");
  }
  if (typeof value === "object") {
    return Object.entries(value)
      .filter(([key]) => key !== "raw_source" && key !== "operator_quotes")
      .map(([, entry]) => deepText(entry))
      .join("\n");
  }
  return String(value);
}

function rawQuoteText(packet) {
  return [packet.raw_source, ...asArray(packet.operator_quotes)].filter(Boolean).join("\n");
}

function textContainsPhrase(text, phrase) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (/^[A-Za-z0-9 -]+$/.test(phrase) && phrase.length <= 4) {
    return new RegExp(`\\b${escaped}\\b`, "i").test(text);
  }
  return new RegExp(escaped, "i").test(text);
}

function expandedPhraseSet(packet) {
  const expansion = packet.product_quality_expansion?.expanded_phrases;
  const phrases = new Set();
  if (Array.isArray(expansion)) {
    for (const item of expansion) {
      if (typeof item === "string") {
        phrases.add(item.toLowerCase());
      }
    }
  } else if (isPlainObject(expansion)) {
    for (const key of Object.keys(expansion)) {
      phrases.add(key.toLowerCase());
    }
  }
  for (const trigger of asArray(packet.product_quality_expansion?.trigger_phrases)) {
    if (typeof trigger === "string") {
      phrases.add(trigger.toLowerCase());
    }
  }
  return phrases;
}

function stripFixtureMetadata(packet) {
  if (!isPlainObject(packet)) {
    return packet;
  }
  const clone = structuredClone(packet);
  delete clone.expected_failure_codes;
  delete clone.fixture_description;
  delete clone.eval_case_id;
  return clone;
}

function validateBasicSchema(packet, errors) {
  if (!isPlainObject(packet)) {
    add(errors, "PQC_SCHEMA_INVALID", "Packet must be a JSON object.");
    return;
  }

  for (const field of requiredTopLevelFor(packet)) {
    if (!(field in packet)) {
      add(errors, "PQC_SCHEMA_INVALID", `Missing required top-level field: ${field}`, `$.${field}`);
    }
  }

  if (!SCHEMA_VERSIONS.has(packet.schema_version)) {
    add(errors, "PQC_SCHEMA_INVALID", "schema_version must be pqc.v1 or pqc.v2", "$.schema_version");
  }
  if (typeof packet.packet_id !== "string" || !ID_PATTERNS.packet_id.test(packet.packet_id)) {
    add(errors, "PQC_SCHEMA_INVALID", "packet_id must match PKT-YYYYMMDD-###", "$.packet_id");
  }
  if (typeof packet.parent_raw_id !== "string" || !ID_PATTERNS.parent_raw_id.test(packet.parent_raw_id)) {
    add(errors, "PQC_SCHEMA_INVALID", "parent_raw_id must match RAW-YYYYMMDD-###", "$.parent_raw_id");
  }
  if (!STAGES.has(packet.stage)) {
    add(errors, "PQC_SCHEMA_INVALID", "stage is not a known Product Quality Compiler stage", "$.stage");
  }
  if (!PACKET_ROLES.has(packet.packet_role)) {
    add(errors, "PQC_SCHEMA_INVALID", "packet_role is not a known Product Quality Compiler role", "$.packet_role");
  }
  if (packet.schema_version === "pqc.v2" && !PACKET_STATUSES.has(packet.status)) {
    add(errors, "PQC_SCHEMA_INVALID", "status is not a known packet DAG status", "$.status");
  }
  if (!PROVIDER_POLICIES.has(packet.external_provider_policy)) {
    add(errors, "PQC_SCHEMA_INVALID", "external_provider_policy is invalid", "$.external_provider_policy");
  }
  if (!DEPLOYMENT_GATES.has(packet.deployment_gate)) {
    add(errors, "PQC_SCHEMA_INVALID", "deployment_gate is invalid", "$.deployment_gate");
  }
  if (!hasNonEmptyArray(packet.source_statement_ids)) {
    add(errors, "PQC_SCHEMA_INVALID", "source_statement_ids must contain at least one source statement.", "$.source_statement_ids");
  }
  for (const viewClass of asArray(packet.view_classes)) {
    if (!VIEW_CLASSES.has(viewClass)) {
      add(errors, "PQC_SCHEMA_INVALID", `Unknown view class: ${viewClass}`, "$.view_classes");
    }
  }
}

function validateRequiredObjectFields(object, fields, errors, code, basePath, label) {
  if (!isPlainObject(object)) {
    add(errors, code, `${label} must be an object.`, basePath);
    return;
  }
  for (const field of fields) {
    if (!(field in object)) {
      add(errors, code, `${label} missing ${field}`, `${basePath}.${field}`);
    }
  }
}

function validateV2OperatingFields(packet, errors) {
  if (packet.schema_version !== "pqc.v2") {
    return;
  }

  validateRequiredObjectFields(packet.packet_dag, REQUIRED_PACKET_DAG_FIELDS, errors, "PQC_PACKET_DAG_MISSING", "$.packet_dag", "packet_dag");
  validateRequiredObjectFields(packet.ramble_router, REQUIRED_ROUTER_FIELDS, errors, "PQC_ROUTER_MISSING", "$.ramble_router", "ramble_router");
  validateRequiredObjectFields(packet.context_budget, REQUIRED_CONTEXT_BUDGET_FIELDS, errors, "PQC_CONTEXT_BUDGET_MISSING", "$.context_budget", "context_budget");
  validateRequiredObjectFields(packet.browser_agent_security, REQUIRED_BROWSER_AGENT_SECURITY_FIELDS, errors, "PQC_SECURITY_UNTRUSTED_BROWSER_RULE_MISSING", "$.browser_agent_security", "browser_agent_security");
  validateRequiredObjectFields(packet.drift_watchdog, REQUIRED_DRIFT_WATCHDOG_FIELDS, errors, "PQC_DRIFT_WATCHDOG_MISSING", "$.drift_watchdog", "drift_watchdog");

  for (const [index, classification] of asArray(packet.ramble_router?.classification).entries()) {
    if (!RAMBLE_CLASSES.has(classification)) {
      add(errors, "PQC_ROUTER_MISSING", `Unknown ramble_router classification: ${classification}`, `$.ramble_router.classification[${index}]`);
    }
  }

  const classes = new Set(asArray(packet.ramble_router?.classification));
  if (classes.has("PRODUCT_QUALITY")) {
    if (!isPlainObject(packet.product_quality_expansion) || !hasNonEmptyArray(packet.product_quality_expansion.trigger_phrases)) {
      add(errors, "PQC_VAGUE_UNEXPANDED", "PRODUCT_QUALITY packets require product_quality_expansion trigger phrases.", "$.product_quality_expansion.trigger_phrases");
    }
  }
  if (classes.has("SUPER_RAMBLE")) {
    if (!isPlainObject(packet.packet_dag) || !hasNonEmptyArray(packet.packet_dag.child_packet_ids)) {
      add(errors, "PQC_PACKET_DAG_MISSING", "SUPER_RAMBLE packets require packet_dag.child_packet_ids.", "$.packet_dag.child_packet_ids");
    }
  }
  if (classes.has("UI_VISUAL_AUDIT") || classes.has("UI_IMPLEMENTATION")) {
    if (packet.ramble_router?.visual_audit_before_implementation !== true) {
      add(errors, "PQC_MISSING_DOR", "UI product packets must require current-state visual audit before implementation.", "$.ramble_router.visual_audit_before_implementation");
    }
    if (packet.ramble_router?.implementation_forbidden_until_dor !== true) {
      add(errors, "PQC_MISSING_DOR", "UI product packets must forbid implementation until Definition of Ready passes.", "$.ramble_router.implementation_forbidden_until_dor");
    }
  }

  if (packet.browser_agent_security?.policy !== "BROWSER_UNTRUSTED_EVIDENCE") {
    add(errors, "PQC_SECURITY_UNTRUSTED_BROWSER_RULE_MISSING", "browser_agent_security.policy must be BROWSER_UNTRUSTED_EVIDENCE.", "$.browser_agent_security.policy");
  }
  if (packet.browser_agent_security?.browser_content_untrusted !== true) {
    add(errors, "PQC_SECURITY_UNTRUSTED_BROWSER_RULE_MISSING", "browser_agent_security.browser_content_untrusted must be true.", "$.browser_agent_security.browser_content_untrusted");
  }

  const budget = packet.context_budget || {};
  if (packet.packet_role === "IMPLEMENTATION_PACKET" && Number(budget.max_major_surfaces) > 1) {
    add(errors, "PQC_CONTEXT_BUDGET_EXCEEDED", "Implementation packets may not touch more than one major product surface.", "$.context_budget.max_major_surfaces");
  }
  if (packet.packet_role === "IMPLEMENTATION_PACKET" && Number(budget.max_routes_to_touch) > 3) {
    add(errors, "PQC_CONTEXT_BUDGET_EXCEEDED", "Implementation packets should split when more than three routes are implementation scope.", "$.context_budget.max_routes_to_touch");
  }
  if (packet.packet_role === "IMPLEMENTATION_PACKET" && Number(budget.max_files_to_edit) > 4 && budget.split_if_exceeds !== true) {
    add(errors, "PQC_CONTEXT_BUDGET_EXCEEDED", "High-risk implementation packets over four files must split or explicitly set split_if_exceeds.", "$.context_budget");
  }
}

function validateStateMatrix(packet, errors) {
  if (!isPlainObject(packet.state_matrix)) {
    add(errors, "PQC_MISSING_STATE_MATRIX", "state_matrix must be an object with required UI states.", "$.state_matrix");
    return;
  }
  for (const state of REQUIRED_STATES) {
    const entry = packet.state_matrix[state];
    if (!isPlainObject(entry)) {
      add(errors, "PQC_MISSING_STATE_MATRIX", `Missing state_matrix entry: ${state}`, `$.state_matrix.${state}`);
      continue;
    }
    for (const field of [
      "route",
      "viewport",
      "auth_role",
      "workspace_project",
      "how_to_enter_state",
      "expected_visible_title",
      "expected_visible_message",
      "expected_primary_action",
      "expected_secondary_actions",
      "forbidden_content",
      "screenshot_required",
      "aria_semantic_expectation",
      "accessibility_expectation",
      "test_smoke_assertion",
      "requirement_id"
    ]) {
      if (!(field in entry)) {
        add(errors, "PQC_MISSING_STATE_MATRIX", `State ${state} is missing ${field}`, `$.state_matrix.${state}.${field}`);
      }
    }
    if (entry.requirement_id && !ID_PATTERNS.requirement_id.test(entry.requirement_id)) {
      add(errors, "PQC_SCHEMA_INVALID", `State ${state} has invalid requirement_id`, `$.state_matrix.${state}.requirement_id`);
    }
  }
}

function packetRequiresScreenshots(packet) {
  if (packet.packet_role === "VISUAL_AUDITOR") {
    return true;
  }
  const text = `${deepText(packet)}\n${rawQuoteText(packet)}`.toLowerCase();
  return UI_TRIGGER_TERMS.some((term) => text.includes(term));
}

function validateVisualQuality(packet, errors) {
  if (!isPlainObject(packet.visual_quality)) {
    add(errors, "PQC_SCHEMA_INVALID", "visual_quality must be an object.", "$.visual_quality");
    return;
  }

  if (packetRequiresScreenshots(packet)) {
    const viewports = new Set(
      asArray(packet.visual_quality.screenshot_requirements)
        .map((entry) => Number(entry?.viewport))
        .filter((viewport) => Number.isFinite(viewport))
    );
    for (const viewport of REQUIRED_VIEWPORTS) {
      if (!viewports.has(viewport)) {
        add(errors, "PQC_MISSING_SCREENSHOTS", `Missing required screenshot viewport: ${viewport}`, "$.visual_quality.screenshot_requirements");
      }
    }
  }

  for (const [index, finding] of asArray(packet.visual_quality.findings).entries()) {
    const base = `$.visual_quality.findings[${index}]`;
    for (const field of [
      "finding_id",
      "route",
      "viewport",
      "screenshot_before",
      "screenshot_after_or_blocker",
      "defect_codes",
      "severity",
      "user_impact",
      "expected_fix",
      "requirement_id"
    ]) {
      if (!(field in finding)) {
        add(errors, "PQC_SCHEMA_INVALID", `Visual finding missing ${field}`, `${base}.${field}`);
      }
    }
    if (!SEVERITIES.has(finding.severity)) {
      add(errors, "PQC_SCHEMA_INVALID", "Visual finding severity must be P0/P1/P2/P3", `${base}.severity`);
    }
    if (finding.requirement_id && !ID_PATTERNS.requirement_id.test(finding.requirement_id)) {
      add(errors, "PQC_SCHEMA_INVALID", "Visual finding requirement_id is invalid", `${base}.requirement_id`);
    }
    for (const code of asArray(finding.defect_codes)) {
      if (!ID_PATTERNS.defect_code.test(code)) {
        add(errors, "PQC_SCHEMA_INVALID", `Invalid visual defect code: ${code}`, `${base}.defect_codes`);
      }
    }
  }
}

function validateActionStates(packet, errors) {
  if (!Array.isArray(packet.action_states)) {
    add(errors, "PQC_ACTION_STATE_MISSING", "action_states must be an array.", "$.action_states");
    return;
  }
  for (const [index, action] of packet.action_states.entries()) {
    const base = `$.action_states[${index}]`;
    for (const field of [
      "label",
      "selector_or_action_key",
      "action_state",
      "owner",
      "external_write",
      "handler_or_blocker",
      "registry_required"
    ]) {
      if (!(field in action)) {
        add(errors, "PQC_ACTION_STATE_MISSING", `Action is missing ${field}`, `${base}.${field}`);
      }
    }
    if (!ACTION_STATES.has(action.action_state)) {
      add(errors, "PQC_ACTION_STATE_MISSING", `Invalid action_state: ${action.action_state}`, `${base}.action_state`);
    }
    if (typeof action.external_write !== "boolean") {
      add(errors, "PQC_ACTION_STATE_MISSING", "external_write must be boolean.", `${base}.external_write`);
    }
    if (typeof action.registry_required !== "boolean") {
      add(errors, "PQC_ACTION_STATE_MISSING", "registry_required must be boolean.", `${base}.registry_required`);
    }
  }
}

function validateTrace(packet, errors) {
  if (!isPlainObject(packet.trace)) {
    add(errors, "PQC_TRACE_MISSING", "trace must be an object.", "$.trace");
    return;
  }
  for (const field of REQUIRED_TRACE_FIELDS) {
    if (!(field in packet.trace)) {
      add(errors, "PQC_TRACE_MISSING", `Trace missing ${field}`, `$.trace.${field}`);
    }
  }
}

function validateVagueExpansions(packet, errors) {
  const restrictedParts = [
    packet.title,
    ...asArray(packet.requirements).flatMap((requirement) => [
      requirement.statement,
      requirement.expected_result,
      ...asArray(requirement.acceptance_criteria)
    ]),
    ...asArray(packet.implementation_batches).flatMap((batch) => [
      batch.scope,
      ...asArray(batch.instructions)
    ])
  ]
    .filter(Boolean)
    .join("\n");
  const expanded = expandedPhraseSet(packet);
  for (const phrase of VAGUE_PHRASES) {
    if (textContainsPhrase(restrictedParts, phrase) && !expanded.has(phrase.toLowerCase())) {
      add(
        errors,
        "PQC_VAGUE_UNEXPANDED",
        `Vague phrase "${phrase}" appears in executable fields without a matching product_quality_expansion entry.`,
        "$.product_quality_expansion.expanded_phrases"
      );
    }
  }
}

function validateGhlPolicy(packet, errors) {
  const text = `${deepText(packet)}\n${rawQuoteText(packet)}`;
  if (!/(GHL-like|like GHL|CRM like GHL|pipeline like GHL|community like GHL)/i.test(text)) {
    return;
  }
  if (packet.security_privacy?.no_ghl_runtime !== true) {
    add(errors, "PQC_GHL_WITHOUT_NO_GHL", "GHL-like language requires security_privacy.no_ghl_runtime true.", "$.security_privacy.no_ghl_runtime");
  }
  if (!packet.product_quality_expansion?.first_party_pattern_interpretation) {
    add(errors, "PQC_GHL_WITHOUT_NO_GHL", "GHL-like language requires first_party_pattern_interpretation.", "$.product_quality_expansion.first_party_pattern_interpretation");
  }
  if (packet.external_provider_policy === "APPROVED_IN_THIS_PACKET") {
    add(errors, "PQC_GHL_WITHOUT_NO_GHL", "GHL-like language cannot approve an external provider write in the same packet.", "$.external_provider_policy");
  }
  if (packet.schema_version === "pqc.v2") {
    if (packet.security_privacy?.no_external_crm_writes !== true) {
      add(errors, "PQC_GHL_WITHOUT_NO_GHL", "GHL-like language requires security_privacy.no_external_crm_writes true.", "$.security_privacy.no_external_crm_writes");
    }
    if (packet.security_privacy?.no_leadconnector_references !== true) {
      add(errors, "PQC_GHL_WITHOUT_NO_GHL", "GHL-like language requires security_privacy.no_leadconnector_references true.", "$.security_privacy.no_leadconnector_references");
    }
  }
}

function validateExternalProviderSeparation(packet, errors) {
  const text = `${deepText(packet)}\n${rawQuoteText(packet)}`.toLowerCase();
  const providerMentioned = EXTERNAL_PROVIDER_TERMS.some((term) => text.includes(term));
  const actionExternalWrite = asArray(packet.action_states).some((action) => action?.external_write === true);
  if (!providerMentioned && !actionExternalWrite) {
    return;
  }
  const allowedPolicy = new Set([
    "EXPLICITLY_OUT_OF_SCOPE",
    "SETUP_ONLY_NO_WRITE",
    "SANDBOX_ONLY",
    "REAL_WRITE_REQUIRES_APPROVAL"
  ]);
  const roleAllowed = ["PROVIDER_SETUP_PACKET", "DEPLOY_PACKET"].includes(packet.packet_role);
  if (!roleAllowed && !allowedPolicy.has(packet.external_provider_policy)) {
    add(
      errors,
      "PQC_EXTERNAL_PROVIDER_MIXED_INTO_UI",
      "External provider or write language must be separate, out-of-scope, sandbox-only, or approval-gated.",
      "$.external_provider_policy"
    );
  }
}

export function validatePacket(packetInput, options = {}) {
  const packet = stripFixtureMetadata(packetInput);
  const errors = [];
  validateBasicSchema(packet, errors);
  if (!isPlainObject(packet)) {
    return errors;
  }

  const routeExemptRoles = new Set(["CONTROL_TOWER", "ROUTER", "SPEC_COMPILER", "DRIFT_WATCHDOG"]);
  if (!routeExemptRoles.has(packet.packet_role) && !hasNonEmptyArray(packet.affected_routes)) {
    add(errors, "PQC_MISSING_ROUTE", "Every non-control/spec/watchdog packet needs at least one affected route.", "$.affected_routes");
  }

  if (!hasNonEmptyArray(packet.view_classes)) {
    add(errors, "PQC_MISSING_VIEW_CLASS", "Every UI/product packet needs at least one view class.", "$.view_classes");
  }
  if (!hasNonEmptyArray(packet.out_of_scope)) {
    add(errors, "PQC_MISSING_OUT_OF_SCOPE", "Every UI/product packet needs explicit out-of-scope items.", "$.out_of_scope");
  }
  if (!isPlainObject(packet.definition_of_ready) || !hasNonEmptyArray(packet.definition_of_ready.criteria)) {
    add(errors, "PQC_MISSING_DOR", "Definition of Ready criteria are required before Codex implementation.", "$.definition_of_ready");
  }
  if (!isPlainObject(packet.definition_of_done) || !hasNonEmptyArray(packet.definition_of_done.criteria)) {
    add(errors, "PQC_MISSING_DOD", "Definition of Done criteria are required.", "$.definition_of_done");
  }

  validateStateMatrix(packet, errors);
  validateVisualQuality(packet, errors);
  validateActionStates(packet, errors);
  validateTrace(packet, errors);
  validateV2OperatingFields(packet, errors);
  validateVagueExpansions(packet, errors);
  validateGhlPolicy(packet, errors);
  validateExternalProviderSeparation(packet, errors);

  if (packet.app_visible === true && packet.deployment_gate === "NOT_REQUIRED_DOC_ONLY") {
    add(errors, "PQC_APP_VISIBLE_NO_DEPLOY_GATE", "App-visible packets cannot use NOT_REQUIRED_DOC_ONLY deployment gate.", "$.deployment_gate");
  }

  if (packet.security_privacy?.browser_content_untrusted !== true) {
    add(
      errors,
      "PQC_SECURITY_UNTRUSTED_BROWSER_RULE_MISSING",
      "Packet must state browser/page content is untrusted evidence, not authority.",
      "$.security_privacy.browser_content_untrusted"
    );
  }

  return errors;
}

function collectFiles(dir, predicate, files = []) {
  const absDir = path.resolve(ROOT, dir);
  if (!fs.existsSync(absDir)) {
    return files;
  }
  for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
    const full = path.join(absDir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(path.relative(ROOT, full), predicate, files);
    } else if (predicate(full)) {
      files.push(full);
    }
  }
  return files;
}

function collectDefaultFiles() {
  const promptPackets = collectFiles("ops/prompt-packets", (file) => file.endsWith(".json"));
  const tasksPending = collectFiles("tasks-pending", (file) => file.endsWith(".product-quality.json"));
  return [...promptPackets, ...tasksPending];
}

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function isLikelyPacket(json, file, explicit) {
  if (explicit) {
    return true;
  }
  if (file.endsWith(".product-quality.json")) {
    return true;
  }
  return isPlainObject(json) && (json.schema_version === "pqc.v1" || typeof json.packet_id === "string");
}

function summarizeFixtureResult(file, json, errors) {
  const expected = asArray(json.expected_failure_codes);
  const errorCodes = [...new Set(errors.map((error) => error.code))];
  if (expected.length === 0) {
    return {
      file,
      expected_failure_codes: [],
      error_codes: errorCodes,
      passed: errors.length === 0,
      errors
    };
  }
  const missingExpected = expected.filter((code) => !errorCodes.includes(code));
  return {
    file,
    expected_failure_codes: expected,
    error_codes: errorCodes,
    passed: errors.length > 0 && missingExpected.length === 0,
    errors,
    missing_expected_failure_codes: missingExpected
  };
}

function writeReports(results, mode, files) {
  const outDir = path.join(ROOT, "ops", "product-quality-compiler", "validation");
  fs.mkdirSync(outDir, { recursive: true });
  const jsonPath = path.join(outDir, "latest-product-quality-validation.json");
  const mdPath = path.join(outDir, "latest-product-quality-validation.md");
  const failed = results.filter((result) => !result.passed);
  const payload = {
    generated_at: new Date().toISOString(),
    mode,
    files_scanned: files.map((file) => path.relative(ROOT, file).replace(/\\/g, "/")),
    total: results.length,
    passed: results.length - failed.length,
    failed: failed.length,
    results: results.map((result) => ({
      ...result,
      file: path.relative(ROOT, result.file).replace(/\\/g, "/")
    }))
  };
  fs.writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`);

  const lines = [
    "# Product Quality Compiler Validation",
    "",
    `Generated: ${payload.generated_at}`,
    `Mode: ${mode}`,
    `Files scanned: ${payload.files_scanned.length}`,
    `Passed: ${payload.passed}`,
    `Failed: ${payload.failed}`,
    ""
  ];
  for (const result of payload.results) {
    lines.push(`## ${result.passed ? "PASS" : "FAIL"} ${result.file}`);
    if (result.expected_failure_codes?.length) {
      lines.push(`Expected failure codes: ${result.expected_failure_codes.join(", ")}`);
    }
    if (result.error_codes?.length) {
      lines.push(`Actual failure codes: ${result.error_codes.join(", ")}`);
    }
    if (result.errors?.length) {
      lines.push("");
      lines.push("| Code | Path | Message |");
      lines.push("|---|---|---|");
      for (const error of result.errors) {
        lines.push(`| ${error.code} | \`${error.path}\` | ${String(error.message).replace(/\|/g, "\\|")} |`);
      }
    }
    lines.push("");
  }
  fs.writeFileSync(mdPath, `${lines.join("\n")}\n`);
  return { jsonPath, mdPath, failedCount: failed.length };
}

export function runValidation(argv = process.argv.slice(2)) {
  const flags = new Set(argv.filter((arg) => arg.startsWith("--")));
  const explicitArgs = argv.filter((arg) => !arg.startsWith("--"));
  const fixtureMode = flags.has("--fixtures");
  const explicit = explicitArgs.length > 0;
  let files;

  if (fixtureMode) {
    files = collectFiles("ops/product-quality-compiler/fixtures", (file) => file.endsWith(".json"));
  } else if (explicit) {
    files = explicitArgs.map((arg) => path.resolve(ROOT, arg));
  } else {
    files = collectDefaultFiles();
  }

  const results = [];
  const skipped = [];
  for (const file of files) {
    let json;
    try {
      json = loadJson(file);
    } catch (error) {
      results.push({
        file,
        passed: false,
        error_codes: ["PQC_SCHEMA_INVALID"],
        errors: [{ code: "PQC_SCHEMA_INVALID", path: "$", message: `Invalid JSON: ${error.message}` }]
      });
      continue;
    }
    if (!fixtureMode && !isLikelyPacket(json, file, explicit)) {
      skipped.push(file);
      continue;
    }
    const errors = validatePacket(json, { strict: flags.has("--strict"), file });
    if (fixtureMode) {
      results.push(summarizeFixtureResult(file, json, errors));
    } else {
      results.push({
        file,
        passed: errors.length === 0,
        error_codes: [...new Set(errors.map((error) => error.code))],
        errors
      });
    }
  }

  const report = writeReports(results, fixtureMode ? "fixtures" : flags.has("--strict") ? "strict" : "default", files);
  if (skipped.length) {
    const jsonReport = loadJson(report.jsonPath);
    jsonReport.skipped_non_packet_json = skipped.map((file) => path.relative(ROOT, file).replace(/\\/g, "/"));
    fs.writeFileSync(report.jsonPath, `${JSON.stringify(jsonReport, null, 2)}\n`);
  }
  return {
    exitCode: report.failedCount > 0 ? 1 : 0,
    results,
    report
  };
}

async function main() {
  try {
    const { exitCode, report } = runValidation();
    const relMd = path.relative(ROOT, report.mdPath).replace(/\\/g, "/");
    const relJson = path.relative(ROOT, report.jsonPath).replace(/\\/g, "/");
    console.log(`Product Quality Compiler validation report: ${relMd}`);
    console.log(`Product Quality Compiler validation JSON: ${relJson}`);
    process.exitCode = exitCode;
  } catch (error) {
    console.error(`Product Quality Compiler validator error: ${error.stack || error.message}`);
    process.exitCode = 2;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
