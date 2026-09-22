import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parseRamble, createTaskFromRamble, type TaskInput } from '@/lib/bna/task-pipeline';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OPS_USERNAME = process.env.OPS_USERNAME || 'admin';
const OPS_PASSWORD = process.env.OPS_PASSWORD || 'admin';

// Main menu keyboard
const MAIN_KEYBOARD = {
  inline_keyboard: [
    [
      { text: '📥 Inbox', callback_data: 'view_inbox' },
      { text: '🔴 Urgent', callback_data: 'view_urgent' }
    ],
    [
      { text: '📊 Pipeline', callback_data: 'view_pipeline' },
      { text: '➕ Quick Add', callback_data: 'quick_add' }
    ],
    [
      { text: '💰 Billing', callback_data: 'view_billing' },
      { text: '👨‍👩‍👧‍👦 Signups', callback_data: 'view_signups' }
    ],
    [
      { text: '🌐 Open Dashboard', url: `${process.env.APP_URL}/operations` }
    ]
  ]
};

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    
    // Handle callback queries (button clicks)
    if (update.callback_query) {
      await handleCallback(update.callback_query);
      return NextResponse.json({ ok: true });
    }
    
    // Handle messages (text, voice, photo)
    if (update.message) {
      await handleMessage(update.message);
      return NextResponse.json({ ok: true });
    }
    
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Telegram webhook error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

async function handleCallback(query: any) {
  const chatId = query.message?.chat?.id;
  const data = query.callback_data;
  
  // Answer callback to remove loading state
  await answerCallback(query.id);
  
  switch (data) {
    case 'view_inbox':
      await showInbox(chatId);
      break;
    case 'view_urgent':
      await showUrgent(chatId);
      break;
    case 'view_pipeline':
      await showPipeline(chatId);
      break;
    case 'quick_add':
      await promptQuickAdd(chatId);
      break;
    case 'view_billing':
      await showBilling(chatId);
      break;
    case 'view_signups':
      await showSignups(chatId);
      break;
    default:
      if (data.startsWith('task_')) {
        const taskId = data.replace('task_', '');
        await showTaskDetails(chatId, taskId);
      } else if (data.startsWith('stage_')) {
        const stage = data.replace('stage_', '');
        await showTasksByStage(chatId, stage);
      } else if (data.startsWith('payment_')) {
        const signupId = data.replace('payment_', '');
        await promptPaymentEntry(chatId, signupId);
      }
  }
}

async function handleMessage(msg: any) {
  const chatId = msg.chat?.id;
  const text = msg.text || msg.caption || '';
  
  // Check if it's a command or menu interaction
  if (text === '/start') {
    await sendMenu(chatId, 'Welcome to BNA Operations. What would you like to do?');
    return;
  }
  
  // Handle voice messages (rambles)
  if (msg.voice) {
    await handleVoiceMessage(chatId, msg.voice, msg);
    return;
  }
  
  // Handle photos (cash receipts)
  if (msg.photo) {
    await handlePhotoMessage(chatId, msg.photo, msg);
    return;
  }
  
  // Handle text as ramble/task input
  if (text) {
    // Check if it's a billing/payment command format
    if (text.match(/^paid\s+/i) || text.match(/^payment\s+/i)) {
      await handlePaymentCommand(chatId, text);
      return;
    }
    
    // Otherwise treat as task ramble
    await handleTaskRamble(chatId, text);
  }
}

async function handleVoiceMessage(chatId: string, voice: any, msg: any) {
  // Store voice message for transcription
  // In production, you'd download and transcribe here
  
  await sendMessage(chatId, 
    '🎤 Voice note received. Processing...\n\n' +
    '(Voice transcription would happen here - for now, please type your task or use the menu.)',
    { replyToMessageId: msg.message_id }
  );
  
  // Store in cli_bridge for processing
  await supabase.from('cli_bridge_messages').insert({
    source: 'telegram',
    message_type: 'voice',
    content: '[Voice message - needs transcription]',
    metadata: {
      chat_id: chatId,
      message_id: msg.message_id,
      file_id: voice.file_id
    },
    processed: false
  });
}

