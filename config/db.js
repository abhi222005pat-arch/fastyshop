const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createConnection({
  host:process.env.DB_HOST,
  user:process.env.DB_USER,
  password:process.env.DN_PASSWORD,
  database:process.env.DB_NAME,
  port:process.env.DN_PORT
});

(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅  MySQL connected to "' + (process.env.DB_NAME || 'fasty_shop') + '"');
    conn.release();
  } catch (err) {
    console.error('❌  MySQL failed:', err.message);
    console.error('    Check DB_PASSWORD in .env file');
  }
})();

module.exports = pool;
