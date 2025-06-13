const pool = require('../config/database');

async function resetDatabase() {
  try {
    console.log('🚨 Resetting database...');
    
    // Drop all tables (careful!)
    await pool.query(`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO public;
    `);
    
    console.log('✅ Database reset completed');
  } catch (error) {
    console.error('❌ Reset failed:', error);
  } finally {
    await pool.end();
  }
}

resetDatabase();