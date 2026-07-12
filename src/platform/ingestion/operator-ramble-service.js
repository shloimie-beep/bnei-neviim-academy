const crypto = require('node:crypto');
const { buildCanonicalIntakePacket } = require('./intake-service');
const { stableHash } = require('./intake-source');
const {
  buildRambleRoutingPackage,
  reevaluateRambleQueueAfterDecision,
} = require('../../lib/bna/ramble-routing');
const {
  broadCorrectionRegisterNeeded,
  compactWhitespace,
  formatStableId,
  isoDate,
  normalizeSourceChannel,
} = require('../../lib/bna/ramble-protocol');

const OPERATOR_RAMBLE_SERVICE_VERSION = 'bna-operator-ramble-service-v1';
const STRUCTURED_COMPILATION_VALID_STATUSES = new Set([
  'valid',
  'validated',
  'schema_valid',
  'compiled',
  'ready',
  'implementation_ready',
]);

const RAW_LIFECYCLE_STATUSES = [
  'captured',
  'raw',
  'parsed',
  'needs_review',
  'registered',
  'queued',
  'running',
  'specification_pending',
  'implemented',
  'verified',
  'deployed',
  'live_verified',
  'done',
  'blocked',
  'failed',
  'superseded',
  'archived',
];

const HONEST_STATUS_RECEIPT_STATES = [
  'registered',
  'specification_pending',
  'implementation_ready',
  'queued',
  'running',
  'implemented',
  'verified',
  'deployed',
  'live_verified',
  'blocked',
  'failed',
  'superseded',
  'done',
  'archived',
];

const TERMINAL_STATUS_RECEIPT_STATES = [
  'live_verified',
  'blocked',
  'failed',
  'superseded',
  'done',
  'archived',
];

const PACKET_STATUS_ALIASES = {
  codex_done: 'completed',
  done_verified: 'completed',
  done: 'completed',
  complete: 'completed',
  completed: 'completed',
  ready_for_codex_audit: 'queued',
  ready_for_codex_pickup: 'queued',
  codex_queued: 'queued',
  blocked_needs_operator_decision: 'blocked',
};

const PACKET_LIFECYCLE_STATUSES = new Set([
  'captured',
  'parsed',
  'registered',
  'queued',
  'running',
  'implemented',
  'verified',
  'deployed',
  'blocked',
  'failed',
  'completed',
  'archived',
]);

