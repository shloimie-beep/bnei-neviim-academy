// Serverless function for form submission
const { Pool } = require('pg');

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

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Create table if not exists (automatic!)
    await pool.query(createTableSQL);
    
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
    
    res.status(200).json({ 
      success: true, 
      message: 'Registration submitted successfully',
      id: result.rows[0].id 
    });
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to submit registration. Please try again or contact us on WhatsApp.' 
    });
  }
};
