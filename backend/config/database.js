// backend/config/database.js - ES MODULES ÁTÍRÁS
import { Pool } from 'pg';
import { config } from 'dotenv';

// Environment változók betöltése
config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'szolgaltato_piacter_dev',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum connection pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ PostgreSQL kapcsolat létrehozva');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL kapcsolat hiba:', err);
});

// Connection health check
export const testConnection = async () => {
  try {
    const result = await pool.query('SELECT version(), now()');
    console.log('✅ PostgreSQL connection OK');
    console.log('Version:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]);
    console.log('Time:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('Config check:');
    console.log('- HOST:', process.env.DB_HOST || 'localhost');
    console.log('- PORT:', process.env.DB_PORT || 5432);
    console.log('- DATABASE:', process.env.DB_NAME || 'szolgaltato_piacter_dev');
    console.log('- USER:', process.env.DB_USER || 'postgres');
    return false;
  }
};

export default pool;