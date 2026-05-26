const express = require('express');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Environment variables - NO FALLBACKS for production
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OPS_USERNAME = process.env.OPS_USERNAME;
const OPS_PASSWORD = process.env.OPS_PASSWORD;
const TELEGRAM_CHAT_ID_SHLOIMIE = process.env.TELEGRAM_CHAT_ID_SHLOIMIE;
const DATABASE_URL = process.env.DATABASE_URL;
const PAYMENT_LINK = process.env.PAYMENT_LINK || 'https://mrng.to/r9DSZhhWE9';

if (!DATABASE_URL) {
  console.error('FATAL: DATABASE_URL not set');
  process.exit(1);
}

if (!OPS_USERNAME || !OPS_PASSWORD) {
  console.error('FATAL: OPS_USERNAME and OPS_PASSWORD must be set');
  process.exit(1);
}

function parseEnvBlock(rawValue) {
  if (!rawValue) return {};
  return rawValue
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce((acc, line) => {
      const separatorIndex = line.indexOf('=');
      if (separatorIndex <= 0) return acc;
      acc[line.slice(0, separatorIndex)] = line.slice(separatorIndex + 1).trim();
      return acc;
    }, {});
}

function loadEnvBlockFile(filePath) {
  try {
    return parseEnvBlock(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return {};
  }
}

const localGhlSecrets = loadEnvBlockFile(path.join(__dirname, '.secrets', 'ghl-pit-token.txt'));
const inlineGhlSecrets = parseEnvBlock(process.env.GHL_PIT_TOKEN || '');

function pickRawValue(envValue, inlineValue, fileValue) {
  if (envValue && !envValue.includes('\n') && !envValue.startsWith('GHL_PIT_TOKEN=')) {
    return envValue.trim();
  }
  return inlineValue || fileValue || '';
}

// GHL Configuration
const GHL_PIT_TOKEN = pickRawValue(
  process.env.GHL_PIT_TOKEN,
  inlineGhlSecrets.GHL_PIT_TOKEN,
  localGhlSecrets.GHL_PIT_TOKEN
);
const GHL_LOCATION_ID =
  process.env.GHL_LOCATION_ID ||
  inlineGhlSecrets.GHL_LOCATION_ID ||
  localGhlSecrets.GHL_LOCATION_ID ||
  'IIofSrquLHvNxc8zrpka';
const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';

// Admin auth middleware - case insensitive
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  
  // If no auth header, redirect to login page
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    // Check if request wants HTML (browser) or JSON (API)
    const acceptHeader = req.headers.accept || '';
    if (acceptHeader.includes('text/html')) {
      return res.redirect('/operations-login.html');
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const creds = Buffer.from(authHeader.slice(6), 'base64').toString();
  const [user, pass] = creds.split(':');
  
  // Case insensitive comparison
  if (user.toLowerCase() !== OPS_USERNAME.toLowerCase() || 
      pass.toLowerCase() !== OPS_PASSWORD.toLowerCase()) {
    const acceptHeader = req.headers.accept || '';
    if (acceptHeader.includes('text/html')) {
      return res.redirect('/operations-login.html');
    }
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  next();
}

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Database connection
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Create tables if not exists - BNA Schema
const createSignupsTableSQL = `
CREATE TABLE IF NOT EXISTS signups (
  id SERIAL PRIMARY KEY,
  parent_name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  parent_phone TEXT,
  student_name TEXT NOT NULL,
  student_age INTEGER,
  student_grade TEXT,
  previous_school TEXT,
  reason_applying TEXT,
  special_needs TEXT,
  payment_method TEXT DEFAULT 'green_invoice',
  payment_status TEXT DEFAULT 'pending',
  payment_amount DECIMAL(10,2),
  payment_currency TEXT DEFAULT 'ILS',
  green_invoice_id TEXT,
  cash_receipt_photo_url TEXT,
  cash_received_at TIMESTAMP,
  cash_notes TEXT,
  ghl_parent_contact_id TEXT,
  ghl_student_contact_id TEXT,
  ghl_synced_at TIMESTAMP,
  ghl_sync_error TEXT,
  status TEXT DEFAULT 'new',
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createTasksTableSQL = `
CREATE TABLE IF NOT EXISTS bna_tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  notes TEXT,
  stage TEXT NOT NULL DEFAULT 'inbox' CHECK (stage IN ('inbox', 'clarify', 'plan', 'execute', 'review', 'complete', 'archive')),
  category TEXT NOT NULL DEFAULT 'operations' CHECK (category IN ('admin', 'marketing', 'parent_coaching', 'student_operations', 'finance', 'legal', 'communications', 'operations')),
  urgency TEXT NOT NULL DEFAULT 'this_week' CHECK (urgency IN ('urgent', 'today', 'this_week', 'low')),
  energy_required TEXT CHECK (energy_required IN ('high', 'medium', 'low')),
  estimated_minutes INTEGER,
  due_date DATE,
  planned_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  archived_at TIMESTAMP,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'ramble', 'telegram', 'ghl_webhook', 'green_invoice')),
  source_context TEXT,
  ai_parsed JSONB,
  parent_task_id INTEGER REFERENCES bna_tasks(id) ON DELETE SET NULL,
  related_contact_email TEXT,
  related_signup_id INTEGER,
  created_by TEXT NOT NULL DEFAULT 'system',
  assigned_to TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createPaymentLogSQL = `
CREATE TABLE IF NOT EXISTS bna_payment_log (
  id SERIAL PRIMARY KEY,
  signup_id INTEGER NOT NULL REFERENCES signups(id) ON DELETE CASCADE,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('registration', 'tuition', 'materials', 'other')),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'ILS',
  method TEXT NOT NULL CHECK (method IN ('green_invoice', 'cash', 'bank_transfer', 'check')),
  green_invoice_id TEXT,
  green_invoice_url TEXT,
  receipt_photo_url TEXT,
  received_by TEXT,
  received_at TIMESTAMP,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

// Initialize database
async function initDb() {
  try {
    await pool.query(createSignupsTableSQL);
    await pool.query(createTasksTableSQL);
    await pool.query(createPaymentLogSQL);
    console.log('Database initialized - BNA tables created');
  } catch (err) {
    console.error('Database init error:', err);
  }
}

initDb();

// GHL Helper Functions
async function ghlRequest(endpoint, options = {}) {
  const url = `${GHL_API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${GHL_PIT_TOKEN}`,
      'Content-Type': 'application/json',
      'Version': GHL_API_VERSION,
      ...options.headers
    }
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GHL API error: ${response.status} - ${error}`);
  }
  
  return response.json();
}

