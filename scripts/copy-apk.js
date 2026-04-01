#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔄 Copiando APK generada a frontend...\n');

// Posibles rutas de APK (debug y release con diferentes nombres)
const possiblePaths = [
  // Debug con splits habilitado (universal es la recomendada para pruebas)
  path.join(__dirname, '../android/app/build/outputs/apk/debug/app-universal-debug.apk'),
  path.join(__dirname, '../android/app/build/outputs/apk/debug/app-arm64-v8a-debug.apk'),
  path.join(__dirname, '../android/app/build/outputs/apk/debug/app-debug.apk'),
  
  // Release con splits habilitado
  path.join(__dirname, '../android/app/build/outputs/apk/release/app-universal-release-unsigned.apk'),
  path.join(__dirname, '../android/app/build/outputs/apk/release/app-arm64-v8a-release-unsigned.apk'),
  path.join(__dirname, '../android/app/build/outputs/apk/release/app-release-unsigned.apk'),
];

const distApkPath = path.join(__dirname, '../dist/apk/kdice-reservas.apk');
const publicApkPath = path.join(__dirname, '../public/apk/kdice-reservas.apk');
const distApkDir = path.dirname(distApkPath);
const publicApkDir = path.dirname(publicApkPath);

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
  if (!fs.existsSync(distApkDir)) {
    fs.mkdirSync(distApkDir, { recursive: true });
  }
  if (!fs.existsSync(publicApkDir)) {
    fs.mkdirSync(publicApkDir, { recursive: true });
  }

  // Eliminar APKs viejas
  if (fs.existsSync(distApkPath)) fs.unlinkSync(distApkPath);
  if (fs.existsSync(publicApkPath)) fs.unlinkSync(publicApkPath);

  // Copiar a ambas ubicaciones
  fs.copyFileSync(androidApkPath, distApkPath);
  fs.copyFileSync(androidApkPath, publicApkPath);

  const stats = fs.statSync(distApkPath);
  const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
  const lastModified = stats.mtime.toLocaleString();

  console.log('✅ APK copiada exitosamente:');
  console.log(`📂 Origen: ${androidApkPath}`);
  console.log(`📂 Destino dist: ${distApkPath}`);
  console.log(`📂 Destino public: ${publicApkPath}`);
  console.log(`📊 Tamaño: ${sizeInMB} MB`);
  console.log(`📅 Fecha: ${lastModified}`);

  console.log('\n🎉 APK lista para descargar!');
  console.log('📱 /admin/download-apk');
  console.log('🌐 /apk/kdice-reservas.apk');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
