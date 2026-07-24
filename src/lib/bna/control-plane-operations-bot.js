const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const BOT_KEY = "bna_control_plane_operations_bot";
const PROVIDER_OFF = "off";
const PROVIDER_TELEGRAM = "telegram";
const STATUS_STATES = Object.freeze([
  "healthy",
  "degraded",
  "blocked",
  "unavailable",
  "unknown",
]);
const CASE_STATES = Object.freeze([
  ...STATUS_STATES,
  "open",
  "running",
  "failed",
  "needs_review",
]);
const COUNT_KEYS = Object.freeze([
  "open",
  "blocked",
  "running",
  "failed",
  "needs_review",
]);
const READ_ACTIONS = Object.freeze([
  "read_status",
  "read_help",
  "refresh_status",
  "notify_status_change",
]);
const MUTATION_ALLOWLIST = Object.freeze([]);
const STATUS_REFRESH_CALLBACK = "cpob:read_status:v1";
const OPAQUE_REF_PATTERN = /^[A-Z][A-Z0-9]{1,11}-[A-Z0-9][A-Z0-9_-]{5,47}$/;
const PRIVATE_CHAT_ID_PATTERN = /^\d{5,20}$/;
const BOT_ID_PATTERN = /^\d{5,20}$/;
const OWNER_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,79}$/;
const FORBIDDEN_FIELD_PATTERN =
  /(?:name|email|phone|address|message|transcript|prompt|body|text|token|secret|password|authorization|cookie|session|customer|student|parent|contact|one.?time|provider.?id)/i;
const SHARED_TOKEN_KEYS = Object.freeze([
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_BOT_TOKEN_BNA",
  "TELEGRAM_BOT_TOKEN_SHLOIMIE",
  "TELEGRAM_BOT_TOKEN_AHUVA",
  "TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER",
  "RABBI_ELIE_SCHELLER_TELEGRAM_BOT_TOKEN",
]);

function truthy(value) {
  return /^(?:1|true|yes|on|enabled)$/i.test(String(value || "").trim());
}

function clampInteger(value, fallback, minimum, maximum) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(minimum, Math.min(Math.trunc(parsed), maximum));
}

function sha256(value = "") {
  return crypto
    .createHash("sha256")
    .update(String(value || ""))
    .digest("hex");
}

function fingerprint(value = "", label = "ref") {
  return `${label}:sha256:${sha256(value).slice(0, 20)}`;
}

function timingSafeEqual(left = "", right = "") {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  return a.length > 0 && a.length === b.length && crypto.timingSafeEqual(a, b);
}