async function findOrCreateGHLContact(email, firstName, lastName, phone, customFields = {}) {
  // Search for existing contact
  const searchRes = await ghlRequest(`/contacts?locationId=${GHL_LOCATION_ID}&query=${encodeURIComponent(email)}`);
  
  let contactId;
  if (searchRes.contacts && searchRes.contacts.length > 0) {
    contactId = searchRes.contacts[0].id;
    // Update existing
    await ghlRequest(`/contacts/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        phone,
        ...customFields
      })
    });
  } else {
    // Create new
    const createRes = await ghlRequest('/contacts', {
      method: 'POST',
      body: JSON.stringify({
        locationId: GHL_LOCATION_ID,
        firstName,
        lastName,
        email,
        phone,
        ...customFields
      })
    });
    contactId = createRes.contact.id;
  }
  
  return contactId;
}

async function addTagToContact(contactId, tag) {
  await ghlRequest(`/contacts/${contactId}/tags`, {
    method: 'POST',
    body: JSON.stringify({ tags: [tag] })
  });
}

// Telegram notification
async function sendTelegramNotification(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID_SHLOIMIE) return;
  
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID_SHLOIMIE,
        text: message,
        parse_mode: 'HTML'
      })
    });
  } catch (err) {
    console.error('Telegram notification error:', err);
  }
}

// Routes

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'ok', 
      database: 'connected',
      ghl: GHL_PIT_TOKEN ? 'configured' : 'not configured'
    });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// Submit signup
app.post('/api/submit', async (req, res) => {
  const { 
    parent_name, parent_email, parent_phone,
    student_name, student_age, student_grade,
    previous_school, reason_applying, special_needs,
    payment_method 
  } = req.body;

  try {
    // Insert signup
    const result = await pool.query(
      `INSERT INTO signups (
        parent_name, parent_email, parent_phone,
        student_name, student_age, student_grade,
        previous_school, reason_applying, special_needs,
        payment_method, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        parent_name, parent_email, parent_phone,
        student_name, student_age, student_grade,
        previous_school, reason_applying, special_needs,
        payment_method || 'green_invoice',
        ['parent', 'student']
      ]
    );
    
    const signup = result.rows[0];
    
    // Notify via Telegram
    await sendTelegramNotification(
      `🎉 <b>New Signup!</b>\n\n` +
      `Parent: ${parent_name}\n` +
      `Student: ${student_name}\n` +
      `Payment: ${payment_method || 'green_invoice'}`
    );
    
    // Sync to GHL if configured
    if (GHL_PIT_TOKEN) {
      try {
        const [parentFirst, ...parentLast] = parent_name.split(' ');
        const parentId = await findOrCreateGHLContact(
          parent_email,
          parentFirst,
          parentLast.join(' ') || '',
          parent_phone,
          { tags: ['BNA Parent'] }
        );
        await addTagToContact(parentId, 'BNA Parent');
        
        const [studentFirst, ...studentLast] = student_name.split(' ');
        const studentId = await findOrCreateGHLContact(
          `${studentFirst.toLowerCase()}@bna.student`,
          studentFirst,
          studentLast.join(' ') || '',
          '',
          { tags: ['BNA Student'] }
        );
        await addTagToContact(studentId, 'BNA Student');
        
        await pool.query(
          'UPDATE signups SET ghl_parent_contact_id = $1, ghl_student_contact_id = $2, ghl_synced_at = NOW() WHERE id = $3',
          [parentId, studentId, signup.id]
        );
      } catch (ghlErr) {
        console.error('GHL sync error:', ghlErr);
        await pool.query(
          'UPDATE signups SET ghl_sync_error = $1 WHERE id = $2',
          [ghlErr.message, signup.id]
        );
      }
    }
    
    // Return payment link if Green Invoice
    if (payment_method === 'green_invoice') {
      res.json({ 
        success: true, 
        signupId: signup.id,
        paymentLink: PAYMENT_LINK 
      });
    } else {
      res.json({ success: true, signupId: signup.id });
    }
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to save signup' });
  }
});

