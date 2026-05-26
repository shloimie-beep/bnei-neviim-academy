const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID_SHLOIMIE = process.env.TELEGRAM_CHAT_ID_SHLOIMIE;
const TELEGRAM_CHAT_ID_AHUVA = process.env.TELEGRAM_CHAT_ID_AHUVA;
const PAYMENT_LINK = process.env.PAYMENT_LINK || 'https://mrng.to/r9DSZhhWE9';

// GHL Configuration
const GHL_PIT_TOKEN = process.env.GHL_PIT_TOKEN;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID || 'IIofSrquLHvNxc8zrpka';
const GHL_API_BASE = 'https://rest.gohighlevel.com/v1';

// Auth credentials (hashed password for SHLOIMIE / BNA613!)
const AUTH_USERNAME = process.env.OPS_USERNAME || 'SHLOIMIE';
const AUTH_PASSWORD_HASH = process.env.OPS_PASSWORD_HASH || '$2a$10$YourHashHere';
const AUTH_PASSWORD = process.env.OPS_PASSWORD || 'BNA613!';

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:hwbFDMCjLzifamfGHgSKvhJUoCuXOHBb@yamanote.proxy.rlwy.net:30613/railway',
  ssl: { rejectUnauthorized: false }
});

// Create tables if not exists
const createSignupsTableSQL = `
CREATE TABLE IF NOT EXISTS signups (
  id SERIAL PRIMARY KEY,
  parent1_name TEXT NOT NULL,
  parent1_email TEXT NOT NULL,
  parent1_phone TEXT NOT NULL,
  parent2_name TEXT,
  parent2_email TEXT,
  parent2_phone TEXT,
  address TEXT NOT NULL,
  child_name TEXT NOT NULL,
  child_age INTEGER NOT NULL,
  current_school TEXT,
  hobbies TEXT NOT NULL,
  payment_method TEXT DEFAULT 'Green Invoice',
  payment_status TEXT DEFAULT 'pending',
  ghl_parent_contact_id TEXT,
  ghl_student_contact_id TEXT,
  green_invoice_id TEXT,
  payment_reminder_sent BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP
);
`;

