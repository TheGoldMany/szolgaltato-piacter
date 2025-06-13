async function testAllEndpoints() {
  const baseUrl = 'http://localhost:5000/api/profiles';
  
  console.log('🧪 Testing all Service Profile endpoints...\n');

  // Test 1: Get all profiles
  console.log('1. GET /api/profiles');
  try {
    const response = await fetch(baseUrl);
    const data = await response.json();
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   ✅ Found ${data.data?.length} profiles`);
    console.log(`   ✅ Total: ${data.pagination?.total}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 2: Get single profile
  console.log('\n2. GET /api/profiles/6');
  try {
    const response = await fetch(`${baseUrl}/6`);
    const data = await response.json();
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   ✅ Business: ${data.data?.business_name}`);
    console.log(`   ✅ Location: ${data.data?.location_city}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 3: Search with filters
  console.log('\n3. GET /api/profiles?city=Budapest');
  try {
    const response = await fetch(`${baseUrl}?city=Budapest`);
    const data = await response.json();
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   ✅ Budapest profiles: ${data.data?.length}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 4: Search with text
  console.log('\n4. GET /api/profiles?search=webdesign');
  try {
    const response = await fetch(`${baseUrl}?search=webdesign`);
    const data = await response.json();
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   ✅ Search results: ${data.data?.length}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 5: Pagination
  console.log('\n5. GET /api/profiles?limit=2&offset=2');
  try {
    const response = await fetch(`${baseUrl}?limit=2&offset=2`);
    const data = await response.json();
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   ✅ Page results: ${data.data?.length}`);
    console.log(`   ✅ Has more: ${data.pagination?.hasMore}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('\n✅ All endpoint tests completed!');
}

testAllEndpoints();