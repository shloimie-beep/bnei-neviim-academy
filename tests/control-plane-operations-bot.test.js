const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");

const bot = require("../src/lib/bna/control-plane-operations-bot");

const NOW = new Date("2026-07-24T12:00:00.000Z");
const SAFE_SNAPSHOT = Object.freeze({
  state: "degraded",
  updated_at: NOW.toISOString(),
  counts: {
    open: 4,
    blocked: 1,
    running: 2,
    failed: 0,
    needs_review: 1,
  },
  cases: [
    { ref: "CASE-7C2A10F8", state: "blocked" },
    { ref: "JOB-9A44D210", state: "running" },
  ],
});

function readyEnv(overrides = {}) {
  return {
    BNA_CONTROL_PLANE_OPERATIONS_BOT_PROVIDER: "telegram",
    TELEGRAM_BOT_TOKEN_BNA_CONTROL_PLANE:
      "123456:ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdef123456",
    TELEGRAM_BOT_ID_BNA_CONTROL_PLANE: "123456",
    TELEGRAM_CHAT_IDS_BNA_CONTROL_PLANE: "777777",
    BNA_CONTROL_PLANE_OPERATIONS_BOT_OWNER_ID: "bna-control-owner",
    BNA_CONTROL_PLANE_OPERATIONS_BOT_STATUS_URL:
      "https://operations.bna.test/api/control-plane/status",
    BNA_CONTROL_PLANE_OPERATIONS_BOT_LINK_BASE_URL:
      "https://operations.bna.test/",
    ...overrides,
  };
}

function config(overrides = {}) {
  const repoRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "bna-control-plane-bot-"),
  );
  return bot.loadControlPlaneBotConfig({
    env: readyEnv(overrides),
    repoRoot,
  });
}

function telegramUpdate({
  updateId = 20,
  chatId = "777777",
  chatType = "private",
  text = "/status",
  callbackData = "",
} = {}) {
  const message = {
    message_id: updateId,
    date: Math.floor(NOW.getTime() / 1000),
    text,
    chat: { id: chatId, type: chatType },
  };
  if (callbackData) {
    return {
      update_id: updateId,
      callback_query: {
        id: `callback-${updateId}`,
        data: callbackData,
        message,
      },
    };
  }
  return { update_id: updateId, message };
}

test("provider is off by default and never inherits existing Telegram identity", () => {
  const cfg = bot.loadControlPlaneBotConfig({
    env: {
      TELEGRAM_BOT_TOKEN_BNA: "654321:ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdef123456",
      TELEGRAM_CHAT_ID_BNA: "777777",
    },
    repoRoot: fs.mkdtempSync(path.join(os.tmpdir(), "bna-bot-off-")),
  });
  const readiness = bot.buildControlPlaneBotReadiness(cfg);
  assert.equal(readiness.ready, false);
  assert.equal(readiness.mode, "provider_off");
  assert.equal(cfg.token, "");
  assert.deepEqual(cfg.allowedChatIds, []);
  assert.ok(readiness.blockers.includes("provider_disabled"));
  assert.equal(readiness.one_time_dependency, false);
  assert.deepEqual(readiness.mutation_allowlist, []);
});

test("readiness requires distinct token, identity, allowlist, owner, and pinned HTTPS origin", () => {
  const readyConfig = config();
  const readiness = bot.buildControlPlaneBotReadiness(readyConfig);
  assert.equal(readiness.ready, true);
  assert.equal(readiness.mode, "read_only_ready");
  assert.deepEqual(readiness.accepted_reads, [
    "read_status",
    "read_help",
    "refresh_status",
    "notify_status_change",
  ]);
  assert.deepEqual(readiness.mutation_allowlist, []);
  assert.equal(readiness.configuration.same_origin_pinned, true);
  assert.equal(readiness.chat_ids_exposed, false);
  assert.equal(readiness.secrets_exposed, false);
});

test("readiness rejects duplicate token, invalid allowlist entry, kill, revoke, and origin mismatch", () => {
  const shared = "123456:ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdef123456";
  const cfg = config({
    TELEGRAM_BOT_TOKEN_BNA: shared,
    TELEGRAM_BOT_TOKEN_BNA_CONTROL_PLANE: shared,
    TELEGRAM_CHAT_IDS_BNA_CONTROL_PLANE: "777777,group-name",
    BNA_CONTROL_PLANE_OPERATIONS_BOT_LINK_BASE_URL: "https://other.bna.test/",
    BNA_CONTROL_PLANE_OPERATIONS_BOT_KILL_SWITCH: "true",
    BNA_CONTROL_PLANE_OPERATIONS_BOT_REVOKED: "true",
  });
  const readiness = bot.buildControlPlaneBotReadiness(cfg);
  assert.equal(readiness.ready, false);
  for (const expected of [
    "dedicated_bot_token_matches_existing_profile",
    "private_chat_allowlist_contains_invalid_entries",
    "status_and_link_origins_mismatch",
    "kill_switch_active",
    "emergency_revoke_active",
  ]) {
    assert.ok(readiness.blockers.includes(expected), expected);
  }
});