async function handlePhotoMessage(chatId: string, photos: any[], msg: any) {
  const caption = msg.caption || '';
  const photo = photos[photos.length - 1]; // Get largest
  
  // Check if it's a cash receipt
  if (caption.toLowerCase().includes('cash') || 
      caption.toLowerCase().includes('payment') ||
      caption.toLowerCase().includes('receipt')) {
    
    // Extract signup info from caption if provided
    const signupMatch = caption.match(/signup[:\s]+(\S+)/i) || 
                       caption.match(/parent[:\s]+(\S+)/i) ||
                       caption.match(/email[:\s]+(\S+@\S+)/i);
    
    if (signupMatch) {
      // Store receipt photo
      await storeCashReceipt(chatId, photo.file_id, caption, signupMatch[1]);
      await sendMessage(chatId, 
        '✅ Cash receipt photo saved!\n' +
        'I\'ll link it to the signup and update the payment status.',
        { replyToMessageId: msg.message_id }
      );
    } else {
      await sendMessage(chatId,
        '📸 Receipt photo received.\n\n' +
        'Please reply with signup details:\n' +
        'Format: "Cash payment for [parent name] - [amount]"',
        { replyToMessageId: msg.message_id }
      );
    }
    return;
  }
  
  // Store in bridge for general processing
  await supabase.from('cli_bridge_messages').insert({
    source: 'telegram',
    message_type: 'photo',
    content: caption || '[Photo received]',
    metadata: {
      chat_id: chatId,
      message_id: msg.message_id,
      photo_file_id: photo.file_id
    },
    processed: false
  });
  
  await sendMessage(chatId, '📸 Photo received and logged.', { replyToMessageId: msg.message_id });
}

async function handleTaskRamble(chatId: string, text: string) {
  // Parse the ramble
  const parsed = parseRamble(text);
  
  if (parsed.length === 0) {
    await sendMenu(chatId, 'I couldn\'t extract a clear task from that. Try being more specific, or use the menu:');
    return;
  }
  
  // Create tasks
  const createdTasks = [];
  for (const taskInput of parsed) {
    const { data, error } = await supabase
      .from('bna_tasks')
      .insert({
        ...taskInput,
        source: 'telegram',
        source_context: text,
        created_by: 'telegram'
      })
      .select()
      .single();
    
    if (!error && data) {
      createdTasks.push(data);
    }
  }
  
  // Send confirmation
  let response = `✅ Created ${createdTasks.length} task(s):\n\n`;
  createdTasks.forEach((t, i) => {
    response += `${i + 1}. ${t.title}\n`;
    response += `   Stage: ${t.stage} | Category: ${t.category} | Urgency: ${t.urgency}\n\n`;
  });
  response += 'View in dashboard or use menu below:';
  
  await sendMenu(chatId, response);
}

async function handlePaymentCommand(chatId: string, text: string) {
  // Parse: "paid Cohen 500 cash" or "payment for cohen@email.com 500"
  const amountMatch = text.match(/(\d+)/);
  const emailMatch = text.match(/(\S+@\S+)/);
  const nameMatch = text.match(/(?:for|from)\s+(\w+)/i);
  const methodMatch = text.match(/(cash|green\s*invoice|card)/i);
  
  const amount = amountMatch ? parseInt(amountMatch[1]) : null;
  const method = methodMatch ? methodMatch[1].toLowerCase().replace(' ', '_') : 'cash';
  
  // Find signup
  let signup = null;
  if (emailMatch) {
    const { data } = await supabase
      .from('bna_signups')
      .select('*')
      .ilike('parent_email', emailMatch[1])
      .single();
    signup = data;
  } else if (nameMatch) {
    const { data } = await supabase
      .from('bna_signups')
      .select('*')
      .ilike('parent_name', `%${nameMatch[1]}%`)
      .single();
    signup = data;
  }
  
  if (!signup) {
    await sendMessage(chatId, 
      '❌ Could not find signup.\n' +
      'Try: "paid [amount] for [parent@email.com]" or "payment [amount] from [parent name]"'
    );
    return;
  }
  
  // Log payment
  await supabase.from('bna_payment_log').insert({
    signup_id: signup.id,
    payment_type: 'registration',
    amount: amount || 0,
    method: method as any,
    status: 'completed',
    received_by: 'telegram',
    received_at: new Date().toISOString(),
    notes: `Logged via Telegram: ${text}`
  });
  
  // Update signup
  await supabase
    .from('bna_signups')
    .update({
      payment_status: 'paid',
      payment_amount: amount,
      updated_at: new Date().toISOString()
    })
    .eq('id', signup.id);
  
  await sendMessage(chatId,
    `✅ Payment logged!\n\n` +
    `Parent: ${signup.parent_name}\n` +
    `Amount: ₪${amount}\n` +
    `Method: ${method}\n` +
    `Status: Paid`
  );
}

