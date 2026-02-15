const express = require("express");
const path = require("path");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// =====================
// Test DB Connection
// =====================
app.get("/test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ DB test failed:", err.message);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// =====================
// API Endpoint — Save Customer Detail
// =====================
app.post("/api/customer-detail", async (req, res) => {
  const { full_name, email, phone, preferred_date, guests, message } = req.body;

  // Basic server-side validation
  if (!full_name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Full name, email, and message are required.",
    });
  }

  try {
    const sql = `INSERT INTO customer_detail (full_name, email, phone, preferred_date, guests, message) 
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
    const values = [
      full_name,
      email,
      phone || null,
      preferred_date || null,
      guests || null,
      message,
    ];

    const result = await pool.query(sql, values);

    console.log(`✅ Customer detail saved (ID: ${result.rows[0].id})`);
    res.status(201).json({
      success: true,
      message: "Your details have been saved successfully!",
      id: result.rows[0].id,
    });
  } catch (err) {
    console.error("❌ Insert failed:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to save your details. Please try again.",
    });
  }
});

// =====================
// Start Server
// =====================
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
