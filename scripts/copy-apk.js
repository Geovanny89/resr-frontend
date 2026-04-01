#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔄 Copiando APK generada a frontend...\n');

// Posibles rutas de APK - arm64 específica primero (más liviana ~8MB)
const possiblePaths = [
  // arm64-v8a específico (más común, más liviano)
  path.join(__dirname, '../android/app/build/outputs/apk/release/app-arm64-v8a-release-unsigned.apk'),
  
  // Release universal (más pesada ~30MB, solo si no hay específica)
  path.join(__dirname, '../android/app/build/outputs/apk/release/app-universal-release-unsigned.apk'),
  path.join(__dirname, '../android/app/build/outputs/apk/release/app-release-unsigned.apk'),
  
  // Debug (fallback)
  path.join(__dirname, '../android/app/build/outputs/apk/debug/app-arm64-v8a-debug.apk'),
  path.join(__dirname, '../android/app/build/outputs/apk/debug/app-universal-debug.apk'),
  path.join(__dirname, '../android/app/build/outputs/apk/debug/app-debug.apk'),
];

const distApkPath = path.join(__dirname, '../dist/apk/kdice-reservas.apk');
const distApkDir = path.dirname(distApkPath);

try {
  // Buscar la primera APK que exista
  let androidApkPath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      androidApkPath = p;
      break;
    }
  }

  if (!androidApkPath) {
    console.log('❌ No se encontró la APK generada');
    console.log('📱 Primero genera la APK:');
    console.log('   cd android');
    console.log('   gradlew.bat assembleRelease');
    console.log('   cd ..');
    console.log('   npm run copy-apk');
    process.exit(1);
  }

  console.log(`📱 APK encontrada: ${androidApkPath}`);

  // Crear carpetas de destino SOLO en dist
  if (!fs.existsSync(distApkDir)) {
    fs.mkdirSync(distApkDir, { recursive: true });
  }

  // Eliminar APK vieja
  if (fs.existsSync(distApkPath)) fs.unlinkSync(distApkPath);

  // Copiar SOLO a dist (evitar public para no inflar la APK)
  fs.copyFileSync(androidApkPath, distApkPath);

  const stats = fs.statSync(distApkPath);
  const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
  const lastModified = stats.mtime.toLocaleString();

  console.log('✅ APK copiada exitosamente a /dist:');
  console.log(`📂 Origen: ${androidApkPath}`);
  console.log(`📂 Destino: ${distApkPath}`);
  console.log(`📊 Tamaño: ${sizeInMB} MB`);
  console.log(`📅 Fecha: ${lastModified}`);

  console.log('\n🎉 APK lista para descargar (Vía Servidor)!');
  console.log('📱 /admin/download-apk');
  console.log('🌐 /apk/kdice-reservas.apk');
  console.log('\n⚠️ NOTA: Se ha dejado de copiar a /public para reducir el peso de la APK final.');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
