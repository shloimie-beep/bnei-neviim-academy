/**
 * CLI Bridge - Routes Telegram messages to Kimi CLI session
 * 
 * This creates a persistent connection between Telegram and the terminal.
 * When you send a message/voice/photo via Telegram, it appears here.
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface CLIMessage {
  id: string;
  source: 'telegram' | 'web';
  message_type: 'text' | 'voice' | 'photo' | 'document';
  content: string;
  metadata: {
    chat_id?: string;
    message_id?: number;
    photo_url?: string;
    caption?: string;
    file_path?: string;
  };
  processed: boolean;
  processed_by?: string;
  processed_at?: string;
  response?: string;
  created_at: string;
}

/**
 * Store incoming message from Telegram webhook
 */
export async function storeIncomingMessage(
  message: Omit<CLIMessage, 'id' | 'created_at' | 'processed'>
): Promise<string> {
  const { data, error } = await supabase
    .from('cli_bridge_messages')
    .insert({
      ...message,
      processed: false
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

/**
 * Get unprocessed messages (called by CLI polling)
 */
export async function getUnprocessedMessages(limit = 10): Promise<CLIMessage[]> {
  const { data, error } = await supabase
    .from('cli_bridge_messages')
    .select('*')
    .eq('processed', false)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Mark message as processed with response
 */
export async function markProcessed(
  messageId: string,
  response: string,
  processedBy: string = 'kimi-cli'
): Promise<void> {
  const { error } = await supabase
    .from('cli_bridge_messages')
    .update({
      processed: true,
      processed_by: processedBy,
      processed_at: new Date().toISOString(),
      response
    })
    .eq('id', messageId);

  if (error) throw error;
}

/**
 * Send response back to Telegram
 */
export async function sendTelegramResponse(
  chatId: string,
  text: string,
  options?: {
    replyToMessageId?: number;
    parseMode?: 'HTML' | 'Markdown';
  }
): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) throw new Error('TELEGRAM_BOT_TOKEN not set');

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  const body: any = {
    chat_id: chatId,
    text: text.slice(0, 4096), // Telegram limit
    parse_mode: options?.parseMode
  };

  if (options?.replyToMessageId) {
    body.reply_to_message_id = options.replyToMessageId;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telegram API error: ${err}`);
  }
}

/**
 * CLI Bridge Table SQL (run this in Supabase):
 * 
 * create table cli_bridge_messages (
 *   id uuid primary key default uuid_generate_v4(),
 *   source text not null,
 *   message_type text not null,
 *   content text not null,
 *   metadata jsonb default '{}',
 *   processed boolean not null default false,
 *   processed_by text,
 *   processed_at timestamptz,
 *   response text,
 *   created_at timestamptz not null default now()
 * );
 * 
 * create index idx_cli_bridge_unprocessed on cli_bridge_messages(processed, created_at) where processed = false;
 */
