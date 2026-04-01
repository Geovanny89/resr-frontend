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

// Carpeta para Git (fuera de public para no inflar el build)
const staticApkPath = path.join(__dirname, '../public-static/apk/kdice-reservas.apk');
const distApkPath = path.join(__dirname, '../dist/apk/kdice-reservas.apk');

const staticApkDir = path.dirname(staticApkPath);
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

  // Crear carpetas de destino
  if (!fs.existsSync(staticApkDir)) {
    fs.mkdirSync(staticApkDir, { recursive: true });
  }
  if (!fs.existsSync(distApkDir)) {
    fs.mkdirSync(distApkDir, { recursive: true });
  }

  // Eliminar APKs viejas
  if (fs.existsSync(staticApkPath)) fs.unlinkSync(staticApkPath);
  if (fs.existsSync(distApkPath)) fs.unlinkSync(distApkPath);

  // Copiar a ambas ubicaciones
  fs.copyFileSync(androidApkPath, staticApkPath);
  fs.copyFileSync(androidApkPath, distApkPath);

  const stats = fs.statSync(staticApkPath);
  const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
  const lastModified = stats.mtime.toLocaleString();

  console.log('✅ APK copiada exitosamente:');
  console.log(`📂 Origen: ${androidApkPath}`);
  console.log(`📂 Destino Git: ${staticApkPath}`);
  console.log(`📂 Destino Dist: ${distApkPath}`);
  console.log(`📊 Tamaño: ${sizeInMB} MB`);
  console.log(`📅 Fecha: ${lastModified}`);

  console.log('\n🎉 APK lista para subir vía GIT!');
  console.log('📱 /admin/download-apk');
  console.log('🌐 /apk/kdice-reservas.apk');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
