// backend/generate-jwt-secret.js
const crypto = require('crypto');

console.log('🔐 JWT SECRET GENERÁTOR');
console.log('==========================================');

// Módszer 1: Node.js crypto modul
const secret1 = crypto.randomBytes(64).toString('hex');
console.log('\n1️⃣ Crypto Random (64 bytes hex):');
console.log(`JWT_SECRET=${secret1}`);

// Módszer 2: Base64 kódolás
const secret2 = crypto.randomBytes(48).toString('base64');
console.log('\n2️⃣ Base64 Random (48 bytes):');
console.log(`JWT_SECRET=${secret2}`);

// Módszer 3: Egyszerű UUID kombináció
const uuid1 = crypto.randomUUID();
const uuid2 = crypto.randomUUID();
const secret3 = `corvus_${uuid1}_${uuid2}`.replace(/-/g, '');
console.log('\n3️⃣ UUID alapú:');
console.log(`JWT_SECRET=${secret3}`);

// Módszer 4: Timestamp + Random
const timestamp = Date.now().toString();
const randomPart = crypto.randomBytes(16).toString('hex');
const secret4 = `corvus_platform_${timestamp}_${randomPart}`;
console.log('\n4️⃣ Timestamp + Random:');
console.log(`JWT_SECRET=${secret4}`);

console.log('\n✅ Válassz egyet és másold be a .env fájlba!');
console.log('💡 Tip: A #1 vagy #2 a legbiztonságosabb production-höz');

// Bonus: .env template
console.log('\n📋 TELJES .env TEMPLATE:');
console.log('==========================================');
console.log(`NODE_ENV=development
PORT=5000
JWT_SECRET=${secret1}
JWT_EXPIRES_IN=7d`);

console.log('\n🎯 Másold ezt a backend/.env fájlba!');