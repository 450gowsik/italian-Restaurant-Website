const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const allowedOrigins = [
  "http://localhost:3000",
  "https://italian-restaurant-website.netlify.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Structured Logging for CloudWatch
app.use((req, res, next) => {
  console.log(JSON.stringify({
    path: req.path,
    method: req.method,
    time: new Date().toISOString()
  }));
  next();
});

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, message: "Too many requests, please try again later." }
});
app.use(limiter);

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", uptime: process.uptime() });
});

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

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports.handler = serverless(app, { binary: false });
