const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:             process.env.DB_HOST     || 'localhost',
  user:             process.env.DB_USER     || 'root',
  password:         process.env.DB_PASSWORD || '',
  database:         process.env.DB_NAME     || 'fasty_shop',
  waitForConnections: true,
  connectionLimit:  10,
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
