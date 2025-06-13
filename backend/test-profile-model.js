const ServiceProfile = require('./models/ServiceProfile');

async function testModel() {
  try {
    console.log('🧪 Testing ServiceProfile model...');
    
    const result = await ServiceProfile.getAll({ limit: 1 });
    console.log('✅ ServiceProfile.getAll() works');
    console.log('Sample:', result.profiles[0]?.business_name);
    
  } catch (error) {
    console.error('❌ Model error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testModel();