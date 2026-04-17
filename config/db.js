const mysql = require("mysql2/promise"); // ✅ IMPORTANT
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Test connection
pool.getConnection((err, conn) => {
  if (err) {
    console.error("❌ MySQL failed:", err.message);
  } else {
    console.log("✅ MySQL connected");
    conn.release();
  }
});

module.exports = pool;