function parsePrivateChatAllowlist(value = "") {
  const raw = String(value || "")
    .split(/[\s,;]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
  const valid = [
    ...new Set(raw.filter((entry) => PRIVATE_CHAT_ID_PATTERN.test(entry))),
  ];
  return {
    chatIds: valid.slice(0, 8),
    invalidCount: raw.length - valid.length + Math.max(0, valid.length - 8),
  };
}

function parseHttpsUrl(value = "") {
  try {
    const url = new URL(String(value || "").trim());
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url;
  } catch {
    return null;
  }
}

function loadControlPlaneBotConfig({
  env = process.env,
  repoRoot = path.resolve(__dirname, "../../.."),
} = {}) {
  const provider = String(
    env.BNA_CONTROL_PLANE_OPERATIONS_BOT_PROVIDER || PROVIDER_OFF,
  )
    .trim()
    .toLowerCase();
  const token = String(env.TELEGRAM_BOT_TOKEN_BNA_CONTROL_PLANE || "").trim();
  const expectedBotId = String(
    env.TELEGRAM_BOT_ID_BNA_CONTROL_PLANE || "",
  ).trim();
  const ownerId = String(
    env.BNA_CONTROL_PLANE_OPERATIONS_BOT_OWNER_ID || "",
  ).trim();
  const allowlist = parsePrivateChatAllowlist(
    env.TELEGRAM_CHAT_IDS_BNA_CONTROL_PLANE,
  );
  const statusUrl = parseHttpsUrl(
    env.BNA_CONTROL_PLANE_OPERATIONS_BOT_STATUS_URL,
  );
  const linkBaseUrl = parseHttpsUrl(
    env.BNA_CONTROL_PLANE_OPERATIONS_BOT_LINK_BASE_URL,
  );
  const runtimeDir = path.resolve(repoRoot, ".runtime");
  return {
    botKey: BOT_KEY,
    provider,
    token,
    expectedBotId,
    ownerId,
    allowedChatIds: allowlist.chatIds,
    invalidAllowlistEntries: allowlist.invalidCount,
    statusUrl: statusUrl ? statusUrl.toString() : "",
    statusOrigin: statusUrl?.origin || "",
    linkBaseUrl: linkBaseUrl ? linkBaseUrl.toString() : "",
    linkOrigin: linkBaseUrl?.origin || "",
    notificationsEnabled: truthy(
      env.BNA_CONTROL_PLANE_OPERATIONS_BOT_NOTIFICATIONS_ENABLED,
    ),
    killSwitch: truthy(env.BNA_CONTROL_PLANE_OPERATIONS_BOT_KILL_SWITCH),
    revoked: truthy(env.BNA_CONTROL_PLANE_OPERATIONS_BOT_REVOKED),
    rateLimitMax: clampInteger(
      env.BNA_CONTROL_PLANE_OPERATIONS_BOT_RATE_LIMIT_MAX,
      6,
      1,
      20,
    ),
    rateLimitWindowMs: clampInteger(
      env.BNA_CONTROL_PLANE_OPERATIONS_BOT_RATE_LIMIT_WINDOW_MS,
      60_000,
      10_000,
      300_000,
    ),
    pollTimeoutSeconds: clampInteger(
      env.BNA_CONTROL_PLANE_OPERATIONS_BOT_POLL_TIMEOUT_SECONDS,
      25,
      0,
      30,
    ),
    notificationPollMs: clampInteger(
      env.BNA_CONTROL_PLANE_OPERATIONS_BOT_NOTIFICATION_POLL_MS,
      60_000,
      60_000,
      3_600_000,
    ),
    leaseTtlMs: clampInteger(
      env.BNA_CONTROL_PLANE_OPERATIONS_BOT_LEASE_TTL_MS,
      45_000,
      15_000,
      300_000,
    ),
    runtimeDir,
    leasePath: path.join(
      runtimeDir,
      "bna-control-plane-operations-bot.lease.json",
    ),
    statePath: path.join(
      runtimeDir,
      "bna-control-plane-operations-bot.state.json",
    ),
    auditPath: path.join(
      runtimeDir,
      "bna-control-plane-operations-bot-audit.jsonl",
    ),
    sharedTokens: SHARED_TOKEN_KEYS.map((key) => ({
      key,
      value: String(env[key] || "").trim(),
    })).filter((entry) => entry.value),
  };
}

function buildControlPlaneBotReadiness(config = {}) {
  const blockers = [];
  if (config.provider === PROVIDER_OFF) {
    blockers.push("provider_disabled");
  } else if (config.provider !== PROVIDER_TELEGRAM) {
    blockers.push("provider_not_accepted");
  }
  if (config.killSwitch) blockers.push("kill_switch_active");
  if (config.revoked) blockers.push("emergency_revoke_active");
  if (!/^\d{6,}:[A-Za-z0-9_-]{20,}$/.test(String(config.token || ""))) {
    blockers.push("dedicated_bot_token_absent_or_invalid");
  }
  if (!BOT_ID_PATTERN.test(String(config.expectedBotId || ""))) {
    blockers.push("expected_bot_identity_absent_or_invalid");
  }
  if (!OWNER_ID_PATTERN.test(String(config.ownerId || ""))) {
    blockers.push("lease_owner_identity_absent_or_invalid");
  }
  if (
    !Array.isArray(config.allowedChatIds) ||
    config.allowedChatIds.length === 0
  ) {
    blockers.push("private_chat_allowlist_absent");
  }
  if (Number(config.invalidAllowlistEntries || 0) > 0) {
    blockers.push("private_chat_allowlist_contains_invalid_entries");
  }
  if (!config.statusUrl || !config.statusOrigin) {
    blockers.push("https_status_source_absent_or_invalid");
  }
  if (!config.linkBaseUrl || !config.linkOrigin) {
    blockers.push("https_link_base_absent_or_invalid");
  }
  if (
    config.statusOrigin &&
    config.linkOrigin &&
    config.statusOrigin !== config.linkOrigin
  ) {
    blockers.push("status_and_link_origins_mismatch");
  }
  if (
    config.token &&
    (config.sharedTokens || []).some((entry) =>
      timingSafeEqual(config.token, entry.value),
    )
  ) {
    blockers.push("dedicated_bot_token_matches_existing_profile");
  }
  const ready = config.provider === PROVIDER_TELEGRAM && blockers.length === 0;
  return {
    bot_key: BOT_KEY,
    ready,
    mode: ready ? "read_only_ready" : "provider_off",
    provider: ready ? PROVIDER_TELEGRAM : PROVIDER_OFF,
    blockers,
    accepted_reads: [...READ_ACTIONS],
    mutation_allowlist: [...MUTATION_ALLOWLIST],
    configuration: {
      dedicated_token_configured: Boolean(config.token),
      expected_bot_identity_configured: Boolean(config.expectedBotId),
      private_chat_allowlist_configured: Boolean(config.allowedChatIds?.length),
      lease_owner_configured: Boolean(config.ownerId),
      https_status_source_configured: Boolean(config.statusUrl),
      https_link_base_configured: Boolean(config.linkBaseUrl),
      same_origin_pinned: Boolean(
        config.statusOrigin &&
        config.linkOrigin &&
        config.statusOrigin === config.linkOrigin,
      ),
      notifications_enabled: Boolean(config.notificationsEnabled),
      kill_switch_active: Boolean(config.killSwitch),
      emergency_revoke_active: Boolean(config.revoked),
    },
    content_exposed: false,
    secrets_exposed: false,
    chat_ids_exposed: false,
    one_time_dependency: false,
    direct_product_database_access: false,
  };
}

function assertTelegramBotIdentity(identity = {}, config = {}) {
  if (
    identity?.is_bot !== true ||
    String(identity?.id || "") !== String(config.expectedBotId || "")
  ) {
    const error = new Error("dedicated_bot_identity_mismatch");
    error.code = "dedicated_bot_identity_mismatch";
    throw error;
  }
  return {
    verified: true,
    bot_ref: fingerprint(identity.id, "telegram-bot"),
  };
}

function assertObject(value, code) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    const error = new Error(code);
    error.code = code;
    throw error;
  }
}

