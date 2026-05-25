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

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:hwbFDMCjLzifamfGHgSKvhJUoCuXOHBb@yamanote.proxy.rlwy.net:30613/railway',
  ssl: { rejectUnauthorized: false }
});

// Create table if not exists
const createTableSQL = `
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
  payment_status TEXT DEFAULT 'pending',
  payment_reminder_sent BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP
);
`;

// Initialize database
async function initDb() {
  try {
    await pool.query(createTableSQL);
    console.log('Database initialized - table created if not exists');
  } catch (err) {
    console.error('Database init error:', err);
  }
}

// Telegram notification helper
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
      hobbies
    } = req.body;
    
    const query = `
      INSERT INTO signups (
        parent1_name, parent1_email, parent1_phone,
        parent2_name, parent2_email, parent2_phone,
        address, child_name, child_age, current_school, hobbies
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `;
    
    const values = [
      parent1_name, parent1_email, parent1_phone,
      parent2_name, parent2_email, parent2_phone,
      address, child_name, child_age, current_school, hobbies
    ];
    
    const result = await pool.query(query, values);
    const signupId = result.rows[0].id;
    
    // Send Telegram notification
    const notificationMessage = `📝 *New BNA Registration*

*Child:* ${child_name} (${child_age} years)
*Parent:* ${parent1_name}
*Email:* ${parent1_email}
*Phone:* ${parent1_phone}

*Status:* ⏳ Payment Pending

View all signups: ${process.env.APP_URL || ''}/admin/signups`;

    await sendTelegramNotification(notificationMessage, [
      TELEGRAM_CHAT_ID_SHLOIMIE,
      TELEGRAM_CHAT_ID_AHUVA
    ]);
    
    res.json({ 
      success: true, 
      message: 'Registration submitted successfully',
      id: signupId,
      paymentLink: PAYMENT_LINK || null
    });
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to submit registration' 
    });
  }
});

// Mark payment as complete
app.post('/api/payment-complete', async (req, res) => {
  try {
    const { signup_id } = req.body;
    
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
    
    // Send payment confirmation notification
    const notificationMessage = `✅ *Payment Received*

*Child:* ${signup.child_name}
*Parent:* ${signup.parent1_name}
*Amount:* Registration Fee

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

// Get pending payments (for admin/bot)
app.get('/api/pending-payments', async (req, res) => {
  try {
    const query = `
      SELECT id, child_name, parent1_name, parent1_email, parent1_phone, submitted_at
      FROM signups 
      WHERE payment_status = 'pending'
      ORDER BY submitted_at DESC
    `;
    
    const result = await pool.query(query);
    res.json({ success: true, pending: result.rows });
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch pending payments' });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
