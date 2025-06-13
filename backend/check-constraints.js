const pool = require('./config/database');

async function checkConstraints() {
  try {
    console.log('🔄 Checking constraints...');
    
    const result = await pool.query(`
      SELECT 
        tc.constraint_name, 
        tc.table_name, 
        cc.check_clause
      FROM information_schema.table_constraints tc
      JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
      WHERE tc.table_name = 'users'
    `);
    
    console.log('📋 User table constraints:');
    result.rows.forEach(row => {
      console.log(`  - ${row.constraint_name}: ${row.check_clause}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkConstraints();