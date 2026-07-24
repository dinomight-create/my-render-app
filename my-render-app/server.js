const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(express.json());

// Set up PostgreSQL Connection Pool
const pool = new Pool({
  // Use environment variable on Render, or fallback to the connection string
  connectionString: process.env.DATABASE_URL || 'postgresql://accounting_hutx_user:trLfCMqMY3CWoQkS6T8y1ThOQGAACiFr@dpg-d9fj1idaeets73c5mh7g-a.frankfurt-postgres.render.com/accounting_hutx',
  ssl: {
    rejectUnauthorized: false // Required for Render Postgres external connections
  }
});

// API Endpoint to check NIP
app.get('/api/check-nip/:nip', async (req, res) => {
  const { nip } = req.params;
  const sanitizedNip = nip.replace(/[\s-]/g, '');

  try {
    // Modify table/column names if they differ in your database schema
    const queryText = 'SELECT * FROM companies WHERE nip_number = $1';
    const result = await pool.query(queryText, [sanitizedNip]);

    if (result.rows.length > 0) {
      return res.json({ found: true, data: result.rows[0] });
    } else {
      return res.json({ found: false, message: 'NIP not found' });
    }
  } catch (error) {
    console.error('Database query error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static frontend files (e.g., your index.html)
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