// Admin: Get signups
app.get('/api/signups', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM signups ORDER BY created_at DESC'
    );
    res.json({ signups: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get pending payments
app.get('/api/pending-payments', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM signups WHERE payment_status != 'paid' ORDER BY created_at DESC"
    );
    res.json({ signups: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Log payment
app.post('/api/payment-complete', requireAdmin, async (req, res) => {
  const { signup_id, amount, method, notes } = req.body;
  
  try {
    // Create payment log
    await pool.query(
      `INSERT INTO bna_payment_log (signup_id, payment_type, amount, method, status, received_by, received_at, notes)
       VALUES ($1, 'registration', $2, $3, 'completed', 'admin', NOW(), $4)`,
      [signup_id, amount, method, notes]
    );
    
    // Update signup
    await pool.query(
      "UPDATE signups SET payment_status = 'paid', payment_amount = $1, updated_at = NOW() WHERE id = $2",
      [amount, signup_id]
    );
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Green Invoice webhook
app.post('/api/webhooks/green-invoice', async (req, res) => {
  // Verify signature if configured
  const signature = req.headers['x-green-invoice-signature'];
  if (process.env.GREEN_INVOICE_SECRET && signature) {
    // TODO: Implement signature verification
  }
  
  const { email, payment_id, amount, status } = req.body;
  
  try {
    // Find signup by email
    const signupResult = await pool.query(
      'SELECT * FROM signups WHERE parent_email = $1',
      [email]
    );
    
    if (signupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Signup not found' });
    }
    
    const signup = signupResult.rows[0];
    
    if (status === 'completed') {
      // Create payment log
      await pool.query(
        `INSERT INTO bna_payment_log (signup_id, payment_type, amount, method, green_invoice_id, status, received_at)
         VALUES ($1, 'registration', $2, 'green_invoice', $3, 'completed', NOW())`,
        [signup.id, amount, payment_id]
      );
      
      // Update signup
      await pool.query(
        "UPDATE signups SET payment_status = 'paid', green_invoice_id = $1, updated_at = NOW() WHERE id = $2",
        [payment_id, signup.id]
      );
      
      await sendTelegramNotification(
        `💰 <b>Payment Received!</b>\n\n` +
        `Parent: ${signup.parent_name}\n` +
        `Amount: ₪${amount}\n` +
        `Method: Green Invoice`
      );
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Task API
app.get('/api/bna/tasks', requireAdmin, async (req, res) => {
  const { stage, category, urgency } = req.query;
  
  let query = 'SELECT * FROM bna_tasks WHERE 1=1';
  const params = [];
  let paramIdx = 1;
  
  if (stage) {
    query += ` AND stage = $${paramIdx++}`;
    params.push(stage);
  }
  if (category) {
    query += ` AND category = $${paramIdx++}`;
    params.push(category);
  }
  if (urgency) {
    query += ` AND urgency = $${paramIdx++}`;
    params.push(urgency);
  }
  
  query += ' ORDER BY created_at DESC';
  
  try {
    const result = await pool.query(query, params);
    res.json({ tasks: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bna/tasks', requireAdmin, async (req, res) => {
  const { title, notes, stage, category, urgency, energy_required, estimated_minutes, due_date } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO bna_tasks (title, notes, stage, category, urgency, energy_required, estimated_minutes, due_date, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'manual') RETURNING *`,
      [title, notes, stage, category, urgency, energy_required, estimated_minutes, due_date]
    );
    res.json({ success: true, task: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/bna/tasks/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const fields = [];
  const values = [];
  let idx = 1;
  
  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = $${idx++}`);
    values.push(value);
  }
  fields.push('updated_at = NOW()');
  values.push(id);
  
  try {
    const result = await pool.query(
      `UPDATE bna_tasks SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    res.json({ success: true, task: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Database migration endpoint
app.post('/api/bna/migrate-db', requireAdmin, async (req, res) => {
  const MIGRATION_SQL = `
    DROP TABLE IF EXISTS bna_payment_log CASCADE;
    DROP TABLE IF EXISTS bna_tasks CASCADE;
    DROP TABLE IF EXISTS signups CASCADE;
    
    CREATE TABLE signups (
      id SERIAL PRIMARY KEY,
      parent_name TEXT NOT NULL,
      parent_email TEXT NOT NULL,
      parent_phone TEXT,
      student_name TEXT NOT NULL,
      student_age INTEGER,
      student_grade TEXT,
      previous_school TEXT,
      reason_applying TEXT,
      special_needs TEXT,
      payment_method TEXT DEFAULT 'green_invoice',
      payment_status TEXT DEFAULT 'pending',
      payment_amount DECIMAL(10,2),
      payment_currency TEXT DEFAULT 'ILS',
      green_invoice_id TEXT,
      cash_receipt_photo_url TEXT,
      cash_received_at TIMESTAMP,
      cash_notes TEXT,
      ghl_parent_contact_id TEXT,
      ghl_student_contact_id TEXT,
      ghl_synced_at TIMESTAMP,
      ghl_sync_error TEXT,
      status TEXT DEFAULT 'new',
      tags TEXT[] DEFAULT '{}',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE bna_tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      notes TEXT,
      stage TEXT DEFAULT 'inbox' CHECK (stage IN ('inbox', 'clarify', 'plan', 'execute', 'review', 'complete', 'archive')),
      category TEXT DEFAULT 'operations' CHECK (category IN ('admin', 'marketing', 'parent_coaching', 'student_operations', 'finance', 'legal', 'communications', 'operations')),
      urgency TEXT DEFAULT 'this_week' CHECK (urgency IN ('urgent', 'today', 'this_week', 'low')),
      energy_required TEXT CHECK (energy_required IN ('high', 'medium', 'low')),
      estimated_minutes INTEGER,
      due_date DATE,
      planned_at TIMESTAMP,
      started_at TIMESTAMP,
      completed_at TIMESTAMP,
      archived_at TIMESTAMP,
      source TEXT DEFAULT 'manual',
      source_context TEXT,
      ai_parsed JSONB,
      parent_task_id INTEGER REFERENCES bna_tasks(id),
      related_contact_email TEXT,
      related_signup_id INTEGER,
      created_by TEXT DEFAULT 'system',
      assigned_to TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE bna_payment_log (
      id SERIAL PRIMARY KEY,
      signup_id INTEGER REFERENCES signups(id) ON DELETE CASCADE,
      payment_type TEXT DEFAULT 'registration',
      amount DECIMAL(10,2) NOT NULL,
      currency TEXT DEFAULT 'ILS',
      method TEXT,
      green_invoice_id TEXT,
      green_invoice_url TEXT,
      receipt_photo_url TEXT,
      received_by TEXT,
      received_at TIMESTAMP,
      notes TEXT,
      status TEXT DEFAULT 'completed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    INSERT INTO bna_tasks (title, stage, category, urgency, source) 
    VALUES ('Welcome to BNA Holy Flow! Drag me to different stages.', 'inbox', 'operations', 'this_week', 'manual');
  `;
  
  try {
    await pool.query(MIGRATION_SQL);
    res.json({ success: true, message: 'Database migrated to BNA schema!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Operations dashboard - with login redirect
app.get('/operations', (req, res) => {
  const authHeader = req.headers.authorization;
  
  // Check auth
  let isAuthenticated = false;
  if (authHeader && authHeader.startsWith('Basic ')) {
    const creds = Buffer.from(authHeader.slice(6), 'base64').toString();
    const [user, pass] = creds.split(':');
    if (user.toLowerCase() === OPS_USERNAME.toLowerCase() && 
        pass.toLowerCase() === OPS_PASSWORD.toLowerCase()) {
      isAuthenticated = true;
    }
  }
  
  if (!isAuthenticated) {
    return res.redirect('/operations-login.html');
  }
  
  res.sendFile(path.join(__dirname, 'public', 'operations.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`BNA Server running on port ${PORT}`);
});
// Deploy timestamp: 2026-05-26T17:02:05Z
