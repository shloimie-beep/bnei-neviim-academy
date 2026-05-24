/**
 * Per-parent Telegram webhook.
 *
 * POST /api/telegram/webhook/shloimie  → Shlomo's @shlomofam_bot lands here
 * POST /api/telegram/webhook/ahuva     → Ahuva's @ahuvafam_bot lands here
 *
 * Both bots reach the same handler chain. The `[parent]` route param tells
 * us which bot config to use for replies. Validates
 * X-Telegram-Bot-Api-Secret-Token against THAT parent's
 * TELEGRAM_WEBHOOK_SECRET_<PARENT>.
 *
 * Free-text (non slash-command) messages are routed to Kimi first and
 * OpenAI second, with the family Supabase as the only data source.
 *
 * Always returns 200 — Telegram retries non-2xx forever.
 */

import { NextResponse, type NextRequest } from 'next/server';
import type { Update } from 'node-telegram-bot-api';

import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  getParentConfig,
  isAuthorizedChat,
  parentNameForChat,
  type ParentId,
} from '@/lib/telegram/auth';
import {
  answerCallbackQuery,
  editMessageReplyMarkup,
  sendMessage,
} from '@/lib/telegram/client';
import {
  handleAddGoal,
  handleApproveCallback,
  handleDashboard,
  handleFreeze,
  handleHelp,
  handleMeetings,
  handleRejectCallback,
  handleSkipCallback,
  handleStreak,
  handleToday,
  handleUnfreeze,
  type HandlerInput,
} from '@/lib/telegram/handlers';
import { chatWithFamilyAI, isFamilyChatAvailable } from '@/lib/ai/chat';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function tokenize(input: string): string[] {
  const out: string[] = [];
  const re = /"([^"]*)"|“([^”]*)”|'([^']*)'|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(input)) !== null) {
    out.push(m[1] ?? m[2] ?? m[3] ?? m[4] ?? '');
  }
  return out.filter((s) => s.length > 0);
}

async function logWebhookError(context: string, err: unknown): Promise<void> {
  const message = err instanceof Error ? err.message : String(err);
  try {
    await supabaseAdmin.from('notifications').insert({
      channel: 'telegram',
      recipient: 'webhook',
      subject: context,
      delivered: false,
      error: message,
    });
  } catch {
    // eslint-disable-next-line no-console
    console.error('[telegram-webhook]', context, message);
  }
}

type CommandHandler = (input: HandlerInput) => Promise<{
  text: string;
  reply_markup?: import('node-telegram-bot-api').InlineKeyboardMarkup;
}>;

const COMMANDS: Record<string, CommandHandler> = {
  today: handleToday,
  streak: handleStreak,
  meetings: handleMeetings,
  addgoal: handleAddGoal,
  freeze: handleFreeze,
  unfreeze: handleUnfreeze,
  dashboard: handleDashboard,
  help: handleHelp,
  start: handleHelp,
};

function parseParentId(raw: string | undefined): ParentId | null {
  if (raw === 'shloimie' || raw === 'shlomo') return 'shloimie';
  if (raw === 'ahuva') return 'ahuva';
  return null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { parent: string } },
): Promise<NextResponse> {
  // 1) Identify which parent's bot this update belongs to.
  const parentId = parseParentId(params.parent);
  if (!parentId) {
    await logWebhookError('route', `Unknown parent in path: ${params.parent}`);
    return NextResponse.json({ ok: true }, { status: 200 });
  }
  const parent = getParentConfig(parentId);
  if (!parent) {
    await logWebhookError('config', `Bot not configured for ${parentId}`);
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // 2) Validate Telegram secret token header for THIS bot.
  const got = req.headers.get('x-telegram-bot-api-secret-token');
  if (got !== parent.webhookSecret) {
    await logWebhookError(
      'auth',
      `Bad/missing secret for ${parentId} (got=${got ? 'present' : 'absent'})`,
    );
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // 3) Parse the update.
  let update: Update;
  try {
    update = (await req.json()) as Update;
  } catch (err) {
    await logWebhookError('json-parse', err);
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // 4) Dispatch.
  try {
    if (update.message) {
      await handleMessage(update, parent);
    } else if (update.callback_query) {
      await handleCallback(update, parent);
    }
  } catch (err) {
    await logWebhookError('dispatch', err);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

async function handleMessage(
  update: Update,
  parent: ReturnType<typeof getParentConfig> extends infer T ? Exclude<T, null> : never,
): Promise<void> {
  const msg = update.message;
  if (!msg || !msg.text) return;
  const chatId = msg.chat.id;

  if (!isAuthorizedChat(chatId)) {
    await sendMessage(
      parent,
      chatId,
      'This bot is private. If you reached it by accident, you can close the chat.',
    );
    return;
  }

  const text = msg.text.trim();

  // Slash command — dispatch to handler.
  if (text.startsWith('/')) {
    const firstSpace = text.indexOf(' ');
    const head = firstSpace === -1 ? text.slice(1) : text.slice(1, firstSpace);
    const rest = firstSpace === -1 ? '' : text.slice(firstSpace + 1);
    const command = head.split('@')[0].toLowerCase();

    const handler = COMMANDS[command];
    if (!handler) {
      await sendMessage(
        parent,
        chatId,
        `Unknown command: <code>/${command}</code>. Send /help for the list.`,
      );
      return;
    }
    const args = tokenize(rest);
    const out = await handler({ chatId, args, supabase: supabaseAdmin, parent });
    await sendMessage(parent, chatId, out.text, {
      parse_mode: 'HTML',
      reply_markup: out.reply_markup,
    });
    return;
  }

  // Free-text → route to Claude with family data as the only source.
  if (!isFamilyChatAvailable()) {
    await sendMessage(
      parent,
      chatId,
      'Free-text chat is off (set KIMI_API_KEY or OPENAI_API_KEY). Try /help for commands.',
    );
    return;
  }
  const result = await chatWithFamilyAI(parent, text);
  if (!result.ok) {
    await sendMessage(
      parent,
      chatId,
      result.reason === 'not_configured'
        ? '<i>AI chat is not configured.</i>'
        : `<i>AI error: ${result.error ?? 'unknown'}</i>`,
    );
    return;
  }
  await sendMessage(parent, chatId, result.text);
}

async function handleCallback(
  update: Update,
  parent: ReturnType<typeof getParentConfig> extends infer T ? Exclude<T, null> : never,
): Promise<void> {
  const cq = update.callback_query;
  if (!cq || !cq.data) return;
  const chatId = cq.message?.chat.id;
  const messageId = cq.message?.message_id;

  if (!chatId || !isAuthorizedChat(chatId)) {
    await answerCallbackQuery(parent, cq.id, 'Not authorized', true);
    return;
  }

  const parentName = parentNameForChat(chatId);
  const [prefix, checkinId] = cq.data.split(':');

  let result;
  switch (prefix) {
    case 'approve':
      result = await handleApproveCallback(supabaseAdmin, checkinId, parentName);
      break;
    case 'reject':
      result = await handleRejectCallback(supabaseAdmin, checkinId, parentName);
      break;
    case 'skip':
      result = await handleSkipCallback(supabaseAdmin, checkinId, parentName);
      break;
    default:
      await answerCallbackQuery(parent, cq.id, 'Unknown action', true);
      return;
  }

  await answerCallbackQuery(parent, cq.id, stripTags(result.text).slice(0, 64));

  if (messageId) {
    await editMessageReplyMarkup(parent, chatId, messageId, { inline_keyboard: [] });
  }
  await sendMessage(parent, chatId, result.text, { parse_mode: 'HTML' });
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, '');
}
