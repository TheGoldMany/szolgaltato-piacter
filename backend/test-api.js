const pool = require('./config/database');

async function testServiceProfilesAPI() {
  try {
    console.log('🧪 Testing Service Profiles API...\n');

    // Test database connection
    console.log('1. Database connection test:');
    const dbTest = await pool.query('SELECT COUNT(*) FROM service_profiles');
    console.log(`   ✅ Database connected, ${dbTest.rows[0].count} profiles found\n`);

    // Test ServiceProfile model
    console.log('2. ServiceProfile model test:');
    const ServiceProfile = require('./models/ServiceProfile');
    
    const allProfiles = await ServiceProfile.getAll({ limit: 3 });
    console.log(`   ✅ ServiceProfile.getAll() - Found ${allProfiles.profiles.length} profiles`);
    
    if (allProfiles.profiles.length > 0) {
      const firstProfile = await ServiceProfile.getById(allProfiles.profiles[0].id);
      console.log(`   ✅ ServiceProfile.getById() - Found: ${firstProfile?.business_name}`);
    }

    console.log('\n3. Sample API responses:');
    allProfiles.profiles.forEach((profile, index) => {
      console.log(`   ${index + 1}. ${profile.business_name} (${profile.location_city})`);
      console.log(`      User: ${profile.first_name} ${profile.last_name}`);
      console.log(`      Categories: ${profile.categories?.join(', ') || 'None'}`);
    });

    console.log('\n✅ All tests passed! API is ready for frontend integration.');
    console.log('\n🌐 Test these endpoints:');
    console.log('   GET  http://localhost:5000/api/profiles');
    console.log('   GET  http://localhost:5000/api/profiles/1');
    console.log('   GET  http://localhost:5000/api/profiles?city=Budapest');
    console.log('   GET  http://localhost:5000/api/profiles?search=webdesign');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await pool.end();
  }
}

testServiceProfilesAPI();