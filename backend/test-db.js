const pool = require('./config/database');

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...');
    const result = await pool.query('SELECT version(), now()');
    console.log('✅ PostgreSQL connection OK');
    console.log('Version:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]);
    console.log('Time:', result.rows[0].now);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('Config check:');
    console.log('- HOST:', process.env.DB_HOST || 'localhost');
    console.log('- PORT:', process.env.DB_PORT || 5432);
    console.log('- DATABASE:', process.env.DB_NAME || 'szolgaltato_piacter_dev');
    console.log('- USER:', process.env.DB_USER || 'postgres');
  } finally {
    await pool.end();
  }
}

testConnection();