function assertExactKeys(value, allowed, code) {
  const unexpected = Object.keys(value).filter((key) => !allowed.includes(key));
  if (unexpected.length) {
    const error = new Error(code);
    error.code = code;
    throw error;
  }
}

function assertNoForbiddenFields(value, trail = []) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) =>
      assertNoForbiddenFields(entry, [...trail, String(index)]),
    );
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, entry] of Object.entries(value)) {
    if (FORBIDDEN_FIELD_PATTERN.test(key)) {
      const error = new Error("status_snapshot_forbidden_field");
      error.code = "status_snapshot_forbidden_field";
      throw error;
    }
    assertNoForbiddenFields(entry, [...trail, key]);
  }
}

function normalizeRedactedStatusSnapshot(input = {}) {
  assertObject(input, "status_snapshot_object_required");
  assertNoForbiddenFields(input);
  assertExactKeys(
    input,
    ["state", "updated_at", "counts", "cases"],
    "status_snapshot_unknown_top_level_field",
  );
  const state = String(input.state || "")
    .trim()
    .toLowerCase();
  if (!STATUS_STATES.includes(state)) {
    const error = new Error("status_snapshot_state_invalid");
    error.code = "status_snapshot_state_invalid";
    throw error;
  }
  const updatedAt = new Date(String(input.updated_at || ""));
  if (!input.updated_at || Number.isNaN(updatedAt.getTime())) {
    const error = new Error("status_snapshot_updated_at_invalid");
    error.code = "status_snapshot_updated_at_invalid";
    throw error;
  }
  const rawCounts = input.counts === undefined ? {} : input.counts;
  assertObject(rawCounts, "status_snapshot_counts_invalid");
  assertExactKeys(
    rawCounts,
    COUNT_KEYS,
    "status_snapshot_count_key_not_allowed",
  );
  const counts = {};
  for (const key of COUNT_KEYS) {
    if (rawCounts[key] === undefined) continue;
    const count = Number(rawCounts[key]);
    if (!Number.isSafeInteger(count) || count < 0 || count > 9999) {
      const error = new Error("status_snapshot_count_invalid");
      error.code = "status_snapshot_count_invalid";
      throw error;
    }
    counts[key] = count;
  }
  const rawCases = input.cases === undefined ? [] : input.cases;
  if (!Array.isArray(rawCases) || rawCases.length > 5) {
    const error = new Error("status_snapshot_cases_invalid");
    error.code = "status_snapshot_cases_invalid";
    throw error;
  }
  const cases = rawCases.map((entry) => {
    assertObject(entry, "status_snapshot_case_invalid");
    assertExactKeys(
      entry,
      ["ref", "state"],
      "status_snapshot_case_field_not_allowed",
    );
    const ref = String(entry.ref || "").trim();
    const caseState = String(entry.state || "")
      .trim()
      .toLowerCase();
    if (!OPAQUE_REF_PATTERN.test(ref)) {
      const error = new Error("status_snapshot_case_ref_not_opaque");
      error.code = "status_snapshot_case_ref_not_opaque";
      throw error;
    }
    if (!CASE_STATES.includes(caseState)) {
      const error = new Error("status_snapshot_case_state_invalid");
      error.code = "status_snapshot_case_state_invalid";
      throw error;
    }
    return { ref, state: caseState };
  });
  return {
    state,
    updated_at: updatedAt.toISOString(),
    counts,
    cases,
  };
}