test("Telegram identity is pinned to the dedicated numeric bot ID", () => {
  const cfg = config();
  assert.equal(
    bot.assertTelegramBotIdentity(
      { id: 123456, is_bot: true, username: "ignored" },
      cfg,
    ).verified,
    true,
  );
  assert.throws(
    () => bot.assertTelegramBotIdentity({ id: 999999, is_bot: true }, cfg),
    /dedicated_bot_identity_mismatch/,
  );
  assert.throws(
    () => bot.assertTelegramBotIdentity({ id: 123456, is_bot: false }, cfg),
    /dedicated_bot_identity_mismatch/,
  );
});

test("status contract emits only counts, opaque refs, timestamp, state, and bot-built HTTPS links", () => {
  const cfg = config();
  const normalized = bot.normalizeRedactedStatusSnapshot(SAFE_SNAPSHOT);
  assert.deepEqual(normalized, SAFE_SNAPSHOT);
  const message = bot.formatStatusMessage(normalized, cfg);
  assert.match(message, /^BNA control-plane status/m);
  assert.match(message, /open=4/);
  assert.match(message, /CASE-7C2A10F8/);
  assert.match(
    message,
    /https:\/\/operations\.bna\.test\/operations\.html\?view=agent-work&ref=CASE-7C2A10F8/,
  );
  assert.doesNotMatch(message, /token|cookie|transcript|customer/i);
  const markup = bot.statusReplyMarkup(cfg);
  assert.equal(
    markup.inline_keyboard[0][0].callback_data,
    bot.STATUS_REFRESH_CALLBACK,
  );
  assert.match(markup.inline_keyboard[1][0].url, /^https:/);
});

test("status contract rejects PII-like fields, arbitrary links, unknown counts, and non-opaque refs", () => {
  assert.throws(
    () =>
      bot.normalizeRedactedStatusSnapshot({
        ...SAFE_SNAPSHOT,
        customer_name: "Private Person",
      }),
    /status_snapshot_forbidden_field/,
  );
  assert.throws(
    () =>
      bot.normalizeRedactedStatusSnapshot({
        ...SAFE_SNAPSHOT,
        link: "https://evil.invalid/",
      }),
    /status_snapshot_unknown_top_level_field/,
  );
  assert.throws(
    () =>
      bot.normalizeRedactedStatusSnapshot({
        ...SAFE_SNAPSHOT,
        counts: { ...SAFE_SNAPSHOT.counts, recipients: 3 },
      }),
    /status_snapshot_count_key_not_allowed/,
  );
  assert.throws(
    () =>
      bot.normalizeRedactedStatusSnapshot({
        ...SAFE_SNAPSHOT,
        cases: [{ ref: "Jane Doe", state: "blocked" }],
      }),
    /status_snapshot_case_ref_not_opaque/,
  );
});

test("allowlisted /status serves a redacted envelope and records a content-free audit", async () => {
  const cfg = config();
  const sends = [];
  const audits = [];
  const result = await bot.handleControlPlaneTelegramUpdate({
    update: telegramUpdate(),
    config: cfg,
    statusReader: async () => SAFE_SNAPSHOT,
    sendMessage: async (message) => sends.push(message),
    audit: async (event) => audits.push(event),
    now: () => NOW,
  });
  assert.equal(result.accepted, true);
  assert.equal(result.outcome, "redacted_status_served");
  assert.equal(sends.length, 1);
  assert.match(sends[0].text, /CASE-7C2A10F8/);
  assert.equal(audits.length, 1);
  assert.equal(audits[0].event_type, "status_read");
  assert.equal(audits[0].content_stored, false);
  assert.equal(audits[0].chat_ids_stored, false);
  assert.equal(audits[0].one_time_data_stored, false);
  assert.doesNotMatch(JSON.stringify(audits[0]), /777777|\/status/);
});

