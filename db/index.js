const { Pool } = require('pg');
require('dotenv').config();
 
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'zariin_sait',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
});
 
pool.connect((err) => {
  if (err) console.error('DB холболт алдаа:', err.message);
  else console.log('PostgreSQL-д холбогдлоо.');
});
 
module.exports = pool;
 