function unavailableStatusSnapshot(now = () => new Date()) {
  return {
    state: "unavailable",
    updated_at: now().toISOString(),
    counts: {},
    cases: [],
  };
}

function buildOperationsLink(config = {}, ref = "") {
  const base = parseHttpsUrl(config.linkBaseUrl);
  if (!base || base.origin !== config.linkOrigin) {
    throw new Error("https_link_base_not_pinned");
  }
  const url = new URL("/operations.html", base);
  url.searchParams.set("view", "agent-work");
  if (ref) {
    if (!OPAQUE_REF_PATTERN.test(String(ref))) {
      throw new Error("operations_link_ref_not_opaque");
    }
    url.searchParams.set("ref", String(ref));
  }
  return url.toString();
}

function formatStatusMessage(snapshot, config = {}) {
  const normalized = normalizeRedactedStatusSnapshot(snapshot);
  const lines = [
    "BNA control-plane status",
    `State: ${normalized.state}`,
    `Updated: ${normalized.updated_at}`,
  ];
  const countLine = COUNT_KEYS.filter(
    (key) => normalized.counts[key] !== undefined,
  )
    .map((key) => `${key}=${normalized.counts[key]}`)
    .join(", ");
  lines.push(`Counts: ${countLine || "not available"}`);
  if (normalized.cases.length) {
    lines.push("Cases:");
    for (const entry of normalized.cases) {
      lines.push(
        `- ${entry.ref} — ${entry.state} — ${buildOperationsLink(
          config,
          entry.ref,
        )}`,
      );
    }
  }
  lines.push(`Open Operations: ${buildOperationsLink(config)}`);
  return lines.join("\n").slice(0, 3500);
}

function formatHelpMessage(config = {}) {
  return [
    "BNA control-plane bot (read only)",
    "- /status — redacted state, counts, opaque refs, and BNA HTTPS links",
    "- /help — this contract",
    "",
    "No Codex, shell, deploy, provider write, customer message, data import, session/cookie access, or database mutation is available.",
    `Open Operations: ${buildOperationsLink(config)}`,
  ].join("\n");
}

function statusReplyMarkup(config = {}) {
  return {
    inline_keyboard: [
      [
        {
          text: "Refresh status",
          callback_data: STATUS_REFRESH_CALLBACK,
        },
      ],
      [
        {
          text: "Open Operations",
          url: buildOperationsLink(config),
        },
      ],
    ],
  };
}

const CAPABILITY_CLASSIFIERS = Object.freeze([
  ["codex_control", /\b(?:codex|agent work|run code|coding agent)\b/i],
  [
    "shell_execution",
    /\b(?:shell|terminal|powershell|bash|command line|exec)\b/i,
  ],
  ["deployment_control", /\b(?:deploy|release|rollback|restart|railway)\b/i],
  [
    "provider_write",
    /\b(?:provider write|publish|send|email|whatsapp|sms|telegram message)\b/i,
  ],
  [
    "product_database_write",
    /\b(?:database|db|sql|insert|update row|delete row|migration)\b/i,
  ],
  ["session_or_cookie_access", /\b(?:session|cookie|login as|impersonate)\b/i],
  [
    "one_time_data_import",
    /\b(?:one time|onetime).*\b(?:import|sync|copy|load)\b/i,
  ],
  [
    "customer_data_import",
    /\b(?:customer|contact|transcript).*\b(?:import|sync|copy|load)\b/i,
  ],
  [
    "generic_mutation",
    /\b(?:create|update|change|delete|archive|approve|reject|write|mutate)\b/i,
  ],
]);

function classifyBoundedCapability(input = "") {
  const text = String(input || "").slice(0, 500);
  const matches = CAPABILITY_CLASSIFIERS.filter(([, pattern]) =>
    pattern.test(text),
  ).map(([capability]) => capability);
  return {
    capability_id: matches[0] || "unrecognized_action",
    multiple_capabilities_detected: matches.length > 1,
    requires_separate_acceptance: true,
    executable: false,
    accepted_by_current_adr: false,
  };
}

