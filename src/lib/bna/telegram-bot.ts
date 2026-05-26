/**
 * BNA Telegram Bot
 * 
 * Features:
 * - Inline buttons for quick actions
 * - Natural language routing to CLI
 * - Ramble capture and parsing
 * - Pipeline notifications
 */

import { Task, TaskStage, PipelineStats, parseRamble, formatTaskForTelegram, STAGE_CONFIG, CATEGORY_CONFIG } from './task-pipeline';

const TELEGRAM_API = 'https://api.telegram.org/bot';

interface TelegramMessage {
  message_id: number;
  chat: { id: number; first_name?: string };
  from?: { id: number; first_name?: string };
  text?: string;
  voice?: { file_id: string };
  photo?: Array<{ file_id: string }>;
}

interface TelegramCallback {
  id: string;
  from: { id: number };
  message?: { chat: { id: number }; message_id: number };
  data: string;
}

export class BNATelegramBot {
  private token: string;
  private chatId: string;
  private webhookUrl?: string;
  private onMessage?: (text: string, source: 'telegram') => Promise<string>;
  private onTaskCreate?: (task: Partial<Task>) => Promise<Task>;
  private onTaskMove?: (taskId: string, stage: TaskStage) => Promise<void>;

  constructor(config: {
    token: string;
    chatId: string;
    webhookUrl?: string;
    onMessage?: (text: string, source: 'telegram') => Promise<string>;
    onTaskCreate?: (task: Partial<Task>) => Promise<Task>;
    onTaskMove?: (taskId: string, stage: TaskStage) => Promise<void>;
  }) {
    this.token = config.token;
    this.chatId = config.chatId;
    this.webhookUrl = config.webhookUrl;
    this.onMessage = config.onMessage;
    this.onTaskCreate = config.onTaskCreate;
    this.onTaskMove = config.onTaskMove;
  }

  // ============================================================
  // Button Keyboards
  // ============================================================

  getMainMenuKeyboard() {
    return {
      inline_keyboard: [
        [
          { text: '📥 Inbox', callback_data: 'view_inbox' },
          { text: '🔴 Urgent', callback_data: 'view_urgent' },
        ],
        [
          { text: '📊 Pipeline', callback_data: 'view_pipeline' },
          { text: '➕ Quick Add', callback_data: 'quick_add' },
        ],
        [
          { text: '💰 Billing', callback_data: 'view_billing' },
          { text: '👨‍👩‍👧‍👦 Signups', callback_data: 'view_signups' },
        ],
        [
          { text: '🌐 Open Dashboard', url: 'https://bneineviimacademy.org/operations.html' },
        ],
      ],
    };
  }

  getTaskActionKeyboard(taskId: string, currentStage: TaskStage) {
    const stageButtons = Object.entries(STAGE_CONFIG)
      .filter(([stage]) => stage !== currentStage && stage !== 'done')
      .map(([stage, config]) => ({
        text: `→ ${config.label}`,
        callback_data: `move_${taskId}_${stage}`,
      }));

    return {
      inline_keyboard: [
        ...this.chunk(stageButtons, 3),
        [
          { text: '✅ Mark Done', callback_data: `done_${taskId}` },
          { text: '🗑️ Delete', callback_data: `delete_${taskId}` },
        ],
        [
          { text: '← Back to List', callback_data: 'view_inbox' },
        ],
      ],
    };
  }

  getPipelineKeyboard() {
    return {
      inline_keyboard: [
        [
          { text: '📥 Inbox', callback_data: 'stage_inbox' },
          { text: '🔍 Triage', callback_data: 'stage_triage' },
        ],
        [
          { text: '📋 Planned', callback_data: 'stage_planned' },
          { text: '▶️ In Progress', callback_data: 'stage_in_progress' },
        ],
        [
          { text: '⏳ Waiting', callback_data: 'stage_waiting' },
          { text: '👀 Review', callback_data: 'stage_review' },
        ],
        [
          { text: '← Main Menu', callback_data: 'main_menu' },
        ],
      ],
    };
  }

  // ============================================================
  // Message Handlers
  // ============================================================

