const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (index.html, css, js, etc.)
app.use(express.static(path.join(__dirname)));

// =====================
// MySQL Connection
// =====================
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root@123',
  multipleStatements: true
});

// Connect and initialize database + table
db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL server');

  // Create database if it doesn't exist, then use it and create the table
  const initSQL = `
    CREATE DATABASE IF NOT EXISTS restaurant_db;
    USE restaurant_db;
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

  db.query(initSQL, (err) => {
    if (err) {
      console.error('❌ Database/table initialization failed:', err.message);
      process.exit(1);
    }
    console.log('✅ Database "restaurant_db" and table "customer_detail" are ready');

    // Switch to the restaurant_db for all future queries
    db.changeUser({ database: 'restaurant_db' }, (err) => {
      if (err) {
        console.error('❌ Failed to switch database:', err.message);
        process.exit(1);
      }
    });
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