function hash(value = '') {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function hash6(value = '') {
  return hash(value).slice(0, 6).toUpperCase();
}

function normalizeKey(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function rawTextFromInput(input = {}) {
  const direct = String(input.raw_text || input.rawText || input.raw_input || input.rawInput || input.ramble || input.text || '').trim();
  if (direct) return direct;
  const parts = input.raw_text_parts
    || input.rawTextParts
    || input.text_parts
    || input.textParts
    || input.telegram_message_parts
    || input.telegramMessageParts
    || input.message_parts
    || input.messageParts
    || [];
  if (!Array.isArray(parts) || !parts.length) return '';
  const sortable = parts.every((part, index) => Number.isFinite(Number(part?.part_index ?? part?.partIndex ?? part?.sequence ?? part?.index ?? index)));
  const ordered = sortable
    ? [...parts].sort((a, b) => Number(a?.part_index ?? a?.partIndex ?? a?.sequence ?? a?.index ?? 0) - Number(b?.part_index ?? b?.partIndex ?? b?.sequence ?? b?.index ?? 0))
    : parts;
  return ordered
    .map((part) => (typeof part === 'string' ? part : (part?.raw_text || part?.rawText || part?.text || part?.caption || '')))
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .join('\n')
    .trim();
}

function dateStamp(value = null) {
  return isoDate(value).replace(/-/g, '');
}

function normalizePacketLifecycleStatus(value = 'captured') {
  const original = String(value || '').trim();
  const key = normalizeKey(original || 'captured');
  const normalized = PACKET_STATUS_ALIASES[key] || key || 'captured';
  const known = PACKET_LIFECYCLE_STATUSES.has(normalized);
  return {
    original_status: original,
    normalized_status: known ? normalized : 'blocked',
    migrated: Boolean(PACKET_STATUS_ALIASES[key]),
    rejected: !known,
    reason: known ? null : `Unknown packet status: ${original || '(empty)'}`,
  };
}

function normalizeRambleSource(input = {}) {
  const sourceType = normalizeKey(input.source_type || input.sourceType || input.source || '');
  const sourceChannel = normalizeKey(input.source_channel || input.sourceChannel || '');
  const sourceProvider = normalizeKey(input.source_provider || input.sourceProvider || '');
  if (sourceType === 'codex_chat' || sourceProvider === 'codex_chat') return { adapter_key: 'codex_chat', source_provider: 'codex_chat', source_channel: 'codex_chat' };
  if (sourceType === 'telegram_scoped_task') return { adapter_key: 'telegram_scoped_task', source_provider: 'telegram', source_channel: 'telegram' };
  if (sourceType === 'telegram_ramble' || sourceChannel === 'telegram' || sourceProvider === 'telegram') return { adapter_key: 'telegram_ramble', source_provider: 'telegram', source_channel: 'telegram' };
  if (sourceChannel === 'chatgpt_dropoff' || sourceType === 'chatgpt' || sourceProvider === 'chatgpt') return { adapter_key: 'chatgpt', source_provider: 'chatgpt', source_channel: 'chatgpt' };
  if (sourceType === 'operations_ui' || sourceProvider === 'operations_ui' || sourceChannel === 'operations_ui') return { adapter_key: 'operations_ui', source_provider: 'operations_ui', source_channel: 'operations_ui' };
  if (sourceType === 'file_intake') return { adapter_key: 'file_intake', source_provider: 'local_file', source_channel: normalizeSourceChannel(sourceChannel || 'local_file') };
  if (['drive', 'approved_upload', 'class_recording', 'local_file'].includes(sourceChannel)) return { adapter_key: 'file_intake', source_provider: sourceChannel, source_channel: sourceChannel };
  return { adapter_key: sourceType || sourceProvider || sourceChannel || 'manual', source_provider: normalizeSourceChannel(sourceProvider || sourceType || sourceChannel || 'manual'), source_channel: normalizeSourceChannel(sourceChannel || sourceType || sourceProvider || 'manual') };
}

function normalizeOperatorRambleSource(input = {}) {
  const source = normalizeRambleSource(input);
  return {
    source_type: source.adapter_key,
    source_provider: source.source_provider,
    source_channel: source.source_channel,
    source_id: input.source_id || input.sourceId || input.source_message_id || input.sourceMessageId || input.message_id || input.messageId || null,
    source_table: input.source_table || input.sourceTable || null,
  };
}

function classifyStatement(text = '') {
  if (/\b(decision|decide|approve|approval|choose|operator must|must approve)\b/i.test(text)) return 'decision';
  if (/\b(always|never|remember|from now on|ordinary conversation|source of truth)\b/i.test(text)) return 'memory_candidate';
  if (/\b(blocked|credential|dns|payment|legal|privacy|external account)\b/i.test(text)) return 'blocked_requirement';
  if (/\b(task|codex|fix|build|implement|test|wire|route|persist|api|ui|page|dashboard|deploy|verify)\b/i.test(text)) return 'executable_requirement';
  return 'requirement';
}

function structuredCompilationFromInput(input = {}) {
  const candidate = input.structured_compilation
    || input.structuredCompilation
    || input.compiled_spec
    || input.compiledSpec
    || input.structured_spec
    || input.structuredSpec
    || input.ai_structured_spec
    || input.aiStructuredSpec
    || input.aiStructuredJson
    || null;
  if (!candidate || typeof candidate !== 'object') {
    return {
      present: false,
      status: 'missing',
      valid: false,
      reason: 'structured_compilation_missing',
    };
  }
  const status = normalizeKey(candidate.status || candidate.state || candidate.compiler_status || candidate.compilerStatus || '');
  const schemaValid = candidate.schema_valid !== false
    && candidate.schemaValid !== false
    && !candidate.error
    && !candidate.errors?.length
    && !candidate.schema_errors?.length
    && !candidate.schemaErrors?.length;
  const hasSpecPayload = Boolean(
    candidate.requirements?.length
    || candidate.source_statements?.length
    || candidate.sourceStatements?.length
    || candidate.tasks?.length
    || candidate.decisions?.length
    || candidate.spec
    || candidate.payload
  );
  const valid = schemaValid && hasSpecPayload && STRUCTURED_COMPILATION_VALID_STATUSES.has(status || 'valid');
  return {
    present: true,
    status: status || (valid ? 'validated' : 'unknown'),
    valid,
    reason: valid ? 'structured_compilation_validated' : 'structured_compilation_invalid_or_unavailable',
    schema_valid: schemaValid,
    has_spec_payload: hasSpecPayload,
  };
}

function requiresStructuredCompilation({ input = {}, rawText = '', statements = [], source = {} } = {}) {
  if (input.allow_heuristic_requirements === true || input.allowHeuristicRequirements === true) return false;
  if (
    input.require_structured_compilation === true
    || input.requires_structured_compilation === true
    || input.structured_compilation_required === true
    || input.require_structured_spec === true
    || input.structured_spec_required === true
  ) return true;
  const adapter = source.adapter_key || normalizeRambleSource(input).adapter_key;
  const operatorRambleAdapter = ['codex_chat', 'telegram_ramble', 'telegram_scoped_task', 'chatgpt', 'operations_ui'].includes(adapter);
  if (!operatorRambleAdapter) return false;
  const raw = String(rawText || '');
  if (/\bBNA_GOAL_MODE_EXECUTION_PACKET\b/i.test(raw)) return true;
  if (/\b(goal\s*mode|finish everything|work through the whole|do all (?:those|these|the) things|set (?:it|this|that) as a goal)\b/i.test(raw)) return true;
  if (/\b(million-dollar app|launch-ready|GHL-like|CRM|pipeline|community section|make it work|clean|professional|sloppy|all over the place)\b/i.test(raw) && statements.length >= 3) return true;
  return statements.length >= 12 || raw.length >= 6000;
}

function buildStructuredCompilationGate(input = {}, { rawText = '', statements = [], source = {} } = {}) {
  const compilation = structuredCompilationFromInput(input);
  const required = requiresStructuredCompilation({ input, rawText, statements, source });
  return {
    required,
    present: compilation.present,
    status: required && !compilation.valid ? 'specification_pending' : 'implementation_ready',
    implementation_ready: !required || compilation.valid,
    compiler_status: compilation.status,
    compiler_valid: compilation.valid,
    reason: required && !compilation.valid ? compilation.reason : 'structured_compilation_not_required_or_validated',
  };
}

function splitSourceStatements(rawText = '', options = {}) {
  const raw = String(rawText || '').trim();
  if (!raw) return [];
  const rawId = options.raw_id || options.rawId || 'RAW-UNKNOWN';
  const parts = raw
    .replace(/\s+\b(?:also|another thing|next|and then|plus|besides that)\b/gi, '\n$&')
    .split(/\r?\n|(?<=[.!?])\s+|[;]+/)
    .map((part) => compactWhitespace(part))
    .filter((part) => part.length >= 5);
  const result = [];
  let cursor = 0;
  for (const part of parts) {
    const found = raw.indexOf(part, cursor);
    const start = found >= 0 ? found : cursor;
    const end = start + part.length;
    cursor = end;
    result.push({
      statement_id: `${rawId}:S${String(result.length + 1).padStart(2, '0')}`,
      index: result.length + 1,
      text: part,
      normalized_text: compactWhitespace(part),
      start_offset: start,
      end_offset: end,
      text_hash: hash(part),
      statement_hash: hash(part),
      classification: classifyStatement(part),
      source_excerpt: part,
    });
  }
  return result;
}

function requirementRegisterPathFor({ source = {}, rawId = '', rawText = '', createdAt = null, explicit = '' } = {}) {
  if (explicit) return explicit;
  const date = isoDate(createdAt);
  const key = hash([source.adapter_key, rawId, rawText].join('|')).slice(0, 10);
  return `tasks-pending/${date}-${source.adapter_key || 'manual'}-${key}-ramble-intake.md`;
}

function requirementTitle(statement = {}) {
  const cleaned = compactWhitespace(statement.text || '')
    .replace(/^(?:task|todo|decision|requirement|remember)\s*[:=-]\s*/i, '')
    .trim();
  if (cleaned.length <= 96) return cleaned || 'Review ramble statement';
  const slice = cleaned.slice(0, 97);
  const cut = slice.lastIndexOf(' ');
  return `${slice.slice(0, cut > 45 ? cut : 93).trim()}...`;
}

function buildRequirementRows({ statements = [], source = {}, rawId = '', createdAt = null, workspaceKey = 'bna', projectKey = null, structuredGate = {} } = {}) {
  const stamp = dateStamp(createdAt);
  return statements.map((statement, index) => {
    const suffix = hash6(`${rawId}|${statement.statement_id}|${statement.text}`);
    const decision = statement.classification === 'decision';
    const blocked = statement.classification === 'blocked_requirement';
    const implementationReady = structuredGate.implementation_ready !== false;
    return {
      requirement_id: `REQ-${stamp}-${String(index + 1).padStart(3, '0')}-${suffix}`,
      execution_requirement_id: `REQ-${stamp}-${String(index + 1).padStart(3, '0')}`,
      source_statement_id: statement.statement_id,
      item_type: decision ? 'decision' : 'requirement',
      title: requirementTitle(statement),
      source_id: rawId,
      source_statement_ids: [statement.statement_id],
      source_statement: statement.text,
      statement_hash: statement.text_hash,
      status: implementationReady ? (decision ? 'needs_operator_decision' : blocked ? 'blocked' : 'queued') : 'specification_pending',
      workspace_key: workspaceKey || 'bna',
      project_key: projectKey || null,
      owner: implementationReady && (decision || blocked) ? 'Shloimie' : 'Codex',
      expected_result: statement.text,
      next_action: !implementationReady
        ? 'Run a validated structured ramble compiler before creating implementation work.'
        : decision || blocked
        ? 'Resolve the operator decision or blocker; independent executable requirements may continue.'
        : 'Implement or verify this requirement and record evidence.',
      can_continue_without_operator: !implementationReady || !(decision || blocked),
      implementation_ready: implementationReady,
      materialization_status: implementationReady ? 'implementation_ready' : 'specification_pending',
      deployment_required: /\b(ui|page|route|public|deploy|live|landing|portal|dashboard|operations|server|api)\b/i.test(statement.text || ''),
      source_adapter_key: source.adapter_key,
    };
  });
}

function buildJobs(requirementRows = [], createdAt = null, rawId = '') {
  const stamp = dateStamp(createdAt);
  return requirementRows
    .filter((row) => row.implementation_ready !== false)
    .map((row, index) => ({
    job_id: `JOB-${stamp}-${String(index + 1).padStart(3, '0')}-${hash6(`${rawId}|${row.requirement_id}|job`)}`,
    job_uid: `ramble:${rawId}:${row.requirement_id}`,
    requirement_id: row.requirement_id,
    execution_requirement_id: row.execution_requirement_id,
    parent_prompt_id: `PROMPT-${stamp}-${hash6(`${rawId}|prompt`)}`,
    status: row.can_continue_without_operator ? 'queued' : 'blocked',
    owner: row.owner,
    target_lane: row.can_continue_without_operator ? 'Codex Queue' : 'Decisions',
    source_statement_id: row.source_statement_id,
    title: row.title,
  }));
}

function buildWorkerHealthReceipt(input = {}, options = {}) {
  const now = Date.parse(options.now || new Date().toISOString());
  const lastSeen = input.last_seen_at || input.lastSeenAt || null;
  const lastSeenMs = Date.parse(lastSeen || '');
  const staleAfterMs = Number(options.stale_after_ms || options.staleAfterMs || 5 * 60 * 1000);
  const status = normalizeKey(input.status || '');
  const fresh = ['online', 'running'].includes(status)
    && Number.isFinite(lastSeenMs)
    && Number.isFinite(now)
    && now - lastSeenMs <= staleAfterMs;
  return {
    receipt_type: 'worker_health',
    name: input.name || input.agent_key || 'agent-fleet',
    status: fresh ? (status || 'online') : 'offline',
    truthful: true,
    reason: fresh ? 'fresh_worker_signal' : 'missing_or_stale_worker_signal',
    last_seen_at: lastSeen,
    checked_at: options.now || new Date().toISOString(),
    external_write_performed: false,
  };
}

function buildStatusPropagation({ requirementRows = [], jobs = [], workerHealth = {}, packetStatus = {}, structuredGate = {} } = {}) {
  const hasDecision = requirementRows.some((row) => row.item_type === 'decision' || row.status === 'needs_operator_decision');
  const hasSpecificationPending = requirementRows.some((row) => row.status === 'specification_pending') || structuredGate.status === 'specification_pending';
  const hasExecutable = requirementRows.some((row) => row.can_continue_without_operator && row.implementation_ready !== false);
  const rawStatus = hasSpecificationPending ? 'needs_review' : hasDecision ? 'needs_review' : hasExecutable ? 'queued' : 'registered';
  return {
    raw_intake_status: rawStatus,
    packet_status: packetStatus.normalized_status || 'queued',
    execution_run_status: hasSpecificationPending
      ? 'specification_pending'
      : workerHealth.status === 'offline' && jobs.some((job) => job.status === 'queued')
      ? 'active_worker_offline'
      : hasExecutable
        ? 'queued'
        : 'needs_review',
    propagation_order: [
      'source_statement',
      'parse_item',
      'requirement',
      'job',
      'parent_prompt',
      'raw_intake',
      'packet',
      'execution_run',
    ],
  };
}

function buildSourceReconstructionReceipt(input = {}, { rawText = '', statements = [], generatedAt = null } = {}) {
  const parts = input.raw_text_parts
    || input.rawTextParts
    || input.text_parts
    || input.textParts
    || input.telegram_message_parts
    || input.telegramMessageParts
    || input.message_parts
    || input.messageParts
    || [];
  return {
    receipt_type: 'source_reconstruction',
    generated_at: generatedAt || new Date().toISOString(),
    raw_text_hash: hash(rawText),
    raw_text_length: String(rawText || '').length,
    statement_count: statements.length,
    reconstructed_from_parts: Array.isArray(parts) && parts.length > 0,
    source_part_count: Array.isArray(parts) ? parts.length : 0,
    offset_map_valid: statements.every((statement) => String(rawText || '').slice(statement.start_offset, statement.end_offset) === statement.text),
    truncated: false,
    external_write_performed: false,
  };
}

function buildHonestStatusReceipt({ statusPropagation = {}, requirementRows = [], structuredGate = {}, generatedAt = null } = {}) {
  return {
    receipt_type: 'honest_status_contract',
    generated_at: generatedAt || new Date().toISOString(),
    current_status: statusPropagation.execution_run_status || statusPropagation.raw_intake_status || 'registered',
    raw_intake_status: statusPropagation.raw_intake_status || 'registered',
    packet_status: statusPropagation.packet_status || 'queued',
    allowed_statuses: HONEST_STATUS_RECEIPT_STATES,
    terminal_statuses: TERMINAL_STATUS_RECEIPT_STATES,
    specification_pending_count: requirementRows.filter((row) => row.status === 'specification_pending').length,
    implementation_ready_count: requirementRows.filter((row) => row.implementation_ready !== false).length,
    structured_compilation_status: structuredGate.status || 'implementation_ready',
    done_requires_evidence: true,
    live_verified_requires_deployment_and_live_smoke: true,
    external_write_performed: false,
  };
}

function ingestOperatorRamble(input = {}, options = {}) {
  const rawText = rawTextFromInput(input);
  if (!rawText) {
    const error = new Error('raw_text is required');
    error.statusCode = 400;
    throw error;
  }
  const generatedAt = options.generated_at || new Date().toISOString();
  const createdAt = input.created_at || input.createdAt || input.source_date || input.sourceDate || generatedAt;
  const rawId = input.raw_id || input.rawId || formatStableId('raw', createdAt, 1);
  const source = normalizeRambleSource(input);
  const statements = splitSourceStatements(rawText, { raw_id: rawId });
  const structuredGate = buildStructuredCompilationGate(input, { rawText, statements, source });
  const requirementRows = buildRequirementRows({
    statements,
    source,
    rawId,
    createdAt,
    workspaceKey: input.workspace_key || input.workspaceKey || 'bna',
    projectKey: input.project_key || input.projectKey || null,
    structuredGate,
  });
  const jobs = buildJobs(requirementRows, createdAt, rawId);
  const packetStatus = normalizePacketLifecycleStatus(input.packet_status || input.packetStatus || 'queued');
  const workerHealth = buildWorkerHealthReceipt(options.worker_status || options.workerStatus || {}, {
    now: generatedAt,
    stale_after_ms: options.worker_stale_after_ms || options.workerStaleAfterMs,
  });
  const noLostSentenceGate = {
    ok: statements.length === requirementRows.length && requirementRows.every((row) => row.source_statement_id),
    statement_count: statements.length,
    mapped_statement_count: requirementRows.filter((row) => row.source_statement_id).length,
    unmapped_statement_ids: requirementRows.filter((row) => !row.source_statement_id).map((row) => row.requirement_id),
  };
  const statusPropagation = buildStatusPropagation({ requirementRows, jobs, workerHealth, packetStatus, structuredGate });
  const receipts = [
    buildSourceReconstructionReceipt(input, { rawText, statements, generatedAt }),
    {
      receipt_type: 'structured_compilation_gate',
      generated_at: generatedAt,
      required: structuredGate.required,
      status: structuredGate.status,
      implementation_ready: structuredGate.implementation_ready,
      compiler_status: structuredGate.compiler_status,
      compiler_valid: structuredGate.compiler_valid,
      reason: structuredGate.reason,
      external_write_performed: false,
    },
    buildHonestStatusReceipt({ statusPropagation, requirementRows, structuredGate, generatedAt }),
    {
      receipt_type: 'source_statements_mapped',
      generated_at: generatedAt,
      statement_count: statements.length,
      no_lost_sentence_gate_ok: noLostSentenceGate.ok,
      external_write_performed: false,
    },
    {
      receipt_type: 'requirements_projected',
      generated_at: generatedAt,
      requirement_count: requirementRows.length,
      job_count: jobs.length,
      external_write_performed: false,
    },
    workerHealth,
  ];
  if (packetStatus.migrated || packetStatus.rejected) {
    receipts.push({
      receipt_type: packetStatus.migrated ? 'packet_status_migrated' : 'packet_status_rejected',
      generated_at: generatedAt,
      status: packetStatus.normalized_status,
      reason: packetStatus.reason || `Packet status ${packetStatus.original_status} normalized to ${packetStatus.normalized_status}.`,
      external_write_performed: false,
    });
  }
  const registerPath = requirementRegisterPathFor({
    source,
    rawId,
    rawText,
    createdAt,
    explicit: input.requirement_register_path || input.requirementRegisterPath || '',
  });
  return {
    contract_version: OPERATOR_RAMBLE_SERVICE_VERSION,
    external_write_performed: false,
    adapter_key: source.adapter_key,
    source_provider: source.source_provider,
    source_channel: source.source_channel,
    raw_intake_stable_id: rawId,
    raw_text_hash: hash(rawText),
    requirement_register_path: registerPath,
    source_statements: statements,
    no_lost_sentence_gate: noLostSentenceGate,
    requirement_rows: requirementRows,
    execution_requirements: requirementRows.map((row) => ({
      id: row.execution_requirement_id,
      title: row.title,
      expected_result: row.expected_result,
      source_statement_ids: row.source_statement_ids,
      source_id: rawId,
      workspace_key: row.workspace_key,
      project_key: row.project_key,
      owner: row.owner,
      status: row.status,
      implementation_ready: row.implementation_ready,
      materialization_status: row.materialization_status,
      can_continue_without_operator: row.can_continue_without_operator,
      deployment_required: row.deployment_required,
    })),
    jobs,
    receipts,
    worker_health: workerHealth,
    structured_compilation_gate: structuredGate,
    packet_status: packetStatus,
    status_propagation: statusPropagation,
    receipt: {
      raw_id: rawId,
      statement_count: statements.length,
      requirements: requirementRows.length,
      implementation_ready_requirements: requirementRows.filter((row) => row.implementation_ready !== false).length,
      specification_pending_requirements: requirementRows.filter((row) => row.implementation_ready === false).length,
      tasks: jobs.filter((job) => job.status === 'queued').length,
      queued_jobs: jobs.filter((job) => job.status === 'queued').length,
      blockers: requirementRows.filter((row) => !row.can_continue_without_operator).map((row) => ({
        requirement_id: row.requirement_id,
        owner: row.owner,
        blocker: row.status,
        next_action: row.next_action,
      })),
      message: `Raw ID: ${rawId} | Statements: ${statements.length} | Requirements: ${requirementRows.length} | Queued jobs: ${jobs.filter((job) => job.status === 'queued').length} | Specification pending: ${requirementRows.filter((row) => row.implementation_ready === false).length}`,
    },
  };
}

function buildOperatorRambleGraph(input = {}, existingState = {}) {
  const workflow = ingestOperatorRamble(input, {
    generated_at: input.generated_at || input.generatedAt || new Date().toISOString(),
    worker_status: input.worker_health || input.workerHealth || {},
  });
  const rawText = rawTextFromInput(input);
  const sourceDate = isoDate(input.source_date || input.sourceDate || input.created_at || input.createdAt || workflow.receipts[0]?.generated_at);
  const requirements = workflow.requirement_rows.map((row) => ({
    id: row.execution_requirement_id,
    title: row.title,
    source_id: workflow.raw_intake_stable_id,
    source_statement_ids: row.source_statement_ids,
    source_path: input.source_path || input.sourcePath || '',
    workspace_key: row.workspace_key,
    project_key: row.project_key,
    owner: row.owner,
    category: row.item_type === 'decision' ? 'decision' : 'implementation',
    priority: input.priority || 'normal',
    batch_id: input.batch_id || input.batchId || 'ramble-to-done',
    depends_on: [],
    status: row.status === 'queued' ? 'not_started' : row.status,
    implementation_status: 'not_started',
    can_continue_without_operator: row.can_continue_without_operator,
    blocker: row.can_continue_without_operator ? '' : 'Operator decision is required before this item can proceed.',
    blocker_owner: row.can_continue_without_operator ? '' : 'Shloimie',
    next_action: row.next_action,
    expected_result: row.expected_result,
    acceptance_criteria: [row.expected_result],
    evidence: [],
    verification: [],
    implementation_files: [],
    implementation_commit: '',
    pushed_commit: '',
    pull_request: '',
    deployment_required: row.deployment_required,
    deployment_id: '',
    deployed_commit: '',
    live_smoke: '',
    deployment_evidence: [],
    superseded_by: '',
    blocker_next_action: row.can_continue_without_operator ? '' : row.next_action,
    updated_at: input.generated_at || input.generatedAt || new Date().toISOString(),
    legacy_requirement_id: row.requirement_id,
    statement_hash: row.statement_hash,
    source_statement: row.source_statement,
  }));
  const sourceStatements = workflow.source_statements.map((statement, index) => ({
    statement_id: statement.statement_id,
    source_id: workflow.raw_intake_stable_id,
    source_statement: statement.text,
    source_excerpt: statement.source_excerpt,
    offset_start: statement.start_offset,
    offset_end: statement.end_offset,
    statement_hash: statement.text_hash,
    classification: statement.classification,
    requirement_id: requirements[index]?.id || '',
    mapped_requirement_ids: requirements[index]?.id ? [requirements[index].id] : [],
  }));
  const executableTasks = requirements
    .filter((row) => row.can_continue_without_operator)
    .map((row) => ({
      canonical_task_key: `${row.workspace_key}|${row.project_key || 'bna'}|${row.id}`,
      workspace_key: row.workspace_key,
      project_key: row.project_key,
      source_id: row.source_id,
      source_statement_id: row.source_statement_ids[0],
      canonical_action: row.title,
      related_entity: '',
      requirement_id: row.id,
      target_file: '',
      target_route: '',
      owner: 'Codex',
      status: 'queued',
      next_action: row.next_action,
      visible: true,
      default_visible: true,
    }));
  return {
    contract_version: OPERATOR_RAMBLE_SERVICE_VERSION,
    generated_at: input.generated_at || input.generatedAt || new Date().toISOString(),
    external_write_performed: false,
    source: {
      ...normalizeOperatorRambleSource(input),
      raw_id: workflow.raw_intake_stable_id,
      source_date: sourceDate,
      raw_text_hash: hash(rawText),
      statement_count: sourceStatements.length,
    },
    raw_lifecycle: {
      status: 'registered',
      allowed_statuses: RAW_LIFECYCLE_STATUSES,
      no_implemented_without_verification: true,
      no_done_without_deployment_when_required: true,
    },
    requirement_register_path: workflow.requirement_register_path,
    source_statements: sourceStatements,
    source_statement_mappings: sourceStatements.map((statement) => ({
      statement_id: statement.statement_id,
      requirement_id: statement.requirement_id,
      mapped_requirement_ids: statement.mapped_requirement_ids,
      classification: statement.classification,
    })),
    requirements,
    decisions: requirements.filter((row) => !row.can_continue_without_operator).map((row, index) => ({
      decision_id: `DEC-${dateStamp(sourceDate)}-${String(index + 1).padStart(3, '0')}`,
      title: row.title,
      workspace_key: row.workspace_key,
      project_key: row.project_key,
      requirement_ids: [row.id],
      missing_information: row.blocker,
      owner: row.blocker_owner || 'Shloimie',
      recommended_option: row.next_action,
      alternatives: [],
      consequences: 'Dependent requirements remain blocked; independent requirements can continue.',
      exact_action_required: row.next_action,
      status: 'needs_operator_decision',
      superseded_by: '',
    })),
    executable_tasks: executableTasks,
    observable_agent_jobs: executableTasks.map((task) => ({
      job_uid: `ramble:${workflow.raw_intake_stable_id}:${task.requirement_id}`,
      requirement_id: task.requirement_id,
      status: 'queued',
      owner: 'Codex',
      title: task.canonical_action,
      source_id: workflow.raw_intake_stable_id,
      source_statement_id: task.source_statement_id,
    })),
    no_lost_sentence_gate: {
      passed: workflow.no_lost_sentence_gate.ok,
      statement_count: workflow.no_lost_sentence_gate.statement_count,
      mapped_statement_count: workflow.no_lost_sentence_gate.mapped_statement_count,
      unmapped_statement_ids: workflow.no_lost_sentence_gate.unmapped_statement_ids,
    },
    status_propagation: {
      ...(workflow.status_propagation || {}),
      independent_work_continues: executableTasks.length > 0 && requirements.some((row) => !row.can_continue_without_operator),
      queued_job_count: executableTasks.length,
      blocked_decision_count: requirements.filter((row) => row.status === 'needs_operator_decision' || row.status === 'blocked').length,
      specification_pending_count: requirements.filter((row) => row.status === 'specification_pending').length,
    },
    canonical_intake_packet: buildCanonicalIntakePacket({
      ...input,
      raw_text: rawText,
      raw_id: workflow.raw_intake_stable_id,
      source_type: workflow.adapter_key,
      source_provider: workflow.source_provider,
      source_channel: workflow.source_channel,
    }, {
      generated_at: input.generated_at || input.generatedAt || new Date().toISOString(),
      prompt_status: executableTasks.length ? 'queued' : 'triaged',
    }),
    routing: buildRambleRoutingPackage({
      raw_id: workflow.raw_intake_stable_id,
      source_channel: workflow.adapter_key,
      source_date: sourceDate,
      workspace_key: input.workspace_key || input.workspaceKey || 'bna',
      project_key: input.project_key || input.projectKey || null,
      raw_input: rawText,
    }, existingState),
    worker_health: workflow.worker_health,
    structured_compilation_gate: workflow.structured_compilation_gate,
    receipt: workflow.receipt,
  };
}

function applyRequirementResult(graph = {}, result = {}) {
  const requirementId = result.requirement_id || result.requirementId;
  if (!requirementId) return graph;
  const verificationPassed = result.verification_passed === true || result.status === 'verified' || result.status === 'deployed';
  const verificationFailed = result.verification_passed === false || result.status === 'failed_verification';
  const nextRequirements = (graph.requirements || []).map((requirement) => {
    if (requirement.id !== requirementId) return requirement;
    if (verificationFailed) {
      return {
        ...requirement,
        status: 'implemented',
        verification_status: 'failed',
        blocker: result.blocker || 'Verification failed; requirement remains open.',
        evidence: [...(requirement.evidence || []), ...(result.evidence || [])],
        verification: [...(requirement.verification || []), result.summary || 'Verification failed.'].filter(Boolean),
      };
    }
    if (!verificationPassed) return { ...requirement, status: 'implemented' };
    if (requirement.deployment_required && !(result.deployed_commit && result.live_smoke)) {
      return {
        ...requirement,
        status: 'verified',
        blocker: 'Deployment/live-smoke evidence is required before this UI/server-visible requirement can be Done.',
        blocker_owner: 'release_owner',
        verification: [...(requirement.verification || []), result.summary || 'Local verification passed.'].filter(Boolean),
      };
    }
    return {
      ...requirement,
      status: requirement.deployment_required ? 'deployed' : 'verified',
      implementation_status: 'verified',
      verification_status: 'passed',
      deployed_commit: result.deployed_commit || requirement.deployed_commit || '',
      live_smoke: result.live_smoke || requirement.live_smoke || '',
    };
  });
  const closedRequirements = nextRequirements.filter((row) => !row.blocker && ['verified', 'deployed', 'archived', 'already_satisfied'].includes(row.status));
  return {
    ...graph,
    requirements: nextRequirements,
    raw_lifecycle: {
      ...(graph.raw_lifecycle || {}),
      status: nextRequirements.length > 0 && closedRequirements.length === nextRequirements.length
        ? (nextRequirements.some((row) => row.status === 'deployed') ? 'deployed' : 'verified')
        : 'running',
    },
  };
}

module.exports = {
  OPERATOR_RAMBLE_SERVICE_VERSION,
  RAW_LIFECYCLE_STATUSES,
  applyRequirementResult,
  buildOperatorRambleGraph,
  buildWorkerHealthReceipt,
  buildStructuredCompilationGate,
  buildSourceReconstructionReceipt,
  ingestOperatorRamble,
  normalizeOperatorRambleSource,
  normalizePacketLifecycleStatus,
  normalizeRambleSource,
  reevaluateRambleQueueAfterDecision,
  splitSourceStatements,
};