  async handleMessage(msg: TelegramMessage): Promise<void> {
    if (!msg.text) return;
    
    const chatId = msg.chat.id.toString();
    const text = msg.text;

    // Check if it's a command
    if (text.startsWith('/')) {
      await this.handleCommand(chatId, text);
      return;
    }

    // Check if it looks like a ramble (contains task keywords)
    const rambleResult = parseRamble(text);
    
    if (rambleResult.ai_parsed && rambleResult.ai_parsed.confidence > 0.6) {
      // High confidence - create task and notify
      if (this.onTaskCreate) {
        const task = await this.onTaskCreate(rambleResult);
        await this.sendTaskCreated(chatId, task);
      }
    } else {
      // Low confidence - treat as natural language query
      if (this.onMessage) {
        const response = await this.onMessage(text, 'telegram');
        await this.sendMessage(chatId, response);
      } else {
        // Default response
        await this.sendMessage(
          chatId,
          '👋 I received your message. Use the buttons below or just ramble and I\'ll parse it into tasks.',
          this.getMainMenuKeyboard()
        );
      }
    }
  }

  async handleCommand(chatId: string, text: string): Promise<void> {
    const command = text.split(' ')[0].toLowerCase();

    switch (command) {
      case '/start':
      case '/menu':
        await this.sendMessage(
          chatId,
          '👋 *BNA Operations Bot*\n\nWhat would you like to do?',
          this.getMainMenuKeyboard()
        );
        break;

      case '/inbox':
        await this.sendMessage(chatId, '📥 *Inbox*\n\nLoading tasks...', { inline_keyboard: [] });
        break;

      case '/pipeline':
        await this.sendMessage(
          chatId,
          '📊 *Pipeline View*\n\nSelect a stage to view tasks:',
          this.getPipelineKeyboard()
        );
        break;

      case '/billing':
        await this.sendMessage(
          chatId,
          '💰 *Billing Dashboard*\n\n[Open in browser](https://bneineviimacademy.org/operations.html)',
          {
            inline_keyboard: [
              [
                { text: '💳 View Pending Payments', callback_data: 'billing_pending' },
                { text: '✅ Mark Paid', callback_data: 'billing_mark_paid' },
              ],
              [{ text: '🌐 Open Full Dashboard', url: 'https://bneineviimacademy.org/operations.html' }],
            ],
          }
        );
        break;

      case '/help':
        await this.sendMessage(
          chatId,
          '*BNA Bot Commands*\n\n' +
          '/menu - Show main menu\n' +
          '/inbox - View inbox tasks\n' +
          '/pipeline - Pipeline view\n' +
          '/billing - Billing dashboard\n\n' +
          '*Natural Language:*\n' +
          'Just type or voice message me and I\'ll parse it into tasks.\n\n' +
          'Examples:\n' +
          '"Need to call Cohen about payment"\n' +
          '"Urgent: Fix website contact form"\n' +
          '"Today: Send parent handbook to new family"',
          this.getMainMenuKeyboard()
        );
        break;

      default:
        await this.sendMessage(
          chatId,
          '❓ Unknown command. Use /menu for options.',
          this.getMainMenuKeyboard()
        );
    }
  }

  async handleCallback(cb: TelegramCallback): Promise<void> {
    const chatId = cb.message?.chat.id.toString();
    if (!chatId) return;

    const data = cb.data;

    // Acknowledge the callback
    await this.answerCallback(cb.id);

    // Handle different callback types
    if (data === 'main_menu') {
      await this.editMessage(
        chatId,
        cb.message!.message_id,
        '👋 *BNA Operations Bot*\n\nWhat would you like to do?',
        this.getMainMenuKeyboard()
      );
    } else if (data === 'view_pipeline') {
      await this.editMessage(
        chatId,
        cb.message!.message_id,
        '📊 *Pipeline View*\n\nSelect a stage to view tasks:',
        this.getPipelineKeyboard()
      );
    } else if (data.startsWith('stage_')) {
      const stage = data.replace('stage_', '') as TaskStage;
      await this.editMessage(
        chatId,
        cb.message!.message_id,
        `${STAGE_CONFIG[stage].label}\n\n_Loading tasks..._`,
        { inline_keyboard: [[{ text: '← Back', callback_data: 'view_pipeline' }]] }
      );
    } else if (data === 'quick_add') {
      await this.sendMessage(
        chatId,
        '➕ *Quick Add*\n\nJust type your task and I\'ll parse it. Examples:\n\n' +
        '"Call parent about late payment"\n' +
        '"Urgent: Fix website contact form"\n' +
        '"Today: Send handbook to new family"',
        { inline_keyboard: [[{ text: '← Back', callback_data: 'main_menu' }]] }
      );
    } else if (data === 'view_billing') {
      await this.sendMessage(
        chatId,
        '💰 *Billing*\n\n[Open Dashboard](https://bneineviimacademy.org/operations.html)',
        {
          inline_keyboard: [
            [{ text: '💳 Pending Payments', callback_data: 'billing_pending' }],
            [{ text: '← Back', callback_data: 'main_menu' }],
          ],
        }
      );
    } else if (data === 'view_signups') {
      await this.sendMessage(
        chatId,
        '👨‍👩‍👧‍👦 *Recent Signups*\n\n[Open Dashboard](https://bneineviimacademy.org/operations.html)',
        {
          inline_keyboard: [
            [{ text: '📋 All Signups', callback_data: 'signups_all' }],
            [{ text: '← Back', callback_data: 'main_menu' }],
          ],
        }
      );
    }
  }

  // ============================================================
  // API Methods
  // ============================================================

  async sendMessage(chatId: string, text: string, replyMarkup?: any): Promise<void> {
    const url = `${TELEGRAM_API}${this.token}/sendMessage`;
    const body: any = {
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
    };
    
    if (replyMarkup) {
      body.reply_markup = JSON.stringify(replyMarkup);
    }

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  async editMessage(chatId: string, messageId: number, text: string, replyMarkup?: any): Promise<void> {
    const url = `${TELEGRAM_API}${this.token}/editMessageText`;
    const body: any = {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'Markdown',
    };
    
    if (replyMarkup) {
      body.reply_markup = JSON.stringify(replyMarkup);
    }

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  async answerCallback(callbackId: string, text?: string): Promise<void> {
    const url = `${TELEGRAM_API}${this.token}/answerCallbackQuery`;
    const body: any = { callback_query_id: callbackId };
    if (text) body.text = text;

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  async sendTaskCreated(chatId: string, task: Task): Promise<void> {
    const text = `✅ *Task Created*\n\n${formatTaskForTelegram(task)}`;
    await this.sendMessage(chatId, text, this.getTaskActionKeyboard(task.id, task.stage));
  }

  async sendPipelineStats(stats: PipelineStats): Promise<void> {
    const text = 
      '📊 *Pipeline Status*\n\n' +
      `📥 Inbox: ${stats.inbox}\n` +
      `🔍 Triage: ${stats.triage}\n` +
      `📋 Planned: ${stats.planned}\n` +
      `▶️ In Progress: ${stats.in_progress}\n` +
      `⏳ Waiting: ${stats.waiting}\n` +
      `👀 Review: ${stats.review}\n` +
      `✅ Done (7d): ${stats.done}\n\n` +
      `[View Dashboard](https://bneineviimacademy.org/operations.html)`;

    await this.sendMessage(this.chatId, text, this.getMainMenuKeyboard());
  }

  // ============================================================
  // Webhook Setup
  // ============================================================

  async setWebhook(webhookUrl: string): Promise<boolean> {
    const url = `${TELEGRAM_API}${this.token}/setWebhook`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl }),
    });
    
    const data = await response.json();
    return data.ok;
  }

  async deleteWebhook(): Promise<boolean> {
    const url = `${TELEGRAM_API}${this.token}/deleteWebhook`;
    const response = await fetch(url);
    const data = await response.json();
    return data.ok;
  }

  // ============================================================
  // Helpers
  // ============================================================

  private chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// Singleton instance
let botInstance: BNATelegramBot | null = null;

export function initTelegramBot(config: ConstructorParameters<typeof BNATelegramBot>[0]): BNATelegramBot {
  botInstance = new BNATelegramBot(config);
  return botInstance;
}

export function getTelegramBot(): BNATelegramBot | null {
  return botInstance;
}
