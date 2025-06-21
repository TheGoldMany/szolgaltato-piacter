// backend/debug-routes.js - ROUTE HIBAKERESÉS

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 ROUTE PATTERN HIBAKERESÉS');
console.log('==========================================');

// Teszteljük egyesével a route fájlokat
const routeFiles = ['auth.js', 'profiles.js', 'upload.js'];

function findBadRoutePatterns(filename) {
  console.log(`\n🧪 Ellenőrzés: ${filename}`);
  console.log('─────────────────────────────────────');
  
  const filePath = path.join(__dirname, 'routes', filename);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Fájl nem található: ${filename}`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  let foundIssues = false;
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmedLine = line.trim();
    
    // Ha tartalmaz router definíciót
    if (trimmedLine.includes('router.') && (trimmedLine.includes('get') || trimmedLine.includes('post') || trimmedLine.includes('put') || trimmedLine.includes('delete'))) {
      
      // Hibás pattern-ek keresése:
      
      // 1. Üres paraméter (pl. router.get('/:', ...) vagy router.get('/:/', ...))
      if (trimmedLine.match(/['"`][^'"`]*:(?:\s*['"`]|\/)/)) {
        console.log(`🚨 Sor ${lineNum}: ÜRES PARAMÉTER`);
        console.log(`   ${trimmedLine}`);
        console.log(`   ↳ Problémás pattern: üres paraméter név a : után`);
        foundIssues = true;
      }
      
      // 2. Hibás paraméter karakterek (pl. router.get('/:123', ...) vagy router.get('/:!', ...))
      if (trimmedLine.match(/['"`][^'"`]*:[^a-zA-Z_][^'"`\/]*/)) {
        console.log(`🚨 Sor ${lineNum}: HIBÁS PARAMÉTER KARAKTER`);
        console.log(`   ${trimmedLine}`);
        console.log(`   ↳ Problémás pattern: paraméter név érvénytelen karakterrel kezdődik`);
        foundIssues = true;
      }
      
      // 3. Dupla kettőspont (pl. router.get('/::id', ...))
      if (trimmedLine.match(/['"`][^'"`]*::[^'"`]*/)) {
        console.log(`🚨 Sor ${lineNum}: DUPLA KETTŐSPONT`);
        console.log(`   ${trimmedLine}`);
        console.log(`   ↳ Problémás pattern: dupla :: a route-ban`);
        foundIssues = true;
      }
      
      // 4. Hiányzó záró idézőjel vagy aposztróf
      const quoteMatches = trimmedLine.match(/['"`]/g);
      if (quoteMatches && quoteMatches.length % 2 !== 0) {
        console.log(`🚨 Sor ${lineNum}: HIÁNYZÓ ZÁRÓ IDÉZŐJEL`);
        console.log(`   ${trimmedLine}`);
        console.log(`   ↳ Problémás pattern: páratlan számú idézőjel`);
        foundIssues = true;
      }
      
      // 5. Route-ok listázása (minden route)
      console.log(`📍 Sor ${lineNum}: ${trimmedLine}`);
    }
  });
  
  if (!foundIssues) {
    console.log(`✅ ${filename} - Nem találtam hibás route pattern-eket`);
  } else {
    console.log(`❌ ${filename} - HIBÁS PATTERN-EK TALÁLHATÓK!`);
  }
}

// Minden route fájl ellenőrzése
routeFiles.forEach(findBadRoutePatterns);

console.log('\n🔧 LEHETSÉGES MEGOLDÁSOK:');
console.log('==========================================');
console.log('1. Javítsd a hibás route pattern-eket');
console.log('2. Győződj meg róla, hogy minden paraméter nevének betűvel kell kezdődnie');
console.log('3. Ellenőrizd, hogy minden idézőjel/aposztróf le van-e zárva');
console.log('4. Kerüld a dupla kettőspontokat (::)');
console.log('5. Ne használj üres paramétereket (pl. /:/)');

process.exit(0);