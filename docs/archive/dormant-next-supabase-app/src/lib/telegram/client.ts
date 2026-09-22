/**
 * Telegram bot client — webhook mode, per-parent.
 *
 * Each parent has their own BotFather bot. `getBot(parent)` returns a
 * cached `TelegramBot` instance pinned to that parent's token. All public
 * helpers take a `ParentConfig`; never throws — failures land in the
 * notifications table.
 */

import TelegramBot, {
  type InlineKeyboardMarkup,
  type Message,
  type ParseMode,
} from 'node-telegram-bot-api';

import { supabaseAdmin } from '@/lib/supabase/admin';
import type { ParentConfig } from './auth';

const _bots = new Map<string, TelegramBot>();

function getBot(parent: ParentConfig): TelegramBot {
  const existing = _bots.get(parent.id);
  if (existing) return existing;
  const bot = new TelegramBot(parent.token, { polling: false });
  _bots.set(parent.id, bot);
  return bot;
}

type LogArgs = {
  recipient: string;
  subject?: string | null;
  body?: string | null;
  delivered: boolean;
  error?: string | null;
  relatedKidId?: string | null;
};

async function logNotification(args: LogArgs): Promise<void> {
  try {
    await supabaseAdmin.from('notifications').insert({
      channel: 'telegram',
      recipient: args.recipient,
      subject: args.subject ?? null,
      body: args.body ?? null,
      delivered: args.delivered,
      error: args.error ?? null,
      related_kid_id: args.relatedKidId ?? null,
    });
  } catch (logErr) {
    // eslint-disable-next-line no-console
    console.error('[telegram] failed to write notifications row', logErr);
  }
}

export type SendMessageOptions = {
  parse_mode?: ParseMode;
  reply_markup?: InlineKeyboardMarkup;
  disable_web_page_preview?: boolean;
  relatedKidId?: string | null;
};

export type SendResult =
  | { ok: true; messageId: number; chatId: number | string }
  | { ok: false; error: string };

export async function sendMessage(
  parent: ParentConfig,
  chatId: number | string,
  text: string,
  options: SendMessageOptions = {},
): Promise<SendResult> {
  const { relatedKidId, ...telegramOptions } = options;
  const parseMode = telegramOptions.parse_mode ?? 'HTML';
  try {
    const msg: Message = await getBot(parent).sendMessage(chatId, text, {
      ...telegramOptions,
      parse_mode: parseMode,
    });
    await logNotification({
      recipient: `${parent.id}:${chatId}`,
      body: text,
      delivered: true,
      relatedKidId,
    });
    return { ok: true, messageId: msg.message_id, chatId: msg.chat.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await logNotification({
      recipient: `${parent.id}:${chatId}`,
      body: text,
      delivered: false,
      error: message,
      relatedKidId,
    });
    return { ok: false, error: message };
  }
}

export type SendPhotoOptions = {
  caption?: string;
  parse_mode?: ParseMode;
  reply_markup?: InlineKeyboardMarkup;
  relatedKidId?: string | null;
};

export async function sendPhoto(
  parent: ParentConfig,
  chatId: number | string,
  photo: string | Buffer | NodeJS.ReadableStream,
  options: SendPhotoOptions = {},
): Promise<SendResult> {
  const { relatedKidId, ...rest } = options;
  const parseMode = rest.parse_mode ?? 'HTML';
  try {
    const msg: Message = await getBot(parent).sendPhoto(chatId, photo as never, {
      ...rest,
      parse_mode: parseMode,
    });
    await logNotification({
      recipient: `${parent.id}:${chatId}`,
      subject: 'photo',
      body: rest.caption ?? null,
      delivered: true,
      relatedKidId,
    });
    return { ok: true, messageId: msg.message_id, chatId: msg.chat.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await logNotification({
      recipient: `${parent.id}:${chatId}`,
      subject: 'photo',
      body: rest.caption ?? null,
      delivered: false,
      error: message,
      relatedKidId,
    });
    return { ok: false, error: message };
  }
}

export async function editMessageReplyMarkup(
  parent: ParentConfig,
  chatId: number | string,
  messageId: number,
  replyMarkup: InlineKeyboardMarkup | null,
): Promise<SendResult> {
  try {
    const markup: InlineKeyboardMarkup = replyMarkup ?? { inline_keyboard: [] };
    const res = await getBot(parent).editMessageReplyMarkup(markup, {
      chat_id: chatId,
      message_id: messageId,
    });
    const messageIdOut =
      typeof res === 'object' && res !== null && 'message_id' in res
        ? (res as Message).message_id
        : messageId;
    return { ok: true, messageId: messageIdOut, chatId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await logNotification({
      recipient: `${parent.id}:${chatId}`,
      subject: 'editMessageReplyMarkup',
      delivered: false,
      error: message,
    });
    return { ok: false, error: message };
  }
}

export async function answerCallbackQuery(
  parent: ParentConfig,
  callbackQueryId: string,
  text?: string,
  showAlert = false,
): Promise<SendResult> {
  try {
    await getBot(parent).answerCallbackQuery(callbackQueryId, {
      text,
      show_alert: showAlert,
    });
    return { ok: true, messageId: 0, chatId: callbackQueryId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await logNotification({
      recipient: `${parent.id}:${callbackQueryId}`,
      subject: 'answerCallbackQuery',
      body: text ?? null,
      delivered: false,
      error: message,
    });
    return { ok: false, error: message };
  }
}

export async function setWebhook(
  parent: ParentConfig,
  url: string,
): Promise<SendResult> {
  try {
    await getBot(parent).setWebHook(url, {
      secret_token: parent.webhookSecret,
    } as never);
    return { ok: true, messageId: 0, chatId: url };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}
