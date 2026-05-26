/**
 * BNA Telegram Bot - Billing & Registration Management
 * 
 * This endpoint handles Telegram commands for BNA operations:
 * - /bna_parents - List all BNA parents
 * - /bna_students - List all BNA students  
 * - /bna_pending - List pending payments
 * - /bna_paid - List paid registrations
 * - /bna_cash - List cash payment selections
 * - /bna_greeninvoice - List Green Invoice selections
 * - /markpaid <name> [amount] [method] - Mark a registration as paid
 * - /find <query> - Find a parent/student
 * 
 * Webhook URL: /api/bna/telegram
 */

import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Environment variables
const TELEGRAM_BOT_TOKEN = process.env.BNA_TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID_SHLOIMIE = process.env.TELEGRAM_CHAT_ID_SHLOIMIE;
const TELEGRAM_CHAT_ID_AHUVA = process.env.TELEWAY_CHAT_ID_AHUVA;
const APP_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://bneineviimacademy.org';

// Authorized chat IDs
const AUTHORIZED_CHAT_IDS = [
  TELEGRAM_CHAT_ID_SHLOIMIE,
  TELEGRAM_CHAT_ID_AHUVA,
].filter(Boolean);

interface TelegramUpdate {
  message?: {
    chat: { id: number };
    text?: string;
    from?: { username?: string; first_name?: string };
  };
  callback_query?: {
    id: string;
    from: { id: number; username?: string };
    data?: string;
    message?: { chat: { id: number }; message_id: number };
  };
}

// Send message to Telegram
async function sendTelegramMessage(chatId: number, text: string, parseMode: 'HTML' | 'Markdown' = 'HTML') {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('Telegram bot token not configured');
    return { ok: false };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text.slice(0, 4096), // Telegram message limit
        parse_mode: parseMode,
      }),
    });
    return { ok: response.ok };
  } catch (err) {
    console.error('Failed to send Telegram message:', err);
    return { ok: false };
  }
}

// Fetch signups from our API
async function fetchSignups(params: Record<string, string> = {}) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `${APP_URL}/api/signups${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) throw new Error('API request failed');
    const data = await response.json();
    return data.signups || [];
  } catch (err) {
    console.error('Failed to fetch signups:', err);
    return [];
  }
}

// Update signup via API
async function updateSignup(id: number, updates: Record<string, any>) {
  try {
    const response = await fetch(`${APP_URL}/api/signups/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) throw new Error('Update failed');
    const data = await response.json();
    return data.signup;
  } catch (err) {
    console.error('Failed to update signup:', err);
    return null;
  }
}

