#!/usr/bin/env node

import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_ONE_TIME_DELIVERY_OUTBOX_URL =
  'https://join.onetimeonetime.com/api/cron/one-time/delivery-outbox';

const OUTPUT_KEYS = Object.freeze([
  'status',
  'success',
  'processed_count',
  'sent_count',
  'failed_count',
  'dead_lettered_count',
  'due_count',
  'external_send_performed',
]);

function countValue(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function safeStatus(value, fallback = 'unknown') {
  const compact = String(value || fallback).replace(/[^a-zA-Z0-9_.:-]/g, '').slice(0, 80);
  return compact || fallback;
}

export function redactedDeliveryCronOutput(data = {}, status = 'unknown') {
  const source = data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  return {
    status: safeStatus(source.status || status),
    success: source.success === true,
    processed_count: countValue(source.processed_count),
    sent_count: countValue(source.sent_count),
    failed_count: countValue(source.failed_count),
    dead_lettered_count: countValue(source.dead_lettered_count),
    due_count: countValue(source.due_count),
    external_send_performed: source.external_send_performed === true,
  };
}

function writeOutput(stream, output) {
  const safe = {};
  for (const key of OUTPUT_KEYS) safe[key] = output[key];
  stream.write(`${JSON.stringify(safe, null, 2)}\n`);
}

function timeoutStatus(error) {
  return error?.name === 'AbortError' || /abort|timeout/i.test(String(error?.message || ''));
}

export async function runOneTimeDeliveryOutboxCron({
  env = process.env,
  fetchImpl = globalThis.fetch,
  stdout = process.stdout,
  stderr = process.stderr,
  timeoutMs = 30000,
  setTimeoutImpl = setTimeout,
  clearTimeoutImpl = clearTimeout,
} = {}) {
  if (!env.CRON_SECRET) {
    writeOutput(stderr, redactedDeliveryCronOutput({ success: false }, 'configuration_error'));
    return { exitCode: 1, output: redactedDeliveryCronOutput({ success: false }, 'configuration_error') };
  }

  if (typeof fetchImpl !== 'function') {
    writeOutput(stderr, redactedDeliveryCronOutput({ success: false }, 'fetch_unavailable'));
    return { exitCode: 1, output: redactedDeliveryCronOutput({ success: false }, 'fetch_unavailable') };
  }

  const url = String(env.ONE_TIME_DELIVERY_OUTBOX_URL || DEFAULT_ONE_TIME_DELIVERY_OUTBOX_URL).trim();
  if (!/^https:\/\/.+\/api\/cron\/one-time\/delivery-outbox$/i.test(url)) {
    writeOutput(stderr, redactedDeliveryCronOutput({ success: false }, 'configuration_error'));
    return { exitCode: 1, output: redactedDeliveryCronOutput({ success: false }, 'configuration_error') };
  }

  const controller = new AbortController();
  const timer = setTimeoutImpl(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
      method: 'POST',
      headers: {
        'x-cron-secret': env.CRON_SECRET,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ dry_run: false, limit: 25 }),
      signal: controller.signal,
    });

    if (!response || !response.ok) {
      const output = redactedDeliveryCronOutput({ success: false }, `http_${response?.status || 'error'}`);
      writeOutput(stderr, output);
      return { exitCode: 1, output };
    }

    let data;
    try {
      data = await response.json();
    } catch {
      const output = redactedDeliveryCronOutput({ success: false }, 'invalid_json');
      writeOutput(stderr, output);
      return { exitCode: 1, output };
    }

    const output = redactedDeliveryCronOutput(data, response.status || 'ok');
    writeOutput(stdout, output);
    return { exitCode: output.success ? 0 : 1, output };
  } catch (error) {
    const output = redactedDeliveryCronOutput(
      { success: false },
      timeoutStatus(error) ? 'timeout' : 'request_failed',
    );
    writeOutput(stderr, output);
    return { exitCode: 1, output };
  } finally {
    clearTimeoutImpl(timer);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const result = await runOneTimeDeliveryOutboxCron();
  process.exitCode = result.exitCode;
}
