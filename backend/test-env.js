// backend/test-env.js
require('dotenv').config();

console.log('🔍 ENVIRONMENT VÁLTOZÓK TESZTELÉSE');
console.log('==========================================');

const requiredEnvVars = [
  'NODE_ENV',
  'PORT', 
  'JWT_SECRET',
  'JWT_EXPIRES_IN'
];

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`${value ? '✅' : '❌'} ${varName}: ${value || 'HIÁNYZIK!'}`);
});

// JWT tesztelés
if (process.env.JWT_SECRET) {
  try {
    const jwt = require('jsonwebtoken');
    const testToken = jwt.sign({ test: 'data' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
    console.log('\n✅ JWT teszt sikeres!');
    console.log('Token generálva és dekódolva:', decoded.test);
  } catch (error) {
    console.log('\n❌ JWT teszt hiba:', error.message);
  }
} else {
  console.log('\n❌ JWT_SECRET hiányzik - nem lehet tesztelni');
}

console.log('\n🎯 Ha minden ✅, akkor restart a server-t!');