// Command handlers
const commands: Record<string, (args: string[], chatId: number) => Promise<string>> = {
  // Help command
  help: async () => {
    return `<b>🎓 BNA Bot Commands</b>

<b>Reporting:</b>
/bna_signups - All signups
/bna_pending - Pending payments
/bna_paid - Paid registrations
/bna_cash - Cash payment selections
/bna_greeninvoice - Green Invoice selections
/find &lt;name&gt; - Search for parent/student

<b>Updates:</b>
/markpaid &lt;name&gt; [₪amount] [cash|greeninvoice]

<b>Examples:</b>
/markpaid Cohen
/markpaid "David Cohen" 1000 cash
/find Cohen`;
  },

  // List all signups
  bna_signups: async () => {
    const signups = await fetchSignups();
    if (signups.length === 0) return 'No signups found.';
    
    let text = `<b>📝 All BNA Signups (${signups.length})</b>\n\n`;
    for (const s of signups.slice(0, 20)) {
      const status = s.payment_status === 'paid' ? '✅' : '⏳';
      const method = s.payment_method === 'Cash' ? '💵' : '💳';
      text += `${status} ${method} <b>${s.child_name}</b> (${s.child_age})\n`;
      text += `   Parent: ${s.parent1_name}\n`;
      text += `   Status: ${s.payment_status}\n\n`;
    }
    if (signups.length > 20) text += `... and ${signups.length - 20} more`;
    return text;
  },

  // List pending payments
  bna_pending: async () => {
    const signups = await fetchSignups({ status: 'pending' });
    const cashPending = await fetchSignups({ status: 'pending_cash' });
    const allPending = [...signups, ...cashPending];
    
    if (allPending.length === 0) return 'No pending payments.';
    
    let text = `<b>⏳ Pending Payments (${allPending.length})</b>\n\n`;
    for (const s of allPending) {
      const method = s.payment_method === 'Cash' ? '💵 Cash' : '💳 Green Invoice';
      const date = new Date(s.submitted_at).toLocaleDateString('en-GB');
      text += `<b>${s.child_name}</b> (${s.child_age})\n`;
      text += `   Parent: ${s.parent1_name}\n`;
      text += `   ${method} | ${date}\n`;
      text += `   📞 ${s.parent1_phone}\n\n`;
    }
    return text;
  },

  // List paid registrations
  bna_paid: async () => {
    const signups = await fetchSignups({ status: 'paid' });
    if (signups.length === 0) return 'No paid registrations yet.';
    
    let text = `<b>✅ Paid Registrations (${signups.length})</b>\n\n`;
    for (const s of signups.slice(0, 20)) {
      const date = s.paid_at ? new Date(s.paid_at).toLocaleDateString('en-GB') : 'Unknown';
      text += `<b>${s.child_name}</b> (${s.child_age})\n`;
      text += `   Parent: ${s.parent1_name}\n`;
      text += `   Paid: ${date}\n\n`;
    }
    return text;
  },

  // List cash payments
  bna_cash: async () => {
    const pending = await fetchSignups({ payment_method: 'Cash', status: 'pending_cash' });
    const paid = await fetchSignups({ payment_method: 'Cash', status: 'paid' });
    
    let text = `<b>💵 Cash Payments</b>\n\n`;
    
    if (pending.length > 0) {
      text += `<b>Pending (${pending.length}):</b>\n`;
      for (const s of pending) {
        text += `• ${s.child_name} - ${s.parent1_name}\n`;
      }
      text += '\n';
    }
    
    if (paid.length > 0) {
      text += `<b>Paid (${paid.length}):</b>\n`;
      for (const s of paid.slice(0, 10)) {
        const date = s.paid_at ? new Date(s.paid_at).toLocaleDateString('en-GB') : '';
        text += `• ${s.child_name} ${date ? '✓ ' + date : ''}\n`;
      }
    }
    
    if (pending.length === 0 && paid.length === 0) {
      text += 'No cash payments recorded.';
    }
    
    return text;
  },

  // List Green Invoice payments
  bna_greeninvoice: async () => {
    const pending = await fetchSignups({ payment_method: 'Green Invoice', status: 'pending' });
    const paid = await fetchSignups({ payment_method: 'Green Invoice', status: 'paid' });
    
    let text = `<b>💳 Green Invoice Payments</b>\n\n`;
    
    if (pending.length > 0) {
      text += `<b>Pending (${pending.length}):</b>\n`;
      for (const s of pending) {
        text += `• ${s.child_name} - ${s.parent1_name}\n`;
      }
      text += '\n';
    }
    
    if (paid.length > 0) {
      text += `<b>Paid (${paid.length}):</b>\n`;
      for (const s of paid.slice(0, 10)) {
        const date = s.paid_at ? new Date(s.paid_at).toLocaleDateString('en-GB') : '';
        text += `• ${s.child_name} ${date ? '✓ ' + date : ''}\n`;
      }
    }
    
    if (pending.length === 0 && paid.length === 0) {
      text += 'No Green Invoice payments recorded.';
    }
    
    return text;
  },

  // Find parent/student
  find: async (args) => {
    if (args.length === 0) return 'Usage: /find &lt;name&gt;';
    
    const query = args.join(' ');
    const signups = await fetchSignups({ search: query });
    
    if (signups.length === 0) return `No results found for "${query}"`;
    
    let text = `<b>🔍 Search Results for "${query}"</b>\n\n`;
    for (const s of signups.slice(0, 10)) {
      const status = s.payment_status === 'paid' ? '✅ Paid' : '⏳ Pending';
      text += `<b>${s.child_name}</b> (${s.child_age})\n`;
      text += `   Parent: ${s.parent1_name}\n`;
      text += `   📞 ${s.parent1_phone}\n`;
      text += `   ✉️ ${s.parent1_email}\n`;
      text += `   ${status} | ${s.payment_method}\n`;
      text += `   ID: ${s.id}\n\n`;
    }
    return text;
  },

  // Mark as paid
  markpaid: async (args) => {
    if (args.length === 0) {
      return 'Usage: /markpaid &lt;name&gt; [₪amount] [cash|greeninvoice]\nExample: /markpaid "David Cohen" 1000 cash';
    }
    
    // Parse arguments
    let nameQuery = '';
    let amount = 1000;
    let method: string | null = null;
    
    // Check if first arg is quoted (full name)
    if (args[0].startsWith('"')) {
      // Find closing quote
      const closingIndex = args.findIndex((a, i) => i > 0 && a.endsWith('"'));
      if (closingIndex > 0) {
        nameQuery = args.slice(0, closingIndex + 1).join(' ').replace(/"/g, '');
        const remaining = args.slice(closingIndex + 1);
        
        for (const arg of remaining) {
          if (/^\d+$/.test(arg)) amount = parseInt(arg);
          if (['cash', 'greeninvoice', 'green invoice'].includes(arg.toLowerCase())) {
            method = arg.toLowerCase() === 'cash' ? 'Cash' : 'Green Invoice';
          }
        }
      } else {
        nameQuery = args[0].replace(/"/g, '');
        for (let i = 1; i < args.length; i++) {
          if (/^\d+$/.test(args[i])) amount = parseInt(args[i]);
          if (['cash', 'greeninvoice', 'green invoice'].includes(args[i].toLowerCase())) {
            method = args[i].toLowerCase() === 'cash' ? 'Cash' : 'Green Invoice';
          }
        }
      }
    } else {
      nameQuery = args[0];
      for (let i = 1; i < args.length; i++) {
        if (/^\d+$/.test(args[i])) amount = parseInt(args[i]);
        if (['cash', 'greeninvoice', 'green invoice'].includes(args[i].toLowerCase())) {
          method = args[i].toLowerCase() === 'cash' ? 'Cash' : 'Green Invoice';
        }
      }
    }
    
    // Search for matching signups
    const signups = await fetchSignups({ search: nameQuery });
    
    if (signups.length === 0) {
      return `❌ No signup found for "${nameQuery}"`;
    }
    
    if (signups.length > 1) {
      let text = `⚠️ Found multiple matches for "${nameQuery}":\n\n`;
      for (const s of signups) {
        text += `ID ${s.id}: <b>${s.child_name}</b> - ${s.parent1_name}\n`;
      }
      text += '\nPlease be more specific or use /find first.';
      return text;
    }
    
    const signup = signups[0];
    
    // Check if already paid
    if (signup.payment_status === 'paid') {
      return `⚠️ ${signup.child_name} is already marked as paid.`;
    }
    
    // Update the signup
    const updates: Record<string, any> = {
      payment_status: 'paid',
      paid_at: new Date().toISOString(),
    };
    
    if (method) {
      updates.payment_method = method;
    }
    
    const updated = await updateSignup(signup.id, updates);
    
    if (!updated) {
      return `❌ Failed to update ${signup.child_name}. Please try again.`;
    }
    
    // Calculate next billing date
    const nextBillingDate = new Date();
    nextBillingDate.setDate(nextBillingDate.getDate() + 30);
    
    return `✅ <b>Updated Successfully</b>

<b>${signup.child_name}</b>
Parent: ${signup.parent1_name}
Amount: ₪${amount}
Method: ${method || signup.payment_method}
Status: Paid
Next Billing: ${nextBillingDate.toLocaleDateString('en-GB')}`;
  },
};

// Main webhook handler
export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('BNA Telegram bot token not configured');
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  let update: TelegramUpdate;
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const message = update.message;
  if (!message?.text) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const chatId = message.chat.id;
  const text = message.text.trim();

  // Check authorization
  if (!AUTHORIZED_CHAT_IDS.includes(String(chatId))) {
    await sendTelegramMessage(chatId, 'This bot is private.');
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Parse command
  if (!text.startsWith('/')) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const firstSpace = text.indexOf(' ');
  const command = firstSpace === -1 ? text.slice(1) : text.slice(1, firstSpace);
  const args = firstSpace === -1 ? '' : text.slice(firstSpace + 1).trim();
  const argsArray = args ? args.split(/\s+/) : [];

  // Handle command
  const handler = commands[command.toLowerCase()];
  if (!handler) {
    await sendTelegramMessage(chatId, `Unknown command: /${command}\nSend /help for available commands.`);
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  try {
    const response = await handler(argsArray, chatId);
    await sendTelegramMessage(chatId, response);
  } catch (err) {
    console.error('Command handler error:', err);
    await sendTelegramMessage(chatId, '❌ An error occurred. Please try again.');
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
