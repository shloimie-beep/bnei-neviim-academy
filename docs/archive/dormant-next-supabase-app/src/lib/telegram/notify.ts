/**
 * High-level Telegram notification helpers. Fan out across BOTH parent bots
 * so Shlomo sees the prompt in @shlomofam_bot and Ahuva sees the same prompt
 * in @ahuvafam_bot — each parent has their own chat thread.
 *
 * Never throws — failures land in the notifications table via client.ts.
 */

import { getAllParentConfigs, type ParentConfig } from './auth';
import {
  editMessageReplyMarkup,
  sendMessage,
  sendPhoto,
  type SendResult,
} from './client';
import {
  buildCheckinNotification,
  type Checkin,
  type Goal,
  type Kid,
} from './messages';

import { supabaseAdmin } from '@/lib/supabase/admin';

const PROOF_BUCKET = 'proofs';
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24;

async function maybeSignedPhotoUrl(
  path: string | null | undefined,
): Promise<string | null> {
  if (!path) return null;
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(PROOF_BUCKET)
      .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}

export type NotifyCheckinResult = {
  parentChatIds: string[];
  results: SendResult[];
};

/**
 * Tell every configured parent (via their own bot) that a kid checked off
 * a goal. Each parent gets the prompt in their personal bot thread with
 * inline Approve / Reject / Skip buttons.
 */
export async function notifyCheckinPending(
  checkin: Pick<
    Checkin,
    'id' | 'kid_id' | 'goal_id' | 'proof_note' | 'proof_photo_path'
  >,
  goal: Pick<Goal, 'id' | 'title'>,
  kid: Pick<Kid, 'id' | 'name'>,
): Promise<NotifyCheckinResult> {
  const parents = getAllParentConfigs();
  if (parents.length === 0) return { parentChatIds: [], results: [] };

  const { text, reply_markup } = buildCheckinNotification(kid, goal, {
    id: checkin.id,
    proof_note: checkin.proof_note ?? null,
    proof_photo_path: checkin.proof_photo_path ?? null,
  });

  const photoUrl = await maybeSignedPhotoUrl(checkin.proof_photo_path);

  const results: SendResult[] = [];
  const parentChatIds: string[] = [];
  for (const parent of parents) {
    if (!parent.chatId) continue;
    parentChatIds.push(parent.chatId);
    let res: SendResult;
    if (photoUrl) {
      res = await sendPhoto(parent, parent.chatId, photoUrl, {
        caption: text,
        parse_mode: 'HTML',
        reply_markup,
        relatedKidId: kid.id,
      });
    } else {
      res = await sendMessage(parent, parent.chatId, text, {
        parse_mode: 'HTML',
        reply_markup,
        relatedKidId: kid.id,
      });
    }
    results.push(res);
  }

  return { parentChatIds, results };
}

/**
 * Push a quick text message to BOTH parents — used for scheduled reminders
 * (e.g. "Reminder: Menachem hasn't checked off any goals yet today").
 */
export async function broadcastToParents(
  text: string,
  options: { relatedKidId?: string | null } = {},
): Promise<SendResult[]> {
  const parents = getAllParentConfigs();
  const out: SendResult[] = [];
  for (const parent of parents) {
    if (!parent.chatId) continue;
    out.push(
      await sendMessage(parent, parent.chatId, text, {
        parse_mode: 'HTML',
        relatedKidId: options.relatedKidId ?? null,
      }),
    );
  }
  return out;
}

/** Clear inline buttons across both parent chats after one parent acts. */
export async function clearCheckinButtons(
  refs: { parent: ParentConfig; chatId: number | string; messageId: number }[],
): Promise<void> {
  await Promise.all(
    refs.map((r) => editMessageReplyMarkup(r.parent, r.chatId, r.messageId, null)),
  );
}
