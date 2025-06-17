// backend/deep-debug.js - RÉSZLETES HIBAKERESÉS
const express = require('express');
const fs = require('fs');
const path = require('path');

console.log('🔍 RÉSZLETES ROUTE HIBAKERESÉS');
console.log('==========================================');

// Próbáljuk meg egyesével betölteni minden route fájlt
const routeFiles = [
  'auth.js',
  'profiles.js', 
  'upload.js',
  'serviceProfiles.js',
  'courses.js',
  'projects.js',
  'messages.js'
];

function testRouteFile(filename) {
  console.log(`\n🧪 Tesztelés: ${filename}`);
  console.log('─────────────────────────');
  
  try {
    const filePath = path.join(__dirname, 'routes', filename);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Fájl nem található: ${filename}`);
      return false;
    }
    
    // Próbáljuk meg betölteni a route-ot
    const routeModule = require(filePath);
    console.log(`✅ Betöltés sikeres: ${filename}`);
    
    // Ellenőrizzük a route típusát
    if (typeof routeModule === 'function') {
      console.log(`📝 ${filename} - Express Router függvény`);
    } else if (typeof routeModule === 'object' && routeModule.router) {
      console.log(`📝 ${filename} - Router objektum`);
    } else {
      console.log(`⚠️  ${filename} - Ismeretlen export típus:`, typeof routeModule);
    }
    
    // Próbáljuk meg egy tesztalkalmazáshoz adni
    const testApp = express();
    const testPath = `/test-${filename.replace('.js', '')}`;
    
    testApp.use(testPath, routeModule);
    console.log(`✅ Route regisztráció sikeres: ${testPath}`);
    
    return true;
    
  } catch (error) {
    console.log(`💥 HIBA a ${filename} fájlban:`);
    console.log(`   Típus: ${error.name}`);
    console.log(`   Üzenet: ${error.message}`);
    
    if (error.message.includes('Missing parameter name')) {
      console.log(`   🎯 Ez a fájl okozza a path-to-regexp hibát!`);
      
      // Olvassuk be a fájlt és keressünk hibás route-okat
      try {
        const content = fs.readFileSync(path.join(__dirname, 'routes', filename), 'utf8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          if (line.includes('router.') && line.includes('/:')) {
            // Ellenőrizzük a hibás pattern-eket
            if (line.match(/router\.\w+\(['""][^'"]*:(?![a-zA-Z_])/)) {
              console.log(`   🚨 Sor ${index + 1}: ${line.trim()}`);
            }
          }
        });
      } catch (readError) {
        console.log(`   Nem sikerült beolvasni a fájlt: ${readError.message}`);
      }
    }
    
    return false;
  }
}

// Teszteljük egyesével minden fájlt
const results = {};
routeFiles.forEach(file => {
  results[file] = testRouteFile(file);
});

console.log('\n📊 ÖSSZEFOGLALÓ');
console.log('==========================================');

Object.entries(results).forEach(([file, success]) => {
  console.log(`${success ? '✅' : '❌'} ${file}`);
});

const problematicFiles = Object.entries(results)
  .filter(([file, success]) => !success)
  .map(([file]) => file);

if (problematicFiles.length > 0) {
  console.log(`\n🎯 PROBLÉMÁS FÁJLOK: ${problematicFiles.join(', ')}`);
  console.log('\n🔧 JAVASOLT LÉPÉSEK:');
  console.log('1. Javítsd a hibás route-okat a problémás fájlokban');
  console.log('2. Ellenőrizd a route pattern-eket (pl. /:id helyett /:)');
  console.log('3. Futtasd újra: npm run dev');
} else {
  console.log('\n🤔 Minden route fájl rendben van...');
  console.log('A hiba valószínűleg a server.js-ben van:');
  console.log('- Dupla route regisztráció');
  console.log('- Hibás middleware');
  console.log('- Egyéb express konfiguráció');
}

console.log('\n🚀 Próbáld ki:');
console.log('node deep-debug.js');