/**
 * Script para copiar la APK generada al backend
 * Uso: node scripts/copy-apk-to-backend.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rutas
const FRONTEND_APK = path.join(__dirname, '..', 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release-unsigned.apk');
const FRONTEND_APK_DEBUG = path.join(__dirname, '..', 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
const BACKEND_DIR = path.join(__dirname, '..', '..', 'backend', 'uploads');
const BACKEND_APK = path.join(BACKEND_DIR, 'kdice-app.apk');

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

console.log('📦 Copiando APK al backend...\n');

// Determinar qué APK usar
let sourceApk = null;
let apkType = '';

if (fs.existsSync(FRONTEND_APK)) {
  sourceApk = FRONTEND_APK;
  apkType = 'release';
} else if (fs.existsSync(FRONTEND_APK_DEBUG)) {
  sourceApk = FRONTEND_APK_DEBUG;
  apkType = 'debug';
}

if (!sourceApk) {
  console.error('❌ No se encontró la APK generada.');
  console.log('\n💡 Asegúrate de haber generado la APK primero:');
  console.log('   1. Abre Android Studio');
  console.log('   2. Build → Build Bundle(s) / APK(s) → Build APK(s)');
  console.log('\n📍 Rutas esperadas:');
  console.log(`   Release: ${FRONTEND_APK}`);
  console.log(`   Debug:   ${FRONTEND_APK_DEBUG}`);
  process.exit(1);
}

// Crear directorio de uploads si no existe
if (!fs.existsSync(BACKEND_DIR)) {
  fs.mkdirSync(BACKEND_DIR, { recursive: true });
  console.log(`📁 Creado directorio: ${BACKEND_DIR}`);
}

// Copiar APK
try {
  const stats = fs.statSync(sourceApk);
  
  fs.copyFileSync(sourceApk, BACKEND_APK);
  
  console.log('✅ APK copiada exitosamente:\n');
  console.log(`   📱 Tipo: ${apkType}`);
  console.log(`   📊 Tamaño: ${formatBytes(stats.size)}`);
  console.log(`   📍 Origen: ${sourceApk}`);
  console.log(`   📍 Destino: ${BACKEND_APK}\n`);
  
  console.log('🚀 Siguientes pasos:');
  console.log('   1. Sube los cambios al backend:');
  console.log('      cd ..\\backend');
  console.log('      git add uploads/kdice-app.apk');
  console.log('      git commit -m "Actualizar APK"');
  console.log('      git push');
  console.log('\n   2. En el VPS:');
  console.log('      git pull');
  console.log('      pm2 restart backend (si usas PM2)');
  console.log('\n✨ La APK estará disponible en: /api/apk/download/{slug}/android\n');
  
} catch (error) {
  console.error('❌ Error al copiar la APK:', error.message);
  process.exit(1);
}
