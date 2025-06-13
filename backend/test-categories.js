const pool = require('./config/database');

async function addCategoriesToProfiles() {
  try {
    console.log('🔗 Adding categories to existing profiles...');

    // Get some category IDs
    const categories = await pool.query('SELECT id, name FROM service_categories WHERE parent_id IS NOT NULL LIMIT 5');
    console.log('Available categories:', categories.rows);

    // Add categories to profile 1 (Kovács Építő)
    await pool.query(
      'INSERT INTO profile_categories (profile_id, category_id, is_primary) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [6, 1, true]  // Profile 6, Category 1, Primary
    );

    // Add categories to profile 2 (Nagy Webdesign) 
    await pool.query(
      'INSERT INTO profile_categories (profile_id, category_id, is_primary) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [7, 4, true]  // Profile 7, Category 4, Primary
    );

    console.log('✅ Categories added to profiles');

    // Test the API again
    console.log('\n📊 Testing API with categories:');
    const response = await fetch('http://localhost:5000/api/profiles/6');
    const data = await response.json();
    
    console.log('Profile 6 with categories:', {
      business_name: data.data?.business_name,
      categories: data.data?.categories
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addCategoriesToProfiles();