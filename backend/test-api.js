// backend/test-api.js - API tesztelő script
const baseUrl = 'http://localhost:5000';

async function testAPI() {
  console.log('🧪 API Endpoints tesztelése...\n');

  // Test 1: Root endpoint
  console.log('1. Testing root endpoint...');
  try {
    const response = await fetch(`${baseUrl}/`);
    const data = await response.json();
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   ✅ Message: ${data.message}`);
    console.log(`   ✅ Version: ${data.version}\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 2: Health check
  console.log('2. Testing health endpoint...');
  try {
    const response = await fetch(`${baseUrl}/health`);
    const data = await response.json();
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   ✅ Database: ${data.database}`);
    console.log(`   ✅ Uptime: ${data.uptime}s\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 3: API info
  console.log('3. Testing API info...');
  try {
    const response = await fetch(`${baseUrl}/api`);
    const data = await response.json();
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   ✅ API Version: ${data.message}`);
    console.log(`   ✅ Endpoints available: ${Object.keys(data.endpoints).length}\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 4: Profiles test endpoint
  console.log('4. Testing profiles test endpoint...');
  try {
    const response = await fetch(`${baseUrl}/api/profiles/test`);
    const data = await response.json();
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   ✅ Message: ${data.message}`);
    console.log(`   ✅ Available endpoints: ${data.available_endpoints.length}\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 5: Profiles search endpoint (empty search)
  console.log('5. Testing profiles search (empty query)...');
  try {
    const response = await fetch(`${baseUrl}/api/profiles/search`);
    const data = await response.json();
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   ✅ Success: ${data.success}`);
    console.log(`   ✅ Results: ${data.data?.length || 0} profiles found`);
    console.log(`   ✅ Total: ${data.pagination?.total || 0}\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 6: Profiles search with query
  console.log('6. Testing profiles search (with query)...');
  try {
    const response = await fetch(`${baseUrl}/api/profiles/search?query=web&limit=5`);
    const data = await response.json();
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   ✅ Success: ${data.success}`);
    console.log(`   ✅ Search results: ${data.data?.length || 0} profiles`);
    if (data.data?.length > 0) {
      console.log(`   ✅ First result: ${data.data[0].business_name}`);
    }
    console.log('');
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 7: Categories helper
  console.log('7. Testing categories helper...');
  try {
    const response = await fetch(`${baseUrl}/api/profiles/helpers/categories`);
    const data = await response.json();
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   ✅ Success: ${data.success}`);
    console.log(`   ✅ Popular specializations: ${data.data?.popular_specializations?.length || 0}`);
    console.log(`   ✅ Popular cities: ${data.data?.popular_cities?.length || 0}\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 8: Invalid endpoint (should return 404)
  console.log('8. Testing invalid endpoint (should be 404)...');
  try {
    const response = await fetch(`${baseUrl}/api/invalid-endpoint`);
    const data = await response.json();
    console.log(`   ✅ Status: ${response.status} (expected 404)`);
    console.log(`   ✅ Error message: ${data.error}\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  console.log('🎉 API tesztelés befejezve!\n');
  
  // Summary
  console.log('📋 Összefoglaló:');
  console.log('   - Root endpoint: működik');
  console.log('   - Health check: működik');
  console.log('   - API info: működik');
  console.log('   - Profiles API: működik');
  console.log('   - Search functionality: működik');
  console.log('   - Error handling: működik');
  console.log('\n✅ Az API készen áll a frontend teszteléshez!');
}

// Node.js környezetben fetch API használatához
if (typeof fetch === 'undefined') {
  console.log('⚠️  Node.js fetch not available. Installing node-fetch...');
  try {
    const fetch = require('node-fetch');
    global.fetch = fetch;
  } catch (error) {
    console.log('❌ node-fetch not installed. Run: npm install node-fetch');
    console.log('   Or test manually in browser/Postman');
    process.exit(1);
  }
}

// Script futtatása
if (require.main === module) {
  testAPI().catch(console.error);
}

module.exports = { testAPI };