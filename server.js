const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: "https://italian-restaurant-website.netlify.app",
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test DB Connection
app.get("/test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    console.error("DB test failed:", err.message);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// Save Customer Detail
app.post("/api/customer-detail", async (req, res) => {
  const { full_name, email, phone, preferred_date, guests, message } = req.body;

  if (!full_name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Full name, email, and message are required.",
    });
  }

  try {
    const sql = `
      INSERT INTO customer_detail
      (full_name, email, phone, preferred_date, guests, message)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING id
    `;

    const result = await pool.query(sql, [
      full_name,
      email,
      phone || null,
      preferred_date || null,
      guests || null,
      message
    ]);

    res.status(201).json({
      success: true,
      message: "Your details saved successfully!",
      id: result.rows[0].id
    });

  } catch (err) {
    console.error("Insert failed:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to save details."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