test("unauthorized and non-private chats are denied without a reply", async () => {
  for (const update of [
    telegramUpdate({ chatId: "888888" }),
    telegramUpdate({ chatType: "group" }),
  ]) {
    const sends = [];
    const audits = [];
    const result = await bot.handleControlPlaneTelegramUpdate({
      update,
      config: config(),
      statusReader: async () => SAFE_SNAPSHOT,
      sendMessage: async (message) => sends.push(message),
      audit: async (event) => audits.push(event),
      now: () => NOW,
    });
    assert.equal(result.accepted, false);
    assert.equal(result.outcome, "unauthorized_chat_denied");
    assert.equal(sends.length, 0);
    assert.equal(audits[0].event_type, "unauthorized_chat");
    assert.doesNotMatch(JSON.stringify(audits[0]), /777777|888888/);
  }
});

test("mutation request is denied and returns one non-executable bounded capability proposal", async () => {
  const sends = [];
  const audits = [];
  const result = await bot.handleControlPlaneTelegramUpdate({
    update: telegramUpdate({
      text: "Deploy the app and send the customer update now",
    }),
    config: config(),
    statusReader: async () => SAFE_SNAPSHOT,
    sendMessage: async (message) => sends.push(message),
    audit: async (event) => audits.push(event),
    now: () => NOW,
  });
  assert.equal(result.accepted, false);
  assert.equal(result.outcome, "forbidden_command_denied");
  assert.equal(result.proposal.capability_id, "deployment_control");
  assert.equal(result.proposal.requires_separate_acceptance, true);
  assert.equal(result.proposal.executable, false);
  assert.equal(result.proposal.accepted_by_current_adr, false);
  assert.match(sends[0].text, /Nothing was queued, executed, sent, deployed/);
  assert.equal(audits[0].capability_id, "deployment_control");
  assert.doesNotMatch(
    JSON.stringify(audits[0]),
    /Deploy the app|customer update/,
  );
});

test("only the versioned read-only refresh callback is accepted", async () => {
  const cfg = config();
  const sends = [];
  const answers = [];
  const audits = [];
  const denied = await bot.handleControlPlaneTelegramUpdate({
    update: telegramUpdate({
      callbackData: "action:deploy:production",
    }),
    config: cfg,
    statusReader: async () => SAFE_SNAPSHOT,
    sendMessage: async (message) => sends.push(message),
    answerCallback: async (answer) => answers.push(answer),
    audit: async (event) => audits.push(event),
    now: () => NOW,
  });
  assert.equal(denied.outcome, "forbidden_callback_denied");
  assert.equal(audits[0].event_type, "forbidden_callback");
  assert.doesNotMatch(JSON.stringify(audits[0]), /action:deploy/);
  assert.equal(answers.length, 1);

  const refreshed = await bot.handleControlPlaneTelegramUpdate({
    update: telegramUpdate({
      updateId: 21,
      callbackData: bot.STATUS_REFRESH_CALLBACK,
    }),
    config: cfg,
    statusReader: async () => SAFE_SNAPSHOT,
    sendMessage: async (message) => sends.push(message),
    answerCallback: async (answer) => answers.push(answer),
    audit: async (event) => audits.push(event),
    now: () => NOW,
  });
  assert.equal(refreshed.outcome, "redacted_status_refreshed");
  assert.equal(audits[1].event_type, "status_refresh");
});

test("BNA status failure degrades to generic unavailable without leaking the exception", async () => {
  const sends = [];
  const audits = [];
  const result = await bot.handleControlPlaneTelegramUpdate({
    update: telegramUpdate(),
    config: config(),
    statusReader: async () => {
      throw new Error(
        "private upstream body with token=do-not-expose and customer name",
      );
    },
    sendMessage: async (message) => sends.push(message),
    audit: async (event) => audits.push(event),
    now: () => NOW,
  });
  assert.equal(result.outcome, "redacted_status_unavailable");
  assert.match(sends[0].text, /State: unavailable/);
  assert.doesNotMatch(
    sends[0].text,
    /private upstream|do-not-expose|customer name/,
  );
  assert.equal(audits[0].outcome, "source_unavailable");
});

test("rate limiter fails closed without sending another response", async () => {
  const sends = [];
  const audits = [];
  const limiter = bot.createFixedWindowRateLimiter({
    limit: 1,
    windowMs: 60_000,
    nowMs: () => NOW.getTime(),
  });
  const options = {
    config: config(),
    statusReader: async () => SAFE_SNAPSHOT,
    sendMessage: async (message) => sends.push(message),
    audit: async (event) => audits.push(event),
    rateLimiter: limiter,
    now: () => NOW,
  };
  await bot.handleControlPlaneTelegramUpdate({
    ...options,
    update: telegramUpdate({ updateId: 1, text: "/help" }),
  });
  const denied = await bot.handleControlPlaneTelegramUpdate({
    ...options,
    update: telegramUpdate({ updateId: 2, text: "/status" }),
  });
  assert.equal(denied.outcome, "rate_limited");
  assert.equal(sends.length, 1);
  assert.equal(audits[1].event_type, "rate_limit");
});

test("notifications are disabled by default and isolate individual Telegram failures", async () => {
  const disabled = await bot.notifyAllowlistedStatus({
    snapshot: SAFE_SNAPSHOT,
    config: config(),
    sendMessage: async () => {
      throw new Error("should not run");
    },
  });
  assert.equal(disabled.attempted, 0);
  assert.equal(disabled.blocker, "notifications_provider_off");

  const cfg = config({
    TELEGRAM_CHAT_IDS_BNA_CONTROL_PLANE: "777777,888888",
    BNA_CONTROL_PLANE_OPERATIONS_BOT_NOTIFICATIONS_ENABLED: "true",
  });
  let attempts = 0;
  const notified = await bot.notifyAllowlistedStatus({
    snapshot: SAFE_SNAPSHOT,
    config: cfg,
    sendMessage: async () => {
      attempts += 1;
      if (attempts === 2) throw new Error("isolated transport failure");
    },
  });
  assert.deepEqual(notified, { attempted: 2, sent: 1, failed: 1 });
});

test("distinct file lease blocks another owner, renews, expires, and releases safely", () => {
  const cfg = config();
  cfg.leaseTtlMs = 45_000;
  const first = bot.acquireFileLease(cfg, NOW.getTime());
  assert.equal(first.acquired, true);
  assert.equal(bot.renewFileLease(cfg, NOW.getTime() + 1_000).renewed, true);

  const other = {
    ...cfg,
    ownerId: "second-control-owner",
  };
  assert.equal(
    bot.acquireFileLease(other, NOW.getTime() + 2_000).acquired,
    false,
  );
  assert.equal(
    bot.acquireFileLease(other, NOW.getTime() + 50_000).acquired,
    true,
  );
  assert.equal(bot.releaseFileLease(cfg).released, false);
  assert.equal(bot.releaseFileLease(other).released, true);
});

test("runtime state persists only update offset and redacted status fingerprint", () => {
  const cfg = config();
  const saved = bot.saveBotRuntimeState(cfg, {
    last_update_id: 44,
    last_status_fingerprint: bot.statusFingerprint(SAFE_SNAPSHOT),
    last_notification_check_at: NOW.getTime(),
    raw_message: "must not persist",
  });
  const read = bot.loadBotRuntimeState(cfg);
  assert.deepEqual(read, saved);
  const raw = fs.readFileSync(cfg.statePath, "utf8");
  assert.doesNotMatch(raw, /raw_message|must not persist|777777/);
});

test("audit writer strips raw content and keeps the file inside isolated runtime", async () => {
  const cfg = config();
  const writeAudit = bot.createAuditWriter({
    auditPath: cfg.auditPath,
    runtimeDir: cfg.runtimeDir,
  });
  await writeAudit({
    event_type: "forbidden_command",
    outcome: "denied",
    capability_id: "shell_execution",
    raw_text: "token=private and run this shell command",
    chat_id: "777777",
  });
  const line = fs.readFileSync(cfg.auditPath, "utf8").trim();
  const event = JSON.parse(line);
  assert.equal(event.capability_id, "shell_execution");
  assert.equal(event.content_stored, false);
  assert.equal(event.secrets_stored, false);
  assert.doesNotMatch(line, /token=private|shell command|777777/);
  assert.throws(
    () =>
      bot.createAuditWriter({
        auditPath: path.join(cfg.runtimeDir, "..", "outside.jsonl"),
        runtimeDir: cfg.runtimeDir,
      }),
    /control_plane_runtime_path_outside_runtime_dir/,
  );
});