function formatDeniedActionMessage(proposal = {}) {
  const capability = String(
    proposal.capability_id || "unrecognized_action",
  ).replace(/[^a-z0-9_]/g, "");
  return [
    "Denied: this bot is read only.",
    `Separate acceptance is required for one bounded capability: ${capability}.`,
    "Nothing was queued, executed, sent, deployed, imported, or written.",
  ].join("\n");
}

function auditEvent({
  eventType,
  outcome,
  actorRef = "",
  updateRef = "",
  commandFamily = "",
  capabilityId = "",
  now = () => new Date(),
} = {}) {
  const occurredAt = now().toISOString();
  const eventSeed = [eventType, outcome, actorRef, updateRef, occurredAt].join(
    "|",
  );
  return {
    event_id: `CPOB-AUD-${sha256(eventSeed).slice(0, 18)}`,
    occurred_at: occurredAt,
    bot_key: BOT_KEY,
    event_type: String(eventType || "unknown_event").slice(0, 80),
    outcome: String(outcome || "unknown").slice(0, 80),
    actor_ref: String(actorRef || "").slice(0, 80) || null,
    update_ref: String(updateRef || "").slice(0, 80) || null,
    command_family: String(commandFamily || "").slice(0, 80) || null,
    capability_id: String(capabilityId || "").slice(0, 80) || null,
    content_stored: false,
    secrets_stored: false,
    chat_ids_stored: false,
    one_time_data_stored: false,
    direct_product_database_write: false,
  };
}

function ensureRuntimePath(filePath, runtimeDir) {
  const resolvedRuntime = path.resolve(runtimeDir);
  const resolvedFile = path.resolve(filePath);
  if (
    resolvedFile !== resolvedRuntime &&
    !resolvedFile.startsWith(`${resolvedRuntime}${path.sep}`)
  ) {
    throw new Error("control_plane_runtime_path_outside_runtime_dir");
  }
  return resolvedFile;
}

function createAuditWriter({ auditPath, runtimeDir } = {}) {
  const safePath = ensureRuntimePath(auditPath, runtimeDir);
  return async function writeAudit(event = {}) {
    fs.mkdirSync(path.dirname(safePath), { recursive: true });
    const safe = auditEvent({
      eventType: event.event_type,
      outcome: event.outcome,
      actorRef: event.actor_ref,
      updateRef: event.update_ref,
      commandFamily: event.command_family,
      capabilityId: event.capability_id,
      now: () =>
        new Date(
          Number.isNaN(new Date(event.occurred_at).getTime())
            ? Date.now()
            : event.occurred_at,
        ),
    });
    fs.appendFileSync(safePath, `${JSON.stringify(safe)}\n`, {
      encoding: "utf8",
      mode: 0o600,
    });
    return safe;
  };
}

function createFixedWindowRateLimiter({
  limit = 6,
  windowMs = 60_000,
  nowMs = () => Date.now(),
} = {}) {
  const buckets = new Map();
  return {
    consume(actorRef) {
      const now = nowMs();
      const current = buckets.get(actorRef);
      if (!current || now - current.startedAt >= windowMs) {
        buckets.set(actorRef, { startedAt: now, count: 1 });
        return true;
      }
      if (current.count >= limit) return false;
      current.count += 1;
      return true;
    },
    size() {
      return buckets.size;
    },
  };
}

async function auditSafely(audit, event) {
  try {
    if (typeof audit === "function") await audit(event);
  } catch {
    // Audit failure stays isolated from product and One Time runtimes.
  }
}

function commandFromText(text = "") {
  const first =
    String(text || "")
      .trim()
      .split(/\s+/)[0] || "";
  return first.toLowerCase().replace(/@[a-z0-9_]+$/i, "");
}

function updateContext(update = {}, config = {}) {
  const callback = update.callback_query;
  const message = callback?.message || update.message;
  const chat = message?.chat || {};
  const chatId = String(chat.id || "");
  return {
    callback,
    message,
    chat,
    chatId,
    actorRef: fingerprint(
      `${config.expectedBotId || BOT_KEY}:${chatId}`,
      "telegram-actor",
    ),
    updateRef: fingerprint(
      `${config.expectedBotId || BOT_KEY}:${String(update.update_id || "")}`,
      "telegram-update",
    ),
  };
}

async function safeStatusRead(statusReader, now = () => new Date()) {
  try {
    return {
      snapshot: normalizeRedactedStatusSnapshot(await statusReader()),
      available: true,
    };
  } catch {
    return {
      snapshot: unavailableStatusSnapshot(now),
      available: false,
    };
  }
}