const createTasksTableSQL = `
CREATE TABLE IF NOT EXISTS operations_tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  notes TEXT DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('Accounting', 'Marketing', 'Communications')),
  urgency TEXT NOT NULL CHECK (urgency IN ('Urgent', 'Today', 'This week', 'Low priority')),
  status TEXT NOT NULL CHECK (status IN ('Pending', 'In progress', 'Waiting on someone', 'Done')),
  due_date DATE,
  owner TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

// Initialize database
async function initDb() {
  try {
    await pool.query(createSignupsTableSQL);
    await pool.query(createTasksTableSQL);
    console.log('Database initialized - tables created if not exists');
  } catch (err) {
    console.error('Database init error:', err);
  }
}

// ==================== GHL API HELPERS ====================

async function ghlRequest(endpoint, options = {}) {
  const url = `${GHL_API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${GHL_PIT_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GHL API error ${response.status}: ${errorText}`);
  }
  
  if (response.status === 204) return null;
  return response.json();
}

async function searchGhlContact(email, phone) {
  if (!GHL_PIT_TOKEN) return null;
  
  if (email) {
    try {
      const result = await ghlRequest(`/contacts/lookup?email=${encodeURIComponent(email)}`);
      if (result?.contacts?.length > 0) return result.contacts[0];
    } catch (err) {
      console.log('GHL email lookup failed:', err.message);
    }
  }
  
  if (phone) {
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const result = await ghlRequest(`/contacts/lookup?phone=${encodeURIComponent(cleanPhone)}`);
      if (result?.contacts?.length > 0) return result.contacts[0];
    } catch (err) {
      console.log('GHL phone lookup failed:', err.message);
    }
  }
  
  return null;
}

async function createGhlContact(contactData) {
  if (!GHL_PIT_TOKEN) return null;
  
  const result = await ghlRequest('/contacts/', {
    method: 'POST',
    body: JSON.stringify({
      ...contactData,
      locationId: GHL_LOCATION_ID,
    }),
  });
  return result?.contact;
}

async function updateGhlContact(contactId, contactData) {
  if (!GHL_PIT_TOKEN) return null;
  
  const result = await ghlRequest(`/contacts/${contactId}`, {
    method: 'PUT',
    body: JSON.stringify(contactData),
  });
  return result?.contact;
}

async function addGhlTags(contactId, tags) {
  if (!GHL_PIT_TOKEN) return;
  
  await ghlRequest(`/contacts/${contactId}/tags`, {
    method: 'POST',
    body: JSON.stringify({ tags }),
  });
}

function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

async function createGhlParentContact(data, signupId) {
  if (!GHL_PIT_TOKEN) return null;
  
  const { firstName, lastName } = splitName(data.parent1_name);
  
  const contactData = {
    firstName,
    lastName,
    email: data.parent1_email,
    phone: data.parent1_phone,
    address1: data.address,
    tags: ['BNA Parent'],
  };
  
  // Search for existing
  const existing = await searchGhlContact(data.parent1_email, data.parent1_phone);
  
  let contact;
  if (existing?.id) {
    contact = await updateGhlContact(existing.id, contactData);
    contact = contact || existing;
  } else {
    contact = await createGhlContact(contactData);
  }
  
  if (!contact?.id) return null;
  
  // Add tags
  await addGhlTags(contact.id, ['BNA Parent']);
  
  // Build custom fields
  const customFields = [
    { key: 'contact_type', value: 'Parent' },
    { key: 'bna_payment_method', value: data.payment_method || 'Green Invoice' },
    { key: 'bna_payment_status', value: data.payment_method === 'Cash' ? 'Pending Cash Payment' : 'Pending Payment' },
    { key: 'bna_signup_status', value: 'Payment Pending' },
    { key: 'bna_tuition_amount', value: 1000 },
    { key: 'bna_child_name', value: data.child_name },
    { key: 'bna_child_age', value: data.child_age },
    { key: 'bna_child_school', value: data.current_school || '' },
    { key: 'bna_child_hobbies', value: data.hobbies },
    { key: 'bna_registration_date', value: new Date().toISOString().split('T')[0] },
    { key: 'bna_registration_id', value: String(signupId) },
    { key: 'bna_source', value: 'BNA Registration Form' },
  ];
  
  // Get custom field IDs and update
  try {
    const fieldsResult = await ghlRequest('/custom-fields');
    const fieldMap = {};
    for (const field of fieldsResult.customFields || []) {
      fieldMap[field.fieldKey] = field.id;
      fieldMap[field.name.toLowerCase()] = field.id;
    }
    
    const fieldsToUpdate = [];
    for (const { key, value } of customFields) {
      const fieldId = fieldMap[key];
      if (fieldId) {
        fieldsToUpdate.push({ id: fieldId, value });
      }
    }
    
    if (fieldsToUpdate.length > 0) {
      await ghlRequest(`/contacts/${contact.id}`, {
        method: 'PUT',
        body: JSON.stringify({ customFields: fieldsToUpdate }),
      });
    }
  } catch (err) {
    console.error('Failed to update custom fields:', err.message);
  }
  
  return contact;
}

async function createGhlStudentContact(data, signupId) {
  if (!GHL_PIT_TOKEN) return null;
  
  const { firstName, lastName } = splitName(data.child_name);
  
  const contactData = {
    firstName,
    lastName,
    email: data.parent1_email, // Use parent's email
    phone: data.parent1_phone, // Use parent's phone
    tags: ['BNA Student'],
  };
  
  // Search for existing by email+name combination
  const existing = await searchGhlContact(data.parent1_email, data.parent1_phone);
  
  let contact;
  if (existing?.id && existing.firstName === firstName) {
    contact = await updateGhlContact(existing.id, contactData);
    contact = contact || existing;
  } else {
    contact = await createGhlContact(contactData);
  }
  
  if (!contact?.id) return null;
  
  // Add tags
  await addGhlTags(contact.id, ['BNA Student']);
  
  // Build custom fields
  const customFields = [
    { key: 'contact_type', value: 'Student' },
    { key: 'bna_child_name', value: data.child_name },
    { key: 'bna_child_age', value: data.child_age },
    { key: 'bna_child_school', value: data.current_school || '' },
    { key: 'bna_child_hobbies', value: data.hobbies },
    { key: 'bna_parent_name', value: data.parent1_name },
    { key: 'bna_parent_phone', value: data.parent1_phone },
    { key: 'bna_parent_email', value: data.parent1_email },
    { key: 'bna_registration_date', value: new Date().toISOString().split('T')[0] },
    { key: 'bna_registration_id', value: String(signupId) },
    { key: 'bna_source', value: 'BNA Registration Form' },
  ];
  
  // Get custom field IDs and update
  try {
    const fieldsResult = await ghlRequest('/custom-fields');
    const fieldMap = {};
    for (const field of fieldsResult.customFields || []) {
      fieldMap[field.fieldKey] = field.id;
      fieldMap[field.name.toLowerCase()] = field.id;
    }
    
    const fieldsToUpdate = [];
    for (const { key, value } of customFields) {
      const fieldId = fieldMap[key];
      if (fieldId) {
        fieldsToUpdate.push({ id: fieldId, value });
      }
    }
    
    if (fieldsToUpdate.length > 0) {
      await ghlRequest(`/contacts/${contact.id}`, {
        method: 'PUT',
        body: JSON.stringify({ customFields: fieldsToUpdate }),
      });
    }
  } catch (err) {
    console.error('Failed to update student custom fields:', err.message);
  }
  
  return contact;
}

// ==================== TELEGRAM HELPERS ====================

async function sendTelegramNotification(message, chatIds = []) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.log('Telegram not configured, skipping notification');
    return;
  }
  
  const targets = chatIds.filter(id => id);
  if (targets.length === 0) {
    console.log('No chat IDs configured, skipping notification');
    return;
  }
  
  for (const chatId of targets) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown'
        })
      });
      
      if (!response.ok) {
        console.error(`Failed to send Telegram message to ${chatId}:`, await response.text());
      }
    } catch (err) {
      console.error(`Telegram notification error for ${chatId}:`, err.message);
    }
  }
}

// ==================== API ENDPOINTS ====================

// API endpoint for form submission
app.post('/api/submit', async (req, res) => {
  try {
    const {
      parent1_name,
      parent1_email,
      parent1_phone,
      parent2_name,
      parent2_email,
      parent2_phone,
      address,
      child_name,
      child_age,
      current_school,
      hobbies,
      payment_method
    } = req.body;
    
    const paymentMethod = payment_method || 'Green Invoice';
    const paymentStatus = paymentMethod === 'Cash' ? 'pending_cash' : 'pending';
    
    const query = `
      INSERT INTO signups (
        parent1_name, parent1_email, parent1_phone,
        parent2_name, parent2_email, parent2_phone,
        address, child_name, child_age, current_school, hobbies,
        payment_method, payment_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id
    `;
    
    const values = [
      parent1_name, parent1_email, parent1_phone,
      parent2_name, parent2_email, parent2_phone,
      address, child_name, child_age, current_school, hobbies,
      paymentMethod, paymentStatus
    ];
    
    const result = await pool.query(query, values);
    const signupId = result.rows[0].id;
    
    // Create GHL contacts
    let ghlParentId = null;
    let ghlStudentId = null;
    
    try {
      if (GHL_PIT_TOKEN) {
        const parentContact = await createGhlParentContact(req.body, signupId);
        ghlParentId = parentContact?.id || null;
        
        const studentContact = await createGhlStudentContact(req.body, signupId);
        ghlStudentId = studentContact?.id || null;
        
        // Update signup with GHL IDs
        await pool.query(
          'UPDATE signups SET ghl_parent_contact_id = $1, ghl_student_contact_id = $2 WHERE id = $3',
          [ghlParentId, ghlStudentId, signupId]
        );
      }
    } catch (ghlErr) {
      console.error('GHL contact creation failed:', ghlErr.message);
      // Continue - don't fail the registration if GHL fails
    }
    
    // Send Telegram notification
    const paymentText = paymentMethod === 'Cash' ? '💵 Cash (Pending)' : '💳 Green Invoice';
    const notificationMessage = `📝 *New BNA Registration*

*Child:* ${child_name} (${child_age} years)
*Parent:* ${parent1_name}
*Email:* ${parent1_email}
*Phone:* ${parent1_phone}
*Payment:* ${paymentText}
*GHL Parent:* ${ghlParentId ? '✅ Created' : '❌ Failed'}
*GHL Student:* ${ghlStudentId ? '✅ Created' : '❌ Failed'}

View all signups: ${process.env.APP_URL || ''}/admin/signups`;

    await sendTelegramNotification(notificationMessage, [
      TELEGRAM_CHAT_ID_SHLOIMIE,
      TELEGRAM_CHAT_ID_AHUVA
    ]);
    
    res.json({ 
      success: true, 
      message: 'Registration submitted successfully',
      id: signupId,
      paymentMethod: paymentMethod,
      redirectToPayment: paymentMethod === 'Green Invoice',
      paymentLink: paymentMethod === 'Green Invoice' ? (PAYMENT_LINK || null) : null
    });
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to submit registration' 
    });
  }
});

// Mark payment as complete (manual or webhook)
app.post('/api/payment-complete', async (req, res) => {
  try {
    const { signup_id, ghl_contact_id, green_invoice_id, amount } = req.body;
    
    const query = `
      UPDATE signups 
      SET payment_status = 'paid', paid_at = CURRENT_TIMESTAMP 
      WHERE id = $1 
      RETURNING *
    `;
    
    const result = await pool.query(query, [signup_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Signup not found' });
    }
    
    const signup = result.rows[0];
    
    // Update GHL contact if available
    if (GHL_PIT_TOKEN && (ghl_contact_id || signup.ghl_parent_contact_id)) {
      try {
        const contactId = ghl_contact_id || signup.ghl_parent_contact_id;
        const paidDate = new Date().toISOString().split('T')[0];
        const nextBillingDate = new Date();
        nextBillingDate.setDate(nextBillingDate.getDate() + 30);
        
        // Get custom field IDs
        const fieldsResult = await ghlRequest('/custom-fields');
        const fieldMap = {};
        for (const field of fieldsResult.customFields || []) {
          fieldMap[field.fieldKey] = field.id;
        }
        
        const fieldsToUpdate = [];
        if (fieldMap['bna_payment_status']) {
          fieldsToUpdate.push({ id: fieldMap['bna_payment_status'], value: 'Paid' });
        }
        if (fieldMap['bna_signup_status']) {
          fieldsToUpdate.push({ id: fieldMap['bna_signup_status'], value: 'Active' });
        }
        if (fieldMap['bna_paid_date']) {
          fieldsToUpdate.push({ id: fieldMap['bna_paid_date'], value: paidDate });
        }
        if (fieldMap['bna_next_billing_date']) {
          fieldsToUpdate.push({ id: fieldMap['bna_next_billing_date'], value: nextBillingDate.toISOString().split('T')[0] });
        }
        if (fieldMap['bna_amount_paid']) {
          fieldsToUpdate.push({ id: fieldMap['bna_amount_paid'], value: amount || 1000 });
        }
        if (green_invoice_id && fieldMap['bna_green_invoice_id']) {
          fieldsToUpdate.push({ id: fieldMap['bna_green_invoice_id'], value: green_invoice_id });
        }
        
        if (fieldsToUpdate.length > 0) {
          await ghlRequest(`/contacts/${contactId}`, {
            method: 'PUT',
            body: JSON.stringify({ customFields: fieldsToUpdate }),
          });
        }
        
        // Add paid tag
        await addGhlTags(contactId, ['BNA Paid']);
      } catch (ghlErr) {
        console.error('GHL update failed:', ghlErr.message);
      }
    }
    
    // Send payment confirmation notification
    const notificationMessage = `✅ *Payment Received*

*Child:* ${signup.child_name}
*Parent:* ${signup.parent1_name}
*Amount:* ₪${amount || 1000}
*Method:* ${signup.payment_method}

Payment completed at ${new Date().toLocaleString()}`;

    await sendTelegramNotification(notificationMessage, [
      TELEGRAM_CHAT_ID_SHLOIMIE,
      TELEGRAM_CHAT_ID_AHUVA
    ]);
    
    res.json({ success: true, message: 'Payment marked as complete' });
  } catch (error) {
    console.error('Payment update error:', error);
    res.status(500).json({ success: false, error: 'Failed to update payment status' });
  }
});

// Green Invoice webhook endpoint
app.post('/api/webhooks/green-invoice', async (req, res) => {
  try {
    const { 
      payment_id, 
      status, 
      email, 
      phone, 
      amount,
      metadata 
    } = req.body;
    
    console.log('Green Invoice webhook received:', req.body);
    
    if (status !== 'completed' && status !== 'paid') {
      return res.json({ success: true, message: 'Payment not completed, ignoring' });
    }
    
    // Find matching signup by email or phone
    let signupQuery = 'SELECT * FROM signups WHERE payment_status != $1';
    let queryParams = ['paid'];
    
    if (email) {
      signupQuery += ' AND parent1_email = $2';
      queryParams.push(email);
    } else if (phone) {
      signupQuery += ' AND parent1_phone = $2';
      queryParams.push(phone);
    } else if (metadata?.registration_id) {
      signupQuery += ' AND id = $2';
      queryParams.push(metadata.registration_id);
    } else {
      return res.status(400).json({ success: false, error: 'No matching criteria provided' });
    }
    
    const signupResult = await pool.query(signupQuery, queryParams);
    
    if (signupResult.rows.length === 0) {
      console.log('No matching signup found for Green Invoice payment');
      return res.json({ success: true, message: 'No matching signup found' });
    }
    
    const signup = signupResult.rows[0];
    
    // Update signup status
    await pool.query(
      'UPDATE signups SET payment_status = $1, paid_at = CURRENT_TIMESTAMP, green_invoice_id = $2 WHERE id = $3',
      ['paid', payment_id, signup.id]
    );
    
    // Update GHL
    if (GHL_PIT_TOKEN && signup.ghl_parent_contact_id) {
      try {
        const paidDate = new Date().toISOString().split('T')[0];
        const nextBillingDate = new Date();
        nextBillingDate.setDate(nextBillingDate.getDate() + 30);
        
        const fieldsResult = await ghlRequest('/custom-fields');
        const fieldMap = {};
        for (const field of fieldsResult.customFields || []) {
          fieldMap[field.fieldKey] = field.id;
        }
        
        const fieldsToUpdate = [];
        if (fieldMap['bna_payment_status']) fieldsToUpdate.push({ id: fieldMap['bna_payment_status'], value: 'Paid' });
        if (fieldMap['bna_signup_status']) fieldsToUpdate.push({ id: fieldMap['bna_signup_status'], value: 'Active' });
        if (fieldMap['bna_paid_date']) fieldsToUpdate.push({ id: fieldMap['bna_paid_date'], value: paidDate });
        if (fieldMap['bna_next_billing_date']) fieldsToUpdate.push({ id: fieldMap['bna_next_billing_date'], value: nextBillingDate.toISOString().split('T')[0] });
        if (fieldMap['bna_amount_paid']) fieldsToUpdate.push({ id: fieldMap['bna_amount_paid'], value: amount || 1000 });
        if (fieldMap['bna_green_invoice_id']) fieldsToUpdate.push({ id: fieldMap['bna_green_invoice_id'], value: payment_id });
        
        if (fieldsToUpdate.length > 0) {
          await ghlRequest(`/contacts/${signup.ghl_parent_contact_id}`, {
            method: 'PUT',
            body: JSON.stringify({ customFields: fieldsToUpdate }),
          });
        }
        
        await addGhlTags(signup.ghl_parent_contact_id, ['BNA Paid']);
      } catch (ghlErr) {
        console.error('GHL update from webhook failed:', ghlErr.message);
      }
    }
    
    // Send notification
    const notificationMessage = `✅ *Green Invoice Payment Received*

*Child:* ${signup.child_name}
*Parent:* ${signup.parent1_name}
*Amount:* ₪${amount || 1000}
*Payment ID:* ${payment_id}

Payment completed at ${new Date().toLocaleString()}`;

    await sendTelegramNotification(notificationMessage, [
      TELEGRAM_CHAT_ID_SHLOIMIE,
      TELEGRAM_CHAT_ID_AHUVA
    ]);
    
    res.json({ success: true, message: 'Payment processed' });
  } catch (error) {
    console.error('Green Invoice webhook error:', error);
    res.status(500).json({ success: false, error: 'Failed to process webhook' });
  }
});

// Get pending payments (for admin/bot)
app.get('/api/pending-payments', async (req, res) => {
  try {
    const query = `
      SELECT id, child_name, parent1_name, parent1_email, parent1_phone, 
             payment_method, payment_status, submitted_at, ghl_parent_contact_id
      FROM signups 
      WHERE payment_status IN ('pending', 'pending_cash')
      ORDER BY submitted_at DESC
    `;
    
    const result = await pool.query(query);
    res.json({ success: true, pending: result.rows });
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch pending payments' });
  }
});

// Get all signups with filters (for Telegram bot)
app.get('/api/signups', async (req, res) => {
  try {
    const { status, payment_method, search } = req.query;
    
    let query = 'SELECT * FROM signups WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    if (status) {
      query += ` AND payment_status = $${paramIndex++}`;
      params.push(status);
    }
    
    if (payment_method) {
      query += ` AND payment_method = $${paramIndex++}`;
      params.push(payment_method);
    }
    
    if (search) {
      query += ` AND (parent1_name ILIKE $${paramIndex} OR child_name ILIKE $${paramIndex} OR parent1_email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY submitted_at DESC';
    
    const result = await pool.query(query, params);
    res.json({ success: true, signups: result.rows });
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch signups' });
  }
});

// Update signup (for Telegram bot)
app.put('/api/signups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const allowedFields = ['payment_status', 'payment_method', 'paid_at', 'green_invoice_id', 'ghl_parent_contact_id'];
    const fields = [];
    const values = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid fields to update' });
    }
    
    values.push(id);
    const query = `UPDATE signups SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Signup not found' });
    }
    
    res.json({ success: true, signup: result.rows[0] });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ success: false, error: 'Failed to update signup' });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', ghl: GHL_PIT_TOKEN ? 'configured' : 'not configured' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// ===== OPERATIONS TASK MANAGER AUTH & API =====

// Simple session storage (in-memory)
const sessions = new Map();
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function generateSessionId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function cleanupSessions() {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (session.expires < now) {
      sessions.delete(id);
    }
  }
}

// Login endpoint
app.post('/api/operations/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === AUTH_USERNAME && password === AUTH_PASSWORD) {
    const sessionId = generateSessionId();
    sessions.set(sessionId, {
      username,
      expires: Date.now() + SESSION_DURATION
    });
    
    res.json({ success: true, sessionId });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

// Logout endpoint
app.post('/api/operations/logout', (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  if (sessionId) {
    sessions.delete(sessionId);
  }
  res.json({ success: true });
});

// Auth middleware
function requireAuth(req, res, next) {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  
  const session = sessions.get(sessionId);
  if (session.expires < Date.now()) {
    sessions.delete(sessionId);
    return res.status(401).json({ success: false, error: 'Session expired' });
  }
  
  req.session = session;
  next();
}

// Get all tasks
app.get('/api/operations/tasks', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, notes, category, urgency, status, due_date as "dueDate", owner, created_at as "createdAt", updated_at as "updatedAt" FROM operations_tasks ORDER BY created_at DESC'
    );
    res.json({ success: true, tasks: result.rows });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tasks' });
  }
});

// Create task
app.post('/api/operations/tasks', requireAuth, async (req, res) => {
  try {
    const { title, notes, category, urgency, status, dueDate, owner } = req.body;
    
    const result = await pool.query(
      `INSERT INTO operations_tasks (title, notes, category, urgency, status, due_date, owner)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, title, notes, category, urgency, status, due_date as "dueDate", owner, created_at as "createdAt", updated_at as "updatedAt"`,
      [title, notes || '', category, urgency, status, dueDate || null, owner || null]
    );
    
    res.json({ success: true, task: result.rows[0] });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ success: false, error: 'Failed to create task' });
  }
});

// Update task
app.put('/api/operations/tasks/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, notes, category, urgency, status, dueDate, owner } = req.body;
    
    const result = await pool.query(
      `UPDATE operations_tasks 
       SET title = $1, notes = $2, category = $3, urgency = $4, status = $5, due_date = $6, owner = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING id, title, notes, category, urgency, status, due_date as "dueDate", owner, created_at as "createdAt", updated_at as "updatedAt"`,
      [title, notes || '', category, urgency, status, dueDate || null, owner || null, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    
    res.json({ success: true, task: result.rows[0] });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ success: false, error: 'Failed to update task' });
  }
});

// Delete task
app.delete('/api/operations/tasks/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM operations_tasks WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete task' });
  }
});

// Serve operations login page
app.get('/operations/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'operations-login.html'));
});

// Serve operations app (protected)
app.get('/operations', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'operations.html'));
});

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`GHL integration: ${GHL_PIT_TOKEN ? 'enabled' : 'disabled'}`);
  });
});