async function storeCashReceipt(chatId: string, fileId: string, caption: string, signupRef: string) {
  // Get file URL from Telegram
  const fileRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
  const fileData = await fileRes.json();
  
  if (fileData.ok) {
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.result.file_path}`;
    
    // Store reference
    await supabase.from('cli_bridge_messages').insert({
      source: 'telegram',
      message_type: 'photo',
      content: `Cash receipt: ${caption}`,
      metadata: {
        chat_id: chatId,
        photo_url: fileUrl,
        signup_ref: signupRef
      },
      processed: false
    });
  }
}

// View functions
async function showInbox(chatId: string) {
  const { data: tasks } = await supabase
    .from('bna_tasks')
    .select('*')
    .eq('stage', 'inbox')
    .order('created_at', { ascending: false })
    .limit(10);
  
  let text = '📥 **Inbox**\n\n';
  if (!tasks?.length) {
    text += 'Inbox is empty! Use "Quick Add" to create tasks.';
  } else {
    tasks.forEach((t, i) => {
      text += `${i + 1}. ${t.title}\n`;
      if (t.notes) text += `   _${t.notes.slice(0, 50)}..._\n`;
    });
  }
  
  await sendMenu(chatId, text);
}

async function showUrgent(chatId: string) {
  const { data: tasks } = await supabase
    .from('bna_tasks')
    .select('*')
    .in('urgency', ['urgent', 'today'])
    .not('stage', 'in', ['complete', 'archive'])
    .order('urgency', { ascending: true })
    .limit(10);
  
  let text = '🔴 **Urgent & Today**\n\n';
  if (!tasks?.length) {
    text += 'No urgent tasks! 🎉';
  } else {
    tasks.forEach((t, i) => {
      const emoji = t.urgency === 'urgent' ? '🔴' : '🟡';
      text += `${emoji} ${t.title} (${t.stage})\n`;
    });
  }
  
  await sendMenu(chatId, text);
}

async function showPipeline(chatId: string) {
  const stages = ['inbox', 'clarify', 'plan', 'execute', 'review', 'complete'];
  
  let text = '📊 **Pipeline**\n\n';
  
  for (const stage of stages) {
    const { count } = await supabase
      .from('bna_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('stage', stage)
      .is('archived_at', null);
    
    const emoji = {
      inbox: '📥', clarify: '❓', plan: '📋', 
      execute: '⚡', review: '👀', complete: '✅'
    }[stage] || '📄';
    
    text += `${emoji} ${stage}: ${count || 0}\n`;
  }
  
  const keyboard = {
    inline_keyboard: [
      ...stages.map(s => [{ 
        text: `View ${s}`, 
        callback_data: `stage_${s}` 
      }]),
      [{ text: '« Back to Menu', callback_data: 'menu_main' }]
    ]
  };
  
  await sendMessage(chatId, text, { replyMarkup: keyboard });
}

async function showTasksByStage(chatId: string, stage: string) {
  const { data: tasks } = await supabase
    .from('bna_tasks')
    .select('*')
    .eq('stage', stage)
    .is('archived_at', null)
    .order('created_at', { ascending: false })
    .limit(10);
  
  let text = `${stage.toUpperCase()} (${tasks?.length || 0})\n\n`;
  
  if (!tasks?.length) {
    text += 'No tasks in this stage.';
  } else {
    const keyboard: any[][] = [];
    
    tasks.forEach((t, i) => {
      text += `${i + 1}. ${t.title}\n`;
      keyboard.push([{
        text: `View: ${t.title.slice(0, 30)}...`,
        callback_data: `task_${t.id}`
      }]);
    });
    
    keyboard.push([{ text: '« Back', callback_data: 'view_pipeline' }]);
    
    await sendMessage(chatId, text, { replyMarkup: { inline_keyboard: keyboard } });
    return;
  }
  
  await sendMenu(chatId, text);
}

async function showBilling(chatId: string) {
  const { data: signups } = await supabase
    .from('bna_signups')
    .select('*')
    .in('payment_status', ['pending', 'partial'])
    .order('created_at', { ascending: false })
    .limit(10);
  
  let text = '💰 **Billing - Pending Payments**\n\n';
  
  if (!signups?.length) {
    text += 'All caught up! No pending payments.';
  } else {
    const keyboard: any[][] = [];
    
    signups.forEach((s, i) => {
      text += `${i + 1}. ${s.parent_name} - ₪${s.payment_amount || 0}\n`;
      text += `   Status: ${s.payment_status} | Method: ${s.payment_method || 'N/A'}\n\n`;
      
      keyboard.push([{
        text: `💰 Log Payment: ${s.parent_name}`,
        callback_data: `payment_${s.id}`
      }]);
    });
    
    keyboard.push([{ text: '« Back to Menu', callback_data: 'menu_main' }]);
    
    await sendMessage(chatId, text, { replyMarkup: { inline_keyboard: keyboard } });
    return;
  }
  
  await sendMenu(chatId, text);
}

async function showSignups(chatId: string) {
  const { data: signups } = await supabase
    .from('bna_signups')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
  
  let text = '👨‍👩‍👧‍👦 **Recent Signups**\n\n';
  
  if (!signups?.length) {
    text += 'No signups yet.';
  } else {
    signups.forEach((s, i) => {
      text += `${i + 1}. **${s.parent_name}**\n`;
      text += `   Student: ${s.student_name}\n`;
      text += `   Status: ${s.status} | Payment: ${s.payment_status}\n\n`;
    });
  }
  
  await sendMenu(chatId, text);
}

async function showTaskDetails(chatId: string, taskId: string) {
  const { data: task } = await supabase
    .from('bna_tasks')
    .select('*')
    .eq('id', taskId)
    .single();
  
  if (!task) {
    await sendMessage(chatId, 'Task not found.');
    return;
  }
  
  let text = `**${task.title}**\n\n`;
  text += `Stage: ${task.stage}\n`;
  text += `Category: ${task.category}\n`;
  text += `Urgency: ${task.urgency}\n`;
  if (task.notes) text += `\nNotes: ${task.notes}\n`;
  
  const keyboard = {
    inline_keyboard: [
      [
        { text: '◀️ Prev Stage', callback_data: `move_prev_${taskId}` },
        { text: 'Next Stage ▶️', callback_data: `move_next_${taskId}` }
      ],
      [{ text: '« Back to Pipeline', callback_data: 'view_pipeline' }]
    ]
  };
  
  await sendMessage(chatId, text, { replyMarkup: keyboard });
}

async function promptQuickAdd(chatId: string) {
  await sendMessage(chatId,
    '➕ **Quick Add Task**\n\n' +
    'Just type your task naturally. Examples:\n' +
    '• "Call Cohen about payment tomorrow"\n' +
    '• "URGENT: Fix website contact form"\n' +
    '• "Plan parent onboarding for new family"\n\n' +
    'Or send a voice note to ramble!'
  );
}

async function promptPaymentEntry(chatId: string, signupId: string) {
  const { data: signup } = await supabase
    .from('bna_signups')
    .select('*')
    .eq('id', signupId)
    .single();
  
  if (!signup) {
    await sendMessage(chatId, 'Signup not found.');
    return;
  }
  
  await sendMessage(chatId,
    `💰 **Log Payment for ${signup.parent_name}**\n\n` +
    `Reply with:\n` +
    `paid [amount] [method]\n\n` +
    `Example: "paid 500 cash" or "paid 1000 green_invoice"`
  );
}

// Helper functions
async function sendMenu(chatId: string, text: string) {
  await sendMessage(chatId, text, { replyMarkup: MAIN_KEYBOARD });
}

async function sendMessage(
  chatId: string, 
  text: string, 
  options?: { 
    replyMarkup?: any; 
    replyToMessageId?: number;
    parseMode?: 'HTML' | 'Markdown';
  }
) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  
  const body: any = {
    chat_id: chatId,
    text: text.slice(0, 4096),
    parse_mode: options?.parseMode || 'Markdown'
  };
  
  if (options?.replyMarkup) {
    body.reply_markup = options.replyMarkup;
  }
  
  if (options?.replyToMessageId) {
    body.reply_to_message_id = options.replyToMessageId;
  }
  
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

async function answerCallback(callbackQueryId: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId })
  });
}

// Setup webhook
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  
  if (action === 'setup') {
    const webhookUrl = `${process.env.APP_URL}/api/bna/telegram`;
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query']
      })
    });
    
    const result = await res.json();
    return NextResponse.json(result);
  }
  
  if (action === 'info') {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    const result = await res.json();
    return NextResponse.json(result);
  }
  
  return NextResponse.json({ message: 'Telegram webhook endpoint' });
}