async function handleControlPlaneTelegramUpdate({
  update = {},
  config,
  statusReader,
  sendMessage,
  answerCallback = async () => {},
  audit = async () => {},
  rateLimiter = createFixedWindowRateLimiter({
    limit: config?.rateLimitMax || 6,
    windowMs: config?.rateLimitWindowMs || 60_000,
  }),
  now = () => new Date(),
} = {}) {
  const context = updateContext(update, config);
  if (!context.message || !Number.isSafeInteger(Number(update.update_id))) {
    await auditSafely(
      audit,
      auditEvent({
        eventType: "invalid_update",
        outcome: "denied",
        updateRef: context.updateRef,
        now,
      }),
    );
    return { accepted: false, outcome: "invalid_update_denied" };
  }
  const allowed =
    context.chat.type === "private" &&
    config.allowedChatIds.includes(context.chatId);
  if (!allowed) {
    await auditSafely(
      audit,
      auditEvent({
        eventType: "unauthorized_chat",
        outcome: "denied",
        actorRef: context.actorRef,
        updateRef: context.updateRef,
        now,
      }),
    );
    return { accepted: false, outcome: "unauthorized_chat_denied" };
  }
  if (!rateLimiter.consume(context.actorRef)) {
    await auditSafely(
      audit,
      auditEvent({
        eventType: "rate_limit",
        outcome: "denied",
        actorRef: context.actorRef,
        updateRef: context.updateRef,
        now,
      }),
    );
    return { accepted: false, outcome: "rate_limited" };
  }
  if (context.callback) {
    if (String(context.callback.data || "") !== STATUS_REFRESH_CALLBACK) {
      const proposal = classifyBoundedCapability(context.callback.data);
      await Promise.resolve(
        answerCallback({
          callbackQueryId: context.callback.id,
          text: "Action unavailable. This bot is read only.",
        }),
      ).catch(() => {});
      await auditSafely(
        audit,
        auditEvent({
          eventType: "forbidden_callback",
          outcome: "denied",
          actorRef: context.actorRef,
          updateRef: context.updateRef,
          commandFamily: "callback_denied",
          capabilityId: proposal.capability_id,
          now,
        }),
      );
      await sendMessage({
        chatId: context.chatId,
        text: formatDeniedActionMessage(proposal),
      });
      return {
        accepted: false,
        outcome: "forbidden_callback_denied",
        proposal,
      };
    }
    await Promise.resolve(
      answerCallback({
        callbackQueryId: context.callback.id,
        text: "Refreshing redacted status.",
      }),
    ).catch(() => {});
    const read = await safeStatusRead(statusReader, now);
    await sendMessage({
      chatId: context.chatId,
      text: formatStatusMessage(read.snapshot, config),
      replyMarkup: statusReplyMarkup(config),
    });
    await auditSafely(
      audit,
      auditEvent({
        eventType: "status_refresh",
        outcome: read.available ? "served" : "source_unavailable",
        actorRef: context.actorRef,
        updateRef: context.updateRef,
        commandFamily: "refresh_status",
        now,
      }),
    );
    return {
      accepted: true,
      outcome: read.available
        ? "redacted_status_refreshed"
        : "redacted_status_unavailable",
    };
  }

  const messageDateMs = Number(context.message.date) * 1000;
  if (
    Number.isFinite(messageDateMs) &&
    Math.abs(now().getTime() - messageDateMs) > 5 * 60_000
  ) {
    await auditSafely(
      audit,
      auditEvent({
        eventType: "stale_update",
        outcome: "denied",
        actorRef: context.actorRef,
        updateRef: context.updateRef,
        now,
      }),
    );
    return { accepted: false, outcome: "stale_update_denied" };
  }

  const command = commandFromText(context.message.text);
  if (command === "/status") {
    const read = await safeStatusRead(statusReader, now);
    await sendMessage({
      chatId: context.chatId,
      text: formatStatusMessage(read.snapshot, config),
      replyMarkup: statusReplyMarkup(config),
    });
    await auditSafely(
      audit,
      auditEvent({
        eventType: "status_read",
        outcome: read.available ? "served" : "source_unavailable",
        actorRef: context.actorRef,
        updateRef: context.updateRef,
        commandFamily: "read_status",
        now,
      }),
    );
    return {
      accepted: true,
      outcome: read.available
        ? "redacted_status_served"
        : "redacted_status_unavailable",
    };
  }
  if (command === "/help" || command === "/start") {
    await sendMessage({
      chatId: context.chatId,
      text: formatHelpMessage(config),
    });
    await auditSafely(
      audit,
      auditEvent({
        eventType: "help_read",
        outcome: "served",
        actorRef: context.actorRef,
        updateRef: context.updateRef,
        commandFamily: "read_help",
        now,
      }),
    );
    return { accepted: true, outcome: "read_only_help_served" };
  }

  const proposal = classifyBoundedCapability(context.message.text);
  await auditSafely(
    audit,
    auditEvent({
      eventType: "forbidden_command",
      outcome: "denied",
      actorRef: context.actorRef,
      updateRef: context.updateRef,
      commandFamily: command.startsWith("/")
        ? "unknown_command"
        : "natural_language",
      capabilityId: proposal.capability_id,
      now,
    }),
  );
  await sendMessage({
    chatId: context.chatId,
    text: formatDeniedActionMessage(proposal),
  });
  return {
    accepted: false,
    outcome: "forbidden_command_denied",
    proposal,
  };
}

