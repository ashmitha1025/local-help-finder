const express = require("express");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");

const app = express();

// DB
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "helpfinder",
  password: "ashmi",
  port: 5432,
});

app.use(cors());
app.use(express.json());

/* ✅ Serve current folder files */
app.use(express.static(__dirname));

/* ---------------- PAGE ROUTES ---------------- */

// Default page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "loginpage.html"));
});

// Pages
app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "home.html"));
});

app.get("/search", (req, res) => {
  res.sendFile(path.join(__dirname, "search.html"));
});

app.get("/results", (req, res) => {
  res.sendFile(path.join(__dirname, "results.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin-login.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "admin-dashboard.html"));
});

/* ---------------- APIs ---------------- */

/* USER LOGIN */
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query(
    "SELECT * FROM users WHERE email=$1 AND password=$2",
    [email, password]
  );

  res.json({ success: result.rows.length > 0 });
});

/* ADMIN LOGIN */
app.post("/api/admin-login", (req, res) => {
  const { admin, password } = req.body;

  res.json({
    success: admin === "admin" && password === "admin123"
  });
});

/* ADD SERVICE */
app.post("/api/add", async (req, res) => {
  const { name, service, pincode } = req.body;

  await pool.query(
    "INSERT INTO services (name, service, pincode) VALUES ($1,$2,$3)",
    [name, service, pincode]
  );

  res.json({ success: true });
});

/* SEARCH */
app.get("/api/help", async (req, res) => {
  const { service, pincode } = req.query;

  const result = await pool.query(
    `SELECT *, ABS(pincode::int - $1::int) AS distance
     FROM services
     WHERE service ILIKE $2
     ORDER BY distance ASC`,
    [pincode, `%${service}%`]
  );

  res.json(result.rows);
});

/* ANALYTICS */
app.get("/api/stats", async (req, res) => {
  const result = await pool.query(`
    SELECT service, COUNT(*) as count
    FROM services
    GROUP BY service
  `);

  res.json(result.rows);
});

// Server
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});