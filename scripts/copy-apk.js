#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔄 Copiando APK generada a frontend...\n');

// Rutas posibles (priorizando Release sobre Debug)
const releaseApkPath = path.join(__dirname, '../android/app/build/outputs/apk/release/app-release-unsigned.apk');
const releaseApkPathSigned = path.join(__dirname, '../android/app/build/outputs/apk/release/app-release.apk');
const debugApkPath = path.join(__dirname, '../android/app/build/outputs/apk/debug/app-debug.apk');

let androidApkPath = null;
if (fs.existsSync(releaseApkPathSigned)) {
  androidApkPath = releaseApkPathSigned;
} else if (fs.existsSync(releaseApkPath)) {
  androidApkPath = releaseApkPath;
} else if (fs.existsSync(debugApkPath)) {
  androidApkPath = debugApkPath;
}

// Nueva ruta: fuera del frontend para evitar que se incluya en el build
const backendPublicPath = path.join(__dirname, '../../../backend/public/downloads/kdice-reservas.apk');
// También mantenemos una referencia por si acaso, pero el objetivo es sacarla de public/apk
const frontendApkPath = path.join(__dirname, '../public/apk/kdice-reservas.apk');

try {
  // Verificar si existe alguna APK
  if (!androidApkPath) {
    console.log('❌ No se encontró ninguna APK generada en Android Studio');
    console.log('📱 Asegúrate de generar la APK en Android Studio:');
    console.log('   1. Ve a Build > Build Bundle(s) / APK(s) > Build APK(s)');
    console.log('   2. Elige "Release" para que pese menos (8-10MB)');
    process.exit(1);
  }

  const isRelease = androidApkPath.includes('release');
  if (!isRelease) {
    console.log('⚠️  AVISO: Estás usando una APK de DEBUG. Pesa más (~25MB).');
    console.log('💡 Para bajar el peso a 8-10MB, genera la versión de RELEASE en Android Studio.');
  }

  // 1. Copiar a la carpeta de descargas del backend (Recomendado)
  const backendDir = path.dirname(backendPublicPath);
  if (!fs.existsSync(backendDir)) {
    fs.mkdirSync(backendDir, { recursive: true });
  }
  fs.copyFileSync(androidApkPath, backendPublicPath);
  console.log('✅ APK copiada al Backend:', backendPublicPath);

  // 2. Limpiar la carpeta public/apk del frontend para que no se meta en el build
  if (fs.existsSync(frontendApkPath)) {
    fs.unlinkSync(frontendApkPath);
    console.log('🗑️  APK antigua eliminada de frontend/public/apk para ahorrar peso.');
  }

  // Obtener información del archivo copiado al backend
  const stats = fs.statSync(backendPublicPath);
  const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
  const lastModified = stats.mtime.toLocaleString();

  console.log('✅ APK copiada exitosamente:');
  console.log(`📂 Origen: ${androidApkPath}`);
  console.log(`📂 Destino: ${frontendApkPath}`);
  console.log(`📊 Tamaño: ${sizeInMB} MB`);
  console.log(`📅 Fecha: ${lastModified}`);
  
  console.log('\n🎉 APK lista para descargar desde el panel de admin!');
  console.log('📱 Los usuarios pueden descargarla desde /admin/download-apk');
  console.log('🌐 También disponible públicamente en /apk/kdice-reservas.apk');

} catch (error) {
  console.error('❌ Error al copiar la APK:', error.message);
  process.exit(1);
}
