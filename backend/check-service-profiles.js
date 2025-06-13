const pool = require('./config/database');

async function checkServiceProfiles() {
  try {
    console.log('🔄 Checking service_profiles structure...');
    
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'service_profiles' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 service_profiles columns:');
    result.rows.forEach(row => {
      const nullable = row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      console.log(`  - ${row.column_name} (${row.data_type}) ${nullable}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkServiceProfiles();