type ProviderName = 'kimi' | 'openai';

type ChatProvider = {
  apiKey: string;
  baseUrl: string;
  model: string;
  name: ProviderName;
};

type CreateChatInput = {
  maxTokens: number;
  system: string;
  user: string;
};

type ChatMessageContent =
  | string
  | Array<{
      text?: string;
      type?: string;
    }>;

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: ChatMessageContent;
      reasoning_content?: string;
    };
  }>;
};

export type ProviderResult = {
  provider: ProviderName;
  text: string;
};

const DEFAULT_KIMI_BASE_URL = 'https://api.moonshot.ai/v1';
const DEFAULT_KIMI_MODEL = 'kimi-k2.5';
const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_OPENAI_MODEL = 'gpt-4.1-mini';

function trimTrailingSlash(input: string): string {
  return input.replace(/\/+$/, '');
}

function getProviders(): ChatProvider[] {
  const providers: ChatProvider[] = [];

  const kimiKey = process.env.KIMI_API_KEY?.trim();
  if (kimiKey) {
    providers.push({
      name: 'kimi',
      apiKey: kimiKey,
      baseUrl: trimTrailingSlash(process.env.KIMI_BASE_URL?.trim() || DEFAULT_KIMI_BASE_URL),
      model: process.env.KIMI_MODEL?.trim() || DEFAULT_KIMI_MODEL,
    });
  }

  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  if (openAiKey) {
    providers.push({
      name: 'openai',
      apiKey: openAiKey,
      baseUrl: trimTrailingSlash(process.env.OPENAI_BASE_URL?.trim() || DEFAULT_OPENAI_BASE_URL),
      model: process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL,
    });
  }

  return providers;
}

function extractText(content: ChatMessageContent | undefined): string {
  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part?.text === 'string' ? part.text : ''))
      .join('')
      .trim();
  }

  return '';
}

async function createChatCompletion(
  provider: ChatProvider,
  input: CreateChatInput,
): Promise<ProviderResult> {
  const response = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      max_tokens: input.maxTokens,
      ...(provider.name === 'kimi'
        ? {
            // Kimi reasoning mode can consume the entire token budget and leave
            // `content` empty for short requests. Disable it for chat UX.
            thinking: { type: 'disabled' },
          }
        : {}),
      messages: [
        { role: 'system', content: input.system },
        { role: 'user', content: input.user },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${provider.name} ${response.status}: ${body.slice(0, 400)}`);
  }

  const data = (await response.json()) as ChatCompletionResponse;
  const text = extractText(data.choices?.[0]?.message?.content);
  if (!text) {
    throw new Error(`${provider.name} returned no text`);
  }

  return {
    provider: provider.name,
    text,
  };
}

export function isAiChatAvailable(): boolean {
  return getProviders().length > 0;
}

export async function createPrimaryChatWithFallback(
  input: CreateChatInput,
): Promise<ProviderResult> {
  const providers = getProviders();
  if (providers.length === 0) {
    throw new Error('No AI provider is configured');
  }

  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      return await createChatCompletion(provider, input);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw lastError ?? new Error('All AI providers failed');
}
