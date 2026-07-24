#!/usr/bin/env node
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const {
  acquireFileLease,
  assertTelegramBotIdentity,
  auditEvent,
  buildControlPlaneBotReadiness,
  createAuditWriter,
  createFixedWindowRateLimiter,
  handleControlPlaneTelegramUpdate,
  loadBotRuntimeState,
  loadControlPlaneBotConfig,
  normalizeRedactedStatusSnapshot,
  notifyAllowlistedStatus,
  releaseFileLease,
  renewFileLease,
  safeStatusRead,
  saveBotRuntimeState,
  statusFingerprint,
} = require("../src/lib/bna/control-plane-operations-bot");

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const MAX_STATUS_BYTES = 64 * 1024;

function safeTransportError(code, status = 502) {
  const error = new Error(code);
  error.code = code;
  error.statusCode = status;
  return error;
}

async function telegramRequest(
  config,
  method,
  body = {},
  { fetchImpl = global.fetch } = {},
) {
  if (typeof fetchImpl !== "function") {
    throw safeTransportError("telegram_fetch_unavailable");
  }
  const response = await fetchImpl(
    `https://api.telegram.org/bot${config.token}/${method}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      redirect: "error",
    },
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.ok !== true) {
    throw safeTransportError(`telegram_${method}_failed`, response.status);
  }
  return payload.result;
}

export function createTelegramTransport(config, options = {}) {
  return {
    async verifyIdentity() {
      return assertTelegramBotIdentity(
        await telegramRequest(config, "getMe", {}, options),
        config,
      );
    },
    async getUpdates({ offset, timeout }) {
      return telegramRequest(
        config,
        "getUpdates",
        {
          ...(Number.isSafeInteger(offset) ? { offset } : {}),
          timeout,
          limit: 50,
          allowed_updates: ["message", "callback_query"],
        },
        options,
      );
    },
    async sendMessage({ chatId, text, replyMarkup = null }) {
      if (!config.allowedChatIds.includes(String(chatId || ""))) {
        throw safeTransportError(
          "telegram_delivery_target_not_allowlisted",
          403,
        );
      }
      await telegramRequest(
        config,
        "sendMessage",
        {
          chat_id: String(chatId),
          text: String(text || "").slice(0, 3500),
          disable_web_page_preview: true,
          ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
        },
        options,
      );
      return { sent: true };
    },
    async answerCallback({ callbackQueryId, text }) {
      await telegramRequest(
        config,
        "answerCallbackQuery",
        {
          callback_query_id: String(callbackQueryId || ""),
          text: String(text || "").slice(0, 180),
          show_alert: false,
        },
        options,
      );
      return { answered: true };
    },
  };
}

export async function fetchRedactedStatusSnapshot(
  config,
  { fetchImpl = global.fetch } = {},
) {
  if (typeof fetchImpl !== "function") {
    throw safeTransportError("status_fetch_unavailable");
  }
  const response = await fetchImpl(config.statusUrl, {
    method: "GET",
    headers: { Accept: "application/json" },
    redirect: "error",
  });
  const declaredLength = Number(response.headers?.get?.("content-length") || 0);
  if (!response.ok || (declaredLength && declaredLength > MAX_STATUS_BYTES)) {
    throw safeTransportError("status_source_unavailable", response.status);
  }
  const raw = await response.text();
  if (Buffer.byteLength(raw, "utf8") > MAX_STATUS_BYTES) {
    throw safeTransportError("status_source_response_too_large");
  }
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    throw safeTransportError("status_source_json_invalid");
  }
  return normalizeRedactedStatusSnapshot(payload);
}

function printJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runControlPlaneBot({
  env = process.env,
  fetchImpl = global.fetch,
  once = false,
  readinessOnly = false,
  nowMs = () => Date.now(),
  runtimeRepoRoot = repoRoot,
} = {}) {
  const config = loadControlPlaneBotConfig({ env, repoRoot: runtimeRepoRoot });
  const readiness = buildControlPlaneBotReadiness(config);
  if (readinessOnly || !readiness.ready) {
    return {
      ...readiness,
      running: false,
      delivery_attempted: false,
    };
  }

  const lease = acquireFileLease(config, nowMs());
  if (!lease.acquired) {
    return {
      ...readiness,
      ready: false,
      mode: "provider_off",
      provider: "off",
      blockers: [...readiness.blockers, lease.reason],
      running: false,
      delivery_attempted: false,
    };
  }

  const audit = createAuditWriter({
    auditPath: config.auditPath,
    runtimeDir: config.runtimeDir,
  });
  const transport = createTelegramTransport(config, { fetchImpl });
  let stopping = false;
  const stop = () => {
    stopping = true;
    releaseFileLease(config);
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
  process.once("exit", () => releaseFileLease(config));

  try {
    await transport.verifyIdentity();
    const state = loadBotRuntimeState(config);
    const rateLimiter = createFixedWindowRateLimiter({
      limit: config.rateLimitMax,
      windowMs: config.rateLimitWindowMs,
      nowMs,
    });
    const statusReader = () =>
      fetchRedactedStatusSnapshot(config, { fetchImpl });
    const summary = {
      updates_seen: 0,
      updates_handled: 0,
      updates_denied: 0,
      notifications_sent: 0,
      notifications_failed: 0,
      transport_failures: 0,
    };

    async function notificationCheck() {
      if (
        !config.notificationsEnabled ||
        nowMs() - state.last_notification_check_at < config.notificationPollMs
      ) {
        return;
      }
      state.last_notification_check_at = nowMs();
      const read = await safeStatusRead(statusReader);
      const nextFingerprint = statusFingerprint(read.snapshot);
      if (
        state.last_status_fingerprint &&
        state.last_status_fingerprint !== nextFingerprint
      ) {
        const notification = await notifyAllowlistedStatus({
          snapshot: read.snapshot,
          config,
          sendMessage: transport.sendMessage,
        });
        summary.notifications_sent += notification.sent;
        summary.notifications_failed += notification.failed;
        await audit(
          auditEvent({
            eventType: "status_change_notification",
            outcome:
              notification.failed > 0
                ? "delivery_partially_failed"
                : "delivered",
            commandFamily: "notify_status_change",
          }),
        );
      }
      state.last_status_fingerprint = nextFingerprint;
      saveBotRuntimeState(config, state);
    }

    do {
      if (stopping) break;
      const renewal = renewFileLease(config, nowMs());
      if (!renewal.renewed) {
        await audit(
          auditEvent({
            eventType: "lease_lost",
            outcome: "provider_off",
          }),
        );
        break;
      }
      try {
        const updates = await transport.getUpdates({
          offset:
            state.last_update_id === null
              ? undefined
              : state.last_update_id + 1,
          timeout: once ? 0 : config.pollTimeoutSeconds,
        });
        for (const update of Array.isArray(updates) ? updates : []) {
          const updateId = Number(update?.update_id);
          if (
            !Number.isSafeInteger(updateId) ||
            (state.last_update_id !== null && updateId <= state.last_update_id)
          ) {
            continue;
          }
          summary.updates_seen += 1;
          try {
            const result = await handleControlPlaneTelegramUpdate({
              update,
              config,
              statusReader,
              sendMessage: transport.sendMessage,
              answerCallback: transport.answerCallback,
              audit,
              rateLimiter,
            });
            if (result.accepted) summary.updates_handled += 1;
            else summary.updates_denied += 1;
          } catch {
            summary.transport_failures += 1;
            await audit(
              auditEvent({
                eventType: "isolated_update_failure",
                outcome: "failed_closed",
              }),
            );
          } finally {
            state.last_update_id = updateId;
            saveBotRuntimeState(config, state);
          }
        }
        await notificationCheck();
      } catch {
        summary.transport_failures += 1;
        await audit(
          auditEvent({
            eventType: "telegram_transport_failure",
            outcome: "isolated_retry",
          }),
        );
        if (!once) await sleep(5_000);
      }
    } while (!once && !stopping);

    return {
      ...readiness,
      running: !once && !stopping,
      once,
      lease_owned: true,
      identity_verified: true,
      summary,
      customer_messages_sent: 0,
      provider_writes: 0,
      product_database_writes: 0,
      one_time_reads_or_writes: 0,
    };
  } catch {
    await audit(
      auditEvent({
        eventType: "startup_failure",
        outcome: "provider_off",
      }),
    );
    return {
      ...readiness,
      ready: false,
      mode: "provider_off",
      provider: "off",
      blockers: [...readiness.blockers, "isolated_startup_failure"],
      running: false,
      delivery_attempted: false,
    };
  } finally {
    releaseFileLease(config);
  }
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const result = await runControlPlaneBot({
    once: args.has("--once"),
    readinessOnly: args.has("--readiness"),
  });
  printJson(result);
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch(() => {
    printJson({
      bot_key: "bna_control_plane_operations_bot",
      ready: false,
      mode: "provider_off",
      running: false,
      blocker: "isolated_runtime_failure",
      secrets_exposed: false,
      one_time_dependency: false,
    });
    process.exitCode = 1;
  });
}
