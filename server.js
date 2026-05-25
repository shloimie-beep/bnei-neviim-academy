const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://postgres:hwbFDMCjLzifamfGHgSKvhJUoCuXOHBb@yamanote.proxy.rlwy.net:30613/railway',
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
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    
    res.json({ 
      success: true, 
      message: 'Registration submitted successfully',
      id: result.rows[0].id 
    });
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to submit registration' 
    });
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