function statusFingerprint(snapshot) {
  return fingerprint(
    JSON.stringify(normalizeRedactedStatusSnapshot(snapshot)),
    "status",
  );
}

async function notifyAllowlistedStatus({ snapshot, config, sendMessage } = {}) {
  if (!config.notificationsEnabled || !config.allowedChatIds?.length) {
    return {
      attempted: 0,
      sent: 0,
      failed: 0,
      blocker: "notifications_provider_off",
    };
  }
  const normalized = normalizeRedactedStatusSnapshot(snapshot);
  const text = `BNA control-plane notification\n${formatStatusMessage(
    normalized,
    config,
  )}`;
  const result = { attempted: 0, sent: 0, failed: 0 };
  for (const chatId of config.allowedChatIds) {
    result.attempted += 1;
    try {
      await sendMessage({
        chatId,
        text,
        replyMarkup: statusReplyMarkup(config),
      });
      result.sent += 1;
    } catch {
      result.failed += 1;
    }
  }
  return result;
}

function readJsonFile(filePath, fallback = {}) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJsonFile(filePath, value, runtimeDir) {
  const safePath = ensureRuntimePath(filePath, runtimeDir);
  fs.mkdirSync(path.dirname(safePath), { recursive: true });
  const tempPath = `${safePath}.${process.pid}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(value, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  fs.renameSync(tempPath, safePath);
}

function writeJsonFileExclusive(filePath, value, runtimeDir) {
  const safePath = ensureRuntimePath(filePath, runtimeDir);
  fs.mkdirSync(path.dirname(safePath), { recursive: true });
  const descriptor = fs.openSync(safePath, "wx", 0o600);
  try {
    fs.writeFileSync(descriptor, `${JSON.stringify(value, null, 2)}\n`, {
      encoding: "utf8",
    });
  } finally {
    fs.closeSync(descriptor);
  }
}

function leaseOwnerRef(config = {}) {
  return fingerprint(
    `${config.expectedBotId || ""}:${config.ownerId || ""}`,
    "lease-owner",
  );
}

function acquireFileLease(config = {}, nowMs = Date.now()) {
  const leasePath = ensureRuntimePath(config.leasePath, config.runtimeDir);
  const ownerRef = leaseOwnerRef(config);
  const lease = {
    lease_key: BOT_KEY,
    owner_ref: ownerRef,
    acquired_at: new Date(nowMs).toISOString(),
    expires_at_ms: nowMs + config.leaseTtlMs,
  };
  if (!fs.existsSync(leasePath)) {
    try {
      writeJsonFileExclusive(leasePath, lease, config.runtimeDir);
      return {
        acquired: true,
        reason: "lease_acquired",
        owner_ref: ownerRef,
      };
    } catch (error) {
      if (error?.code !== "EEXIST") {
        return { acquired: false, reason: "lease_create_failed" };
      }
    }
  }
  const existing = readJsonFile(leasePath, null);
  if (!existing || existing.lease_key !== BOT_KEY) {
    return { acquired: false, reason: "lease_file_invalid" };
  }
  if (
    existing &&
    existing.owner_ref !== ownerRef &&
    Number(existing.expires_at_ms || 0) > nowMs
  ) {
    return { acquired: false, reason: "lease_held" };
  }
  if (existing.owner_ref === ownerRef) {
    writeJsonFile(leasePath, lease, config.runtimeDir);
  } else {
    const stalePath = ensureRuntimePath(
      `${leasePath}.stale.${process.pid}.${sha256(
        `${existing.owner_ref}:${nowMs}`,
      ).slice(0, 10)}`,
      config.runtimeDir,
    );
    try {
      fs.renameSync(leasePath, stalePath);
      writeJsonFileExclusive(leasePath, lease, config.runtimeDir);
    } catch {
      if (!fs.existsSync(leasePath) && fs.existsSync(stalePath)) {
        try {
          fs.renameSync(stalePath, leasePath);
        } catch {
          // A concurrent claimant owns the lease path; remain provider-off.
        }
      }
      return { acquired: false, reason: "lease_race_lost" };
    } finally {
      if (fs.existsSync(stalePath)) {
        try {
          fs.unlinkSync(stalePath);
        } catch {
          // A stale tombstone never grants delivery authority.
        }
      }
    }
  }
  const readback = readJsonFile(leasePath, {});
  return {
    acquired:
      readback.owner_ref === ownerRef &&
      Number(readback.expires_at_ms || 0) > nowMs,
    reason:
      readback.owner_ref === ownerRef ? "lease_acquired" : "lease_race_lost",
    owner_ref: ownerRef,
  };
}

function renewFileLease(config = {}, nowMs = Date.now()) {
  const leasePath = ensureRuntimePath(config.leasePath, config.runtimeDir);
  const ownerRef = leaseOwnerRef(config);
  const current = readJsonFile(leasePath, null);
  if (!current || current.owner_ref !== ownerRef) {
    return { renewed: false, reason: "lease_not_owned" };
  }
  writeJsonFile(
    leasePath,
    {
      ...current,
      renewed_at: new Date(nowMs).toISOString(),
      expires_at_ms: nowMs + config.leaseTtlMs,
    },
    config.runtimeDir,
  );
  return { renewed: true, owner_ref: ownerRef };
}

function releaseFileLease(config = {}) {
  const leasePath = ensureRuntimePath(config.leasePath, config.runtimeDir);
  const current = readJsonFile(leasePath, null);
  if (!current || current.owner_ref !== leaseOwnerRef(config)) {
    return { released: false, reason: "lease_not_owned" };
  }
  try {
    fs.unlinkSync(leasePath);
    return { released: true };
  } catch {
    return { released: false, reason: "lease_release_failed" };
  }
}

function loadBotRuntimeState(config = {}) {
  const statePath = ensureRuntimePath(config.statePath, config.runtimeDir);
  const state = readJsonFile(statePath, {});
  return {
    last_update_id:
      state.last_update_id !== null &&
      state.last_update_id !== undefined &&
      Number.isSafeInteger(Number(state.last_update_id))
        ? Number(state.last_update_id)
        : null,
    last_status_fingerprint: /^status:sha256:[a-f0-9]{20}$/.test(
      String(state.last_status_fingerprint || ""),
    )
      ? state.last_status_fingerprint
      : "",
    last_notification_check_at: Number.isFinite(
      Number(state.last_notification_check_at),
    )
      ? Number(state.last_notification_check_at)
      : 0,
  };
}

function saveBotRuntimeState(config = {}, state = {}) {
  const safe = {
    last_update_id:
      state.last_update_id !== null &&
      state.last_update_id !== undefined &&
      Number.isSafeInteger(Number(state.last_update_id))
        ? Number(state.last_update_id)
        : null,
    last_status_fingerprint: /^status:sha256:[a-f0-9]{20}$/.test(
      String(state.last_status_fingerprint || ""),
    )
      ? state.last_status_fingerprint
      : "",
    last_notification_check_at: Number.isFinite(
      Number(state.last_notification_check_at),
    )
      ? Number(state.last_notification_check_at)
      : 0,
  };
  writeJsonFile(config.statePath, safe, config.runtimeDir);
  return safe;
}

module.exports = {
  BOT_KEY,
  CASE_STATES,
  COUNT_KEYS,
  MUTATION_ALLOWLIST,
  OPAQUE_REF_PATTERN,
  PROVIDER_OFF,
  PROVIDER_TELEGRAM,
  READ_ACTIONS,
  STATUS_REFRESH_CALLBACK,
  STATUS_STATES,
  acquireFileLease,
  assertNoForbiddenFields,
  assertTelegramBotIdentity,
  auditEvent,
  buildControlPlaneBotReadiness,
  buildOperationsLink,
  classifyBoundedCapability,
  createAuditWriter,
  createFixedWindowRateLimiter,
  fingerprint,
  formatDeniedActionMessage,
  formatHelpMessage,
  formatStatusMessage,
  handleControlPlaneTelegramUpdate,
  leaseOwnerRef,
  loadBotRuntimeState,
  loadControlPlaneBotConfig,
  normalizeRedactedStatusSnapshot,
  notifyAllowlistedStatus,
  parseHttpsUrl,
  parsePrivateChatAllowlist,
  releaseFileLease,
  renewFileLease,
  saveBotRuntimeState,
  safeStatusRead,
  sha256,
  statusFingerprint,
  statusReplyMarkup,
  timingSafeEqual,
  unavailableStatusSnapshot,
};
