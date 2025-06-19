// backend/debug-deep.js - TELJES RENDSZER DIAGNOSZTIKA
const express = require('express');
const fs = require('fs');
const path = require('path');

console.log('🔍 TELJES BACKEND DIAGNOSZTIKA');
console.log('==========================================');

// 1. ENVIRONMENT ELLENŐRZÉSE
console.log('\n📋 1. ENVIRONMENT VÁLTOZÓK');
console.log('NODE_ENV:', process.env.NODE_ENV || 'nincs beállítva');
console.log('PORT:', process.env.PORT || 'nincs beállítva (default: 5000)');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Beállítva' : '❌ HIÁNYZIK!');

// 2. FÁJL STRUKTÚRA ELLENŐRZÉSE
console.log('\n📁 2. FÁJL STRUKTÚRA');
const requiredFiles = [
  'server.js',
  'config/database.js',
  'middleware/auth.js',
  'routes/auth.js',
  'routes/profiles.js',
  'routes/upload.js',
  'routes/serviceProfiles.js'
];

requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// 3. DATABASE CONFIG TESZTELÉSE
console.log('\n🗄️ 3. DATABASE KONFIGURÁCIÓ');
try {
  const dbConfig = require('./config/database');
  console.log('✅ Database config betöltve');
  
  // Próbáljunk kapcsolódni
  dbConfig.query('SELECT NOW() as current_time')
    .then(result => {
      console.log('✅ Database kapcsolat OK:', result.rows[0].current_time);
    })
    .catch(error => {
      console.log('❌ Database kapcsolat hiba:', error.message);
    });
} catch (error) {
  console.log('❌ Database config hiba:', error.message);
}

// 4. MIDDLEWARE TESZTELÉSE
console.log('\n🔐 4. MIDDLEWARE TESZTELÉS');
try {
  const authMiddleware = require('./middleware/auth');
  console.log('✅ Auth middleware betöltve');
  console.log('Elérhető függvények:', Object.keys(authMiddleware));
} catch (error) {
  console.log('❌ Auth middleware hiba:', error.message);
}

// 5. ROUTES RÉSZLETES TESZTELÉS
console.log('\n🛣️ 5. ROUTES RÉSZLETES TESZTELÉS');

function testRouteInDetail(filename) {
  console.log(`\n🧪 Tesztelés: ${filename}`);
  console.log('─'.repeat(50));
  
  try {
    const filePath = path.join(__dirname, 'routes', filename);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Fájl nem található: ${filename}`);
      return;
    }
    
    // Fájl tartalom ellenőrzése
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`📄 Fájl méret: ${content.length} karakter`);
    
    // Router export ellenőrzése
    if (!content.includes('module.exports')) {
      console.log('❌ Hiányzik module.exports');
      return;
    }
    
    if (!content.includes('express.Router()')) {
      console.log('❌ Hiányzik express.Router()');
      return;
    }
    
    // Route definíciók számlálása
    const routeMatches = content.match(/router\.(get|post|put|delete)/g);
    console.log(`🛣️ Route definíciók száma: ${routeMatches ? routeMatches.length : 0}`);
    
    // Próbáljuk meg betölteni
    delete require.cache[require.resolve(filePath)]; // Cache törlése
    const routeModule = require(filePath);
    
    if (typeof routeModule === 'function') {
      console.log('✅ Router export típus: function (Express Router)');
      
      // Próbáljuk egy test app-hoz adni
      const testApp = express();
      testApp.use('/test', routeModule);
      console.log('✅ Test app regisztráció sikeres');
      
    } else {
      console.log(`❌ Rossz export típus: ${typeof routeModule}`);
    }
    
  } catch (error) {
    console.log(`💥 HIBA: ${error.message}`);
    
    if (error.message.includes('path-to-regexp')) {
      console.log('🎯 PATH-TO-REGEXP HIBA DETECTED!');
      
      // Keressük a hibás route pattern-eket
      const content = fs.readFileSync(path.join(__dirname, 'routes', filename), 'utf8');
      const lines = content.split('\n');
      
      console.log('🔍 Hibás route pattern-ek keresése:');
      lines.forEach((line, index) => {
        if (line.includes('router.') && line.includes('/:')) {
          // Ellenőrizzük a hibás pattern-eket
          if (line.match(/['"][^'"]*:\s*['"]/)) {
            console.log(`   🚨 Sor ${index + 1}: ${line.trim()}`);
            console.log(`      ↳ Hibás pattern: üres paraméter név`);
          }
          if (line.match(/['"][^'"]*:(?![a-zA-Z_])/)) {
            console.log(`   🚨 Sor ${index + 1}: ${line.trim()}`);
            console.log(`      ↳ Hibás pattern: érvénytelen paraméter karakter`);
          }
        }
      });
    }
  }
}

// Teszteljük az összes route fájlt
const routeFiles = ['auth.js', 'profiles.js', 'upload.js', 'serviceProfiles.js'];
routeFiles.forEach(testRouteInDetail);

// 6. SERVER.JS ELLENŐRZÉS
console.log('\n🖥️ 6. SERVER.JS ELLENŐRZÉS');
try {
  const serverPath = path.join(__dirname, 'server.js');
  const serverContent = fs.readFileSync(serverPath, 'utf8');
  
  // Keressük a dupla regisztrációkat
  const routeRegistrations = serverContent.match(/app\.use\(['"]/g);
  console.log(`🔗 app.use() hívások száma: ${routeRegistrations ? routeRegistrations.length : 0}`);
  
  // Keressük a problémás részeket
  if (serverContent.includes('require(') && serverContent.includes('app.listen(')) {
    const requireLines = serverContent.split('\n').filter(line => 
      line.includes('require(') && line.includes('routes/')
    );
    
    console.log('📦 Route import-ok:');
    requireLines.forEach((line, index) => {
      console.log(`   ${index + 1}. ${line.trim()}`);
    });
  }
  
} catch (error) {
  console.log('❌ Server.js olvasási hiba:', error.message);
}

// 7. PRÓBA SERVER INDÍTÁS
console.log('\n🚀 7. PRÓBA SERVER INDÍTÁS');
console.log('Figyelj a konzolra a server indításkor...');

setTimeout(() => {
  console.log('\n📊 DIAGNOSZTIKA BEFEJEZVE');
  console.log('==========================================');
  process.exit(0);
}, 2000);