test("implementation stays independent from bridge monolith, product DB, shell, and One Time runtime", () => {
  const implementation = [
    fs.readFileSync("src/lib/bna/control-plane-operations-bot.js", "utf8"),
    fs.readFileSync("scripts/bna-control-plane-operations-bot.mjs", "utf8"),
  ].join("\n");
  assert.doesNotMatch(
    implementation,
    /require\(['"][^'"]*(?:telegram-kimi-bridge|one-time-rabbi|server\.js)/i,
  );
  assert.doesNotMatch(
    implementation,
    /from ['"][^'"]*(?:telegram-kimi-bridge|one-time-rabbi|server\.js)/i,
  );
  assert.doesNotMatch(
    implementation,
    /child_process|DATABASE_URL|ONE_TIME_[A-Z0-9_]+/,
  );
  assert.match(implementation, /MUTATION_ALLOWLIST = Object\.freeze\(\[\]\)/);
});

test("ADR fixes the empty mutation allowlist and future one-capability acceptance gate", () => {
  const adr = fs.readFileSync(
    "docs/architecture/bna-control-plane-operations-bot-adr-2026-07-24.md",
    "utf8",
  );
  assert.match(adr, /The live mutation allowlist is exactly:/);
  assert.match(adr, /\[\]/);
  assert.match(adr, /one named capability and one typed input contract/);
  assert.match(adr, /fresh operator re-authentication challenge/);
  assert.match(adr, /second, unique confirmation/);
  assert.match(adr, /BNA status outage/);
  assert.match(adr, /no One Time runtime dependency/);
});

test("isolated worker verifies getMe and completes one empty poll without product effects", async () => {
  const runtime =
    await import("../scripts/bna-control-plane-operations-bot.mjs");
  const runtimeRepoRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "bna-control-plane-runtime-"),
  );
  const calls = [];
  const fetchImpl = async (url, options) => {
    const method = String(url).split("/").pop();
    calls.push({ method, body: JSON.parse(options.body) });
    if (method === "getMe") {
      return {
        ok: true,
        json: async () => ({
          ok: true,
          result: { id: 123456, is_bot: true },
        }),
      };
    }
    if (method === "getUpdates") {
      return {
        ok: true,
        json: async () => ({ ok: true, result: [] }),
      };
    }
    throw new Error("unexpected transport call");
  };
  const result = await runtime.runControlPlaneBot({
    env: readyEnv(),
    fetchImpl,
    once: true,
    nowMs: () => NOW.getTime(),
    runtimeRepoRoot,
  });
  assert.equal(result.ready, true);
  assert.equal(result.identity_verified, true);
  assert.equal(result.summary.updates_seen, 0);
  assert.equal(result.customer_messages_sent, 0);
  assert.equal(result.provider_writes, 0);
  assert.equal(result.product_database_writes, 0);
  assert.equal(result.one_time_reads_or_writes, 0);
  assert.deepEqual(
    calls.map((entry) => entry.method),
    ["getMe", "getUpdates"],
  );
});

test("status HTTP reader rejects oversized or non-contract responses without credentials", async () => {
  const runtime =
    await import("../scripts/bna-control-plane-operations-bot.mjs");
  const cfg = config();
  const accepted = await runtime.fetchRedactedStatusSnapshot(cfg, {
    fetchImpl: async (_url, options) => {
      assert.equal(options.method, "GET");
      assert.deepEqual(options.headers, { Accept: "application/json" });
      assert.equal(options.redirect, "error");
      assert.equal(options.headers.Authorization, undefined);
      assert.equal(options.headers.Cookie, undefined);
      return {
        ok: true,
        headers: { get: () => "500" },
        text: async () => JSON.stringify(SAFE_SNAPSHOT),
      };
    },
  });
  assert.deepEqual(accepted, SAFE_SNAPSHOT);

  await assert.rejects(
    runtime.fetchRedactedStatusSnapshot(cfg, {
      fetchImpl: async () => ({
        ok: true,
        headers: { get: () => String(70 * 1024) },
        text: async () => "not read",
      }),
    }),
    /status_source_unavailable/,
  );
  await assert.rejects(
    runtime.fetchRedactedStatusSnapshot(cfg, {
      fetchImpl: async () => ({
        ok: true,
        headers: { get: () => "100" },
        text: async () =>
          JSON.stringify({
            ...SAFE_SNAPSHOT,
            transcript: "forbidden private source",
          }),
      }),
    }),
    /status_snapshot_forbidden_field/,
  );
});

test("read-only commands and refresh button have action-registry coverage", () => {
  const actions = JSON.parse(
    fs.readFileSync("ops/action-registry/actions.json", "utf8"),
  );
  const byId = new Map(actions.map((action) => [action.action_id, action]));
  const status = byId.get("control_plane_operations_status_read");
  const help = byId.get("control_plane_operations_help_read");
  assert.ok(status);
  assert.ok(help);
  assert.equal(status.approval_required, false);
  assert.equal(
    status.execution_handler,
    "controlPlaneOperationsBot.readStatus",
  );
  assert.deepEqual(status.ui_button_labels, [
    "Refresh status",
    "Open Operations",
  ]);
  assert.deepEqual(status.allowed_workspaces, ["platform", "bna"]);
  assert.equal(help.approval_required, false);
  assert.equal(help.execution_handler, "controlPlaneOperationsBot.readHelp");
  assert.deepEqual(help.telegram_intent_examples, ["/help", "/start"]);
});
