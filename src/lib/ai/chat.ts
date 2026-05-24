import { createPrimaryChatWithFallback, isAiChatAvailable, type ProviderResult } from './client';
import { buildSystemPrompt } from './system-prompt';
import { buildFamilyContext } from './family-context';
import type { ParentConfig } from '@/lib/telegram/auth';

const MAX_OUTPUT_TOKENS = 600;

export type ChatResult =
  | ({ ok: true; cached: false } & ProviderResult)
  | { ok: false; reason: 'not_configured' | 'api_error'; error?: string };

export function isFamilyChatAvailable(): boolean {
  return isAiChatAvailable();
}

export async function chatWithFamilyAI(
  parent: ParentConfig,
  userMessage: string,
): Promise<ChatResult> {
  if (!isAiChatAvailable()) {
    return { ok: false, reason: 'not_configured' };
  }

  const familyContext = await buildFamilyContext();
  const system = buildSystemPrompt(parent);

  try {
    const result = await createPrimaryChatWithFallback({
      system,
      user: `${familyContext}\n\n${userMessage}`,
      maxTokens: MAX_OUTPUT_TOKENS,
    });

    return {
      ok: true,
      cached: false,
      provider: result.provider,
      text: result.text,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, reason: 'api_error', error: message };
  }
}
