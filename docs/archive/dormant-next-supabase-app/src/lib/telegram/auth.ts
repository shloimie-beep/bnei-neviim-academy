/**
 * Per-parent bot identity. Each parent has their own BotFather bot —
 * Shlomo's `@shlomofam_bot`, Ahuva's `@ahuvafam_bot` — so webhooks come
 * in on parent-specific paths (`/api/telegram/webhook/shloimie` vs
 * `/api/telegram/webhook/ahuva`), and notifications fan out to both
 * bots so each parent's inbox shows their own thread.
 *
 * env vars (all required for a given parent's bot to function):
 *   TELEGRAM_BOT_TOKEN_<PARENT>
 *   TELEGRAM_BOT_USERNAME_<PARENT>
 *   TELEGRAM_CHAT_ID_<PARENT>
 *   TELEGRAM_WEBHOOK_SECRET_<PARENT>
 *
 * Fail-closed: missing env → that parent's bot is disabled, but the other
 * parent's bot still works.
 */

export type ParentId = 'shloimie' | 'ahuva';
export const PARENT_IDS: ParentId[] = ['shloimie', 'ahuva'];

export type ParentConfig = {
  id: ParentId;
  displayName: 'Shloimie' | 'Ahuva';
  token: string;
  username: string;
  chatId: string;
  webhookSecret: string;
};

function envFor(id: ParentId): Partial<ParentConfig> {
  const SUFFIX = id === 'shloimie' ? 'SHLOIMIE' : 'AHUVA';
  return {
    id,
    displayName: id === 'shloimie' ? 'Shloimie' : 'Ahuva',
    token: process.env[`TELEGRAM_BOT_TOKEN_${SUFFIX}`] ?? '',
    username: process.env[`TELEGRAM_BOT_USERNAME_${SUFFIX}`] ?? '',
    chatId: process.env[`TELEGRAM_CHAT_ID_${SUFFIX}`] ?? '',
    webhookSecret: process.env[`TELEGRAM_WEBHOOK_SECRET_${SUFFIX}`] ?? '',
  };
}

function isFullyConfigured(p: Partial<ParentConfig>): p is ParentConfig {
  return Boolean(p.id && p.token && p.username && p.webhookSecret);
}

export function getParentConfig(id: ParentId): ParentConfig | null {
  const p = envFor(id);
  return isFullyConfigured(p) ? p : null;
}

/** All fully-configured parent bots. Used for fan-out notifications. */
export function getAllParentConfigs(): ParentConfig[] {
  return PARENT_IDS.map(envFor).filter(isFullyConfigured);
}

/** Authorized chat IDs across both parents. Used for inbound auth. */
export function getAuthorizedChatIds(): string[] {
  return getAllParentConfigs()
    .map((p) => p.chatId)
    .filter((id): id is string => !!id);
}

export function isAuthorizedChat(chatId: number | string): boolean {
  const allowed = getAuthorizedChatIds();
  if (allowed.length === 0) return false;
  return allowed.includes(String(chatId));
}

/** Pretty name for the parent associated with this chat ID. */
export function parentNameForChat(chatId: number | string): string {
  const s = String(chatId);
  for (const cfg of getAllParentConfigs()) {
    if (cfg.chatId === s) return cfg.displayName;
  }
  return 'Parent';
}

/**
 * Look up a parent config by their chat_id (used inside the webhook to
 * derive which bot/parent context the current message belongs to —
 * the [parent] route param already tells us, but this helper is useful
 * if we ever want to disambiguate based on the sender alone).
 */
export function parentByChatId(chatId: number | string): ParentConfig | null {
  const s = String(chatId);
  for (const cfg of getAllParentConfigs()) {
    if (cfg.chatId === s) return cfg;
  }
  return null;
}
