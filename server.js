const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

// Load .env file for local development
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (index.html, css, js, etc.)
app.use(express.static(path.join(__dirname)));

// =====================
// MySQL Connection (PlanetScale / Environment Variables)
// =====================
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root@123',
  database: process.env.DB_NAME || 'restaurant_db',
  ssl: process.env.DB_HOST ? { rejectUnauthorized: true } : false
});

// Connect and initialize table
db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ MySQL Connected');

  // Create table if it doesn't exist
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS customer_detail (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(50) NOT NULL,
      email VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      preferred_date DATE,
      guests VARCHAR(10),
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  db.query(createTableSQL, (err) => {
    if (err) {
      console.error('❌ Table initialization failed:', err.message);
      process.exit(1);
    }
    console.log('✅ Table "customer_detail" is ready');
  });
});

// =====================
// API Endpoint
// =====================
app.post('/api/customer-detail', (req, res) => {
  const { full_name, email, phone, preferred_date, guests, message } = req.body;

  // Basic server-side validation
  if (!full_name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Full name, email, and message are required.'
    });
  }

  const sql = `INSERT INTO customer_detail (full_name, email, phone, preferred_date, guests, message) VALUES (?, ?, ?, ?, ?, ?)`;
  const values = [
    full_name,
    email,
    phone || null,
    preferred_date || null,
    guests || null,
    message
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('❌ Insert failed:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to save your details. Please try again.'
      });
    }

    console.log(`✅ Customer detail saved (ID: ${result.insertId})`);
    res.status(201).json({
      success: true,
      message: 'Your details have been saved successfully!',
      id: result.insertId
    });
  });
});

// =====================
// Start Server
// =====================
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
